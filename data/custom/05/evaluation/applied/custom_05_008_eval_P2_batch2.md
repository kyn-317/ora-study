# 수정 보고서: custom_05_008.json

- **작성일**: 2026-04-17
- **대상 평가파일**: customquestions_json/05/evaluation/custom_05_008_eval_P2_batch2.md
- **대상 문제파일**: customquestions_json/05/custom_05_008.json
- **총 수정제안**: 2건
- **수락**: 2건 / **거부**: 0건 / **부분수락**: 0건
- **배치**: P2 배치 2

---

## 제안별 판정

### [P2] C_05_038 — Definer's Rights 프로시저 컴파일 단계별 동작 → 사실 확인 수준 완화

- **판정**: ACCEPT
- **수정 근거**: 진단결과 `guide_files/20260417_진단결과/ch05_사용자권한.md` §3 custom_05_008 항목에서 "C_05_038 → 'Definer's Rights에서 롤 기반 권한이 무시된다'는 사실 확인 수준으로 재구성" 명시. questions_json 05 chapter의 Definer's Rights 관련 출제 수준은 "결과 확인"이며, 현재 문제의 "WARNING/INVALID 상태", "컴파일 단계 vs 실행 단계" 구분은 10번 §5 원칙 위반. title·CREATE OR REPLACE PROCEDURE 시나리오·복수정답 5지선다 구조·정답(B, D) 조합은 유지하고 B의 설명과 A/C/E 오답을 결과 중심으로 재구성.

- **수정 전**:
  - 선택지 A: "プロシージャのコンパイルは成功するが、実行時にhr.employeesに対するSELECT権限がロール経由でしか付与されていないためORA-00942エラーが発生する。"
  - 선택지 B: "プロシージャのコンパイル自体が失敗し、警告付きで作成される。これはDefiner's Rightsモデルではロールを通じた権限が無視されるためである。"
  - 선택지 C: "AUTHID CURRENT_USER句を追加してInvoker's Rightsプロシージャに変更すれば、ロール経由のSELECT権限でもプロシージャの作成と実行の両方が成功する。"
  - 선택지 E: "このプロシージャはAUTHID句を指定していないため、Invoker's Rightsモデルが適用され、実行者のロール権限で動作する。"
  - 해설: 컴파일 단계별 상태(WARNING/INVALID) 중심 서술 2건

- **수정 후**:
  - 선택지 A: "AUTHID句を指定していないため、このプロシージャはInvoker's Rightsモデルとして作成され、実行時に実行者のロール権限(data_role)が適用されて正常に動作する。"
  - 선택지 B: "AUTHID句を指定していないため、このプロシージャはDefiner's Rightsモデルで作成され、定義者のロール経由で付与されたSELECT権限は無視されるため、プロシージャの作成は成功しない。" (컴파일 단계 표현 → 결과 표현으로 완화)
  - 선택지 C: "AUTHID CURRENT_USER句を追加してInvoker's Rightsプロシージャに変更すれば、ロール経由のSELECT権限だけでプロシージャの作成と実行の両方が問題なく成功する。"
  - 선택지 E: "Definer's RightsモデルではPUBLICに付与されたロール経由の権限のみ有効であり、個別ユーザーに付与されたロール経由の権限は常に無視される。" (Invoker's Rights 기본 적용 오해 → PUBLIC 롤 경유 오해로 교체)
  - 해설: 컴파일 단계별 상태 서술 제거, "정상 작성되지 않음" 결과 중심으로 재서술
  - 정답: B, D (유지)
  - 핵심 개념: "참조 객체 권한은 정의자(프로시저 소유자)에게 직접 부여되어야 합니다"로 결과 중심 요약

---

### [P2] C_05_040 — SYSAUTH$/OBJAUTH$ 내부 구조 비교 → 결과 중심 재구성

- **판정**: ACCEPT
- **수정 근거**: 진단결과 `guide_files/20260417_진단결과/ch05_사용자권한.md` §3 custom_05_008 항목에서 "C_05_040 → 'WITH ADMIN OPTION과 WITH GRANT OPTION의 REVOKE 동작 차이'를 결과 중심으로 재구성. SYSAUTH$/OBJAUTH$ 테이블명 제거" 명시. 10번 §3.1 §5 과도 항목(SYSAUTH$/OBJAUTH$ 딕셔너리 테이블 직접 참조, GRANTOR# 컬럼 언급)에 정면 해당. title·복수정답 5지선다 구조는 유지. 기존 정답 조합(B, E)은 내부 구조 정보를 담고 있어 그대로 유지 불가 — A+B 조합으로 재편성(결과 관점).

- **수정 전**:
  - 선택지 A: "WITH ADMIN OPTIONで付与されたシステム権限をREVOKEすると、OracleはSYSAUTH$ディクショナリ・テーブルで付与者（Grantor）情報を追跡しているが、パフォーマンス上の理由から連鎖取消しを行わない設計となっている。"
  - 선택지 B: "WITH GRANT OPTIONで付与されたオブジェクト権限をREVOKEすると、OBJAUTH$ディクショナリ・テーブルのGRANTOR情報に基づいて連鎖取消しが発生し、付与チェーンの全下位ユーザーの権限が取り消される。"
  - 선택지 D: "WITH GRANT OPTIONの連鎖取消しはデータ・ディクショナリの内部構造に関係なく、すべてのオブジェクト権限をスキャンして取り消すため処理に時間がかかる。"
  - 선택지 E: "WITH ADMIN OPTIONで付与されたシステム権限のREVOKE時に連鎖取消しが発生しないのは、SYSAUTH$ディクショナリ・テーブルに付与者(Grantor)情報が記録されていないためである。"
  - 정답: B, E
  - 해설: SYSAUTH$/OBJAUTH$ 테이블 구조 비교·GRANTOR# 컬럼·재귀 알고리즘 서술 다수

- **수정 후**:
  - 선택지 A: "WITH ADMIN OPTIONで付与されたシステム権限を上位の付与者からREVOKEした場合、その付与者から派生した下位ユーザーの権限は自動的には取り消されず、各ユーザーが個別に権限を保持し続ける。" (결과 관점 정답)
  - 선택지 B: "WITH GRANT OPTIONで付与されたオブジェクト権限を上位の付与者からREVOKEした場合、付与チェーンに沿って下位ユーザーの権限まで自動的に連鎖取消しが発生する。" (결과 관점 정답)
  - 선택지 D: "WITH GRANT OPTIONのREVOKEで連鎖取消しを発生させるには、REVOKE文に明示的にCASCADE句を指定する必要がある。" (CASCADE 절 오해 오답)
  - 선택지 E: "WITH ADMIN OPTIONのREVOKEでは、下位ユーザーの権限のみが自動的に取り消されるが、その下位ユーザーが他のユーザーに付与した権限はそのまま残る。" (부분 연쇄 오해 오답)
  - 정답: A, B (결과 관점 재편)
  - 해설: SYSAUTH$/OBJAUTH$ 테이블명·GRANTOR# 컬럼명·재귀 알고리즘 서술 전면 제거, "ADMIN OPTION = 비연쇄, GRANT OPTION = 자동 연쇄" 결과 중심 서술
  - 핵심 개념: "이 결과 차이를 실무 관점에서 이해하는 것이 핵심"

---

## 미반영 사항

없음 (모든 제안 수락).

---

## Self-Review 체크리스트

- [x] forbidden_topics 침범 여부: ch05는 forbidden_topics 빈 배열. 수정 후 SYSAUTH$/OBJAUTH$/GRANTOR# 전부 제거.
- [x] Silver 상한(10번 §5 과도 항목) 회피: C_05_038은 "컴파일 단계별 상태" 서술 제거, C_05_040은 내부 딕셔너리 테이블명·컬럼명 전면 제거. 두 문제 모두 결과 중심 서술로 전환.
- [x] 정답/해설 논리 정합성: C_05_038 정답(B, D) 유지, C_05_040 정답은 결과 관점 A+B 조합으로 재편성. 두 경우 모두 questions_json 05 chapter 출제 수준과 정합.
- [x] 복수정답 5지선다 구조(A-E, 2つ選択) 유지.
- [x] title 유지 (기본 시나리오·주제 변경 없음).
- [x] revision_log 기록 예정.
- [x] 평가 파일 applied/ 저장 완료.
