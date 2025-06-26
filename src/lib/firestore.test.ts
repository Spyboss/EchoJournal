import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

// Mock the firebase/firestore module
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  collection: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

// Mock the db instance
const mockDb = {}; // You might need to mock more of the db object if your functions use other properties/methods
jest.mock('@/lib/firebase', () => ({
  db: mockDb,
}));

import { addJournalEntry, getJournalEntries } from '@/lib/firestore';

const mockCollection = collection as jest.Mock;
const mockAddDoc = addDoc as jest.Mock;
const mockQuery = query as jest.Mock;
const mockWhere = where as jest.Mock;
const mockGetDocs = getDocs as jest.Mock;

describe('Firestore Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('addJournalEntry', () => {
    it('should call addDoc with the correct parameters', async () => {
      const userId = 'testUserId';
      const entryText = 'This is a test entry.';

      // Mock the collection function to return a mock collection reference
      const mockCollectionRef = {};
      mockCollection.mockReturnValue(mockCollectionRef);

      // Mock addDoc to resolve immediately
      mockAddDoc.mockResolvedValue({});

      await addJournalEntry(userId, entryText);

      // Expect collection to be called with the db instance and collection name
      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'entries');

      // Expect addDoc to be called with the collection reference and entry data
      expect(mockAddDoc).toHaveBeenCalledWith(mockCollectionRef, expect.objectContaining({
        userId: userId,
        entryText: entryText,
        timestamp: expect.any(String), // Check that timestamp is a string
      }));
    });

    it('should throw an error if addDoc fails', async () => {
      const userId = 'testUserId';
      const entryText = 'This is a test entry.';
      const mockError = new Error('Firestore add failed');

      // Mock the collection function
      const mockCollectionRef = {};
      mockCollection.mockReturnValue(mockCollectionRef);

      // Mock addDoc to reject with an error
      mockAddDoc.mockRejectedValue(mockError);

      await expect(addJournalEntry(userId, entryText)).rejects.toThrow('Error adding journal entry: Firestore add failed');
    });
  });

  describe('getJournalEntries', () => {
    it('should call getDocs with the correct query for a user', async () => {
      const userId = 'testUserId';
      const mockEntries = [
        { id: '1', data: () => ({ userId, entryText: 'Entry 1', timestamp: '...' }) },
        { id: '2', data: () => ({ userId, entryText: 'Entry 2', timestamp: '...' }) },
      ];
      const mockSnapshot = {
        docs: mockEntries,
      };

      // Mock the collection function
      const mockCollectionRef = {};
      mockCollection.mockReturnValue(mockCollectionRef);

      // Mock query and where
      const mockQueryRef = {};
      mockQuery.mockReturnValue(mockQueryRef);
      mockWhere.mockReturnValue({}); // where returns a constraint, which is then used in query

      // Mock getDocs to resolve with a mock snapshot
      mockGetDocs.mockResolvedValue(mockSnapshot);

      await getJournalEntries(userId);

      // Expect collection to be called with the db instance and collection name
      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'entries');

      // Expect where to be called with the correct field and value
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', userId);

      // Expect query to be called with the collection reference and the result of where
      expect(mockQuery).toHaveBeenCalledWith(mockCollectionRef, expect.anything()); // Check that it's called with the collection ref and some constraints

      // Expect getDocs to be called with the query reference
      expect(mockGetDocs).toHaveBeenCalledWith(mockQueryRef);
    });

    it('should return an empty array if no entries are found', async () => {
      const userId = 'testUserId';
      const mockSnapshot = {
        docs: [],
      };

      // Mock dependencies to return no documents
      const mockCollectionRef = {};
      mockCollection.mockReturnValue(mockCollectionRef);
      const mockQueryRef = {};
      mockQuery.mockReturnValue(mockQueryRef);
      mockWhere.mockReturnValue({});
      mockGetDocs.mockResolvedValue(mockSnapshot);

      const entries = await getJournalEntries(userId);

      expect(entries).toEqual([]);
    });

    it('should return an array of formatted entries', async () => {
      const userId = 'testUserId';
      const mockEntries = [
        { id: '1', data: () => ({ userId, entryText: 'Entry 1', timestamp: '2023-10-27T10:00:00.000Z', sentimentSummary: 'Positive' }) },
        { id: '2', data: () => ({ userId, entryText: 'Entry 2', timestamp: '2023-10-27T11:00:00.000Z', sentimentSummary: 'Neutral' }) },
      ];
      const mockSnapshot = {
        docs: mockEntries,
      };

      // Mock dependencies
      const mockCollectionRef = {};
      mockCollection.mockReturnValue(mockCollectionRef);
      const mockQueryRef = {};
      mockQuery.mockReturnValue(mockQueryRef);
      mockWhere.mockReturnValue({});
      mockGetDocs.mockResolvedValue(mockSnapshot);

      const entries = await getJournalEntries(userId);

      expect(entries).toEqual([
        { id: '1', userId, entryText: 'Entry 1', timestamp: '2023-10-27T10:00:00.000Z', sentimentSummary: 'Positive' },
        { id: '2', userId, entryText: 'Entry 2', timestamp: '2023-10-27T11:00:00.000Z', sentimentSummary: 'Neutral' },
      ]);
    });

    it('should throw an error if getDocs fails', async () => {
      const userId = 'testUserId';
      const mockError = new Error('Firestore get failed');

      // Mock dependencies to reject with an error
      const mockCollectionRef = {};
      mockCollection.mockReturnValue(mockCollectionRef);
      const mockQueryRef = {};
      mockQuery.mockReturnValue(mockQueryRef);
      mockWhere.mockReturnValue({});
      mockGetDocs.mockRejectedValue(mockError);

      await expect(getJournalEntries(userId)).rejects.toThrow('Error fetching journal entries: Firestore get failed');
    });
  });
});