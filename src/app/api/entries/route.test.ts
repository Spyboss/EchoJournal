import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { POST, GET } from './route';
import { addJournalEntry, getJournalEntries } from '@/lib/firestore';
import { NextResponse } from 'next/server';

// Mock the firestore functions
jest.mock('@/lib/firestore', () => ({
  addJournalEntry: jest.fn(),
  getJournalEntries: jest.fn(),
}));

const mockedAddJournalEntry = addJournalEntry as jest.MockedFunction<typeof addJournalEntry>;
const mockedGetJournalEntries = getJournalEntries as jest.MockedFunction<typeof getJournalEntries>;

describe('/api/entries', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    mockedAddJournalEntry.mockClear();
    mockedGetJournalEntries.mockClear();
  });

  describe('POST', () => {
    it('should add a journal entry and return success', async () => {
      const mockRequest = {
        json: async () => ({ userId: 'test-user', entryText: 'Test entry' }),
      } as any;

      mockedAddJournalEntry.mockResolvedValue(undefined);

      const response = await POST(mockRequest);
      const jsonResponse = await response.json();

      expect(response.status).toBe(201);
      expect(jsonResponse.message).toBe('Journal entry added successfully');
      expect(mockedAddJournalEntry).toHaveBeenCalledWith('test-user', 'Test entry');
    });

    it('should return 400 if userId is missing', async () => {
      const mockRequest = {
        json: async () => ({ entryText: 'Test entry' }),
      } as any;

      const response = await POST(mockRequest);
      const jsonResponse = await response.json();

      expect(response.status).toBe(400);
      expect(jsonResponse.error).toBe('Missing userId or entryText');
      expect(mockedAddJournalEntry).not.toHaveBeenCalled();
    });

    it('should return 400 if entryText is missing', async () => {
      const mockRequest = {
        json: async () => ({ userId: 'test-user' }),
      } as any;

      const response = await POST(mockRequest);
      const jsonResponse = await response.json();

      expect(response.status).toBe(400);
      expect(jsonResponse.error).toBe('Missing userId or entryText');
      expect(mockedAddJournalEntry).not.toHaveBeenCalled();
    });

    it('should return 500 if adding entry fails', async () => {
      const mockRequest = {
        json: async () => ({ userId: 'test-user', entryText: 'Test entry' }),
      } as any;

      mockedAddJournalEntry.mockRejectedValue(new Error('Firestore error'));

      const response = await POST(mockRequest);
      const jsonResponse = await response.json();

      expect(response.status).toBe(500);
      expect(jsonResponse.error).toBe('Failed to add journal entry');
      expect(mockedAddJournalEntry).toHaveBeenCalledWith('test-user', 'Test entry');
    });
  });

  describe('GET', () => {
    it('should retrieve journal entries for a user and return success', async () => {
      const mockRequest = {
        url: 'http://localhost:3000/api/entries?userId=test-user',
      } as Request;

      const mockEntries = [
        { id: '1', userId: 'test-user', entryText: 'Entry 1', timestamp: '...' },
        { id: '2', userId: 'test-user', entryText: 'Entry 2', timestamp: '...' },
      ];
      mockedGetJournalEntries.mockResolvedValue(mockEntries);

      const response = await GET(mockRequest);
      const jsonResponse = await response.json();

      expect(response.status).toBe(200);
      expect(jsonResponse).toEqual(mockEntries);
      expect(mockedGetJournalEntries).toHaveBeenCalledWith('test-user');
    });

    it('should return 400 if userId is missing', async () => {
      const mockRequest = {
        url: 'http://localhost:3000/api/entries',
      } as Request;

      const response = await GET(mockRequest);
      const jsonResponse = await response.json();

      expect(response.status).toBe(400);
      expect(jsonResponse.error).toBe('Missing userId query parameter');
      expect(mockedGetJournalEntries).not.toHaveBeenCalled();
    });

    it('should return 500 if retrieving entries fails', async () => {
      const mockRequest = {
        url: 'http://localhost:3000/api/entries?userId=test-user',
      } as Request;

      mockedGetJournalEntries.mockRejectedValue(new Error('Firestore error'));

      const response = await GET(mockRequest);
      const jsonResponse = await response.json();

      expect(response.status).toBe(500);
      expect(jsonResponse.error).toBe('Failed to fetch journal entries');
      expect(mockedGetJournalEntries).toHaveBeenCalledWith('test-user');
    });
  });
});