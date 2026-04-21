#!/usr/bin/env node

/**
 * mermaid-rerender.js
 *
 * 이미 SVG 로 교체된 JSON (현재 워킹트리) 에는 mermaidCode 가 없으므로,
 * git HEAD 에 남아있는 이전 버전에서 mermaidCode 를 꺼내오고,
 * `app-design/mermaid/export-theme.js` 의 composeDiagram() 으로
 * 소스의 classDef 를 제거한 뒤 canonical warm-paper classDef 를 주입해
 * buildMmdcConfig() themeVariables 로 mmdc 를 돌려 기존 *_mermaid.svg 를 덮어씀.
 *
 *   node scripts/mermaid-rerender.js [--dry] [--only=NN_NN]
 *
 * 전제: mermaid 변환(type/src 갱신) 이 커밋 **이전** 에 이 스크립트를 돌려야 함.
 *       git HEAD 에는 mermaidCode 가 남아있는 이전 커밋이 최신이어야 한다.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const {
  loadTokens,
  buildMmdcConfig,
  composeDiagram,
} = require('../../../app-design/mermaid/export-theme.js');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const STUDY_DIR = path.join(PROJECT_ROOT, 'data', 'study');
const PUBLIC_VISUALS = path.join(PROJECT_ROOT, 'public', 'visuals');

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry');
const ONLY = (argv.find(a => a.startsWith('--only=')) || '').split('=')[1] || null;

const TOKENS = loadTokens();
const MERMAID_CONFIG = buildMmdcConfig(TOKENS);

// ── helpers ──

function listStudyJsonFilesFromDisk() {
  const out = [];
  function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && e.name.endsWith('.json')) out.push(p);
    }
  }
  walk(STUDY_DIR);
  return out;
}

function readGitHeadVersion(absPath) {
  const rel = path.relative(PROJECT_ROOT, absPath).replace(/\\/g, '/');
  const res = spawnSync('git', ['show', `HEAD:${rel}`], {
    cwd: PROJECT_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  });
  if (res.status !== 0) return null;
  return res.stdout;
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

function writeTemp(contents, ext) {
  const tmp = path.join(os.tmpdir(), `mmd-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`);
  fs.writeFileSync(tmp, contents, 'utf8');
  return tmp;
}

function resolveMmdc() {
  const binDir = path.join(PROJECT_ROOT, 'node_modules', '.bin');
  const candidates = process.platform === 'win32'
    ? ['mmdc.exe', 'mmdc.cmd']
    : ['mmdc'];
  for (const c of candidates) {
    const p = path.join(binDir, c);
    if (fs.existsSync(p)) return p;
  }
  throw new Error('mmdc not found — bun add -D @mermaid-js/mermaid-cli');
}

const MMDC_BIN = resolveMmdc();

function renderSvg(code, outPath) {
  const mmd = writeTemp(code, 'mmd');
  const cfg = writeTemp(JSON.stringify(MERMAID_CONFIG), 'json');
  const res = spawnSync(
    MMDC_BIN,
    ['-i', mmd, '-o', outPath, '-c', cfg, '-b', 'transparent'],
    { stdio: 'pipe', encoding: 'utf8' }
  );
  try { fs.unlinkSync(mmd); } catch {}
  try { fs.unlinkSync(cfg); } catch {}
  if (res.error) throw new Error(`mmdc spawn: ${res.error.message}`);
  if (res.status !== 0) {
    throw new Error(`mmdc exit ${res.status}\nSTDOUT: ${res.stdout}\nSTDERR: ${res.stderr}`);
  }
}

function svgFilename(studyId, sectionId, visualId) {
  const cleanSection = (sectionId || 'root').replace(/[^a-zA-Z0-9_]/g, '');
  const cleanVid = (visualId || 'v').replace(/[^a-zA-Z0-9_]/g, '');
  return `${studyId}_${cleanSection}_${cleanVid}_mermaid.svg`;
}

// ── main ──

function main() {
  const jsonFiles = listStudyJsonFilesFromDisk();
  let total = 0, done = 0, errors = 0;

  for (const jsonPath of jsonFiles) {
    const headRaw = readGitHeadVersion(jsonPath);
    if (!headRaw) continue;
    let data;
    try { data = JSON.parse(headRaw); }
    catch { console.error(`  ✖ parse HEAD ${jsonPath}`); errors++; continue; }

    const studyId = data.id;
    if (!studyId) continue;
    if (ONLY && studyId !== ONLY) continue;

    const chapterId = studyId.split('_')[0];
    const targets = [];
    if (Array.isArray(data.sections)) {
      for (const sec of data.sections) collectMermaidVisuals(sec, studyId, targets);
    }
    if (targets.length === 0) continue;

    total += targets.length;
    console.log(`\n▸ ${studyId} — ${targets.length} mermaid visual(s)`);
    const outDir = path.join(PUBLIC_VISUALS, chapterId);
    fs.mkdirSync(outDir, { recursive: true });

    for (const t of targets) {
      const fname = svgFilename(t.studyId, t.sectionId, t.visual.id);
      const outPath = path.join(outDir, fname);
      if (DRY) { console.log(`  [dry] ${t.visual.id} → ${outPath}`); continue; }

      const composed = composeDiagram(t.visual.mermaidCode, TOKENS);
      try {
        renderSvg(composed, outPath);
        console.log(`  ✓ ${t.visual.id} → ${path.relative(PROJECT_ROOT, outPath)}`);
        done++;
      } catch (e) {
        console.error(`  ✖ ${t.visual.id}: ${String(e.message).split('\n')[0]}`);
        errors++;
      }
    }
  }

  console.log(`\n── summary ──`);
  console.log(`  targets:  ${total}`);
  console.log(`  rendered: ${done}`);
  if (errors) console.log(`  errors:   ${errors}`);
  if (DRY) console.log(`  (dry run)`);
}

main();
