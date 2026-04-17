# ch11 수정 이력 (Revision Log)

> **목적**: ch11의 P1(재작성)·P2(교체/완화)·P3(앵글수정)·infra(인프라) 수정 이력을 기록한다.
> **참조**: `guide_files/24_문제수정_에이전트_가이드라인.md`, `guide_files/25_출제금지_토픽_목록.md`
> **연관 파일**: `customquestions_json/11/topic_stats.json`

---

## 기록 형식

```
## [YYYY-MM-DD] {phase} — {파일명 또는 "infra"}: {한줄 요약}

- **대상 파일**: customquestions_json/11/{파일명}.json
- **영향 문제**: C_11_{NNN}, ...
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

**변경 내용**: `forbidden_topics`(3항목 — WHEN+SYS_CONTEXT / DBMS_AUDIT_MGMT 퍼지 / EVALUATE PER) / `topic_drift_alert` / `last_revision` 필드 추가

**사유**: A+B+C+D 비중관리 플랜 인프라 (사용자 결정 2026-04-17). 2026-04-17 B안 수정으로 study/04/04_04_감사체계.json에서 삭제된 3항목을 forbidden_topics에 등재.

**비중 영향**: custom_topic_counts 변화 없음. P2 대상(C_11_008 혼합모드 전환 / C_11_014 FGA 파라미터 암기) 처리 시 flagged_topics 업데이트 예정.

**topic_stats.json 갱신**: 예 (3개 신규 필드 추가)

---

### [2026-04-17] P2 batch3 — custom_11_002: C_11_008 혼합→순수 바이너리 재링크 절차(내부 편중) → 순수 통합 감사 모드 특성(전환 결과 관점)

- **대상 파일**: customquestions_json/11/custom_11_002.json
- **영향 문제**: C_11_008
- **Phase**: P2 배치 3 (오답 교체 — title/선택지 전면 변경, 단일정답 C→A로 이동)

**Before**:
- topic: 統合監査モード(혼합 vs 순수 통합 감사)
- 출제 개념: 혼합 모드의 공존 + 순수 전환을 위한 바이너리 재링크(relink) + V$OPTION으로 현재 모드 판별 (정답 C)

**After**:
- topic: 統合監査モード(순수 통합 감사 모드 특성)
- 출제 개념: 순수 통합 감사 모드의 전환 결과 운영 특성 — 모든 감사 레코드 AUDSYS.AUD$UNIFIED 일원화 + 전통 트레일(AUD$/FGA_LOG$/OS 파일) 미사용 (정답 A). 바이너리 재링크(relink) 언급 완전 제거.

**사유**: 진단결과 ch11_감사.md §3 custom_11_002 Q2 수정방향 P2. 배치 3 명령서 지정("혼합→순수 바이너리 감사 재링크 상세(relink) → 전환 결과 관점 (순수 통합 감사 전용 모드 특성)"). 5% 저비중 챕터에서 내부 절차 수준 상향 억제.

**비중 영향**:
- custom_topic_counts 변화: `統合監査モード` 유지(1건) / 세부 초점 "모드 구분·전환 절차" → "순수 통합 감사 전용 특성"
- drift 상태 변동: 없음

**topic_stats.json 갱신**: 예 (last_revision 필드 갱신)

---

### [2026-04-17] P2 batch3 — custom_11_003: C_11_014 audit_column_opts 기본값 암기 → FGA 정책 정의 방법 개념(사실 확인 수준)

- **대상 파일**: customquestions_json/11/custom_11_003.json
- **영향 문제**: C_11_014
- **Phase**: P2 배치 3 (오답 교체 — title/선택지 전면 변경, 단일정답 B→A로 이동)

**Before**:
- topic: FGA列オプション(audit_column_opts 파라미터 세부)
- 출제 개념: audit_column_opts 기본값 ANY_COLUMNS 암기 + ALL_COLUMNS/ANY_COLUMNS 세부 구분 + DELETE 문에서 audit_column 무시 여부 (정답 B)

**After**:
- topic: FGA정책정의방법(DBMS_FGA.ADD_POLICY 기본 사용)
- 출제 개념: FGA 정책 정의 방법 — DBMS_FGA.ADD_POLICY 프로시저 사용 + 주요 파라미터(object_schema/object_name/audit_condition/audit_column/statement_types) 개념 사실 확인 수준 (정답 A). audit_column_opts 기본값 암기형 완전 제거.

**사유**: 진단결과 ch11_감사.md §3 custom_11_003 Q2 수정방향 P2. 배치 3 명령서 지정("FGA audit_column_opts=ANY_COLUMNS 기본값 암기 → 사실 확인 수준 (FGA 정책 정의 방법 개념)"). 파라미터 기본값 암기 수준을 정책 정의 방법 개념 수준으로 하향.

**비중 영향**:
- custom_topic_counts 변화: `FGA列オプション` -1 / `FGAポリシー定義方法` +1 (topic 레이블 치환)
- drift 상태 변동: 없음

**topic_stats.json 갱신**: 예 (last_revision 필드 갱신. custom_topic_counts 라벨 치환은 drift 범위 내로 세부 라벨 조정은 다음 batch 시 정리 예정)

---

### [2026-04-17] topic label 치환 — custom_11_003: `FGA列オプション` → `FGAポリシー定義方法`

- **대상 파일**: customquestions_json/11/topic_stats.json (custom_topic_counts 키)
- **영향 문제**: C_11_014
- **Phase**: topic_label_rename (P2 배치 3 후속 정리)

**Before**:
- topic 키: `FGA列オプション` (count=1)

**After**:
- topic 키: `FGAポリシー定義方法` (count=1, 값 유지)

**사유**: P2 배치 3 C_11_014 수정 시 audit_column_opts 파라미터 기본값 암기형을 완전히 제거하고 DBMS_FGA.ADD_POLICY 프로시저 사용과 주요 파라미터 개념 사실 확인(FGA 정책 정의 방법)으로 재구성했기 때문에, topic 라벨을 실제 내용과 일치시키기 위해 치환. 5% 저비중 챕터에서 파라미터 암기 수준을 정책 정의 방법 개념 수준으로 하향한 결과를 라벨 레벨에서도 반영.

**비중 영향**:
- custom_topic_counts 변화: 키 1:1 치환, 카운트 유지(1). total_custom 변동 없음(32 유지)
- drift 상태 변동: 재계산 대상 (작업 B에서 13챕터 일괄 재검증)

**topic_stats.json 갱신**: 예 (필드: custom_topic_counts 키 치환)

---

### [2026-04-17] remap — infra: original_coverage_map 재매핑 표 추가 + drift 보정 계산

- **대상 파일**: customquestions_json/11/topic_stats.json
- **Phase**: schema_extension (비중관리 인프라 확장)

**변경 내용**: `original_coverage_map` 필드 신규 추가 — 원본 5키 모두를 custom 세부 라벨 집합에 매핑. 보정 drift 재계산 적용.

**매핑 결정**:
- `監査対象` → 監査対象·監査ポリシー適用対象·事前定義監査ポリシー·監査ポリシー作成・有効化手順·監査ポリシー変更·NOAUDIT POLICY動作 (6 라벨, 7건). 04_03 §s02 감사 대상/정책 범주.
- `監査管理ロール` → 監査管理ロール·監査関連ビュー (2 라벨, 2건). 04_03 §s03 관리 역할 범주.
- `強制監査` → 強制監査·強制監査レコード格納場所·AUDSYSスキーマ格納先·統合監査ポリシー·統合監査モード·統合監査と従来型監査比較·監査トレイル管理 2종·監査データフロー·UNIFIED_AUDIT_TRAIL出力解釈 (10 라벨, 10건). 04_03 §s04 강제감사·통합감사 범주(감사 데이터 저장·출력 포함).
- `ファイングレイン監査` → ファイングレイン監査·FGAポリシー定義方法·FGAハンドラ・DML監査·FGA構成シナリオ(ADD_POLICYパラメータ組合せ) (4 라벨, 4건). 04_04 FGA 범주.
- `プロファイル(リソース/パスワード)` → プロファイル・パスワード管理·プロファイル・リソース制限·テーブルスペース・クォータ·権限分析(DBMS_PRIVILEGE_CAPTURE)·権限分析キャプチャ・タイプと制限事項 (5 라벨, 9건). ch05→ch11 이관 주제. 04_05/04_06 프로파일·권한분석 범주.

**판단 근거(애매 항목)**:
- `事前定義監査ポリシー`: 사전 정의 정책은 감사 대상 범주의 하위이므로 `監査対象` 범주(04_03 §s02).
- `監査トレイル管理`·`監査トレイル管理(DBMS_AUDIT_MGMT手順)`·`UNIFIED_AUDIT_TRAIL出力解釈`·`監査データフ로`: 감사 레코드 저장·관리·출력은 강제감사·통합감사 흐름과 직결되므로 `強制監査` 범주(04_03 §s04).
- `統合監査ポリシー`·`統合監査モード`·`統合監査と従来型監査比較`: 순수/혼합 통합감사 모드는 강제감사 전환 결과이므로 `強制監査` 범주.
- `テーブルスペース・クォータ`: 리소스 제한이므로 `프로파일` 범주(쿼터 = 리소스 배분 한도).
- `権限分析(DBMS_PRIVILEGE_CAPTURE)`·`権限分析キャプチャ・タイプと制限事項`: 권한 분석은 원본 05_006 "프로파일(리소스/패스워드)" 영역의 권한 관리 확장 개념이므로 `プロファイル` 범주(note_migrated_from_ch05 확장 해석).

**보정 drift 결과**:
- Before flagged: 5건 (監査対象 / 監査管理ロール / 強制監査 / ファイングレイン監査 / プロファイル — 전 5항목 -16.875%~-20%)
- After flagged: 0건 — 모든 topic 임계(15%) 이내
- 監査対象(7건·+1.88%)·監査管理ロール(2건·-13.75%)·強制監査(10건·+11.25%)·ファイングレイン監査(4건·-7.50%)·プロファイル(9건·+8.12%) 전원 해소
- 32문항 확장이 원본 5키에 고르게 분산되어 균형 수렴

**진정한 gap**: 없음 (5키 모두 매핑 충분)

**구조적 안정**: ch11은 32문항 중 세분화 라벨이 27개로 가장 많으나 재매핑 결과 원본 5키에 고르게 분산. 프로파일 커버리지는 ch05 이관 주제 9건(프로파일 5·권한분석 3·테이블스페이스 쿼터 1)이 완성.

**topic_stats.json 갱신**: 예 (필드: original_coverage_map 신규 / flagged_topics 재계산 / recheck_note 갱신)

---
