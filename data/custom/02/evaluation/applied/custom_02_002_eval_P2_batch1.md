# 수정 보고서: custom_02_002.json

- **작성일**: 2026-04-17
- **대상 평가파일**: customquestions_json/02/evaluation/custom_02_002_eval_P2_batch1.md
- **대상 문제파일**: customquestions_json/02/custom_02_002.json
- **총 수정제안**: 1건
- **수락**: 1건 / **거부**: 0건 / **부분수락**: 0건
- **배치**: P2 배치 1

---

## 제안별 판정

### [P2] C_02_008 — RMAN 백업 세부(Level 0/1·Backup Set vs Image Copy) Silver 상한 초과

- **판정**: ACCEPT
- **수정 근거**: 진단결과 `guide_files/20260417_진단결과/ch02_DB툴.md` §3 custom_02_002 항목에서 "C_02_008 → RMAN 기본 기능(기동/종료·백업/복구 도구) 수준으로 재출제 권장. Level 0/1, Backup Set vs Image Copy는 ch02 상한 초과"로 명시. 10번 §5 삭제 전 과도 항목 수준과 일치. ch02(5%)는 "도구 용도·특성 구분"이 출제 핵심이며, RMAN 복구 절차·백업 포맷 상세는 스코프 외. title·정답(A, C) 2지 복수정답 구조·5지선다 구조는 유지하고 선택지와 해설을 전면 재구성하여 도구 역할 관점으로 전환.

- **수정 전**:
  - title: "RMANのバックアップ機能について正しく述べているものを選択してください(2つ選択してください)。"
  - 주요 포인트: Level 0/1 구분 / Backup Set vs Image Copy 크기 / 블록 손상 자동 감지 / Unused Block Compression / Recovery Catalog 필수 여부
  - 정답: A(Level 0/1), C(블록 손상 감지)

- **수정 후**:
  - title: "Oracleが提供するツールとしてのRMANの役割について正しく述べているものを選択してください(2つ選択してください)。"
  - 선택지:
    - A) RMANはデータベースのバックアップおよびリカバリ専用のコマンドライン・ユーティリティである。 [정답]
    - B) RMANはデータベース作成のためのGUIツールであり、データベースのバックアップ機能は提供されない。
    - C) RMANではSQL*Plusと同様にデータベースの起動(STARTUP)および停止(SHUTDOWN)を実行することができる。 [정답]
    - D) RMANはOS認証に対応しておらず、接続時に必ずパスワード・ファイルを使用したユーザー認証が必要である。
    - E) RMANのバックアップ・メタデータを管理するためにはRecovery Catalogデータベースの構成が必須である。
  - 정답: A, C
  - 핵심 개념: RMAN=백업/복구 전용 CLI, STARTUP/SHUTDOWN 지원, OS 인증 가능, Recovery Catalog 선택. 도구 역할 관점 유지 (DBCA=생성, NETCA=리스너 등과 역할 분리).

---

## 미반영 사항

없음 (모든 제안 수락).

---

## Self-Review 체크리스트

- [x] forbidden_topics 침범 여부: ch02는 forbidden_topics 빈 배열. 수정 후 문제도 도구 역할 관점으로 RMAN 백업 알고리즘 상세 미포함.
- [x] Silver 상한(10번 §5 과도 항목) 회피: Level 0/1·Backup Set 크기 비교·Unused Block Compression 전부 제거.
- [x] 정답/해설 논리 정합성: 정답 A(RMAN=백업/복구 전용 CLI)와 C(STARTUP/SHUTDOWN 지원) 모두 study/03 및 questions_json 02_002 기준 정확. 오답 B/D/E 반박 근거도 study 기반.
- [x] title·정답 수·구조 유지(복수정답 2개).
- [x] revision_log 기록 예정.
- [x] 평가 파일 applied/ 직접 저장 완료.
