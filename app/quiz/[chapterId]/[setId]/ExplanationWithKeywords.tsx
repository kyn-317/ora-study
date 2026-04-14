'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export interface KeywordEntry {
  studyId: string;
  chapterId: string;
  title: string;
  fileName: string;
  hasKeywordStudy?: boolean;
}

interface ExplanationWithKeywordsProps {
  text: string;
  keywordIndex: Record<string, KeywordEntry[]>;
  onStudySelect: (keyword: string, entry: KeywordEntry) => void;
}

interface MatchedSegment {
  type: 'text' | 'keyword';
  value: string;
  keyword?: string;
}

function buildSegments(text: string, keywords: string[]): MatchedSegment[] {
  if (keywords.length === 0) return [{ type: 'text', value: text }];

  const sorted = [...keywords].sort((a, b) => b.length - a.length);
  const escaped = sorted.map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');

  const segments: MatchedSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    const matchedText = match[1];
    const originalKeyword = sorted.find(kw => kw.toLowerCase() === matchedText.toLowerCase()) ?? matchedText;
    segments.push({ type: 'keyword', value: matchedText, keyword: originalKeyword });
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments;
}

function KeywordPopup({
  keyword,
  entries,
  position,
  onSelect,
  onClose,
}: {
  keyword: string;
  entries: KeywordEntry[];
  position: { top: number; left: number };
  onSelect: (entry: KeywordEntry) => void;
  onClose: () => void;
}) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState(position);

  // 외부 클릭 시 닫기 — pointerdown으로 모바일 지원
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // 약간의 딜레이로 현재 클릭이 바로 닫히지 않도록
    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', handler);
    }, 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', handler);
    };
  }, [onClose]);

  // 팝업 위치 조정 (화면 밖으로 나가지 않도록)
  useEffect(() => {
    if (!popupRef.current) return;
    const rect = popupRef.current.getBoundingClientRect();
    let newTop = position.top;
    let newLeft = position.left;

    // 오른쪽 넘침
    if (rect.right > window.innerWidth) {
      newLeft = Math.max(8, window.innerWidth - rect.width - 8);
    }
    // 아래쪽 넘침
    if (rect.bottom > window.innerHeight) {
      newTop = Math.max(8, position.top - rect.height - 8);
    }
    // 왼쪽 넘침
    if (newLeft < 8) {
      newLeft = 8;
    }

    if (newTop !== position.top || newLeft !== position.left) {
      setAdjustedPos({ top: newTop, left: newLeft });
    }
  }, [position]);

  return (
    <div
      ref={popupRef}
      style={{
        position: 'fixed',
        top: adjustedPos.top,
        left: adjustedPos.left,
        zIndex: 1000,
        background: 'var(--surface)',
        border: '1px solid var(--color-4)',
        borderRadius: '12px',
        padding: '0.5rem',
        minWidth: '250px',
        maxWidth: 'min(400px, calc(100vw - 16px))',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
      }}
    >
      <div style={{
        padding: '0.5rem 0.75rem',
        fontSize: '0.8rem',
        color: 'var(--color-4)',
        fontWeight: 600,
        borderBottom: '1px solid var(--glass-border)',
        marginBottom: '0.25rem',
      }}>
        {keyword}
      </div>
      {entries.map((entry, idx) => (
        <div
          key={`${entry.chapterId}-${entry.studyId}-${idx}`}
          onClick={(e) => { e.stopPropagation(); onSelect(entry); onClose(); }}
          onTouchEnd={(e) => { e.stopPropagation(); onSelect(entry); onClose(); }}
          style={{
            padding: '0.6rem 0.75rem',
            cursor: 'pointer',
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: 'var(--foreground)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(41, 128, 185, 0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{ fontWeight: 500 }}>{entry.title}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Ch.{entry.chapterId} &middot; {entry.studyId}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ExplanationWithKeywords({ text, keywordIndex, onStudySelect }: ExplanationWithKeywordsProps) {
  const [popup, setPopup] = useState<{ keyword: string; entries: KeywordEntry[]; position: { top: number; left: number } } | null>(null);

  const relevantKeywords = Object.keys(keywordIndex).filter(kw => {
    const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    return regex.test(text);
  });

  const segments = buildSegments(text, relevantKeywords);

  const handleKeywordClick = useCallback((e: React.MouseEvent | React.TouchEvent, keyword: string) => {
    e.preventDefault();
    e.stopPropagation();

    const entries = keywordIndex[keyword];
    if (!entries || entries.length === 0) return;

    // 1개면 바로 선택
    if (entries.length === 1) {
      onStudySelect(keyword, entries[0]);
      return;
    }

    // 클릭/터치 위치에서 팝업 위치 계산
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    setPopup({
      keyword,
      entries,
      position: { top: rect.bottom + 4, left: rect.left },
    });
  }, [keywordIndex, onStudySelect]);

  return (
    <div style={{ whiteSpace: 'pre-wrap', position: 'relative' }}>
      {segments.map((seg, idx) => {
        if (seg.type === 'text') {
          return <span key={idx}>{seg.value}</span>;
        }
        return (
          <span
            key={idx}
            role="button"
            tabIndex={0}
            onClick={(e) => handleKeywordClick(e, seg.keyword!)}
            onTouchEnd={(e) => handleKeywordClick(e, seg.keyword!)}
            style={{
              color: 'var(--color-4)',
              borderBottom: '1px dashed var(--color-4)',
              cursor: 'pointer',
              transition: 'color 0.15s',
              WebkitTapHighlightColor: 'rgba(41, 128, 185, 0.2)',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-5)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-4)')}
          >
            {seg.value}
          </span>
        );
      })}

      {popup && (
        <KeywordPopup
          keyword={popup.keyword}
          entries={popup.entries}
          position={popup.position}
          onSelect={(entry) => onStudySelect(popup.keyword, entry)}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
