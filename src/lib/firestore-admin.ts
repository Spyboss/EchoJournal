import { adminDb } from './firebase-admin';
import { FieldValue, QueryDocumentSnapshot } from 'firebase-admin/firestore';

interface JournalEntry {
  id?: string;
  userId: string;
  entryText: string;
  timestamp: any;
  sentimentSummary?: string;
}

/**
 * Adds a new journal entry to Firestore using Admin SDK
 * @param userId - The user's unique identifier
 * @param entryText - The journal entry text
 * @returns Promise that resolves to the document reference
 */
export const addJournalEntryAdmin = async (userId: string, entryText: string): Promise<any> => {
  try {
    const docRef = await adminDb.collection('entries').add({
      userId: userId,
      entryText: entryText,
      timestamp: FieldValue.serverTimestamp(),
    });
    console.log('Document written with ID: ', docRef.id);
    return docRef;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw e;
  }
};

/**
 * Retrieves journal entries for a specific user from Firestore using Admin SDK
 * @param userId - The user's unique identifier
 * @returns Promise that resolves to an array of journal entries
 */
export const getJournalEntriesAdmin = async (userId: string): Promise<JournalEntry[]> => {
  try {
    const snapshot = await adminDb
      .collection('entries')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .get();
    
    const entries: JournalEntry[] = [];
    snapshot.forEach((doc: QueryDocumentSnapshot) => {
      entries.push({ id: doc.id, ...doc.data() } as JournalEntry);
    });
    
    return entries;
  } catch (e) {
    console.error('Error fetching documents: ', e);
    throw e;
  }
};