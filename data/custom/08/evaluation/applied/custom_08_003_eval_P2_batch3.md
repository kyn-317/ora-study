# 수정 보고서: custom_08_003.json

- **작성일**: 2026-04-17
- **대상 평가파일**: customquestions_json/08/evaluation/custom_08_003_eval_P2_batch3.md
- **대상 문제파일**: customquestions_json/08/custom_08_003.json
- **총 수정제안**: 1건
- **수락**: 1건 / **거부**: 0건 / **부분수락**: 0건
- **배치**: P2 배치 3 (마지막)

---

## 제안별 판정

### [P2] C_08_013 — Temporary UNDO 제한 상세(내부 동작 편중) → 운영 결과 수준

- **판정**: ACCEPT
- **수정 근거**: 진단결과 `guide_files/20260417_진단결과/ch08_UNDO.md` §3 custom_08_003(Q2) 수정방향 P2 명시: "C_08_013을 Temporary UNDO 적용 대상(GTT/Private Temporary Table/영구 테이블 구분) 수준의 운영-개념으로 앵글 변경. 제한사항은 해설에 부가 정보로 유지." 배치 3 명령서: "Temporary UNDO 제한 상세 → 운영 결과 수준 (CDB/PDB 레벨 설정 가능 여부, 글로벌 Temp Table 대상 범위)". ch08 내부 편중 개선에 기여(custom_08_002 C_08_006과 함께 내부-개념 2건 동시 하향).

- **수정 전**:
  - title: "一時UNDO（Temporary UNDO）の制限事項および注意点について正しく述べているものを選択してください。"
  - 선택지 A: "一時UNDOが有効な場合、グローバル一時表と永続表の両方を操作するトランザクションでは一時UNDOのみが生成される。"
  - 선택지 B: "一時UNDOのデータは一時表領域内のTemporary UNDOセグメントに格納され、ソートやハッシュ結合と同じ一時領域を共有する。"
  - 선택지 C: "一時UNDOを使用するとData Guard Standbyデータベースにも一時UNDOデータが自動的に転送される。"
  - 선택지 D: "一時UNDOが有効な場合、V$UNDOSTATビューでTemporary UNDOの使用統計を確認できる。"
  - 정답: B
  - 해설: Temp 세그먼트 격리, 혼합 트랜잭션 동작, Data Guard 비전파, V$TEMPUNDOSTAT 뷰 세부 구분 중심

- **수정 후**:
  - title: "一時UNDO（Temporary UNDO）の適用対象および設定範囲について正しく述べているものを選択してください。" (초점: 제한 사항 → 적용 대상·설정 범위)
  - 선택지 A: "一時UNDOはグローバル一時表(GTT)・プライベート一時表(PTT)・一時LOBなどの一時オブジェクトが対象であり、一般の永続表のDMLには適用されない。" (정답 — 적용 대상 범위: 일시 오브젝트 전용)
  - 선택지 B: "一時UNDOはCDBレベルでのみ設定可能であり、PDB単位では有効化/無効化ができない。" (CDB 전용 오해 오답 — 배치 명령서의 "CDB/PDB 레벨 설정 가능 여부" 축 반영)
  - 선택지 C: "一時UNDOが有効化されると、同一セッション内のすべてのDML操作(永続表含む)のUNDOが自動的にTemp表領域へ移動する。" (모든 DML 이동 오해 오답)
  - 선택지 D: "一時UNDOはData Pump Exportの処理中に一括で有効化されるため、TEMP_UNDO_ENABLEDパラメータを明示的に設定する必要はない。" (Data Pump 자동 활성화 오해 오답)
  - 정답: A (단일정답 유지)
  - 해설: 적용 대상(GTT/PTT/임시 LOB) 중심, 영구 테이블 DML은 대상 외, PDB 레벨 설정 가능, Data Pump 비연관 서술 중심. 제한사항 세부(Data Guard 비전파 등)는 해설의 핵심 개념 블록에서만 부가 언급.
  - 핵심 개념: "Temporary UNDO는 GTT, PTT, 임시 LOB 등 일시적 오브젝트의 UNDO만을 Temp 테이블스페이스로 이동시키는 최적화 기능입니다. 영구 테이블의 DML에는 적용되지 않으며, CDB/PDB/세션 레벨에서 TEMP_UNDO_ENABLED 파라미터로 유연하게 제어할 수 있습니다."

---

## 미반영 사항

없음 (모든 제안 수락).

---

## Self-Review 체크리스트

- [x] forbidden_topics 침범 여부: ch08 forbidden_topics 빈 배열. 침범 없음.
- [x] Silver 상한 회피: 제한 사항 세부(혼합 트랜잭션 내부, Data Guard 비전파, V$TEMPUNDOSTAT 구분) 직접 출제 제거. 적용 대상 운영 사실 수준으로 하향.
- [x] 정답/해설 논리 정합성: 정답 A(GTT/PTT/임시 LOB 대상, 영구 테이블 DML 미적용)는 운영 결과 사실. 오답 3개는 CDB 전용 오해(B), 모든 DML 일괄 이동 오해(C), Data Pump 연계 오해(D)로 구성.
- [x] 원본 구조(4지선다 A-D, 단일정답) 유지.
- [x] 배치 명령서 지정 "CDB/PDB 레벨 설정 가능 여부" 축 → 오답 B 반영. "글로벌 Temp Table 대상 범위" 축 → 정답 A 반영.
- [x] revision_log 기록 예정.
- [x] 평가 파일 applied/ 저장 완료.
