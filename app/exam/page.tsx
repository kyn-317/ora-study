import Link from 'next/link';
import { getExamChapters } from '../../lib/data';

export default async function ExamHome() {
  const chapters = await getExamChapters();

  return (
    <main style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Link href="/" style={{ color: 'var(--color-4)', marginBottom: '2rem', display: 'inline-block' }}>
        &larr; Back to Home
      </Link>

      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Exam Practice</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
          Choose a chapter to start.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {chapters.map(ch => (
          <Link href={`/exam/${ch.chapterId}`} key={ch.chapterId}>
            <div className="glass card-hover" style={{
              padding: '2rem',
              borderRadius: '16px',
              cursor: 'pointer',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              <h2 className="text-gradient-alt" style={{ fontSize: '1.5rem' }}>Chapter {ch.chapterId}</h2>
              <p style={{ color: 'var(--foreground)', fontSize: '0.95rem', lineHeight: 1.5, flex: 1 }}>
                {ch.chapterName}
              </p>
              <span style={{
                background: 'rgba(142, 68, 173, 0.08)',
                color: 'var(--color-2)',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                alignSelf: 'flex-start',
              }}>
                {ch.questionCount} questions
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
