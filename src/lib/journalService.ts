import { journalOperations, JournalEntry as SupabaseJournalEntry } from './supabase';

interface JournalEntry {
  id: string;
  text: string;
  timestamp: string;
  sentimentSummary?: string;
}

export class JournalService {
  static async createEntry(userId: string, entryText: string): Promise<void> {
    try {
      // For now, we'll create entries without sentiment analysis
      // You can add sentiment analysis later via a separate API call
      await journalOperations.addEntry({
        user_id: userId,
        content: entryText,
        title: entryText.substring(0, 50) + (entryText.length > 50 ? '...' : ''), // Auto-generate title
      });
    } catch (error) {
      console.error('Error creating entry:', error);
      throw new Error('Failed to create entry');
    }
  }

  static async getEntries(userId: string): Promise<JournalEntry[]> {
    try {
      const entries = await journalOperations.getEntries(userId);
      
      // Transform Supabase entries to match frontend interface
      return entries.map(entry => {
        let formattedTimestamp = 'Invalid Date';
        
        try {
          if (entry.created_at) {
            const date = new Date(entry.created_at);
            if (!isNaN(date.getTime())) {
              formattedTimestamp = date.toLocaleString();
            }
          }
        } catch (error) {
          console.error('Error formatting timestamp:', error);
          formattedTimestamp = 'Invalid Date';
        }
        
        return {
          id: entry.id,
          text: entry.content,
          timestamp: formattedTimestamp,
          sentimentSummary: entry.sentiment_summary,
        };
      });
    } catch (error) {
      console.error('Error fetching entries:', error);
      throw new Error('Failed to fetch entries');
    }
  }

  static async analyzeSentiment(entryText: string): Promise<{ sentiment: string; summary: string }> {
    // For static export, we'll need to call an external API or disable this feature
    // This is a placeholder that you can implement with your preferred sentiment analysis service
    try {
      const response = await fetch('/api/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entryText }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze sentiment');
      }

      const result = await response.json();
      return result.sentiment;
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      // Return a default response if sentiment analysis fails
      return {
        sentiment: 'neutral',
        summary: 'Sentiment analysis unavailable'
      };
    }
  }

  static async deleteEntry(entryId: string, userId: string): Promise<void> {
    try {
      await journalOperations.deleteEntry(entryId);
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw new Error('Failed to delete entry');
    }
  }

  static async updateEntry(entryId: string, updates: { content?: string; sentiment_summary?: string }): Promise<void> {
    try {
      await journalOperations.updateEntry(entryId, {
        content: updates.content,
        sentiment_summary: updates.sentiment_summary,
        title: updates.content ? updates.content.substring(0, 50) + (updates.content.length > 50 ? '...' : '') : undefined
      });
    } catch (error) {
      console.error('Error updating entry:', error);
      throw new Error('Failed to update entry');
    }
  }
}