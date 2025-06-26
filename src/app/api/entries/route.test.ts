import { POST, GET } from './route';
import { addJournalEntry, getJournalEntries } from '@/lib/firestore';
import { NextResponse } from 'next/server';

// Mock the firestore functions
jest.mock('@/lib/firestore', () => ({
  addJournalEntry: jest.fn(),
  getJournalEntries: jest.fn(),
}));

describe('/api/entries', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should add a journal entry and return success', async () => {
      const mockRequest = {
        json: async () => ({ userId: 'test-user', entryText: 'Test entry' }),
      } as any;

      (addJournalEntry as jest.Mock).mockResolvedValue(undefined);

      const response = await POST(mockRequest);
      const jsonResponse = await response.json();

      expect(response.status).toBe(201);
      expect(jsonResponse.message).toBe('Journal entry added successfully');
      expect(addJournalEntry).toHaveBeenCalledWith('test-user', 'Test entry');
    });

    it('should return 400 if userId is missing', async () => {
      const mockRequest = {
        json: async () => ({ entryText: 'Test entry' }),
      } as any;

      const response = await POST(mockRequest);
      const jsonResponse = await response.json();

      expect(response.status).toBe(400);
      expect(jsonResponse.message).toBe('Missing userId or entryText');
      expect(addJournalEntry).not.toHaveBeenCalled();
    });

    it('should return 400 if entryText is missing', async () => {
      const mockRequest = {
        json: async () => ({ userId: 'test-user' }),
      } as any;

      const response = await POST(mockRequest);
      const jsonResponse = await response.json();

      expect(response.status).toBe(400);
      expect(jsonResponse.message).toBe('Missing userId or entryText');
      expect(addJournalEntry).not.toHaveBeenCalled();
    });

    it('should return 500 if adding entry fails', async () => {
      const mockRequest = {
        json: async () => ({ userId: 'test-user', entryText: 'Test entry' }),
      } as any;

      (addJournalEntry as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      const response = await POST(mockRequest);
      const jsonResponse = await response.json();

      expect(response.status).toBe(500);
      expect(jsonResponse.message).toBe('Error adding journal entry');
      expect(addJournalEntry).toHaveBeenCalledWith('test-user', 'Test entry');
    });
  });

  describe('GET', () => {
    it('should retrieve journal entries for a user and return success', async () => {
      const mockRequest = {
        nextUrl: {
          searchParams: new URLSearchParams('userId=test-user'),
        },
      } as any;

      const mockEntries = [
        { id: '1', userId: 'test-user', entryText: 'Entry 1', timestamp: '...' },
        { id: '2', userId: 'test-user', entryText: 'Entry 2', timestamp: '...' },
      ];
      (getJournalEntries as jest.Mock).mockResolvedValue(mockEntries);

      const response = await GET(mockRequest);
      const jsonResponse = await response.json();

      expect(response.status).toBe(200);
      expect(jsonResponse.entries).toEqual(mockEntries);
      expect(getJournalEntries).toHaveBeenCalledWith('test-user');
    });

    it('should return 400 if userId is missing', async () => {
      const mockRequest = {
        nextUrl: {
          searchParams: new URLSearchParams(),
        },
      } as any;

      const response = await GET(mockRequest);
      const jsonResponse = await response.json();

      expect(response.status).toBe(400);
      expect(jsonResponse.message).toBe('Missing userId query parameter');
      expect(getJournalEntries).not.toHaveBeenCalled();
    });

    it('should return 500 if retrieving entries fails', async () => {
      const mockRequest = {
        nextUrl: {
          searchParams: new URLSearchParams('userId=test-user'),
        },
      } as any;

      (getJournalEntries as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      const response = await GET(mockRequest);
      const jsonResponse = await response.json();

      expect(response.status).toBe(500);
      expect(jsonResponse.message).toBe('Error retrieving journal entries');
      expect(getJournalEntries).toHaveBeenCalledWith('test-user');
    });
  });
});