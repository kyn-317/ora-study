'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';
import type { WrongNoteItem } from './page';

type SortMode = 'wrongCount' | 'recent';
type FilterChapter = 'all' | string;

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function NoteCard({ item, onSaveMemo }: { item: WrongNoteItem; onSaveMemo: (id: string, memo: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [memo, setMemo] = useState(item.memo);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSaveMemo(item.questionId, memo);
    setSaving(false);
    setEditing(false);
  };

  const wrongRate = Math.round((item.wrongCount / item.totalAttempts) * 100);

  return (
    <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden' }}>
      {/* Header - always visible */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.questionId}</span>
          <span style={{
            padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600,
            background: wrongRate === 100 ? 'rgba(248, 113, 113, 0.2)' : 'rgba(251, 191, 36, 0.2)',
            color: wrongRate === 100 ? '#f87171' : '#fbbf24',
          }}>
            {item.wrongCount}/{item.totalAttempts} wrong
          </span>
          {item.memo && (
            <span style={{
              padding: '0.1rem 0.4rem', borderRadius: '999px', fontSize: '0.65rem',
              fontWeight: 600, background: 'rgba(67, 171, 240, 0.15)', color: 'var(--color-4)',
            }}>
              memo
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {item.lastWrongAt && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {formatDate(item.lastWrongAt)}
            </span>
          )}
          <span style={{
            fontSize: '0.7rem', color: 'var(--text-muted)',
            transition: 'transform 0.2s',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
          }}>
            &#9660;
          </span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && item.question && (
        <div style={{
          padding: '0 1.5rem 1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '1.25rem',
        }}>
          {/* Question text */}
          <p style={{ fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1rem' }}>
            {item.question.title}
          </p>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
            {item.question.options.map((opt) => {
              const letter = opt.match(/^([A-E])\)/)?.[1] || '';
              const isAnswer = item.question!.answer.includes(letter);
              return (
                <div key={letter} style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  background: isAnswer ? 'rgba(52, 211, 153, 0.08)' : 'rgba(255,255,255,0.03)',
                  border: isAnswer ? '1px solid rgba(52, 211, 153, 0.25)' : '1px solid rgba(255,255,255,0.06)',
                  color: isAnswer ? '#6ee7b7' : 'var(--foreground)',
                }}>
                  {isAnswer && <span style={{ color: '#34d399', marginRight: '0.5rem' }}>&#10003;</span>}
                  {opt}
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          {item.question.explanation && (
            <details style={{ marginBottom: '1rem' }}>
              <summary style={{ color: 'var(--color-5)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                View Explanation
              </summary>
              <div style={{
                marginTop: '0.75rem', padding: '1rem',
                background: 'rgba(111, 107, 234, 0.08)',
                borderRadius: '10px', borderLeft: '4px solid var(--color-3)',
                fontSize: '0.85rem', lineHeight: 1.7, whiteSpace: 'pre-wrap',
              }}>
                {item.question.explanation}
              </div>
            </details>
          )}

          {/* Memo section */}
          <div style={{
            padding: '1rem',
            borderRadius: '10px',
            background: 'rgba(67, 171, 240, 0.06)',
            border: '1px solid rgba(67, 171, 240, 0.15)',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '0.5rem',
            }}>
              <span style={{ color: 'var(--color-4)', fontWeight: 600, fontSize: '0.85rem' }}>
                My Note
              </span>
              {!editing && (
                <button
                  onClick={(e) => { e.stopPropagation(); setEditing(true); }}
                  style={{
                    padding: '0.3rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(67, 171, 240, 0.3)',
                    background: 'transparent', color: 'var(--color-4)', fontSize: '0.75rem',
                    cursor: 'pointer', fontWeight: 600,
                  }}
                >
                  {item.memo ? 'Edit' : 'Add Note'}
                </button>
              )}
            </div>

            {editing ? (
              <div>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Write your note here..."
                  style={{
                    width: '100%', minHeight: '80px', padding: '0.75rem',
                    borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(0,0,0,0.2)', color: 'var(--foreground)',
                    fontSize: '0.85rem', lineHeight: 1.6, resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => { setEditing(false); setMemo(item.memo); }}
                    style={{
                      padding: '0.35rem 1rem', borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                      color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      padding: '0.35rem 1rem', borderRadius: '6px', border: 'none',
                      background: 'linear-gradient(135deg, var(--color-2), var(--color-3))',
                      color: 'white', fontSize: '0.8rem', cursor: saving ? 'wait' : 'pointer',
                      fontWeight: 600, opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: memo ? 'var(--foreground)' : 'var(--text-muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {memo || 'No note yet.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WrongNotesClient({ items }: { items: WrongNoteItem[] }) {
  const [sortMode, setSortMode] = useState<SortMode>('wrongCount');
  const [filterChapter, setFilterChapter] = useState<FilterChapter>('all');
  const [filterMemoOnly, setFilterMemoOnly] = useState(false);
  const [localItems, setLocalItems] = useState(items);

  const chapters = [...new Set(items.map((i) => i.chapter))].sort();

  const handleSaveMemo = useCallback(async (questionId: string, memo: string) => {
    try {
      const res = await fetch('/api/mock-exam/wrong-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, memo }),
      });
      if (res.ok) {
        setLocalItems((prev) =>
          prev.map((item) =>
            item.questionId === questionId
              ? { ...item, memo: memo.trim(), memoUpdatedAt: new Date().toISOString() }
              : item,
          ),
        );
      }
    } catch { /* ignore */ }
  }, []);

  // Filter
  let filtered = localItems;
  if (filterChapter !== 'all') {
    filtered = filtered.filter((i) => i.chapter === filterChapter);
  }
  if (filterMemoOnly) {
    filtered = filtered.filter((i) => i.memo);
  }

  // Sort
  if (sortMode === 'wrongCount') {
    filtered = [...filtered].sort((a, b) => b.wrongCount - a.wrongCount);
  } else {
    filtered = [...filtered].sort((a, b) => b.lastWrongAt.localeCompare(a.lastWrongAt));
  }

  // Group by chapter
  const byChapter = new Map<string, typeof filtered>();
  for (const item of filtered) {
    const list = byChapter.get(item.chapter) || [];
    list.push(item);
    byChapter.set(item.chapter, list);
  }

  return (
    <main style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
      <Link href="/mock-exam" style={{ color: 'var(--color-4)', marginBottom: '2rem', display: 'inline-block' }}>
        &larr; Back to Mock Exam
      </Link>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
          Wrong Notes
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Review wrong answers and add personal notes
        </p>
      </div>

      {/* Summary */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1rem', marginBottom: '2rem',
      }}>
        <div className="glass" style={{ padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f87171' }}>{items.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wrong Questions</div>
        </div>
        <div className="glass" style={{ padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-4)' }}>
            {items.filter((i) => i.memo).length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>With Notes</div>
        </div>
        <div className="glass" style={{ padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-5)' }}>{chapters.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chapters</div>
        </div>
      </div>

      {/* Filters & Sort */}
      <div style={{
        display: 'flex', gap: '0.75rem', marginBottom: '2rem',
        flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* Sort */}
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          style={{
            padding: '0.5rem 1rem', borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(30, 31, 41, 0.6)', color: 'var(--foreground)',
            fontSize: '0.85rem', cursor: 'pointer',
          }}
        >
          <option value="wrongCount">Sort: Most Wrong</option>
          <option value="recent">Sort: Most Recent</option>
        </select>

        {/* Chapter filter */}
        <select
          value={filterChapter}
          onChange={(e) => setFilterChapter(e.target.value)}
          style={{
            padding: '0.5rem 1rem', borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(30, 31, 41, 0.6)', color: 'var(--foreground)',
            fontSize: '0.85rem', cursor: 'pointer',
          }}
        >
          <option value="all">All Chapters</option>
          {chapters.map((ch) => (
            <option key={ch} value={ch}>Chapter {ch}</option>
          ))}
        </select>

        {/* Memo filter */}
        <button
          onClick={() => setFilterMemoOnly(!filterMemoOnly)}
          style={{
            padding: '0.5rem 1rem', borderRadius: '8px',
            border: filterMemoOnly ? '1px solid rgba(67, 171, 240, 0.4)' : '1px solid rgba(255,255,255,0.1)',
            background: filterMemoOnly ? 'rgba(67, 171, 240, 0.15)' : 'rgba(30, 31, 41, 0.6)',
            color: filterMemoOnly ? 'var(--color-4)' : 'var(--foreground)',
            fontSize: '0.85rem', cursor: 'pointer', fontWeight: filterMemoOnly ? 600 : 400,
          }}
        >
          With Notes Only
        </button>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {filtered.length} question{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No wrong answers yet</p>
          <p>Complete a mock exam to see your wrong answers here.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <p>No questions match the current filter.</p>
        </div>
      ) : (
        /* Question list grouped by chapter */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {[...byChapter.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([chapter, questions]) => (
            <div key={chapter}>
              <h3 style={{
                color: 'var(--color-4)', fontSize: '0.95rem', fontWeight: 600,
                marginBottom: '0.75rem',
              }}>
                Chapter {chapter} ({questions.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {questions.map((item) => (
                  <NoteCard key={item.questionId} item={item} onSaveMemo={handleSaveMemo} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
