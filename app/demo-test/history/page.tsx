import { getDemoTestResults } from '../../../lib/data';
import DemoHistoryClient from './DemoHistoryClient';

export default async function DemoHistoryPage() {
  const results = await getDemoTestResults();
  return <DemoHistoryClient results={results} />;
}
