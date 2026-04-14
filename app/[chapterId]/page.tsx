import Link from 'next/link';
import { getChapterSubcategories } from '../../lib/data';

export default async function ChapterPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const chapterId = (await params).chapterId;
  const subcats = await getChapterSubcategories(chapterId);

  return (
    <main style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Link href="/" style={{ color: 'var(--color-4)', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block' }}>
        &larr; Back to Chapters
      </Link>
      
      <div style={{ marginBottom: '4rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Chapter {chapterId}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Select a topic to study</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
        {subcats.map(sub => (
          <Link href={`/${chapterId}/${sub.id}`} key={sub.id}>
            <div className="glass card-hover-alt" style={{
              padding: '2rem',
              borderRadius: '20px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--foreground)' }}>{sub.title}</h2>
              <p style={{ color: 'var(--text-muted)', flex: 1, marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
                {sub.description}
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {sub.keywords.slice(0, 3).map(kw => (
                  <span key={kw} style={{
                    background: 'rgba(41, 128, 185, 0.08)',
                    color: 'var(--color-4)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}>
                    {kw}
                  </span>
                ))}
                {sub.keywords.length > 3 && (
                  <span style={{
                    background: 'var(--glass-bg)',
                    color: 'var(--text-muted)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.8rem'
                  }}>
                    +{sub.keywords.length - 3}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
