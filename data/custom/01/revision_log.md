# ch01 수정 이력 (Revision Log)

> **목적**: ch01의 P1(재작성)·P2(교체/완화)·P3(앵글수정)·infra(인프라) 수정 이력을 기록한다.
> **참조**: `guide_files/24_문제수정_에이전트_가이드라인.md`, `guide_files/25_출제금지_토픽_목록.md`
> **연관 파일**: `customquestions_json/01/topic_stats.json`

---

## 기록 형식

```
## [YYYY-MM-DD] {phase} — {파일명 또는 "infra"}: {한줄 요약}

- **대상 파일**: customquestions_json/01/{파일명}.json
- **영향 문제**: C_01_{NNN}, ...
- **Phase**: P1(재작성) / P2(교체·완화) / P3(앵글수정) / schema_extension / forbidden_topics_update

**Before**:
- topic: {기존 topic 레이블}
- 출제 개념: {기존 개념 요약}

**After**:
- topic: {수정 후 topic 레이블}
- 출제 개념: {수정 후 개념 요약}

**사유**: {구체 사유 — 진단 결과 / forbidden_topics 침범 / Silver 범위 초과 등}

**비중 영향**:
- custom_topic_counts 변화: {topic별 +/- 또는 "변화 없음"}
- 원본 비율 대비 drift: {발생 여부 / flagged_topics 업데이트 여부}

**topic_stats.json 갱신**: 예/아니오 (필드: custom_topic_counts / flagged_topics / last_revision)
```

---

## 이력

### [2026-04-17] schema_extension — infra: 비중관리 인프라 구축

- **대상 파일**: customquestions_json/01/topic_stats.json
- **영향 문제**: (없음 — 스키마 수준)
- **Phase**: schema_extension

**변경 내용**: `forbidden_topics`(6항목 — ch01 과도 상세) / `topic_drift_alert` / `last_revision` 필드 추가

**사유**: A+B+C+D 비중관리 플랜 인프라 (사용자 결정 2026-04-17). 과도 6항목(LRU Touch Count / SGA Granule / 비표준 블록사이즈 / Shared Server 큐 / DRCP / UGA)을 forbidden_topics에 등재하여 향후 P1/P2 파이프라인 진입 시 회피 기준으로 사용.

**비중 영향**: custom_topic_counts 변화 없음. flagged_topics 초기화 `[]`.

**topic_stats.json 갱신**: 예 (3개 신규 필드 추가)

---

### [2026-04-17] P1 — custom_01_007: Fixed SGA 내부 구조 상세 제거, V$SGA 확인·Large Pool 용도 관점으로 앵글 전환

- **대상 파일**: customquestions_json/01/custom_01_007.json
- **영향 문제**: C_01_031, C_01_032, C_01_033, C_01_034, C_01_035
- **Phase**: P1 (재작성 — 배치 1 / 파일 1)

**Before**:
- topic: メモリー構造 (Fixed SGA · Java Pool · Streams Pool · Result Cache)
- 출제 개념: Fixed SGA 저장 내용 상세(래치/락 구조 메모리 주소·내부 포인터·V$ 참조 배열) / ASMM Fixed SGA 자동 조정 대상 상세 / Java Pool / Streams Pool / Result Cache(최대 50% 수치 포함)

**After**:
- topic: メモリー構造 (Fixed SGA · V$SGA 뷰 · Java Pool · Large Pool · Result Cache)
- 출제 개념: Fixed SGA 기본 특성(크기 결정 주체·V$SGA Fixed Size) / V$SGA의 4구분 + Database Buffers=버퍼 풀 합계 / Java Pool·Shared Pool 독립성 / Large Pool 3대 용도(RMAN/병렬/Shared Server UGA)·Shared Pool 해석 영역 부족 완화 / Result Cache 기본 특성(결과 캐싱·DML 자동 무효화·복수 방식)

**사유**: 진단결과 §4 P1 — Fixed SGA 래치·내부 포인터 상세(10번 §5 #2 과도) 해소. 기존 C_01_031·032에 있던 Fixed SGA 내부 구조 상세 묘사를 결과 수준(V$SGA 조회)으로 낮추고, Streams Pool 대신 Silver 적합도가 높은 Large Pool로 교체. Result Cache 수치 암기 부담 제거.

**비중 영향**:
- custom_topic_counts 변화: `メモリー構造` = 43 유지 (문제 교체이므로 변동 없음)
- drift 상태 변동: 없음 (flagged_topics 변동 없음)

**topic_stats.json 갱신**: 예 (필드: last_revision · last_checked)

---

### [2026-04-17] P1 — custom_01_013: MMON/MMNL 내부 분업 상세 + UGA 이동 상세 제거

- **대상 파일**: customquestions_json/01/custom_01_013.json
- **영향 문제**: C_01_061, C_01_062, C_01_063, C_01_064, C_01_065
- **Phase**: P1 (재작성 — 배치 1 / 파일 2)

**Before**:
- topic: バックグラウンド・プロセス (LREG · MMON · MMNL) + プロセス構造 (Dedicated/Shared Server UGA)
- 출제 개념: LREG 동적 등록 / LREG·정적 등록 비교 / MMON+ADDM 자동 트리거 / MMON vs MMNL 내부 분업(ASH 플러시 담당 구분) / Dedicated-Shared Server UGA 위치 이동(PGA↔SGA Large Pool) 상세

**After**:
- topic: バックグラウンド・プロセス (LREG · MMON · 필수/선택 분류) + プロセス構造 (Dedicated/Shared Server 구성)
- 출제 개념: LREG 동적 등록 주기적 갱신 / LREG·정적 등록 비교 / MMON 기본 역할(AWR 스냅샷 1시간 자동·SYSAUX 저장 결과 수준) / 백그라운드 프로세스 필수·선택 구분(DBWn/LGWR/SMON/PMON/CKPT 필수·ARCn 선택) / Dedicated-Shared Server 구성 방식 차이(1:1 vs 디스패처 중계)

**사유**: 진단결과 §4 P1 — Shared Server 큐·MMON 내부(10번 §5 #22 MMON 스케줄링 과도) 해소. forbidden_topics #6(UGA 위치 이동 상세) 핵심 주제 침범 해소.

**비중 영향**:
- custom_topic_counts 변화: 변동 없음 (문제 교체)
- drift 상태 변동: 없음

**topic_stats.json 갱신**: 예 (필드: last_revision · last_checked)

---

### [2026-04-17] P1 — custom_01_014: Shared Server 큐(forbidden #4) + DRCP 관리 상세(forbidden #5) 제거

- **대상 파일**: customquestions_json/01/custom_01_014.json
- **영향 문제**: C_01_066, C_01_067, C_01_068, C_01_069, C_01_070
- **Phase**: P1 (재작성 — 배치 1 / 파일 3)

**Before**:
- topic: プロセス構造(접속과 세션) (Shared Server 내부 큐 · DRCP 관리 · PGA)
- 출제 개념: Shared Server 요청 처리 내부 흐름(Request/Response Queue) / DRCP 특징(UGA PGA 위치·(SERVER=POOLED)·풀 반환) / DRCP 관리(DBMS_CONNECTION_POOL.START_POOL/CONFIGURE_POOL·V$CPOOL_STAT) / 사용자·서버 프로세스 역할 / PGA 기본 구성

**After**:
- topic: プロセス構造(접속과 세션) (Dedicated/Shared Server · DRCP 개요 · PGA)
- 출제 개념: Dedicated/Shared Server 구성 방식 차이(1:1 vs 디스패처 중계) / DRCP 목적과 기본 특징(서버 측 풀·유휴 세션 메모리 절약) / DRCP 접속 구문(SERVER=POOLED 존재 인지) / 사용자·서버 프로세스 역할 / PGA 기본 구성

**사유**: 진단결과 §4 P1 — DRCP 관리 내부(10번 §5 #5 과도) 해소. forbidden_topics #4(Shared Server 큐 디스패치 내부) + #5(DRCP 내부 풀 관리) 핵심 주제 침범 해소.

**비중 영향**:
- custom_topic_counts 변화: 변동 없음 (문제 교체)
- drift 상태 변동: 없음

**topic_stats.json 갱신**: 예 (필드: last_revision · last_checked)

---
