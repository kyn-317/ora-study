# 수정 보고서: custom_08_002.json

- **작성일**: 2026-04-17
- **대상 평가파일**: customquestions_json/08/evaluation/custom_08_002_eval_P2_batch3.md
- **대상 문제파일**: customquestions_json/08/custom_08_002.json
- **총 수정제안**: 1건
- **수락**: 1건 / **거부**: 0건 / **부분수락**: 0건
- **배치**: P2 배치 3 (마지막)

---

## 제안별 판정

### [P2] C_08_006 — GUARANTEE/NOGUARANTEE 트레이드오프(내부 동작 편중) → 운영 결과 관점

- **판정**: ACCEPT
- **수정 근거**: 진단결과 `guide_files/20260417_진단결과/ch08_UNDO.md` §3 custom_08_002(Q2) 수정방향 P2 명시: "C_08_006을 RETENTION GUARANTEE 설정 명령어/위치(ALTER TABLESPACE vs ALTER SYSTEM 구분) 수준으로 앵글 하향. 트레이드오프 서술은 해설에만 유지." 배치 3 명령서: "GUARANTEE/NOGUARANTEE 정책 판단(내부 동작 편중) → 운영 결과 관점 (ORA-01555 방지 여부 / Temp Segment 영향)". ch08 전체 내부 동작 편중(31문제 중 9건 = 29%) 개선에 기여.

- **수정 전**:
  - title: "UNDO_RETENTIONパラメータとRETENTION GUARANTEE機能について正しく述べているものを選択してください(2つ選択してください)。"
  - 선택지 A: "UNDO_RETENTIONパラメータの基本値は900秒（15分）であり、ALTER SYSTEM文で動的に変更が可能である。"
  - 선택지 B: "RETENTION GUARANTEEを設定すると、UNDO表領域の領域が不足した場合でもUNEXPIRED状態のUNDOエクステントは再利用されない。"
  - 선택지 C: "RETENTION GUARANTEEの設定はALTER SYSTEM文を使用してインスタンス・レベルで行う。"
  - 선택지 D: "UNDO_RETENTIONパラメータは静的パラメータであり、変更を適用するにはインスタンスの再起動が必要である。"
  - 선택지 E: "RETENTION GUARANTEEを設定するとORA-01555エラーの発生を防止できるが、ORA-30036エラーの発生リスクには影響しない。"
  - 정답: A, B
  - 해설: UNDO_RETENTION 900초·동적변경 + GUARANTEE 설정 효과 + ORA-30036 트레이드오프 상세 다수

- **수정 후**:
  - title: "RETENTION GUARANTEE設定の運用上の効果について正しく述べているものを選択してください(2つ選択してください)。" (초점: UNDO_RETENTION 파라미터 복합 → GUARANTEE 단독 + 운영 효과)
  - 선택지 A: "RETENTION GUARANTEEを設定すると、UNDO_RETENTION期間内のUNEXPIREDエクステントが保護されるため、ORA-01555(Snapshot Too Old)エラーの発生を抑制する効果が期待できる。" (정답 — ORA-01555 억제 효과: 운영 결과)
  - 선택지 B: "RETENTION GUARANTEEはALTER TABLESPACE文でUNDO表領域レベルに設定し、ALTER SYSTEM文でインスタンス全体に適用することはできない。" (정답 — 설정 명령어/위치: ALTER TABLESPACE 전용)
  - 선택지 C: "RETENTION GUARANTEEを設定すると、一時UNDOセグメントの使用量が削減され、Temp表領域の容量圧迫が自動的に解消される。" (Temp 세그먼트 영향 오해 오답 — 배치 명령서의 "Temp Segment 영향" 축 반영)
  - 선택지 D: "RETENTION GUARANTEEを設定した場合、UNDO_RETENTIONパラメータの値はAuto-Tuning機能により無視され常に0として扱われる。" (UNDO_RETENTION 무시 오해 오답)
  - 선택지 E: "RETENTION GUARANTEEを解除するにはALTER TABLESPACE文でRETENTION NOGUARANTEEを指定するか、UNDO表領域全体を削除する必要がある。" (해제 방법 오해 오답 — 잘못된 "또는" 조건 설계로 부분 참/부분 거짓 혼동 유도)
  - 정답: A, B (복수정답 유지)
  - 해설: 운영 결과 중심 재작성. ORA-01555 억제, ALTER TABLESPACE 단독 사용, Temp 영역과의 무관성, UNDO_RETENTION 연계 동작, RETENTION NOGUARANTEE 명령 해제 설명.
  - 핵심 개념: "RETENTION GUARANTEE는 UNDO 테이블스페이스 레벨 설정(ALTER TABLESPACE)으로 UNEXPIRED UNDO Extent를 공간 부족 시에도 보호하여 ORA-01555 에러를 억제하는 효과를 제공합니다. 단 일반 UNDO 관리 영역이므로 Temp 테이블스페이스의 용량 문제(일시 UNDO)와는 별도 영역입니다."

---

## 미반영 사항

없음 (모든 제안 수락).

---

## Self-Review 체크리스트

- [x] forbidden_topics 침범 여부: ch08 forbidden_topics 빈 배열. 침범 없음.
- [x] Silver 상한(10번 §5 과도 항목) 회피: 트레이드오프 상세 판단(ORA-01555 vs ORA-30036 심층 비교) 서술 제거. 정답 서술을 "효과 기대" 수준으로 유지.
- [x] 정답/해설 논리 정합성: 정답 A(ORA-01555 억제 효과) + B(ALTER TABLESPACE 전용)은 운영 결과 사실. 오답 4개는 모두 고빈도 운영 착각 포인트(Temp 연계 오해, UNDO_RETENTION 무시 오해, GUARANTEE 해제 방법 오해) 커버.
- [x] 원본 구조(5지선다 A-E, 복수정답 2つ) 유지.
- [x] 배치 명령서 지정 "ORA-01555 방지 여부" 축 → 정답 A 반영. "Temp Segment 영향" 축 → 오답 C 반영.
- [x] revision_log 기록 예정.
- [x] 평가 파일 applied/ 저장 완료.
