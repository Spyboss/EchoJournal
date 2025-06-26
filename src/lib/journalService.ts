interface JournalEntry {
  id: string;
  text: string;
  timestamp: string;
  sentimentSummary?: string;
}

interface ApiJournalEntry {
  id: string;
  userId: string;
  entryText: string;
  timestamp: any;
  sentimentSummary?: string;
}

export class JournalService {
  private static baseUrl = '/api';

  static async createEntry(userId: string, entryText: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, entryText }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create entry');
    }
  }

  static async getEntries(userId: string): Promise<JournalEntry[]> {
    const response = await fetch(`${this.baseUrl}/entries?userId=${encodeURIComponent(userId)}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch entries');
    }

    const apiEntries: ApiJournalEntry[] = await response.json();
    
    // Transform API response to match frontend interface
    return apiEntries.map(entry => {
      let formattedTimestamp = 'Invalid Date';
      
      try {
        if (entry.timestamp) {
          // Handle Firestore Timestamp objects
          if (entry.timestamp.toDate && typeof entry.timestamp.toDate === 'function') {
            formattedTimestamp = entry.timestamp.toDate().toLocaleString();
          }
          // Handle timestamp objects with seconds and nanoseconds
          else if (entry.timestamp._seconds || entry.timestamp.seconds) {
            const seconds = entry.timestamp._seconds || entry.timestamp.seconds;
            const date = new Date(seconds * 1000);
            formattedTimestamp = date.toLocaleString();
          }
          // Handle regular date strings or numbers
          else {
            const date = new Date(entry.timestamp);
            if (!isNaN(date.getTime())) {
              formattedTimestamp = date.toLocaleString();
            }
          }
        }
      } catch (error) {
        console.error('Error formatting timestamp:', error);
        formattedTimestamp = 'Invalid Date';
      }
      
      return {
        id: entry.id,
        text: entry.entryText,
        timestamp: formattedTimestamp,
        sentimentSummary: entry.sentimentSummary,
      };
    });
  }

  static async analyzeSentiment(entryText: string): Promise<{ sentiment: string; summary: string }> {
    const response = await fetch(`${this.baseUrl}/sentiment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entryText }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to analyze sentiment');
    }

    const result = await response.json();
    return result.sentiment;
  }

  static async deleteEntry(entryId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/entries?id=${encodeURIComponent(entryId)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete entry');
    }
  }
}