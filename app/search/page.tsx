import { Suspense } from 'react';
import SearchClient from './SearchClient';

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="app-shell"><p className="lead">검색 로딩 중…</p></main>}>
      <SearchClient />
    </Suspense>
  );
}
