import Link from 'next/link';
import { getStudyData, StudySection, Visual } from '../../../lib/data';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import VisualFigure from '../../../components/VisualFigure';

export default async function DetailPage({ params }: { params: Promise<{ chapterId: string, id: string }> }) {
  const { chapterId, id } = await params;
  const data = await getStudyData(chapterId, id);

  if (!data) {
    return (
      <main className="app-shell">
        <p className="lead">Study material not found.</p>
      </main>
    );
  }

  const renderSqlExamples = (exampleIds: string[] = []) => {
    if (!exampleIds || exampleIds.length === 0) return null;
    return (
      <details style={{
        marginTop: 20,
        border: '1px solid var(--rule)',
        background: 'var(--paper-2)',
      }}>
        <summary style={{
          padding: '10px 16px',
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          fontWeight: 600,
          listStyle: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>SQL 실습 예제 · {exampleIds.length}</span>
          <span style={{ color: 'var(--ink-3)', fontSize: 10 }}>▾</span>
        </summary>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, borderTop: '1px solid var(--rule)' }}>
          {exampleIds.map(eid => {
            const ex = data.sql_examples.find(s => s.sqlExamplesId === eid);
            if (!ex) return null;
            return (
              <div key={ex.sqlExamplesId} className="code">
                <div className="code-head">
                  <span>{ex.title}</span>
                  <span className="lang">sql</span>
                </div>
                <pre><code>{ex.sql}</code></pre>
                {ex.description && (
                  <div style={{
                    padding: '8px 14px',
                    background: 'var(--paper-3)',
                    borderTop: '1px solid var(--rule)',
                    color: 'var(--ink-2)',
                    fontSize: 12,
                    fontFamily: 'var(--font-sans)',
                  }}>
                    {ex.description}
                  </div>
                )}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, margin: '18px 0' }}>
        {filtered.map(v => (
          <VisualFigure key={v.id} visual={v} />
        ))}
      </div>
    );
  };

  const renderSection = (sec: StudySection, level: number = 1) => {
    const isTopLevel = level === 1;
    return (
      <section
        key={sec.sectionId || sec.title}
        className="study-section-card"
        style={{
          marginBottom: isTopLevel ? 28 : 16,
          padding: isTopLevel ? '28px 32px' : '18px 20px',
          background: isTopLevel ? 'var(--paper)' : 'var(--paper-2)',
        }}
      >
        {isTopLevel ? (
          <>
            <div className="section-label">Section {sec.sectionId ?? ''}</div>
            <h2 className="section-title" style={{ marginBottom: 18 }}>{sec.title}</h2>
          </>
        ) : (
          <h3 className="sub">{sec.title}</h3>
        )}

        {renderVisuals(sec.visuals, 'before-content')}

        <div className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ children, ...props }) => (
                <div className="table-wrapper"><table {...props}>{children}</table></div>
              ),
            }}
          >
            {sec.content}
          </ReactMarkdown>
        </div>

        {renderVisuals(sec.visuals, 'after-content')}

        {sec.key_points && sec.key_points.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div className="section-label" style={{ color: 'var(--note)' }}>Key Points · 핵심</div>
            <ol className="keypoints" style={{ margin: '8px 0 0' }}>
              {sec.key_points.map((kp, i) => (
                <li key={i}>
                  <span>{kp}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {renderVisuals(sec.visuals, 'after-keypoints')}

        {sec.subsections && sec.subsections.length > 0 && (
          <details style={{
            marginTop: 22,
            border: '1px solid var(--rule)',
            background: 'var(--paper)',
          }}>
            <summary style={{
              padding: '10px 16px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--info)',
              fontWeight: 600,
              listStyle: 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>세부 내용 · {sec.subsections.length}</span>
              <span style={{ color: 'var(--ink-3)', fontSize: 10 }}>▾</span>
            </summary>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, borderTop: '1px solid var(--rule)' }}>
              {sec.subsections.map(sub => renderSection(sub, level + 1))}
            </div>
          </details>
        )}

        {renderSqlExamples(sec.sqlExamplesIds)}
      </section>
    );
  };

  return (
    <main>
      <div className="study-header-banner">
        <div className="inner">
          <Link href={chapterId === '00' ? '/' : `/${chapterId}`} className="back-link-light">
            ← {chapterId === '00' ? 'Back to Home' : `Back to Chapter ${chapterId}`}
          </Link>
          <div className="tag">{data.chapter}</div>
          <h1>{data.title}</h1>
          <p>{data.description}</p>
        </div>
      </div>

      <div className="app-shell" style={{ paddingTop: 40 }}>
        {data.oracle26ai_changes && (
          <div className="callout info" style={{ marginBottom: 36 }}>
            <div className="icon">23ai</div>
            <div className="body">
              <span className="label">Oracle 23ai 변경 사항</span>
              <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
                {data.oracle26ai_changes.map((change, i) => (
                  <li key={i} style={{ marginBottom: 3 }}>{change}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {data.sections.map(sec => renderSection(sec))}
      </div>
    </main>
  );
}
