# 수정 보고서: custom_05_010.json

- **작성일**: 2026-04-17
- **대상 평가파일**: customquestions_json/05/evaluation/custom_05_010_eval_P2_batch2.md
- **대상 문제파일**: customquestions_json/05/custom_05_010.json
- **총 수정제안**: 1건
- **수락**: 1건 / **거부**: 0건 / **부분수락**: 0건
- **배치**: P2 배치 2

---

## 제안별 판정

### [P2] C_05_046 — SYSAUTH$/OBJAUTH$ 내부 구조 비교 → REVOKE 연쇄 취소 결과 중심 재구성

- **판정**: ACCEPT
- **수정 근거**: 진단결과 `guide_files/20260417_진단결과/ch05_사용자권한.md` §3 custom_05_010 항목에서 "C_05_046 → 'REVOKE 시 연쇄 취소 발생 여부와 그 이유' 결과 중심 문제로 재구성. 'GRANT OPTION은 부여자 추적이 되어 연쇄 취소 가능' 수준으로 요약하고, OBJAUTH$/SYSAUTH$ 테이블명·컬럼명 제거" 명시. title에 "Oracle内部のデータ・ディクショナリでの管理方法" 포함되어 10번 §5 항목 12번(ROWID 비트 인코딩)과 동급 과도. title·선택지·정답·해설 전면 재구성 필요.

- **수정 전**:
  - title: "WITH ADMIN OPTIONで付与されたシステム権限と、WITH GRANT OPTIONで付与されたオブジェクト権限について、**Oracle内部のデータ・ディクショナリでの管理方法の違い**に関して正しく述べているものを選択してください(2つ選択してください)。"
  - 선택지 A: "WITH GRANT OPTIONで付与されたオブジェクト権限はOBJAUTH$テーブルにGRANTOR#（付与者番号）が記録されるため..."
  - 선택지 B: "WITH ADMIN OPTIONで付与されたシステム権限はSYSAUTH$テーブルに付与者（Grantor）情報が記録されるため..."
  - 선택지 C: "DBA_TAB_PRIVSビューのGRANTABLEおよびGRANTOR列を通じて..."
  - 선택지 D: "DBA_SYS_PRIVSビューのGRANTOR列を通じて..."
  - 선택지 E: "WITH ADMIN OPTIONとWITH GRANT OPTIONは共にOBJAUTH$テーブルで管理されるため..."
  - 정답: A, C
  - 해설: OBJAUTH$·SYSAUTH$ 테이블 구조, GRANTOR# 컬럼, 재귀 추적 알고리즘 서술 다수

- **수정 후**:
  - title: "WITH ADMIN OPTIONで付与されたシステム権限と、WITH GRANT OPTIONで付与されたオブジェクト権限について、**REVOKE時の連鎖取消しの発生有無**に関して正しく述べているものを選択してください(2つ選択してください)。" (내부 딕셔너리 관점 → REVOKE 연쇄 취소 결과 관점으로 전환)
  - 선택지 A: "WITH GRANT OPTIONで付与されたオブジェクト権限は、上位の付与者からREVOKEすると付与チェーンをたどって下位ユーザーの権限まで自動的に連鎖取消しが発生する。" (결과 관점 정답)
  - 선택지 B: "WITH ADMIN OPTIONで付与されたシステム権限は、上位の付与者からREVOKEしても下位ユーザーの権限は自動的には取り消されず、各ユーザーが独立して権限を保持し続ける。" (결과 관점 정답)
  - 선택지 C: "WITH ADMIN OPTIONとWITH GRANT OPTIONのいずれも、REVOKE時の連鎖取消し動作は同一であり、付与チェーンの全下位ユーザーの権限が自動的に取り消される。" (동일 동작 오해 오답)
  - 선택지 D: "WITH GRANT OPTIONで付与されたオブジェクト権限のREVOKEで連鎖取消しを発生させるには、REVOKE文に明示的にCASCADE CONSTRAINTS句を指定する必要がある。" (CASCADE CONSTRAINTS 오해 오답)
  - 선택지 E: "WITH ADMIN OPTIONのREVOKEでは、下位ユーザーの権限のみが自動的に取り消されるが、その下位ユーザーが他のユーザーに付与した権限は影響を受けない。" (부분 연쇄 오해 오답)
  - 정답: A, B (결과 관점 재편)
  - 해설: OBJAUTH$/SYSAUTH$ 테이블명·GRANTOR# 컬럼명·재귀 추적 알고리즘 전면 제거, "ADMIN OPTION = 비연쇄, GRANT OPTION = 자동 연쇄" 결과 중심 서술, CASCADE CONSTRAINTS와 CASCADE 권한 연쇄의 구분 교육 포함
  - 핵심 개념: "이 결과 차이를 실무 관점에서 이해하는 것이 핵심"

---

## 미반영 사항

없음 (모든 제안 수락).

---

## Self-Review 체크리스트

- [x] forbidden_topics 침범 여부: ch05는 forbidden_topics 빈 배열. 수정 후 OBJAUTH$/SYSAUTH$/GRANTOR# 전부 제거.
- [x] Silver 상한(10번 §5 과도 항목) 회피: title에서 "内部のデータ・ディクショナリでの管理方法" 제거, 선택지·해설에서 내부 딕셔너리 테이블명·컬럼명 전면 제거.
- [x] 정답/해설 논리 정합성: 정답은 결과 관점 A+B 조합으로 재편성. questions_json 05_008 수준에 부합.
- [x] 복수정답 5지선다 구조(A-E, 2つ選択) 유지.
- [x] CASCADE CONSTRAINTS와 CASCADE 권한 연쇄의 차이는 오답 D의 교육 포인트로 활용 (부가 학습 가치).
- [x] revision_log 기록 예정.
- [x] 평가 파일 applied/ 저장 완료.
