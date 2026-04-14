'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import type { AnalyticsData, ChapterStat, SetStat, WeakQuestion, TimelinePoint } from './page';
import type { ExamResult } from '../../../lib/data';

type Tab = 'history' | 'chapters' | 'trends' | 'weak';

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

// ── Tab: History List ──

function HistoryTab({ results }: { results: { fileName: string; result: ExamResult }[] }) {
  if (results.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No exam results yet</p>
        <p>Complete a mock exam to see your history here.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {results.map(({ fileName, result }) => {
        const passed = result.scoreRate >= 70;
        return (
          <div key={fileName} className="glass" style={{
            padding: '1.5rem 2rem',
            borderRadius: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            borderColor: passed ? 'rgba(5, 150, 105, 0.2)' : 'rgba(220, 38, 38, 0.2)',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="text-gradient-alt" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  Set {result.examSet}
                </span>
                <span style={{
                  padding: '0.15rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: passed ? 'rgba(5, 150, 105, 0.08)' : 'rgba(220, 38, 38, 0.08)',
                  color: passed ? '#059669' : '#DC2626',
                }}>
                  {passed ? 'PASS' : 'FAIL'}
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
                  color: passed ? '#059669' : '#DC2626',
                }}>
                  {result.score}/{result.totalQuestions}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {result.scoreRate}%
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: Chapter Stats ──

function ChaptersTab({ chapterStats }: { chapterStats: ChapterStat[] }) {
  if (chapterStats.length === 0) {
    return <EmptyState />;
  }

  const maxTotal = Math.max(...chapterStats.map((s) => s.total));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {chapterStats.map((stat) => {
        const barWidth = (stat.total / maxTotal) * 100;
        const fillWidth = stat.total > 0 ? (stat.correct / stat.total) * 100 : 0;
        const passed = stat.rate >= 70;

        return (
          <div key={stat.chapter} className="glass" style={{
            padding: '1.25rem 1.5rem',
            borderRadius: '12px',
          }}>
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
              width: `${barWidth}%`,
              height: '8px',
              borderRadius: '4px',
              background: 'rgba(0, 0, 0, 0.06)',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${fillWidth}%`,
                height: '100%',
                borderRadius: '4px',
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
  );
}

// ── Timeline Chart (SVG) ──

const SET_COLORS: Record<number, string> = {
  1: '#2980B9', // color-4 blue
  2: '#8E44AD', // color-5 purple
  3: '#059669', // green
  4: '#D97706', // amber
  5: '#DC2626', // red
};

function TimelineChart({ timeline }: { timeline: TimelinePoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (timeline.length < 2) return null;

  const W = 700;
  const H = 250;
  const PAD = { top: 30, right: 30, bottom: 50, left: 45 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  // X: index-based (equal spacing)
  const xScale = (i: number) => PAD.left + (i / (timeline.length - 1)) * plotW;
  // Y: 0–100%
  const yScale = (v: number) => PAD.top + plotH - (v / 100) * plotH;

  // Data points
  const points = timeline.map((p, i) => ({ x: xScale(i), y: yScale(p.scoreRate), ...p, idx: i }));

  // Moving average line
  const maPoints = timeline
    .map((p, i) => (p.movingAvg !== null ? { x: xScale(i), y: yScale(p.movingAvg) } : null))
    .filter(Boolean) as { x: number; y: number }[];
  const maPath = maPoints.length >= 2
    ? maPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
    : '';

  // Y-axis ticks
  const yTicks = [0, 25, 50, 70, 100];

  // X-axis labels (show a few dates)
  const labelCount = Math.min(timeline.length, 6);
  const labelIndices: number[] = [];
  for (let i = 0; i < labelCount; i++) {
    labelIndices.push(Math.round((i / (labelCount - 1)) * (timeline.length - 1)));
  }

  return (
    <div className="glass" style={{ padding: '1.5rem', borderRadius: '14px', marginBottom: '1.5rem', overflowX: 'auto' }}>
      <h3 style={{ color: 'var(--color-4)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>
        Score Timeline
      </h3>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
        {/* Grid lines */}
        {yTicks.map((v) => (
          <line
            key={v}
            x1={PAD.left}
            y1={yScale(v)}
            x2={W - PAD.right}
            y2={yScale(v)}
            stroke={v === 70 ? 'rgba(5, 150, 105, 0.3)' : 'rgba(0, 0, 0, 0.06)'}
            strokeDasharray={v === 70 ? '6 4' : 'none'}
          />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((v) => (
          <text
            key={v}
            x={PAD.left - 8}
            y={yScale(v) + 4}
            textAnchor="end"
            fill={v === 70 ? '#059669' : 'rgba(0, 0, 0, 0.4)'}
            fontSize="11"
          >
            {v}%
          </text>
        ))}

        {/* X-axis labels */}
        {labelIndices.map((i) => {
          const d = new Date(timeline[i].completedAt);
          const label = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
          return (
            <text
              key={i}
              x={xScale(i)}
              y={H - PAD.bottom + 20}
              textAnchor="middle"
              fill="rgba(0, 0, 0, 0.4)"
              fontSize="11"
            >
              {label}
            </text>
          );
        })}

        {/* Connecting lines between points (by exam set color) */}
        {points.map((p, i) => {
          if (i === 0) return null;
          const prev = points[i - 1];
          return (
            <line
              key={`line-${i}`}
              x1={prev.x}
              y1={prev.y}
              x2={p.x}
              y2={p.y}
              stroke="rgba(0, 0, 0, 0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Moving average line */}
        {maPath && (
          <path
            d={maPath}
            fill="none"
            stroke="rgba(217, 119, 6, 0.5)"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
        )}

        {/* Data points */}
        {points.map((p) => (
          <circle
            key={p.idx}
            cx={p.x}
            cy={p.y}
            r={hovered === p.idx ? 7 : 5}
            fill={SET_COLORS[p.examSet] || '#2980B9'}
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="1.5"
            style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
            onMouseEnter={() => setHovered(p.idx)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}

        {/* Tooltip */}
        {hovered !== null && (() => {
          const p = points[hovered];
          const d = new Date(p.completedAt);
          const dateStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
          const lines = [`Set ${p.examSet}`, `${p.scoreRate}%`, dateStr];
          const tipW = 130;
          const tipH = 56;
          const tipX = Math.min(p.x - tipW / 2, W - PAD.right - tipW);
          const tipY = p.y - tipH - 12;

          return (
            <g>
              <rect
                x={Math.max(PAD.left, tipX)}
                y={tipY}
                width={tipW}
                height={tipH}
                rx="8"
                fill="rgba(255, 255, 255, 0.95)"
                stroke="rgba(0, 0, 0, 0.1)"
              />
              {lines.map((line, i) => (
                <text
                  key={i}
                  x={Math.max(PAD.left, tipX) + tipW / 2}
                  y={tipY + 16 + i * 16}
                  textAnchor="middle"
                  fill={i === 0 ? SET_COLORS[p.examSet] || '#2980B9' : i === 1 ? '#1A1A2E' : 'rgba(0, 0, 0, 0.4)'}
                  fontSize={i === 1 ? '13' : '11'}
                  fontWeight={i <= 1 ? '600' : '400'}
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })()}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
        {[...new Set(timeline.map((p) => p.examSet))].sort().map((setId) => (
          <div key={setId} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: SET_COLORS[setId] || '#2980B9',
            }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Set {setId}</span>
          </div>
        ))}
        {maPath && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{
              width: '16px', height: '2px',
              background: 'rgba(217, 119, 6, 0.5)',
              borderTop: '1px dashed rgba(217, 119, 6, 0.5)',
            }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>3-exam avg</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab: Score Trends ──

function TrendsTab({ setStats, timeline }: { setStats: SetStat[]; timeline: TimelinePoint[] }) {
  if (setStats.length === 0) {
    return <EmptyState />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <TimelineChart timeline={timeline} />
      {setStats.map((stat) => (
        <div key={stat.examSet} className="glass" style={{
          padding: '1.5rem 2rem',
          borderRadius: '14px',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '1rem',
          }}>
            <span className="text-gradient-alt" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
              Set {stat.examSet}
            </span>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {stat.attempts.length} attempt{stat.attempts.length > 1 ? 's' : ''}
              </span>
              <span style={{
                fontWeight: 700, color: stat.bestRate >= 70 ? '#059669' : '#DC2626',
              }}>
                Best: {stat.bestRate}%
              </span>
            </div>
          </div>

          {/* Score timeline bar chart */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: '6px',
            height: '100px', padding: '0 0.5rem',
          }}>
            {stat.attempts.map((attempt, idx) => {
              const height = Math.max(attempt.scoreRate, 3);
              const passed = attempt.scoreRate >= 70;
              return (
                <div key={idx} style={{
                  flex: 1,
                  maxWidth: '60px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {attempt.scoreRate}%
                  </span>
                  <div style={{
                    width: '100%',
                    height: `${height}%`,
                    borderRadius: '4px 4px 0 0',
                    background: passed
                      ? 'linear-gradient(180deg, #059669, rgba(5, 150, 105, 0.3))'
                      : 'linear-gradient(180deg, #DC2626, rgba(220, 38, 38, 0.3))',
                    minHeight: '4px',
                  }} />
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                    #{idx + 1}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 70% pass line indicator */}
          {stat.attempts.length > 1 && (
            <div style={{
              marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)',
              borderTop: '1px dashed rgba(5, 150, 105, 0.2)', paddingTop: '0.3rem',
              textAlign: 'right',
            }}>
              Pass line: 70%
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Tab: Weak Questions ──

function WeakQuestionCard({ q }: { q: WeakQuestion }) {
  const [expanded, setExpanded] = useState(false);
  const patternEntries = Object.entries(q.selectedPattern).sort(([, a], [, b]) => b - a);
  const maxCount = patternEntries.length > 0 ? patternEntries[0][1] : 1;

  return (
    <div className="glass" style={{
      borderRadius: '10px',
      overflow: 'hidden',
      borderColor: q.alwaysSameWrong ? 'rgba(220, 38, 38, 0.15)' : undefined,
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{q.questionId}</span>
          {q.alwaysSameWrong && (
            <span style={{
              padding: '0.1rem 0.45rem', borderRadius: '999px', fontSize: '0.65rem',
              fontWeight: 600, background: 'rgba(220, 38, 38, 0.08)', color: '#DC2626',
            }}>
              same wrong
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {q.wrongCount} / {q.totalAttempts} wrong
          </span>
          <span style={{
            padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
            background: q.wrongRate === 100 ? 'rgba(220, 38, 38, 0.15)' : 'rgba(217, 119, 6, 0.15)',
            color: q.wrongRate === 100 ? '#DC2626' : '#D97706',
          }}>
            {q.wrongRate}%
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>
            &#9660;
          </span>
        </div>
      </div>

      {expanded && (
        <div style={{
          padding: '0 1.25rem 1.25rem',
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          paddingTop: '1rem',
        }}>
          {/* Correct answer */}
          <div style={{ marginBottom: '0.75rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Correct: </span>
            <span style={{ color: '#059669', fontWeight: 600 }}>{q.correctAnswer.join(', ')}</span>
          </div>

          {/* Wrong selection frequency */}
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Wrong selections (when incorrect):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {patternEntries.map(([letter, count]) => {
              const isCorrect = q.correctAnswer.includes(letter);
              const barPct = (count / maxCount) * 100;
              return (
                <div key={letter} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{
                    width: '20px', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center',
                    color: isCorrect ? '#059669' : '#DC2626',
                  }}>
                    {letter}
                  </span>
                  <div style={{
                    flex: 1, height: '6px', borderRadius: '3px',
                    background: 'rgba(0, 0, 0, 0.06)', overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${barPct}%`, height: '100%', borderRadius: '3px',
                      background: isCorrect
                        ? 'linear-gradient(90deg, #059669, #10B981)'
                        : 'linear-gradient(90deg, #DC2626, #EF4444)',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '30px', textAlign: 'right' }}>
                    {count}x
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function WeakTab({ weakQuestions }: { weakQuestions: WeakQuestion[] }) {
  if (weakQuestions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No weak questions detected</p>
        <p>Questions you get wrong 2 or more times will appear here.</p>
      </div>
    );
  }

  // Group by chapter
  const byChapter = new Map<string, WeakQuestion[]>();
  for (const q of weakQuestions) {
    const list = byChapter.get(q.chapter) || [];
    list.push(q);
    byChapter.set(q.chapter, list);
  }

  // Summary: count questions with always-same-wrong pattern
  const sameWrongCount = weakQuestions.filter((q) => q.alwaysSameWrong).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass" style={{
        padding: '1rem 1.5rem', borderRadius: '12px',
        background: 'rgba(220, 38, 38, 0.04)',
        borderColor: 'rgba(220, 38, 38, 0.08)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem',
      }}>
        <span style={{ color: '#EF4444', fontSize: '0.9rem' }}>
          {weakQuestions.length} question{weakQuestions.length > 1 ? 's' : ''} wrong 2+ times
        </span>
        {sameWrongCount > 0 && (
          <span style={{ color: '#DC2626', fontSize: '0.8rem' }}>
            {sameWrongCount} always same wrong answer
          </span>
        )}
      </div>

      {[...byChapter.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([chapter, questions]) => (
        <div key={chapter}>
          <h3 style={{
            color: 'var(--color-4)', fontSize: '0.9rem', fontWeight: 600,
            marginBottom: '0.5rem',
          }}>
            Chapter {chapter} ({questions.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {questions.map((q) => (
              <WeakQuestionCard key={q.questionId} q={q} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty State ──

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
      <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No data yet</p>
      <p>Complete a mock exam to see analytics here.</p>
    </div>
  );
}

// ── Main Component ──

const tabs: { key: Tab; label: string }[] = [
  { key: 'history', label: 'History' },
  { key: 'chapters', label: 'Chapters' },
  { key: 'trends', label: 'Trends' },
  { key: 'weak', label: 'Weak Points' },
];

export default function HistoryClient({ analytics }: { analytics: AnalyticsData }) {
  const [activeTab, setActiveTab] = useState<Tab>('history');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    window.location.href = '/api/mock-exam/download-results';
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadMsg(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const res = await fetch('/api/mock-exam/upload-results', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        const parts: string[] = [];
        if (data.uploaded.length > 0) parts.push(`${data.uploaded.length} uploaded`);
        if (data.skipped.length > 0) parts.push(`${data.skipped.length} skipped`);
        setUploadMsg({ type: 'ok', text: parts.join(', ') });
        if (data.uploaded.length > 0) {
          setTimeout(() => window.location.reload(), 1500);
        }
      } else {
        setUploadMsg({ type: 'err', text: data.error || 'Upload failed' });
      }
    } catch {
      setUploadMsg({ type: 'err', text: 'Network error' });
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <main style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Link href="/mock-exam" style={{ color: 'var(--color-4)', marginBottom: '2rem', display: 'inline-block' }}>
        &larr; Back to Mock Exam
      </Link>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
          Analytics Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Track your progress and identify weak areas
        </p>
      </div>

      {/* Wrong Notes link */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <Link href="/mock-exam/wrong-notes" style={{
          display: 'inline-block',
          padding: '0.6rem 1.5rem',
          borderRadius: '10px',
          border: '1px solid rgba(220, 38, 38, 0.15)',
          background: 'rgba(245, 246, 250, 0.9)',
          color: '#EF4444',
          fontWeight: 600,
          fontSize: '0.85rem',
        }}>
          Wrong Notes &rarr;
        </Link>
      </div>

      {/* Download / Upload */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '0.75rem',
        marginBottom: '2.5rem', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <button
          onClick={handleDownload}
          disabled={analytics.totalExams === 0}
          style={{
            padding: '0.6rem 1.5rem',
            borderRadius: '10px',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            background: 'rgba(245, 246, 250, 0.9)',
            color: analytics.totalExams === 0 ? 'var(--text-muted)' : 'var(--color-4)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: analytics.totalExams === 0 ? 'not-allowed' : 'pointer',
            opacity: analytics.totalExams === 0 ? 0.5 : 1,
          }}
        >
          Download All (.zip)
        </button>

        <label style={{
          padding: '0.6rem 1.5rem',
          borderRadius: '10px',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          background: 'rgba(245, 246, 250, 0.9)',
          color: uploading ? 'var(--text-muted)' : 'var(--color-5)',
          fontWeight: 600,
          fontSize: '0.85rem',
          cursor: uploading ? 'wait' : 'pointer',
        }}>
          {uploading ? 'Uploading...' : 'Upload JSON'}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>

        {uploadMsg && (
          <span style={{
            fontSize: '0.8rem',
            color: uploadMsg.type === 'ok' ? '#059669' : '#DC2626',
          }}>
            {uploadMsg.text}
          </span>
        )}
      </div>

      {/* Summary Cards */}
      {analytics.totalExams > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}>
          <SummaryCard label="Total Exams" value={analytics.totalExams.toString()} color="var(--color-4)" />
          <SummaryCard label="Average Score" value={`${analytics.averageScore}%`} color="var(--color-5)" />
          <SummaryCard label="Best Score" value={`${analytics.bestScore}%`} color="#059669" />
          <SummaryCard
            label="Pass Rate"
            value={`${Math.round((analytics.passCount / analytics.totalExams) * 100)}%`}
            color="var(--color-3)"
          />
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{
        display: 'flex', gap: '0.25rem',
        marginBottom: '2rem',
        background: 'rgba(0, 0, 0, 0.04)',
        borderRadius: '12px',
        padding: '0.25rem',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '0.7rem 1rem',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all 0.2s ease',
              background: activeTab === tab.key
                ? 'var(--color-4)'
                : 'transparent',
              color: activeTab === tab.key ? 'white' : 'var(--text-muted)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'history' && <HistoryTab results={analytics.results} />}
      {activeTab === 'chapters' && <ChaptersTab chapterStats={analytics.chapterStats} />}
      {activeTab === 'trends' && <TrendsTab setStats={analytics.setStats} timeline={analytics.timeline} />}
      {activeTab === 'weak' && <WeakTab weakQuestions={analytics.weakQuestions} />}
    </main>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="glass" style={{
      padding: '1.25rem',
      borderRadius: '14px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, color, marginBottom: '0.25rem' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}
