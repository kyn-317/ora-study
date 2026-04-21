'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Visual } from '../lib/data';

type Props = { visual: Visual };

export default function VisualFigure({ visual: v }: Props) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const canvasBg = 'var(--paper)';

  const clickableStyle: React.CSSProperties = {
    cursor: 'zoom-in',
    display: 'inline-block',
    maxWidth: '100%',
  };

  const openZoom = () => setOpen(true);

  return (
    <>
      <figure style={{ margin: 0, textAlign: 'center' }}>
        {v.type === 'svg' && (
          <img
            src={v.src}
            alt={v.caption}
            onClick={openZoom}
            style={{
              ...clickableStyle,
              width: v.width || '100%',
              border: '1px solid var(--rule)',
              background: canvasBg,
              borderRadius: 8,
              padding: 16,
            }}
          />
        )}
        {v.type === 'html' && (
          <div
            onClick={openZoom}
            style={{
              ...clickableStyle,
              position: 'relative',
              width: v.width || '100%',
            }}
          >
            <iframe
              src={v.src}
              title={v.caption}
              style={{
                width: '100%',
                minHeight: 300,
                border: '1px solid var(--rule)',
                background: 'var(--paper)',
                pointerEvents: 'none',
                display: 'block',
              }}
            />
          </div>
        )}
        <figcaption
          style={{
            color: 'var(--ink-3)',
            fontSize: 12,
            marginTop: 8,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em',
          }}
        >
          {v.caption} <span style={{ color: 'var(--ink-4)' }}>· 클릭하여 확대</span>
        </figcaption>
      </figure>

      {open && (
        <div
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={v.caption}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.82)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            cursor: 'zoom-out',
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            aria-label="닫기"
            style={{
              position: 'fixed',
              top: 16,
              right: 20,
              background: 'var(--paper)',
              color: 'var(--ink)',
              border: '1px solid var(--rule)',
              borderRadius: 6,
              padding: '6px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              cursor: 'pointer',
              zIndex: 1001,
            }}
          >
            ✕ ESC
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: canvasBg,
              borderRadius: 8,
              padding: v.type === 'svg' ? 24 : 0,
              cursor: 'default',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              flexShrink: 0,
            }}
          >
            {v.type === 'svg' && (
              <img
                src={v.src}
                alt={v.caption}
                style={{
                  display: 'block',
                  width: 'calc(95vw - 48px)',
                  height: 'calc(100vh - 140px)',
                  objectFit: 'contain',
                }}
              />
            )}
            {v.type === 'html' && (
              <iframe
                src={v.src}
                title={v.caption}
                style={{
                  width: '92vw',
                  height: 'calc(100vh - 140px)',
                  border: 'none',
                  background: 'var(--paper)',
                  display: 'block',
                }}
              />
            )}
          </div>

          <div
            style={{
              color: 'rgba(255,255,255,0.78)',
              fontSize: 13,
              marginTop: 14,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em',
              textAlign: 'center',
              maxWidth: '90vw',
            }}
          >
            {v.caption}
          </div>
        </div>
      )}
    </>
  );
}
