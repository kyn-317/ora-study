# 수정 보고서: custom_09_005.json

- **작성일**: 2026-04-17
- **대상 평가파일**: customquestions_json/09/evaluation/custom_09_005_eval_P2_batch3.md
- **대상 문제파일**: customquestions_json/09/custom_09_005.json
- **총 수정제안**: 1건
- **수락**: 1건 / **거부**: 0건 / **부분수락**: 0건
- **배치**: P2 배치 3 (마지막)

---

## 제안별 판정

### [P2] C_09_025 — NETWORK_LINK+FLASHBACK_TIME 복수 조합 → NETWORK_LINK 단독 간소화

- **판정**: ACCEPT
- **수정 근거**: 진단결과 `guide_files/20260417_진단결과/ch09_데이터이동.md` §3 custom_09_005(Q3 경계) 수정방향 명시: "C_09_025의 C 선택지를 NETWORK_LINK의 부가 특성(로그파일용 DIRECTORY 여전히 필요)으로 교체하거나, FLASHBACK_TIME 중심 축을 '파라미터 존재 여부'를 묻는 오답 구성으로 전환할 것". 배치 3 명령서: "NETWORK_LINK+FLASHBACK_TIME 복수 조합 상세 → 간소화 (기본 의미+Undo 기간 제약 1개만 유지)". ch09 forbidden_topics #11 "FLASHBACK_SCN/FLASHBACK_TIME 시점 일관성 내부 메커니즘" 경계 침범 해소. 배치 명령서의 "기본 의미+Undo 기간 제약 1개만 유지" 축 중에서 첫 번째 수정방향("NETWORK_LINK DIRECTORY 필요로 교체") 채택 — FLASHBACK_TIME을 정답 축에서 완전 제거하여 Q3 경계 이슈를 철저히 해소하는 것이 P1 단계에서 이미 처리된 custom_09_007 C_09_031 수정과 일관된 정책.

- **수정 전**:
  - title: "Data Pump ImportのNETWORK_LINKパラメータとFLASHBACK_TIMEパラメータについて正しく述べているものを選択してください(2つ選択してください)。"
  - 선택지 A: "NETWORK_LINKパラメータを使用すると、ダンプ・ファイルを生成せずにデータベース・リンク経由でソース・データベースから直接データをインポートすることができる。"
  - 선택지 B: "NETWORK_LINKを使用したインポートでは、REMAP_SCHEMAやEXCLUDEなどの変換パラメータを併用することはできない。"
  - 선택지 C: "FLASHBACK_TIMEパラメータはData Pump Exportで指定でき、Undo情報を利用して指定時刻時点の一貫性のあるデータをエクスポートする。"
  - 선택지 D: "FLASHBACK_TIMEパラメータを使用する場合、対象のテーブルが事前にFLASHBACK ARCHIVEに登録されている必要がある。"
  - 선택지 E: "NETWORK_LINKを使用したインポートでは、DIRECTORYパラメータは不要であり指定することはできない。"
  - 정답: A, C
  - 해설: NETWORK_LINK + FLASHBACK_TIME 혼합, Undo 정보 활용 메커니즘 + UNDO_RETENTION 기간 제약 서술 포함

- **수정 후**:
  - title: "Data Pump ImportのNETWORK_LINKパラメータの使用について正しく述べているものを選択してください(2つ選択してください)。" (초점: NETWORK_LINK 단독)
  - 선택지 A: "NETWORK_LINKパラメータを使用すると、ダンプ・ファイルを生成せずにデータベース・リンク経由でソース・データベースから直接データをインポートすることができる。" (정답 — NETWORK_LINK 기본 의미)
  - 선택지 B: "NETWORK_LINKを使用したインポートでは、REMAP_SCHEMAやEXCLUDEなどの変換パラメータを併用することはできない。" (변환 파라미터 병행 불가 오해 오답)
  - 선택지 C: "NETWORK_LINKを使用してダンプ・ファイルを生成しない場合でも、ログ・ファイル(LOGFILE)の保存先としてDIRECTORYパラメータの指定が必要である。" (정답 — DIRECTORY 필수: 진단서 제안한 "로그파일용 DIRECTORY 여전히 필요" 축)
  - 선택지 D: "NETWORK_LINKを使用する場合、ソース・データベースの表を変更するDML操作がインポート中に許可されるため、テーブル定義の変更も自動的に反映される。" (Import 중 DML 반영 오해 오답)
  - 선택지 E: "NETWORK_LINKパラメータはData Pump Export(expdp)専用であり、Import(impdp)では使用できない。" (Export 전용 오해 오답)
  - 정답: A, C (복수정답 구조 유지)
  - 해설: NETWORK_LINK 기본 의미(DB Link 경유 직접 Import)와 운영 전제조건(DIRECTORY/로그 파일 필수) 중심. FLASHBACK_TIME 언급 완전 제거. 변환 파라미터 병행 가능, DML 반영 없음(Undo 기반 일관성), Import에서 사용 사실 설명.
  - 핵심 개념: "NETWORK_LINK는 DB Link를 통해 덤프 파일 없이 직접 Import하는 기능이며, REMAP·EXCLUDE 등 변환 파라미터와 조합 가능합니다. 단 로그 파일 저장을 위한 DIRECTORY 오브젝트는 반드시 필요하므로, Data Pump 실행 전제조건인 Directory 객체와 권한 구성은 NETWORK_LINK 환경에서도 생략할 수 없습니다."

---

## 미반영 사항

없음 (모든 제안 수락).

---

## Self-Review 체크리스트

- [x] forbidden_topics 침범 여부: ch09 forbidden_topics #11 "FLASHBACK_SCN/FLASHBACK_TIME 시점 일관성 내부 메커니즘" — 수정 후 FLASHBACK_TIME 언급 완전 제거하여 침범 해소.
- [x] Silver 상한 회피: "Undo 정보 활용 메커니즘 + UNDO_RETENTION 기간 제약" 정답 근거 제거. NETWORK_LINK 운영 특성(기본 의미 + DIRECTORY 필수)으로 전환.
- [x] 정답/해설 논리 정합성: 정답 A(DB Link 경유 직접 Import 기본 의미) + C(DIRECTORY 필수 운영 전제) 모두 questions_json 09_002 수준(파라미터 존재·용도)과 일치. 오답 B·D·E는 고빈도 운영 오해 포인트 커버.
- [x] 원본 구조(5지선다 A-E, 복수정답 2つ) 유지.
- [x] 진단서의 P1 수정 방침(custom_09_007 C_09_031 FLASHBACK 축 제거)과 일관된 정책 적용. ch09 forbidden 경계 이슈 파일 2건(007·005) 모두 해소.
- [x] revision_log 기록 예정.
- [x] 평가 파일 applied/ 저장 완료.
