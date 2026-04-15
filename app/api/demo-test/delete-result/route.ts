import { NextResponse } from 'next/server';
import { deleteDemoTestResult } from '../../../../lib/data';

export async function POST(request: Request) {
  try {
    const { fileName } = await request.json();

    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json({ error: 'fileName required' }, { status: 400 });
    }

    const ok = await deleteDemoTestResult(fileName);
    if (ok) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
