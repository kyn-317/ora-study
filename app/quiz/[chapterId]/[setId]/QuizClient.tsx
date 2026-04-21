'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { QuizQuestion } from '../../../../lib/data';
import { shuffleQuestionOptions, seededRandom } from '../../../../lib/shuffle';

function formatQuestionText(q: QuizQuestion): string {
  const lines = [q.number, q.title, '', ...q.options];
  return lines.join('\n');
}
import ExplanationWithKeywords from './ExplanationWithKeywords';
import type { KeywordEntry } from './ExplanationWithKeywords';
import StudyPanel from './StudyPanel';
import type { StudyPanelItem, StudyContentData, KeywordStudyData } from './StudyPanel';

interface QuizClientProps {
  questions: QuizQuestion[];
  chapterId: string;
  setId: string;
  backHref?: string;
  storagePrefix?: string;
  showExplanation?: boolean;
  keywordIndex?: Record<string, KeywordEntry[]>;
}

function getStorageKey(prefix: string, chapterId: string, setId: string) {
  return `${prefix}_${chapterId}_${setId}`;
}

function generateSeed(): number {
  return (Date.now() ^ Math.floor(Math.random() * 2147483647)) % 2147483647 || 1;
}

export default function QuizClient({ questions, chapterId, setId, backHref, storagePrefix = 'quiz', showExplanation = true, keywordIndex }: QuizClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState<'taking' | 'review'>('taking');
  const [restored, setRestored] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState<number | null>(null);

  const shuffledQuestions = useMemo(() => {
    if (shuffleSeed === null) return questions;
    return questions.map((q, i) =>
      shuffleQuestionOptions(q, seededRandom(shuffleSeed + i + 1)),
    );
  }, [questions, shuffleSeed]);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopyQuestion = useCallback((q: QuizQuestion, idx: number) => {
    const text = formatQuestionText(q);
    navigator.clipboard.writeText(text).then(() => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      setCopiedIndex(idx);
      copyTimeoutRef.current = setTimeout(() => setCopiedIndex(null), 2000);
    }).catch(() => {});
  }, []);

  const [studyItems, setStudyItems] = useState<StudyPanelItem[]>([]);
  const [showStudyPanel, setShowStudyPanel] = useState(false);

  const [panelWidth, setPanelWidth] = useState(480);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = panelWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [panelWidth]);

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const delta = dragStartX.current - e.clientX;
      const newWidth = Math.max(250, Math.min(window.innerWidth * 0.6, dragStartWidth.current + delta));
      setPanelWidth(newWidth);
    };
    const handleUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
    return () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };
  }, []);

  const handleStudySelect = useCallback(async (keyword: string, entry: KeywordEntry) => {
    const exists = studyItems.some(item => item.keyword === keyword && item.studyId === entry.studyId);
    if (exists) {
      setShowStudyPanel(true);
      return;
    }

    const newItem: StudyPanelItem = {
      keyword,
      studyId: entry.studyId,
      chapterId: entry.chapterId,
      title: entry.title,
      fileName: entry.fileName,
      content: null,
      keywordStudy: null,
    };

    setStudyItems(prev => [...prev, newItem]);
    setShowStudyPanel(true);

    try {
      if (entry.hasKeywordStudy) {
        const ksRes = await fetch(
          `/api/keyword-study/${entry.chapterId}/${entry.studyId}?keyword=${encodeURIComponent(keyword)}`
        );
        if (ksRes.ok) {
          const ksData: KeywordStudyData = await ksRes.json();
          setStudyItems(prev =>
            prev.map(item =>
              item.keyword === keyword && item.studyId === entry.studyId
                ? { ...item, keywordStudy: ksData }
                : item
            )
          );
          return;
        }
      }
      const res = await fetch(`/api/study/${entry.chapterId}/${entry.studyId}`);
      if (res.ok) {
        const data: StudyContentData = await res.json();
        setStudyItems(prev =>
          prev.map(item =>
            item.keyword === keyword && item.studyId === entry.studyId
              ? { ...item, content: data }
              : item
          )
        );
      }
    } catch {}
  }, [studyItems]);

  const handleStudyRemove = useCallback((keyword: string, studyId: string) => {
    setStudyItems(prev => {
      const next = prev.filter(item => !(item.keyword === keyword && item.studyId === studyId));
      if (next.length === 0) setShowStudyPanel(false);
      return next;
    });
  }, []);

  const handleStudyPanelClose = useCallback(() => {
    setShowStudyPanel(false);
  }, []);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setPanelWidth(Math.round(Math.min(window.innerWidth * 0.36, 480)));
      }
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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
        setShuffleSeed(typeof data.shuffleSeed === 'number' ? data.shuffleSeed : null);
      } else {
        setShuffleSeed(generateSeed());
      }
    } catch {
      setShuffleSeed(generateSeed());
    }
    setRestored(true);
  }, [chapterId, setId, storagePrefix]);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(getStorageKey(storagePrefix, chapterId, setId), JSON.stringify({
        currentIndex, answers, submitted, score, mode, shuffleSeed,
      }));
    } catch {}
  }, [currentIndex, answers, submitted, score, mode, shuffleSeed, restored, chapterId, setId, storagePrefix]);

  const question = shuffledQuestions[currentIndex];
  const isMultiSelect = question?.answer.length > 1;
  const selectedAnswers = answers[currentIndex] ?? [];
  const isSubmitted = submitted[currentIndex] ?? false;

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
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, shuffledQuestions.length]);

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
    setShuffleSeed(generateSeed());
    try {
      localStorage.removeItem(getStorageKey(storagePrefix, chapterId, setId));
    } catch {}
  }, [chapterId, setId, storagePrefix]);

  const defaultBackHref = backHref ?? `/quiz/${chapterId}`;

  const getOptionLetter = (option: string) => {
    const match = option.match(/^([A-E])\)/);
    return match ? match[1] : '';
  };

  const stripOptionLetter = (option: string) => {
    return option.replace(/^[A-E]\)\s*/, '');
  };

  const allSubmitted = shuffledQuestions.every((_, i) => submitted[i]);

  if (!restored) return null;

  const renderExplanation = (explanationText: string) => (
    <div className="explanation">
      {keywordIndex ? (
        <ExplanationWithKeywords
          text={explanationText}
          keywordIndex={keywordIndex}
          onStudySelect={handleStudySelect}
        />
      ) : (
        <span style={{ whiteSpace: 'pre-wrap' }}>{explanationText}</span>
      )}
    </div>
  );

  const studyPanelElement = showStudyPanel && (
    <div style={{ width: isMobile ? '100%' : panelWidth, display: 'flex' }}>
      {!isMobile && (
        <div
          onPointerDown={handleDragStart}
          style={{
            flex: '0 0 6px',
            cursor: 'col-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-bg)')}
          onMouseLeave={e => { if (!isDragging.current) e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{ width: '2px', height: '40px', background: 'var(--rule)' }} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <StudyPanel
          items={studyItems}
          onRemove={handleStudyRemove}
          onClose={handleStudyPanelClose}
        />
      </div>
    </div>
  );

  // ===== REVIEW MODE =====
  if (mode === 'review') {
    const percentage = Math.round((score / shuffledQuestions.length) * 100);
    const passed = percentage >= 70;

    const reviewContent = (
      <div style={{
        flex: '1 1 0%',
        minWidth: 0,
        padding: showStudyPanel ? '32px 24px' : '48px 32px 96px',
        maxWidth: showStudyPanel ? 'none' : 960,
        margin: showStudyPanel ? '0' : '0 auto',
        width: showStudyPanel ? 'auto' : '100%',
      }}>
        <Link href={defaultBackHref} className="back-link">← Back</Link>

        <header className="masthead">
          <div>
            <div className="tag">Result · 채점 결과</div>
            <h1>
              <span style={{ color: passed ? 'var(--correct)' : 'var(--wrong)' }}>{score}</span>
              <span style={{ color: 'var(--ink-3)', fontSize: '0.6em' }}> / {shuffledQuestions.length}</span>
            </h1>
            <p className="subtitle">{percentage}% · {passed ? 'PASS' : 'FAIL'}</p>
          </div>
          <div className="meta">
            <div><strong>Chapter</strong>   {chapterId}</div>
            <div><strong>Set</strong>   {setId}</div>
            <button onClick={handleRetry} className="btn btn-accent" style={{ marginTop: 10 }}>
              Retry Quiz
            </button>
          </div>
        </header>

        <section className="section">
          <div className="section-label">Question Review</div>
          <h2 className="section-title">문항별 풀이 내역</h2>
        </section>

        {shuffledQuestions.map((q, idx) => {
          const userAns = answers[idx] ?? [];
          const isCorrect =
            userAns.length === q.answer.length &&
            [...userAns].sort().every((v, i) => v === [...q.answer].sort()[i]);

          return (
            <article key={idx} className="qa-card">
              <div className="qa-head">
                <span><span className="num">Q {String(idx + 1).padStart(2, '0')}</span> · {q.number}</span>
                <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopyQuestion(q, idx); }}
                    className="btn"
                    style={{ padding: '3px 10px', fontSize: 10 }}
                    title="Copy question"
                  >
                    {copiedIndex === idx ? '✓ Copied' : 'Copy'}
                  </button>
                  <span className={`tag-chip ${isCorrect ? 'correct' : 'wrong'}`}>
                    {isCorrect ? 'CORRECT' : 'INCORRECT'}
                  </span>
                </span>
              </div>
              <div className="qa-body">
                <p className="question">{q.title}</p>
                <ul className="options">
                  {q.options.map(opt => {
                    const letter = getOptionLetter(opt);
                    const wasSelected = userAns.includes(letter);
                    const isAnswer = q.answer.includes(letter);
                    let cls = 'static';
                    if (isAnswer) cls += ' correct';
                    else if (wasSelected) cls += ' mine';
                    return (
                      <li key={letter} className={cls}>
                        <span className="k">{letter}</span>
                        <span>{stripOptionLetter(opt)}</span>
                        <span className="mark">
                          {isAnswer ? 'CORRECT' : wasSelected ? 'MY' : ''}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {showExplanation && q.explanation && (
                  <details style={{ marginTop: 14 }}>
                    <summary style={{
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--accent)',
                      fontWeight: 600,
                    }}>
                      View Explanation ▾
                    </summary>
                    {renderExplanation(q.explanation)}
                  </details>
                )}
              </div>
            </article>
          );
        })}
      </div>
    );

    if (!showStudyPanel) {
      return <main>{reviewContent}</main>;
    }
    return (
      <main className="quiz-layout-with-panel">
        {reviewContent}
        {studyPanelElement}
      </main>
    );
  }

  // ===== TAKING MODE =====
  const takingContent = (
    <div style={{
      flex: '1 1 0%',
      minWidth: 0,
      padding: showStudyPanel ? '28px 20px' : '40px 32px 96px',
      maxWidth: showStudyPanel ? 'none' : 960,
      margin: showStudyPanel ? '0' : '0 auto',
      width: showStudyPanel ? 'auto' : '100%',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Link href={defaultBackHref} className="back-link" style={{ marginBottom: 0 }}>← Back</Link>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--ink-3)',
          letterSpacing: '0.04em',
        }}>
          Score <strong style={{ color: 'var(--correct)', fontWeight: 600 }}>{score}</strong>
          <span style={{ color: 'var(--ink-4)' }}> / {shuffledQuestions.length}</span>
        </div>
      </div>

      <div className="quiz-progress-bar" style={{ marginBottom: 24 }}>
        <div
          className="quiz-progress-bar-fill"
          style={{ width: `${((currentIndex + 1) / shuffledQuestions.length) * 100}%` }}
        />
      </div>

      <div className="qnav" style={{ marginBottom: 28 }}>
        {shuffledQuestions.map((_, idx) => {
          const isDone = submitted[idx];
          const isCurrent = idx === currentIndex;
          const userAns = answers[idx] ?? [];
          const q = shuffledQuestions[idx];
          const isCorrect = isDone &&
            userAns.length === q.answer.length &&
            [...userAns].sort().every((v, i) => v === [...q.answer].sort()[i]);

          const cls = [
            isCurrent && 'current',
            isDone && (isCorrect ? 'done-correct' : 'done-wrong'),
          ].filter(Boolean).join(' ');

          return (
            <button key={idx} className={cls} onClick={() => setCurrentIndex(idx)}>
              {idx + 1}
            </button>
          );
        })}
      </div>

      <article className="qa-card">
        <div className="qa-head">
          <span>
            <span className="num">Q {String(currentIndex + 1).padStart(2, '0')}</span>
            {' · '}{question.number}
            {isMultiSelect && (
              <span style={{ marginLeft: 10 }} className="tag-chip info">Select {requiredCount}</span>
            )}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); handleCopyQuestion(question, currentIndex); }}
            className="btn"
            style={{ padding: '3px 10px', fontSize: 10 }}
            title="Copy question"
          >
            {copiedIndex === currentIndex ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        <div className="qa-body">
          <p className="question">{question.title}</p>

          <ul className="options">
            {question.options.map(opt => {
              const letter = getOptionLetter(opt);
              const isSelected = selectedAnswers.includes(letter);
              const isAnswer = question.answer.includes(letter);

              let cls = '';
              if (isSubmitted) {
                cls = 'static ';
                if (isAnswer) cls += 'correct';
                else if (isSelected) cls += 'mine';
              } else if (isSelected) {
                cls = 'selected';
              }

              return (
                <li key={letter} className={cls.trim()} onClick={() => handleOptionClick(letter)}>
                  <span className="k">{letter}</span>
                  <span>{stripOptionLetter(opt)}</span>
                  <span className="mark">
                    {isSubmitted
                      ? (isAnswer ? 'CORRECT' : isSelected ? 'MY' : '')
                      : (isSelected ? '●' : '')}
                  </span>
                </li>
              );
            })}
          </ul>

          {isSubmitted && showExplanation && question.explanation && renderExplanation(question.explanation)}
        </div>
      </article>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 20 }}>
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="btn btn-ghost"
        >
          ← Prev
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          {!isSubmitted && (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswers.length === 0}
              className="btn btn-primary"
            >
              Check Answer
            </button>
          )}

          {isSubmitted && currentIndex < shuffledQuestions.length - 1 && (
            <button onClick={handleNext} className="btn btn-primary">
              Next →
            </button>
          )}

          {isSubmitted && currentIndex === shuffledQuestions.length - 1 && allSubmitted && (
            <button onClick={handleFinish} className="btn btn-success">
              View Results
            </button>
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === shuffledQuestions.length - 1}
          className="btn btn-ghost"
        >
          Next →
        </button>
      </div>
    </div>
  );

  if (!showStudyPanel) {
    return <main>{takingContent}</main>;
  }
  return (
    <main className="quiz-layout-with-panel">
      {takingContent}
      {studyPanelElement}
    </main>
  );
}
