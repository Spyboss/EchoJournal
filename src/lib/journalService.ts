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
    return apiEntries.map(entry => ({
      id: entry.id,
      text: entry.entryText,
      timestamp: entry.timestamp?.toDate ? entry.timestamp.toDate().toLocaleString() : new Date(entry.timestamp).toLocaleString(),
      sentimentSummary: entry.sentimentSummary,
    }));
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
}