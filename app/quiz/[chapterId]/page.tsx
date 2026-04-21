import Link from 'next/link';
import { getQuizSetsForChapter } from '../../../lib/data';

export default async function QuizChapterPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params;
  const sets = await getQuizSetsForChapter(chapterId);

  return (
    <main className="app-shell">
      <Link href="/quiz" className="back-link">← Back to Quiz Home</Link>

      <header className="masthead">
        <div>
          <div className="tag">Chapter {chapterId}</div>
          <h1>{sets.length > 0 ? sets[0].chapterName : `Chapter ${chapterId}`}</h1>
          <p className="subtitle">세트를 선택하여 연습을 시작하세요.</p>
        </div>
        <div className="meta">
          <div><strong>Sets</strong>   {sets.length}</div>
          <div><strong>Questions</strong>   {sets.reduce((s, x) => s + x.questionCount, 0)}</div>
        </div>
      </header>

      <div className="entry-grid">
        {sets.map(set => (
          <Link href={`/quiz/${chapterId}/${set.setId}`} key={set.setId} className="entry-card">
            <span className="arrow">→</span>
            <div className="kicker">Set {set.setId}</div>
            <div className="title">문제 세트 {set.setId}</div>
            <p className="desc">{set.questionCount}문항으로 구성된 연습 세트.</p>
            <div className="chips">
              <span className="tag-chip accent">{set.questionCount} questions</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
