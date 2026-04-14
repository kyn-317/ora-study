import Link from 'next/link';
import { getQuizChapters } from '../../lib/data';

export default async function QuizHome() {
  const allSets = await getQuizChapters();

  // Group by chapter
  const chapters = new Map<string, { chapterName: string; sets: typeof allSets }>();
  for (const set of allSets) {
    if (!chapters.has(set.chapterId)) {
      chapters.set(set.chapterId, { chapterName: set.chapterName, sets: [] });
    }
    chapters.get(set.chapterId)!.sets.push(set);
  }

  return (
    <main style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Link href="/" style={{ color: 'var(--color-4)', marginBottom: '2rem', display: 'inline-block' }}>
        &larr; Back to Home
      </Link>

      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Practice Quiz</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
          Choose a chapter to practice.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {Array.from(chapters.entries()).map(([chapterId, { chapterName, sets }]) => {
          const totalQuestions = sets.reduce((sum, s) => sum + s.questionCount, 0);
          return (
            <Link href={`/quiz/${chapterId}`} key={chapterId}>
              <div className="glass card-hover" style={{
                padding: '2rem',
                borderRadius: '16px',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}>
                <h2 className="text-gradient-alt" style={{ fontSize: '1.8rem' }}>Chapter {chapterId}</h2>
                <p style={{ color: 'var(--foreground)', fontSize: '0.95rem', lineHeight: 1.5 }}>{chapterName}</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                  <span style={{
                    background: 'rgba(41, 128, 185, 0.08)',
                    color: 'var(--color-4)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}>
                    {sets.length} set{sets.length > 1 ? 's' : ''}
                  </span>
                  <span style={{
                    background: 'rgba(142, 68, 173, 0.08)',
                    color: 'var(--color-2)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}>
                    {totalQuestions} questions
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
