import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import { PassThrough } from 'stream';

const EXAM_RESULTS_DIR = path.join(process.cwd(), 'data', 'exam-results');

export async function GET() {
  try {
    const files = await fs.readdir(EXAM_RESULTS_DIR);
    const jsonFiles = files.filter(
      (f) => f.startsWith('exam_set_') && f.endsWith('.json'),
    );

    if (jsonFiles.length === 0) {
      return NextResponse.json(
        { error: 'No exam results to download' },
        { status: 404 },
      );
    }

    const passthrough = new PassThrough();
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(passthrough);

    for (const file of jsonFiles) {
      const filePath = path.join(EXAM_RESULTS_DIR, file);
      const content = await fs.readFile(filePath);
      archive.append(content, { name: file });
    }

    await archive.finalize();

    // Collect stream into buffer
    const chunks: Buffer[] = [];
    for await (const chunk of passthrough) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="exam-results_${date}.zip"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create zip' },
      { status: 500 },
    );
  }
}
