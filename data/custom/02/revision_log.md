# ch02 수정 이력 (Revision Log)

> **목적**: ch02의 P1(재작성)·P2(교체/완화)·P3(앵글수정)·infra(인프라) 수정 이력을 기록한다.
> **참조**: `guide_files/24_문제수정_에이전트_가이드라인.md`, `guide_files/25_출제금지_토픽_목록.md`
> **연관 파일**: `customquestions_json/02/topic_stats.json`

---

## 기록 형식

```
## [YYYY-MM-DD] {phase} — {파일명 또는 "infra"}: {한줄 요약}

- **대상 파일**: customquestions_json/02/{파일명}.json
- **영향 문제**: C_02_{NNN}, ...
- **Phase**: P1 / P2 / P3 / schema_extension / forbidden_topics_update

**Before**:
- topic: {기존 topic 레이블}
- 출제 개념: {기존 개념 요약}

**After**:
- topic: {수정 후 topic 레이블}
- 출제 개념: {수정 후 개념 요약}

**사유**: {구체 사유}

**비중 영향**:
- custom_topic_counts 변화: {topic별 +/- 또는 "변화 없음"}
- 원본 비율 대비 drift: {발생 여부 / flagged_topics 업데이트 여부}

**topic_stats.json 갱신**: 예/아니오
```

---

## 이력

### [2026-04-17] P2 — custom_02_006.json: C_02_027·C_02_030 도구 역할 관점 재구성

- **대상 파일**: customquestions_json/02/custom_02_006.json
- **영향 문제**: C_02_027, C_02_030
- **Phase**: P2

**Before**:
- topic: RMAN (C_02_027 RESTORE/RECOVER 명령 역할 구분, C_02_030 VALIDATE DATABASE + V$DATABASE_BLOCK_CORRUPTION 뷰)
- 출제 개념: 복구 절차 세부 (RESTORE→RECOVER→ALTER DATABASE OPEN) / VALIDATE + V$DATABASE_BLOCK_CORRUPTION + BLOCKRECOVER

**After**:
- topic: ツール横断比較 (C_02_027 RMAN vs SQL*Plus 도구 역할 비교, C_02_030 Oracle 주요 도구 역할 분담)
- 출제 개념: 도구별 담당 영역 매핑(RMAN=백업/복구, SQL*Plus=SQL·일반 관리, DBCA=생성, NETCA=리스너, SQL Developer=SQL GUI, EM CC=통합 관리) / STARTUP/SHUTDOWN 지원 도구 / RMAN 접속 권한(SYSDBA·SYSBACKUP)

**사유**: 진단결과 ch02_DB툴.md §3 custom_02_006 항목 지적. RMAN 복구 절차 상세 및 VALIDATE + V$DATABASE_BLOCK_CORRUPTION는 questions_json 02_002 "RMAN 도구 기능" 상한 초과. ch02(5%)는 "도구 용도·특성 구분"이 출제 핵심이며, 복구 절차 세부는 별도 복구 챕터 영역. 도구 역할 관점으로 교체.

**비중 영향**:
- custom_topic_counts 변화: RMAN -2, ツール横断比較 +2 (두 문제가 복수 도구 비교로 전환)
- 수정 미반영 유지: topic_stats.json의 custom_topic_counts 필드는 "주 매핑 단일 집계 원칙"에 따라 핵심 주제 기준. 본 수정은 title에 RMAN을 여전히 중심으로 언급(C_02_027)하거나 도구 횡단 비교(C_02_030)로 경계가 모호. 다음 주기 drift 재계산 시 반영 예정. 본 배치는 last_revision만 갱신.
- drift 상태 변동: 없음 (flagged_topics 빈 배열 유지)

**topic_stats.json 갱신**: 예 (last_revision 필드)

---

### [2026-04-17] P2 — custom_02_002.json: C_02_008 도구 역할 관점 재구성

- **대상 파일**: customquestions_json/02/custom_02_002.json
- **영향 문제**: C_02_008
- **Phase**: P2

**Before**:
- topic: RMAN (증분 백업 Level 0/1, Backup Set vs Image Copy)
- 출제 개념: 증분 백업 Level 0/1 구분 / 백업 포맷 크기 비교 / Unused Block Compression / 블록 손상 감지 / Recovery Catalog 필수 여부

**After**:
- topic: RMAN (도구 역할 관점)
- 출제 개념: RMAN=백업/복구 전용 CLI 도구 / STARTUP/SHUTDOWN 지원 / OS 인증 가능 / Recovery Catalog 선택 / DBCA(GUI/생성)와의 역할 구분

**사유**: 진단결과 ch02_DB툴.md §3 custom_02_002 항목 지적. Level 0/1·Backup Set vs Image Copy 크기 비교·Unused Block Compression 등 RMAN 백업 메커니즘 세부가 questions_json 02_002 상한 초과. 10번 §5 삭제 전 과도 항목 수준과 일치. ch02(5%)는 도구 용도·특성 출제가 상한.

**비중 영향**:
- custom_topic_counts 변화: 변화 없음 (topic=RMAN 유지, 앵글만 도구 역할 관점으로 전환)
- drift 상태 변동: 없음

**topic_stats.json 갱신**: 예 (last_revision 필드)

---

### [2026-04-17] P3 — custom_02_004.json: C_02_017 SQL*Plus 도구 관점 재구성

- **대상 파일**: customquestions_json/02/custom_02_004.json
- **영향 문제**: C_02_017
- **Phase**: P3

**Before**:
- topic: SQL*Plus (원래 ch10 Local/Common User 개념 혼입 상태)
- 출제 개념: PDB Local User vs Common User 구분 (ch10 영역 침범)

**After**:
- topic: SQL*Plus
- 출제 개념: Easy Connect 접속 / ALTER SESSION SET CONTAINER / SHOW CON_NAME 3개 SQL*Plus 기능

**사유**: 18번 매핑(2026-04-16)의 앵글수정 권고 미이행분. ch10 Local/Common User 개념이 SQL*Plus 문제에 혼입되어 있어 챕터 경계 위반. SQL*Plus 도구 관점 3개 기능으로 D/E 오답 교체.

**비중 영향**: topic 레이블 유지(SQL*Plus). 숫자 변화 없음, 개념 순도만 상향.

**topic_stats.json 갱신**: 예 (last_revision 필드만 업데이트)

---

### [2026-04-17] schema_extension — infra: 비중관리 인프라 구축

- **대상 파일**: customquestions_json/02/topic_stats.json
- **Phase**: schema_extension

**변경 내용**: `forbidden_topics`(빈 배열 — ch02는 과도 항목 없음) / `topic_drift_alert` / `last_revision` 필드 추가

**사유**: A+B+C+D 비중관리 플랜 인프라 (사용자 결정 2026-04-17)

**비중 영향**: custom_topic_counts 변화 없음

**topic_stats.json 갱신**: 예 (3개 신규 필드 추가)

---

### [2026-04-17] remap — infra: original_coverage_map 재매핑 표 추가 + drift 보정 계산

- **대상 파일**: customquestions_json/02/topic_stats.json
- **Phase**: schema_extension (비중관리 인프라 확장)

**변경 내용**: `original_coverage_map` 필드 신규 추가 — 원본 5키 모두를 custom 세부 라벨 집합에 매핑. 보정 drift 재계산 적용.

**매핑 결정**:
- `DBCA` → 동명 1 라벨(6건). 도구별 직접 대응.
- `SQL*Plus` → SQL*Plus·ツール横断比較 (2 라벨, 10건). ツール横断비교는 P2 배치1에서 RMAN vs SQL*Plus 도구 역할 비교(C_02_027)·Oracle 주요 도구 역할 분담(C_02_030)으로 재구성됨. SQL*Plus(조정 셸 도구)가 주 귀속점.
- `RMAN` → 동명 1 라벨(7건).
- `Enterprise Manager Cloud Control` → 동명 1 라벨(6건).
- `SQL Developer` → 동명 1 라벨(2건).

**판단 근거(애매 항목)**:
- `ツール横断比較`: 복수 도구 역할 비교 주제로 단일 도구 귀속 불가. 진단서 §2 "5대 툴 완전 매핑" + revision_log P2 배치1 재구성 맥락상 SQL*Plus(원본 가중치 2)가 최대 가중 축이므로 이 범주 귀속. 다른 선택지로 RMAN(백업 도구)도 가능하나 SQL*Plus가 더 광범위한 "SQL·일반 관리 조정" 역할 수행.

**보정 drift 결과**:
- Before flagged: 0건 (P2 배치1 이후 라벨 직접매핑 기준 이미 임계 이내)
- After flagged: 0건 유지
- DBCA(6건·+2.69%)·SQL*Plus(10건·-1.08%)·RMAN(7건·+5.91%)·EM Cloud Control(6건·+2.69%)·SQL Developer(2건·-10.22%) 전원 해소
- 31문항 확장이 원본 가중치(1:2:1:1:1)에 근사 수렴. SQL Developer는 원본 가중치 대비 under-coverage지만 임계 이내(-10.22%).

**진정한 gap**: 없음 (5키 모두 매핑 완전). 커스텀 전용 주제(ツール横断比較) 역시 의미적 근접성으로 SQL*Plus 범주 편입.

**구조적 안정**: ch02는 원본 5대 툴 가중치(1:2:1:1:1)와 custom 분포(6:10:7:6:2)가 구조적으로 근사. 편차 최대 -10.22%로 13챕터 중 ch04에 이어 두 번째로 균형잡힌 챕터.

**topic_stats.json 갱신**: 예 (필드: original_coverage_map 신규 / recheck_note 갱신)

---
