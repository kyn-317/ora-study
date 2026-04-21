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
    <div>
      <div style={{
        padding: '10px 14px',
        background: 'var(--accent-bg)',
        borderLeft: '2px solid var(--accent)',
        marginBottom: 10,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          marginBottom: 4,
          fontWeight: 600,
        }}>
          {keyword}
        </div>
        <p style={{ margin: 0, color: 'var(--ink)', fontSize: 13, lineHeight: 1.6 }}>{data.definition}</p>
      </div>

      <div style={{
        padding: '10px 14px',
        background: 'var(--paper-2)',
        borderLeft: '2px solid var(--ink-2)',
        marginBottom: 10,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--ink-2)',
          marginBottom: 6,
          fontWeight: 600,
        }}>
          핵심 포인트
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--ink)', fontSize: 13, lineHeight: 1.65 }}>
          {data.keyPoints.map((kp, i) => (
            <li key={i} style={{ marginBottom: 3 }}>{kp}</li>
          ))}
        </ul>
      </div>

      {data.relatedKeywords.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
          }}>
            Related
          </span>
          {data.relatedKeywords.map((rk, i) => (
            <span key={i} className="tag-chip accent">{rk}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionRenderer({ section, level = 0 }: { section: StudySectionData; level?: number }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h4 style={{
        fontFamily: level === 0 ? 'var(--font-serif)' : 'var(--font-sans)',
        fontSize: level === 0 ? 14 : 13,
        fontWeight: level === 0 ? 500 : 600,
        color: 'var(--ink)',
        margin: '0 0 6px',
        paddingLeft: level > 0 ? 10 : 0,
        borderLeft: level > 0 ? '2px solid var(--accent-soft)' : 'none',
      }}>
        {section.title}
      </h4>
      <div className="markdown-content" style={{ fontSize: 12.5, lineHeight: 1.7 }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            table: ({ children, ...props }) => (
              <div className="table-wrapper"><table {...props}>{children}</table></div>
            ),
          }}
        >
          {section.content}
        </ReactMarkdown>
      </div>
      {section.key_points && section.key_points.length > 0 && (
        <div style={{
          marginTop: 8,
          padding: '8px 12px',
          background: 'var(--note-bg)',
          borderLeft: '2px solid var(--note)',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--note)',
            marginBottom: 4,
            fontWeight: 600,
          }}>
            핵심
          </div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, lineHeight: 1.6 }}>
            {section.key_points.map((kp, i) => <li key={i} style={{ marginBottom: 2 }}>{kp}</li>)}
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
      background: 'var(--paper)',
      border: '1px solid var(--rule)',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'sticky',
        top: 0,
        padding: '10px 14px',
        background: 'var(--paper-2)',
        borderBottom: '1px solid var(--rule)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          fontWeight: 600,
        }}>
          Study · {items.length}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--ink-3)',
            cursor: 'pointer',
            fontSize: 16,
            padding: '2px 6px',
            lineHeight: 1,
          }}
          title="Close panel"
        >
          ✕
        </button>
      </div>

      <div style={{ padding: 10 }}>
        {items.map((item) => {
          const itemKey = `${item.keyword}-${item.studyId}`;
          const isExpanded = expandedItems.has(itemKey);

          return (
            <div
              key={itemKey}
              style={{
                marginBottom: 10,
                border: '1px solid var(--rule)',
                background: 'var(--paper)',
              }}
            >
              <div
                onClick={() => toggleExpand(itemKey)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: isExpanded ? 'var(--accent-bg)' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span className="tag-chip accent" style={{ fontSize: 10 }}>{item.keyword}</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'var(--ink-3)',
                      letterSpacing: '0.06em',
                    }}>
                      Ch.{item.chapterId} · {item.studyId}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: 'var(--ink)',
                    lineHeight: 1.4,
                  }}>
                    {item.title}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 10 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(item.keyword, item.studyId); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--ink-3)',
                      cursor: 'pointer',
                      fontSize: 12,
                      padding: '2px 4px',
                    }}
                    title="Remove"
                  >
                    ✕
                  </button>
                  <span style={{
                    color: 'var(--ink-3)',
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s',
                  }}>
                    ▼
                  </span>
                </div>
              </div>

              {isExpanded && item.keywordStudy && (
                <div style={{ padding: 12, borderTop: '1px solid var(--rule)' }}>
                  <KeywordStudyRenderer data={item.keywordStudy} keyword={item.keyword} />
                </div>
              )}

              {isExpanded && !item.keywordStudy && item.content && (
                <div style={{ padding: 12, borderTop: '1px solid var(--rule)' }}>
                  <p style={{
                    fontSize: 12.5,
                    color: 'var(--ink-2)',
                    marginBottom: 12,
                    lineHeight: 1.6,
                  }}>
                    {item.content.description}
                  </p>
                  {item.content.sections.map(sec => (
                    <SectionRenderer key={sec.sectionId} section={sec} />
                  ))}
                </div>
              )}

              {isExpanded && !item.keywordStudy && !item.content && (
                <div style={{
                  padding: '18px 14px',
                  textAlign: 'center',
                  color: 'var(--ink-3)',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  borderTop: '1px solid var(--rule)',
                }}>
                  Loading…
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
