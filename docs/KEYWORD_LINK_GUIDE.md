# 키워드 링크 기능 가이드라인

## 개요

문제 해설(explanation)에서 키워드를 클릭하면 관련 학습자료를 사이드패널(PC) / 하단패널(모바일)에 표시하는 기능.

## 아키텍처

```
[해설 텍스트] → ExplanationWithKeywords (키워드 감지 + 클릭 팝업)
                     ↓ onStudySelect
              QuizClient (hasKeywordStudy 확인)
                     ↓ hasKeywordStudy?
              ┌─ YES → /api/keyword-study/[chapterId]/[studyId]?keyword=...
              └─ NO  → /api/study/[chapterId]/[studyId] (fallback)
                     ↓
              StudyPanel (학습내용 표시)
                ├─ KeywordStudyRenderer (간결한 전용 설명)
                └─ 전체 sections 렌더링 (fallback)
```

## 파일 구조

| 파일 | 역할 |
|------|------|
| `scripts/sync-data.js` | study 파일의 keywords를 수집 → manifest.json에 keywordIndex 생성 |
| `data/manifest.json` → `keywordIndex` | `{ "keyword": [{ studyId, chapterId, title, fileName, hasKeywordStudy }] }` 역색인 |
| `data/keyword-study/{ch}/{studyId}.json` | 키워드별 간결한 전용 설명 (definition, keyPoints, relatedKeywords) |
| `lib/data.ts` → `getKeywordIndex()` | manifest에서 keywordIndex 반환 |
| `lib/data.ts` → `getKeywordStudyEntry()` | keyword-study 파일에서 특정 키워드 엔트리 반환 |
| `app/api/study/[chapterId]/[studyId]/route.ts` | 학습 데이터 JSON API (전체 sections) |
| `app/api/keyword-study/[chapterId]/[studyId]/route.ts` | 키워드별 전용 설명 API |
| `app/quiz/[chapterId]/[setId]/page.tsx` | 서버에서 키워드 인덱스 필터링 후 클라이언트에 전달 |
| `app/quiz/[chapterId]/[setId]/ExplanationWithKeywords.tsx` | 해설 텍스트 키워드 감지 + 팝업 리스트 |
| `app/quiz/[chapterId]/[setId]/StudyPanel.tsx` | 학습내용 사이드/하단 패널 |
| `app/quiz/[chapterId]/[setId]/QuizClient.tsx` | 통합: state 관리, 컴포넌트 연결, keyword-study/study 분기 |

## 데이터 흐름

### 빌드 타임 (sync-data.js)
1. 모든 `data/study/*/**.json` 파일의 `keywords` 배열을 수집
2. 키워드 → 학습파일 역색인(keywordIndex)을 `manifest.json`에 저장
3. 각 키워드에 대해 `data/keyword-study/{ch}/{studyId}.json` 존재 여부를 `hasKeywordStudy` 플래그로 기록

### 서버 사이드 (page.tsx)
1. `getKeywordIndex()`로 전체 인덱스 로드
2. 해당 퀴즈의 모든 해설 텍스트를 합쳐서, **실제 등장하는 키워드만 필터링**
3. 필터링된 인덱스를 QuizClient에 props로 전달

### 클라이언트 사이드
1. `ExplanationWithKeywords`: 해설 텍스트를 파싱하여 키워드를 클릭 가능한 링크로 변환
2. 키워드 클릭 → 관련 학습자료 리스트 팝업 (1개면 바로 선택)
3. 리스트에서 학습자료 선택 → `QuizClient`가 `hasKeywordStudy` 확인
   - **YES**: `/api/keyword-study/{chapterId}/{studyId}?keyword=...` fetch → 간결한 전용 설명
   - **NO (fallback)**: `/api/study/{chapterId}/{studyId}` fetch → 전체 study sections
4. `StudyPanel`에 학습내용 누적 표시 (동일 keyword+studyId 중복 방지)

## 키워드 매칭 규칙

- **부분 매칭**: 해설 텍스트 내에서 키워드가 부분 문자열로 존재하면 매칭
- **대소문자 무시**: 정규식 `i` 플래그 사용
- **긴 키워드 우선 (longest match first)**: `"Database Buffer Cache"`가 `"Database"`보다 먼저 매칭되어, 이미 매칭된 범위 내의 짧은 키워드는 별도로 매칭되지 않음
- **모호한 키워드 허용**: 사용자가 팝업 리스트에서 직접 선택하므로 짧거나 모호한 키워드도 포함
- **기존 키워드만 사용**: study 파일의 `keywords` 배열에 있는 것만 사용. 해설에 등장하지만 키워드 목록에 없는 용어는 무시

## StudyPanel 동작

### PC (width >= 768px)
- 우측 고정 사이드패널 (width: 420px)
- 전체 높이, 스크롤 가능

### 모바일 (width < 768px)
- 하단 고정 패널
- 최대 높이 60vh, 스크롤 가능
- 상단 모서리 둥글게

### 공통
- 학습자료 항목이 아코디언으로 누적 (마지막 추가 항목 자동 펼침)
- 각 항목 개별 닫기(x) 가능
- 전체 패널 닫기 가능
- 동일 keyword + studyId 조합은 중복 추가 안 됨

## 챕터별 작업 시 주의사항

### 이미 완료된 작업 (수정 불필요)
- `sync-data.js`: 모든 챕터의 키워드를 자동 수집하므로 추가 작업 없음
- `manifest.json`: sync-data 실행 시 자동 갱신
- `ExplanationWithKeywords.tsx`: 범용 컴포넌트, 챕터별 수정 불필요
- `StudyPanel.tsx`: 범용 컴포넌트, 챕터별 수정 불필요
- `QuizClient.tsx`: 범용 컴포넌트, 챕터별 수정 불필요
- `/api/study/...`, `/api/keyword-study/...`: 범용 API, 챕터별 수정 불필요

### 챕터별로 확인해야 할 것
1. **해당 챕터의 custom question 파일에 `explanation` 필드가 있는지 확인**
   - exam questions (`data/questions/`)에는 explanation이 없음 (현재 챕터1 기준)
   - custom questions (`data/custom/`)에만 explanation이 있음
2. **키워드 매칭 품질 검증**: 각 챕터의 해설에서 매칭되는 키워드가 적절한지 확인
3. **study 파일의 keywords 배열 품질**: 해당 챕터 개념과 관련된 키워드가 충분히 포함되어 있는지
4. **keyword-study 커버리지**: 감사 스크립트로 missing=0 확인 (KEYWORD_STUDY_GUIDE.md 참조)

### 키워드 추가가 필요한 경우
- study 파일의 `keywords` 배열에 직접 추가
- **keyword-study 파일에도 해당 키워드 엔트리 추가** (필수)
- `sync-data.js` 재실행으로 manifest 갱신
- 앱 재빌드

## 성능 최적화

- 서버에서 해설 텍스트 기준으로 관련 키워드만 필터링하여 클라이언트 전송
  - 전체 인덱스: ~270KB → 필터링 후: ~38KB (챕터1 기준)
- keyword-study 사용 시 키워드별 데이터만 반환하므로 전체 study 파일 대비 전송량 대폭 감소
- 학습 데이터는 사용자가 선택할 때만 API fetch (lazy loading)
- SQL 예제와 keywords는 API 응답에서 제외 (불필요한 데이터 절약)

## 향후 개선 가능 사항

- sourceSection 기반 딥링크: keyword-study에서 "더 보기" 클릭 시 원본 study의 해당 section으로 이동
- 키워드 빈도 기반 정렬: 해설 내 등장 횟수로 팝업 리스트 정렬
- exam questions에도 explanation 추가 시 자동 지원
- 키워드 하이라이트: 학습 패널 내에서 선택한 키워드 위치 하이라이트
