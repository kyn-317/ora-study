# ch10 수정 이력 (Revision Log)

> **목적**: ch10의 P1(재작성)·P2(교체/완화)·P3(앵글수정)·infra(인프라) 수정 이력을 기록한다.
> **참조**: `guide_files/24_문제수정_에이전트_가이드라인.md`, `guide_files/25_출제금지_토픽_목록.md`
> **연관 파일**: `customquestions_json/10/topic_stats.json`

---

## 기록 형식

```
## [YYYY-MM-DD] {phase} — {파일명 또는 "infra"}: {한줄 요약}

- **대상 파일**: customquestions_json/10/{파일명}.json
- **영향 문제**: C_10_{NNN}, ...
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

**비중 영향**: custom_topic_counts 변화 없음. P1 대상(custom_10_009/010/011 Application Container·Snapshot Copy·Refreshable Clone Gold 수준) 처리 시 비중 재분배 예상.

**topic_stats.json 갱신**: 예 (3개 신규 필드 추가)

---

### [2026-04-17] P1 — custom_10_009: Application Container 내부 운용 + Snapshot Copy 내부 메커니즘 제거, 개요 수준으로 재구성

- **대상 파일**: customquestions_json/10/custom_10_009.json
- **영향 문제**: C_10_039, C_10_040, C_10_041, C_10_042, C_10_043
- **Phase**: P1 (재작성 — 배치 1 / 파일 5)

**Before**:
- topic: Application Container(Root·Seed·Application PDB 내부 운용) + Snapshot Copy PDB(CoW 블록 수준·스토리지 전제 상세)
- 출제 개념: Application Seed 복수 가능 여부·SYNC 요건·Application Seed 명명 규칙 <Root>$SEED·CREATE AS SEED 실습 / Snapshot Copy CoW 메커니즘·스토리지 점진 증가·READ WRITE 오픈·ACFS/dNFS·ARCHIVELOG 전제·REFRESH MODE SNAPSHOT 구문 / Application 업그레이드 BEGIN UPGRADE·END UPGRADE·각 PDB SYNC·OPEN 상태 필요

**After**:
- topic: Application Container(개요·CDB 내 위치) + Snapshot Copy PDB(빠른 생성 이점·스토리지 요건) + PDB 클론 3방식 개요 비교
- 출제 개념: Application Container SaaS 멀티테넌트 공통 정의 공유 용도·인스턴스 공유 원칙 / Application Root·Application PDB의 CDB$ROOT 하위 계층 / Snapshot Copy 크기 무관 단시간 생성 이점·READ WRITE 운용 / Snapshot Copy 스냅샷 지원 스토리지(ACFS/dNFS) 요건 / Local Clone·Refreshable Clone·Snapshot Copy 3방식 개요 구분(물리 복사 / 주기 리프레시 READ ONLY / 스냅샷 기반 즉시 생성)

**사유**: 진단결과 ch10_PDB.md §3.9 P1 — "전체 5문제가 Application Container 내부 운용 심층 — §4 미출제 대상" / "파일 전체 대체 권장. Application Container는 '개념과 용도(SaaS 멀티테넌트 공통 정의 공유) + CDB 내 위치' 수준의 1~2문제로 축소. Snapshot Copy는 '존재 여부·빠른 생성 이점·스토리지 요건 인지' 수준 1문제로 대체. CoW 블록 수준 동작, SYNC 절차, 데이터 공유 유형 3종 비교는 제거". 10번 §5 과도 항목 해소 + questions_json Application Container·Snapshot Copy 완전 미출제 정합 복원.

**비중 영향**:
- custom_topic_counts 변화:
  - `Application Container`: 6 → 4 (−2)
  - `Snapshot Copy PDB`: 5 → 2 (−3)
  - `PDBクローンおよび管理`: 4 → 5 (+1)
- drift 상태 변동: 없음 (상위 주제 "PDBクローンおよび管理" 범주 내 재배정)
- total_custom: 55 유지 (파일 수 불변)

**topic_stats.json 갱신**: 예 (필드: custom_topic_counts · last_revision · last_checked)

> **주의**: 위 재배정 수치는 추정 기반. 실제 주 매핑 전수 검증은 아래 2026-04-17 topic_counts_correction 항목으로 정정됨.

---

### [2026-04-17] topic_counts_correction — infra: 55문항 주 매핑 전수 검증 후 counts 정정

- **대상 파일**: customquestions_json/10/topic_stats.json
- **영향 문제**: ch10 전체 55문항 (C_10_001 ~ C_10_055)
- **Phase**: topic_counts_correction

**Before** (P1 배치 1 직후 추정 재배정 상태):
- `Snapshot Copy PDB`: 2
- `Application Container`: 4
- 합계 51 (total_custom=55와 4차)

**After** (주 매핑 전수 검증 후):
- `Snapshot Copy PDB`: 5 (C_10_016·041·042·047·048)
- `Application Container`: 5 (C_10_039·040·044·045·046)
- 합계 55 (= total_custom 정합)

**사유**: custom_10_009 재작성 후 orchestrator가 추정 기반으로 counts를 재배정했으나, 실제 custom_10_010·011의 Snapshot Copy 신규 문항(041·042·047·048)이 반영되지 않아 2로 과소 집계됨. Application Container도 C_10_046까지 총 5건인데 4로 누락. 사용자 결정으로 **주 매핑 정책(A)** 확정 (문항당 1개 topic 집계, 합계=total_custom 원칙). 15개 공식 라벨 전수 적용, 미분류 0건.

**비중 영향**:
- custom_topic_counts 변화:
  - `Snapshot Copy PDB`: 2 → 5 (+3)
  - `Application Container`: 4 → 5 (+1)
- drift 상태 변동: 없음 (drift_threshold_pct=15% 이하 변화)
- total_custom: 55 유지

**topic_stats.json 갱신**: 예 (필드: custom_topic_counts · last_revision)

**참고**: 부 매핑(복수 topic) 세팅은 향후 별도 infra 작업으로 분리 예정. 현재 정책은 주 매핑 단일 집계.

---

### [2026-04-17] P1 — custom_10_010: Application Container 내부 운용(BEGIN/END INSTALL·data link 3종)·Snapshot Copy CoW 제거, 개요 수준으로 재구성

- **대상 파일**: customquestions_json/10/custom_10_010.json
- **영향 문제**: C_10_044, C_10_045, C_10_046, C_10_047, C_10_048
- **Phase**: P1 (재작성 — 배치 2 / 파일 1)

**Before**:
- topic: Application Container(BEGIN INSTALL·END INSTALL·data link 3종·SYNC 절차) + Snapshot Copy PDB(CLONEDB·CoW 블록 수준)
- 출제 개념: Application Container 애플리케이션 설치 절차 BEGIN/END INSTALL 명령·METADATA LINK·DATA LINK·EXTENDED DATA LINK 3종 비교·SYNC/UPGRADE 단계 / Snapshot Copy CLONEDB 커맨드·CoW 동작 상세

**After**:
- topic: Application Container(개요·CDB 내 위치·SaaS 용도) + Snapshot Copy PDB(빠른 생성 이점·스토리지 요건) + PDB 클론 3방식 개요 비교
- 출제 개념: Application Container SaaS 멀티테넌트 공통 정의 공유 용도·CDB$ROOT→Application Root→Application PDB 3계층 / Snapshot Copy 크기 무관 단시간 생성 이점·READ WRITE 운용 / Snapshot Copy 스냅샷 지원 스토리지(ACFS/dNFS) 요건 / Local Clone·Refreshable Clone·Snapshot Copy 3방식 개요 구분

**사유**: 진단결과 ch10_PDB.md §3.10 P1 — "C_10_044·045 — Application Container 설치·동기화 내부 절차(BEGIN/END INSTALL) 반복 출제. C_10_046·047·048 — Snapshot Copy CLONEDB·CoW 블록 수준 반복. 18번 §4 미출제 + questions_json 기준선 초과" / "5문항 전부 Silver 개요 수준으로 재작성 필요". 프롬프트 지시 "5 문항 전부 교체".

**비중 영향**:
- 주 매핑 변동:
  - C_10_046: Application Container → Snapshot Copy PDB (Δ Application Container -1 / Snapshot Copy PDB +1)
  - C_10_048: Snapshot Copy PDB → PDBクローンおよび管理 (Δ Snapshot Copy PDB -1 / PDBクローンおよび管理 +1)
- 기타 질문(044, 045, 047)은 동일 topic 유지.
- total_custom: 55 유지.

**topic_stats.json 갱신**: 예 (custom_topic_counts · last_revision · last_checked — ch12 재집계와 함께 반영)

---

### [2026-04-17] P1 — custom_10_011: Refreshable Clone SWITCHOVER 방향성 + Lockdown Profile DISABLE STATEMENT OPTION ALL EXCEPT 제거, 개요 수준으로 재구성

- **대상 파일**: customquestions_json/10/custom_10_011.json
- **영향 문제**: C_10_049, C_10_050, C_10_051, C_10_052, C_10_053
- **Phase**: P1 (재작성 — 배치 2 / 파일 2)

**Before**:
- topic: Refreshable Clone PDB(SWITCHOVER 방향성 반전·Pending Change 처리) + Lockdown Profile(DISABLE STATEMENT OPTION ALL EXCEPT 구문·PDB_LOCKDOWN 계층)
- 출제 개념: Refreshable Clone SWITCHOVER 커맨드로 소스·클론 역할 반전·Pending Change 적용 순서 / Lockdown Profile DISABLE STATEMENT OPTION ALL EXCEPT 고급 구문 조합·PDB_LOCKDOWN CDB$ROOT·PDB 계층 적용 우선순위 / Lockdown Profile 동적 반영·세션 영향

**After**:
- topic: PDB 관련 뷰 모니터링 개요(CDB_PDBS·V$PDBS) + SAVE STATE 기본(재시작 자동 오픈) + Refreshable Clone 개요(주기 리프레시·READ ONLY) + 리프레시 영향(클론 CLOSE·소스 READ WRITE 유지) + Lockdown Profile 기본 용도(CDB 관리자 관리·PDB 단위 제한)
- 출제 개념: CDB_PDBS 딕셔너리 상태·V$PDBS 오픈 모드 사용법 / SAVE STATE 저장된 오픈 모드로 재시작 자동 복원 / Refreshable Clone 주기 리프레시 + READ ONLY + ARCHIVELOG 전제 / 리프레시 중 클론 CLOSE 소스 정상 운영 / Lockdown Profile CDB 관리자 설정·PDB 전체 적용·동적 반영

**사유**: 진단결과 ch10_PDB.md §3.11 P1 — "C_10_051 — Refreshable Clone SWITCHOVER 방향성 반전 상세. C_10_053 — Lockdown Profile DISABLE STATEMENT OPTION ALL EXCEPT 상세 구문. 18번 §4 미출제 + questions_json 기준선 초과" / "C_10_051 재작성·C_10_053 완화". 프롬프트 지시 "5 문항 전부 교체" (049·050·052 현행은 Silver 적합이나 배치 통일성을 위해 재작성).

**비중 영향**:
- 주 매핑 변동:
  - 전체 5문항 재작성하였으나 주 매핑 topic은 대부분 유지됨(049→PDB関連ビューとモニタリング, 050→PDB状態管理（SAVE STATE）, 051·052→Refreshable Clone PDB, 053→PDB Lockdown Profile).
  - 단, 이전 topic_stats.json의 counts는 055 포함 전체 55문항 주 매핑 전수 검증 기반으로 재산정한 결과 다음 변동 발생:
    - PDBの切断と状態: 8 → 6 (분류 정제: DROP/OMF·Unplug 출력·이전 절차를 PDBクローンおよび管理로 재분류)
    - PDBクローンおよび管理: 5 → 8 (위 분류 포함 + 배치 2 C_10_048 신규 이전)
    - PDB状態管理（SAVE STATE）: 4 → 5 (C_10_050 + C_10_038 재검증)
    - PDB関連ビューとモニタリング: 6 → 5 (C_10_032 이전 분류 정제)
    - Application Container: 5 → 4 (C_10_046 Snapshot Copy로 이전)
- total_custom: 55 유지.

**topic_stats.json 갱신**: 예 (custom_topic_counts · last_revision · last_checked)

---

### [2026-04-17] remap — infra: original_coverage_map 재매핑 표 추가 + drift 보정 계산

- **대상 파일**: customquestions_json/10/topic_stats.json
- **Phase**: schema_extension (비중관리 인프라 확장)

**변경 내용**: `original_coverage_map` 필드 신규 추가 — 원본 4키를 custom 세부 라벨 집합에 매핑. 보정 drift 재계산 적용.

**매핑 결정**:
- `PDB生成` → PDB生成·PDB$SEED·PDBストレージ制限·CDB構造とコンテナ体系·共通ユーザーとローカルユーザー·Application Container (6 라벨, 총 14건). 02_01/02_02(구조·토대+생성) 범주.
- `PDBの切断と状態` → PDBの切断と状態·PDB状態管理（SAVE STATE）·PDBオープンモード管理·PDB関連ビューとモニタリング (4 라벨, 19건). 02_03 범주.
- `PDB初期化パラメータ` → PDB初期化パラメータ·PDB Lockdown Profile (2 라벨, 6건). 02_04 s02·Lockdown Profile 범주.
- `PDBクローンおよび管理` → PDBクローンおよび管理·Refreshable Clone PDB·Snapshot Copy PDB (3 라벨, 16건). 02_04 s04~07 클론 범주.

**판단 근거(애매 항목)**:
- `CDB構造とコンテナ体系`·`共通ユーザーとローカルユーザー`·`PDB$SEED`·`PDBストレージ制限`: 진단서 §2.1 02_01이 "멀티테넌트 아키텍처·CDB 내부 구조·공통/로컬 객체" 커버하며 questions_json 10_001은 "PDB$SEED 템플릿" 로 PDB生成 범주에 있음. 따라서 CDB 구조·공통 사용자·SEED·스토리지 제한은 생성 기반 개념으로 `PDB生成` 범주.
- `Application Container`: 02_02 s05에 배치되며 "Application Container의 PDB 생성"이 주 운용이므로 `PDB生成` 범주. 단 진단서 §4 미출제 지정 항목이나 매핑 자체는 범주로 가능.
- `PDB Lockdown Profile`: 02_04 s03에 "파라미터 복제 관리와 함께" 서술. PDB별 파라미터/기능 제한이 핵심이므로 `PDB初期化パラメータ` 범주.
- `PDB関連ビューとモニタリング`: CDB_PDBS·V$PDBS 등은 주로 PDB 상태·오픈 모드 확인 용도이므로 `PDBの切断と状態` 범주(진단서 §3 custom_10_011 C_10_049 배치).

**보정 drift 결과**:
- Before flagged: 2건 (PDB生成 -16.36% / PDBの切断 -29.09%)
- After flagged: 0건 — 모든 topic 임계 이내

**진정한 gap**: 없음 (4키 모두 매핑 충분)

**구조적 해소**: 세부 라벨을 원본 4주제에 정확히 분산 매핑한 결과 55문항 확장이 원본 비율에 자연스럽게 수렴. 매핑 표 도입의 효과가 가장 뚜렷한 챕터.

**topic_stats.json 갱신**: 예 (필드: original_coverage_map 신규 / flagged_topics 재계산 / recheck_note 갱신)

---

