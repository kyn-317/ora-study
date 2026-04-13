import { getWrongQuestions, getWrongNotes, resolveQuestions } from '../../../lib/data';
import type { QuizQuestion } from '../../../lib/data';
import WrongNotesClient from './WrongNotesClient';

export interface WrongNoteItem {
  questionId: string;
  chapter: string;
  wrongCount: number;
  totalAttempts: number;
  lastWrongAt: string;
  question: {
    title: string;
    options: string[];
    answer: string[];
    explanation: string;
  } | null;
  memo: string;
  memoUpdatedAt: string;
}

export default async function WrongNotesPage() {
  const [wrongQuestions, notes] = await Promise.all([
    getWrongQuestions(),
    getWrongNotes(),
  ]);

  // Resolve question text
  const questionIds = wrongQuestions.map((q) => q.questionId);
  const questionMap = await resolveQuestions(questionIds);

  const items: WrongNoteItem[] = wrongQuestions.map((wq) => {
    const q = questionMap.get(wq.questionId) as QuizQuestion | undefined;
    const note = notes.notes[wq.questionId];
    return {
      questionId: wq.questionId,
      chapter: wq.chapter,
      wrongCount: wq.wrongCount,
      totalAttempts: wq.totalAttempts,
      lastWrongAt: wq.lastWrongAt,
      question: q ? {
        title: q.title,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
      } : null,
      memo: note?.memo ?? '',
      memoUpdatedAt: note?.updatedAt ?? '',
    };
  });

  return <WrongNotesClient items={items} />;
}
