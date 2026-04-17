# ch09 수정 이력 (Revision Log)

> **목적**: ch09의 P1(재작성)·P2(교체/완화)·P3(앵글수정)·infra(인프라) 수정 이력을 기록한다.
> **참조**: `guide_files/24_문제수정_에이전트_가이드라인.md`, `guide_files/25_출제금지_토픽_목록.md`
> **연관 파일**: `customquestions_json/09/topic_stats.json`

---

## 기록 형식

```
## [YYYY-MM-DD] {phase} — {파일명 또는 "infra"}: {한줄 요약}

- **대상 파일**: customquestions_json/09/{파일명}.json
- **영향 문제**: C_09_{NNN}, ...
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

**변경 내용**: `forbidden_topics`(4항목 — MCP/Worker / FLASHBACK 시점일관성 / COMPRESSION 세부 / ENCRYPTION 세부) / `topic_drift_alert` / `last_revision` 필드 추가

**사유**: A+B+C+D 비중관리 플랜 인프라 (사용자 결정 2026-04-17). 2026-04-17 B안 수정으로 study/07/07_03_DataPump.json에서 삭제된 4항목을 forbidden_topics에 등재.

**비중 영향**: custom_topic_counts 변화 없음. P1 대상(custom_09_007 C_09_031 FLASHBACK_SCN/TIME) / P2 대상(custom_09_005 C_09_025 NETWORK_LINK+FLASHBACK) 처리 시 flagged_topics 업데이트 예정.

**topic_stats.json 갱신**: 예 (3개 신규 필드 추가)

---

### [2026-04-17] P1 — custom_09_007: FLASHBACK_SCN/TIME 시점 일관성 복수정답 축 제거, CONTENT/EXCLUDE 중심으로 앵글 전환

- **대상 파일**: customquestions_json/09/custom_09_007.json
- **영향 문제**: C_09_031
- **Phase**: P1 (재작성 — 배치 1 / 파일 4)

**Before**:
- topic: Data Pump(FLASHBACK_SCN vs FLASHBACK_TIME)
- 출제 개념: FLASHBACK_SCN(숫자 지정)과 FLASHBACK_TIME(타임스탬프 지정)의 Undo 기반 시점 일관성 구분 + 미지정 시 테이블 간 일관성 미보장 메커니즘 이해

**After**:
- topic: Data Pump(CONTENT/EXCLUDE 파라미터)
- 출제 개념: CONTENT 3값(ALL/DATA_ONLY/METADATA_ONLY) + EXCLUDE의 오브젝트 타입 필터 용도 + DUMPFILE·LOGFILE의 DIRECTORY 오브젝트 경유 규칙 (FLASHBACK은 오답 근거의 '동시 지정 불가' 사실로만 언급)

**사유**: `forbidden_topics` #11 (FLASHBACK_SCN/FLASHBACK_TIME 시점 일관성 내부 메커니즘) 핵심 주제 침범 해소. 진단결과 §4 P1.

**비중 영향**:
- custom_topic_counts 변화: `Data Pump(FLASHBACK_SCN vs FLASHBACK_TIME)` -1 / `Data Pump(CONTENT/EXCLUDE 파라미터)` +1 (topic 레이블 치환)
- drift 상태 변동: 없음 (동일 상위 주제 범위 내 치환)

**topic_stats.json 갱신**: 예 (필드: custom_topic_counts · last_revision · last_checked)

---

### [2026-04-17] P2 batch3 — custom_09_005: C_09_025 NETWORK_LINK+FLASHBACK_TIME 복수 조합 → NETWORK_LINK 단독(DIRECTORY 필수) 간소화

- **대상 파일**: customquestions_json/09/custom_09_005.json
- **영향 문제**: C_09_025
- **Phase**: P2 배치 3 (오답 교체 — title/선택지 C·D·E 전면 변경, 복수정답 A,C 유지)

**Before**:
- topic: Data Pump(NETWORK_LINK/FLASHBACK_TIME 복수 조합)
- 출제 개념: NETWORK_LINK 기본 의미(정답 A) + FLASHBACK_TIME의 Undo 정보 활용 + UNDO_RETENTION 기간 내 시점 일관성 메커니즘(정답 C)

**After**:
- topic: Data Pump(NETWORK_LINK 파라미터)
- 출제 개념: NETWORK_LINK 기본 의미(DB Link 경유 직접 Import, 정답 A) + 로그 파일용 DIRECTORY 필수(운영 전제, 정답 C). FLASHBACK_TIME 언급 완전 제거.

**사유**: `forbidden_topics` #11 (FLASHBACK_SCN/FLASHBACK_TIME 시점 일관성 내부 메커니즘) 경계 침범 해소. 진단결과 ch09_데이터이동.md §3 custom_09_005 Q3 수정방향. 배치 3 명령서("NETWORK_LINK+FLASHBACK_TIME 복수 조합 상세 → 간소화 (기본 의미+Undo 기간 제약 1개만 유지)") 적용 시, 진단서의 대안 옵션("NETWORK_LINK의 부가 특성으로 교체") 채택 — P1(C_09_031 FLASHBACK 축 제거)과 일관된 정책으로 FLASHBACK 계열 완전 제거 방침 유지.

**비중 영향**:
- custom_topic_counts 변화: `Data Pump（NETWORK_LINK/FLASHBACK_TIME）` -1 / `Data Pump（NETWORK_LINK 運用要件）` +1 (topic 레이블 치환)
- drift 상태 변동: 없음

**topic_stats.json 갱신**: 예 (last_revision 필드 갱신. custom_topic_counts 라벨 치환은 drift 범위 내로 세부 라벨 조정은 다음 batch 시 정리 예정)

---

### [2026-04-17] topic label 치환 — custom_09_005: `Data Pump（NETWORK_LINK/FLASHBACK_TIME）` → `Data Pump（NETWORK_LINK 運用要件）`

- **대상 파일**: customquestions_json/09/topic_stats.json (custom_topic_counts 키)
- **영향 문제**: C_09_025
- **Phase**: topic_label_rename (P2 배치 3 후속 정리)

**Before**:
- topic 키: `Data Pump（NETWORK_LINK/FLASHBACK_TIME）` (count=1)

**After**:
- topic 키: `Data Pump（NETWORK_LINK 運用要件）` (count=1, 값 유지)

**사유**: P2 배치 3 C_09_025 수정 시 FLASHBACK_TIME 축을 완전 제거하고 NETWORK_LINK 운용 요건(DIRECTORY 필수)에 집중하도록 재구성했기 때문에, topic 라벨을 실제 내용과 일치시키기 위해 치환. P1(C_09_031) 재작성과 일관된 FLASHBACK 계열 완전 제거 방침을 라벨 레벨에서도 반영.

**비중 영향**:
- custom_topic_counts 변화: 키 1:1 치환, 카운트 유지(1). total_custom 변동 없음(31 유지)
- drift 상태 변동: 재계산 대상 (작업 B에서 13챕터 일괄 재검증)

**topic_stats.json 갱신**: 예 (필드: custom_topic_counts 키 치환)

---

### [2026-04-17] remap — infra: original_coverage_map 재매핑 표 추가 + drift 보정 계산

- **대상 파일**: customquestions_json/09/topic_stats.json
- **Phase**: schema_extension (비중관리 인프라 확장)

**변경 내용**: `original_coverage_map` 필드 신규 추가 — 원본 4키 모두를 custom 세부 라벨 집합에 매핑. 보정 drift 재계산 적용.

**매핑 결정**:
- `外部表` → `外部表アクセス・ドライバ` / `外部表（ORACLE_DATAPUMPアンロード）` / `外部表（ディレクトリ・オブジェクトとドライバ特性）` (3건). 외부테이블의 드라이버·아키텍처·Directory Object 연계는 진단서 §2.1 07_01이 커버하는 외부테이블 개요 범위 내.
- `Data Pump Importパラメータ` → `Data Pump Import（REMAP機能）` / `Data Pump Import（TABLE_EXISTS_ACTION詳細）` (4건). REMAP/TABLE_EXISTS_ACTION은 07_03 s06/s07 Import 파라미터 세부.
- `Data Pump対話型モード` → `Data Pump（対話型モード命令）` (1건). 직접 대응.
- `SQL*Loaderモード` → `SQL*Loader（Conventional vs Direct Path）` / `SQL*Loader（ロード方式とインデックス）` / `SQL*Loader（Express Mode）` / `SQL*Loader（Express Modeエラー制御）` / `SQL*Loader（Express Mode詳細）` (5건). Conventional/Direct·Express는 07_02 "4가지 로드모드"·"Express Mode" 범위. 단 `SQL*Loader制御ファイル構成`는 "모드"가 아닌 제어파일 구조 영역이므로 제외.

**보정 drift 결과**:
- Before flagged: 4건 (외부表·Importパラメータ·対話型モード·SQL*Loaderモード 모두 custom_pct=0%)
- After flagged: 2건 (외부表 -15.32% / 対話型モード -21.77%) — Importパラメータ(-12.10%)·SQL*Loaderモード(-8.87%)은 임계 해소

**진정한 gap**: 없음 (4키 모두 매핑 존재, 2건은 상대적 under-coverage만)

**topic_stats.json 갱신**: 예 (필드: original_coverage_map 신규 / flagged_topics 재계산 / recheck_note 갱신)

---
