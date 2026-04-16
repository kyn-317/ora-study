'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { QuizQuestion } from '../../../lib/data';

// ── Seeded shuffle (Fisher-Yates) ──

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ── Shuffle questions + options ──

interface ShuffledQuestion extends QuizQuestion {
  originalIndex: number;
}

function shuffleExam(questions: QuizQuestion[], seed: number): ShuffledQuestion[] {
  const rng = seededRandom(seed);

  // Shuffle question order
  const indices = shuffleArray(
    questions.map((_, i) => i),
    rng,
  );

  return indices.map((origIdx) => {
    const q = questions[origIdx];
    const optionRng = seededRandom(seed + origIdx + 1);

    // Build letter→option mapping
    const optionEntries = q.options.map((opt) => {
      const match = opt.match(/^([A-E])\)\s*/);
      return { letter: match ? match[1] : '', text: opt };
    });

    // Shuffle options
    const shuffledOptions = shuffleArray(optionEntries, optionRng);

    // Remap answer letters: old letter → new position letter
    const letterMap = new Map<string, string>();
    const newLetters = ['A', 'B', 'C', 'D', 'E'];
    shuffledOptions.forEach((entry, i) => {
      if (entry.letter && i < newLetters.length) {
        letterMap.set(entry.letter, newLetters[i]);
      }
    });

    // Rebuild options with new letters
    const newOptions = shuffledOptions.map((entry, i) => {
      const newLetter = newLetters[i] || entry.letter;
      const textWithoutLetter = entry.text.replace(/^[A-E]\)\s*/, '');
      return `${newLetter}) ${textWithoutLetter}`;
    });

    // Remap answers
    const newAnswer = q.answer.map((a) => letterMap.get(a) || a);

    return {
      ...q,
      options: newOptions,
      answer: newAnswer,
      originalIndex: origIdx,
    };
  });
}

// ── Timer formatting ──

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ── Component ──

interface MockExamClientProps {
  questions: QuizQuestion[];
  setId: number;
}

type ExamPhase = 'ready' | 'taking' | 'review';

const EXAM_DURATION = 120 * 60; // 120 minutes in seconds
const PASS_SCORE = 40; // 40 correct answers out of 60 to pass

export default function MockExamClient({ questions, setId }: MockExamClientProps) {
  const [phase, setPhase] = useState<ExamPhase>('ready');
  const [seed, setSeed] = useState(0);
  const [shuffled, setShuffled] = useState<ShuffledQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [startedAt, setStartedAt] = useState('');
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Per-question time tracking
  const questionTimes = useRef<Record<number, number>>({});
  const questionEnterTime = useRef(Date.now());

  // Track time on current question when navigating away
  const recordQuestionTime = useCallback(() => {
    const elapsed = Math.round((Date.now() - questionEnterTime.current) / 1000);
    questionTimes.current[currentIndex] = (questionTimes.current[currentIndex] || 0) + elapsed;
    questionEnterTime.current = Date.now();
  }, [currentIndex]);

  // Timer
  useEffect(() => {
    if (phase !== 'taking') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Auto-finish when time runs out
  useEffect(() => {
    if (phase === 'taking' && timeLeft <= 0) {
      handleFinish();
    }
  }, [timeLeft, phase]);

  // localStorage persistence for in-progress exam
  const storageKey = `mock_exam_${setId}`;

  useEffect(() => {
    if (phase !== 'taking') return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        seed, currentIndex, answers, timeLeft, startedAt, questionTimes: questionTimes.current,
      }));
    } catch { /* ignore */ }
  }, [currentIndex, answers, timeLeft, phase, seed, startedAt]);

  // Restore on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.seed && data.startedAt && data.timeLeft > 0) {
          setSeed(data.seed);
          setShuffled(shuffleExam(questions, data.seed));
          setCurrentIndex(data.currentIndex ?? 0);
          setAnswers(data.answers ?? {});
          setTimeLeft(data.timeLeft);
          setStartedAt(data.startedAt);
          questionTimes.current = data.questionTimes ?? {};
          questionEnterTime.current = Date.now();
          setPhase('taking');
        }
      }
    } catch { /* ignore */ }
  }, []);

  const handleStart = useCallback(() => {
    const newSeed = Date.now() % 2147483647;
    setSeed(newSeed);
    setShuffled(shuffleExam(questions, newSeed));
    setCurrentIndex(0);
    setAnswers({});
    setTimeLeft(EXAM_DURATION);
    setStartedAt(new Date().toISOString());
    questionTimes.current = {};
    questionEnterTime.current = Date.now();
    setScore(0);
    setSaved(false);
    setPhase('taking');
  }, [questions]);

  const handleOptionClick = useCallback((letter: string) => {
    if (phase !== 'taking') return;
    const q = shuffled[currentIndex];
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
  }, [phase, shuffled, currentIndex]);

  const navigateTo = useCallback((idx: number) => {
    recordQuestionTime();
    setCurrentIndex(idx);
  }, [recordQuestionTime]);

  const handleFinish = useCallback(async () => {
    recordQuestionTime();

    // Calculate score
    let totalScore = 0;
    const answerDetails = shuffled.map((q, idx) => {
      const selected = answers[idx] ?? [];
      const correct = q.answer;
      const isCorrect =
        selected.length === correct.length &&
        [...selected].sort().every((v, i) => v === [...correct].sort()[i]);
      if (isCorrect) totalScore++;

      const chapterMatch = q.number.match(/^(?:C_)?(\d+)_/);
      return {
        questionId: q.number,
        chapter: chapterMatch ? chapterMatch[1] : '00',
        selected,
        correct,
        isCorrect,
        timeSpent: questionTimes.current[idx] || 0,
      };
    });

    setScore(totalScore);
    setPhase('review');

    // Clear in-progress storage
    try { localStorage.removeItem(storageKey); } catch { /* ignore */ }

    // Save result to server
    const completedAt = new Date().toISOString();
    const duration = EXAM_DURATION - timeLeft;
    const result = {
      examSet: setId,
      startedAt,
      completedAt,
      duration,
      shuffleSeed: seed,
      totalQuestions: shuffled.length,
      score: totalScore,
      scoreRate: Math.round((totalScore / shuffled.length) * 1000) / 10,
      answers: answerDetails,
    };

    setSaving(true);
    try {
      const res = await fetch('/api/mock-exam/save-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      if (res.ok) setSaved(true);
    } catch { /* ignore */ }
    setSaving(false);
  }, [shuffled, answers, timeLeft, seed, setId, startedAt, recordQuestionTime]);

  const getOptionLetter = (option: string) => {
    const match = option.match(/^([A-E])\)/);
    return match ? match[1] : '';
  };

  // ===== READY PHASE =====
  if (phase === 'ready') {
    return (
      <main style={{ padding: '4rem 2rem', maxWidth: '700px', margin: '0 auto' }}>
        <Link href="/mock-exam" style={{ color: 'var(--color-4)', marginBottom: '2rem', display: 'inline-block' }}>
          &larr; Back to Mock Exam
        </Link>

        <div className="glass" style={{
          padding: '3rem',
          borderRadius: '20px',
          textAlign: 'center',
          marginTop: '2rem',
        }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            Mock Exam Set {setId}
          </h1>

          <div style={{
            display: 'flex', justifyContent: 'center', gap: '2rem',
            marginBottom: '2rem', color: 'var(--text-muted)',
          }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-4)' }}>{questions.length}</div>
              <div style={{ fontSize: '0.85rem' }}>Questions</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-5)' }}>120</div>
              <div style={{ fontSize: '0.85rem' }}>Minutes</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-3)' }}>40/{questions.length}</div>
              <div style={{ fontSize: '0.85rem' }}>Pass Line</div>
            </div>
          </div>

          <ul style={{
            textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.9rem',
            lineHeight: 1.8, listStyle: 'none', padding: 0,
          }}>
            <li>- Questions and options are randomly shuffled</li>
            <li>- No explanations during the exam</li>
            <li>- Review with explanations after submission</li>
            <li>- Results are saved automatically</li>
          </ul>

          <button onClick={handleStart} style={{
            marginTop: '2rem',
            padding: '1rem 3rem',
            borderRadius: '12px',
            border: 'none',
            background: 'var(--color-4)',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.1rem',
            cursor: 'pointer',
          }}>
            Start Exam
          </button>
        </div>
      </main>
    );
  }

  // ===== REVIEW PHASE =====
  if (phase === 'review') {
    const percentage = Math.round((score / shuffled.length) * 100);
    const passed = score >= PASS_SCORE;

    // Chapter breakdown
    const chapterStats = new Map<string, { total: number; correct: number }>();
    shuffled.forEach((q, idx) => {
      const ch = q.number.match(/^(?:C_)?(\d+)_/)?.[1] ?? '00';
      const stat = chapterStats.get(ch) || { total: 0, correct: 0 };
      stat.total++;
      const selected = answers[idx] ?? [];
      const isCorrect =
        selected.length === q.answer.length &&
        [...selected].sort().every((v, i) => v === [...q.answer].sort()[i]);
      if (isCorrect) stat.correct++;
      chapterStats.set(ch, stat);
    });

    return (
      <main style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <Link href="/mock-exam" style={{ color: 'var(--color-4)', marginBottom: '2rem', display: 'inline-block' }}>
          &larr; Back to Mock Exam
        </Link>

        {/* Score Summary */}
        <div className="glass" style={{
          padding: '3rem',
          borderRadius: '20px',
          textAlign: 'center',
          marginBottom: '2rem',
          borderColor: passed ? '#059669' : '#DC2626',
        }}>
          <div style={{ fontSize: '4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <span style={{ color: passed ? '#059669' : '#DC2626' }}>{score}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '2rem' }}> / {shuffled.length}</span>
          </div>
          <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            {percentage}%
          </div>
          <div style={{
            display: 'inline-block',
            padding: '0.5rem 1.5rem',
            borderRadius: '999px',
            fontWeight: 600,
            background: passed ? 'rgba(5, 150, 105, 0.08)' : 'rgba(220, 38, 38, 0.08)',
            color: passed ? '#059669' : '#DC2626',
            marginBottom: '1rem',
          }}>
            {passed ? 'PASS' : 'FAIL'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {saving ? 'Saving result...' : saved ? 'Result saved' : 'Save failed'}
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={handleStart} style={{
              padding: '0.75rem 2rem', borderRadius: '10px', border: 'none',
              background: 'var(--color-4)',
              color: 'white', fontWeight: 600, cursor: 'pointer',
            }}>
              Retry
            </button>
          </div>
        </div>

        {/* Chapter Breakdown */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
          <h3 style={{ color: 'var(--color-4)', marginBottom: '1rem' }}>Chapter Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {[...chapterStats.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([ch, stat]) => {
              const rate = Math.round((stat.correct / stat.total) * 100);
              return (
                <div key={ch} style={{
                  padding: '0.75rem',
                  borderRadius: '10px',
                  background: rate >= 70 ? 'rgba(5, 150, 105, 0.06)' : 'rgba(220, 38, 38, 0.06)',
                  border: `1px solid ${rate >= 70 ? 'rgba(5, 150, 105, 0.15)' : 'rgba(220, 38, 38, 0.15)'}`,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ch.{ch}</div>
                  <div style={{
                    fontSize: '1.1rem', fontWeight: 700,
                    color: rate >= 70 ? '#059669' : '#DC2626',
                  }}>
                    {stat.correct}/{stat.total}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rate}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Question Review */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {shuffled.map((q, idx) => {
            const userAns = answers[idx] ?? [];
            const isCorrect =
              userAns.length === q.answer.length &&
              [...userAns].sort().every((v, i) => v === [...q.answer].sort()[i]);

            return (
              <div key={idx} className="glass" style={{
                padding: '2rem',
                borderRadius: '16px',
                borderColor: isCorrect ? '#059669' : '#DC2626',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-4)', fontSize: '0.9rem' }}>
                    #{idx + 1} &middot; {q.number}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {(questionTimes.current[idx] ?? 0) > 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {questionTimes.current[idx]}s
                      </span>
                    )}
                    <span style={{
                      padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600,
                      background: isCorrect ? 'rgba(5, 150, 105, 0.08)' : 'rgba(220, 38, 38, 0.08)',
                      color: isCorrect ? '#059669' : '#DC2626',
                    }}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                </div>

                <p style={{ marginBottom: '1rem', lineHeight: 1.6, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{q.title}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {q.options.map((opt) => {
                    const letter = getOptionLetter(opt);
                    const wasSelected = userAns.includes(letter);
                    const isAnswer = q.answer.includes(letter);
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

                {q.explanation && (
                  <details>
                    <summary style={{ color: 'var(--color-5)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                      View Explanation
                    </summary>
                    <div style={{
                      marginTop: '0.75rem', padding: '1.25rem',
                      background: 'rgba(44, 62, 80, 0.06)',
                      borderRadius: '12px', borderLeft: '4px solid var(--color-3)',
                      color: 'var(--foreground)', fontSize: '0.9rem', lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {q.explanation}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      </main>
    );
  }

  // ===== TAKING PHASE =====
  const question = shuffled[currentIndex];
  const isMultiSelect = question?.answer.length > 1;
  const selectedAnswers = answers[currentIndex] ?? [];
  const answeredCount = Object.keys(answers).filter((k) => (answers[Number(k)]?.length ?? 0) > 0).length;

  const requiredCount = (() => {
    const match = question?.title.match(/(\d+)つ選択/);
    return match ? parseInt(match[1]) : (isMultiSelect ? question?.answer.length : 1);
  })();

  const timerColor = timeLeft <= 300 ? '#DC2626' : timeLeft <= 600 ? '#D97706' : 'var(--foreground)';

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Set {setId}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {answeredCount} / {shuffled.length} answered
          </span>
        </div>
        <div style={{
          fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace', color: timerColor,
        }}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="quiz-progress-bar" style={{ marginBottom: '1.5rem' }}>
        <div
          className="quiz-progress-bar-fill"
          style={{ width: `${(answeredCount / shuffled.length) * 100}%` }}
        />
      </div>

      {/* Question Number Navigation */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {shuffled.map((_, idx) => {
          const hasAnswer = (answers[idx]?.length ?? 0) > 0;
          const isCurrent = idx === currentIndex;

          return (
            <button
              key={idx}
              onClick={() => navigateTo(idx)}
              style={{
                width: '34px', height: '34px',
                borderRadius: '8px',
                border: isCurrent ? '2px solid var(--color-4)' : '1px solid var(--glass-border)',
                background: hasAnswer ? 'rgba(41, 128, 185, 0.1)' : 'var(--glass-bg)',
                color: isCurrent ? 'var(--color-4)' : hasAnswer ? 'var(--color-4)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: isCurrent ? 700 : 400,
                fontSize: '0.8rem',
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
              background: 'rgba(142, 68, 173, 0.1)',
              color: 'var(--color-5)',
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}>
              Select {requiredCount}
            </span>
          )}
        </div>

        <p style={{ fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2rem', whiteSpace: 'pre-wrap' }}>
          {question.title}
        </p>

        <div style={{
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
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
          onClick={() => navigateTo(Math.max(0, currentIndex - 1))}
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
            background: answeredCount === shuffled.length
              ? 'var(--correct)'
              : 'rgba(0,0,0,0.06)',
            color: 'white', cursor: 'pointer', fontWeight: 600,
          }}
        >
          Finish Exam ({answeredCount}/{shuffled.length})
        </button>

        <button
          onClick={() => navigateTo(Math.min(shuffled.length - 1, currentIndex + 1))}
          disabled={currentIndex === shuffled.length - 1}
          style={{
            padding: '0.75rem 1.5rem', borderRadius: '10px',
            border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
            color: currentIndex === shuffled.length - 1 ? 'var(--text-muted)' : 'var(--foreground)',
            cursor: currentIndex === shuffled.length - 1 ? 'not-allowed' : 'pointer',
            fontWeight: 600, opacity: currentIndex === shuffled.length - 1 ? 0.5 : 1,
          }}
        >
          Next
        </button>
      </div>
    </main>
  );
}
