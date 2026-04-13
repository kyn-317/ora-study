import { NextResponse } from 'next/server';
import { refreshExamSummary } from '../../../../lib/data';

export async function POST() {
  try {
    await refreshExamSummary();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
