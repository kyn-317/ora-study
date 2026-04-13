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
          60 questions per set &middot; 90 min &middot; Shuffled questions &amp; options
        </p>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Link href="/mock-exam/history" style={{
          display: 'inline-block',
          padding: '0.75rem 2rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(30, 31, 41, 0.6)',
          color: 'var(--color-5)',
          fontWeight: 600,
          fontSize: '0.95rem',
        }}>
          Analytics Dashboard &rarr;
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
                background: 'rgba(132, 72, 240, 0.1)',
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
