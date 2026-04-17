# 수정 보고서: custom_05_002.json

- **작성일**: 2026-04-17
- **대상 평가파일**: customquestions_json/05/evaluation/custom_05_002_eval_P2_batch1.md
- **대상 문제파일**: customquestions_json/05/custom_05_002.json
- **총 수정제안**: 1건
- **수락**: 1건 / **거부**: 0건 / **부분수락**: 0건
- **배치**: P2 배치 1

---

## 제안별 판정

### [P2] C_05_006 — 해설 내 ORACLE_MAINTAINED 컬럼명 직접 노출 완화

- **판정**: ACCEPT
- **수정 근거**: 진단결과 `guide_files/20260417_진단결과/ch05_사용자권한.md` §3 custom_05_002 항목에서 "C_05_006 해설에서 ORACLE_MAINTAINED='Y' 상세 제거하고 'SYS/SYSTEM 등 Oracle 내부 계정 자동 제외'로 요약 처리"로 명시. 문제 자체(DATABASE 유형 동시 1개만 활성화·객체 소유자 자기 스키마 접근 제외)는 questions_json 05_007 권한분석 수준으로 실버 적합. 다만 해설 내 내부 컬럼명·값 수준 노출은 Silver 상한 경계. title·선택지·정답(D)은 유지하고 오답 A의 해설과 핵심 개념 마무리만 수정.

- **수정 전** (해설 일부):
  - "A) 오답 — DATABASE 유형의 캡처라 하더라도 ORACLE_MAINTAINED='Y'인 Oracle 유지 관리 계정(SYS, SYSTEM 등)의 권한 사용은 자동으로 제외됩니다. Oracle 내부 동작에 의한 권한 사용은 사용자 권한 분석과 무관하므로 노이즈 제거 목적으로 제외합니다."
  - "핵심 개념: DBMS_PRIVILEGE_CAPTURE의 DATABASE 유형 캡처는 Oracle 유지 관리 계정(ORACLE_MAINTAINED='Y')을 자동 제외하며, 객체 소유자의 자기 스키마 접근은 암묵적 권한이므로 캡처 대상이 아닙니다."

- **수정 후** (해설 일부):
  - "A) 오답 — DATABASE 유형의 캡처라 하더라도 SYS·SYSTEM 등 Oracle 내부 계정은 권한 분석 대상에서 자동으로 제외됩니다. Oracle 내부 동작에 의한 권한 사용은 사용자 권한 분석과 무관하므로 노이즈 제거를 위해 제외되며, 운영자가 일일이 설정할 필요는 없습니다."
  - "핵심 개념: DBMS_PRIVILEGE_CAPTURE의 DATABASE 유형 캡처는 SYS·SYSTEM 등 Oracle 내부 계정을 자동으로 제외하며, 객체 소유자의 자기 스키마 접근은 암묵적 권한이므로 캡처 대상이 아닙니다."
  - 제거: `ORACLE_MAINTAINED='Y'` 직접 언급 2곳

---

## 미반영 사항

없음 (모든 제안 수락).

---

## Self-Review 체크리스트

- [x] forbidden_topics 침범 여부: ch05는 forbidden_topics 빈 배열. 수정 후 ORACLE_MAINTAINED 컬럼명 제거.
- [x] Silver 상한 회피: DBA_USERS 내부 컬럼명·값 레벨 언급 완전 제거. "SYS/SYSTEM 등 Oracle 내부 계정 자동 제외"라는 결과 중심 서술로 완화.
- [x] 정답/해설 논리 정합성: 정답 D(객체 소유자 자기 스키마 접근 캡처 제외)는 그대로 유지. 오답 A가 여전히 틀렸다는 근거도 유지(SYS·SYSTEM 자동 제외 → DATABASE 유형이 '전체' 권한 분석을 하지 않음).
- [x] title·선택지·정답 완전 유지 (해설만 교체).
- [x] revision_log 기록 예정.
- [x] 평가 파일 applied/ 직접 저장 완료.
