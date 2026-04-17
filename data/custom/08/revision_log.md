# ch08 수정 이력 (Revision Log)

> **목적**: ch08의 P1(재작성)·P2(교체/완화)·P3(앵글수정)·infra(인프라) 수정 이력을 기록한다.
> **참조**: `guide_files/24_문제수정_에이전트_가이드라인.md`, `guide_files/25_출제금지_토픽_목록.md`
> **연관 파일**: `customquestions_json/08/topic_stats.json`

---

## 기록 형식

```
## [YYYY-MM-DD] {phase} — {파일명 또는 "infra"}: {한줄 요약}

- **대상 파일**: customquestions_json/08/{파일명}.json
- **영향 문제**: C_08_{NNN}, ...
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

### [2026-04-17] P2 batch3 — custom_08_002: C_08_006 GUARANTEE 트레이드오프(내부 편중) → 운영 결과 관점(ORA-01555 억제 효과 + ALTER TABLESPACE 설정)

- **대상 파일**: customquestions_json/08/custom_08_002.json
- **영향 문제**: C_08_006
- **Phase**: P2 배치 3 (오답 교체 — title/선택지 전면 변경, 복수정답 A,B 유지)

**Before**:
- topic: UNDOデータの状態管理(UNDO_RETENTION + RETENTION GUARANTEE 트레이드오프 심층)
- 출제 개념: UNDO_RETENTION 900초 기본값 + RETENTION GUARANTEE 설정 + ORA-01555 억제/ORA-30036 위험 트레이드오프 심층 판단

**After**:
- topic: UNDOデータの状態管理(RETENTION GUARANTEE 운영 결과)
- 출제 개념: RETENTION GUARANTEE의 ORA-01555 억제 효과(운영 결과) + ALTER TABLESPACE 전용 설정 위치(명령어 구분). Temp 세그먼트 연관성은 오답으로 이용. 트레이드오프 상세 서술은 해설 핵심 개념에만 유지.

**사유**: 진단결과 ch08_UNDO.md §3 custom_08_002 Q2 수정방향 P2. 배치 3 명령서 지정("GUARANTEE/NOGUARANTEE 정책 판단(내부 동작 편중) → 운영 결과 관점 (ORA-01555 방지 여부 / Temp Segment 영향)"). ch08 내부 동작 편중(31문제 중 9건 = 29%) 개선.

**비중 영향**:
- custom_topic_counts 변화: `RETENTION GUARANTEE/NOGUARANTEE` 유지(2건) / `UNDO_RETENTIONパラメータ` -1 / `RETENTION GUARANTEE 운영効果` +1 (실질 1건 내부 재배치)
- drift 상태 변동: 없음 (동일 상위 주제 범위 내 치환)

**topic_stats.json 갱신**: 예 (last_revision 필드 갱신)

---

### [2026-04-17] P2 batch3 — custom_08_003: C_08_013 Temporary UNDO 제한 상세(내부 편중) → 적용 대상·설정 범위 운영 개념

- **대상 파일**: customquestions_json/08/custom_08_003.json
- **영향 문제**: C_08_013
- **Phase**: P2 배치 3 (오답 교체 — title/선택지 전면 변경, 단일정답 B→A로 이동)

**Before**:
- topic: 一時UNDO(제한 사항 및 주의점)
- 출제 개념: Temp 테이블스페이스 내 Temporary Undo Segment 저장 + 혼합 트랜잭션 동작 + Data Guard 비전파 + V$TEMPUNDOSTAT 뷰 구분 심층 판단

**After**:
- topic: 一時UNDO(적용 대상 및 설정 범위)
- 출제 개념: Temporary UNDO 대상 범위(GTT/PTT/임시 LOB 전용, 영구 테이블 DML 미적용) + CDB/PDB/세션 레벨 설정 가능성 운영 사실. 제한사항 세부는 해설 핵심 개념에만 유지.

**사유**: 진단결과 ch08_UNDO.md §3 custom_08_003 Q2 수정방향 P2. 배치 3 명령서 지정("Temporary UNDO 제한 상세 → 운영 결과 수준 (CDB/PDB 레벨 설정 가능 여부, 글로벌 Temp Table 대상 범위)"). ch08 내부 동작 편중 개선(custom_08_002 C_08_006과 동시 하향).

**비중 영향**:
- custom_topic_counts 변화: `一時UNDO` 유지(3건) / 세부 초점 "제한 사항" → "적용 대상·설정 범위"
- drift 상태 변동: 없음

**topic_stats.json 갱신**: 예 (last_revision 필드 갱신)

---

### [2026-04-17] remap — infra: original_coverage_map 재매핑 표 추가 + drift 보정 계산

- **대상 파일**: customquestions_json/08/topic_stats.json
- **Phase**: schema_extension (비중관리 인프라 확장)

**변경 내용**: `original_coverage_map` 필드 신규 추가 — 원본 4키 모두를 custom 세부 라벨 집합에 매핑. 보정 drift 재계산 적용.

**매핑 결정**:
- `UNDOデータの状態管理` → 상태관리·UNDO_RETENTION·GUARANTEE/NOGUARANTEE·ORA-01555 2종·V$UNDOSTAT 용량 산정 (6 라벨, 15건). 진단서 07_001 §s03 상태관리 + 07_002 Retention/GUARANTEE + 07_003 ORA-01555 범주.
- `UNDOデータの基礎` → 기초·UNDO 표영역 작성·롤백 내부 처리·Flashback Query·인스턴스 리커버리 (5 라벨, 9건). 진단서 07_001 §s01~s02 기본 기능·UNDO 세그먼트 구조.
- `一時UNDO` → 동명 1 라벨(3건). 진단서 07_004 Temporary UNDO 범주. Oracle 12c+ GTT/PTT 제한 특성.
- `マルチテナントUNDO管理` → 동명 1 라벨(4건). 진단서 07_005 멀티테넌트 UNDO 범주.

**판단 근거(애매 항목)**:
- `UNDO_RETENTIONパラメータ`·`RETENTION GUARANTEE/NOGUARANTEE`: 상태 관리(Unexpired/Expired 보존 정책)를 설정하는 파라미터이므로 `UNDOデータの状態管理` 범주. 진단서 07_001 §s03 "상태 관리" 맥락에 포함.
- `ORA-01555`·`ORA-01555 vs ORA-30036`: ORA-01555은 상태 관리(보존 부족) 결과 발생하는 장애이므로 `状態管理` 범주. ORA-30036은 UNDO 표영역 공간 부족 장애로 일부 `基礎` 범주 해석 가능하나 ORA-01555와 비교 맥락에서 상태관리 범주로 통합.
- `V$UNDOSTAT UNDO容量算定`: 용량 산정은 상태 관리(과거/현재 UNDO 사용량 분석)를 위한 도구이므로 `状態管理` 범주.
- `UNDO表領域の作成と切替`: 표영역 관리는 인프라(기초) 레벨이므로 `基礎` 범주. 진단서 07_001 §s01~s02.
- `ロールバック内部処理`·`Flashback QueryとUNDO`·`インスタンス・リカバリとUNDO`: UNDO의 기본 역할(롤백·읽기 일관성·인스턴스 복구) 3대 용도이므로 `基礎` 범주.

**보정 drift 결과**:
- Before flagged: 1건 (一時UNDO -15.32%)
- After flagged: 2건 (UNDOデータの状態管理 +23.39% / 一時UNDO -15.32%)
- 기초(9건·+4.03%)·멀티테넌트(4건·-12.10%)는 임계 해소
- 상태관리 범주는 UNDO_RETENTION/GUARANTEE/ORA-01555/V$UNDOSTAT 등 운영 중심 6개 라벨로 집중되어 31문항 중 15건(48.39%)이 이 범주 → 대규모 과잉 투자
- 一時UNDO는 Oracle 12c+ 기능 제한 특성으로 1개 라벨만 유지(GTT/PTT 대상 제한적 범위)

**진정한 gap**: 없음 (4키 모두 매핑 충분). 一時UNDO under-coverage는 라벨 세분화 부족이 아닌 주제의 기능 범위 자체가 제한적이기 때문.

**구조적 특이점**: ch08은 원본 4키 25:25:25:25 균등 분포 대비 custom 48:29:10:13로 상태 관리 편중. 실제 시험 출제에서도 UNDO_RETENTION/ORA-01555이 주 출제처임을 감안하면 drift는 수용 가능하나 임계 초과 상태.

**topic_stats.json 갱신**: 예 (필드: original_coverage_map 신규 / flagged_topics 재계산 / recheck_note 갱신)

---
