#!/usr/bin/env node

/**
 * mermaid-to-svg.js
 *
 * data/study/ 하위의 모든 JSON 파일을 순회하며,
 * visuals[] 중 type === "mermaid" 인 항목을 찾아
 *  1) mermaidCode 를 SVG 로 렌더링하여 public/visuals/{chapterId}/ 에 저장
 *  2) 해당 visual 엔트리를 { type:"svg", src:"/visuals/..." } 로 교체하고
 *     mermaidCode 필드를 제거
 *
 * 사용법:
 *   npm i -D @mermaid-js/mermaid-cli
 *   node scripts/mermaid-to-svg.js
 *
 * 옵션:
 *   --dry     JSON 수정/파일 저장 없이 대상 목록만 출력
 *   --only=01_02  특정 studyId 만 처리
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const STUDY_DIR = path.join(PROJECT_ROOT, 'data', 'study');
const PUBLIC_VISUALS = path.join(PROJECT_ROOT, 'public', 'visuals');

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry');
const ONLY = (argv.find(a => a.startsWith('--only=')) || '').split('=')[1] || null;

// Mermaid config that mirrors components/MermaidDiagram.tsx (warm paper theme, hardcoded)
const MERMAID_CONFIG = {
  theme: 'base',
  themeVariables: {
    background:           '#faf8f3',
    mainBkg:              '#f0e6d2',
    primaryColor:         '#f0e6d2',
    primaryBorderColor:   '#5a5040',
    primaryTextColor:     '#2a2a2a',
    lineColor:            '#8a7a60',
    secondaryColor:       '#e4dcc8',
    tertiaryColor:        '#e8ede0',
    noteBkgColor:         '#f5ecd9',
    noteBorderColor:      '#c9b98f',
    noteTextColor:        '#2a2a2a',
    edgeLabelBackground:  '#faf8f3',
    actorBkg:             '#f0e6d2',
    actorBorder:          '#5a5040',
    actorTextColor:       '#2a2a2a',
    actorLineColor:       '#8a7a60',
    signalColor:          '#5a5040',
    signalTextColor:      '#2a2a2a',
    labelBoxBkgColor:     '#e4dcc8',
    labelBoxBorderColor:  '#b8894a',
    labelTextColor:       '#2a2a2a',
    loopTextColor:        '#5a5040',
    activationBorderColor:'#b8894a',
    activationBkgColor:   '#e4dcc8',
    fontFamily: "'Noto Sans KR', 'Noto Sans JP', sans-serif",
    fontSize: '14px',
  },
  flowchart: { curve: 'basis', padding: 14, htmlLabels: true },
  sequence: { actorMargin: 64, boxMargin: 10, messageMargin: 40, mirrorActors: false },
  er: { layoutDirection: 'LR' },
  securityLevel: 'loose',
};

// ── helpers ──

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(p);
  }
  return out;
}

function collectMermaidVisuals(section, studyId, acc) {
  if (Array.isArray(section.visuals)) {
    for (const v of section.visuals) {
      if (v.type === 'mermaid' && v.mermaidCode) {
        acc.push({
          studyId,
          sectionId: section.sectionId || 'root',
          visual: v,
        });
      }
    }
  }
  if (Array.isArray(section.subsections)) {
    for (const sub of section.subsections) collectMermaidVisuals(sub, studyId, acc);
  }
}

function ensureDirSync(d) { fs.mkdirSync(d, { recursive: true }); }

function writeTempMmd(code) {
  const tmp = path.join(os.tmpdir(), `mmd-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2,8)}.mmd`);
  fs.writeFileSync(tmp, code, 'utf8');
  return tmp;
}

function writeTempConfig() {
  const tmp = path.join(os.tmpdir(), `mmd-cfg-${process.pid}-${Date.now()}.json`);
  fs.writeFileSync(tmp, JSON.stringify(MERMAID_CONFIG), 'utf8');
  return tmp;
}

function resolveMmdc() {
  const binDir = path.join(PROJECT_ROOT, 'node_modules', '.bin');
  const candidates = process.platform === 'win32'
    ? ['mmdc.exe', 'mmdc.cmd', 'mmdc.bat']
    : ['mmdc'];
  for (const c of candidates) {
    const p = path.join(binDir, c);
    if (fs.existsSync(p)) return p;
  }
  throw new Error('mmdc binary not found in node_modules/.bin — run: bun add -D @mermaid-js/mermaid-cli');
}

const MMDC_BIN = resolveMmdc();

function renderSvg(code, outPath) {
  const mmd = writeTempMmd(code);
  const cfg = writeTempConfig();
  const res = spawnSync(
    MMDC_BIN,
    ['-i', mmd, '-o', outPath, '-c', cfg, '-b', '#faf8f3'],
    { stdio: 'pipe', encoding: 'utf8' }
  );
  try { fs.unlinkSync(mmd); } catch {}
  try { fs.unlinkSync(cfg); } catch {}
  if (res.error) {
    throw new Error(`mmdc spawn error: ${res.error.message}`);
  }
  if (res.status !== 0) {
    throw new Error(`mmdc failed (exit ${res.status}):\nSTDOUT: ${res.stdout}\nSTDERR: ${res.stderr}`);
  }
}

function svgFilename(studyId, sectionId, visualId) {
  const cleanSection = (sectionId || 'root').replace(/[^a-zA-Z0-9_]/g, '');
  const cleanVid = (visualId || 'v').replace(/[^a-zA-Z0-9_]/g, '');
  return `${studyId}_${cleanSection}_${cleanVid}_mermaid.svg`;
}

// ── main ──

function main() {
  if (!fs.existsSync(STUDY_DIR)) {
    console.error('data/study not found');
    process.exit(1);
  }

  const jsonFiles = walk(STUDY_DIR);
  let totalConverted = 0, totalSkipped = 0, totalErrors = 0;

  for (const jsonPath of jsonFiles) {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    let data;
    try { data = JSON.parse(raw); }
    catch (e) {
      console.error(`  ✖ JSON parse failed: ${jsonPath}`);
      totalErrors++;
      continue;
    }

    const studyId = data.id;
    if (!studyId) {
      console.warn(`  ⚠ No "id" field in ${jsonPath}, skipping`);
      continue;
    }
    if (ONLY && studyId !== ONLY) continue;

    const chapterId = studyId.split('_')[0];
    const targets = [];
    if (Array.isArray(data.sections)) {
      for (const sec of data.sections) collectMermaidVisuals(sec, studyId, targets);
    }
    if (targets.length === 0) continue;

    console.log(`\n▸ ${studyId} — ${targets.length} mermaid visual(s)`);
    const outDir = path.join(PUBLIC_VISUALS, chapterId);
    ensureDirSync(outDir);

    for (const t of targets) {
      const fname = svgFilename(t.studyId, t.sectionId, t.visual.id);
      const outPath = path.join(outDir, fname);
      const publicSrc = `/visuals/${chapterId}/${fname}`;

      if (DRY) {
        console.log(`  [dry] ${t.visual.id} → ${publicSrc}`);
        continue;
      }

      try {
        renderSvg(t.visual.mermaidCode, outPath);
      } catch (e) {
        console.error(`  ✖ render failed for ${studyId}/${t.visual.id}:`);
        console.error(`    ${String(e.message).split('\n')[0]}`);
        totalErrors++;
        continue;
      }

      // Mutate the in-memory object (targets hold direct refs)
      t.visual.type = 'svg';
      t.visual.src = publicSrc;
      delete t.visual.mermaidCode;

      console.log(`  ✓ ${t.visual.id} → ${publicSrc}`);
      totalConverted++;
    }

    if (!DRY) {
      // Preserve 2-space indent + trailing newline
      const serialized = JSON.stringify(data, null, 2) + '\n';
      fs.writeFileSync(jsonPath, serialized, 'utf8');
    } else {
      totalSkipped += targets.length;
    }
  }

  console.log(`\n── summary ──`);
  console.log(`  converted: ${totalConverted}`);
  if (DRY) console.log(`  (dry run — nothing written)`);
  if (totalErrors) console.log(`  errors:    ${totalErrors}`);
}

main();
