import Link from 'next/link';
import { getChapters } from '../lib/data';

export default async function Home() {
  const chapters = await getChapters();

  return (
    <main style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Oracle 1Z0-182 Study App</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Choose a chapter to begin your journey.</p>

        <Link href="/search">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '1.5rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
            background: 'var(--surface)',
            color: 'var(--text-muted)',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            학습자료 검색...
          </div>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {chapters.map(chapter => (
          <Link href={chapter === '00' ? '/00/00_00' : `/${chapter}`} key={chapter}>
            <div className="glass card-hover" style={{
              padding: '2rem',
              borderRadius: '16px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }}>
              <h2 className="text-gradient-alt" style={{ fontSize: '2rem' }}>Chapter {chapter}</h2>
            </div>
          </Link>
        ))}
      </div>

      <Link href="/demo-test">
        <div className="glass card-hover" style={{
          padding: '1.5rem 2rem',
          borderRadius: '16px',
          cursor: 'pointer',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderColor: 'var(--color-3)',
        }}>
          <div>
            <h2 className="text-gradient" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Demo Test</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>Quick random practice &middot; 10/20/30 questions &middot; Pick your chapters</p>
          </div>
          <span style={{ fontSize: '1.5rem', color: 'var(--color-3)' }}>&rarr;</span>
        </div>
      </Link>

      <Link href="/mock-exam">
        <div className="glass card-hover" style={{
          padding: '1.5rem 2rem',
          borderRadius: '16px',
          cursor: 'pointer',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderColor: 'var(--color-5)',
        }}>
          <div>
            <h2 className="text-gradient" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Mock Exam</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>60 questions &middot; 90 min &middot; Shuffled &middot; 5 sets</p>
          </div>
          <span style={{ fontSize: '1.5rem', color: 'var(--color-5)' }}>&rarr;</span>
        </div>
      </Link>

      <Link href="/exam">
        <div className="glass card-hover" style={{
          padding: '1.5rem 2rem',
          borderRadius: '16px',
          cursor: 'pointer',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderColor: 'var(--color-4)',
        }}>
          <div>
            <h2 className="text-gradient" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Exam Practice</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>Practice with exam-style questions (13 chapters)</p>
          </div>
          <span style={{ fontSize: '1.5rem', color: 'var(--color-4)' }}>&rarr;</span>
        </div>
      </Link>

      <Link href="/quiz">
        <div className="glass card-hover" style={{
          padding: '1.5rem 2rem',
          borderRadius: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderColor: 'var(--color-2)',
        }}>
          <div>
            <h2 className="text-gradient-alt" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Practice Quiz</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>Test your knowledge with practice questions</p>
          </div>
          <span style={{ fontSize: '1.5rem', color: 'var(--color-4)' }}>&rarr;</span>
        </div>
      </Link>
    </main>
  );
}
