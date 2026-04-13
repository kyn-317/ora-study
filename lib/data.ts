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

export interface MockExamSet {
  exam_set: number;
  total_questions: number;
  questions: string[];
}

export interface MockExamAllocation {
  chapter: string;
  chapter_name: string;
  questions_per_set: number;
  total_questions: number;
  reserve: string[];
  allocation: Record<string, {
    question_ids: string[];
    type_breakdown: Record<string, number>;
    topic_breakdown: Record<string, number>;
  }>;
  validation: Record<string, unknown>;
}

export interface MockExamReservePool {
  reserve_pool: {
    total: number;
    questions: string[];
  };
}

// ── Paths (project-internal) ──

const DATA_DIR = path.join(process.cwd(), 'data');
const STUDY_DIR = path.join(DATA_DIR, 'study');
const CUSTOM_DIR = path.join(DATA_DIR, 'custom');
const EXAM_DIR = path.join(DATA_DIR, 'questions');
const MOCK_EXAM_DIR = path.join(DATA_DIR, 'mock-exams');

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

// ── Mock Exams ──

const mockExamsManifest = (manifest as Record<string, unknown>).mockExams as {
  examSets: string[];
  allocations: string[];
  hasReservePool: boolean;
} | undefined;

export async function getMockExamSets(): Promise<string[]> {
  return mockExamsManifest?.examSets ?? [];
}

export async function getMockExamSet(setName: string): Promise<MockExamSet | null> {
  return readJson<MockExamSet>(path.join(MOCK_EXAM_DIR, `${setName}.json`));
}

export async function getMockExamAllocations(): Promise<string[]> {
  return mockExamsManifest?.allocations ?? [];
}

export async function getMockExamAllocation(allocName: string): Promise<MockExamAllocation | null> {
  return readJson<MockExamAllocation>(path.join(MOCK_EXAM_DIR, `${allocName}.json`));
}

export async function getMockExamReservePool(): Promise<MockExamReservePool | null> {
  if (!mockExamsManifest?.hasReservePool) return null;
  return readJson<MockExamReservePool>(path.join(MOCK_EXAM_DIR, 'reserve_pool.json'));
}

// ── Mock Exam: resolve question IDs to actual questions ──

/**
 * Question ID (e.g. "C_01_001") → chapter "01", within custom_01_XXX.json files.
 * Returns all resolved questions for a given mock exam set.
 */
export async function getMockExamQuestions(setId: number): Promise<QuizQuestion[]> {
  const examSet = await readJson<MockExamSet>(path.join(MOCK_EXAM_DIR, `exam_set_${setId}.json`));
  if (!examSet) return [];

  // Group question IDs by chapter
  const byChapter = new Map<string, string[]>();
  for (const qid of examSet.questions) {
    const match = qid.match(/^C_(\d+)_(\d+)$/);
    if (!match) continue;
    const chapterId = match[1];
    if (!byChapter.has(chapterId)) byChapter.set(chapterId, []);
    byChapter.get(chapterId)!.push(qid);
  }

  // Load all custom files in parallel and index by question number
  const questionMap = new Map<string, QuizQuestion>();
  const neededIds = new Set(examSet.questions);

  const fileReads: Promise<void>[] = [];
  for (const [chapterId] of byChapter) {
    const chapterFiles = (manifest.custom as Record<string, string[]>)[chapterId];
    if (!chapterFiles) continue;

    for (const file of chapterFiles) {
      fileReads.push(
        readJson<QuizQuestion[]>(path.join(CUSTOM_DIR, chapterId, `${file}.json`)).then(arr => {
          if (!Array.isArray(arr)) return;
          for (const q of arr) {
            if (neededIds.has(q.number)) {
              questionMap.set(q.number, q);
            }
          }
        }),
      );
    }
  }
  await Promise.all(fileReads);

  // Return in original exam set order
  return examSet.questions
    .map(qid => questionMap.get(qid))
    .filter((q): q is QuizQuestion => q !== undefined);
}

// ── Exam Results ──

const EXAM_RESULTS_DIR = path.join(DATA_DIR, 'exam-results');

export interface ExamResultAnswer {
  questionId: string;
  chapter: string;
  selected: string[];
  correct: string[];
  isCorrect: boolean;
  timeSpent: number;
}

export interface ExamResult {
  examSet: number;
  startedAt: string;
  completedAt: string;
  duration: number;
  shuffleSeed: number;
  totalQuestions: number;
  score: number;
  scoreRate: number;
  answers: ExamResultAnswer[];
}

export async function saveExamResult(result: ExamResult): Promise<string> {
  const timestamp = result.completedAt.replace(/[-:T]/g, '').slice(0, 14);
  const fileName = `exam_set_${result.examSet}_${timestamp}.json`;
  const filePath = path.join(EXAM_RESULTS_DIR, fileName);

  await fs.mkdir(EXAM_RESULTS_DIR, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(result, null, 2), 'utf-8');

  return fileName;
}

export async function getExamResults(): Promise<{ fileName: string; result: ExamResult }[]> {
  try {
    const files = await fs.readdir(EXAM_RESULTS_DIR);
    const results: { fileName: string; result: ExamResult }[] = [];

    for (const file of files.filter(f => f.startsWith('exam_set_') && f.endsWith('.json'))) {
      const result = await readJson<ExamResult>(path.join(EXAM_RESULTS_DIR, file));
      if (result) results.push({ fileName: file, result });
    }

    return results.sort((a, b) => b.result.completedAt.localeCompare(a.result.completedAt));
  } catch {
    return [];
  }
}

// ── Exam Results Summary ──

const SUMMARY_PATH = path.join(EXAM_RESULTS_DIR, 'summary.json');

export async function refreshExamSummary(): Promise<void> {
  const results = await getExamResults();

  if (results.length === 0) {
    // Remove stale summary if no results exist
    try { await fs.unlink(SUMMARY_PATH); } catch { /* ignore */ }
    return;
  }

  const totalExams = results.length;
  const scores = results.map((r) => r.result.scoreRate);
  const averageScore = Math.round((scores.reduce((a, b) => a + b, 0) / totalExams) * 10) / 10;
  const bestScore = Math.max(...scores);
  const passCount = results.filter((r) => r.result.scoreRate >= 70).length;

  // By set
  const bySet: Record<string, {
    attempts: number; bestScore: number; bestRate: number; lastRate: number; scores: number[];
  }> = {};
  for (const { result } of results) {
    const key = String(result.examSet);
    if (!bySet[key]) {
      bySet[key] = { attempts: 0, bestScore: 0, bestRate: 0, lastRate: 0, scores: [] };
    }
    bySet[key].attempts++;
    bySet[key].scores.push(result.scoreRate);
    if (result.scoreRate > bySet[key].bestRate) {
      bySet[key].bestScore = result.score;
      bySet[key].bestRate = result.scoreRate;
    }
  }
  for (const { result } of results) {
    bySet[String(result.examSet)].lastRate = result.scoreRate;
  }

  // By chapter
  const byChapter: Record<string, { total: number; correct: number; rate: number }> = {};
  for (const { result } of results) {
    for (const ans of result.answers) {
      if (!byChapter[ans.chapter]) {
        byChapter[ans.chapter] = { total: 0, correct: 0, rate: 0 };
      }
      byChapter[ans.chapter].total++;
      if (ans.isCorrect) byChapter[ans.chapter].correct++;
    }
  }
  for (const ch of Object.values(byChapter)) {
    ch.rate = Math.round((ch.correct / ch.total) * 1000) / 10;
  }

  // Weak questions (wrong 2+ times)
  const questionStats: Record<string, { chapter: string; wrongCount: number; totalAttempts: number }> = {};
  for (const { result } of results) {
    for (const ans of result.answers) {
      if (!questionStats[ans.questionId]) {
        questionStats[ans.questionId] = { chapter: ans.chapter, wrongCount: 0, totalAttempts: 0 };
      }
      questionStats[ans.questionId].totalAttempts++;
      if (!ans.isCorrect) questionStats[ans.questionId].wrongCount++;
    }
  }
  const weakQuestions = Object.entries(questionStats)
    .filter(([, s]) => s.wrongCount >= 2)
    .map(([id, s]) => ({
      questionId: id, chapter: s.chapter,
      wrongCount: s.wrongCount, totalAttempts: s.totalAttempts,
      wrongRate: Math.round((s.wrongCount / s.totalAttempts) * 1000) / 10,
    }))
    .sort((a, b) => b.wrongCount - a.wrongCount);

  const summary = {
    totalExams, averageScore, bestScore, passCount,
    passRate: Math.round((passCount / totalExams) * 1000) / 10,
    bySet, byChapter, weakQuestions,
    lastUpdated: new Date().toISOString(),
  };

  await fs.mkdir(EXAM_RESULTS_DIR, { recursive: true });
  await fs.writeFile(SUMMARY_PATH, JSON.stringify(summary, null, 2), 'utf-8');
}
