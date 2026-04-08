import Link from 'next/link';
import { getQuizQuestions, getKeywordIndex } from '../../../../lib/data';
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

  // 해설 텍스트에 실제 등장하는 키워드만 필터링하여 클라이언트에 전달
  const fullIndex = getKeywordIndex();
  const allExplanations = questions.map(q => q.explanation || '').join('\n');
  const filteredIndex: Record<string, typeof fullIndex[string]> = {};
  for (const [kw, entries] of Object.entries(fullIndex)) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(escaped, 'i').test(allExplanations)) {
      filteredIndex[kw] = entries;
    }
  }

  return <QuizClient questions={questions} chapterId={chapterId} setId={setId} keywordIndex={filteredIndex} />;
}
