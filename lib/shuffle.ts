import type { QuizQuestion } from './data';

export function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function shuffleArray<T>(arr: T[], rng: () => number = Math.random): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

function remapLettersInExplanation(text: string, letterMap: Map<string, string>): string {
  // "A)", "B)" 등 보기 지시 letter 패턴 리매핑
  let result = text.replace(/([A-E])\)/g, (_m, letter: string) => {
    const newL = letterMap.get(letter) ?? letter;
    return `${newL})`;
  });

  // "정답: A", "정답: A, B" 같은 헤더 letter 리매핑
  result = result.replace(
    /(정답\s*[:：]\s*)([A-E](?:\s*[,、]\s*[A-E])*)/g,
    (_m, prefix: string, letters: string) => {
      const remapped = letters.replace(/[A-E]/g, (l) => letterMap.get(l) ?? l);
      return prefix + remapped;
    },
  );

  return result;
}

export function shuffleQuestionOptions(
  q: QuizQuestion,
  rng: () => number = Math.random,
): QuizQuestion {
  const entries = q.options.map((opt) => {
    const match = opt.match(/^([A-E])\)\s*/);
    return {
      letter: match ? match[1] : '',
      text: opt.replace(/^[A-E]\)\s*/, ''),
    };
  });

  const shuffled = shuffleArray(entries, rng);
  const letterMap = new Map<string, string>();
  shuffled.forEach((entry, i) => {
    if (entry.letter && i < LETTERS.length) {
      letterMap.set(entry.letter, LETTERS[i]);
    }
  });

  const newOptions = shuffled.map((entry, i) => `${LETTERS[i] ?? entry.letter}) ${entry.text}`);
  const newAnswer = q.answer.map((a) => letterMap.get(a) ?? a);
  const newExplanation = q.explanation
    ? remapLettersInExplanation(q.explanation, letterMap)
    : q.explanation;

  return {
    ...q,
    options: newOptions,
    answer: newAnswer,
    explanation: newExplanation,
  };
}
