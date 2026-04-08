/**
 * 단일 study 파일의 keyword-study 누락 확인 스크립트
 *
 * 사용법: cd ora-study && node scripts/audit-keyword-single.js <chapterId> <studyId>
 * 예시:   node scripts/audit-keyword-single.js 01 01_01
 */

const fs = require('fs');
const path = require('path');

const [ch, studyId] = process.argv.slice(2);

if (!ch || !studyId) {
  console.error('Usage: node scripts/audit-keyword-single.js <chapterId> <studyId>');
  console.error('Example: node scripts/audit-keyword-single.js 01 01_01');
  process.exit(1);
}

const studyDir = path.join(__dirname, '..', 'data', 'study', ch);
const studyFiles = fs.readdirSync(studyDir).filter(f => f.startsWith(studyId) && f.endsWith('.json'));

if (studyFiles.length === 0) {
  console.error('Study file not found for:', ch + '/' + studyId);
  process.exit(1);
}

const study = JSON.parse(fs.readFileSync(path.join(studyDir, studyFiles[0]), 'utf8'));
const ksFile = path.join(__dirname, '..', 'data', 'keyword-study', ch, studyId + '.json');

if (!fs.existsSync(ksFile)) {
  console.log('keyword-study file not found:', ksFile);
  console.log('All keywords missing:', study.keywords.length);
  console.log(study.keywords);
  process.exit(1);
}

const ks = JSON.parse(fs.readFileSync(ksFile, 'utf8'));
const missing = study.keywords.filter(k => !ks.keywords[k]);

console.log('Study:', ch + '/' + studyId, '(' + study.title + ')');
console.log('Total keywords:', study.keywords.length);
console.log('In keyword-study:', Object.keys(ks.keywords).length);
console.log('Missing:', missing.length);
if (missing.length > 0) {
  console.log(missing);
}
