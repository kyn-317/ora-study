import { NextResponse } from 'next/server';
import { getKeywordStudyEntry } from '../../../../../lib/data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chapterId: string; studyId: string }> }
) {
  const { chapterId, studyId } = await params;
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');

  if (!keyword) {
    return NextResponse.json({ error: 'keyword query param required' }, { status: 400 });
  }

  const entry = await getKeywordStudyEntry(chapterId, studyId, keyword);

  if (!entry) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(entry);
}
