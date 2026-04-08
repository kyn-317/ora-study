'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface KeywordStudyData {
  definition: string;
  keyPoints: string[];
  relatedKeywords: string[];
  sourceSection: string;
  title: string;
}

export interface StudyPanelItem {
  keyword: string;
  studyId: string;
  chapterId: string;
  title: string;
  fileName: string;
  content: StudyContentData | null;
  keywordStudy?: KeywordStudyData | null;
}

export interface StudyContentData {
  id: string;
  title: string;
  chapter: string;
  description: string;
  sections: StudySectionData[];
}

interface StudySectionData {
  sectionId: string;
  title: string;
  content: string;
  subsections?: StudySectionData[];
  key_points?: string[];
}

interface StudyPanelProps {
  items: StudyPanelItem[];
  onRemove: (keyword: string, studyId: string) => void;
  onClose: () => void;
}

function KeywordStudyRenderer({ data, keyword }: { data: KeywordStudyData; keyword: string }) {
  return (
    <div style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--foreground)' }}>
      {/* Definition */}
      <div style={{
        padding: '0.75rem 1rem',
        background: 'rgba(67, 171, 240, 0.08)',
        borderRadius: '10px',
        marginBottom: '0.75rem',
        borderLeft: '3px solid var(--color-4)',
      }}>
        <strong style={{ color: 'var(--color-4)', fontSize: '0.8rem' }}>{keyword}</strong>
        <p style={{ margin: '0.35rem 0 0', color: 'var(--foreground)' }}>{data.definition}</p>
      </div>

      {/* Key Points */}
      <div style={{
        padding: '0.75rem 1rem',
        background: 'rgba(111, 107, 234, 0.08)',
        borderRadius: '10px',
        marginBottom: '0.75rem',
        borderLeft: '3px solid var(--color-3)',
      }}>
        <strong style={{ color: 'var(--color-3)', fontSize: '0.8rem' }}>핵심 포인트</strong>
        <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.25rem' }}>
          {data.keyPoints.map((kp, i) => (
            <li key={i} style={{ marginBottom: '0.25rem' }}>{kp}</li>
          ))}
        </ul>
      </div>

      {/* Related Keywords */}
      {data.relatedKeywords.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.25rem', lineHeight: '24px' }}>관련:</span>
          {data.relatedKeywords.map((rk, i) => (
            <span key={i} style={{
              display: 'inline-block',
              padding: '0.1rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.73rem',
              background: 'rgba(67, 171, 240, 0.1)',
              color: 'var(--color-4)',
              border: '1px solid rgba(67, 171, 240, 0.2)',
            }}>
              {rk}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionRenderer({ section, level = 0 }: { section: StudySectionData; level?: number }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <h4 style={{
        fontSize: level === 0 ? '1rem' : '0.9rem',
        color: level === 0 ? 'var(--color-2)' : 'var(--color-1)',
        marginBottom: '0.5rem',
        paddingLeft: level > 0 ? '0.75rem' : 0,
        borderLeft: level > 0 ? '2px solid var(--color-1)' : 'none',
      }}>
        {section.title}
      </h4>
      <div className="markdown-content" style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--foreground)' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
      </div>
      {section.key_points && section.key_points.length > 0 && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.75rem',
          background: 'rgba(111, 107, 234, 0.1)',
          borderRadius: '8px',
          borderLeft: '3px solid var(--color-3)',
          fontSize: '0.8rem',
        }}>
          <strong style={{ color: 'var(--color-3)' }}>핵심</strong>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            {section.key_points.map((kp, i) => <li key={i} style={{ marginBottom: '0.15rem' }}>{kp}</li>)}
          </ul>
        </div>
      )}
      {section.subsections?.map((sub, i) => (
        <SectionRenderer key={sub.sectionId || `sub-${i}`} section={sub} level={level + 1} />
      ))}
    </div>
  );
}

export default function StudyPanel({ items, onRemove, onClose }: StudyPanelProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // 새 아이템 추가 시 자동 확장
  useEffect(() => {
    if (items.length > 0) {
      const lastItem = items[items.length - 1];
      const key = `${lastItem.keyword}-${lastItem.studyId}`;
      setExpandedItems(prev => new Set(prev).add(key));
    }
  }, [items.length]);

  if (items.length === 0) return null;

  const toggleExpand = (key: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div style={{
      background: 'var(--surface)',
      borderLeft: '2px solid var(--color-4)',
      borderRadius: '16px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        padding: '1rem 1.25rem',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
      }}>
        <span style={{ fontWeight: 700, color: 'var(--color-4)', fontSize: '0.95rem' }}>
          학습 자료 ({items.length})
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '1.2rem',
            padding: '0.25rem 0.5rem',
          }}
        >
          ✕
        </button>
      </div>

      {/* Items */}
      <div style={{ padding: '0.75rem' }}>
        {items.map((item) => {
          const itemKey = `${item.keyword}-${item.studyId}`;
          const isExpanded = expandedItems.has(itemKey);

          return (
            <div
              key={itemKey}
              style={{
                marginBottom: '0.75rem',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'var(--glass-bg)',
              }}
            >
              {/* Item Header */}
              <div
                onClick={() => toggleExpand(itemKey)}
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: isExpanded ? 'rgba(67, 171, 240, 0.08)' : 'transparent',
                }}
              >
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: 'rgba(67, 171, 240, 0.15)',
                    color: 'var(--color-4)',
                    marginRight: '0.5rem',
                  }}>
                    {item.keyword}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--foreground)' }}>
                    {item.title}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Ch.{item.chapterId} &middot; {item.studyId}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(item.keyword, item.studyId); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      padding: '0.1rem 0.3rem',
                    }}
                  >
                    ✕
                  </button>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                    ▼
                  </span>
                </div>
              </div>

              {/* Item Content */}
              {isExpanded && item.keywordStudy && (
                <div style={{
                  padding: '1rem',
                  borderTop: '1px solid var(--glass-border)',
                }}>
                  <KeywordStudyRenderer data={item.keywordStudy} keyword={item.keyword} />
                </div>
              )}

              {isExpanded && !item.keywordStudy && item.content && (
                <div style={{
                  padding: '1rem',
                  borderTop: '1px solid var(--glass-border)',
                }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                    {item.content.description}
                  </p>
                  {item.content.sections.map(sec => (
                    <SectionRenderer key={sec.sectionId} section={sec} />
                  ))}
                </div>
              )}

              {isExpanded && !item.keywordStudy && !item.content && (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Loading...
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
