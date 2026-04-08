import Link from 'next/link';
import { getExamQuestions } from '../../../lib/data';
import QuizClient from '../../quiz/[chapterId]/[setId]/QuizClient';

export default async function ExamChapterPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params;
  const questions = await getExamQuestions(chapterId);

  if (questions.length === 0) {
    return (
      <main style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <Link href="/exam" style={{ color: 'var(--color-4)' }}>
          &larr; Back
        </Link>
        <p style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>No questions found.</p>
      </main>
    );
  }

  return (
    <QuizClient
      questions={questions}
      chapterId={chapterId}
      setId="exam"
      backHref="/exam"
      storagePrefix="exam"
      showExplanation={false}
    />
  );
}
