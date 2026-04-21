import Link from 'next/link';
import { getChapterSubcategories } from '../../lib/data';

export default async function ChapterPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const chapterId = (await params).chapterId;
  const subcats = await getChapterSubcategories(chapterId);

  return (
    <main className="app-shell">
      <Link href="/" className="back-link">← Back to Chapters</Link>

      <header className="masthead">
        <div>
          <div className="tag">Chapter {chapterId}</div>
          <h1>챕터 {chapterId} 학습 주제</h1>
          <p className="subtitle">주제를 선택하여 학습을 시작하세요.</p>
        </div>
        <div className="meta">
          <div><strong>Topics</strong>   {subcats.length}</div>
        </div>
      </header>

      <div className="entry-grid">
        {subcats.map(sub => (
          <Link href={`/${chapterId}/${sub.id}`} key={sub.id} className="entry-card">
            <span className="arrow">→</span>
            <div className="kicker">{sub.id}</div>
            <div className="title">{sub.title}</div>
            <p className="desc">{sub.description}</p>
            <div className="chips">
              {sub.keywords.slice(0, 3).map(kw => (
                <span key={kw} className="tag-chip accent">{kw}</span>
              ))}
              {sub.keywords.length > 3 && (
                <span className="tag-chip">+{sub.keywords.length - 3}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
