#!/usr/bin/env node

/**
 * svg-warm-paper-migrate.js
 *
 * 손으로 작성된 다크 팔레트 SVG (public/visuals/**\/*.svg, *_mermaid.svg 제외)
 * 를 웜 페이퍼 팔레트로 in-place 마이그레이션.
 *
 *   node scripts/svg-warm-paper-migrate.js [--dry] [--only=<glob>] [--file=<path>]
 *
 * 규칙:
 *  1) rgba(accent, alpha) → 대응 웜페이퍼 fill hex (솔리드). 저투명 티어 fills 손실 허용.
 *  2) rgba(255,255,255, a) / rgba(0,0,0, a) → alpha 유지하며 warm/ink 로 치환.
 *  3) 다크 슬레이트 텍스트/표면 → 웜페이퍼 ink/paper.
 *  4) 액센트 hex (strokes + solid fills) → 웜페이퍼 stroke 계열 hex.
 *  5) `<svg ...>` 바로 뒤에 `<rect width="100%" height="100%" fill="#faf8f3" />` 삽입
 *     (이미 웜페이퍼 배경이 있으면 skip).
 *
 * 검증:
 *  --dry 로 변경 라인 수만 출력. --file 로 단일 파일 검증 가능.
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const VISUALS_DIR = path.join(PROJECT_ROOT, 'public', 'visuals');

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry');
const ONLY = (argv.find(a => a.startsWith('--only=')) || '').split('=')[1] || null;
const FILE = (argv.find(a => a.startsWith('--file=')) || '').split('=')[1] || null;

// ----------------------------------------------------------
// Replacement rules — applied in listed order.
// ----------------------------------------------------------

// rgba accent fills → warm-paper solid fill hex
// Accepts any integer/float alpha. Matches the exact RGB triples used in the corpus.
const RGBA_ACCENT = [
  { re: /rgba\(\s*111\s*,\s*107\s*,\s*234\s*,\s*[\d.]+\s*\)/gi, to: '#d8cfe5' }, // purple/indigo
  { re: /rgba\(\s*59\s*,\s*130\s*,\s*246\s*,\s*[\d.]+\s*\)/gi,  to: '#dee5f5' }, // blue
  { re: /rgba\(\s*245\s*,\s*158\s*,\s*11\s*,\s*[\d.]+\s*\)/gi,  to: '#f0ddb3' }, // amber
  { re: /rgba\(\s*16\s*,\s*185\s*,\s*129\s*,\s*[\d.]+\s*\)/gi,  to: '#cfe1b8' }, // green
  { re: /rgba\(\s*244\s*,\s*63\s*,\s*94\s*,\s*[\d.]+\s*\)/gi,   to: '#f5d0d0' }, // rose/red
  { re: /rgba\(\s*239\s*,\s*68\s*,\s*68\s*,\s*[\d.]+\s*\)/gi,   to: '#f5d0d0' }, // red-500
  { re: /rgba\(\s*139\s*,\s*92\s*,\s*246\s*,\s*[\d.]+\s*\)/gi,  to: '#d8cfe5' }, // violet-500
  { re: /rgba\(\s*20\s*,\s*184\s*,\s*166\s*,\s*[\d.]+\s*\)/gi,  to: '#cfe1b8' }, // teal
  { re: /rgba\(\s*6\s*,\s*182\s*,\s*212\s*,\s*[\d.]+\s*\)/gi,   to: '#dee5f5' }, // cyan

  // Off-by-one / variant RGB triples present in the corpus (not from the canonical palette)
  { re: /rgba\(\s*42\s*,\s*43\s*,\s*61\s*,\s*[\d.]+\s*\)/gi,    to: '#f3efe4' }, // #2A2B3D rgba variant — dark card body
  { re: /rgba\(\s*107\s*,\s*107\s*,\s*234\s*,\s*[\d.]+\s*\)/gi, to: '#d8cfe5' }, // purple variant (107 vs 111)
  { re: /rgba\(\s*243\s*,\s*63\s*,\s*94\s*,\s*[\d.]+\s*\)/gi,   to: '#f5d0d0' }, // red variant (243 vs 244)
  { re: /rgba\(\s*148\s*,\s*163\s*,\s*184\s*,\s*[\d.]+\s*\)/gi, to: '#787368' }, // slate-400 rgba
];

// rgba neutrals — preserve alpha, swap channel to warm ink / warm paper
const RGBA_NEUTRAL = [
  // white overlays on dark canvas → ink shade on warm paper (subtle)
  { re: /rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*([\d.]+)\s*\)/gi, to: 'rgba(42,42,42,$1)' },
  // black overlays → warm ink (keep alpha)
  { re: /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*([\d.]+)\s*\)/gi,       to: 'rgba(42,42,42,$1)' },
];

// Hex colors — case-insensitive. Matched by exact value.
// Map value is the warm-paper replacement.
// Order: longer/more-specific first doesn't matter here since all keys are 4 or 7 chars fixed,
//        but we do run shorthand (#FFF/#fff) separately below.
const HEX_MAP = {
  // text · near-white slate → dark ink
  '#e2e8f0': '#1a1a1a',
  '#cbd5e1': '#4a4a46',
  '#94a3b8': '#787368',
  '#475569': '#787368',
  '#374151': '#787368',
  '#4b5563': '#787368',

  // dark surfaces → warm paper (paper-2 for mid-dark, paper for darkest)
  '#2a2b3d': '#f3efe4',
  '#1e1e2e': '#1a1a1a', // almost always badge TEXT fill → keep dark-ink
  '#1e1f2e': '#f3efe4',
  '#1a1a2e': '#f3efe4',
  '#1e293b': '#f3efe4',
  '#0f1019': '#faf8f3',
  '#0f172a': '#faf8f3',

  // accent strokes (and solid accent fills) → warm-paper stroke palette
  '#3b82f6': '#2456a8', // blue
  '#6f6bea': '#4a2e78', // indigo/purple
  '#f59e0b': '#8a5a10', // amber
  '#10b981': '#2f6a1c', // green
  '#f43f5e': '#be123c', // rose
  '#ef4444': '#be123c', // red
  '#8b5cf6': '#4a2e78', // violet
  '#a5b4fc': '#4a2e78', // indigo-300
  '#93c5fd': '#2456a8', // blue-300
  '#6ee7b7': '#2f6a1c', // emerald-300
  '#fcd34d': '#8a5a10', // amber-300
  '#f97316': '#8a5a10', // orange
  '#ec4899': '#be123c', // pink
  '#14b8a6': '#2f6a1c', // teal
  '#06b6d4': '#2456a8', // cyan
  '#4a90d9': '#2456a8', // blue variant

  // whites (6-char)
  '#ffffff': '#1a1a1a',
};

// Shorthand whites — treat as text / ink
const SHORT_HEX_MAP = {
  '#fff':    '#1a1a1a',
  '#ffffff': '#1a1a1a',
};

// Warm-paper bg rect — injected right after `<svg ...>` opening tag
const BG_RECT = '<rect x="0" y="0" width="100%" height="100%" fill="#faf8f3" />';

// ----------------------------------------------------------
// Transform a single SVG string. Returns { out, changes } diff summary.
// ----------------------------------------------------------
function transformSvg(src) {
  let out = src;
  let changes = 0;

  for (const { re, to } of RGBA_ACCENT) {
    out = out.replace(re, () => { changes++; return to; });
  }
  for (const { re, to } of RGBA_NEUTRAL) {
    out = out.replace(re, (_, a) => { changes++; return to.replace('$1', a); });
  }

  // Hex replacements (case-insensitive full-token)
  out = out.replace(/#[0-9a-fA-F]{6}\b/g, (m) => {
    const k = m.toLowerCase();
    if (k in HEX_MAP) { changes++; return HEX_MAP[k]; }
    return m;
  });
  out = out.replace(/#[0-9a-fA-F]{3}\b/g, (m) => {
    const k = m.toLowerCase();
    if (k in SHORT_HEX_MAP) { changes++; return SHORT_HEX_MAP[k]; }
    return m;
  });

  // Inject warm-paper bg rect — skip if already present
  const alreadyHasWarmBg = /<rect[^>]*fill=["']#faf8f3["'][^>]*>/i.test(out);
  if (!alreadyHasWarmBg) {
    // Insert right after the opening <svg ...> tag
    out = out.replace(/(<svg\b[^>]*>)/i, (m) => { changes++; return `${m}\n  ${BG_RECT}`; });
  }

  return { out, changes };
}

// ----------------------------------------------------------
// File walk
// ----------------------------------------------------------
function listSvgsToMigrate() {
  if (FILE) return [path.resolve(FILE)];
  const out = [];
  function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && e.name.endsWith('.svg') && !e.name.endsWith('_mermaid.svg')) {
        if (ONLY && !p.includes(ONLY)) continue;
        out.push(p);
      }
    }
  }
  walk(VISUALS_DIR);
  return out;
}

function main() {
  const files = listSvgsToMigrate();
  let total = 0, touched = 0, errors = 0, totalChanges = 0;

  for (const f of files) {
    total++;
    try {
      const src = fs.readFileSync(f, 'utf8');
      const { out, changes } = transformSvg(src);
      if (changes === 0) {
        console.log(`  · ${path.relative(PROJECT_ROOT, f)} — no changes`);
        continue;
      }
      touched++;
      totalChanges += changes;
      if (DRY) {
        console.log(`  [dry] ${path.relative(PROJECT_ROOT, f)} — ${changes} change(s)`);
      } else {
        fs.writeFileSync(f, out, 'utf8');
        console.log(`  ✓ ${path.relative(PROJECT_ROOT, f)} — ${changes} change(s)`);
      }
    } catch (e) {
      errors++;
      console.error(`  ✖ ${path.relative(PROJECT_ROOT, f)}: ${e.message}`);
    }
  }

  console.log(`\n── summary ──`);
  console.log(`  scanned:  ${total}`);
  console.log(`  touched:  ${touched}`);
  console.log(`  changes:  ${totalChanges}`);
  if (errors) console.log(`  errors:   ${errors}`);
  if (DRY) console.log(`  (dry run — no files written)`);
}

main();
