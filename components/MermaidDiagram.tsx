'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

function tok(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

let initialized = false;

function ensureInit() {
  if (initialized) return;
  initialized = true;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      background:           tok('--paper'),
      mainBkg:              tok('--paper-2'),
      primaryColor:         tok('--paper-2'),
      primaryBorderColor:   tok('--ink-2'),
      primaryTextColor:     tok('--ink'),
      lineColor:            tok('--ink-3'),
      secondaryColor:       tok('--accent-bg'),
      tertiaryColor:        tok('--correct-bg'),
      noteBkgColor:         tok('--note-bg'),
      noteBorderColor:      tok('--rule'),
      noteTextColor:        tok('--ink'),
      edgeLabelBackground:  tok('--paper'),
      // Sequence
      actorBkg:             tok('--paper-2'),
      actorBorder:          tok('--ink-2'),
      actorTextColor:       tok('--ink'),
      actorLineColor:       tok('--ink-3'),
      signalColor:          tok('--ink-2'),
      signalTextColor:      tok('--ink'),
      labelBoxBkgColor:     tok('--accent-bg'),
      labelBoxBorderColor:  tok('--accent'),
      labelTextColor:       tok('--ink'),
      loopTextColor:        tok('--ink-2'),
      activationBorderColor: tok('--accent'),
      activationBkgColor:   tok('--accent-bg'),
      // Font
      fontFamily: "'Noto Sans JP', 'Noto Sans KR', sans-serif",
      fontSize: '14px',
    },
    flowchart: { curve: 'basis', padding: 14, htmlLabels: true },
    sequence: { actorMargin: 64, boxMargin: 10, messageMargin: 40, mirrorActors: false },
    er: { layoutDirection: 'LR' },
    securityLevel: 'loose',
  });
}

let idCounter = 0;

export default function MermaidDiagram({ code }: { code: string }) {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const id = useRef(`mmd-${++idCounter}`);

  useEffect(() => {
    ensureInit();
    setSvg('');
    setError('');
    mermaid
      .render(id.current, code)
      .then(({ svg }) => setSvg(svg))
      .catch(err => setError(err?.message ?? String(err)));
  }, [code]);

  if (error) {
    return (
      <div style={{
        color: 'var(--wrong)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        padding: '8px 12px',
        border: '1px solid var(--rule)',
        background: 'var(--wrong-bg)',
      }}>
        render error: {error}
      </div>
    );
  }

  if (!svg) {
    return (
      <div style={{ color: 'var(--ink-4)', fontSize: 12, padding: '12px 0' }}>
        rendering…
      </div>
    );
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--rule)',
        padding: 20,
        maxWidth: '100%',
        overflowX: 'auto',
      }}
    />
  );
}
