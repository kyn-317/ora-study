import Link from 'next/link';
import { getStudyData, StudySection, SqlExample, Visual } from '../../../lib/data';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default async function DetailPage({ params }: { params: Promise<{ chapterId: string, id: string }> }) {
  const { chapterId, id } = await params;
  const data = await getStudyData(chapterId, id);

  if (!data) {
    return <main style={{ padding: '4rem 2rem', color: 'white' }}>Study material not found.</main>;
  }

  // Helper to find SQL examples safely
  const renderSqlExamples = (exampleIds: string[] = []) => {
    if (!exampleIds || exampleIds.length === 0) return null;
    return (
      <details style={{ marginTop: '1.5rem', background: 'rgba(30,31,41,0.4)', borderRadius: '12px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
        <summary style={{ padding: '1rem', cursor: 'pointer', fontWeight: 600, color: 'var(--color-4)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>💻 SQL 실습 예제 ({exampleIds.length}개)</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>클릭하여 펼치기</span>
        </summary>
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--glass-border)' }}>
          {exampleIds.map(eid => {
            const ex = data.sql_examples.find(s => s.sqlExamplesId === eid);
            if (!ex) return null;
            return (
              <div key={ex.sqlExamplesId} style={{
                background: '#0D0E12',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <div style={{ background: 'var(--glass-bg)', padding: '0.75rem 1rem', borderBottom: '1px solid var(--glass-border)' }}>
                  <span style={{ color: 'var(--color-1)', fontWeight: 600, fontSize: '0.9rem' }}>{ex.title}</span>
                </div>
                <div style={{ padding: '1rem', overflowX: 'auto' }}>
                  <pre style={{ margin: 0, color: '#e2e8f0', fontFamily: "var(--font-geist-mono), 'Courier New', monospace", fontSize: '0.9rem' }}>
                    <code>{ex.sql}</code>
                  </pre>
                </div>
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {ex.description}
                </div>
              </div>
            );
          })}
        </div>
      </details>
    );
  };

  const renderVisuals = (visuals: Visual[] | undefined, placement: Visual['placement']) => {
    const filtered = visuals?.filter(v => v.placement === placement);
    if (!filtered || filtered.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: '1.5rem 0' }}>
        {filtered.map(v => (
          <figure key={v.id} style={{ margin: 0, textAlign: 'center' }}>
            {v.type === 'svg' && (
              <img
                src={v.src}
                alt={v.caption}
                style={{
                  width: v.width || '100%',
                  maxWidth: '100%',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '1rem',
                }}
              />
            )}
            {v.type === 'html' && (
              <iframe
                src={v.src}
                title={v.caption}
                style={{
                  width: v.width || '100%',
                  minHeight: '300px',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  background: 'transparent',
                }}
              />
            )}
            {v.type === 'mermaid' && v.mermaidCode && (
              <pre style={{
                textAlign: 'left',
                background: 'rgba(0,0,0,0.3)',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                overflow: 'auto',
                color: 'var(--foreground)',
                fontSize: '0.9rem',
              }}>
                <code className="language-mermaid">{v.mermaidCode}</code>
              </pre>
            )}
            <figcaption style={{
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              marginTop: '0.5rem',
              fontStyle: 'italic',
            }}>
              {v.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    );
  };

  const renderSection = (sec: StudySection, level: number = 1) => {
    const isTopLevel = level === 1;
    return (
      <section 
        key={sec.sectionId || sec.title} 
        className={`study-section-card ${isTopLevel ? "glass" : ""}`}
        style={{
          marginBottom: isTopLevel ? '3rem' : '1.5rem',
          padding: isTopLevel ? '2.5rem' : '1.5rem',
          border: isTopLevel ? '1px solid var(--color-4)' : '1px solid var(--glass-border)',
          borderRadius: '20px',
          background: isTopLevel ? 'var(--glass-bg)' : 'rgba(0, 0, 0, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isTopLevel ? '0 10px 30px rgba(0,0,0,0.2)' : 'none'
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: isTopLevel ? '6px' : '4px',
          height: '100%',
          background: isTopLevel ? 'var(--color-2)' : 'var(--color-1)',
        }} />
        <h2 style={{
          fontSize: isTopLevel ? '1.8rem' : '1.4rem',
          color: isTopLevel ? 'var(--color-2)' : 'var(--color-1)',
          marginBottom: '1.5rem',
          paddingLeft: '0.5rem',
          borderBottom: isTopLevel ? '1px solid rgba(255,255,255,0.1)' : 'none',
          paddingBottom: isTopLevel ? '1rem' : '0'
        }}>
          {sec.title}
        </h2>
        
        {renderVisuals(sec.visuals, 'before-content')}

        <div className="markdown-content" style={{ color: 'var(--foreground)', lineHeight: 1.7 }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ table: ({ children, ...props }) => (<div className="table-wrapper"><table {...props}>{children}</table></div>) }}>
            {sec.content}
          </ReactMarkdown>
        </div>

        {renderVisuals(sec.visuals, 'after-content')}

        {sec.key_points && sec.key_points.length > 0 && (
          <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(111, 107, 234, 0.1)', borderRadius: '12px', borderLeft: '4px solid var(--color-3)' }}>
            <h4 style={{ color: 'var(--color-3)', marginBottom: '0.5rem' }}>🔥 핵심 정리</h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--foreground)' }}>
              {sec.key_points.map((kp, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{kp}</li>)}
            </ul>
          </div>
        )}

        {renderVisuals(sec.visuals, 'after-keypoints')}

        {/* Subsections first, then SQL */}
        {sec.subsections && sec.subsections.length > 0 && (
          <details style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
             <summary style={{ padding: '1rem', cursor: 'pointer', fontWeight: 600, color: 'var(--color-5)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📚 세부 내용 ({sec.subsections.length}개)</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>클릭하여 펼치기</span>
            </summary>
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', borderTop: '1px solid var(--glass-border)' }}>
              {sec.subsections.map(sub => renderSection(sub, level + 1))}
            </div>
          </details>
        )}

        {renderSqlExamples(sec.sqlExamplesIds)}
      </section>
    );
  }

  return (
    <main style={{ padding: '0', maxWidth: '100%', margin: '0' }}>
      {/* Header Banner */}
      <div className="bg-gradient-primary study-header-banner" style={{ padding: '4rem 2rem', borderRadius: '0 0 30px 30px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Link href={chapterId === '00' ? '/' : `/${chapterId}`} style={{ color: 'white', opacity: 0.8, textDecoration: 'none', marginBottom: '1rem', display: 'inline-block', fontSize: '0.9rem' }}>
            &larr; {chapterId === '00' ? 'Back to Home' : `Back to ${chapterId}`}
          </Link>
          <div style={{ color: 'var(--color-6)', fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>
            {data.chapter}
          </div>
          <h1 style={{ fontSize: '3rem', color: 'white', marginBottom: '1rem', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            {data.title}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', maxWidth: '800px', lineHeight: 1.6 }}>
            {data.description}
          </p>
        </div>
      </div>

      <div className="study-content-area" style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem' }}>
        {data.oracle26ai_changes && (
          <div className="glass" style={{ padding: '2rem', borderRadius: '20px', marginBottom: '4rem', borderColor: 'var(--color-4)' }}>
            <h3 style={{ color: 'var(--color-4)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ✨ Oracle 23ai 변경 사항
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--foreground)' }}>
              {data.oracle26ai_changes.map((change, i) => (
                <li key={i} style={{ marginBottom: '0.5rem' }}>{change}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {data.sections.map(sec => renderSection(sec))}
        </div>
      </div>
    </main>
  );
}
