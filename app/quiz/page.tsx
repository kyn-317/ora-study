import Link from 'next/link';
import { getQuizChapters } from '../../lib/data';

export default async function QuizHome() {
  const allSets = await getQuizChapters();

  const chapters = new Map<string, { chapterName: string; sets: typeof allSets }>();
  for (const set of allSets) {
    if (!chapters.has(set.chapterId)) {
      chapters.set(set.chapterId, { chapterName: set.chapterName, sets: [] });
    }
    chapters.get(set.chapterId)!.sets.push(set);
  }

  const totalSets = allSets.length;
  const totalQuestions = allSets.reduce((s, x) => s + x.questionCount, 0);

  return (
    <main className="app-shell">
      <Link href="/" className="back-link">← Back to Home</Link>

      <header className="masthead">
        <div>
          <div className="tag">Practice Quiz</div>
          <h1>연습 문제</h1>
          <p className="subtitle">챕터를 선택해 세트 단위로 풀어보세요.</p>
        </div>
        <div className="meta">
          <div><strong>Chapters</strong>   {chapters.size}</div>
          <div><strong>Sets</strong>   {totalSets}</div>
          <div><strong>Questions</strong>   {totalQuestions}</div>
        </div>
      </header>

      <div className="entry-grid">
        {Array.from(chapters.entries()).map(([chapterId, { chapterName, sets }]) => {
          const qCount = sets.reduce((sum, s) => sum + s.questionCount, 0);
          return (
            <Link href={`/quiz/${chapterId}`} key={chapterId} className="entry-card">
              <span className="arrow">→</span>
              <div className="kicker">Chapter {chapterId}</div>
              <div className="title">{chapterName}</div>
              <div className="chips">
                <span className="tag-chip accent">{sets.length} set{sets.length > 1 ? 's' : ''}</span>
                <span className="tag-chip">{qCount} questions</span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
