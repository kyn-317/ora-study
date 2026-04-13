# Mock Exam System Implementation Plan

## Overview
- 5개 모의고사 세트 (각 60문제)를 `/mock-exam` 경로에서 제공
- 문제/선택지 셔플, 타이머, 결과 JSON 저장, 약점 추적

## Phase 1 — Core Exam Flow (핵심 시험 흐름) ✅ COMPLETE
- [x] 진행 추적 파일 작성
- [x] 데이터 레이어: question ID → 실제 문제 resolve 함수 (`lib/data.ts`)
  - `getMockExamQuestions()` — 병렬 파일 로딩, topic_stats.json 필터링
  - `saveExamResult()`, `getExamResults()` — 결과 저장/조회
- [x] 모의고사 선택 페이지 (`/app/mock-exam/page.tsx`)
- [x] 시험 진행 클라이언트 (`/app/mock-exam/[setId]/MockExamClient.tsx`)
  - 문제 순서 셔플 (seed 기반 Fisher-Yates)
  - 선택지 순서 셔플 + 정답 매핑 갱신
  - 전체 타이머 (90분, 잔여시간 표시, 시간초과 자동 종료)
  - 문제별 소요시간 추적
  - 한 문제씩 풀기 + 문제 번호 네비게이션
  - localStorage 진행 중 임시 저장/복원
  - 시험 종료 시 채점 + 서버 저장
- [x] 결과 저장 API (`/app/api/mock-exam/save-result/route.ts`)
  - `data/exam-results/` 에 JSON 파일 저장
- [x] 결과 리뷰 화면 (채점 후 오답 확인, 챕터별 통계, 해설 열람)
- [x] 홈 페이지에 Mock Exam 링크 추가
- [x] 서버 페이지 (`/app/mock-exam/[setId]/page.tsx`)

## Phase 2 — Analytics Dashboard (분석 대시보드) ✅ COMPLETE
- [x] 시험 이력 목록 페이지 (`/mock-exam/history`)
- [x] 챕터별 정답률 통계
- [x] 세트별 점수 추이
- [x] 약점 문제 리스트 (2회 이상 오답)
- [x] summary.json 자동 집계 (`/api/mock-exam/generate-summary`)

## Phase 3 — Advanced Features (고도화)
- [ ] 약점 기반 맞춤 재시험 (틀린 문제 위주)
- [x] 시계열 성장 그래프 (Trends 탭 상단 SVG 라인 차트, 세트별 색상, 3회 이동평균)
- [x] 오답 선택지 패턴 분석 (Weak Points 탭 expandable 상세, 오답 선택지 빈도, same-wrong 감지)
- [x] 오답노트 기능 (`/mock-exam/wrong-notes` 별도 페이지, 메모 CRUD, 필터/정렬)

## Data Structure

### exam_set_N.json (기존)
```json
{ "exam_set": 1, "total_questions": 60, "questions": ["C_01_001", ...] }
```

### exam result (신규: data/exam-results/)
```json
{
  "examSet": 1,
  "startedAt": "2026-04-13T14:30:22",
  "completedAt": "2026-04-13T15:45:10",
  "duration": 4488,
  "shuffleSeed": 1713012622,
  "totalQuestions": 60,
  "score": 42,
  "scoreRate": 70.0,
  "answers": [
    {
      "questionId": "C_01_001",
      "chapter": "01",
      "selected": ["A"],
      "correct": ["A"],
      "isCorrect": true,
      "timeSpent": 45
    }
  ]
}
```

## Key Decisions
- 결과는 서버 JSON 파일로 영구 저장 (localStorage는 진행 중 임시 저장만)
- 셔플은 클라이언트에서 seed 기반으로 수행 (동일 seed → 동일 순서 재현 가능)
- 시험 중에는 해설 비공개, 리뷰 모드에서만 공개
- 기존 QuizClient를 재사용하지 않고 MockExamClient를 별도 작성 (시험 특화 UX)
