<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Study 데이터 작업 규칙

study 파일(`data/study/`)의 keywords 배열을 변경(추가/삭제)할 때는
반드시 대응하는 keyword-study 파일(`data/keyword-study/`)도 동시에 갱신해야 한다.
작업 완료 후 감사 스크립트로 missing=0을 확인한다.
상세 절차는 docs/KEYWORD_STUDY_GUIDE.md 참조.
