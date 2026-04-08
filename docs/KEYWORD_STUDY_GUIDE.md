# 키워드 전용 학습자료 가이드

## 핵심 원칙

- **study 파일의 keywords 배열을 변경할 때는 반드시 keyword-study도 동시에 갱신한다**
- **sync-data 실행 전 감사 스크립트로 누락이 0인지 확인한다**
- keyword-study가 없는 키워드는 클릭 시 전체 study 파일이 표시되어 학습 집중도가 떨어진다

## 1. 파일 구조

```
data/keyword-study/
  01/
    01_01.json    ← 01_01_메모리구조.json의 keywords에 대한 설명 모음
    01_02.json    ← 01_02_프로세스구조.json의 keywords에 대한 설명 모음
    ...
  02/
    02_01.json
    ...
```

원본 study 파일과 1:1 대응. 하나의 keyword가 여러 study 파일에서 다른 맥락으로 설명될 수 있음.

## 2. JSON 스키마

```json
{
  "studyId": "01_01",
  "chapterId": "01",
  "title": "메모리 구조 (Memory Structures)",
  "keywords": {
    "SGA": {
      "definition": "System Global Area. Oracle 인스턴스 시작 시 할당되는 공유 메모리 영역으로, 모든 서버/백그라운드 프로세스가 공유한다.",
      "keyPoints": [
        "인스턴스당 1개, 인스턴스 시작 시 할당 / 종료 시 해제",
        "구성: Database Buffer Cache, Shared Pool, Redo Log Buffer, Large Pool, Java Pool, Streams Pool 등",
        "Granule(그래뉼) 단위로 메모리 할당 — SGA 크기에 따라 4MB~128MB+"
      ],
      "relatedKeywords": ["PGA", "Database Buffer Cache", "Shared Pool"],
      "sourceSection": "s02"
    }
  }
}
```

### 필드 설명

| 필드 | 타입 | 설명 |
|------|------|------|
| `studyId` | string | 원본 study 파일 ID |
| `chapterId` | string | 챕터 번호 |
| `title` | string | 원본 study 파일 제목 |
| `keywords` | object | keyword명을 key로, 설명 객체를 value로 |
| `keywords[k].definition` | string | 1~2문장 정의. "이게 뭐지?"에 대한 즉답 |
| `keywords[k].keyPoints` | string[] | 핵심 포인트 3~5개. 시험 출제 관점 우선 |
| `keywords[k].relatedKeywords` | string[] | 관련 키워드 (같은 파일 또는 다른 파일) |
| `keywords[k].sourceSection` | string | 원본 study 파일의 상세 내용이 있는 sectionId (딥링크용) |

## 3. 생성 워크플로우

### 케이스 A: study 파일 신규 생성 시

study 파일과 keyword-study 파일을 **동시에** 생성해야 한다.

1. study 파일 작성 완료
2. 서브에이전트로 keyword-study 생성 (아래 서브에이전트 전략 참조)
3. 감사 스크립트로 missing=0 확인
4. sync-data 실행

### 케이스 B: study 파일의 keywords 배열에 키워드 추가 시

추가된 키워드만 keyword-study에 보충한다.

1. study 파일에 키워드 추가
2. 감사 스크립트로 누락 키워드 목록 확인
3. 서브에이전트로 누락분 보충
4. missing=0 확인 후 sync-data 실행

### 케이스 C: study 파일의 keywords 배열에서 키워드 삭제 시

keyword-study에서도 해당 항목을 삭제한다. (남아있어도 기능상 문제는 없지만 데이터 정합성을 위해 삭제 권장)

## 4. 감사 스크립트

### 전체 챕터 커버리지 확인

```bash
cd ora-study && node scripts/audit-keyword-study.js
# 누락 키워드 목록까지 보려면:
node scripts/audit-keyword-study.js --verbose
```

- **모든 행이 OK이고 Total missing: 0이면 sync-data 진행 가능**
- GAPS나 NO_KS가 있으면 아래 서브에이전트 전략으로 보충

### 단일 파일 누락 확인

```bash
cd ora-study && node scripts/audit-keyword-single.js {chapterId} {studyId}
# 예시: node scripts/audit-keyword-single.js 01 01_01
```

## 5. 서브에이전트 전략

### 단위: study 파일 1개 = 서브에이전트 1개

각 서브에이전트는 **하나의 study 파일**에 대해 키워드를 생성한다. study 파일 간 의존성이 없으므로 완전 병렬 실행 가능하다.

### 서브에이전트에 전달할 정보

1. **대상 파일 경로**
   - study 파일: `data/study/{chapterId}/{studyId}_{이름}.json`
   - keyword-study 파일: `data/keyword-study/{chapterId}/{studyId}.json`
2. **누락 키워드 목록** (감사 스크립트 결과에서 추출)
3. **지시**: study 파일을 직접 읽어 sections 내용 파악 후 키워드별 sourceSection 매핑
4. **지시**: 기존 keyword-study 파일을 읽어 형식 참조 및 중복 방지
5. **출력 형식**: JSON만 출력, 마크다운 펜스 없음

### 프롬프트 템플릿

```
You need to generate keyword-study entries for Oracle {주제} keywords.
Follow this JSON format exactly for each keyword:

"KeywordName": {
  "definition": "1-2 sentence definition answering 'what is this?'",
  "keyPoints": ["point1", "point2", "point3"],  // 3-5 points, exam-focused
  "relatedKeywords": ["related1", "related2"],
  "sourceSection": "sXX"  // which section of the study file covers this
}

Write ALL content in Korean. Keep definitions concise (1-2 sentences).
keyPoints should be exam-focused, max 5 items each.

**Study file**: {study 파일 경로}
**Existing keyword-study**: {keyword-study 파일 경로}

Steps:
1. Read the study file to understand each section's content
2. Read the existing keyword-study file for format reference
3. Generate entries for the missing keywords listed below

Missing keywords:
{누락 키워드 목록}

Output ONLY valid JSON - a single object with all keyword entries.
No markdown code fences, no explanation text.
```

### 키워드 수에 따른 분할 기준

| 누락 수 | 서브에이전트 수 | 분할 방식 |
|---------|---------------|----------|
| ~25개   | 1개           | 분할 불필요 |
| 26~50개 | 2개           | 섹션 기준으로 반분 |
| 51개+   | 3개           | 섹션 기준으로 삼분 |

study 파일의 `sections` 배열을 기준으로 분할하면 키워드별 컨텍스트가 자연스럽게 분리된다.

### 실행 후 작업 절차

1. **결과 병합**: 서브에이전트가 keyword-study 파일에 직접 병합하도록 지시하거나, 반환된 JSON을 기존 파일에 수동 병합
2. **누락 확인**: 감사 스크립트로 missing=0 확인
3. **sync-data 실행**: `node scripts/sync-data.js`
4. **동작 확인**: 개발 서버에서 키워드 클릭 시 전용 패널 표시되는지 확인

## 6. 품질 기준

- **definition**: 1~2문장. "이게 뭐지?"에 대한 즉답
- **keyPoints**: 3~5개. 시험 빈출 포인트, 헷갈리기 쉬운 점 위주
- **relatedKeywords**: 같이 알아야 이해되는 개념 연결
- **sourceSection**: 원본 study 파일의 해당 sectionId
- 원본 study 내용과 모순되지 않을 것
- keyword당 전체 10줄 이내

## 7. 점진적 적용 전략

- keyword-study가 존재하는 keyword → 간결한 전용 설명 표시
- keyword-study가 없는 keyword → 기존 동작 (전체 study sections) fallback
- 챕터별로 독립 작업 가능, 미완성 챕터에 영향 없음
