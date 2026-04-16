'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

interface SearchResult {
  chapterId: string;
  studyId: string;
  title: string;
  chapter: string;
  sectionTitle: string | null;
  matchType: 'title' | 'keyword' | 'content' | 'sql';
  snippet: string;
}

const MATCH_LABELS: Record<string, { label: string; color: string }> = {
  title: { label: '제목', color: 'var(--color-4)' },
  keyword: { label: '키워드', color: 'var(--color-5)' },
  content: { label: '본문', color: 'var(--color-1)' },
  sql: { label: 'SQL', color: 'var(--color-2)' },
};

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} style={{ background: 'rgba(41, 128, 185, 0.2)', color: 'var(--color-3)', padding: '0 2px', borderRadius: '2px' }}>
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (timerRef.current) clearTimeout(timerRef.current);
      doSearch(query);
    }
  };

  // Group results by studyId
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    const key = `${r.chapterId}/${r.studyId}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <main style={{ padding: '3rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
      <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1.5rem' }}>
        &larr; Home
      </Link>

      <h1 className="text-gradient" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
        학습자료 검색
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        제목, 키워드, 본문, SQL 예제에서 원하는 내용을 찾아보세요.
      </p>

      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <input
          type="text"
          value={query}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="검색어를 입력하세요 (2자 이상)..."
          autoFocus
          style={{
            width: '100%',
            padding: '1rem 1.25rem 1rem 3rem',
            fontSize: '1.1rem',
            borderRadius: '14px',
            border: '2px solid var(--glass-border)',
            background: 'var(--surface)',
            color: 'var(--foreground)',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--color-4)')}
          onBlur={e => (e.target.style.borderColor = 'var(--glass-border)')}
        />
        <svg
          style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        {loading && (
          <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            검색 중...
          </div>
        )}
      </div>

      {searched && !loading && (
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          {total === 0
            ? `"${query}"에 대한 검색 결과가 없습니다.`
            : `${total}건의 결과를 찾았습니다.${total > 50 ? ' (상위 50건 표시)' : ''}`}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {Object.entries(grouped).map(([key, items]) => {
          const first = items[0];
          return (
            <Link key={key} href={`/${first.chapterId}/${first.studyId}`}>
              <div
                className="glass card-hover"
                style={{
                  padding: '1.5rem',
                  borderRadius: '14px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.04)', padding: '2px 8px', borderRadius: '6px' }}>
                    Ch.{first.chapterId}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--color-3)', margin: 0 }}>
                    {highlightMatch(first.title, query)}
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.75rem' }}>
                  {items.map((item, idx) => {
                    const badge = MATCH_LABELS[item.matchType];
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: 'white',
                            background: badge.color,
                            padding: '1px 7px',
                            borderRadius: '4px',
                            flexShrink: 0,
                            marginTop: '3px',
                          }}
                        >
                          {badge.label}
                        </span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--foreground)', lineHeight: 1.5 }}>
                          {item.sectionTitle && (
                            <span style={{ color: 'var(--text-muted)', marginRight: '0.4rem' }}>
                              [{item.sectionTitle}]
                            </span>
                          )}
                          {highlightMatch(item.snippet, query)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
