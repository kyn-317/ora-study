# 수정 보고서: custom_11_003.json

- **작성일**: 2026-04-17
- **대상 평가파일**: customquestions_json/11/evaluation/custom_11_003_eval_P2_batch3.md
- **대상 문제파일**: customquestions_json/11/custom_11_003.json
- **총 수정제안**: 1건
- **수락**: 1건 / **거부**: 0건 / **부분수락**: 0건
- **배치**: P2 배치 3 (마지막)

---

## 제안별 판정

### [P2] C_11_014 — FGA audit_column_opts=ANY_COLUMNS 기본값 암기 → FGA 정책 정의 방법 개념

- **판정**: ACCEPT
- **수정 근거**: 진단결과 `guide_files/20260417_진단결과/ch11_감사.md` §3 custom_11_003(Q2) 수정방향 명시: "audit_column_opts 기본값 암기형 질문 → 'FGA SELECT 감사 특성'이나 'FGA vs 통합 감사 차이' 개념형으로 교체 권고. 또는 MERGE 문 처리 방식 중심으로 변경". 배치 3 명령서: "FGA audit_column_opts=ANY_COLUMNS 기본값 암기 → 사실 확인 수준 (FGA 정책 정의 방법 개념)". 세부 파라미터 기본값 암기형을 정책 정의 방법(DBMS_FGA.ADD_POLICY 기본 사용) 수준으로 하향.

- **수정 전**:
  - title: "ファイングレイン監査(FGA)においてDBMS_FGA.ADD_POLICYプロシージャのaudit_column_optsパラメータについて正しく述べているものを選択してください。"
  - 선택지 A: "audit_column_optsのデフォルト値はDBMS_FGA.ALL_COLUMNSであり、指定したすべての列にアクセスした場合にのみ監査レコードが生成される。"
  - 선택지 B: "audit_column_optsにDBMS_FGA.ANY_COLUMNSを指定すると、audit_columnで指定した列のうちいずれか1つでもアクセスがあれば監査レコードが生成される。"
  - 선택지 C: "audit_column_optsの設定はSELECT文にのみ適用され、INSERT文やUPDATE文には影響しない。"
  - 선택지 D: "audit_column_optsパラメータを省略した場合、FGAポリシーはエラーとなり作成できない。"
  - 정답: B
  - 해설: audit_column_opts 기본값(ANY_COLUMNS) 암기, ALL_COLUMNS vs ANY_COLUMNS 세부 구분, DELETE에서 audit_column 무시 서술 중심

- **수정 후**:
  - title: "ファイングレイン監査(FGA)のポリシー定義方法について正しく述べているものを選択してください。" (초점: audit_column_opts 세부 파라미터 → FGA 정책 정의 방법 개념)
  - 선택지 A: "FGA監査ポリシーはDBMS_FGA.ADD_POLICYプロシージャを使用して作成し、監査対象の表(object_schema、object_name)、監査条件(audit_condition)、監査対象列(audit_column)などを指定する。" (정답 — FGA 정책 정의의 기본 방식 사실 확인)
  - 선택지 B: "FGA監査ポリシーはCREATE AUDIT POLICY文を使用して統合監査と同一の構文で作成する。" (CREATE AUDIT POLICY 혼동 오답)
  - 선택지 C: "FGA監査ポリシーの作成には必ず監査対象列(audit_column)の指定が必要であり、列を指定しないとポリシーが作成できない。" (audit_column 필수 오해 오답)
  - 선택지 D: "FGA監査ポリシーはSELECT文にのみ適用可能であり、INSERT、UPDATE、DELETEのDML文には使用できない。" (SELECT 전용 오해 오답)
  - 정답: A (단일정답 유지)
  - 해설: FGA 정책 정의의 기본 방식(DBMS_FGA.ADD_POLICY 프로시저 사용, 주요 파라미터: policy_name/object_schema/object_name/audit_condition/audit_column/statement_types/handler_*) 중심. CREATE AUDIT POLICY와의 구분, audit_column 선택적 파라미터, 모든 DML 유형 지원 사실 명시. audit_column_opts 기본값(ANY_COLUMNS) 암기형 출제 완전 제거.
  - 핵심 개념: "FGA 정책은 DBMS_FGA.ADD_POLICY 프로시저로 생성하며, 감사 대상 테이블·조건·열·DML 유형·핸들러 등을 파라미터로 지정하여 세밀한 조건부 감사를 구현합니다. 이는 CREATE AUDIT POLICY 문으로 생성하는 통합 감사 정책과 별도의 관리 체계이지만, Oracle AI Database에서는 FGA 레코드도 UNIFIED_AUDIT_TRAIL 뷰로 통합 조회됩니다."

---

## 미반영 사항

없음 (모든 제안 수락).

---

## Self-Review 체크리스트

- [x] forbidden_topics 침범 여부: ch11 forbidden_topics 3항목 침범 없음.
- [x] Silver 상한 회피: audit_column_opts 기본값 암기(ANY_COLUMNS vs ALL_COLUMNS 세부 구분) 직접 출제 제거. FGA 정책 정의 방법 개념(DBMS_FGA.ADD_POLICY 기본 사용) 수준으로 하향.
- [x] 정답/해설 논리 정합성: 정답 A는 "FGA 정책은 DBMS_FGA.ADD_POLICY로 생성, 주요 파라미터 지정"이라는 사실 확인 수준. 오답은 CREATE AUDIT POLICY 혼동(B), audit_column 필수 오해(C), SELECT 전용 오해(D) — questions_json 11_004가 다루는 FGA 개념 수준과 일치.
- [x] 원본 구조(4지선다 A-D, 단일정답) 유지.
- [x] 배치 명령서 지정 "사실 확인 수준 (FGA 정책 정의 방법 개념)" 축 → 정답 A 반영.
- [x] revision_log 기록 예정.
- [x] 평가 파일 applied/ 저장 완료.
