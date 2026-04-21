#!/usr/bin/env node

/**
 * svg-layout-audit.js
 *
 * 손수 작성된 SVG(`public/visuals/**\/*.svg`, `*_mermaid.svg` 제외) 의
 * 1) `<text>` 위치가 어떤 `<rect>` 안에도 속하지 않지만 가까운 rect 가 있는 경우 (텍스트가 박스에서 이탈)
 * 2) `<line>` 끝점이 rect 엣지 · 다른 선 끝점 어디에도 닿지 않는 경우 (화살표 dangling)
 * 를 찾아 리포트합니다.
 *
 *   node scripts/svg-layout-audit.js [--only=<substr>]
 *
 * 출력은 "후보" 이므로 **수정은 수동**.
 * 상단/하단 60px 영역(제목/푸터)의 텍스트는 정상 플로팅으로 간주해 제외.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VIS = path.join(ROOT, 'public', 'visuals');

const argv = process.argv.slice(2);
const ONLY = (argv.find(a => a.startsWith('--only=')) || '').split('=')[1] || null;

const TOL_EDGE   = 4;   // 화살표 끝점이 rect 엣지에 닿았다고 보는 허용 거리(px)
const TOL_NEAR   = 30;  // 텍스트가 rect 안이 아닌데 이 거리 이내면 "본래 저 rect 소속" 후보
const TITLE_BAND = 60;  // 상단/하단 이 거리 이내 텍스트는 제목/푸터로 간주

// ----------------------------------------------------------
// 간단 파서 (regex 기반; SVG 구조가 일관되므로 실용적)
// ----------------------------------------------------------

function extractViewBox(src) {
  const m = src.match(/viewBox\s*=\s*["']([-\d.\s]+)["']/);
  if (!m) return null;
  const [, vb] = m;
  const parts = vb.trim().split(/\s+/).map(Number);
  if (parts.length !== 4) return null;
  return { x: parts[0], y: parts[1], w: parts[2], h: parts[3] };
}

function extractRects(src) {
  const out = [];
  const re = /<rect\b([^>]*?)\/?>/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const attrs = m[1];
    const x = +(attrs.match(/\bx\s*=\s*["']([-\d.]+)["']/) || [,NaN])[1];
    const y = +(attrs.match(/\by\s*=\s*["']([-\d.]+)["']/) || [,NaN])[1];
    const wM = attrs.match(/\bwidth\s*=\s*["']([-\d.%]+)["']/);
    const hM = attrs.match(/\bheight\s*=\s*["']([-\d.%]+)["']/);
    if (!wM || !hM) continue;
    if (wM[1].endsWith('%') || hM[1].endsWith('%')) continue; // bg rect 100% 스킵
    const w = +wM[1], h = +hM[1];
    if (!Number.isFinite(x+y+w+h)) continue;
    out.push({ x, y, w, h });
  }
  return out;
}

function extractTexts(src) {
  const out = [];
  const re = /<text\b([^>]*?)>([\s\S]*?)<\/text>/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const attrs = m[1];
    const inner = m[2].replace(/<[^>]+>/g, '').trim();
    const x = +(attrs.match(/\bx\s*=\s*["']([-\d.]+)["']/) || [,NaN])[1];
    const y = +(attrs.match(/\by\s*=\s*["']([-\d.]+)["']/) || [,NaN])[1];
    if (!Number.isFinite(x+y)) continue;
    const anchor = (attrs.match(/text-anchor\s*=\s*["']([^"']+)["']/) || [,'start'])[1];
    out.push({ x, y, anchor, text: inner, pos: m.index });
  }
  return out;
}

function extractLines(src) {
  // 화살표만 추출: marker-end 또는 marker-start 속성이 있는 <line>.
  // 구분선/세퍼레이터(마커 없는 line)는 dangling 이 정상이므로 제외.
  const out = [];
  const re = /<line\b([^>]*?)\/?>/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const a = m[1];
    const hasMarker = /marker-(start|end)\s*=/i.test(a);
    if (!hasMarker) continue;
    const x1 = +(a.match(/\bx1\s*=\s*["']([-\d.]+)["']/) || [,NaN])[1];
    const y1 = +(a.match(/\by1\s*=\s*["']([-\d.]+)["']/) || [,NaN])[1];
    const x2 = +(a.match(/\bx2\s*=\s*["']([-\d.]+)["']/) || [,NaN])[1];
    const y2 = +(a.match(/\by2\s*=\s*["']([-\d.]+)["']/) || [,NaN])[1];
    if (!Number.isFinite(x1+y1+x2+y2)) continue;
    const hasStart = /marker-start\s*=/i.test(a);
    const hasEnd   = /marker-end\s*=/i.test(a);
    out.push({ x1, y1, x2, y2, hasStart, hasEnd });
  }
  return out;
}

// ----------------------------------------------------------
// 판정
// ----------------------------------------------------------

function pointInRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function distToRectCenter(x, y, r) {
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  return Math.hypot(x - cx, y - cy);
}

function distToRectEdge(x, y, r) {
  // 끝점이 rect 경계선 근처인지 — 4변 중 최소 거리
  const dLeft   = Math.abs(x - r.x);
  const dRight  = Math.abs(x - (r.x + r.w));
  const dTop    = Math.abs(y - r.y);
  const dBottom = Math.abs(y - (r.y + r.h));
  // 점이 rect 가로 범위 안일 때 top/bottom 거리 유효, 세로 범위 안일 때 left/right 유효
  const inH = x >= r.x - TOL_EDGE && x <= r.x + r.w + TOL_EDGE;
  const inV = y >= r.y - TOL_EDGE && y <= r.y + r.h + TOL_EDGE;
  const candidates = [];
  if (inH) candidates.push(dTop, dBottom);
  if (inV) candidates.push(dLeft, dRight);
  if (candidates.length === 0) return Infinity;
  return Math.min(...candidates);
}

function auditFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  const vb = extractViewBox(src);
  if (!vb) return { issues: [] };

  const rects = extractRects(src);
  const texts = extractTexts(src);
  const lines = extractLines(src);

  const issues = [];

  // ── A. 텍스트 박스 이탈 ──
  for (const t of texts) {
    if (!t.text || t.text.length < 2) continue;
    // 제목/푸터 밴드 스킵
    if (t.y < vb.y + TITLE_BAND) continue;
    if (t.y > vb.y + vb.h - TITLE_BAND) continue;

    const inside = rects.some(r => pointInRect(t.x, t.y, r));
    if (inside) continue;

    let minDist = Infinity, nearest = null;
    for (const r of rects) {
      // 배지/번호원 같은 소형 rect(가로·세로 각 40 미만)는 "라벨이 잘못 배치된 것"이 아니라
      // "옆에 놓인 배지에 딸린 라벨" 일 가능성이 커서 제외.
      if (r.w < 40 || r.h < 40) continue;
      const d = distToRectCenter(t.x, t.y, r);
      if (d < minDist) { minDist = d; nearest = r; }
    }
    if (nearest && minDist <= TOL_NEAR) {
      issues.push({
        kind: 'text-strayed',
        text: t.text.slice(0, 30),
        at: `(${t.x},${t.y})`,
        nearest: `rect(${nearest.x},${nearest.y},${nearest.w}x${nearest.h})`,
        dist: minDist.toFixed(1),
      });
    }
  }

  // ── B. 선 끝점 dangling ──
  const allEndpoints = [];
  for (const l of lines) {
    allEndpoints.push({ x: l.x1, y: l.y1 });
    allEndpoints.push({ x: l.x2, y: l.y2 });
  }

  const endpointIsAttached = (x, y, selfIdx) => {
    // rect 엣지에 닿았나?
    for (const r of rects) {
      if (distToRectEdge(x, y, r) <= TOL_EDGE) return true;
    }
    // 다른 끝점과 닿았나? (다른 선 공통 접점)
    for (let i = 0; i < allEndpoints.length; i++) {
      if (i === selfIdx) continue;
      const o = allEndpoints[i];
      if (Math.hypot(x - o.x, y - o.y) <= TOL_EDGE) return true;
    }
    return false;
  };

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    // 화살촉 달린 쪽만 검사 — 그 쪽이 뭔가에 도달해야 "화살표로서" 의미가 있음.
    // 반대쪽은 보통 라벨/텍스트에 붙어 있거나 원점이라 자유로워도 OK.
    if (l.hasEnd) {
      const e = endpointIsAttached(l.x2, l.y2, i * 2 + 1);
      if (!e) issues.push({ kind: 'arrow-head-dangling', at: `(${l.x1},${l.y1})→(${l.x2},${l.y2})` });
    }
    if (l.hasStart) {
      const s = endpointIsAttached(l.x1, l.y1, i * 2);
      if (!s) issues.push({ kind: 'arrow-tail-dangling', at: `(${l.x1},${l.y1})→(${l.x2},${l.y2})` });
    }
  }

  return { issues };
}

// ----------------------------------------------------------
// Walk
// ----------------------------------------------------------
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
  let totalIssues = 0, flaggedFiles = 0;
  const byFile = [];

  for (const f of files) {
    const { issues } = auditFile(f);
    if (issues.length === 0) continue;
    flaggedFiles++;
    totalIssues += issues.length;
    byFile.push({ file: f, issues });
  }

  // 이슈 많은 파일부터 출력
  byFile.sort((a, b) => b.issues.length - a.issues.length);

  for (const { file, issues } of byFile) {
    console.log(`\n▸ ${path.relative(ROOT, file)} — ${issues.length} issue(s)`);
    const grouped = {};
    for (const it of issues) (grouped[it.kind] ||= []).push(it);
    for (const kind of Object.keys(grouped).sort()) {
      console.log(`  [${kind}] ${grouped[kind].length}`);
      for (const it of grouped[kind].slice(0, 6)) {
        if (it.kind === 'text-strayed') {
          console.log(`    · "${it.text}" at ${it.at} ← nearest ${it.nearest} (${it.dist}px)`);
        } else {
          console.log(`    · ${it.at}`);
        }
      }
      if (grouped[kind].length > 6) console.log(`    · … ${grouped[kind].length - 6} more`);
    }
  }

  console.log(`\n── summary ──`);
  console.log(`  scanned files:    ${files.length}`);
  console.log(`  flagged files:    ${flaggedFiles}`);
  console.log(`  total issues:     ${totalIssues}`);
}

main();
