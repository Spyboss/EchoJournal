import { auth } from '@/lib/firebase';
import { addJournalEntry, getJournalEntries as getFirestoreEntries } from '@/lib/firestore';

export const saveJournalEntry = async (entryText: string) => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    console.error("User not authenticated.");
    return;
  }

  const newEntry = {
    userId,
    entryText,
    timestamp: new Date(), // Firestore uses Timestamp objects
  };

  try {
    await addJournalEntry(newEntry);
  } catch (error) {
    console.error("Error saving journal entry:", error);
    throw error; // Re-throw to be handled by the calling component
  }
};

export const getJournalEntries = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    console.error("User not authenticated.");
    return [];
  }

  try {
    const entries = await getFirestoreEntries(userId);
    return entries;
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    throw error; // Re-throw to be handled by the calling component
  }
};

// The clearJournalEntries function can be removed if not needed with Firestore
// export const clearJournalEntries = () => {
//   // Logic to clear entries for a user in Firestore if needed
// };