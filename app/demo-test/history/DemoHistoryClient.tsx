'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { DemoTestResult } from '../../../lib/data';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

interface Props {
  results: { fileName: string; result: DemoTestResult }[];
}

type Tab = 'history' | 'chapters';

export default function DemoHistoryClient({ results: initialResults }: Props) {
  const [results, setResults] = useState(initialResults);
  const [activeTab, setActiveTab] = useState<Tab>('history');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleDelete = async (fileName: string) => {
    if (!confirm('Delete this result?')) return;
    setDeleting(fileName);
    try {
      const res = await fetch('/api/demo-test/delete-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName }),
      });
      if (res.ok) {
        setResults((prev) => prev.filter((r) => r.fileName !== fileName));
      }
    } catch { /* ignore */ }
    setDeleting(null);
  };

  // Aggregate stats
  const totalTests = results.length;
  const avgScore = totalTests > 0
    ? Math.round(results.reduce((sum, r) => sum + r.result.scoreRate, 0) / totalTests * 10) / 10
    : 0;
  const bestScore = totalTests > 0
    ? Math.max(...results.map((r) => r.result.scoreRate))
    : 0;

  // Chapter stats
  const chapterMap = new Map<string, { total: number; correct: number }>();
  for (const { result } of results) {
    for (const ans of result.answers) {
      const stat = chapterMap.get(ans.chapter) || { total: 0, correct: 0 };
      stat.total++;
      if (ans.isCorrect) stat.correct++;
      chapterMap.set(ans.chapter, stat);
    }
  }
  const chapterStats = [...chapterMap.entries()]
    .map(([ch, stat]) => ({
      chapter: ch,
      total: stat.total,
      correct: stat.correct,
      rate: Math.round((stat.correct / stat.total) * 1000) / 10,
    }))
    .sort((a, b) => a.chapter.localeCompare(b.chapter));

  const tabs: { key: Tab; label: string }[] = [
    { key: 'history', label: 'History' },
    { key: 'chapters', label: 'Chapters' },
  ];

  return (
    <main style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Link href="/demo-test" style={{ color: 'var(--color-4)', marginBottom: '2rem', display: 'inline-block' }}>
        &larr; Back to Demo Test
      </Link>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
          Demo Test History
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Track your demo test results
        </p>
      </div>

      {/* Summary Cards */}
      {totalTests > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem', marginBottom: '2.5rem',
        }}>
          <SummaryCard label="Total Tests" value={totalTests.toString()} color="var(--color-4)" />
          <SummaryCard label="Average Score" value={`${avgScore}%`} color="var(--color-5)" />
          <SummaryCard label="Best Score" value={`${bestScore}%`} color="#059669" />
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{
        display: 'flex', gap: '0.25rem', marginBottom: '2rem',
        background: 'rgba(0, 0, 0, 0.04)', borderRadius: '12px', padding: '0.25rem',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, padding: '0.7rem 1rem', borderRadius: '10px', border: 'none',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
              transition: 'all 0.2s ease',
              background: activeTab === tab.key ? 'var(--color-4)' : 'transparent',
              color: activeTab === tab.key ? 'white' : 'var(--text-muted)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* History Tab */}
      {activeTab === 'history' && (
        results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No demo test results yet</p>
            <p>Complete a demo test to see your history here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {results.map(({ fileName, result }) => {
              const isExpanded = expanded === fileName;
              // Chapter breakdown for this result
              const chBreakdown = new Map<string, { total: number; correct: number }>();
              result.answers.forEach((ans) => {
                const s = chBreakdown.get(ans.chapter) || { total: 0, correct: 0 };
                s.total++;
                if (ans.isCorrect) s.correct++;
                chBreakdown.set(ans.chapter, s);
              });

              return (
                <div key={fileName} className="glass" style={{
                  borderRadius: '14px', overflow: 'hidden',
                }}>
                  <div
                    onClick={() => setExpanded(isExpanded ? null : fileName)}
                    style={{
                      padding: '1.5rem 2rem',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      flexWrap: 'wrap', gap: '1rem', cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                          background: 'rgba(142, 68, 173, 0.08)', color: 'var(--color-5)',
                          padding: '0.15rem 0.6rem', borderRadius: '999px',
                          fontSize: '0.75rem', fontWeight: 600,
                        }}>
                          {result.questionCount}Q
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Ch.{result.chapters.join(', ')}
                        </span>
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {formatDate(result.completedAt)} &middot; {formatDuration(result.duration)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: '1.5rem', fontWeight: 700,
                          color: result.scoreRate >= 67 ? '#059669' : '#DC2626',
                        }}>
                          {result.score}/{result.questionCount}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {result.scoreRate}%
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.7rem', color: 'var(--text-muted)',
                        transition: 'transform 0.2s',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                      }}>
                        &#9660;
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{
                      padding: '0 2rem 1.5rem',
                      borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                      paddingTop: '1rem',
                    }}>
                      {/* Chapter breakdown */}
                      <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                        gap: '0.5rem', marginBottom: '1rem',
                      }}>
                        {[...chBreakdown.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([ch, stat]) => {
                          const rate = Math.round((stat.correct / stat.total) * 100);
                          return (
                            <div key={ch} style={{
                              padding: '0.5rem', borderRadius: '8px', textAlign: 'center',
                              background: rate >= 70 ? 'rgba(5, 150, 105, 0.06)' : 'rgba(220, 38, 38, 0.06)',
                              border: `1px solid ${rate >= 70 ? 'rgba(5, 150, 105, 0.15)' : 'rgba(220, 38, 38, 0.15)'}`,
                            }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ch.{ch}</div>
                              <div style={{
                                fontSize: '0.95rem', fontWeight: 700,
                                color: rate >= 70 ? '#059669' : '#DC2626',
                              }}>
                                {stat.correct}/{stat.total}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(fileName); }}
                        disabled={deleting === fileName}
                        style={{
                          padding: '0.4rem 1rem', borderRadius: '8px',
                          border: '1px solid rgba(220, 38, 38, 0.2)',
                          background: 'rgba(220, 38, 38, 0.04)',
                          color: '#DC2626', fontSize: '0.8rem', fontWeight: 600,
                          cursor: deleting === fileName ? 'wait' : 'pointer',
                          opacity: deleting === fileName ? 0.5 : 1,
                        }}
                      >
                        {deleting === fileName ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Chapters Tab */}
      {activeTab === 'chapters' && (
        chapterStats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No data yet</p>
            <p>Complete a demo test to see chapter analytics here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {chapterStats.map((stat) => {
              const maxTotal = Math.max(...chapterStats.map((s) => s.total));
              const barWidth = (stat.total / maxTotal) * 100;
              const fillWidth = stat.total > 0 ? (stat.correct / stat.total) * 100 : 0;
              const passed = stat.rate >= 66.7;

              return (
                <div key={stat.chapter} className="glass" style={{ padding: '1.25rem 1.5rem', borderRadius: '12px' }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '0.6rem',
                  }}>
                    <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                      Chapter {stat.chapter}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {stat.correct} / {stat.total}
                      </span>
                      <span style={{
                        fontWeight: 700, fontSize: '0.9rem',
                        color: passed ? '#059669' : '#DC2626',
                        minWidth: '45px', textAlign: 'right',
                      }}>
                        {stat.rate}%
                      </span>
                    </div>
                  </div>
                  <div style={{
                    width: `${barWidth}%`, height: '8px', borderRadius: '4px',
                    background: 'rgba(0, 0, 0, 0.06)', overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${fillWidth}%`, height: '100%', borderRadius: '4px',
                      background: passed
                        ? 'linear-gradient(90deg, #059669, #10B981)'
                        : 'linear-gradient(90deg, #DC2626, #EF4444)',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </main>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="glass" style={{ padding: '1.25rem', borderRadius: '14px', textAlign: 'center' }}>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, color, marginBottom: '0.25rem' }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}
