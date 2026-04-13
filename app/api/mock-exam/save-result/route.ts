import { NextResponse } from 'next/server';
import { saveExamResult, refreshExamSummary } from '../../../../lib/data';
import type { ExamResult } from '../../../../lib/data';

export async function POST(request: Request) {
  try {
    const body: ExamResult = await request.json();

    // Basic validation
    if (!body.examSet || !body.answers || !Array.isArray(body.answers)) {
      return NextResponse.json({ error: 'Invalid result data' }, { status: 400 });
    }

    const fileName = await saveExamResult(body);
    await refreshExamSummary();
    return NextResponse.json({ success: true, fileName });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save result' },
      { status: 500 },
    );
  }
}
