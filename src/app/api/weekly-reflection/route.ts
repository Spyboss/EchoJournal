import { NextRequest, NextResponse } from 'next/server';
import { analyzeWeeklyReflection } from '@/ai/flows/analyze-weekly-reflection';
import { getJournalEntriesAdmin } from '@/lib/firestore-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Get the last 7 journal entries for the user (fresh data)
    const entries = await getJournalEntriesAdmin(userId);
    const last7Entries = entries.slice(0, 7);
    
    console.log(`Found ${entries.length} total entries, using last ${last7Entries.length} for reflection`);
    console.log('Entry timestamps:', last7Entries.map(e => e.timestamp));
    
    if (last7Entries.length === 0) {
      return NextResponse.json({ 
        message: 'No journal entries found. Write some entries first!' 
      }, { status: 400 });
    }

    // Combine entry texts
    const journalEntries = last7Entries.map(entry => entry.entryText).join('\n\n');

    // Call the Genkit AI flow for weekly reflection
    const reflectionResult = await analyzeWeeklyReflection({ journalEntries });

    return NextResponse.json({ reflection: reflectionResult }, { status: 200 });
  } catch (error) {
    console.error('Error generating weekly reflection:', error);
    return NextResponse.json({ message: 'Error generating weekly reflection' }, { status: 500 });
  }
}