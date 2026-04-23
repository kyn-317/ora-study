#!/usr/bin/env node

/**
 * svg-arrow-snap.js
 *
 * 손수 작성된 SVG 의 `<line ... marker-end=...>` 화살표 중
 * endpoint 가 근처 <rect> 엣지 또는 <polygon> 꼭짓점에 닿지 않고 떠 있는 경우를
 * 방향을 유지하며 가장 가까운 타겟까지 자동 연장(snap)합니다.
 *
 *   node scripts/svg-arrow-snap.js [--dry] [--only=<substr>] [--max=15]
 *
 * 규칙:
 *  - 수평선 (y1≈y2): 진행 방향(+x / -x)의 첫 rect 엣지까지 스냅 (y1 이 rect 의 y 범위 안)
 *  - 수직선 (x1≈x2): 진행 방향(+y / -y)의 첫 rect 엣지까지 스냅 (x1 이 rect 의 x 범위 안)
 *  - 대각선: 끝점 반지름 max 내에 polygon 꼭짓점 / rect 엣지 가장 가까운 곳으로 스냅
 *  - 이동량이 max(기본 15px) 넘으면 스킵 (실수 방지)
 *  - 이미 4px 이내 닿아 있으면 그대로 둠
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VIS  = path.join(ROOT, 'public', 'visuals');

const argv = process.argv.slice(2);
const DRY  = argv.includes('--dry');
const ONLY = (argv.find(a => a.startsWith('--only=')) || '').split('=')[1] || null;
const MAX  = +((argv.find(a => a.startsWith('--max='))  || '').split('=')[1]) || 15;
const TOL  = 4;

// ── parsers ──

function extractRects(src) {
  const out = [];
  const re = /<rect\b([^>]*?)\/?>/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const a = m[1];
    const x = +(a.match(/\bx\s*=\s*["']([-\d.]+)["']/) || [,NaN])[1];
    const y = +(a.match(/\by\s*=\s*["']([-\d.]+)["']/) || [,NaN])[1];
    const wM = a.match(/\bwidth\s*=\s*["']([-\d.%]+)["']/);
    const hM = a.match(/\bheight\s*=\s*["']([-\d.%]+)["']/);
    if (!wM || !hM) continue;
    if (wM[1].endsWith('%') || hM[1].endsWith('%')) continue;
    const w = +wM[1], h = +hM[1];
    if (!Number.isFinite(x+y+w+h)) continue;
    out.push({ x, y, w, h });
  }
  return out;
}

function extractPolyVertices(src) {
  const out = [];
  const re = /<polygon\b[^>]*?\bpoints\s*=\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const pts = m[1].trim().split(/[\s,]+/).map(Number);
    for (let i = 0; i + 1 < pts.length; i += 2) {
      if (Number.isFinite(pts[i]+pts[i+1])) out.push({ x: pts[i], y: pts[i+1] });
    }
  }
  return out;
}

function endpointAttached(x, y, rects, polyPts) {
  for (const r of rects) {
    const inH = x >= r.x - TOL && x <= r.x + r.w + TOL;
    const inV = y >= r.y - TOL && y <= r.y + r.h + TOL;
    const cands = [];
    if (inH) cands.push(Math.abs(y - r.y), Math.abs(y - (r.y + r.h)));
    if (inV) cands.push(Math.abs(x - r.x), Math.abs(x - (r.x + r.w)));
    if (cands.length && Math.min(...cands) <= TOL) return true;
  }
  for (const p of polyPts) {
    if (Math.hypot(x - p.x, y - p.y) <= TOL) return true;
  }
  return false;
}

// 목표 엣지 찾기 — 화살표 진행 방향으로 앞쪽 max 내 첫 rect 엣지
function snapTarget(x1, y1, x2, y2, rects, polyPts) {
  const dx = x2 - x1, dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return null;

  const HORIZ = Math.abs(dy) < 2;
  const VERT  = Math.abs(dx) < 2;

  if (HORIZ) {
    // 화살표 진행 방향: +x(오른쪽) 또는 -x(왼쪽)
    const goingRight = dx > 0;
    let best = null, bestDelta = Infinity;
    for (const r of rects) {
      // y2 가 rect 의 세로 범위 안이어야 수평선이 이 rect 에 닿음
      if (y2 < r.y - TOL || y2 > r.y + r.h + TOL) continue;
      const edgeX = goingRight ? r.x : r.x + r.w;
      const delta = goingRight ? (edgeX - x2) : (x2 - edgeX);
      if (delta <= 0) continue;               // 이미 지나침
      if (delta > MAX) continue;              // 너무 멀리
      if (delta < bestDelta) { bestDelta = delta; best = { x: edgeX, y: y2 }; }
    }
    return best;
  }

  if (VERT) {
    const goingDown = dy > 0;
    let best = null, bestDelta = Infinity;
    for (const r of rects) {
      if (x2 < r.x - TOL || x2 > r.x + r.w + TOL) continue;
      const edgeY = goingDown ? r.y : r.y + r.h;
      const delta = goingDown ? (edgeY - y2) : (y2 - edgeY);
      if (delta <= 0) continue;
      if (delta > MAX) continue;
      if (delta < bestDelta) { bestDelta = delta; best = { x: x2, y: edgeY }; }
    }
    return best;
  }

  // 대각선 — 반지름 MAX 내 polygon 꼭짓점 / rect 코너 중 화살표 진행 방향 쪽에서 가장 가까운 점
  const ux = dx / dist, uy = dy / dist;
  const candidates = [];
  for (const p of polyPts) candidates.push(p);
  for (const r of rects) {
    candidates.push({ x: r.x,       y: r.y       });
    candidates.push({ x: r.x + r.w, y: r.y       });
    candidates.push({ x: r.x,       y: r.y + r.h });
    candidates.push({ x: r.x + r.w, y: r.y + r.h });
  }
  let best = null, bestScore = Infinity;
  for (const p of candidates) {
    const vx = p.x - x2, vy = p.y - y2;
    const along = vx * ux + vy * uy;        // 화살표 진행 방향 투영
    if (along <= 0) continue;               // 뒤쪽
    if (along > MAX) continue;
    const d = Math.hypot(vx, vy);
    if (d > MAX) continue;
    const off = Math.abs(vx * (-uy) + vy * ux); // 축 이탈
    const score = along + off * 2;          // 축 이탈에 페널티
    if (score < bestScore) { bestScore = score; best = p; }
  }
  return best;
}

// ── file transform ──
function snapArrowsInFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  const rects = extractRects(src);
  const polyPts = extractPolyVertices(src);

  let changes = 0;
  const out = src.replace(/<line\b([^>]*?)\/?>/g, (whole, attrs) => {
    if (!/marker-end\s*=/i.test(attrs)) return whole;
    const x1 = +(attrs.match(/\bx1\s*=\s*["']([-\d.]+)["']/) || [,NaN])[1];
    const y1 = +(attrs.match(/\by1\s*=\s*["']([-\d.]+)["']/) || [,NaN])[1];
    const x2 = +(attrs.match(/\bx2\s*=\s*["']([-\d.]+)["']/) || [,NaN])[1];
    const y2 = +(attrs.match(/\by2\s*=\s*["']([-\d.]+)["']/) || [,NaN])[1];
    if (![x1,y1,x2,y2].every(Number.isFinite)) return whole;
    if (endpointAttached(x2, y2, rects, polyPts)) return whole;
    const t = snapTarget(x1, y1, x2, y2, rects, polyPts);
    if (!t) return whole;
    changes++;
    const nx = Math.round(t.x * 100) / 100;
    const ny = Math.round(t.y * 100) / 100;
    // 속성값만 교체
    const newAttrs = attrs
      .replace(/\bx2\s*=\s*["'][-\d.]+["']/, `x2="${nx}"`)
      .replace(/\by2\s*=\s*["'][-\d.]+["']/, `y2="${ny}"`);
    return `<line${newAttrs}/>`.replace(/<line /, '<line').replace(/<line/, '<line '); // 형식 유지
  });

  return { out, changes };
}

// ── walk ──
function listSvgs() {
  const out = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && e.name.endsWith('.svg') && !e.name.endsWith('_mermaid.svg')) {
        if (ONLY && !p.includes(ONLY)) continue;
        out.push(p);
      }
    }
  })(VIS);
  return out;
}

function main() {
  const files = listSvgs();
  let touched = 0, totalChanges = 0;
  for (const f of files) {
    const { out, changes } = snapArrowsInFile(f);
    if (changes === 0) continue;
    touched++; totalChanges += changes;
    if (DRY) console.log(`  [dry] ${path.relative(ROOT, f)} — ${changes}`);
    else {
      fs.writeFileSync(f, out, 'utf8');
      console.log(`  ✓ ${path.relative(ROOT, f)} — ${changes}`);
    }
  }
  console.log(`\n── summary ──`);
  console.log(`  scanned:  ${files.length}`);
  console.log(`  touched:  ${touched}`);
  console.log(`  snapped:  ${totalChanges}`);
  if (DRY) console.log(`  (dry run)`);
}

main();
