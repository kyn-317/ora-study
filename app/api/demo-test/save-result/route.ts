import { NextResponse } from 'next/server';
import { saveDemoTestResult } from '../../../../lib/data';
import type { DemoTestResult } from '../../../../lib/data';

export async function POST(request: Request) {
  try {
    const body: DemoTestResult = await request.json();

    if (!body.answers || !Array.isArray(body.answers) || !body.chapters) {
      return NextResponse.json({ error: 'Invalid result data' }, { status: 400 });
    }

    const fileName = await saveDemoTestResult(body);
    return NextResponse.json({ success: true, fileName });
  } catch {
    return NextResponse.json({ error: 'Failed to save result' }, { status: 500 });
  }
}
