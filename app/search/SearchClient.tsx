'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface SearchResult {
  chapterId: string;
  studyId: string;
  title: string;
  chapter: string;
  sectionTitle: string | null;
  matchType: 'title' | 'keyword' | 'content' | 'sql';
  snippet: string;
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i}>{part}</mark> : part,
  );
}

export default function SearchClient() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setTotal(0);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(data.results);
      setTotal(data.total ?? data.results.length);
      setSearched(true);
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(value), 350);
  };

  useEffect(() => {
    if (initialQ && initialQ.trim().length >= 2) {
      doSearch(initialQ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (timerRef.current) clearTimeout(timerRef.current);
      doSearch(query);
    }
  };

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    const key = `${r.chapterId}/${r.studyId}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <main className="app-shell">
      <Link href="/" className="back-link">← Back to Home</Link>

      <header className="masthead">
        <div>
          <div className="tag">Search</div>
          <h1>학습자료 검색</h1>
          <p className="subtitle">제목 · 키워드 · 본문 · SQL 예제에서 원하는 내용을 찾습니다.</p>
        </div>
        <div className="meta">
          <div><strong>Results</strong>   {searched ? total : '—'}</div>
        </div>
      </header>

      <div className="search-box">
        <div className="search">
          <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="10.5" cy="10.5" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20L15.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="검색어를 입력하세요 (2자 이상)…"
            autoFocus
            aria-label="Search"
          />
          {query && (
            <button
              className="clear"
              onClick={() => { setQuery(''); setResults([]); setTotal(0); setSearched(false); }}
              aria-label="Clear"
            >
              ✕
            </button>
          )}
          {loading && <kbd>…</kbd>}
        </div>
      </div>

      {searched && !loading && (
        <p style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 20, letterSpacing: '0.04em' }}>
          {total === 0
            ? `"${query}" 에 대한 결과 없음`
            : `${total}건 · ${total > 50 ? '상위 50건 표시' : '전체'}`}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {Object.entries(grouped).map(([key, items]) => {
          const first = items[0];
          return (
            <Link key={key} href={`/${first.chapterId}/${first.studyId}`} style={{ textDecoration: 'none' }}>
              <article className="qa-card" style={{ margin: 0, transition: 'border-color 0.15s' }}>
                <div className="qa-head">
                  <span>
                    <span className="num">Ch.{first.chapterId}</span>
                    {' · '}{first.chapter}
                  </span>
                  <span className="tag-chip accent">{items.length} match{items.length > 1 ? 'es' : ''}</span>
                </div>
                <div className="qa-body" style={{ padding: '16px 20px' }}>
                  <h3 style={{
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 500,
                    fontSize: 18,
                    margin: '0 0 10px',
                    color: 'var(--ink)',
                    letterSpacing: '-0.01em',
                  }}>
                    {highlightMatch(first.title, query)}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span className={`tag-chip ${item.matchType === 'title' ? 'accent' : item.matchType === 'keyword' ? 'info' : item.matchType === 'sql' ? 'correct' : ''}`} style={{ flexShrink: 0 }}>
                          {item.matchType}
                        </span>
                        <span style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                          {item.sectionTitle && (
                            <span style={{
                              color: 'var(--ink-3)',
                              fontFamily: 'var(--font-mono)',
                              fontSize: 11,
                              marginRight: 6,
                            }}>
                              [{item.sectionTitle}]
                            </span>
                          )}
                          {highlightMatch(item.snippet, query)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
