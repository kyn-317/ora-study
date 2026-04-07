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

// Update this to wherever your study folder is. It's next to the project folder.
const STUDY_DIR = path.join(process.cwd(), '..', 'study');

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
