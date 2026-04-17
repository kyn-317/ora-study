# 평가 결과: custom_11_003.json

- **평가일**: 2026-04-17
- **평가 대상**: customquestions_json/11/custom_11_003.json
- **챕터**: 11 — 監査の概要
- **문제 수**: 5문제 (C_11_011 ~ C_11_015)
- **상태**: 반영완료 (applied)
- **배치**: P2 배치 3 (마지막)

---

## 종합 점수

| 문제번호 | 기술적 정확성 | 난이도 적합성 | 형식 일관성 | 해설 품질 | 오답 매력도 | 종합 | 판정 | Q1/Q2/Q3 | Drift Flag |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|------|:--------:|:----------:|
| C_11_011 | 10/10 | 9/10 | 10/10 | 10/10 | 9/10 | 9.6 | PASS | Q1 | - |
| C_11_012 | 10/10 | 9/10 | 10/10 | 10/10 | 9/10 | 9.6 | PASS | Q1 | - |
| C_11_013 | 10/10 | 9/10 | 10/10 | 10/10 | 9/10 | 9.6 | PASS | Q1 | - |
| C_11_014 | 10/10 | 6/10 | 10/10 | 9/10 | 8/10 | 8.6 | NEEDS_REVISION | Q2 (파라미터 암기형) | - |
| C_11_015 | 10/10 | 9/10 | 10/10 | 10/10 | 9/10 | 9.6 | PASS | Q1 | - |

---

## 상세 평가 (수정 대상)

### C_11_014 — FGA audit_column_opts 기본값 암기 (파라미터 세부)

**forbidden_topics 침범 검사**
- 침범 여부: NO (ch11 forbidden_topics 3항목과 직접 해당 없음)
- 단, 파라미터 기본값 암기형 질문은 FGA 파라미터 세부 수준이 questions_json 기준(FGA 개념 정도) 초과

**기술적 정확성 (10/10)**
- audit_column_opts 기본값 ANY_COLUMNS, ALL_COLUMNS vs ANY_COLUMNS 차이, DELETE에서 audit_column 무시 사실 모두 정확

**난이도 적합성 (6/10)**
- 진단 결과(ch11_감사.md §3 custom_11_003): "C_11_014 DBMS_FGA.ADD_POLICY의 audit_column_opts 파라미터 기본값(ANY_COLUMNS) 및 DELETE 문에서 audit_column 무시 여부. questions_json 11_004는 FGA에 대해 'MERGE 문 내부 처리', 'ALL_COLUMNS/ANY_COLUMNS 개념' 정도를 다루지만, 파라미터 기본값 선택 문제는 내부 상세 수준"
- 수정방향: "audit_column_opts 기본값 암기형 질문 → 'FGA SELECT 감사 특성'이나 'FGA vs 통합 감사 차이' 개념형으로 교체 권고. 또는 MERGE 문 처리 방식 중심으로 변경"
- 배치 명령서: "FGA audit_column_opts=ANY_COLUMNS 기본값 암기 → 사실 확인 수준 (FGA 정책 정의 방법 개념)"

**수정 제안**
- [P2] C_11_014 — audit_column_opts 파라미터 기본값 암기 → FGA 정책 정의 방법 개념으로 앵글 변경
  - 근거: guide_files/20260417_진단결과/ch11_감사.md §3 custom_11_003(Q2) 수정방향 명시.
  - 방향: title 변경 — "audit_column_opts 파라미터" 세부 → "FGA 정책 정의 방법" 개념. 정답 A는 "DBMS_FGA.ADD_POLICY 프로시저로 생성, 대상 테이블·조건·열·DML 유형 파라미터 지정"이라는 FGA 정책 정의의 기본 방식 사실 확인 수준으로 변경. 오답은 CREATE AUDIT POLICY 혼동(B), audit_column 필수 오해(C), SELECT 전용 오해(D)로 구성. audit_column_opts 기본값(ANY_COLUMNS) 암기형 출제 완전 제거.

---

## 총평

custom_11_003 파일의 5문제 중 C_11_014만 NEEDS_REVISION(Q2)이며 나머지 C_11_011·012·013·015는 PASS(Q1).
C_11_014는 파라미터 기본값 암기 → FGA 정책 정의 방법 개념(사실 확인 수준)으로 앵글 변경.

배치 3에서 ACCEPT 처리.
