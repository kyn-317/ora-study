# 수정 보고서: custom_06_005.json

- **작성일**: 2026-04-17
- **대상 평가파일**: customquestions_json/06/evaluation/custom_06_005_eval_P2_batch2.md
- **대상 문제파일**: customquestions_json/06/custom_06_005.json
- **총 수정제안**: 1건
- **수락**: 1건 / **거부**: 0건 / **부분수락**: 0건
- **배치**: P2 배치 2

---

## 제안별 판정

### [P2] C_06_024 — AUTOALLOCATE 수치 단계 암기 → Oracle 자동 결정 원칙 중심

- **판정**: ACCEPT
- **수정 근거**: 진단결과 `guide_files/20260417_진단결과/ch06_테이블스페이스.md` §3 custom_06_005 항목에서 "A 선택지에서 단계 수치를 삭제하고 'Oracleがサイズを自動決定してセグメント成長に対応する' 수준으로 단순화" 명시. §4.5 우선 조치 P3. topic_stats.forbidden_topics 3번 항목 "Extent 할당 공식(AUTOALLOCATE 수치: 64K/1M/8M/64M 임계)"을 핵심 설명으로 활용하는 것은 명확한 침범. title·정답(A) 유지, A 선택지와 C 선택지(UNIFORM 자동 증가 오해)·해설을 결과·원칙 중심으로 재구성.

- **수정 전**:
  - title: "Oracle AI Databaseの論理的ストレージ構造において、エクステント(Extent)の**内部動作**について正しく述べているものを選択してください。"
  - 선택지 A: "AUTOALLOCATEの管理方式では、エクステント・サイズは**64KB、1MB、8MB、64MB**の段階で自動的に増加し、セグメントの成長に応じてOracleがサイズを決定する。"
  - 선택지 C: "UNIFORM管理方式ではエクステント・サイズが自動的に増加するため、大規模なセグメントほど効率的な空間管理が行われる。"
  - 해설 A: "...AUTOALLOCATE 익스텐트 관리 방식에서는 Oracle이 세그먼트의 성장에 따라 익스텐트 크기를 **64KB → 1MB → 8MB → 64MB 단계**로 자동 증가시킵니다..."
  - 해설 C: "...자동으로 크기가 증가하는 것은 AUTOALLOCATE 방식의 특성이며..."
  - 핵심 개념: "AUTOALLOCATE는 **64KB→1MB→8MB→64MB로 자동 증가**하며, UNIFORM은 고정 크기입니다..."

- **수정 후**:
  - title: "Oracle AI Databaseのローカル管理表領域におけるエクステント(Extent)管理について正しく述べているものを選択してください。" (内部動作 → 관리 중심으로 변경)
  - 선택지 A: "AUTOALLOCATE方式では、Oracleがセグメントの成長状況に応じてエクステント・サイズを自動的に決定するため、DBAがサイズを指定する必要がない。" (수치 제거, 자동 결정 원칙 중심)
  - 선택지 C: "UNIFORM管理方式ではエクステント・サイズがセグメントの成長に応じて自動的に増加するため、AUTOALLOCATEと実質的に同じ動作をする。" (자동 증가 = AUTOALLOCATE와 동일 오해 오답으로 재편)
  - 해설 A: "AUTOALLOCATE 익스텐트 관리 방식에서는 Oracle이 세그먼트의 성장 상황에 따라 익스텐트 크기를 자동으로 결정합니다. DBA가 사이즈를 지정하지 않아도 Oracle이 세그먼트 크기에 적합한 익스텐트를 동적으로 할당하여 공간 낭비와 관리 오버헤드를 최소화합니다. 이는 UNIFORM 방식이 고정 크기 지정을 필요로 하는 것과 대비되는 특성입니다." (수치 전면 제거, 자동 결정 원칙으로 교체)
  - 해설 C: "UNIFORM 관리 방식에서는 모든 익스텐트가 CREATE TABLESPACE 시 지정한 동일한 크기(기본 1MB)로 할당됩니다. 세그먼트 성장에 따라 크기가 자동으로 증가하는 것은 AUTOALLOCATE 방식의 고유 특성이며, 두 방식은 동작 원칙이 명확히 다릅니다..." (UNIFORM 고정 + 사용자 지정 원칙 강조, 수치는 기본 1MB만 남김)
  - 핵심 개념: "AUTOALLOCATE는 Oracle이 크기를 자동 결정하고, UNIFORM은 사용자 지정 고정 크기(기본 1MB)를 사용한다는 것이 원칙적인 차이..." (수치 단계 암기 제거)
  - B/D 선택지·오답 해설: 그대로 유지 (수치와 무관)
  - 정답: A (유지)

---

## 미반영 사항

없음 (모든 제안 수락).

---

## Self-Review 체크리스트

- [x] forbidden_topics 침범 여부: ch06 forbidden_topics 3번("Extent 할당 공식(AUTOALLOCATE 수치)") 침범이던 A 선택지·해설의 수치 단계(64KB/1MB/8MB/64MB)를 전면 제거. 수정 후 침범 해소.
- [x] Silver 상한: "AUTOALLOCATE = Oracle 자동 결정, UNIFORM = 사용자 지정 고정 크기"라는 원칙만 묻는 수준으로 완화.
- [x] 정답/해설 논리 정합성: 정답 A 유지. C 선택지를 "UNIFORM 자동 증가 = AUTOALLOCATE와 동일" 오해 오답으로 재구성하여 AUTOALLOCATE/UNIFORM 구분 교육 포인트 강화.
- [x] 단일정답 4지선다 구조 유지.
- [x] title은 "内部動作" → "エクステント管理"로 경미한 조정 (내부 메커니즘 뉘앙스 제거).
- [x] UNIFORM 기본 1MB는 questions_json 06 chapter 수준 내 허용되는 기본값 정보 (수치 단계 암기와 구분).
- [x] revision_log 기록 예정.
- [x] 평가 파일 applied/ 저장 완료.
