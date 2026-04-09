import fs from 'fs/promises';
import path from 'path';
import manifest from '@/data/manifest.json';

// ── Types ──

export interface Visual {
  id: string;
  type: 'svg' | 'html' | 'mermaid';
  src?: string;
  mermaidCode?: string;
  caption: string;
  placement: 'before-content' | 'after-content' | 'after-keypoints';
  width?: string;
}

export interface StudySection {
  sectionId: string;
  title: string;
  content: string;
  sqlExamplesIds?: string[];
  subsections?: StudySection[];
  key_points?: string[];
  visuals?: Visual[];
}

export interface SqlExample {
  sqlExamplesId: string;
  title: string;
  sql: string;
  description: string;
}

export interface StudyData {
  id: string;
  title: string;
  chapter: string;
  description: string;
  oracle26ai_changes?: string[];
  sections: StudySection[];
  sql_examples: SqlExample[];
  keywords: string[];
}

export interface QuizQuestion {
  chapter: string;
  number: string;
  title: string;
  options: string[];
  answer: string[];
  explanation: string;
}

export interface QuizSet {
  chapterId: string;
  setId: string;
  chapterName: string;
  questionCount: number;
}

export interface ExamChapter {
  chapterId: string;
  chapterName: string;
  fileName: string;
  questionCount: number;
}

// ── Paths (project-internal) ──

const DATA_DIR = path.join(process.cwd(), 'data');
const STUDY_DIR = path.join(DATA_DIR, 'study');
const CUSTOM_DIR = path.join(DATA_DIR, 'custom');
const EXAM_DIR = path.join(DATA_DIR, 'questions');

// ── Helper ──

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

// ── Study ──

export async function getChapters(): Promise<string[]> {
  return Object.keys(manifest.study).sort();
}

export async function getChapterSubcategories(chapterId: string) {
  const files = (manifest.study as Record<string, string[]>)[chapterId];
  if (!files) return [];

  const subcats = [];
  for (const file of files) {
    const data = await readJson<StudyData>(path.join(STUDY_DIR, chapterId, `${file}.json`));
    if (data) {
      subcats.push({
        id: data.id,
        title: data.title,
        description: data.description,
        keywords: data.keywords || [],
      });
    }
  }
  return subcats;
}

export async function getStudyData(chapterId: string, subCategoryId: string): Promise<StudyData | null> {
  const files = (manifest.study as Record<string, string[]>)[chapterId];
  if (!files) return null;

  const targetFile = files.find(f => f.startsWith(subCategoryId));
  if (!targetFile) return null;

  return readJson<StudyData>(path.join(STUDY_DIR, chapterId, `${targetFile}.json`));
}

// ── Quiz (custom questions) ──

export async function getQuizChapters(): Promise<QuizSet[]> {
  const sets: QuizSet[] = [];

  for (const [chapterId, files] of Object.entries(manifest.custom as Record<string, string[]>)) {
    for (const file of files) {
      const match = file.match(/^custom_(\d+)_(\d+)$/);
      if (!match) continue;
      const [, , setId] = match;
      const questions = await readJson<QuizQuestion[]>(path.join(CUSTOM_DIR, chapterId, `${file}.json`));
      if (questions && questions.length > 0) {
        sets.push({
          chapterId,
          setId,
          chapterName: questions[0].chapter,
          questionCount: questions.length,
        });
      }
    }
  }

  return sets.sort((a, b) => `${a.chapterId}_${a.setId}`.localeCompare(`${b.chapterId}_${b.setId}`));
}

export async function getQuizSetsForChapter(chapterId: string): Promise<QuizSet[]> {
  const all = await getQuizChapters();
  return all.filter(s => s.chapterId === chapterId);
}

export async function getQuizQuestions(chapterId: string, setId: string): Promise<QuizQuestion[]> {
  return (
    (await readJson<QuizQuestion[]>(
      path.join(CUSTOM_DIR, chapterId, `custom_${chapterId}_${setId}.json`),
    )) ?? []
  );
}

// ── Keyword Index ──

export interface KeywordEntry {
  studyId: string;
  chapterId: string;
  title: string;
  fileName: string;
  hasKeywordStudy?: boolean;
}

// ── Keyword Study (키워드 전용 학습자료) ──

export interface KeywordStudyEntry {
  definition: string;
  keyPoints: string[];
  relatedKeywords: string[];
  sourceSection: string;
}

interface KeywordStudyFile {
  studyId: string;
  chapterId: string;
  title: string;
  keywords: Record<string, KeywordStudyEntry>;
}

export function getKeywordIndex(): Record<string, KeywordEntry[]> {
  return (manifest as Record<string, unknown>).keywordIndex as Record<string, KeywordEntry[]> ?? {};
}

const KEYWORD_STUDY_DIR = path.join(DATA_DIR, 'keyword-study');

export async function getKeywordStudyEntry(
  chapterId: string,
  studyId: string,
  keyword: string,
): Promise<(KeywordStudyEntry & { title: string }) | null> {
  const file = await readJson<KeywordStudyFile>(
    path.join(KEYWORD_STUDY_DIR, chapterId, `${studyId}.json`),
  );
  if (!file?.keywords?.[keyword]) return null;
  return { ...file.keywords[keyword], title: file.title };
}

// ── Exam (original questions) ──

export async function getExamChapters(): Promise<ExamChapter[]> {
  const chapters: ExamChapter[] = [];

  for (const fileName of manifest.questions) {
    const match = fileName.match(/^(\d+)_(.+)$/);
    if (!match) continue;
    const [, chapterId] = match;
    const questions = await readJson<QuizQuestion[]>(path.join(EXAM_DIR, `${fileName}.json`));
    if (questions) {
      chapters.push({
        chapterId,
        chapterName: questions.length > 0 ? questions[0].chapter : fileName,
        fileName: `${fileName}.json`,
        questionCount: questions.length,
      });
    }
  }

  return chapters.sort((a, b) => a.chapterId.localeCompare(b.chapterId));
}

export async function getExamQuestions(chapterId: string): Promise<QuizQuestion[]> {
  const target = manifest.questions.find((f: string) => f.startsWith(`${chapterId}_`));
  if (!target) return [];
  return (await readJson<QuizQuestion[]>(path.join(EXAM_DIR, `${target}.json`))) ?? [];
}
