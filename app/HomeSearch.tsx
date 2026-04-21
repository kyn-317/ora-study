'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type MatchType = 'title' | 'keyword' | 'content' | 'sql';

interface SearchResult {
  chapterId: string;
  studyId: string;
  title: string;
  chapter: string;
  sectionTitle: string | null;
  matchType: MatchType;
  snippet: string;
}

interface SearchResponse {
  results: SearchResult[];
  total?: number;
}

const FILTERS: { id: MatchType | 'all'; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'title', label: '제목' },
  { id: 'keyword', label: '키워드' },
  { id: 'content', label: '본문' },
  { id: 'sql', label: 'SQL' },
];

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlight(text: string, q: string) {
  if (!q) return text;
  const re = new RegExp(`(${escapeRegex(q)})`, 'ig');
  const parts = text.split(re);
  return parts.map((part, i) =>
    re.test(part) ? <mark key={i}>{part}</mark> : part,
  );
}

export default function HomeSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<MatchType | 'all'>('all');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data: SearchResponse = await res.json();
      setResults(data.results ?? []);
      setTotal(data.total ?? data.results?.length ?? 0);
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (v: string) => {
    setQuery(v);
    setActive(0);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebounced(v);
      runSearch(v);
    }, 220);
  };

  const clear = () => {
    setQuery('');
    setDebounced('');
    setResults([]);
    setTotal(0);
    setActive(0);
    inputRef.current?.focus();
  };

  const filtered = useMemo(() => {
    if (filter === 'all') return results;
    return results.filter(r => r.matchType === filter);
  }, [results, filter]);

  const preview = filtered.slice(0, 12);

  const grouped = useMemo(() => {
    const g: Record<string, SearchResult[]> = {};
    preview.forEach(r => {
      const key = `Ch.${r.chapterId} · ${r.chapter}`;
      (g[key] = g[key] || []).push(r);
    });
    return g;
  }, [preview]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(i => Math.min(i + 1, preview.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (preview[active]) {
        const r = preview[active];
        router.push(`/${r.chapterId}/${r.studyId}`);
        setOpen(false);
      } else if (query.trim().length >= 2) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div className="search-box" ref={boxRef}>
      <div className="search">
        <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="10.5" cy="10.5" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20L15.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="개념 · 키워드 · SQL 검색…"
          aria-label="학습자료 검색"
        />
        {query && (
          <button className="clear" onClick={clear} aria-label="Clear">✕</button>
        )}
        <kbd>⌘K</kbd>
      </div>

      <div className="filter-row">
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`filter-chip${filter === f.id ? ' on' : ''}`}
            onClick={() => setFilter(f.id)}
            type="button"
          >
            {f.label}
          </button>
        ))}
      </div>

      {showDropdown && (
        <div className="search-results">
          {loading && preview.length === 0 && (
            <div className="empty">검색 중…</div>
          )}
          {!loading && preview.length === 0 && (
            <div className="empty">&quot;{debounced || query}&quot; 결과 없음</div>
          )}
          {!loading && preview.length > 0 && (
            <>
              {Object.entries(grouped).map(([g, items]) => (
                <div key={g}>
                  <div className="group-label">{g}</div>
                  {items.map((r) => {
                    const idx = preview.indexOf(r);
                    return (
                      <a
                        key={`${r.chapterId}-${r.studyId}-${idx}`}
                        href={`/${r.chapterId}/${r.studyId}`}
                        className={`row${idx === active ? ' active' : ''}`}
                        onMouseEnter={() => setActive(idx)}
                      >
                        <div className="row-main">
                          <div className="row-title">{highlight(r.title, query)}</div>
                          <div className="row-snippet">
                            {r.sectionTitle && (
                              <span className="row-section">[{r.sectionTitle}]</span>
                            )}
                            {highlight(r.snippet, query)}
                          </div>
                        </div>
                        <span className={`kind ${r.matchType}`}>{r.matchType}</span>
                      </a>
                    );
                  })}
                </div>
              ))}
              {total > preview.length && (
                <a className="more" href={`/search?q=${encodeURIComponent(query.trim())}`}>
                  전체 {total}건 결과 보기 →
                </a>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
