import { addDoc, collection, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface JournalEntry {
  userId: string;
  entryText: string;
  timestamp: any; // Use any for serverTimestamp
  sentimentSummary?: string; // Optional field for sentiment analysis
}

/**
 * Adds a new journal entry to the 'entries' collection in Firestore.
 * @param userId The ID of the user.
 * @param entryText The text of the journal entry.
 * @returns A Promise that resolves with the DocumentReference of the newly created document.
 */
export const addJournalEntry = async (userId: string, entryText: string): Promise<any> => {
  try {
    const docRef = await addDoc(collection(db, 'entries'), {
      userId: userId,
      entryText: entryText,
      timestamp: serverTimestamp(),
    });
    console.log('Document written with ID: ', docRef.id);
    return docRef;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw e;
  }
};

/**
 * Retrieves all journal entries for a given user ID from the 'entries' collection.
 * @param userId The ID of the user.
 * @returns A Promise that resolves with an array of journal entries.
 */
export const getJournalEntries = async (userId: string): Promise<JournalEntry[]> => {
  try {
    const q = query(
      collection(db, 'entries'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc') // Order by timestamp descending
    );
    const querySnapshot = await getDocs(q);
    const entries: JournalEntry[] = [];
    querySnapshot.forEach((doc: any) => {
      entries.push({ id: doc.id, ...doc.data() } as any);
    });
    return entries;
  } catch (e) {
    console.error('Error fetching documents: ', e);
    throw e;
  }
};