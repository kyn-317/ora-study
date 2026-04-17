# 평가 결과: custom_02_002.json

- **평가일**: 2026-04-17
- **평가 대상**: customquestions_json/02/custom_02_002.json
- **챕터**: 02 — Oracle提供のデータベース・ツールの採用 (5%)
- **문제 수**: 1문제 (C_02_008) — 배치 범위 내 대상
- **상태**: 반영완료 (applied)
- **배치**: P2 배치 1

---

## 종합 점수

| 문제번호 | 기술적 정확성 | 난이도 적합성 | 형식 일관성 | 해설 품질 | 오답 매력도 | 종합 | 판정 | Q1/Q2/Q3 | Drift Flag |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|------|:--------:|:----------:|
| C_02_008 | 10/10 | 6/10 | 10/10 | 9/10 | 8/10 | 8.6 | NEEDS_REVISION | Q2 | - |

**주요 이슈**: RMAN 증분 백업 Level 0/1, Backup Set vs Image Copy 크기 비교, Unused Block Compression 등 RMAN 백업 메커니즘 세부가 questions_json 02_002 상한(RMAN의 도구적 역할·기동/종료 기능)을 초과. 10번 §5 삭제 전 과도 항목 수준. ch02(5%) 저비중 챕터에서는 "도구 용도·특성 구분"이 출제 핵심.

---

## 상세 평가

### C_02_008 — RMAN 백업 기능 (Level 0/1, Backup Set vs Image Copy)

**forbidden_topics 침범 검사** (ch02 topic_stats.forbidden_topics 대비)
- 침범 여부: NO (ch02는 forbidden_topics 빈 배열)
- 자동 REWRITE 대상 아님

**기술적 정확성 (10/10)**
- Level 0/1 구분·Unused Block Compression·Backup Set 다중화·Recovery Catalog 선택 여부 모두 정확
- 기술적 오류는 없음

**난이도 적합성 (6/10)**
- 개념 선정표 기준: 운영-개념, 기본/중급
- 실제 문제 수준: RMAN 백업 메커니즘 세부 상세 — questions_json 02_002 수준(도구 기능·역할) 초과
- ch02는 5% 저비중 챕터로 Silver 상한이 "도구 용도·특성"이며, RMAN 백업 포맷 비교·증분 백업 구조는 별도 복구 챕터 영역

**형식 일관성 (10/10)**
- 복수정답 표기 `(2つ選択してください)` 포함
- 5지선다 구조 적합

**해설 품질 (9/10)**
- 정답/오답 근거 명확

**오답 매력도 (8/10)**
- 혼동 유발 수준 적합

**Drift Flag**
- topic 레이블: RMAN (custom_topic_counts 7/31 = 22.6%, original 1/6 = 16.7%, drift +5.9%)
- flag 상태: 무 (drift_threshold_pct 15% 미만)

**수정 제안**
- [P2] C_02_008 — RMAN 기본 기능 및 SQL*Plus 대비 도구 역할 관점으로 재출제. Level 0/1, Backup Set vs Image Copy, Unused Block Compression 상세 제거. RMAN=백업/복구 전용 CLI 도구, STARTUP/SHUTDOWN 지원, OS 인증 가능, Recovery Catalog 선택 수준으로 정리.
