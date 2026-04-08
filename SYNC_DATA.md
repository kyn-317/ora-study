# Data Sync Guide

Oracle DBA 학습자료를 `ora-study` 프로젝트에 동기화하고 Vercel에 배포하는 가이드.

## 구조

```
oracle-dba/                    ← 상위 디렉토리 (원본 데이터)
├── study/                     ← 학습 개념 JSON
├── customquestions_json/      ← 커스텀 문제 JSON
├── questions_json/            ← 시험 문제 JSON
│
└── ora-study/                 ← Next.js 프로젝트
    ├── data/                  ← 동기화된 데이터 (git에 포함)
    │   ├── study/
    │   ├── custom/
    │   ├── questions/
    │   └── manifest.json      ← 자동 생성 파일 목록
    ├── scripts/
    │   └── sync-data.js       ← 동기화 스크립트
    └── lib/
        └── data.ts            ← manifest 기반 데이터 로더
```

## 데이터 동기화

새 학습자료나 문제를 추가/수정한 후 아래 명령 실행:

```bash
cd ora-study
npm run sync-data
```

이 명령은:
1. `study/`, `customquestions_json/`, `questions_json/` 3개 폴더를 `data/`로 복사
2. `data/manifest.json` 자동 생성 (모든 파일 목록)

## Vercel 배포

### 최초 설정

```bash
cd ora-study
npm i -g vercel
vercel login
vercel
```

### 배포 (데이터 변경 후)

```bash
# 1. 데이터 동기화
npm run sync-data

# 2. 빌드 확인
npm run build

# 3. git 커밋 & 푸시
git add -A
git commit -m "sync: update study data"
git push

# Vercel이 자동으로 재배포합니다 (GitHub 연동 시)
```

### 수동 배포 (GitHub 미연동 시)

```bash
npm run sync-data
vercel --prod
```

## 원스텝 동기화+배포

```bash
npm run sync-data && npm run build && git add -A && git commit -m "sync: update data" && git push
```

## 주의사항

- `data/` 폴더는 `.gitignore`에 포함하지 마세요 (Vercel이 접근해야 함)
- 데이터 변경 후 반드시 `npm run sync-data` 실행 필요
- `manifest.json`은 수동 편집 금지 (스크립트가 자동 생성)
