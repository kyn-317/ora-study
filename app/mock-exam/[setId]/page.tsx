import { getMockExamQuestions } from '../../../lib/data';
import MockExamClient from './MockExamClient';

interface PageProps {
  params: Promise<{ setId: string }>;
}

export default async function MockExamPage({ params }: PageProps) {
  const { setId } = await params;
  const setNum = parseInt(setId, 10);

  if (isNaN(setNum) || setNum < 1 || setNum > 5) {
    return (
      <main style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h1 style={{ color: '#f87171' }}>Invalid exam set</h1>
      </main>
    );
  }

  const questions = await getMockExamQuestions(setNum);

  if (questions.length === 0) {
    return (
      <main style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h1 style={{ color: '#f87171' }}>No questions found for Set {setNum}</h1>
      </main>
    );
  }

  return <MockExamClient questions={questions} setId={setNum} />;
}
