/**
 * keyword-study 커버리지 전체 감사 스크립트
 *
 * 사용법: cd ora-study && node scripts/audit-keyword-study.js
 *
 * 모든 study 파일의 keywords 배열과 대응하는 keyword-study 파일을 비교하여
 * 누락(GAPS), 미생성(NO_KS), 정상(OK) 상태를 출력한다.
 * Total missing: 0 이면 sync-data 진행 가능.
 */

const fs = require('fs');
const path = require('path');

const studyDir = path.join(__dirname, '..', 'data', 'study');
const ksDir = path.join(__dirname, '..', 'data', 'keyword-study');

const chapters = fs.readdirSync(studyDir)
  .filter(f => fs.statSync(path.join(studyDir, f)).isDirectory())
  .sort();

let totalMissing = 0;

for (const ch of chapters) {
  const studyFiles = fs.readdirSync(path.join(studyDir, ch))
    .filter(f => f.endsWith('.json'));

  for (const sf of studyFiles) {
    const study = JSON.parse(fs.readFileSync(path.join(studyDir, ch, sf), 'utf8'));
    const studyId = study.id;
    const ksFile = path.join(ksDir, ch, studyId + '.json');
    const hasKs = fs.existsSync(ksFile);

    let ksCnt = 0;
    let missing = 0;
    let missingList = [];

    if (hasKs) {
      const ks = JSON.parse(fs.readFileSync(ksFile, 'utf8'));
      ksCnt = Object.keys(ks.keywords).length;
      missingList = study.keywords.filter(k => !ks.keywords[k]);
      missing = missingList.length;
    } else {
      missingList = study.keywords || [];
      missing = missingList.length;
    }

    totalMissing += missing;
    const total = study.keywords ? study.keywords.length : 0;
    const status = !hasKs ? 'NO_KS' : (missing === 0 ? 'OK' : 'GAPS(' + missing + ')');
    console.log(ch + '/' + studyId + ' | ' + total + ' -> ' + ksCnt + ' | ' + status);

    // --verbose 플래그가 있으면 누락 키워드 목록도 출력
    if (missing > 0 && process.argv.includes('--verbose')) {
      console.log('  Missing:', missingList.join(', '));
    }
  }
}

console.log('\nTotal missing: ' + totalMissing + (totalMissing === 0 ? ' (ALL OK)' : ' (NEEDS FIX)'));
