import Link from 'next/link';
import { getChapters } from '../lib/data';
import HomeSearch from './HomeSearch';

export default async function Home() {
  const chapters = await getChapters();
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

  return (
    <main className="app-shell">
      <header className="masthead">
        <div>
          <div className="tag">Oracle 1Z0-182 · Study Notes</div>
          <h1>Oracle Database 23ai Administrator I</h1>
          <p className="subtitle">학습 노트 · 개념 정리 · 기출 유사 문제</p>
        </div>
        <div className="meta">
          <div><strong>Exam</strong>   1Z0-182</div>
          <div><strong>Version</strong>   23ai</div>
          <div><strong>Updated</strong>   {today}</div>
        </div>
      </header>

      {/* 1. 검색 */}
      <section className="section">
        <div className="section-label">Search</div>
        <h2 className="section-title">학습자료 검색</h2>
        <p className="lead" style={{ marginBottom: 14 }}>
          제목 · 키워드 · 본문 · SQL 예제에서 원하는 내용을 즉시 찾습니다. <kbd style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            padding: '2px 6px',
            border: '1px solid var(--rule)',
            color: 'var(--ink-3)',
            background: 'var(--paper-2)',
          }}>⌘K</kbd> 로 포커스.
        </p>
        <HomeSearch />
      </section>

      {/* 2. 챕터별 학습 */}
      <section className="section" style={{ marginTop: 48 }}>
        <div className="section-label">Chapters</div>
        <h2 className="section-title">챕터별 학습</h2>
      </section>

      <div className="entry-grid">
        {chapters.map(chapter => (
          <Link
            href={chapter === '00' ? '/00/00_00' : `/${chapter}`}
            key={chapter}
            className="entry-card"
          >
            <span className="arrow">→</span>
            <div className="kicker">Chapter {chapter}</div>
            <div className="title">{chapterTitleFor(chapter)}</div>
            <p className="desc">{chapterDescFor(chapter)}</p>
          </Link>
        ))}
      </div>

      {/* 3. 학습모드 */}
      <section className="section" style={{ marginTop: 48 }}>
        <div className="section-label">Study Modes</div>
        <h2 className="section-title">학습 모드</h2>
      </section>

      <Link href="/demo-test" className="mode-card">
        <div>
          <div className="mode-kicker">Demo Test</div>
          <h3 className="mode-title">랜덤 데모 테스트</h3>
          <p className="mode-desc">10 · 20 · 30 · 60 · All · 원하는 챕터를 조합한 빠른 연습.</p>
        </div>
        <span className="mode-arrow">→</span>
      </Link>

      <Link href="/mock-exam" className="mode-card">
        <div>
          <div className="mode-kicker">Mock Exam</div>
          <h3 className="mode-title">모의고사</h3>
          <p className="mode-desc">60문항 · 90분 · 셔플 · 5세트 실전 시뮬레이션.</p>
        </div>
        <span className="mode-arrow">→</span>
      </Link>

      <Link href="/exam" className="mode-card">
        <div>
          <div className="mode-kicker">Exam Practice</div>
          <h3 className="mode-title">챕터별 실전 문제</h3>
          <p className="mode-desc">13개 챕터의 시험 유형 문제를 집중 풀이.</p>
        </div>
        <span className="mode-arrow">→</span>
      </Link>

      <Link href="/quiz" className="mode-card">
        <div>
          <div className="mode-kicker">Practice Quiz</div>
          <h3 className="mode-title">연습 문제</h3>
          <p className="mode-desc">세트 단위로 나눠진 기본기 다지기 문제.</p>
        </div>
        <span className="mode-arrow">→</span>
      </Link>
    </main>
  );
}

function chapterTitleFor(id: string): string {
  const map: Record<string, string> = {
    '00': 'Introduction',
    '01': 'Architecture & Instance',
    '02': 'Multitenant (CDB/PDB)',
    '03': 'Tools & Net Services',
    '04': 'Security & Auditing',
    '05': 'Storage & Tablespace',
    '06': 'UNDO Management',
    '07': 'Data Movement',
    '08': 'Performance & Automation',
  };
  return map[id] ?? `Chapter ${id}`;
}

function chapterDescFor(id: string): string {
  const map: Record<string, string> = {
    '00': '시험 개요와 학습 가이드',
    '01': '메모리(SGA/PGA) · 프로세스 · 저장구조 · 기동/종료 · 파라미터',
    '02': 'CDB$ROOT · PDB$SEED · PDB 생성/관리/클론/Unplug-Plug',
    '03': 'DBCA · SQL*Plus · EM · 리스너 · 네이밍 · DB Link',
    '04': '사용자/인증 · 권한/롤 · 프로파일 · 통합 감사 · FGA',
    '05': '테이블스페이스 · 블록 · ROWID · Resumable · Shrink · 압축',
    '06': '읽기 일관성 · 롤백 · Flashback · Temp/Local UNDO',
    '07': 'External Table · SQL*Loader · Data Pump (expdp/impdp)',
    '08': 'AWR · ADDM · Resource Manager · 어드바이저 · AutoTask',
  };
  return map[id] ?? '챕터별 세부 주제 학습';
}
