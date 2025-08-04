import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key';
};

// Database types for TypeScript
export interface JournalEntry {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  sentiment_score?: number;
  sentiment_summary?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

// Database operations
export const journalOperations = {
  // Get all journal entries for the current user
  async getEntries(userId: string): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Add a new journal entry
  async addEntry(entry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>): Promise<JournalEntry> {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([entry])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update a journal entry
  async updateEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
    const { data, error } = await supabase
      .from('journal_entries')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete a journal entry
  async deleteEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Profile operations
export const profileOperations = {
  // Get user profile
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  },

  // Create or update user profile
  async upsertProfile(profile: Omit<Profile, 'created_at' | 'updated_at'>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert([{ ...profile, updated_at: new Date().toISOString() }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};