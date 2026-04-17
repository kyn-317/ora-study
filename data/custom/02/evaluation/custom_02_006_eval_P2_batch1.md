# 평가 결과: custom_02_006.json

- **평가일**: 2026-04-17
- **평가 대상**: customquestions_json/02/custom_02_006.json
- **챕터**: 02 — Oracle提供のデータベース・ツールの採用 (5%)
- **문제 수**: 2문제 (C_02_027, C_02_030) — 배치 범위 내 대상
- **상태**: 반영완료 (applied)
- **배치**: P2 배치 1

---

## 종합 점수

| 문제번호 | 기술적 정확성 | 난이도 적합성 | 형식 일관성 | 해설 품질 | 오답 매력도 | 종합 | 판정 | Q1/Q2/Q3 | Drift Flag |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|------|:--------:|:----------:|
| C_02_027 | 10/10 | 6/10 | 10/10 | 9/10 | 8/10 | 8.6 | NEEDS_REVISION | Q2 | - |
| C_02_030 | 9/10 | 6/10 | 10/10 | 9/10 | 8/10 | 8.4 | NEEDS_REVISION | Q2 | - |

**주요 이슈**: C_02_027 — RMAN RESTORE→RECOVER 복구 절차 상세가 questions_json 02_002(RMAN 도구적 역할·기동/종료) 상한 초과. RMAN 복구 절차 세부는 ch03 Managing Instances 또는 별도 복구 챕터 영역. C_02_030 — VALIDATE DATABASE + V$DATABASE_BLOCK_CORRUPTION 뷰 직접 출제는 questions_json에 없는 세부 사항.

---

## 상세 평가

### C_02_027 — RMAN RESTORE vs RECOVER 명령 역할

**forbidden_topics 침범 검사**
- 침범 여부: NO (ch02는 forbidden_topics 빈 배열)

**기술적 정확성 (10/10)**
- RESTORE/RECOVER 명령 순서와 역할 구분, MOUNT/OPEN 상태 구분 모두 정확

**난이도 적합성 (6/10)**
- 개념 선정표 기준: 운영-개념, 기본/중급
- 실제 수준: 복구 절차 세부(RESTORE→RECOVER→ALTER DATABASE OPEN)는 questions_json 02_002 "RMAN 도구 기능" 수준 초과
- ch02 스코프 초과. 실버에서 RMAN은 "백업/복구 전용 도구"·"DB 기동/종료 가능" 수준이 상한

**형식 일관성 (10/10)**
- 복수정답 표기 `(2つ選択してください)` 포함

**해설 품질 (9/10)**
- 각 명령 역할 근거 명확

**오답 매력도 (8/10)**
- 혼동 유발 수준 적합

**Drift Flag**
- topic 레이블: RMAN (7/31 = 22.6%, original 16.7%, drift +5.9%, flag 무)

**수정 제안**
- [P2] C_02_027 — RMAN과 SQL*Plus 도구 역할 비교 관점으로 재출제. RESTORE/RECOVER 명령 상세 제거. RMAN=백업/복구, SQL*Plus=SQL 실행과 일반 관리, STARTUP/SHUTDOWN 양쪽 지원, SYSDBA/SYSBACKUP 양쪽 접속 가능 수준으로 재구성.

---

### C_02_030 — RMAN VALIDATE DATABASE + V$DATABASE_BLOCK_CORRUPTION

**forbidden_topics 침범 검사**
- 침범 여부: NO

**기술적 정확성 (9/10)**
- VALIDATE DATABASE 동작·V$DATABASE_BLOCK_CORRUPTION 뷰 정확

**난이도 적합성 (6/10)**
- VALIDATE+V$DATABASE_BLOCK_CORRUPTION은 questions_json에 없는 세부 사항
- ch02 상한 초과. BLOCKRECOVER 명령 언급도 복구 챕터 영역

**형식 일관성 (10/10)**
- 단일정답 4지선다 적합

**해설 품질 (9/10)**
- 해설 근거 명확

**오답 매력도 (8/10)**
- 혼동 유발 수준 적합

**Drift Flag**
- topic 레이블: RMAN (위와 동일, flag 무)

**수정 제안**
- [P2] C_02_030 — Oracle 주요 도구(RMAN·SQL*Plus·DBCA·NETCA·SQL Developer·EM Cloud Control) 역할 분담 관점으로 재출제. VALIDATE DATABASE 세부 제거. 도구별 담당 영역 매핑(RMAN=백업/복구, DBCA=생성, NETCA=리스너, SQL Developer=SQL 개발 GUI, EM CC=통합 관리)을 묻는 복합 툴 문제로 재구성.
