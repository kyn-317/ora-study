import { NextResponse } from 'next/server';
import { getAllCustomQuestionsForChapter } from '../../../../lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chapter = searchParams.get('chapter');

  if (!chapter) {
    return NextResponse.json({ error: 'chapter parameter required' }, { status: 400 });
  }

  const questions = await getAllCustomQuestionsForChapter(chapter);
  return NextResponse.json(questions);
}
