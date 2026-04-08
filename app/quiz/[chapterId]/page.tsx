import Link from 'next/link';
import { getQuizSetsForChapter } from '../../../lib/data';

export default async function QuizChapterPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params;
  const sets = await getQuizSetsForChapter(chapterId);

  return (
    <main style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Link href="/quiz" style={{ color: 'var(--color-4)', marginBottom: '2rem', display: 'inline-block' }}>
        &larr; Back to Quiz Home
      </Link>

      <div style={{ marginBottom: '4rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Chapter {chapterId}
        </h1>
        {sets.length > 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{sets[0].chapterName}</p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        {sets.map(set => (
          <Link href={`/quiz/${chapterId}/${set.setId}`} key={set.setId}>
            <div className="glass card-hover-alt" style={{
              padding: '2rem',
              borderRadius: '16px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              height: '100%',
            }}>
              <h2 style={{ fontSize: '1.5rem', color: 'white' }}>Set {set.setId}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                {set.questionCount} questions
              </p>
              <div style={{
                marginTop: 'auto',
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, var(--color-2), var(--color-3))',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}>
                Start Quiz
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
