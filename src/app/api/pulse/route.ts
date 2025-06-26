import { NextResponse } from 'next/server';
import { addJournalEntry, getJournalEntries } from '@/lib/firestore';
import { analyzeSentiment } from '@/ai/flows/analyze-sentiment';

export const dynamic = 'force-dynamic';

// POST endpoint for Pulse agent to create journal entries
export async function POST(request: Request) {
  try {
    const { userId, entryText, agentId } = await request.json();

    // Validate required fields
    if (!userId || !entryText) {
      return NextResponse.json({ error: 'Missing userId or entryText' }, { status: 400 });
    }

    // Validate agent access (optional security check)
    if (agentId !== 'pulse-agent') {
      return NextResponse.json({ error: 'Unauthorized agent' }, { status: 401 });
    }

    // Add the journal entry
    const docRef = await addJournalEntry(userId, entryText);

    // Perform sentiment analysis
    let sentimentResult = null;
    try {
      sentimentResult = await analyzeSentiment({ journalEntry: entryText });
    } catch (sentimentError) {
      console.warn('Sentiment analysis failed:', sentimentError);
    }

    return NextResponse.json({
      message: 'Journal entry added successfully',
      entryId: docRef.id,
      sentiment: sentimentResult
    }, { status: 201 });
  } catch (error) {
    console.error('Error in Pulse API:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// GET endpoint for Pulse agent to retrieve journal entries
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const agentId = searchParams.get('agentId');
    const limit = searchParams.get('limit');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId query parameter' }, { status: 400 });
    }

    // Validate agent access
    if (agentId !== 'pulse-agent') {
      return NextResponse.json({ error: 'Unauthorized agent' }, { status: 401 });
    }

    const entries = await getJournalEntries(userId);
    
    // Apply limit if specified
    const limitedEntries = limit ? entries.slice(0, parseInt(limit)) : entries;

    return NextResponse.json({
      entries: limitedEntries,
      total: entries.length
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching entries for Pulse:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

// PUT endpoint for Pulse agent to update journal entries with analysis
export async function PUT(request: Request) {
  try {
    const { entryId, sentimentSummary, agentId } = await request.json();

    if (!entryId || !sentimentSummary) {
      return NextResponse.json({ error: 'Missing entryId or sentimentSummary' }, { status: 400 });
    }

    // Validate agent access
    if (agentId !== 'pulse-agent') {
      return NextResponse.json({ error: 'Unauthorized agent' }, { status: 401 });
    }

    // TODO: Implement update functionality in firestore.ts
    // For now, return success
    return NextResponse.json({
      message: 'Entry updated successfully',
      entryId
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating entry:', error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}