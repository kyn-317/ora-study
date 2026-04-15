import Link from 'next/link';
import { getMockExamSets, getMockExamSet } from '../../lib/data';

export default async function MockExamHome() {
  const setNames = await getMockExamSets();

  const sets = await Promise.all(
    setNames.map(async (name) => {
      const data = await getMockExamSet(name);
      return data ? { name, ...data } : null;
    }),
  );

  const validSets = sets.filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <main style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Link href="/" style={{ color: 'var(--color-4)', marginBottom: '2rem', display: 'inline-block' }}>
        &larr; Back to Home
      </Link>

      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Mock Exam
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
          60 questions per set &middot; 120 min &middot; Shuffled questions &amp; options
        </p>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/mock-exam/history" style={{
          display: 'inline-block',
          padding: '0.75rem 2rem',
          borderRadius: '12px',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          background: 'var(--surface)',
          color: 'var(--color-5)',
          fontWeight: 600,
          fontSize: '0.95rem',
        }}>
          Analytics Dashboard &rarr;
        </Link>
        <Link href="/mock-exam/wrong-notes" style={{
          display: 'inline-block',
          padding: '0.75rem 2rem',
          borderRadius: '12px',
          border: '1px solid rgba(220, 38, 38, 0.15)',
          background: 'var(--surface)',
          color: '#EF4444',
          fontWeight: 600,
          fontSize: '0.95rem',
        }}>
          Wrong Notes &rarr;
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        {validSets.map((s) => (
          <Link href={`/mock-exam/${s.exam_set}`} key={s.exam_set}>
            <div className="glass card-hover" style={{
              padding: '2.5rem 2rem',
              borderRadius: '16px',
              cursor: 'pointer',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              textAlign: 'center',
            }}>
              <h2 className="text-gradient-alt" style={{ fontSize: '2rem' }}>
                Set {s.exam_set}
              </h2>
              <span style={{
                background: 'rgba(142, 68, 173, 0.08)',
                color: 'var(--color-2)',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                alignSelf: 'center',
              }}>
                {s.total_questions} questions
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
