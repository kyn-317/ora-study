import { getExamResults } from '../../../lib/data';
import type { ExamResult } from '../../../lib/data';
import HistoryClient from './HistoryClient';

export interface ChapterStat {
  chapter: string;
  total: number;
  correct: number;
  rate: number;
}

export interface SetStat {
  examSet: number;
  attempts: { score: number; scoreRate: number; completedAt: string; duration: number }[];
  bestScore: number;
  bestRate: number;
}

export interface WeakQuestion {
  questionId: string;
  chapter: string;
  wrongCount: number;
  totalAttempts: number;
  wrongRate: number;
  selectedPattern: Record<string, number>;
  correctAnswer: string[];
  alwaysSameWrong: boolean;
}

export interface TimelinePoint {
  completedAt: string;
  scoreRate: number;
  examSet: number;
  movingAvg: number | null;
}

export interface AnalyticsData {
  results: { fileName: string; result: ExamResult }[];
  chapterStats: ChapterStat[];
  setStats: SetStat[];
  weakQuestions: WeakQuestion[];
  timeline: TimelinePoint[];
  totalExams: number;
  averageScore: number;
  bestScore: number;
  passCount: number;
}

function computeAnalytics(results: { fileName: string; result: ExamResult }[]): AnalyticsData {
  const totalExams = results.length;

  if (totalExams === 0) {
    return {
      results,
      chapterStats: [],
      setStats: [],
      weakQuestions: [],
      timeline: [],
      totalExams: 0,
      averageScore: 0,
      bestScore: 0,
      passCount: 0,
    };
  }

  // Overall stats
  const scores = results.map((r) => r.result.scoreRate);
  const averageScore = Math.round((scores.reduce((a, b) => a + b, 0) / totalExams) * 10) / 10;
  const bestScore = Math.max(...scores);
  const passCount = results.filter((r) => r.result.score >= 40).length;

  // Chapter stats (aggregate across all exams)
  const chapterMap = new Map<string, { total: number; correct: number }>();
  for (const { result } of results) {
    for (const ans of result.answers) {
      const stat = chapterMap.get(ans.chapter) || { total: 0, correct: 0 };
      stat.total++;
      if (ans.isCorrect) stat.correct++;
      chapterMap.set(ans.chapter, stat);
    }
  }
  const chapterStats: ChapterStat[] = [...chapterMap.entries()]
    .map(([chapter, stat]) => ({
      chapter,
      total: stat.total,
      correct: stat.correct,
      rate: Math.round((stat.correct / stat.total) * 1000) / 10,
    }))
    .sort((a, b) => a.chapter.localeCompare(b.chapter));

  // Set stats (group by examSet)
  const setMap = new Map<number, SetStat>();
  for (const { result } of results) {
    const existing = setMap.get(result.examSet);
    const attempt = {
      score: result.score,
      scoreRate: result.scoreRate,
      completedAt: result.completedAt,
      duration: result.duration,
    };
    if (existing) {
      existing.attempts.push(attempt);
      if (result.scoreRate > existing.bestRate) {
        existing.bestScore = result.score;
        existing.bestRate = result.scoreRate;
      }
    } else {
      setMap.set(result.examSet, {
        examSet: result.examSet,
        attempts: [attempt],
        bestScore: result.score,
        bestRate: result.scoreRate,
      });
    }
  }
  // Sort attempts chronologically
  for (const stat of setMap.values()) {
    stat.attempts.sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  }
  const setStats = [...setMap.values()].sort((a, b) => a.examSet - b.examSet);

  // Weak questions (wrong 2+ times) with selection pattern
  const questionMap = new Map<string, {
    chapter: string;
    wrongCount: number;
    totalAttempts: number;
    selectedPattern: Record<string, number>;
    correctAnswer: string[];
    wrongSelections: string[][];
  }>();
  for (const { result } of results) {
    for (const ans of result.answers) {
      const existing = questionMap.get(ans.questionId) || {
        chapter: ans.chapter,
        wrongCount: 0,
        totalAttempts: 0,
        selectedPattern: {},
        correctAnswer: ans.correct,
        wrongSelections: [],
      };
      existing.totalAttempts++;
      if (!ans.isCorrect) {
        existing.wrongCount++;
        // Track selected options when wrong
        for (const sel of ans.selected) {
          existing.selectedPattern[sel] = (existing.selectedPattern[sel] || 0) + 1;
        }
        existing.wrongSelections.push([...ans.selected].sort());
      }
      questionMap.set(ans.questionId, existing);
    }
  }
  const weakQuestions: WeakQuestion[] = [...questionMap.entries()]
    .filter(([, stat]) => stat.wrongCount >= 2)
    .map(([questionId, stat]) => {
      // Check if always same wrong answer
      const alwaysSameWrong = stat.wrongSelections.length >= 2 &&
        stat.wrongSelections.every((sel) => sel.join(',') === stat.wrongSelections[0].join(','));

      return {
        questionId,
        chapter: stat.chapter,
        wrongCount: stat.wrongCount,
        totalAttempts: stat.totalAttempts,
        wrongRate: Math.round((stat.wrongCount / stat.totalAttempts) * 1000) / 10,
        selectedPattern: stat.selectedPattern,
        correctAnswer: stat.correctAnswer,
        alwaysSameWrong,
      };
    })
    .sort((a, b) => b.wrongCount - a.wrongCount || b.wrongRate - a.wrongRate);

  // Timeline (all exams sorted chronologically with moving average)
  const sorted = [...results].sort((a, b) =>
    a.result.completedAt.localeCompare(b.result.completedAt)
  );
  const timeline: TimelinePoint[] = sorted.map((r, i) => {
    let movingAvg: number | null = null;
    if (i >= 2) {
      const window = sorted.slice(i - 2, i + 1);
      movingAvg = Math.round(
        (window.reduce((sum, w) => sum + w.result.scoreRate, 0) / window.length) * 10
      ) / 10;
    }
    return {
      completedAt: r.result.completedAt,
      scoreRate: r.result.scoreRate,
      examSet: r.result.examSet,
      movingAvg,
    };
  });

  return {
    results,
    chapterStats,
    setStats,
    weakQuestions,
    timeline,
    totalExams,
    averageScore,
    bestScore,
    passCount,
  };
}

export default async function HistoryPage() {
  const results = await getExamResults();
  const analytics = computeAnalytics(results);

  return <HistoryClient analytics={analytics} />;
}
