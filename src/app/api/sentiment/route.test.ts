import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { POST } from './route';
import { analyzeSentiment } from '@/ai/flows/analyze-sentiment'; // Assuming this path

// Mock the analyzeSentiment Genkit flow
jest.mock('@/ai/flows/analyze-sentiment', () => ({
  analyzeSentiment: jest.fn(),
}));

const mockedAnalyzeSentiment = analyzeSentiment as jest.MockedFunction<typeof analyzeSentiment>;

describe('/api/sentiment POST', () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAnalyzeSentiment.mockClear();
  });

  it('should return 400 if entryText is missing', async () => {
    const mockRequest = {
      json: async () => ({}),
    } as Request;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Invalid or missing entryText');
    expect(mockedAnalyzeSentiment).not.toHaveBeenCalled();
  });

  it('should call analyzeSentiment and return the result', async () => {
    const mockEntryText = 'This is a test entry.';
    const mockSentimentResult = {
      sentiment: 'Positive',
      score: 0.9,
      summary: 'The entry expresses positive sentiment.',
    };

    // Mock the analyzeSentiment function to return a resolved promise with the mock result
    mockedAnalyzeSentiment.mockResolvedValue(mockSentimentResult);

    const mockRequest = {
      json: async () => ({ entryText: mockEntryText }),
    } as Request;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockedAnalyzeSentiment).toHaveBeenCalledWith({ journalEntry: mockEntryText });
    expect(data).toEqual({ sentiment: mockSentimentResult });
  });

  it('should return 500 if analyzeSentiment throws an error', async () => {
    const mockEntryText = 'This entry will cause an error.';
    const mockError = new Error('Genkit flow error');

    // Mock the analyzeSentiment function to throw an error
    mockedAnalyzeSentiment.mockRejectedValue(mockError);

    const mockRequest = {
      json: async () => ({ entryText: mockEntryText }),
    } as Request;

    // Spy on console.error to prevent it from logging during tests if desired
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe('Error analyzing sentiment');
    expect(mockedAnalyzeSentiment).toHaveBeenCalledWith({ journalEntry: mockEntryText });
    // Check if the error was logged (optional)
    // expect(consoleErrorSpy).toHaveBeenCalledWith('Error analyzing sentiment:', mockError);

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});