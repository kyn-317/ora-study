import { getCustomChapterList } from '../../lib/data';
import DemoTestClient from './DemoTestClient';

export default async function DemoTestPage() {
  const chapters = await getCustomChapterList();

  return <DemoTestClient chapters={chapters} />;
}
