# 수정 보고서: custom_02_006.json

- **작성일**: 2026-04-17
- **대상 평가파일**: customquestions_json/02/evaluation/custom_02_006_eval_P2_batch1.md
- **대상 문제파일**: customquestions_json/02/custom_02_006.json
- **총 수정제안**: 2건
- **수락**: 2건 / **거부**: 0건 / **부분수락**: 0건
- **배치**: P2 배치 1

---

## 제안별 판정

### [P2] C_02_027 — RMAN RESTORE/RECOVER 복구 절차 상세 Silver 상한 초과

- **판정**: ACCEPT
- **수정 근거**: 진단결과 ch02_DB툴.md §3 custom_02_006 항목에서 "C_02_027 → RMAN의 도구적 역할과 SQL*Plus와의 차이점 관점으로 교체 권장. 복구 절차 상세는 ch02 스코프 초과"로 명시. 실버에서 RMAN은 "백업/복구 전용 도구"·"DB 기동/종료 가능" 수준이 상한이며, RESTORE→RECOVER→ALTER DATABASE OPEN 등 복구 절차 세부는 별도 복구 챕터 영역. title·정답 수·복수정답 5지선다 구조는 유지하고 선택지·해설을 도구 역할 비교 관점으로 재구성.

- **수정 전**:
  - title: "RMANにおけるRESTOREコマンドとRECOVERコマンドの役割について正しく述べているものを選択してください(2つ選択してください)。"
  - 주요 포인트: RESTORE(파일 복원)→RECOVER(Redo 적용) 절차 / MOUNT 상태 실행 조건 등
  - 정답: A(RESTORE 역할), B(RECOVER 역할)

- **수정 후**:
  - title: "RMANとSQL*Plusの役割の違いについて正しく述べているものを選択してください(2つ選択してください)。"
  - 선택지:
    - A) RMANはバックアップおよびリカバリ専用のツールであり、日常的なSQL問合せやデータ操作(DML)はSQL*Plusを使用する。 [정답]
    - B) SQL*PlusはRMANと同じくバックアップ・セットおよびイメージ・コピーの作成コマンドを備えているため、バックアップ作業をSQL*Plusで実行することも推奨されている。
    - C) RMANでもSQL*Plusでもデータベースの起動(STARTUP)および停止(SHUTDOWN)を実行することができる。 [정답]
    - D) RMANはSQL*Plusと異なりSYSBACKUP権限でのみ接続可能であり、SYSDBA権限では接続できない。
    - E) SQL*PlusはRMANが提供するブロック破損の自動検出機能を代替するため、RMANを使用せずSQL*Plusだけでバックアップを管理できる。
  - 정답: A, C
  - 핵심 개념: RMAN=백업/복구 전용, SQL*Plus=SQL 실행·일반 관리. 두 도구 모두 STARTUP/SHUTDOWN 지원, RMAN은 SYSDBA·SYSBACKUP 양쪽 접속 가능. 도구 역할 구분이 실버 핵심.

---

### [P2] C_02_030 — VALIDATE DATABASE + V$DATABASE_BLOCK_CORRUPTION 세부 Silver 상한 초과

- **판정**: ACCEPT
- **수정 근거**: 진단결과 ch02_DB툴.md §3 custom_02_006 항목에서 "C_02_030 → 도구 역할 관점 수준 문제로 교체. VALIDATE DATABASE + V$DATABASE_BLOCK_CORRUPTION은 questions_json에 없는 세부 사항"으로 명시. title·정답 수(단일정답)·4지선다 구조 유지하고 "Oracle 주요 도구 역할 분담"을 묻는 복합 툴 문제로 재구성. 이미 custom_02_005 C_02_021·024 계열의 "복합 툴 선택" 유형과 일관되어 ch02 실버 표준에 부합.

- **수정 전**:
  - title: "RMANのVALIDATEコマンドによるブロック破損検査について正しく述べているものを選択してください。"
  - 주요 포인트: VALIDATE DATABASE 동작 / V$DATABASE_BLOCK_CORRUPTION / BLOCKRECOVER 등
  - 정답: A(VALIDATE는 백업 없이 블록 검사만)

- **수정 후**:
  - title: "Oracleが提供する主要ツールの役割分担について正しく述べているものを選択してください。"
  - 선택지:
    - A) RMANはバックアップおよびリカバリ専用のツールであり、日常的なSQL実行や表領域作成などの一般的な管理作業はSQL*Plusを使用する。 [정답]
    - B) DBCAはデータベース作成・削除・構成変更に加えて、リスナーの新規作成機能も標準で提供するため、NETCAを使用する必要はない。
    - C) SQL Developerはデータベースの起動(STARTUP)および停止(SHUTDOWN)を実行できるため、SQL*PlusやRMANの代替として使用できる。
    - D) Enterprise Manager Cloud ControlはデータベースのSQL問合せ実行専用のツールであり、ホストOSやミドルウェアの監視機能は提供されない。
  - 정답: A
  - 핵심 개념: RMAN=백업/복구, SQL*Plus=SQL 실행·일반 관리, DBCA=생성/삭제, NETCA=리스너, SQL Developer=SQL 개발 GUI(기동/종료 불가), EM CC=통합 관리 플랫폼. 도구별 역할 매핑이 실버 핵심.

---

## 미반영 사항

없음 (모든 제안 수락).

---

## Self-Review 체크리스트

- [x] forbidden_topics 침범 여부: ch02는 forbidden_topics 빈 배열. 수정 후 문제들 모두 도구 역할 관점.
- [x] Silver 상한(10번 §5) 회피: RESTORE/RECOVER 절차·VALIDATE DATABASE·V$DATABASE_BLOCK_CORRUPTION·BLOCKRECOVER 전부 제거.
- [x] 정답/해설 논리 정합성: C_02_027 정답 A·C 모두 questions_json 02_002·02_004 도구 역할 기준 정확. C_02_030 정답 A는 Oracle 공식 도구 역할 구분에 부합.
- [x] title·정답 수 유지(C_02_027은 복수정답 2개·5지선다, C_02_030은 단일정답·4지선다).
- [x] revision_log 기록 예정.
- [x] 평가 파일 applied/ 직접 저장 완료.
