import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import manifest from '@/data/manifest.json';

interface SearchResult {
  chapterId: string;
  studyId: string;
  title: string;
  chapter: string;
  sectionTitle: string | null;
  matchType: 'title' | 'keyword' | 'content' | 'sql';
  snippet: string;
}

function extractSnippet(text: string, query: string, radius = 60): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, radius * 2);
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + query.length + radius);
  let snippet = '';
  if (start > 0) snippet += '...';
  snippet += text.slice(start, end);
  if (end < text.length) snippet += '...';
  return snippet;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/[#*`_~\[\]()>|]/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface Section {
  sectionId?: string;
  title: string;
  content: string;
  subsections?: Section[];
  sqlExamplesIds?: string[];
}

interface SqlExample {
  sqlExamplesId: string;
  title: string;
  sql: string;
  description: string;
}

interface StudyFile {
  id: string;
  title: string;
  chapter: string;
  description: string;
  keywords?: string[];
  sections: Section[];
  sql_examples?: SqlExample[];
}

function searchSections(
  sections: Section[],
  query: string,
  studyMeta: { chapterId: string; studyId: string; title: string; chapter: string },
  sqlExamples: SqlExample[],
  results: SearchResult[],
) {
  for (const sec of sections) {
    const plainContent = stripMarkdown(sec.content);
    if (plainContent.toLowerCase().includes(query)) {
      results.push({
        ...studyMeta,
        sectionTitle: sec.title,
        matchType: 'content',
        snippet: extractSnippet(plainContent, query),
      });
    }

    if (sec.sqlExamplesIds && sqlExamples.length > 0) {
      for (const eid of sec.sqlExamplesIds) {
        const ex = sqlExamples.find(e => e.sqlExamplesId === eid);
        if (!ex) continue;
        const combined = `${ex.title} ${ex.sql} ${ex.description}`;
        if (combined.toLowerCase().includes(query)) {
          results.push({
            ...studyMeta,
            sectionTitle: sec.title,
            matchType: 'sql',
            snippet: extractSnippet(stripMarkdown(combined), query),
          });
        }
      }
    }

    if (sec.subsections) {
      searchSections(sec.subsections, query, studyMeta, sqlExamples, results);
    }
  }
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], query: q || '' });
  }

  const query = q.toLowerCase();
  const studyDir = path.join(process.cwd(), 'data', 'study');
  const results: SearchResult[] = [];

  const studyManifest = manifest.study as Record<string, string[]>;

  for (const [chapterId, files] of Object.entries(studyManifest)) {
    for (const file of files) {
      let data: StudyFile;
      try {
        const content = await fs.readFile(
          path.join(studyDir, chapterId, `${file}.json`),
          'utf-8',
        );
        data = JSON.parse(content);
      } catch {
        continue;
      }

      const studyMeta = {
        chapterId,
        studyId: data.id,
        title: data.title,
        chapter: data.chapter,
      };

      // title match
      if (data.title.toLowerCase().includes(query)) {
        results.push({
          ...studyMeta,
          sectionTitle: null,
          matchType: 'title',
          snippet: data.title,
        });
      }

      // keyword match
      if (data.keywords) {
        for (const kw of data.keywords) {
          if (kw.toLowerCase().includes(query)) {
            results.push({
              ...studyMeta,
              sectionTitle: null,
              matchType: 'keyword',
              snippet: kw,
            });
            break; // one keyword match per study file is enough
          }
        }
      }

      // section content + sql
      searchSections(
        data.sections,
        query,
        studyMeta,
        data.sql_examples || [],
        results,
      );
    }
  }

  // sort: title > keyword > content > sql
  const typeOrder: Record<string, number> = { title: 0, keyword: 1, content: 2, sql: 3 };
  results.sort((a, b) => typeOrder[a.matchType] - typeOrder[b.matchType]);

  return NextResponse.json({ results: results.slice(0, 50), query: q, total: results.length });
}
