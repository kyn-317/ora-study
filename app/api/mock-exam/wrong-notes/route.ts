import { NextResponse } from 'next/server';
import { getWrongNotes, saveWrongNote } from '../../../../lib/data';

export async function GET() {
  try {
    const data = await getWrongNotes();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load notes' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { questionId, memo } = body;

    if (typeof questionId !== 'string' || typeof memo !== 'string') {
      return NextResponse.json({ error: 'Invalid data: questionId and memo required' }, { status: 400 });
    }

    await saveWrongNote(questionId, memo);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save note' },
      { status: 500 },
    );
  }
}
