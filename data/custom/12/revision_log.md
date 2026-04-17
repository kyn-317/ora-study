# ch12 수정 이력 (Revision Log)

> **목적**: ch12의 P1(재작성)·P2(교체/완화)·P3(앵글수정)·infra(인프라) 수정 이력을 기록한다.
> **참조**: `guide_files/24_문제수정_에이전트_가이드라인.md`, `guide_files/25_출제금지_토픽_목록.md`
> **연관 파일**: `customquestions_json/12/topic_stats.json`

---

## 기록 형식

```
## [YYYY-MM-DD] {phase} — {파일명 또는 "infra"}: {한줄 요약}

- **대상 파일**: customquestions_json/12/{파일명}.json
- **영향 문제**: C_12_{NNN}, ...
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

**변경 내용**: `forbidden_topics`(빈 배열) / `topic_drift_alert` / `last_revision` 필드 추가

**사유**: A+B+C+D 비중관리 플랜 인프라 (사용자 결정 2026-04-17).

**비중 영향**: custom_topic_counts 변화 없음. P1 대상(custom_12_005~008 Consumer Group 매핑·Plan Directive 5종) 처리 시 비중 재분배 예상.

**topic_stats.json 갱신**: 예 (3개 신규 필드 추가)

---

### [2026-04-17] P1 — custom_12_005: Consumer Group 매핑 속성 우선순위 번호(3, 5)·SET_CONSUMER_GROUP_MAPPING Pending Area 구문 제거, 개요 수준으로 재구성

- **대상 파일**: customquestions_json/12/custom_12_005.json
- **영향 문제**: C_12_021, C_12_022, C_12_023, C_12_024, C_12_025
- **Phase**: P1 (재작성 — 배치 2 / 파일 3)

**Before**:
- topic: Consumer Group詳細(사전 정의 5지 복수정답) + マッピング優先順위(ORACLE_USER=3·SERVICE_NAME=5 번호 시나리오) + CDB/PDB Resource Manager(CREATE_CDB_PLAN_DIRECTIVE 구문·shares 수치) + Pending Area構成手順(SET_CONSUMER_GROUP_MAPPING 구문·GRANT_SWITCH_CONSUMER_GROUP)
- 출제 개념: 사전 정의 그룹 5지 비교·매핑 속성 우선순위 번호 암기·CDB Plan Directive 파라미터 5종(shares/utilization_limit/max_iops/max_mbps/parallel_server_limit)·매핑 규칙 생성 구문 세부

**After**:
- topic: Consumer Group詳細(SYS_GROUP·OTHER_GROUPS 개념) + マッピング規則(접속 속성 기반 자동 배정 개념) + CDB/PDB Resource Manager(2계층 역할 분담 + Default Directive 자동 적용) + Pending Area構成手順(일괄 준비·검증·반영 목적)
- 출제 개념: SYS_GROUP 관리 우선·OTHER_GROUPS 필수 포함·매핑 규칙 일반 목적(접속 속성 자동 배정)·CDB Plan=PDB간 배분/PDB Plan=Consumer Group간 배분 2계층·Default Directive 자동 적용·Pending Area 일관성 보장 목적

**사유**: 진단결과 ch12_자동유지관리.md §3.5 P1 — "C_12_022 — 매핑 속성 우선순위 번호(ORACLE_USER=3, SERVICE_NAME=5) 암기 요구. C_12_025 — Pending Area 절차 내 SET_CONSUMER_GROUP_MAPPING 구문 상세. 18번 §4 미출제 + questions_json 기준선 초과" / "C_12_022/025 개념 수준 재작성 또는 삭제". 프롬프트 지시 "5 문항 전부 교체".

**비중 영향**:
- 주 매핑 변동:
  - C_12_022: マッピング優先順위 → マッピング規則 (라벨 이동)
  - C_12_024: CDB Default Directive管理 → CDB/PDB Resource Manager (Default Directive 개념 수준 재작성으로 상위 카테고리 통합)
  - C_12_021·023·025: 기존 라벨 유지(Consumer Group詳細·CDB/PDB Resource Manager·Pending Area構成手順)

**topic_stats.json 갱신**: 예 (ch12 전수 재집계 시 반영)

---

### [2026-04-17] P1 — custom_12_006: Pending Area 4단계 독립 구분·SWITCH_CONSUMER_GROUP_FOR_SESS·CDB Directive 파라미터 5종 제거, 개요 수준으로 재구성

- **대상 파일**: customquestions_json/12/custom_12_006.json
- **영향 문제**: C_12_026, C_12_027, C_12_028, C_12_029, C_12_030
- **Phase**: P1 (재작성 — 배치 2 / 파일 4)

**Before**:
- topic: Pending Area(CREATE→VALIDATE→SUBMIT→CLEAR 4단계 독립 구분) + Consumer Group SWITCH制御(SWITCH_CONSUMER_GROUP_FOR_SESS + GRANT_SWITCH_CONSUMER_GROUP 복수정답) + マッピング規則(ORACLE_USER=3 vs SERVICE_NAME=5 번호 시나리오) + CDB I/Oレート制限(CREATE_CDB_PLAN_DIRECTIVE 파라미터 5종·max_iops=0 무제한) + CDB Default Directive管理(UPDATE_CDB_DEFAULT_DIRECTIVE 역할)
- 출제 개념: Pending Area 4단계 VALIDATE/SUBMIT 독립 절차·SWITCH 프로시저명·매핑 우선순위 번호·CDB Directive 파라미터 5종 암기·UPDATE_CDB_DEFAULT_DIRECTIVE 기존·신규 PDB 적용 세부

**After**:
- topic: Pending Area(일반 흐름·일관성 보장 목적) + Consumer Group SWITCH制御(수동 전환 개념·전용 프로시저 사용 개요) + マッピング規則(우선순위 기반 평가·DEFAULT_CONSUMER_GROUP 기본 배치) + CDB I/Oレート制限(PDB 단위 리소스 제어 목적·Noisy Neighbor 방지) + Plan Directiveセッション制御(Consumer Group별 CPU 정책 지정 기본 기능)
- 출제 개념: Pending Area 일괄 반영 흐름·Consumer Group 수동 전환 일반 방법(프로시저명 미요구)·매핑 우선순위 기반 평가(번호 미요구)·CDB Resource Plan 목적(Noisy Neighbor 방지)·Plan Directive 기본 기능(Consumer Group별 리소스 정책)

**사유**: 진단결과 ch12_자동유지관리.md §3.6 P1 — "C_12_026 — Pending Area VALIDATE/SUBMIT 독립 단계 구분 Gold. C_12_027 — SWITCH_CONSUMER_GROUP_FOR_SESS 프로시저 이름 과도. C_12_028 — 매핑 속성 우선순위 번호 직접 요구. C_12_029 — CDB Directive 파라미터 5종·max_iops=0 세부. C_12_030 — UPDATE_CDB_DEFAULT_DIRECTIVE 세부". 프롬프트 지시 "5 문항 전부 교체".

**비중 영향**:
- 주 매핑 변동:
  - C_12_028: マッピング規則 → マッピング規則 (라벨 유지, 내용 개념 수준으로 완화)
  - C_12_030: CDB Default Directive管理 → Plan Directiveセッション制御 (라벨 이동, Plan Directive 기본 기능 개념으로 재작성)
  - C_12_026·027·029: 기존 라벨 유지(Pending Area構成手順·Consumer Group SWITCH制御·CDB I/Oレート制限)

**topic_stats.json 갱신**: 예 (ch12 전수 재집계 시 반영)

---

### [2026-04-17] P1 — custom_12_007: SWITCH_TIME + SWITCH_FOR_CALL Top-Level Call 복귀·MGMT_P1 Cascade Level·Resource Manager FORCE 옵션 세부 제거, 개요 수준으로 재구성

- **대상 파일**: customquestions_json/12/custom_12_007.json
- **영향 문제**: C_12_031, C_12_032, C_12_033, C_12_034, C_12_035
- **Phase**: P1 (재작성 — 배치 2 / 파일 5)

**Before**:
- topic: ウィンドウ手動制御・優先順위(window_priority HIGH/LOW 2단계 재개·EXTEND_WINDOW 세부) + AutoTask PDB制御範囲(ENABLE_AUTOMATIC_MAINTENANCE_PDB 파라미터 세부) + SWITCH_TIME自動切替え(SWITCH_FOR_CALL=TRUE Top-Level Call 복귀·SWITCH_TIME_IN_CALL·CANCEL_SQL/KILL_SESSION 구분) + Resource Manager活性化・FORCE(FORCE=TRUE/FALSE 차이·윈도우 Plan 자동 전환 조건) + 多段レベルCPU配分(MGMT)(MGMT_P1~P8 Level 8단계 Cascade 흐름)
- 출제 개념: 윈도우 수동 제어+HIGH/LOW 재개·EXTEND_WINDOW 구문·PDB 스코프 파라미터 세부·SWITCH_FOR_CALL Top-Level Call 복귀·MGMT Cascade Level·FORCE 옵션 차이

**After**:
- topic: ウィンドウ手動制御・優先順位(OPEN_WINDOW 기본 동작) + AutoTask PDB制御範囲(CDB$ROOT 전체·PDB 개별 2계층 원리) + SWITCH_TIME自動切替え(장시간 예상 SQL 자동 Consumer Group 전환 목적) + Resource Manager活性化・FORCE(윈도우 Scheduler 독립·Resource Manager 비활성화 시 윈도우 정상 실행) + 多段レベルCPU配分(MGMT)(Consumer Group별 Plan Directive CPU 차등 배분 기본 구조)
- 출제 개념: OPEN_WINDOW 수동 제어·CDB$ROOT 실행 전체 영향/PDB 실행 한정·SWITCH_TIME 장시간 SQL 자동 전환·윈도우-Scheduler 독립 동작·Plan Directive 기반 CPU 배분 기본 구조

**사유**: 진단결과 ch12_자동유지관리.md §3.7 P1 — "C_12_033 — SWITCH_TIME + SWITCH_FOR_CALL=TRUE Top-Level Call 복귀 세부. C_12_035 — MGMT_P1~P8 Cascade Level 미사용 CPU 흐름. C_12_031 — window_priority HIGH/LOW 재개·EXTEND_WINDOW. 18번 §4 미출제 범위 침범". 프롬프트 지시 "5 문항 전부 교체".

**비중 영향**:
- 주 매핑 변동: 없음(C_12_031~035 모두 기존 라벨 유지, 내용 Silver 개요 수준으로 완화)

**topic_stats.json 갱신**: 예 (ch12 전수 재집계 시 반영)

---

### [2026-04-17] topic_counts_aggregation — infra: 배치 2 완료 후 ch12 39문항 주 매핑 전수 재집계

- **대상 파일**: customquestions_json/12/topic_stats.json
- **영향 문제**: ch12 전체 39문항 (C_12_001 ~ C_12_039)
- **Phase**: topic_counts_aggregation

**Before** (배치 2 적용 전):
- `マッピング優先順위`: 1 (C_12_022 매핑 번호)
- `CDB Default Directive管理`: 1 (C_12_024 또는 C_12_030)
- `Pending Area構成手順`: 1
- `Plan Directiveセッション制御`: 1 (C_12_038)

**After** (배치 2 적용 후):
- `マッピング優先順위`: 0 (라벨 폐지 — C_12_022 재작성 결과 マッピング規則으로 이동)
- `CDB Default Directive管理`: 0 (라벨 폐지 — C_12_024·030 재작성 결과 상위 라벨 통합)
- `Pending Area構成手順`: 2 (C_12_025·026 동일 라벨 정합)
- `Plan Directiveセッション制御`: 2 (C_12_030·038)

**사유**: 배치 2의 P1 재작성 결과 C_12_021~035의 주 매핑이 변경되어 전수 재집계. 주 매핑 정책(A) 확정에 따라 단일 라벨 집계·합계=total_custom=39 정합. 29개 라벨 중 2개 폐지(マッピング優先順위·CDB Default Directive管理) 후 27개 활성 라벨 + 총합 39.

**비중 영향**:
- drift 상태 변동: 없음(drift_threshold_pct=15% 이하 변화)
- total_custom: 39 유지

**topic_stats.json 갱신**: 예 (필드: custom_topic_counts · last_revision · last_checked)

---

### [2026-04-17] P1 — custom_12_008: V$RSRC 컬럼명·사전 정의 플랜 3종 비교·Plan Directive 4종 파라미터·JOB_STATUS 코드·EXTEND_WINDOW API 제거, 개요 수준으로 재구성

- **대상 파일**: customquestions_json/12/custom_12_008.json
- **영향 문제**: C_12_036, C_12_037, C_12_038, C_12_039
- **Phase**: P1 (재작성 — 배치 3 / 파일 1)

**Before**:
- topic: V$RSRCモニタリングビュー(V$RSRC_PLAN IS_TOP_PLAN·WINDOW_NAME·V$RSRC_CONSUMER_GROUP ACTIVE_SESSIONS·QUEUED_SESSIONS·CPU_CONSUMED_TIME 컬럼) + 事前定義済みResource Plan比較(DEFAULT_PLAN·DEFAULT_MAINTENANCE_PLAN·INTERNAL_PLAN 3종 구체 비교) + Plan Directiveセッション制御(ACTIVE_SESS_POOL_P1·MAX_IDLE_TIME·MAX_EST_EXEC_TIME·UNDO_POOL 4종 파라미터 동작) + ウィンドウ終了・時間不足時動作(JOB_STATUS='STOPPED'/'NOT STARTED' 상태 코드·DBMS_SCHEDULER.EXTEND_WINDOW API)
- 출제 개념: V$ 뷰 컬럼명 세부·사전 정의 플랜 3종 SYS_GROUP 우선순위 번호·Plan Directive 파라미터 4종 세부·AutoTask 상태 코드 값

**After**:
- topic: V$RSRCモニタリングビュー(용도 수준) + 事前定義済みResource Plan比較(사전 정의 플랜 존재·역할 개요) + Plan Directiveセッション制御(CPU·병렬·세션 기본 제어 지정 가능 개념) + ウィンドウ終了・時間不足時動作(중단 가능성·다음 윈도우 재스케줄·DBA_AUTOTASK_CLIENT_HISTORY로 상태 파악)
- 출제 개념: V$RSRC_PLAN 활성 플랜 확인·V$RSRC_CONSUMER_GROUP 그룹별 사용 현황·사전 정의 플랜 존재 개념·OTHER_GROUPS Directive 필수성·Plan Directive 기본 기능 범위·AutoTask 미완료 이월 자동 재스케줄·윈도우 자동 연장 부재

**사유**: 진단결과 ch12_자동유지관리.md §4 P1 — 배치 2에서 축출한 SWITCH_TIME 계열 파라미터의 잔여 Gold 세부(Plan Directive 4종 파라미터 동작) 및 V$RSRC 컬럼명·사전 정의 플랜 3종 구체 비교·JOB_STATUS 코드 값 수준 → Silver 초과. 프롬프트 지시 "배치 3 - 4문항 전부 교체(기존 문항 수 유지)".

**비중 영향**:
- 주 매핑 변동: 없음(C_12_036~039 모두 기존 라벨 유지, 내용 Silver 개요 수준으로 완화)
- custom_topic_counts 변동 없음, 총합 39 유지

**topic_stats.json 갱신**: 예 (last_revision·last_checked)

---

### [2026-04-17] remap — infra: original_coverage_map 재매핑 표 추가 + drift 보정 계산

- **대상 파일**: customquestions_json/12/topic_stats.json
- **Phase**: schema_extension (비중관리 인프라 확장)

**변경 내용**: `original_coverage_map` 필드 신규 추가 — 원본 2키를 custom 세부 라벨 집합에 매핑. 보정 drift 재계산 적용.

**매핑 결정**:
- `事前定義済みタスク` → 事前定義済みタスク·DBMS_AUTO_TASK_ADMIN制御·AutoTask実行履歴モニタリング·AutoTask全体無効化·DBA_AUTOTASK_WINDOW_CLIENTSビュー·統計未収集原因診断·AutoTask PDB制御範囲 (9건). 08_02 s01/s03 AutoTask 태스크 제어·모니터링 범주.
- `メンテナンス・ウィンドウとリソース管理` → ウィンドウ계 10건 + Resource Manager계 10건 (총 30건). Resource Plan·Consumer Group·Plan Directive·V$RSRC·CDB Resource Manager 전부 포함.

**판단 근거(애매 항목)**:
- `統計未収集原因診断`(C_12_017): "옵티마이저 통계 미수집 원인 조사"로 AutoTask GATHER_STATS 태스크의 동작 확인 맥락이므로 `事前定義済みタスク` 범주(진단서 §3 custom_12_004 Q1 판정에서 AutoTask 태스크 트러블슈팅으로 분류).
- `AutoTask PDB制御範囲`: AutoTask의 CDB Root vs PDB 제어 범위이므로 `事前定義済みタスク` 범주.
- `DBA_AUTOTASK_WINDOW_CLIENTSビュー`: AutoTask 클라이언트 상태 확인 뷰이므로 `事前定義済みタスク` 범주. `メンテナンス・ウィンドウ` 키워드가 이름에 있으나 목적은 AutoTask 상태 조회.
- Consumer Group·Plan Directive·CDB Resource Manager: 08_02 s04/s05에서 모두 "Maintenance Window와 연동되는 리소스 관리" 맥락. `メンテナンス・ウィンドウとリソース管理` 범주 포함.

**보정 drift 결과**:
- Before flagged: 2건 (事前定義 5.13% / ウィンドウ 10.26%, 둘 다 희석)
- After flagged: 2건 (事前定義 -43.59% / ウィンドウ +43.59%)
- 양상 전환: 매핑 후 事前定義는 상대적 under, ウィンドウ는 대규모 과잉 투자 확인. 원본 비율 2:1에 비해 9:30(약 1:3.3) 역전

**진정한 gap**: 없음 (2키 모두 매핑 존재)

**구조적 한계**: 원본 키가 2개뿐이고 3:1 위중비 구조라 39문항 확장 시 구조적 drift 회피 불가. 문항 증가 시 사실상 ウィンドウ・リソース 범주가 주 수요처.

**topic_stats.json 갱신**: 예 (필드: original_coverage_map 신규 / flagged_topics 재계산 / recheck_note 갱신)

---

