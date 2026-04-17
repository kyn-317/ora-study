# ch06 수정 이력 (Revision Log)

> **목적**: ch06의 P1(재작성)·P2(교체/완화)·P3(앵글수정)·infra(인프라) 수정 이력을 기록한다.
> **참조**: `guide_files/24_문제수정_에이전트_가이드라인.md`, `guide_files/25_출제금지_토픽_목록.md`
> **연관 파일**: `customquestions_json/06/topic_stats.json`

---

## 기록 형식

```
## [YYYY-MM-DD] {phase} — {파일명 또는 "infra"}: {한줄 요약}

- **대상 파일**: customquestions_json/06/{파일명}.json
- **영향 문제**: C_06_{NNN}, ...
- **Phase**: P1 / P2 / P3 / schema_extension / forbidden_topics_update

**Before**: topic + 출제 개념
**After**: topic + 출제 개념
**사유**: {구체 사유}
**비중 영향**: custom_topic_counts 변화 / flagged_topics 업데이트 여부
**topic_stats.json 갱신**: 예/아니오
```

---

## 이력

### [2026-04-17] P2 배치2 — custom_06_005.json: C_06_024 Extent 할당 공식 → Oracle 자동 결정 원칙 중심

- **대상 파일**: customquestions_json/06/custom_06_005.json
- **영향 문제**: C_06_024
- **Phase**: P2 (오답 교체 — title·A선택지 재편성)

**Before**:
- topic: ローカル管理表領域 — 内部動作(AUTOALLOCATE 수치 단계) 앵글
- 출제 개념: AUTOALLOCATE 64KB→1MB→8MB→64MB 단계적 자동 증가 수치 / title에 "内部動作" 명시 / forbidden_topics 3번("Extent 할당 공식: 64K/1M/8M/64M 임계") 침범

**After**:
- topic: ローカル管理表領域におけるエクステント(Extent)管理 — 결과 중심
- 출제 개념: AUTOALLOCATE = Oracle이 세그먼트 성장에 따라 자동 결정(DBA 지정 불필요) / UNIFORM = 고정 크기 / UNIFORM 자동 증가 오해 오답 신설 / 정답 [A] 유지

**사유**: 진단결과 ch06_테이블스페이스.md §3 custom_06_005-C_06_024 지적. forbidden_topics 3번(Extent 할당 공식 수치) 침범 해소. Oracle 자동 결정 원칙(결과)만 서술하고 수치 단계(64K/1M/8M/64M) 전면 제거. UNIFORM 자동 증가 혼동 오답 신설로 교육 가치 보완.

**비중 영향**:
- custom_topic_counts 변화: 변화 없음 (topic 레이블 유지)
- drift 상태 변동: 없음
- forbidden_topics 3번 침범 해소 (flagged_topics 등재 불필요)

**topic_stats.json 갱신**: 예 (last_revision 필드)

---

### [2026-04-17] P2 배치2 — custom_06_003.json: C_06_011 ROWID 10비트 재할당 → 32TB 결과 중심

- **대상 파일**: customquestions_json/06/custom_06_003.json
- **영향 문제**: C_06_011
- **Phase**: P2 (오답 교체 — A선택지 재편성)

**Before**:
- topic: BIGFILE表領域の作成とAUTOEXTEND — ROWID 비트 인코딩 앵글
- 출제 개념: A선택지 "ROWID 10비트 파일 번호 → 블록 번호 재할당으로 4B 블록 수용" / 해설에 10비트/32비트/42억 블록 언급 / forbidden_topics 2번("ROWID 비트 인코딩(10비트 등)") 침범

**After**:
- topic: BIGFILE表領域の作成とAUTOEXTEND — 결과 중심(32TB 용량)
- 출제 개념: A선택지 "단일 데이터 파일로 대용량 관리 / 8KB 블록 기준 1데이터파일 최대 약 32TB" / 해설에서 비트 메커니즘 제거·32TB 결과와 SMALLFILE 비교 중심 / 정답 [A, B] 유지

**사유**: 진단결과 ch06_테이블스페이스.md §3 custom_06_003-C_06_011 지적. forbidden_topics 2번(ROWID 비트 인코딩) 침범 해소. Silver 상한은 "BIGFILE = 단일 데이터파일로 대용량 관리"의 결과 수준이며, ROWID 내부 비트 재할당 메커니즘은 범위 밖. 실제 시험 자주 출제 수치(32TB)로 결과 중심 서술.

**비중 영향**:
- custom_topic_counts 변화: 변화 없음 (topic 레이블 유지)
- drift 상태 변동: 없음
- forbidden_topics 2번 침범 해소 (flagged_topics 등재 불필요)

**topic_stats.json 갱신**: 예 (last_revision 필드)

---

### [2026-04-17] schema_extension — infra: 비중관리 인프라 구축

- **Phase**: schema_extension

**변경 내용**: `forbidden_topics`(3항목 — Shadow Copy / ROWID 비트 / Extent 공식) / `topic_drift_alert` / `last_revision` 필드 추가

**사유**: A+B+C+D 비중관리 플랜 인프라 (사용자 결정 2026-04-17). 2026-04-17 B안 수정으로 study/05/05_02에서 삭제된 3항목을 forbidden_topics에 등재.

**비중 영향**: custom_topic_counts 변화 없음. P2 대상(C_06_011 A / C_06_024 A) 처리 시 flagged_topics 업데이트 예정.

**topic_stats.json 갱신**: 예 (3개 신규 필드 추가)

---

### [2026-04-17] remap — infra: original_coverage_map 재매핑 표 추가 + drift 보정 계산

- **대상 파일**: customquestions_json/06/topic_stats.json
- **Phase**: schema_extension (비중관리 인프라 확장)

**변경 내용**: `original_coverage_map` 필드 신규 추가 — 원본 4키를 custom 세부 라벨 집합에 매핑. 보정 drift 재계산 적용.

**매핑 결정**:
- `表領域の種類と特徴` → 表領域의 種類·一時表領域 2종·総合比較·非標準ブロックサイズとトランスポータブル·BIGFILE·READ ONLY 2종·状態 3종·削除 3종·CREATE TABLESPACE·デフォルト一時表領域 (17 라벨, 27건). 05_01 테이블스페이스 구조 범주.
- `ブロック・サイズとメモリー管理` → 동명 1 라벨(2건). 단독 매칭.
- `データ・ファイルの操作と管理` → データ・ファイル의 操作·自動拡張·RESIZE·関係·OMF·満杯エラー·DBA_DATA_FILES·オンライン 이동·DBA_TEMP_FILES·障害·オフライン 이동·OMF+BIGFILE·V$DATAFILE (13 라벨, 18건). 05_02 s01~s03 데이터 파일 관리 범주.
- `データ・ブロックと行データ` → データ・ブロック·ROWID構造·エクステント管理·Resumable·EXTENT MANAGEMENT·ASSM内部 (6 라벨, 7건). 05_02 s04~s07 블록·ROWID 범주.

**판단 근거(애매 항목)**:
- `非標準ブロックサイズとトランスポータブル`: "種類と特徴"(비표준 블록은 테이블스페이스 종류의 특성)와 "ブロック・サイズ"(블록 사이즈 주제) 사이 경계. 진단서 §2.1에서 05_01 s02 "표준/비표준 블록 사이즈"가 "BIGFILE/SMALLFILE" 다음에 배치된 테이블스페이스 특성 항목이므로 `表領域の種類と特徴` 범주.
- `READ ONLY表領域의 運用`·`状態`·`削除`·`CREATE TABLESPACE`·`オフライン·モード比較`: 모두 05_01 생성/운용 구문 범주이므로 `表領域の種類と特徴` 범주.
- `一時表領域의 管理`·`一時表領域グループ`·`デフォルト一時表領域`: 일시 테이블스페이스 특성이므로 `表領域의 種類와 特徴` 범주.
- `ASSM内部動作`·`EXTENT MANAGEMENT LOCAL`·`エクステント管理`: 05_02 s04~05 블록·에크스텐트 내부 메커니즘이므로 `データ・ブロックと行데이터` 범주.

**보정 drift 결과**:
- Before flagged: 4건 (種類 -32.73% / ブロック・サイズ -16.36% / ファイル操作 -16.36% / ブロック行 -18.18%)
- After flagged: 1건 (ブロック・サイズとメモリー管理 -16.36%만 잔존)
- 表領域種類(27건·+9.09%)·データ・ファイル의 操作(18건·+12.73%)·データ・ブロック(7건·-7.27%)는 임계 해소

**진정한 gap**: 없음 (4키 모두 매핑 존재). ブロック・サイズとメモリー管理은 2건으로 상대적 under-coverage 유지.

**topic_stats.json 갱신**: 예 (필드: original_coverage_map 신규 / flagged_topics 재계산 / recheck_note 갱신)

---
