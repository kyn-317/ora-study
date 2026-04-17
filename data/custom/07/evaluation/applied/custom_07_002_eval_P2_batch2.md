# 수정 보고서: custom_07_002.json

- **작성일**: 2026-04-17
- **대상 평가파일**: customquestions_json/07/evaluation/custom_07_002_eval_P2_batch2.md
- **대상 문제파일**: customquestions_json/07/custom_07_002.json
- **총 수정제안**: 1건
- **수락**: 1건 / **거부**: 0건 / **부분수락**: 0건
- **배치**: P2 배치 2

---

## 제안별 판정

### [P2] C_07_008 — AUTOALLOCATE/UNIFORM (ch06 경계) → HWM 결과 관점 (ch07 고유 개념)

- **판정**: ACCEPT
- **수정 근거**: 진단결과 `guide_files/20260417_진단결과/ch07_스토리지.md` §3 custom_07_002 항목에서 "C_07_008은 ch06 customquestions로 이동을 권고. 혹은 ch07 관점(세그먼트 공간 할당 워크플로우)으로 앵글을 재조정한다면 유지 가능하나, 현재 문제의 핵심 판별 포인트가 '익스텐트 크기 규칙(64K→1M→8M→64M)'으로 ch06 영역이다" 명시. 배치 명령서에서 "HWM·Extent 관리·Segment 유형 중 택1"로 앵글 변경 지정. HWM 결과 관점을 선택 — ch07 핵심 개념(questions_json 07_003 직결)이며 과도 항목(Low/High HWM 이중 구조) 회피 가능. custom_07_002 파일 내 C_07_006(TRUNCATE/DELETE HWM)과 상보적(C_07_006 = 명령어별 HWM 동작 / C_07_008 = HWM 경계와 Full Table Scan 관계).

- **수정 전**:
  - title: "ローカル管理表領域のエクステント管理方式であるAUTOALLOCATEとUNIFORMについて正しく述べているものを選択してください。"
  - 선택지 A: "AUTOALLOCATE方式では、エクステント・サイズが64KB→1MB→8MB→64MBのように段階的に増加し、Oracleが自動的にサイズを決定する。"
  - 선택지 B: "UNIFORM方式ではデフォルトのエクステント・サイズが8MBであり、変更することはできない。"
  - 선택지 C: "AUTOALLOCATE方式は一時表領域(TEMPORARY TABLESPACE)でのみ使用可能であり、永続表領域では使用できない。"
  - 선택지 D: "UNIFORM方式は常にAUTOALLOCATE方式よりも空間効率が高く、すべての用途で推奨される。"
  - 선택지 E: "ディクショナリ管理表領域でもAUTOALLOCATEおよびUNIFORM方式を使用することができる。"
  - 정답: A
  - 해설: AUTOALLOCATE 수치 단계·UNIFORM 1MB·딕셔너리 관리 서술 다수

- **수정 후**:
  - title: "セグメントのHigh Water Mark(HWM)と空間利用の関係について正しく述べているものを選択してください。" (ch06 경계 → ch07 고유 개념 HWM)
  - 선택지 A: "HWMはセグメント内で過去にデータが書き込まれた最高位置を示すブロック境界であり、Full Table ScanはHWMまでのブロックを読み取る。" (정답 — HWM 경계 정의 + Full Table Scan 결과)
  - 선택지 B: "HWMはSELECT文の実行ごとに再計算されるため、読み取り対象ブロック数はSELECT時点のデータ量に応じて動的に変化する。" (동적 재계산 오해 오답)
  - 선택지 C: "INSERT操作では、HWMは必ず上方に移動するため、同じブロックを再利用するINSERTは存在しない。" (ASSM 블록 재사용 미인지 오답)
  - 선택지 D: "DELETE文で大量のデータを削除すると、HWMは削除されたデータの量に応じて自動的に下方へ移動する。" (DELETE HWM 하향 오해 오답 — 대표적 착각)
  - 선택지 E: "HWMは常にセグメントの物理的な最終ブロック位置と一致しており、別個に管理されるメタデータは存在しない。" (물리 블록 위치 일치 오해 오답)
  - 정답: A (단일정답 유지)
  - 해설: HWM의 세그먼트 헤더 메타데이터 성격, Full Table Scan 읽기 범위, DELETE 미하향, TRUNCATE/SHRINK SPACE/ALTER TABLE MOVE로만 하향 가능, ASSM 비트맵 블록 재사용 서술 중심. Low HWM/High HWM 이중 구조(과도 항목) 회피.
  - 핵심 개념: "HWM은 세그먼트 내 데이터 기록 이력의 최고 위치를 추적하는 경계선으로, Full Table Scan의 읽기 범위를 결정합니다. DELETE로는 하향되지 않으며, TRUNCATE(초기화)·SHRINK SPACE(하향)·ALTER TABLE MOVE(재구성)로만 위치를 변경할 수 있습니다."

---

## 미반영 사항

없음 (모든 제안 수락).

---

## Self-Review 체크리스트

- [x] forbidden_topics 침범 여부: ch07 forbidden_topics 빈 배열. ch06 forbidden_topics 3번("Extent 할당 공식") 침범 우려를 해소 (AUTOALLOCATE 수치 전면 제거).
- [x] 챕터 경계: ch06(AUTOALLOCATE/UNIFORM) → ch07(HWM) 앵글 변경 완료. ch07 questions_json 07_003(SHRINK SPACE/HWM) 수준과 정합.
- [x] Silver 상한(10번 §5 과도 항목) 회피: Low HWM/High HWM 이중 구조 서술 회피. "HWM = 결과 경계선" 수준만 서술.
- [x] 정답/해설 논리 정합성: 정답 A는 HWM 경계 정의 + Full Table Scan 결과(ch07 questions_json 직결). B/C/D/E 오답 모두 HWM 관련 대표적 착각 포인트 커버.
- [x] 원본 구조(5지선다 A-E, 단일정답) 유지. 가이드라인 §3.3(단일정답=4개) 대비 구조적 불일치이나 P2 배치 2 범위("오답 교체" 한정)에서 원본 구조 변경 미실시. 차후 전면 정비 대상으로 별도 기록.
- [x] C_07_006(TRUNCATE/DELETE HWM 명령어별 동작)과 C_07_008(HWM 경계·Full Table Scan 관계)의 상보 관계 형성 — 동일 파일 내 다양성 향상.
- [x] revision_log 기록 예정.
- [x] 평가 파일 applied/ 저장 완료.
