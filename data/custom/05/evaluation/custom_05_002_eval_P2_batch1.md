# 평가 결과: custom_05_002.json

- **평가일**: 2026-04-17
- **평가 대상**: customquestions_json/05/custom_05_002.json
- **챕터**: 05 — ユーザー、ロールおよび権限の管理 (10%)
- **문제 수**: 1문제 (C_05_006) — 배치 범위 내 대상
- **상태**: 반영완료 (applied)
- **배치**: P2 배치 1

---

## 종합 점수

| 문제번호 | 기술적 정확성 | 난이도 적합성 | 형식 일관성 | 해설 품질 | 오답 매력도 | 종합 | 판정 | Q1/Q2/Q3 | Drift Flag |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|------|:--------:|:----------:|
| C_05_006 | 9/10 | 7/10 | 9/10 | 7/10 | 8/10 | 8.0 | NEEDS_REVISION | Q2 | - |

**주요 이슈**: 정답 D와 선택지 구조는 실버 적합. 다만 오답 A의 해설에서 "ORACLE_MAINTAINED='Y'인 Oracle 유지 관리 계정 자동 제외"라는 DBA_USERS 내부 컬럼명을 직접 노출 — 원래 문제 포인트(DATABASE 유형 동시 1개만 활성화)보다 상세 수준이 높음. 해설 완화만 요구되며 선택지·정답은 그대로 유지.

---

## 상세 평가

### C_05_006 — DBMS_PRIVILEGE_CAPTURE DATABASE 유형 제한

**forbidden_topics 침범 검사** (ch05 topic_stats.forbidden_topics 대비)
- 침범 여부: NO (ch05는 forbidden_topics 빈 배열)

**기술적 정확성 (9/10)**
- D 정답(객체 소유자의 자기 스키마 접근 캡처 제외) 정확
- A 오답 근거(ORACLE_MAINTAINED='Y' 자동 제외) 정확하나 실버 범위 대비 상세 수준 높음

**난이도 적합성 (7/10)**
- DBMS_PRIVILEGE_CAPTURE DATABASE 유형 동시 1개만 활성화 포인트는 questions_json 05_007 권한분석 수준 적합
- 해설에 내부 컬럼명(ORACLE_MAINTAINED) 노출은 실버 상한 경계

**형식 일관성 (9/10)**
- 단일정답 4지선다 적합

**해설 품질 (7/10)**
- 전반적으로 명확하나 A 오답 해설의 "ORACLE_MAINTAINED='Y'" 컬럼값 레벨 노출은 DBA_USERS 내부 세부 정보로 경계선

**오답 매력도 (8/10)**
- 혼동 유발 수준 적합

**Drift Flag**
- topic 레이블: 권한분석(DBMS_PRIVILEGE_CAPTURE) (custom 3/52 ≈ 5.8%, original 1/7 ≈ 14.3%, drift -8.5%, flag 무)

**수정 제안**
- [P2] C_05_006 — 해설의 A 오답 근거에서 ORACLE_MAINTAINED='Y' 컬럼명·값 직접 언급 제거하고 "SYS·SYSTEM 등 Oracle 내부 계정 자동 제외"로 요약. 정답/오답 구조와 title은 그대로 유지.
