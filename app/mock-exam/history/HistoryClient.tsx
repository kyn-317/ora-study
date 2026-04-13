'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import type { AnalyticsData, ChapterStat, SetStat, WeakQuestion } from './page';
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
            borderColor: passed ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)',
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
                  background: passed ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                  color: passed ? '#34d399' : '#f87171',
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
                  color: passed ? '#34d399' : '#f87171',
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
                  color: passed ? '#34d399' : '#f87171',
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
              background: 'rgba(255, 255, 255, 0.06)',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${fillWidth}%`,
                height: '100%',
                borderRadius: '4px',
                background: passed
                  ? 'linear-gradient(90deg, #34d399, #6ee7b7)'
                  : 'linear-gradient(90deg, #f87171, #fca5a5)',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: Score Trends ──

function TrendsTab({ setStats }: { setStats: SetStat[] }) {
  if (setStats.length === 0) {
    return <EmptyState />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                fontWeight: 700, color: stat.bestRate >= 70 ? '#34d399' : '#f87171',
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
                      ? 'linear-gradient(180deg, #34d399, rgba(52, 211, 153, 0.4))'
                      : 'linear-gradient(180deg, #f87171, rgba(248, 113, 113, 0.4))',
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
              borderTop: '1px dashed rgba(52, 211, 153, 0.3)', paddingTop: '0.3rem',
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass" style={{
        padding: '1rem 1.5rem', borderRadius: '12px',
        background: 'rgba(248, 113, 113, 0.06)',
        borderColor: 'rgba(248, 113, 113, 0.15)',
      }}>
        <span style={{ color: '#fca5a5', fontSize: '0.9rem' }}>
          {weakQuestions.length} question{weakQuestions.length > 1 ? 's' : ''} wrong 2+ times
        </span>
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
              <div key={q.questionId} className="glass" style={{
                padding: '1rem 1.25rem',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{q.questionId}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {q.wrongCount} / {q.totalAttempts} wrong
                  </span>
                  <span style={{
                    padding: '0.15rem 0.5rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: q.wrongRate === 100
                      ? 'rgba(248, 113, 113, 0.2)'
                      : 'rgba(251, 191, 36, 0.2)',
                    color: q.wrongRate === 100 ? '#f87171' : '#fbbf24',
                  }}>
                    {q.wrongRate}%
                  </span>
                </div>
              </div>
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
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(30, 31, 41, 0.6)',
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
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(30, 31, 41, 0.6)',
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
            color: uploadMsg.type === 'ok' ? '#34d399' : '#f87171',
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
          <SummaryCard label="Best Score" value={`${analytics.bestScore}%`} color="#34d399" />
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
        background: 'rgba(30, 31, 41, 0.4)',
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
                ? 'linear-gradient(135deg, var(--color-2), var(--color-3))'
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
      {activeTab === 'trends' && <TrendsTab setStats={analytics.setStats} />}
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
