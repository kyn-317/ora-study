import { NextResponse } from 'next/server';
import { getStudyData } from '../../../../../lib/data';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ chapterId: string; studyId: string }> }
) {
  const { chapterId, studyId } = await params;
  const data = await getStudyData(chapterId, studyId);

  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // 클라이언트에 필요한 필드만 반환 (sql_examples, keywords 제외)
  return NextResponse.json({
    id: data.id,
    title: data.title,
    chapter: data.chapter,
    description: data.description,
    sections: data.sections,
  });
}
