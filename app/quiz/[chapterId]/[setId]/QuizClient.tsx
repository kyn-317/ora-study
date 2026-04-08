'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import type { QuizQuestion } from '../../../../lib/data';

interface QuizClientProps {
  questions: QuizQuestion[];
  chapterId: string;
  setId: string;
  backHref?: string;
  storagePrefix?: string;
  showExplanation?: boolean;
}

function getStorageKey(prefix: string, chapterId: string, setId: string) {
  return `${prefix}_${chapterId}_${setId}`;
}

export default function QuizClient({ questions, chapterId, setId, backHref, storagePrefix = 'quiz', showExplanation = true }: QuizClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState<'taking' | 'review'>('taking');
  const [restored, setRestored] = useState(false);

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(getStorageKey(storagePrefix, chapterId, setId));
      if (saved) {
        const data = JSON.parse(saved);
        setCurrentIndex(data.currentIndex ?? 0);
        setAnswers(data.answers ?? {});
        setSubmitted(data.submitted ?? {});
        setScore(data.score ?? 0);
        setMode(data.mode ?? 'taking');
      }
    } catch { /* ignore */ }
    setRestored(true);
  }, [chapterId, setId]);

  // Save to localStorage
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(getStorageKey(storagePrefix, chapterId, setId), JSON.stringify({
        currentIndex, answers, submitted, score, mode,
      }));
    } catch { /* ignore */ }
  }, [currentIndex, answers, submitted, score, mode, restored, chapterId, setId]);

  const question = questions[currentIndex];
  const isMultiSelect = question?.answer.length > 1;
  const selectedAnswers = answers[currentIndex] ?? [];
  const isSubmitted = submitted[currentIndex] ?? false;

  // Extract required selection count from title (e.g., "2つ選択")
  const requiredCount = (() => {
    const match = question?.title.match(/(\d+)つ選択/);
    return match ? parseInt(match[1]) : (isMultiSelect ? question?.answer.length : 1);
  })();

  const handleOptionClick = useCallback((optionLetter: string) => {
    if (isSubmitted) return;

    setAnswers(prev => {
      const current = prev[currentIndex] ?? [];
      if (isMultiSelect) {
        const next = current.includes(optionLetter)
          ? current.filter(o => o !== optionLetter)
          : [...current, optionLetter];
        return { ...prev, [currentIndex]: next };
      } else {
        return { ...prev, [currentIndex]: [optionLetter] };
      }
    });
  }, [currentIndex, isMultiSelect, isSubmitted]);

  const handleSubmit = useCallback(() => {
    if (selectedAnswers.length === 0) return;
    const correct = question.answer;
    const isCorrect =
      selectedAnswers.length === correct.length &&
      [...selectedAnswers].sort().every((v, i) => v === correct.sort()[i]);

    setSubmitted(prev => ({ ...prev, [currentIndex]: true }));
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  }, [selectedAnswers, question, currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, questions.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleFinish = useCallback(() => {
    setMode('review');
  }, []);

  const handleRetry = useCallback(() => {
    setCurrentIndex(0);
    setAnswers({});
    setSubmitted({});
    setScore(0);
    setMode('taking');
    try {
      localStorage.removeItem(getStorageKey(storagePrefix, chapterId, setId));
    } catch { /* ignore */ }
  }, [chapterId, setId, storagePrefix]);

  const defaultBackHref = backHref ?? `/quiz/${chapterId}`;

  const getOptionLetter = (option: string) => {
    const match = option.match(/^([A-E])\)/);
    return match ? match[1] : '';
  };

  const allSubmitted = questions.every((_, i) => submitted[i]);

  if (!restored) return null;

  // ===== REVIEW MODE =====
  if (mode === 'review') {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <main style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <Link href={defaultBackHref} style={{ color: 'var(--color-4)', marginBottom: '2rem', display: 'inline-block' }}>
          &larr; Back
        </Link>

        {/* Score Summary */}
        <div className="glass" style={{
          padding: '3rem',
          borderRadius: '20px',
          textAlign: 'center',
          marginBottom: '3rem',
          borderColor: percentage >= 70 ? '#34d399' : '#f87171',
        }}>
          <div style={{ fontSize: '4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <span style={{ color: percentage >= 70 ? '#34d399' : '#f87171' }}>{score}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '2rem' }}> / {questions.length}</span>
          </div>
          <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {percentage}%
          </div>
          <div style={{
            display: 'inline-block',
            padding: '0.5rem 1.5rem',
            borderRadius: '999px',
            fontWeight: 600,
            background: percentage >= 70 ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)',
            color: percentage >= 70 ? '#34d399' : '#f87171',
          }}>
            {percentage >= 70 ? 'PASS' : 'FAIL'}
          </div>
          <div style={{ marginTop: '2rem' }}>
            <button onClick={handleRetry} style={{
              padding: '0.75rem 2rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--color-2), var(--color-3))',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '1rem',
            }}>
              Retry Quiz
            </button>
          </div>
        </div>

        {/* Question Review */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {questions.map((q, idx) => {
            const userAns = answers[idx] ?? [];
            const isCorrect =
              userAns.length === q.answer.length &&
              [...userAns].sort().every((v, i) => v === [...q.answer].sort()[i]);

            return (
              <div key={idx} className="glass" style={{
                padding: '2rem',
                borderRadius: '16px',
                borderColor: isCorrect ? '#34d399' : '#f87171',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-4)' }}>{q.number}</span>
                  <span style={{
                    padding: '0.2rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: isCorrect ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                    color: isCorrect ? '#34d399' : '#f87171',
                  }}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>{q.title}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {q.options.map(opt => {
                    const letter = getOptionLetter(opt);
                    const wasSelected = userAns.includes(letter);
                    const isAnswer = q.answer.includes(letter);
                    let className = 'option-card';
                    if (isAnswer) className += ' option-correct';
                    else if (wasSelected) className += ' option-incorrect';

                    return (
                      <div key={letter} className={className} style={{ cursor: 'default' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {wasSelected && !isAnswer && <span style={{ color: '#f87171' }}>✗</span>}
                          {isAnswer && <span style={{ color: '#34d399' }}>✓</span>}
                          {opt}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {showExplanation && q.explanation && (
                  <details>
                    <summary style={{ color: 'var(--color-5)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                      View Explanation
                    </summary>
                    <div style={{
                      marginTop: '1rem',
                      padding: '1.5rem',
                      background: 'rgba(111, 107, 234, 0.08)',
                      borderRadius: '12px',
                      borderLeft: '4px solid var(--color-3)',
                      whiteSpace: 'pre-wrap',
                      color: 'var(--foreground)',
                      fontSize: '0.9rem',
                      lineHeight: 1.7,
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

  // ===== TAKING MODE =====
  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Link href={defaultBackHref} style={{ color: 'var(--color-4)', fontSize: '0.9rem' }}>
          &larr; Back
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Score: <span style={{ color: '#34d399', fontWeight: 700 }}>{score}</span> / {questions.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="quiz-progress-bar" style={{ marginBottom: '2rem' }}>
        <div
          className="quiz-progress-bar-fill"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Number Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {questions.map((_, idx) => {
          const isDone = submitted[idx];
          const isCurrent = idx === currentIndex;
          const userAns = answers[idx] ?? [];
          const q = questions[idx];
          const isCorrect = isDone &&
            userAns.length === q.answer.length &&
            [...userAns].sort().every((v, i) => v === [...q.answer].sort()[i]);

          return (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: isCurrent ? '2px solid var(--color-4)' : '1px solid var(--glass-border)',
                background: isDone
                  ? (isCorrect ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)')
                  : 'var(--glass-bg)',
                color: isCurrent ? 'var(--color-4)' : 'var(--foreground)',
                cursor: 'pointer',
                fontWeight: isCurrent ? 700 : 400,
                fontSize: '0.85rem',
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
            {question.number}
          </span>
          {isMultiSelect && (
            <span style={{
              background: 'rgba(203, 122, 240, 0.15)',
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

        <p style={{ fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
          {question.title}
        </p>

        {/* Options */}
        <div style={{
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          {question.options.map(opt => {
            const letter = getOptionLetter(opt);
            const isSelected = selectedAnswers.includes(letter);
            const isAnswer = question.answer.includes(letter);

            let className = 'option-card';
            if (isSubmitted) {
              if (isAnswer) className += ' option-correct';
              else if (isSelected) className += ' option-incorrect';
            } else if (isSelected) {
              className += ' option-selected';
            }

            return (
              <div
                key={letter}
                className={className}
                onClick={() => handleOptionClick(letter)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {/* Checkbox / Radio indicator */}
                  <span style={{
                    width: '22px',
                    height: '22px',
                    minWidth: '22px',
                    borderRadius: isMultiSelect ? '4px' : '50%',
                    border: isSubmitted
                      ? (isAnswer ? '2px solid #34d399' : isSelected ? '2px solid #f87171' : '2px solid var(--glass-border)')
                      : isSelected ? '2px solid var(--color-4)' : '2px solid var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isSubmitted
                      ? (isAnswer ? 'rgba(52, 211, 153, 0.3)' : isSelected ? 'rgba(248, 113, 113, 0.3)' : 'transparent')
                      : isSelected ? 'rgba(67, 171, 240, 0.3)' : 'transparent',
                    transition: 'all 0.2s ease',
                    fontSize: '0.7rem',
                    color: 'white',
                    fontWeight: 700,
                  }}>
                    {isSubmitted && isAnswer && '✓'}
                    {isSubmitted && isSelected && !isAnswer && '✗'}
                    {!isSubmitted && isSelected && '●'}
                  </span>
                  <span>{opt}</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Explanation after submit */}
        {isSubmitted && showExplanation && question.explanation && (
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'rgba(111, 107, 234, 0.08)',
            borderRadius: '12px',
            borderLeft: '4px solid var(--color-3)',
            whiteSpace: 'pre-wrap',
            color: 'var(--foreground)',
            fontSize: '0.9rem',
            lineHeight: 1.7,
          }}>
            {question.explanation}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '10px',
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)',
            color: currentIndex === 0 ? 'var(--text-muted)' : 'var(--foreground)',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            opacity: currentIndex === 0 ? 0.5 : 1,
          }}
        >
          Prev
        </button>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {!isSubmitted && (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswers.length === 0}
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '10px',
                border: 'none',
                background: selectedAnswers.length === 0
                  ? 'rgba(255,255,255,0.1)'
                  : 'linear-gradient(135deg, var(--color-2), var(--color-3))',
                color: 'white',
                cursor: selectedAnswers.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                opacity: selectedAnswers.length === 0 ? 0.5 : 1,
              }}
            >
              Check Answer
            </button>
          )}

          {isSubmitted && currentIndex < questions.length - 1 && (
            <button
              onClick={handleNext}
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, var(--color-4), var(--color-2))',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Next
            </button>
          )}

          {isSubmitted && currentIndex === questions.length - 1 && allSubmitted && (
            <button
              onClick={handleFinish}
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #34d399, var(--color-4))',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              View Results
            </button>
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === questions.length - 1}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '10px',
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)',
            color: currentIndex === questions.length - 1 ? 'var(--text-muted)' : 'var(--foreground)',
            cursor: currentIndex === questions.length - 1 ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            opacity: currentIndex === questions.length - 1 ? 0.5 : 1,
          }}
        >
          Next
        </button>
      </div>
    </main>
  );
}
