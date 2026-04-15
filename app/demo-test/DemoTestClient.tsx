'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';
import type { QuizQuestion } from '../../lib/data';

// ── Shuffle utilities ──

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function shuffleOptions(q: QuizQuestion): QuizQuestion {
  const optionEntries = q.options.map((opt) => {
    const match = opt.match(/^([A-E])\)\s*/);
    return { letter: match ? match[1] : '', text: opt };
  });

  const shuffled = shuffleArray(optionEntries);
  const newLetters = ['A', 'B', 'C', 'D', 'E'];
  const letterMap = new Map<string, string>();
  shuffled.forEach((entry, i) => {
    if (entry.letter && i < newLetters.length) {
      letterMap.set(entry.letter, newLetters[i]);
    }
  });

  const newOptions = shuffled.map((entry, i) => {
    const newLetter = newLetters[i] || entry.letter;
    const textWithoutLetter = entry.text.replace(/^[A-E]\)\s*/, '');
    return `${newLetter}) ${textWithoutLetter}`;
  });

  const newAnswer = q.answer.map((a) => letterMap.get(a) || a);

  return { ...q, options: newOptions, answer: newAnswer };
}

// ── Types ──

type Phase = 'setup' | 'taking' | 'review';

interface ChapterInfo {
  chapterId: string;
  chapterName: string;
  questionCount: number;
}

interface DemoTestClientProps {
  chapters: ChapterInfo[];
}

const QUESTION_COUNTS = [10, 20, 30];

export default function DemoTestClient({ chapters }: DemoTestClientProps) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [startedAt, setStartedAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleChapter = useCallback((chapterId: string) => {
    setSelectedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((c) => c !== chapterId)
        : [...prev, chapterId],
    );
  }, []);

  const selectAllChapters = useCallback(() => {
    setSelectedChapters((prev) =>
      prev.length === chapters.length ? [] : chapters.map((c) => c.chapterId),
    );
  }, [chapters]);

  const totalAvailable = chapters
    .filter((c) => selectedChapters.includes(c.chapterId))
    .reduce((sum, c) => sum + c.questionCount, 0);

  const handleStart = useCallback(async () => {
    if (selectedChapters.length === 0) return;
    setLoading(true);

    try {
      // Fetch questions for all selected chapters
      const allQuestions: QuizQuestion[] = [];
      for (const chapterId of selectedChapters) {
        const res = await fetch(`/api/demo-test/questions?chapter=${chapterId}`);
        if (res.ok) {
          const data = await res.json();
          allQuestions.push(...data);
        }
      }

      // Shuffle and pick
      const shuffled = shuffleArray(allQuestions);
      const picked = shuffled.slice(0, Math.min(questionCount, shuffled.length));
      const withShuffledOptions = picked.map(shuffleOptions);

      setQuestions(withShuffledOptions);
      setCurrentIndex(0);
      setAnswers({});
      setStartedAt(new Date().toISOString());
      setSaved(false);
      setPhase('taking');
    } catch {
      // ignore
    }
    setLoading(false);
  }, [selectedChapters, questionCount]);

  const handleOptionClick = useCallback((letter: string) => {
    if (phase !== 'taking') return;
    const q = questions[currentIndex];
    const isMulti = q.answer.length > 1;

    setAnswers((prev) => {
      const current = prev[currentIndex] ?? [];
      if (isMulti) {
        const next = current.includes(letter)
          ? current.filter((o) => o !== letter)
          : [...current, letter];
        return { ...prev, [currentIndex]: next };
      }
      return { ...prev, [currentIndex]: [letter] };
    });
  }, [phase, questions, currentIndex]);

  const getOptionLetter = (option: string) => {
    const match = option.match(/^([A-E])\)/);
    return match ? match[1] : '';
  };

  const handleFinish = useCallback(async () => {
    setPhase('review');

    const completedAt = new Date().toISOString();
    const duration = Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000);

    let totalScore = 0;
    const answerDetails = questions.map((q, idx) => {
      const selected = answers[idx] ?? [];
      const correct = q.answer;
      const isCorrect =
        selected.length === correct.length &&
        [...selected].sort().every((v, i) => v === [...correct].sort()[i]);
      if (isCorrect) totalScore++;

      const chapterMatch = q.number.match(/^C_(\d+)_/);
      return {
        questionId: q.number,
        chapter: chapterMatch ? chapterMatch[1] : '00',
        selected,
        correct,
        isCorrect,
      };
    });

    const result = {
      chapters: selectedChapters,
      questionCount: questions.length,
      completedAt,
      duration,
      score: totalScore,
      scoreRate: Math.round((totalScore / questions.length) * 1000) / 10,
      answers: answerDetails,
    };

    setSaving(true);
    try {
      const res = await fetch('/api/demo-test/save-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      if (res.ok) setSaved(true);
    } catch { /* ignore */ }
    setSaving(false);
  }, [questions, answers, startedAt, selectedChapters]);

  const handleRetry = useCallback(() => {
    const shuffled = shuffleArray([...questions]);
    const withShuffledOptions = shuffled.map(shuffleOptions);
    setQuestions(withShuffledOptions);
    setCurrentIndex(0);
    setAnswers({});
    setStartedAt(new Date().toISOString());
    setSaved(false);
    setPhase('taking');
  }, [questions]);

  const handleNewSet = useCallback(() => {
    setPhase('setup');
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
  }, []);

  // ===== SETUP PHASE =====
  if (phase === 'setup') {
    return (
      <main style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <Link href="/" style={{ color: 'var(--color-4)', marginBottom: '2rem', display: 'inline-block' }}>
          &larr; Back to Home
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            Demo Test
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Select chapters and question count for a quick practice session
          </p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/demo-test/history" style={{
            display: 'inline-block',
            padding: '0.75rem 2rem',
            borderRadius: '12px',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            background: 'var(--surface)',
            color: 'var(--color-5)',
            fontWeight: 600,
            fontSize: '0.95rem',
          }}>
            History &rarr;
          </Link>
        </div>

        {/* Chapter Selection */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: 'var(--color-4)', fontSize: '1.3rem', margin: 0 }}>Select Chapters</h2>
            <button
              onClick={selectAllChapters}
              style={{
                padding: '0.4rem 1rem', borderRadius: '8px',
                border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
                color: 'var(--color-5)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
              }}
            >
              {selectedChapters.length === chapters.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {chapters.map((ch) => {
              const isSelected = selectedChapters.includes(ch.chapterId);
              return (
                <div
                  key={ch.chapterId}
                  onClick={() => toggleChapter(ch.chapterId)}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    border: isSelected
                      ? '2px solid var(--color-4)'
                      : '1px solid var(--glass-border)',
                    background: isSelected ? 'rgba(41, 128, 185, 0.08)' : 'var(--glass-bg)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontWeight: 600,
                      color: isSelected ? 'var(--color-4)' : 'var(--foreground)',
                      fontSize: '0.95rem',
                    }}>
                      Ch.{ch.chapterId}
                    </span>
                    <span style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      background: 'rgba(0,0,0,0.04)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                    }}>
                      {ch.questionCount}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {ch.chapterName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Question Count */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--color-4)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>Question Count</h2>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {QUESTION_COUNTS.map((count) => {
              const isActive = questionCount === count;
              const isDisabled = totalAvailable > 0 && totalAvailable < count;
              return (
                <button
                  key={count}
                  onClick={() => !isDisabled && setQuestionCount(count)}
                  style={{
                    padding: '1rem 2.5rem',
                    borderRadius: '12px',
                    border: isActive ? '2px solid var(--color-5)' : '1px solid var(--glass-border)',
                    background: isActive ? 'rgba(142, 68, 173, 0.08)' : 'var(--glass-bg)',
                    color: isDisabled ? 'var(--text-muted)' : isActive ? 'var(--color-5)' : 'var(--foreground)',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    fontWeight: 700, fontSize: '1.3rem',
                    opacity: isDisabled ? 0.4 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {count}
                </button>
              );
            })}
          </div>
          {selectedChapters.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Available: {totalAvailable} questions from {selectedChapters.length} chapter{selectedChapters.length > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Start Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleStart}
            disabled={selectedChapters.length === 0 || loading}
            style={{
              padding: '1rem 3rem',
              borderRadius: '12px',
              border: 'none',
              background: selectedChapters.length === 0 ? 'var(--text-muted)' : 'var(--color-4)',
              color: 'white',
              fontWeight: 700, fontSize: '1.1rem',
              cursor: selectedChapters.length === 0 ? 'not-allowed' : 'pointer',
              opacity: selectedChapters.length === 0 ? 0.5 : 1,
            }}
          >
            {loading ? 'Loading...' : 'Start Demo Test'}
          </button>
        </div>
      </main>
    );
  }

  // ===== REVIEW PHASE =====
  if (phase === 'review') {
    let totalScore = 0;
    const results = questions.map((q, idx) => {
      const userAns = answers[idx] ?? [];
      const isCorrect =
        userAns.length === q.answer.length &&
        [...userAns].sort().every((v, i) => v === [...q.answer].sort()[i]);
      if (isCorrect) totalScore++;
      return { question: q, userAns, isCorrect };
    });
    const percentage = Math.round((totalScore / questions.length) * 100);

    // Chapter breakdown
    const chapterStats = new Map<string, { total: number; correct: number }>();
    results.forEach(({ question, isCorrect }) => {
      const ch = question.number.match(/^C_(\d+)_/)?.[1] ?? '00';
      const stat = chapterStats.get(ch) || { total: 0, correct: 0 };
      stat.total++;
      if (isCorrect) stat.correct++;
      chapterStats.set(ch, stat);
    });

    return (
      <main style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        {/* Score Summary */}
        <div className="glass" style={{
          padding: '3rem', borderRadius: '20px', textAlign: 'center', marginBottom: '2rem',
        }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Demo Test Result
          </div>
          <div style={{ fontSize: '4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <span style={{ color: percentage >= 67 ? '#059669' : '#DC2626' }}>{totalScore}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '2rem' }}> / {questions.length}</span>
          </div>
          <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            {percentage}%
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {saving ? 'Saving result...' : saved ? 'Result saved' : 'Save failed'}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleRetry} style={{
              padding: '0.75rem 2rem', borderRadius: '10px', border: 'none',
              background: 'var(--color-5)', color: 'white', fontWeight: 600, cursor: 'pointer',
            }}>
              Retry Same Questions
            </button>
            <button onClick={handleStart} style={{
              padding: '0.75rem 2rem', borderRadius: '10px', border: 'none',
              background: 'var(--color-4)', color: 'white', fontWeight: 600, cursor: 'pointer',
            }}>
              New Random Set
            </button>
            <button onClick={handleNewSet} style={{
              padding: '0.75rem 2rem', borderRadius: '10px',
              border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
              color: 'var(--foreground)', fontWeight: 600, cursor: 'pointer',
            }}>
              Change Chapters
            </button>
          </div>
        </div>

        {/* Chapter Breakdown */}
        {chapterStats.size > 1 && (
          <div className="glass" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--color-4)', marginBottom: '1rem' }}>Chapter Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
              {[...chapterStats.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([ch, stat]) => {
                const rate = Math.round((stat.correct / stat.total) * 100);
                return (
                  <div key={ch} style={{
                    padding: '0.75rem', borderRadius: '10px', textAlign: 'center',
                    background: rate >= 70 ? 'rgba(5, 150, 105, 0.06)' : 'rgba(220, 38, 38, 0.06)',
                    border: `1px solid ${rate >= 70 ? 'rgba(5, 150, 105, 0.15)' : 'rgba(220, 38, 38, 0.15)'}`,
                  }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ch.{ch}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: rate >= 70 ? '#059669' : '#DC2626' }}>
                      {stat.correct}/{stat.total}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Question Review */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {results.map(({ question, userAns, isCorrect }, idx) => (
            <div key={idx} className="glass" style={{
              padding: '2rem', borderRadius: '16px',
              borderColor: isCorrect ? '#059669' : '#DC2626',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-4)', fontSize: '0.9rem' }}>
                  #{idx + 1} &middot; {question.number}
                </span>
                <span style={{
                  padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600,
                  background: isCorrect ? 'rgba(5, 150, 105, 0.08)' : 'rgba(220, 38, 38, 0.08)',
                  color: isCorrect ? '#059669' : '#DC2626',
                }}>
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>

              <p style={{ marginBottom: '1rem', lineHeight: 1.6, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                {question.title}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {question.options.map((opt) => {
                  const letter = getOptionLetter(opt);
                  const wasSelected = userAns.includes(letter);
                  const isAnswer = question.answer.includes(letter);
                  let className = 'option-card';
                  if (isAnswer) className += ' option-correct';
                  else if (wasSelected) className += ' option-incorrect';

                  return (
                    <div key={letter} className={className} style={{ cursor: 'default' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {wasSelected && !isAnswer && <span style={{ color: '#DC2626' }}>&#10007;</span>}
                        {isAnswer && <span style={{ color: '#059669' }}>&#10003;</span>}
                        {opt}
                      </span>
                    </div>
                  );
                })}
              </div>

              {question.explanation && (
                <details>
                  <summary style={{ color: 'var(--color-5)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                    View Explanation
                  </summary>
                  <div style={{
                    marginTop: '0.75rem', padding: '1.25rem',
                    background: 'rgba(44, 62, 80, 0.06)', borderRadius: '12px',
                    borderLeft: '4px solid var(--color-3)',
                    color: 'var(--foreground)', fontSize: '0.9rem', lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {question.explanation}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      </main>
    );
  }

  // ===== TAKING PHASE =====
  const question = questions[currentIndex];
  const isMultiSelect = question?.answer.length > 1;
  const selectedAnswers = answers[currentIndex] ?? [];
  const answeredCount = Object.keys(answers).filter((k) => (answers[Number(k)]?.length ?? 0) > 0).length;

  const requiredCount = (() => {
    const match = question?.title.match(/(\d+)つ選択/);
    return match ? parseInt(match[1]) : (isMultiSelect ? question?.answer.length : 1);
  })();

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{
            background: 'rgba(142, 68, 173, 0.1)', color: 'var(--color-5)',
            padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600,
          }}>
            Demo Test
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {answeredCount} / {questions.length} answered
          </span>
        </div>
        <button
          onClick={handleNewSet}
          style={{
            padding: '0.4rem 1rem', borderRadius: '8px',
            border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
            color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem',
          }}
        >
          Exit
        </button>
      </div>

      {/* Progress Bar */}
      <div className="quiz-progress-bar" style={{ marginBottom: '1.5rem' }}>
        <div
          className="quiz-progress-bar-fill"
          style={{ width: `${(answeredCount / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Number Navigation */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {questions.map((_, idx) => {
          const hasAnswer = (answers[idx]?.length ?? 0) > 0;
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: '34px', height: '34px', borderRadius: '8px',
                border: isCurrent ? '2px solid var(--color-4)' : '1px solid var(--glass-border)',
                background: hasAnswer ? 'rgba(41, 128, 185, 0.1)' : 'var(--glass-bg)',
                color: isCurrent ? 'var(--color-4)' : hasAnswer ? 'var(--color-4)' : 'var(--text-muted)',
                cursor: 'pointer', fontWeight: isCurrent ? 700 : 400, fontSize: '0.8rem',
              }}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Question Card */}
      <div className="glass" style={{ padding: '2.5rem', borderRadius: '20px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <span style={{ color: 'var(--color-4)', fontWeight: 600, fontSize: '0.9rem' }}>
            Q{currentIndex + 1} &middot; {question.number}
          </span>
          {isMultiSelect && (
            <span style={{
              background: 'rgba(142, 68, 173, 0.1)', color: 'var(--color-5)',
              padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600,
            }}>
              Select {requiredCount}
            </span>
          )}
        </div>

        <p style={{ fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2rem', whiteSpace: 'pre-wrap' }}>
          {question.title}
        </p>

        <div style={{
          border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1rem',
          display: 'flex', flexDirection: 'column', gap: '0.75rem',
        }}>
          {question.options.map((opt) => {
            const letter = getOptionLetter(opt);
            const isSelected = selectedAnswers.includes(letter);

            return (
              <div
                key={letter}
                className={`option-card${isSelected ? ' option-selected' : ''}`}
                onClick={() => handleOptionClick(letter)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{
                    width: '22px', height: '22px', minWidth: '22px',
                    borderRadius: isMultiSelect ? '4px' : '50%',
                    border: isSelected ? '2px solid var(--color-4)' : '2px solid var(--glass-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isSelected ? 'rgba(41, 128, 185, 0.2)' : 'transparent',
                    transition: 'all 0.2s ease',
                    fontSize: '0.7rem', color: 'white', fontWeight: 700,
                  }}>
                    {isSelected && '\u25CF'}
                  </span>
                  <span>{opt}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          style={{
            padding: '0.75rem 1.5rem', borderRadius: '10px',
            border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
            color: currentIndex === 0 ? 'var(--text-muted)' : 'var(--foreground)',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 600, opacity: currentIndex === 0 ? 0.5 : 1,
          }}
        >
          Prev
        </button>

        <button
          onClick={handleFinish}
          style={{
            padding: '0.75rem 2rem', borderRadius: '10px', border: 'none',
            background: answeredCount === questions.length ? 'var(--correct)' : 'rgba(0,0,0,0.06)',
            color: 'white', cursor: 'pointer', fontWeight: 600,
          }}
        >
          Finish ({answeredCount}/{questions.length})
        </button>

        <button
          onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
          disabled={currentIndex === questions.length - 1}
          style={{
            padding: '0.75rem 1.5rem', borderRadius: '10px',
            border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
            color: currentIndex === questions.length - 1 ? 'var(--text-muted)' : 'var(--foreground)',
            cursor: currentIndex === questions.length - 1 ? 'not-allowed' : 'pointer',
            fontWeight: 600, opacity: currentIndex === questions.length - 1 ? 0.5 : 1,
          }}
        >
          Next
        </button>
      </div>
    </main>
  );
}
