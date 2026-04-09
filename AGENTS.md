<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Study 데이터 작업 규칙

study 파일(`data/study/`)의 keywords 배열을 변경(추가/삭제)할 때는
반드시 대응하는 keyword-study 파일(`data/keyword-study/`)도 동시에 갱신해야 한다.
작업 완료 후 감사 스크립트로 missing=0을 확인한다.
상세 절차는 docs/KEYWORD_STUDY_GUIDE.md 참조.

# 시각자료(Visual Aids) 작업 규칙

study JSON 파일에 `visuals` 배열을 추가할 때는 반드시 다음을 준수한다:
1. SVG/HTML 파일은 `public/visuals/{chapterId}/` 에 저장
2. 파일명: `{studyId}_{sectionId}_{영문설명}.{ext}` (예: `01_01_s02_buffer_cache.svg`)
3. SVG는 다크테마 호환 (transparent 배경, 텍스트 #E2E8F0)
4. JSON의 `visuals[].src` 경로가 실제 파일과 일치하는지 확인
5. 상세 절차는 `guide_files/시각자료_생성_가이드라인.md` 참조.
