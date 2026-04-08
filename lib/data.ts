import fs from 'fs/promises';
import path from 'path';

export interface StudySection {
  sectionId: string;
  title: string;
  content: string;
  sqlExamplesIds?: string[];
  subsections?: StudySection[];
  key_points?: string[];
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

// Update this to wherever your study folder is. It's next to the project folder.
const STUDY_DIR = path.join(process.cwd(), '..', 'study');
const QUESTIONS_DIR = path.join(process.cwd(), '..', 'customquestions_json');
const EXAM_DIR = path.join(process.cwd(), '..', 'questions_json');

export async function getChapters() {
  try {
    const chapters = await fs.readdir(STUDY_DIR);
    return chapters.filter(c => !c.startsWith('.'));
  } catch(e) {
    console.error(e);
    return [];
  }
}

export async function getChapterSubcategories(chapterId: string) {
  const chapterPath = path.join(STUDY_DIR, chapterId);
  try {
    const files = await fs.readdir(chapterPath);
    const subcats = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(chapterPath, file), 'utf-8');
        const data = JSON.parse(content) as StudyData;
        subcats.push({
          id: data.id,
          title: data.title,
          description: data.description,
          keywords: data.keywords || []
        });
      }
    }
    return subcats;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getQuizChapters(): Promise<QuizSet[]> {
  try {
    const chapterDirs = await fs.readdir(QUESTIONS_DIR);
    const sets: QuizSet[] = [];
    for (const dir of chapterDirs) {
      const dirPath = path.join(QUESTIONS_DIR, dir);
      const stat = await fs.stat(dirPath);
      if (!stat.isDirectory()) continue;
      const files = await fs.readdir(dirPath);
      for (const file of files) {
        const match = file.match(/^custom_(\d+)_(\d+)\.json$/);
        if (!match) continue;
        const [, chapterId, setId] = match;
        const content = await fs.readFile(path.join(dirPath, file), 'utf-8');
        const questions = JSON.parse(content) as QuizQuestion[];
        if (questions.length > 0) {
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
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getQuizSetsForChapter(chapterId: string): Promise<QuizSet[]> {
  const all = await getQuizChapters();
  return all.filter(s => s.chapterId === chapterId);
}

export async function getQuizQuestions(chapterId: string, setId: string): Promise<QuizQuestion[]> {
  try {
    const filePath = path.join(QUESTIONS_DIR, chapterId, `custom_${chapterId}_${setId}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as QuizQuestion[];
  } catch (e) {
    console.error(e);
    return [];
  }
}

export interface ExamChapter {
  chapterId: string;
  chapterName: string;
  fileName: string;
  questionCount: number;
}

export async function getExamChapters(): Promise<ExamChapter[]> {
  try {
    const files = await fs.readdir(EXAM_DIR);
    const chapters: ExamChapter[] = [];
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const match = file.match(/^(\d+)_(.+)\.json$/);
      if (!match) continue;
      const [, chapterId, name] = match;
      const content = await fs.readFile(path.join(EXAM_DIR, file), 'utf-8');
      const questions = JSON.parse(content) as QuizQuestion[];
      chapters.push({
        chapterId,
        chapterName: questions.length > 0 ? questions[0].chapter : name,
        fileName: file,
        questionCount: questions.length,
      });
    }
    return chapters.sort((a, b) => a.chapterId.localeCompare(b.chapterId));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getExamQuestions(chapterId: string): Promise<QuizQuestion[]> {
  try {
    const files = await fs.readdir(EXAM_DIR);
    const target = files.find(f => f.startsWith(`${chapterId}_`) && f.endsWith('.json'));
    if (!target) return [];
    const content = await fs.readFile(path.join(EXAM_DIR, target), 'utf-8');
    return JSON.parse(content) as QuizQuestion[];
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getStudyData(chapterId: string, subCategoryId: string): Promise<StudyData | null> {
  const chapterPath = path.join(STUDY_DIR, chapterId);
  try {
    const files = await fs.readdir(chapterPath);
    const targetFile = files.find(f => f.startsWith(subCategoryId) && f.endsWith('.json'));
    
    if (targetFile) {
      const content = await fs.readFile(path.join(chapterPath, targetFile), 'utf-8');
      return JSON.parse(content) as StudyData;
    }
    return null;
  } catch(e) {
    console.error(e);
    return null;
  }
}
