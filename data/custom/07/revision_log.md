# ch07 수정 이력 (Revision Log)

> **목적**: ch07의 P1(재작성)·P2(교체/완화)·P3(앵글수정)·infra(인프라) 수정 이력을 기록한다.
> **참조**: `guide_files/24_문제수정_에이전트_가이드라인.md`, `guide_files/25_출제금지_토픽_목록.md`
> **연관 파일**: `customquestions_json/07/topic_stats.json`

---

## 기록 형식

```
## [YYYY-MM-DD] {phase} — {파일명 또는 "infra"}: {한줄 요약}

- **대상 파일**: customquestions_json/07/{파일명}.json
- **영향 문제**: C_07_{NNN}, ...
- **Phase**: P1 / P2 / P3 / schema_extension / forbidden_topics_update

**Before**: topic + 출제 개념
**After**: topic + 출제 개념
**사유**: {구체 사유}
**비중 영향**: custom_topic_counts 변화 / flagged_topics 업데이트 여부
**topic_stats.json 갱신**: 예/아니오
```

---

## 이력

### [2026-04-17] P2 배치2 — custom_07_002.json: C_07_008 AUTOALLOCATE/UNIFORM (ch06 경계) → HWM 결과 관점 (ch07 고유) 앵글 변경

- **대상 파일**: customquestions_json/07/custom_07_002.json
- **영향 문제**: C_07_008
- **Phase**: P2 (오답 교체 — title·선택지 전면 재작성, 앵글 변경)

**Before**:
- topic: エクステント管理(AUTOALLOCATE/UNIFORM) — ch06 영역 개념
- 출제 개념: AUTOALLOCATE 64KB→1MB→8MB→64MB 단계적 증가 / UNIFORM 기본 8MB / 딕셔너리 관리 표영역 AUTOALLOCATE 사용 가부 / ch06 핵심 개념(표영역·데이터파일) 영역 침범

**After**:
- topic: HWM(最高水位標) — ch07 고유 개념
- 출제 개념: HWM = 세그먼트 내 데이터 기록 이력 최고 위치 경계선 / Full Table Scan = HWM까지 읽음 / SELECT 동적 재계산 오해 / INSERT 시 HWM 필수 상승 오해 / DELETE 하향 오해 / 물리 블록 위치 일치 오해 / 정답 [A] 유지

**사유**: 진단결과 ch07_스토리지.md §3 custom_07_002 지적. C_07_008은 ch06 customquestions로 이동 또는 ch07 관점으로 앵글 재조정 권고. 배치 명령서에서 "HWM·Extent 관리·Segment 유형 중 택1"로 지정 → HWM 결과 관점 선택(ch07 핵심 개념, questions_json 07_003 직결, Low/High HWM 이중 구조 과도 항목 회피). custom_07_002 파일 내 C_07_006(TRUNCATE/DELETE HWM 명령어별)과 상보 관계 형성(C_07_008 = HWM 경계·Full Table Scan 관계).

**비중 영향**:
- custom_topic_counts 변화: "HWM(最高水位標)" +1 (4→5) / "エクステント管理(AUTOALLOCATE/UNIFORM)" -1 (1→0, 항목 삭제)
- drift 상태 변동: drift 임계(15%) 미도달
- forbidden_topics: ch07 빈 배열 유지. ch06 forbidden_topics 3번 침범 우려 해소(AUTOALLOCATE 수치 전면 제거)

**topic_stats.json 갱신**: 예 (custom_topic_counts / topic_drift_alert / last_revision 필드)

---

### [2026-04-17] schema_extension — infra: 비중관리 인프라 구축

- **Phase**: schema_extension

**변경 내용**: `forbidden_topics`(빈 배열) / `topic_drift_alert` / `last_revision` 필드 추가

**사유**: A+B+C+D 비중관리 플랜 인프라 (사용자 결정 2026-04-17)

**topic_stats.json 갱신**: 예 (3개 신규 필드 추가)

---

### [2026-04-17] remap — infra: original_coverage_map 재매핑 표 추가 + drift 보정 계산

- **대상 파일**: customquestions_json/07/topic_stats.json
- **Phase**: schema_extension (비중관리 인프라 확장)

**변경 내용**: `original_coverage_map` 필드 신규 추가 — 원본 5키 모두를 custom 세부 라벨 집합에 매핑. 보정 drift 재계산 적용.

**매핑 결정**:
- `再開可能領域割当て` → 동명 1 라벨(2건). 05_03 §s02.
- `データ圧縮` → データ圧縮 2종·Direct-Path Insert 3종·NOLOGGING 2종 (7 라벨, 11건). 진단서 07_002(Basic Compression/Direct-Path Insert)가 Direct-Path를 압축과 함께 분류.
- `セグメント縮小` → セグメント縮小·HWM·SHRINK 3종·MOVE·Low/High HWM·ASSM/MSSM 2종·行移行 2종·PCTFREE·LOB·DBA_SEGMENTS 2종·AUTOALLOCATE/UNIFORM (15 라벨, 32건). 05_04 §s02~s04 전체 범주.
- `遅延セグメント作成` → 遅延セグメント 2종 (2 라벨, 3건). 05_03 §s03.
- `索引UNUSABLE状態` → 索引UNUSABLE/INVISIBLE·索引REBUILD/COALESCE·索引管理 (3 라벨, 7건). 05_04 인덱스 관리.

**판단 근거(애매 항목)**:
- `Direct-Path Insert`: 진단서 §2.1 07_002가 "Basic Compression / Direct-Path Insert"로 묶어 기준선. Direct-Path는 압축 활성화 전제이므로 `データ圧縮` 범주.
- `NOLOGGING/FORCE LOGGING`·`NOLOGGING/Data Guard運用`: Direct-Path Insert의 로깅 옵션. 동일 범주.
- `HWM·SHRINK·MOVE·ASSM/MSSM·PCTFREE·行移行·LOB·DBA_SEGMENTS`: 전부 세그먼트 축소/관리 범주. 진단서 05_04 §s02~s04 섭렵.
- `AUTOALLOCATE/UNIFORM選択シナリオ`: 진단서 §3에서 ch06 경계였으나 last_revision에 "HWM 결과 관점(ch07 고유) 앵글 변경"으로 세그먼트 범주로 재분류됨. 매핑도 `セグメント縮小` 범주.

**보정 drift 결과**:
- Before flagged: 4건 (再開可能 -16.36% / データ圧縮 -16.36% / 遅延 -18.18% / 索引 -20%)
- After flagged: 2건 (再開可能 -16.36% / セグメント縮小 +38.18%)
- データ圧縮(11건·0%)·遅延セグメント(3건·-14.55%)·索引(7건·-7.27%)는 임계 해소
- セグメント縮小은 15개 세부 라벨 포함 결과 +38.18%로 대규모 과잉. 55문항 중 32건(58.18%)이 이 범주.

**진정한 gap**: 없음 (5키 모두 매핑 존재). 再開可能領域은 2건만 남아 상대적 under-coverage.

**topic_stats.json 갱신**: 예 (필드: original_coverage_map 신규 / flagged_topics 재계산 / recheck_note 갱신)

---
