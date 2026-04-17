# ch04 수정 이력 (Revision Log)

> **목적**: ch04의 P1(재작성)·P2(교체/완화)·P3(앵글수정)·infra(인프라) 수정 이력을 기록한다.
> **참조**: `guide_files/24_문제수정_에이전트_가이드라인.md`, `guide_files/25_출제금지_토픽_목록.md`
> **연관 파일**: `customquestions_json/04/topic_stats.json`

---

## 기록 형식

```
## [YYYY-MM-DD] {phase} — {파일명 또는 "infra"}: {한줄 요약}

- **대상 파일**: customquestions_json/04/{파일명}.json
- **영향 문제**: C_04_{NNN}, ...
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

**사유**: A+B+C+D 비중관리 플랜 인프라 (사용자 결정 2026-04-17)

**topic_stats.json 갱신**: 예 (3개 신규 필드 추가)

---

### [2026-04-17] remap — infra: original_coverage_map 재매핑 표 추가 + drift 보정 계산

- **대상 파일**: customquestions_json/04/topic_stats.json
- **Phase**: schema_extension (비중관리 인프라 확장)

**변경 내용**: `original_coverage_map` 필드 신규 추가 — 원본 5키 모두를 custom 세부 라벨 집합에 매핑. 보정 drift 재계산 적용.

**매핑 결정**:
- `tnsping診断` → tnsping診断·接続障害診断(ORAエラー) (2 라벨, 3건). 진단·장애 범주.
- `ネットワーク構成ツール` → ネットワーク構成ツール·리스너 제어·lsnrctl 출력 2종·listener.ora·TNS_ADMIN (6 라벨, 6건). 03_02 관리 도구 범주.
- `マルチテナント環境のリスナー` → マルチテナント・リスナー·動的/静的サービス登録·SERVICE_NAMES·共有サーバー·DRCP·リスナー・セキュリティ·接続処理方式·接続処理のフロー (8 라벨, 8건). 03_03 s01~s03 리스너 운영 범주.
- `簡易接続ネーミング` → 簡易接続·tnsnames.ora·ネーミング・メソッド比較·接続ディスクリプタ·Easy Connect Plus (5 라벨, 6건). 03_03 네이밍 메서드 범주.
- `データベース・リンク` → DB링크·接続方式·作成構文·GLOBAL_NAMES 2종·マルチテナントDBリンク (6 라벨, 7건). 03_04 DB 링크 범주.

**판단 근거(애매 항목)**:
- `DRCP(接続プーリング)`·`共有サーバー構成`: 리스너가 서비스 제공하는 연결 모드이므로 `マルチテナント環境のリスナー` 범주. 진단서 §3.3에서 custom_04_005/006의 리스너 운영 문제군으로 분류.
- `接続処理方式(Redirect/Hand-off)`: 진단서 §2.2에서 "리스너가 핸드오프 후 관여하지 않는다"는 결과 수준 인지가 리스너 범주 귀속.
- `GLOBAL_NAMES`: DB 링크의 검증 이름이므로 `データベース・リンク` 범주.
- `TNS_ADMIN環境変数`: tnsnames.ora 탐색에 사용되므로 ネーミング 범주로도 가능하나, 진단서 §2.1 03_02에 "리스너 구성" 맥락으로 기술되어 `ネットワーク構成ツール` 범주.
- `接続障害診断(ORAエラー)`: tnsping로 진단하는 장애 상황이므로 `tnsping診断` 범주.

**보정 drift 결과**:
- Before flagged: 3건 (ネットワーク構成 -16.67% / マルチテナントリスナー -16.67% / 簡易接続 -16.67%)
- After flagged: 0건 — 모든 topic 임계 이내
- 5키 모두 대략 6~8건 수준으로 고르게 분포되어 원본 1:1:1:1:1 비율에 가장 근사하게 수렴

**진정한 gap**: 없음 (5키 모두 매핑 충분)

**구조적 안정**: 30문항 확장이 원본 5키에 고르게 분산된 이상적 상태. 13챕터 중 매핑 효과가 가장 완전한 케이스.

**topic_stats.json 갱신**: 예 (필드: original_coverage_map 신규 / flagged_topics 재계산 / recheck_note 갱신)

---
