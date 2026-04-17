# ch13 수정 이력 (Revision Log)

> **목적**: ch13의 P1(재작성)·P2(교체/완화)·P3(앵글수정)·infra(인프라) 수정 이력을 기록한다.
> **참조**: `guide_files/24_문제수정_에이전트_가이드라인.md`, `guide_files/25_출제금지_토픽_목록.md`
> **연관 파일**: `customquestions_json/13/topic_stats.json`

---

## 기록 형식

```
## [YYYY-MM-DD] {phase} — {파일명 또는 "infra"}: {한줄 요약}

- **대상 파일**: customquestions_json/13/{파일명}.json
- **영향 문제**: C_13_{NNN}, ...
- **Phase**: P1 / P2 / P3 / schema_extension / forbidden_topics_update

**Before**: topic + 출제 개념
**After**: topic + 출제 개념
**사유**: {구체 사유}
**비중 영향**: custom_topic_counts 변화 / flagged_topics 업데이트 여부
**topic_stats.json 갱신**: 예/아니오
```

---

## 이력

### [2026-04-17] schema_extension — infra: 비중관리 인프라 구축

- **Phase**: schema_extension

**변경 내용**: `forbidden_topics`(7항목 — Segment Advisor FS1-4 / 히스토그램 4유형 / Stale 10% / DB Time 8분해 / Finding 분류 / MMON 4단계 / Benefit 계산식) / `topic_drift_alert` / `last_revision` 필드 추가

**사유**: A+B+C+D 비중관리 플랜 인프라 (사용자 결정 2026-04-17). 2026-04-17 B안 수정으로 study/08/08_03·08_04에서 삭제된 7항목을 forbidden_topics에 등재. ch13은 Q2(문제과함) 집중 챕터이므로 재생성 시 forbidden_topics 준수가 특히 중요.

**비중 영향**: custom_topic_counts 변화 없음. P1 대상(custom_13_006/007 옵티마이저 어드바이저 내부 API·SPA/STS) 처리 시 비중 재분배 예상.

**topic_stats.json 갱신**: 예 (3개 신규 필드 추가)

---

### [2026-04-17] P1 — custom_13_006: 옵티마이저 통계 어드바이저 내부 API(REPORT_ADVISOR_TASK·AUTO_STATS_ADVISOR_TASK)·SPA 4분류·GET_TASK_SCRIPT·DBMS_ADVISOR vs DBMS_SQLTUNE 패키지명 제거, 개요 수준으로 재구성

- **대상 파일**: customquestions_json/13/custom_13_006.json
- **영향 문제**: C_13_026, C_13_027, C_13_028, C_13_029, C_13_030
- **Phase**: P1 (재작성 — 배치 3 / 파일 2)

**Before**:
- topic: SQLアクセス・アドバイザ(ANALYSIS_SCOPE 기본값 INDEX,MV·SET_TASK_PARAMETER) + オプティマイザ統計アドバイザ(DBMS_STATS.REPORT_ADVISOR_TASK 함수·AUTO_STATS_ADVISOR_TASK 태스크명·12c R2 도입) + SQLパフォーマンス・アナライザ(Improved/Regressed/Unchanged/Errors 4분류·SPB 등록·SQL Patch 적용 절차) + SPA Trial類型・STS構成(DBMS_SQLPA.CREATE_ANALYSIS_TASK·execution_type·REPORT_ANALYSIS_TASK·비교 메트릭 4종) + SQLアクセス・アドバイザ vs SQLチューニング・アドバイザ比較(DBMS_ADVISOR vs DBMS_SQLTUNE·CREATE_TASK vs CREATE_TUNING_TASK·GET_TASK_SCRIPT DDL/UNDO·SQL 튜닝 4가지 분석 유형)
- 출제 개념: 어드바이저 파라미터 기본값·내부 함수·버전 이력·SPA 4분류·SPM/SPB 대응·실행 메트릭 4종·패키지명 구분·구현 스크립트 생성 API·SQL 튜닝 4단계 분석 유형

**After**:
- topic: SQLアクセス・アドバイザ(용도 수준) + オプティマイザ統計アドバイザ(진단 도구·실제 수집 DBMS_STATS 분리) + SQLパフォーマンス・アナライザ(변경 전후 비교 평가·분류 결과) + SPA Trial類型・STS構成(STS 입력·결과 분류 제공) + SQLアクセス・アドバイザ vs SQLチューニング・アドバイザ比較(워크로드 대상 액세스 구조 vs 개별 SQL 튜닝 역할 구분·자동 메인터넌스 소속 차이)
- 출제 개념: 어드바이저의 역할·진단과 실행 주체 구분·SPA 용도·STS 컨테이너 역할·두 어드바이저 역할 구분

**사유**: 진단결과 ch13_퍼포먼스.md §4 P1 — "C_13_027 옵티마이저 통계 어드바이저 내부 API 수준·C_13_028/029 SPA 내부 절차 알고리즘 수준·C_13_030 GET_TASK_SCRIPT 운영 절차 심화 → 실버 초과". 프롬프트 지시 "5 문항 전부 교체". forbidden_topics 7항목 전수 검사 통과(미침범).

**비중 영향**:
- 주 매핑 변동: 없음(C_13_026~030 모두 기존 라벨 유지, 내용 Silver 개요 수준으로 완화)
- custom_topic_counts 변동 없음, 총합 33 유지

**topic_stats.json 갱신**: 예 (last_revision·last_checked)

---

### [2026-04-17] P1 — custom_13_007: SPA execution_type 3종·SELECT_WORKLOAD_REPOSITORY·force_match·ACCEPT_SQL_PROFILES·STS 전송 4단계 제거, 개요 수준으로 재구성

- **대상 파일**: customquestions_json/13/custom_13_007.json
- **영향 문제**: C_13_031, C_13_032, C_13_033
- **Phase**: P1 (재작성 — 배치 3 / 파일 3)

**Before**:
- topic: SPA Trial類型・STS構成(execution_type 3종 EXPLAIN PLAN/TEST EXECUTE/COMPARE PERFORMANCE·SELECT_WORKLOAD_REPOSITORY 테이블 함수·ranking_measure·basic_filter·SELECT_CURSOR_CACHE 구분) + SQLプロファイル・自動SQLチューニング(ACCEPT_SQL_PROFILE force_match=TRUE·DBMS_AUTO_SQLTUNE 패키지·ACCEPT_SQL_PROFILES 자동 적용) + STS転送・参照管理(CREATE_STGTAB_SQLSET→PACK→UNPACK 4단계·ADD_SQLSET_REFERENCE 오삭제 방지·DBA_SQLSET_REFERENCES vs DBA_SQLSET_STATEMENTS 뷰)
- 출제 개념: SPA execution_type 파라미터 값·AWR 로드 테이블 함수·SQL 프로파일 자동 적용 메커니즘·STS 전송 4단계 프로시저·참조 관리 프로시저·뷰 구분

**After**:
- topic: SPA Trial類型・STS構成(용도·사전 리스크 평가) + SQLプロファイル・自動SQLチューニング(옵티마이저 비용 추정 보정 보조 정보·SPB와의 차이·영구 저장) + STS転送・参照管理(분석 대상 컨테이너·도구 공통 입력·환경 간 이동 가능)
- 출제 개념: SPA 목적과 결과 활용·DBA 수동 대응 필요·SQL 프로파일 개념·STS 컨테이너 역할과 용도

**사유**: 진단결과 ch13_퍼포먼스.md §4 P1 — "C_13_031 SPA execution_type 3종·테이블 함수 파라미터·C_13_032 SQL 프로파일 force_match·ACCEPT_SQL_PROFILES 자동 적용·C_13_033 STS 전송 4단계 전체 → Gold 레벨 심화". 프롬프트 지시 "3 문항 전부 교체". forbidden_topics 7항목 전수 검사 통과(미침범).

**비중 영향**:
- 주 매핑 변동: 없음(C_13_031~033 모두 기존 라벨 유지, 내용 Silver 개요 수준으로 완화)
- custom_topic_counts 변동 없음, 총합 33 유지

**topic_stats.json 갱신**: 예 (last_revision·last_checked)

---
