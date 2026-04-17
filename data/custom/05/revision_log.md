# ch05 수정 이력 (Revision Log)

> **목적**: ch05의 P1(재작성)·P2(교체/완화)·P3(앵글수정)·infra(인프라) 수정 이력을 기록한다.
> **참조**: `guide_files/24_문제수정_에이전트_가이드라인.md`, `guide_files/25_출제금지_토픽_목록.md`
> **연관 파일**: `customquestions_json/05/topic_stats.json`

---

## 기록 형식

```
## [YYYY-MM-DD] {phase} — {파일명 또는 "infra"}: {한줄 요약}

- **대상 파일**: customquestions_json/05/{파일명}.json
- **영향 문제**: C_05_{NNN}, ...
- **Phase**: P1 / P2 / P3 / schema_extension / forbidden_topics_update

**Before**: topic + 출제 개념
**After**: topic + 출제 개념
**사유**: {구체 사유}
**비중 영향**: custom_topic_counts 변화 / flagged_topics 업데이트 여부
**topic_stats.json 갱신**: 예/아니오
```

---

## 이력

### [2026-04-17] P2 배치2 — custom_05_010.json: C_05_046 내부 딕셔너리 관리 → REVOKE 연쇄 취소 결과 중심 재구성

- **대상 파일**: customquestions_json/05/custom_05_010.json
- **영향 문제**: C_05_046
- **Phase**: P2 (오답 교체 — title·정답 구조 재편성)

**Before**:
- topic: WITH ADMIN OPTIONとWITH GRANT OPTION — 내부 딕셔너리 관리 앵글
- 출제 개념: SYSAUTH$ / OBJAUTH$ 딕셔너리 내부 저장 방식 차이 / 내부 테이블명 직접 노출 / 정답 [A, C]

**After**:
- topic: WITH ADMIN OPTIONとWITH GRANT OPTION — REVOKE 연쇄 결과 관점
- 출제 개념: REVOKE 시스템 권한(ADMIN OPTION) = 비연쇄 / REVOKE 객체 권한(GRANT OPTION) = 자동 연쇄 / CASCADE CONSTRAINTS는 객체 권한 REVOKE에 불필요(자동) / CASCADE 키워드 필수 여부 / 정답 [A, B]

**사유**: 진단결과 ch05_사용자권한.md §3 custom_05_010 지적. SYSAUTH$·OBJAUTH$ 내부 딕셔너리 테이블명 노출은 Silver 상한 범위 밖(10번 §3.1·§5 과도 항목 해당). 결과 중심 앵글(비연쇄 vs 자동 연쇄 / CASCADE 문법 오해)로 재편성하여 questions_json 05_008 수준 정합성 확보. 오답으로는 자주 혼동되는 CASCADE CONSTRAINTS(제약조건용 키워드) 오용 시나리오 배치.

**비중 영향**:
- custom_topic_counts 변화: 변화 없음 (topic 레이블 유지, 앵글만 결과 중심으로 전환)
- drift 상태 변동: 없음

**topic_stats.json 갱신**: 예 (last_revision 필드)

---

### [2026-04-17] P2 배치2 — custom_05_008.json: C_05_038·C_05_040 Definer's Rights·GRANT/REVOKE 결과 중심 완화

- **대상 파일**: customquestions_json/05/custom_05_008.json
- **영향 문제**: C_05_038, C_05_040
- **Phase**: P2 (오답 교체·완화)

**Before (C_05_038)**:
- topic: Definer's Rights와 Invoker's Rights — 컴파일 단계 진단 앵글
- 출제 개념: Definer's Rights 환경에서 ROLE 기반 권한 사용 시 컴파일 WARNING/INVALID 상태 / 컴파일 단계별 상세 동작

**After (C_05_038)**:
- topic: Definer's Rights와 Invoker's Rights — 사실 확인 수준
- 출제 개념: Definer's Rights는 ROLE 권한 무시 / Invoker's Rights는 호출자 권한 환경 사용 / DEFAULT/AUTHID 미지정 시 Definer's / 컴파일 단계 상세 대신 "정상 작성되지 않음" 결과 수준 서술 / 정답 [B, D] 유지

**사유**: 진단결과 ch05_사용자권한.md §3 custom_05_008-C_05_038 지적. Silver 상한은 "ROLE 권한이 Definer's Rights에서 무시된다"의 사실 수준이며, 컴파일 시점 상태(WARNING/INVALID)·단계별 전개는 Oracle PL/SQL 심화 영역. 정답 유지하며 해설·선택지 문구만 결과 수준으로 완화.

**Before (C_05_040)**:
- topic: ADMIN OPTIONとGRANT OPTIONの取消し差異 — 내부 구조 앵글
- 출제 개념: SYSAUTH$/OBJAUTH$ 미기록 조건·GRANTOR# 컬럼 기반 연쇄 추적 / 정답 [B, E] (E가 SYSAUTH$ 미기록 서술)

**After (C_05_040)**:
- topic: ADMIN OPTIONとGRANT OPTIONの取消し差異 — 결과 중심
- 출제 개념: ADMIN OPTION REVOKE = 비연쇄 (시스템 권한 / A) / GRANT OPTION REVOKE = 자동 연쇄 (객체 권한 / B) / 정답 [A, B]로 재편성

**사유**: 진단결과 ch05_사용자권한.md §3 custom_05_008-C_05_040 지적. SYSAUTH$·OBJAUTH$·GRANTOR# 내부 딕셔너리 노출 제거. 원본 정답 E가 내부 테이블명 미기록 서술이었으므로, 결과 중심 선택지 A/B로 정답 세트 재편성. 10번 §3.1·§5 과도 항목(권한 연쇄 알고리즘 내부 메커니즘) 해소.

**비중 영향**:
- custom_topic_counts 변화: 변화 없음 (topic 레이블 유지, 앵글만 결과 중심으로 전환)
- drift 상태 변동: 없음

**topic_stats.json 갱신**: 예 (last_revision 필드)

---

### [2026-04-17] P2 — custom_05_004.json: C_05_020 OBJAUTH$ 재귀 알고리즘 → 결과 중심 연쇄 취소 재구성

- **대상 파일**: customquestions_json/05/custom_05_004.json
- **영향 문제**: C_05_020
- **Phase**: P2

**Before**:
- topic: 시스템/객체 권한(ADMIN/GRANT OPTION) — 내부 동작 앵글
- 출제 개념: OBJAUTH$ 딕셔너리 테이블 GRANTOR# 컬럼 기반 재귀 추적 알고리즘 / SYSAUTH$와의 내부 구조 차이 / title에 "内部動作" 명시

**After**:
- topic: 시스템/객체 권한(ADMIN/GRANT OPTION) — 결과 중심 앵글
- 출제 개념: 상위 부여자 REVOKE 시 부여 체인 전체 자동 연쇄 취소 / 연쇄 취소 시 뷰 INVALID / 데이터 유지 / 시스템 권한(ADMIN OPTION) 비연쇄와의 대조 (결과 관점)

**사유**: 진단결과 ch05_사용자권한.md §3 custom_05_004 지적. 10번 §3.1·§5 과도 항목(권한 연쇄 알고리즘 내부 메커니즘) 해당. 실버 상한은 "결과(연쇄/비연쇄)" 판단 수준(questions_json 05_008)이며, OBJAUTH$·SYSAUTH$·GRANTOR# 등 내부 딕셔너리 테이블명·컬럼명·재귀적 추적 알고리즘은 범위 밖. title에서 "内部動作" 제거, 정답 A와 해설을 "부여 체인 전체에서 자동 연쇄 취소" 결과 중심으로 재구성.

**비중 영향**:
- custom_topic_counts 변화: 변화 없음 (topic 레이블 유지, 앵글만 결과 중심으로 전환)
- drift 상태 변동: 없음

**topic_stats.json 갱신**: 예 (last_revision 필드)

---

### [2026-04-17] P2 — custom_05_002.json: C_05_006 해설 ORACLE_MAINTAINED 컬럼명 제거·요약

- **대상 파일**: customquestions_json/05/custom_05_002.json
- **영향 문제**: C_05_006
- **Phase**: P2

**Before**:
- topic: 권한분석(DBMS_PRIVILEGE_CAPTURE)
- 출제 개념: DATABASE 유형 동시 1개만 활성화 / 객체 소유자 자기 스키마 접근 캡처 제외 / 해설에서 "ORACLE_MAINTAINED='Y' 자동 제외" 컬럼명·값 직접 노출 2곳

**After**:
- topic: 권한분석(DBMS_PRIVILEGE_CAPTURE) — 유지
- 출제 개념: 문제 구조(DATABASE 유형 동시 1개·객체 소유자 제외)는 그대로. 해설에서 ORACLE_MAINTAINED 컬럼명·값 제거 후 "SYS·SYSTEM 등 Oracle 내부 계정 자동 제외"로 요약

**사유**: 진단결과 ch05_사용자권한.md §3 custom_05_002 지적. 문제의 정답 포인트(DATABASE 유형 제한)는 questions_json 05_007 수준 적합이나, 해설에서 DBA_USERS 내부 컬럼명(ORACLE_MAINTAINED)·값('Y') 직접 노출은 Silver 상한 경계. title·선택지·정답은 완전 유지하고 해설만 완화.

**비중 영향**:
- custom_topic_counts 변화: 변화 없음
- drift 상태 변동: 없음

**topic_stats.json 갱신**: 예 (last_revision 필드)

---

### [2026-04-17] schema_extension — infra: 비중관리 인프라 구축

- **Phase**: schema_extension

**변경 내용**: `forbidden_topics`(빈 배열) / `topic_drift_alert` / `last_revision` 필드 추가

**사유**: A+B+C+D 비중관리 플랜 인프라 (사용자 결정 2026-04-17)

**topic_stats.json 갱신**: 예 (3개 신규 필드 추가)

---

### [2026-04-17] remap — infra: original_coverage_map 재매핑 표 추가 + drift 보정 계산

- **대상 파일**: customquestions_json/05/topic_stats.json
- **Phase**: schema_extension (비중관리 인프라 확장)

**변경 내용**: `original_coverage_map` 필드 신규 추가 — 원본 6키 모두를 custom 세부 라벨 집합에 매핑. 보정 drift 재계산 적용. (원본 05_006 프로파일은 ch11로 이관되어 제외.)

**매핑 결정**:
- `テーブルスペース割当て制限(QUOTA)` → QUOTA·CREATE USER構文(QUOTA/TABLESPACE) (2 라벨, 2건).
- `共通ユーザーとローカル・ユーザー` → 共通/ローカル·Schema-Only·デフォルト・アカウント·CONTAINER=ALL/CURRENT·共通ユーザー付与時デフォルト (5 라벨, 11건). 04_02 공통/로컬 사용자 개념 + 멀티테넌트 범위.
- `ユーザー認証` → ユーザー認証·OS認証·REMOTE_LOGIN_PASSWORDFILE·4종 방식 비교·orapwd 관리·CREATE SESSION (6 라벨, 12건). 04_01 인증 범주.
- `システム権限とオブジェクト権限(ADMIN/GRANT OPTION)` → 동명·権限階層·GRANT/REVOKE 연쇄·ADMIN/GRANT OPTION 취소 차이·PUBLIC 권한 (5 라벨, 16건). 04_03 §s01~s03 권한 체계. 원본 가중치 2.
- `ロール管理` → 동명·共通/ローカル・ロール·Secure Application Role (3 라벨, 8건). 04_04 롤 범주.
- `権限分析(DBMS_PRIVILEGE_CAPTURE)` → 동명 1 라벨(3건). 04_05 권한 분석.

**판단 근거(애매 항목)**:
- `CREATE SESSION権限とログイン`: 로그인은 인증 전제이므로 `ユーザー認証` 범주. 일부 해석에 따라 "システム権限" 범주 가능하나 진단서 §2.1 04_001 "Password Access 조건" 맥락이 인증 범주.
- `デフォルト・アカウント・セキュリティ`·`Schema-Only`·`共通ユーザー付与時CONTAINERデフォルト`: 공통 사용자 운영 특성이므로 `共通ユーザーとローカル・ユーザー` 범주. Schema-Only는 Oracle 18c+ 비밀번호 없는 계정 유형으로 공통/로컬 사용자 개념의 하위 변형.
- `CONTAINER=ALL/CURRENT権限範囲`: 공통 사용자에게 권한 부여 시 범위 지정. 진단서 §2.1 04_005 공통 사용자 관점에 분류되어 있음. 일부 `システム権限` 범주 가능하나 공통/로컬 구분 관점이 우선.
- `権限階層(直接権限vsロール権限)`·`GRANT/REVOKE連鎖効果`·`ADMIN OPTION/GRANT OPTION取消し差異`·`PUBLIC権限`: 모두 권한 부여/취소 메커니즘이므로 `システム権限とオブジェクト権限` 범주(04_03 §s02~s03).
- `Secure Application Role`: 롤의 보안 확장 유형이므로 `ロール管理` 범주(04_04).
- 프로파일/테이블스페이스 쿼터 중복: `QUOTA`는 ch05에 그대로 유지하되(`テーブルスペース割当て制限` 직접 매핑), ch11의 `テーブルスペース・クォータ` 라벨은 ch11 `プロファイル` 범주로 별도 귀속. 양 챕터 중복 매핑 없음.

**보정 drift 결과**:
- Before flagged: 0건 (P1+P2 일괄 재검증에서 이미 임계 이내)
- After flagged: 0건 유지
- QUOTA(2건·-10.44%)·공통/로컬유저(11건·+6.87%)·유저인증(12건·+8.79%)·시스템/객체권한(16건·+2.20%)·롤관리(8건·+1.10%)·권한분석(3건·-8.52%) 전원 해소
- 52문항 확장이 원본 가중치(1:1:1:2:1:1, 합=7)에 근사 수렴

**진정한 gap**: 없음 (6키 모두 매핑 완전). ch11 이관 주제(프로파일 + 권한 캡처 세부)는 ch11 `プロファイル` 범주에 포함되며 ch05에서는 `権限分析(DBMS_PRIVILEGE_CAPTURE)` 원본키 1건만 유지.

**구조적 안정**: ch05는 원본 6키(05_006 프로파일 제외 후)가 Custom 22 라벨에 체계적으로 분산. 편차 최대 -10.44%(QUOTA)로 ch04·ch02에 이어 세 번째로 균형잡힌 챕터. 권한 체계(시스템/객체) 가중치 2가 실제 custom에서도 최대 빈도(16건·30.77%)로 재현.

**topic_stats.json 갱신**: 예 (필드: original_coverage_map 신규 / recheck_note 갱신)

---
