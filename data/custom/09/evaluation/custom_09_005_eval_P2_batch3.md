# 평가 결과: custom_09_005.json

- **평가일**: 2026-04-17
- **평가 대상**: customquestions_json/09/custom_09_005.json
- **챕터**: 09 — データの移動
- **문제 수**: 5문제 (C_09_021 ~ C_09_025)
- **상태**: 반영완료 (applied)
- **배치**: P2 배치 3 (마지막)

---

## 종합 점수

| 문제번호 | 기술적 정확성 | 난이도 적합성 | 형식 일관성 | 해설 품질 | 오답 매력도 | 종합 | 판정 | Q1/Q2/Q3 | Drift Flag |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|------|:--------:|:----------:|
| C_09_021 | 10/10 | 9/10 | 10/10 | 10/10 | 9/10 | 9.6 | PASS | Q1 | - |
| C_09_022 | 10/10 | 9/10 | 10/10 | 10/10 | 9/10 | 9.6 | PASS | Q1 | - |
| C_09_023 | 10/10 | 9/10 | 10/10 | 10/10 | 9/10 | 9.6 | PASS | Q1 | - |
| C_09_024 | 10/10 | 9/10 | 10/10 | 10/10 | 9/10 | 9.6 | PASS | Q1 | - |
| C_09_025 | 9/10 | 6/10 | 10/10 | 8/10 | 8/10 | 8.2 | NEEDS_REVISION | Q3 (forbidden_topic 경계) | forbidden#11 FLASHBACK_TIME 정답 축 |

---

## 상세 평가 (수정 대상)

### C_09_025 — NETWORK_LINK + FLASHBACK_TIME 복수 조합 (forbidden_topics 경계)

**forbidden_topics 침범 검사**
- 침범 여부: YES (ch09 forbidden_topics #11 "FLASHBACK_SCN/FLASHBACK_TIME 시점 일관성 내부 메커니즘" 경계)
- 원본에서 FLASHBACK_TIME이 복수정답 중 하나(C 옵션)의 핵심 주제로 포함되어 있으며 "Undo Retention 기간 내 시점이면 사용 가능"이라는 메커니즘 이해를 요구

**기술적 정확성 (9/10)**
- NETWORK_LINK의 DB Link 경유 동작, FLASHBACK_TIME의 Undo 기반 시점 일관성, 변환 파라미터 병행 사용, DIRECTORY 필요 사실 모두 정확

**난이도 적합성 (6/10)**
- 진단 결과(ch09_데이터이동.md §3 custom_09_005): "C_09_025가 FLASHBACK_TIME을 정답 선택지(C)의 핵심 주제로 다룸. 10_심도분석 §5 항목 14번 '존재 여부만 인지' 수준을 초과하여 'Undo 정보 활용 메커니즘 + UNDO_RETENTION 기간 내 제약'을 정답 근거로 요구. questions_json에 FLASHBACK_TIME 관련 문제 없음"
- 수정방향: "C_09_025의 C 선택지를 NETWORK_LINK의 부가 특성(로그파일용 DIRECTORY 여전히 필요)으로 교체하거나, FLASHBACK_TIME 중심 축을 '파라미터 존재 여부'를 묻는 오답 구성으로 전환할 것"
- 배치 명령서: "NETWORK_LINK+FLASHBACK_TIME 복수 조합 상세 → 간소화 (기본 의미+Undo 기간 제약 1개만 유지)"

**수정 제안**
- [P2] C_09_025 — FLASHBACK_TIME 정답 축 제거, NETWORK_LINK 중심으로 간소화
  - 근거: guide_files/20260417_진단결과/ch09_데이터이동.md §3 custom_09_005(Q3 경계) 수정방향 명시. 진단에서 제안된 "NETWORK_LINK의 부가 특성(로그파일용 DIRECTORY 여전히 필요)으로 교체" 옵션 채택.
  - 방향: title 변경 — "NETWORK_LINK + FLASHBACK_TIME 파라미터" 복수 초점 → "NETWORK_LINK 파라미터 사용" 단독 초점. 정답 2개는 (A) 덤프 파일 없이 DB Link 경유 직접 Import + (C) 로그 파일용 DIRECTORY 여전히 필요라는 운영 사실로 축소. 오답은 변환 파라미터 병행 불가 오해(B), Import 중 DML 반영 오해(D), Export 전용 오해(E)로 구성. FLASHBACK_TIME 언급 완전 제거.

---

## 총평

custom_09_005 파일의 5문제 중 C_09_025만 NEEDS_REVISION(Q3 경계)이며 나머지 C_09_021·022·023·024는 PASS(Q1).
C_09_025는 FLASHBACK_TIME을 정답 축에서 제거하고 NETWORK_LINK의 운영 특성(DB Link 경유 + DIRECTORY 필수)만으로 축소하여 forbidden_topic 경계 이슈 해소.

배치 3에서 ACCEPT 처리.
