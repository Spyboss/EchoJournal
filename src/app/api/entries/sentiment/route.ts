import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  try {
    const { userId, entryText, sentimentSummary } = await request.json();

    if (!userId || !entryText || !sentimentSummary) {
      return NextResponse.json({ error: 'Missing userId, entryText, or sentimentSummary' }, { status: 400 });
    }

    // Find the most recent entry for this user with matching text
    const snapshot = await adminDb
      .collection('entries')
      .where('userId', '==', userId)
      .where('entryText', '==', entryText)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const entryDoc = snapshot.docs[0];
    await entryDoc.ref.update({
      sentimentSummary: sentimentSummary
    });

    return NextResponse.json({ message: 'Sentiment updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating sentiment:', error);
    return NextResponse.json({ error: 'Failed to update sentiment' }, { status: 500 });
  }
}