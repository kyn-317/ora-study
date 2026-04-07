import Link from 'next/link';
import { getChapters } from '../lib/data';

export default async function Home() {
  const chapters = await getChapters();

  return (
    <main style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Oracle 1Z0-182 Study App</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Choose a chapter to begin your journey.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {chapters.map(chapter => (
          <Link href={`/${chapter}`} key={chapter}>
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
    </main>
  );
}
