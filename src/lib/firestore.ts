import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

interface JournalEntry {
  userId: string;
  entryText: string;
  timestamp: any; // Use any for serverTimestamp
  sentimentSummary?: string; // Optional field for sentiment analysis
}

/**
 * Adds a new journal entry to Firestore
 * @param userId - The user's unique identifier
 * @param entryText - The journal entry text
 * @returns Promise that resolves to the document reference
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
 * Retrieves journal entries for a specific user from Firestore
 * @param userId - The user's unique identifier
 * @returns Promise that resolves to an array of journal entries
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