#!/usr/bin/env node

/**
 * sync-data.js
 *
 * 상위 디렉토리의 study, customquestions_json, questions_json 폴더를
 * ora-study/data/ 안으로 복사하고, manifest.json을 자동 생성합니다.
 *
 * 사용법: node scripts/sync-data.js
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');
const PARENT_DIR = path.resolve(PROJECT_ROOT, '..');

const SOURCES = {
  study: path.join(PARENT_DIR, 'study'),
  custom: path.join(PARENT_DIR, 'customquestions_json'),
  questions: path.join(PARENT_DIR, 'questions_json'),
};

// ── helpers ──

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`  ⚠ Source not found, skipping: ${src}`);
    return;
  }
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function collectFiles(dir, base = '') {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...collectFiles(path.join(dir, entry.name), rel));
    } else if (entry.name.endsWith('.json')) {
      results.push(rel);
    }
  }
  return results;
}

// ── main ──

console.log('=== Oracle DBA Study Data Sync ===\n');

// 1. Copy folders
for (const [name, src] of Object.entries(SOURCES)) {
  const dest = path.join(DATA_DIR, name);
  console.log(`Copying: ${name}`);
  console.log(`  from: ${src}`);
  console.log(`  to:   ${dest}`);
  copyDirSync(src, dest);
  console.log(`  done.\n`);
}

// 2. Build manifest
console.log('Generating manifest.json ...');

const manifest = {
  generatedAt: new Date().toISOString(),
  study: {},
  questions: [],
  custom: {},
};

// study: { "01": ["01_01_메모리구조", ...], ... }
const studyDir = path.join(DATA_DIR, 'study');
if (fs.existsSync(studyDir)) {
  for (const ch of fs.readdirSync(studyDir).filter(d => !d.startsWith('.')).sort()) {
    const chPath = path.join(studyDir, ch);
    if (!fs.statSync(chPath).isDirectory()) continue;
    manifest.study[ch] = fs
      .readdirSync(chPath)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''))
      .sort();
  }
}

// questions: ["01_OracleDatabase...", ...]
const questionsDir = path.join(DATA_DIR, 'questions');
if (fs.existsSync(questionsDir)) {
  manifest.questions = fs
    .readdirSync(questionsDir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''))
    .sort();
}

// custom: { "01": ["custom_01_001", ...], ... }
const customDir = path.join(DATA_DIR, 'custom');
if (fs.existsSync(customDir)) {
  for (const ch of fs.readdirSync(customDir).filter(d => !d.startsWith('.')).sort()) {
    const chPath = path.join(customDir, ch);
    if (!fs.statSync(chPath).isDirectory()) continue;
    manifest.custom[ch] = fs
      .readdirSync(chPath)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''))
      .sort();
  }
}

const manifestPath = path.join(DATA_DIR, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
console.log(`  written: ${manifestPath}\n`);

// 3. Summary
const studyCount = Object.values(manifest.study).flat().length;
const questionsCount = manifest.questions.length;
const customCount = Object.values(manifest.custom).flat().length;
console.log('=== Summary ===');
console.log(`  Study files:    ${studyCount}`);
console.log(`  Exam questions: ${questionsCount} chapters`);
console.log(`  Custom quizzes: ${customCount} sets`);
console.log('\nSync complete! Ready for build & deploy.');
