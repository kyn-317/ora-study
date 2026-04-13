import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { refreshExamSummary } from '../../../../lib/data';
import type { ExamResult } from '../../../../lib/data';

const EXAM_RESULTS_DIR = path.join(process.cwd(), 'data', 'exam-results');

function isValidExamResult(obj: unknown): obj is ExamResult {
  if (!obj || typeof obj !== 'object') return false;
  const r = obj as Record<string, unknown>;
  return (
    typeof r.examSet === 'number' &&
    typeof r.startedAt === 'string' &&
    typeof r.completedAt === 'string' &&
    typeof r.score === 'number' &&
    typeof r.totalQuestions === 'number' &&
    Array.isArray(r.answers)
  );
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    await fs.mkdir(EXAM_RESULTS_DIR, { recursive: true });

    const uploaded: string[] = [];
    const skipped: string[] = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      if (!file.name.endsWith('.json')) {
        skipped.push(`${file.name}: not a JSON file`);
        continue;
      }

      const text = await file.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        skipped.push(`${file.name}: invalid JSON`);
        continue;
      }

      if (!isValidExamResult(parsed)) {
        skipped.push(`${file.name}: not a valid exam result`);
        continue;
      }

      // Derive filename from result data to ensure consistency
      const timestamp = parsed.completedAt.replace(/[-:T]/g, '').slice(0, 14);
      const fileName = `exam_set_${parsed.examSet}_${timestamp}.json`;
      const filePath = path.join(EXAM_RESULTS_DIR, fileName);

      // Check for duplicate
      try {
        await fs.access(filePath);
        skipped.push(`${file.name}: already exists (${fileName})`);
        continue;
      } catch {
        // File doesn't exist — good to write
      }

      await fs.writeFile(filePath, JSON.stringify(parsed, null, 2), 'utf-8');
      uploaded.push(fileName);
    }

    if (uploaded.length > 0) {
      await refreshExamSummary();
    }

    return NextResponse.json({ success: true, uploaded, skipped });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 },
    );
  }
}
