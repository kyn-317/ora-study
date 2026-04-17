# ch03 수정 이력 (Revision Log)

> **목적**: ch03의 P1(재작성)·P2(교체/완화)·P3(앵글수정)·infra(인프라) 수정 이력을 기록한다.
> **참조**: `guide_files/24_문제수정_에이전트_가이드라인.md`, `guide_files/25_출제금지_토픽_목록.md`
> **연관 파일**: `customquestions_json/03/topic_stats.json`

---

## 기록 형식

```
## [YYYY-MM-DD] {phase} — {파일명 또는 "infra"}: {한줄 요약}

- **대상 파일**: customquestions_json/03/{파일명}.json
- **영향 문제**: C_03_{NNN}, ...
- **Phase**: P1 / P2 / P3 / schema_extension / forbidden_topics_update

**Before**: topic + 출제 개념
**After**: topic + 출제 개념
**사유**: {구체 사유}
**비중 영향**: custom_topic_counts 변화 / flagged_topics 업데이트 여부
**topic_stats.json 갱신**: 예/아니오
```

---

## 이력

### [2026-04-17] P3 — custom_03_002.json: C_03_009 B선택지 트레이스 경로 3가지로 교체

- **대상 파일**: customquestions_json/03/custom_03_002.json
- **영향 문제**: C_03_009
- **Phase**: P3

**Before**:
- topic: ADR/ログ
- B선택지 개념: 백그라운드 프로세스 명명 형식 (ch13 영역)

**After**:
- topic: ADR/ログ
- B선택지 개념: 트레이스 파일 생성 경로 3가지 (내부 오류 자동 / 백그라운드 자동 / SQL Trace 수동)

**사유**: 20260417 진단(B선택지가 ch13 퍼포먼스 영역 침범). ch03 ADR 관점으로 재집중.

**비중 영향**: topic 레이블 유지(ADR/ログ). 숫자 변화 없음, 개념 순도만 상향.

**topic_stats.json 갱신**: 예 (last_revision 필드만 업데이트)

---

### [2026-04-17] schema_extension — infra: 비중관리 인프라 구축

- **Phase**: schema_extension

**변경 내용**: `forbidden_topics`(빈 배열) / `topic_drift_alert` / `last_revision` 필드 추가

**사유**: A+B+C+D 비중관리 플랜 인프라 (사용자 결정 2026-04-17)

**topic_stats.json 갱신**: 예 (3개 신규 필드 추가)

---

### [2026-04-17] remap — infra: original_coverage_map 재매핑 표 추가 + drift 보정 계산

- **대상 파일**: customquestions_json/03/topic_stats.json
- **Phase**: schema_extension (비중관리 인프라 확장)

**변경 내용**: `original_coverage_map` 필드 신규 추가 — 원본 5키를 custom 세부 라벨 집합에 매핑. 보정 drift 재계산 적용.

**매핑 결정**:
- `起動・停止手順` → 起動・停止手順·インスタンス・リカバリ·チェックポイント (3 라벨, 29건). 진단서 §2.1 01_04+01_06 범주(기동/정지 + 복구 흐름).
- `PDB管理` → PDB Lockdown Profile·マルチテナント+RAC (2 라벨, 2건). 진단서 §2.1 03_004 PDB SAVE STATE + RAC 다중 노드 운용 맥락.
- `V$/ディクショナリ・ビュー` → 동명 1 라벨(3건).
- `ADR/ログ` → 동명 1 라벨(2건).
- `初期化パラメータ` → 初期化パラメータ·FRA(高速リカバリ領域)·ARCHIVELOGモード管理 (3 라벨, 22건). 진단서 §2.3 FRA 추가 출제 권고 + 아카이브로그 모드는 파라미터 관점.

**판단 근거(애매 항목)**:
- `インスタンス・リカバリ`·`チェックポイント`: 진단서 §2.1 03_003이 "SHUTDOWN ABORT 후 인스턴스 복구"로 `起動・停止` 범주. 체크포인트는 기동/정지 시 자동 발생하므로 동일 범주.
- `FRA(高速リカバリ領域)`: 파라미터(DB_RECOVERY_FILE_DEST/SIZE)로 설정되므로 `初期化パラメータ` 범주. 진단서 §2.3에서 FRA 출제 권고됨.
- `ARCHIVELOGモード管理`: LOG_ARCHIVE_DEST 등 파라미터 기반이므로 `初期化パラメータ` 범주.
- `マルチテナント+RAC`(1건): PDB의 다중 노드 운용이므로 `PDB管理` 범주. 단 기본 RAC는 원본 키 미대응.
- `RAC基本アーキテクチャ`(1건): 진단서 §2.3 우선순위 B "RAC 문제 추가" 권고 항목이나 원본 5키 어디에도 대응 키 없음(18번 §2 ch03 부챕터 개념). **매핑 제외**.

**보정 drift 결과**:
- Before flagged: 2건 (ADR/ログ -21.61% / 初期化パラメータ +16.31%)
- After flagged: 2건 (ADR/ログ -21.61% / 初期化パラメータ +24.79% — FRA+ARCHIVELOG 포함으로 drift 확대)
- 起動・停止(+11.65%)·PDB管理(-9.11%)·V$(−7.42%)는 임계 해소

**진정한 gap**: 없음. ADR/ログ는 진단서 §2.3 "ch13 분산 권고"에 따라 본래 ch13이 주 출제처가 되도록 의도적 under-coverage 유지.

**매핑 외**: RAC基本アーキテクチャ(1건) — 18번 §2 부챕터이나 원본 미대응.

**topic_stats.json 갱신**: 예 (필드: original_coverage_map 신규 / flagged_topics 재계산 / recheck_note 갱신)

---
