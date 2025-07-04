import { NextResponse } from 'next/server';
import { analyzeSentiment } from '@/ai/flows/analyze-sentiment';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { entryText } = await request.json();

    if (!entryText || typeof entryText !== 'string') {
      return NextResponse.json({ message: 'Invalid or missing entryText' }, { status: 400 });
    }

    // Call the Genkit AI flow for sentiment analysis
    const sentimentResult = await analyzeSentiment({ journalEntry: entryText });

    return NextResponse.json({ sentiment: sentimentResult }, { status: 200 });
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return NextResponse.json({ message: 'Error analyzing sentiment' }, { status: 500 });
  }
}