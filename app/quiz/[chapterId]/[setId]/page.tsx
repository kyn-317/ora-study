import Link from 'next/link';
import { getQuizQuestions } from '../../../../lib/data';
import QuizClient from './QuizClient';

export default async function QuizPage({ params }: { params: Promise<{ chapterId: string; setId: string }> }) {
  const { chapterId, setId } = await params;
  const questions = await getQuizQuestions(chapterId, setId);

  if (questions.length === 0) {
    return (
      <main style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <Link href={`/quiz/${chapterId}`} style={{ color: 'var(--color-4)' }}>
          &larr; Back
        </Link>
        <p style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>No questions found.</p>
      </main>
    );
  }

  return <QuizClient questions={questions} chapterId={chapterId} setId={setId} />;
}
