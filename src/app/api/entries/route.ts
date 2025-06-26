import { NextRequest, NextResponse } from 'next/server';
import { addJournalEntryAdmin, getJournalEntriesAdmin, deleteJournalEntryAdmin } from '@/lib/firestore-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { userId, entryText } = await request.json();

    if (!userId || !entryText) {
      return NextResponse.json({ error: 'Missing userId or entryText' }, { status: 400 });
    }

    await addJournalEntryAdmin(userId, entryText);

    return NextResponse.json({ message: 'Journal entry added successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error adding journal entry:', error);
    return NextResponse.json({ error: 'Failed to add journal entry' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId query parameter' }, { status: 400 });
    }

    const entries = await getJournalEntriesAdmin(userId);
    return NextResponse.json(entries, { status: 200 });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('id');
    const userId = searchParams.get('userId');
    
    if (!userId || !entryId) {
      return NextResponse.json({ error: 'Missing userId or entryId' }, { status: 400 });
    }

    await deleteJournalEntryAdmin(entryId, userId);
    
    return NextResponse.json({ message: 'Entry deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json({ message: 'Error deleting entry' }, { status: 500 });
  }
}