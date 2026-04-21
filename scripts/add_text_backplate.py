#!/usr/bin/env python3
"""
모든 SVG 시각자료 파일의 텍스트에 반투명 다크 백플레이트 필터를 추가한다.

SVG filter(feFlood + feMerge) 방식을 사용해 텍스트 bounding box 기준으로
자동으로 백플레이트 크기가 결정되므로 각 텍스트 길이를 계산할 필요가 없다.
"""

import re
from pathlib import Path

SVG_ROOT = Path(__file__).parent.parent / "public" / "visuals"

FILTER_DEF = (
    '\n    <filter id="label-bg" x="-4%" y="-30%" width="108%" height="160%">'
    '\n      <feFlood flood-color="#0d0d1a" flood-opacity="0.65" result="bg"/>'
    '\n      <feMerge>'
    '\n        <feMergeNode in="bg"/>'
    '\n        <feMergeNode in="SourceGraphic"/>'
    '\n      </feMerge>'
    '\n    </filter>'
)

CSS_RULE = "\n    text { filter: url(#label-bg); }"


def process_svg(path: Path) -> bool:
    content = path.read_text(encoding="utf-8")

    if 'id="label-bg"' in content:
        return False  # 이미 처리됨

    # 1. filter 정의를 <defs> 안에 삽입
    if "<defs>" in content:
        content = content.replace("<defs>", "<defs>" + FILTER_DEF, 1)
    else:
        # <defs>가 없으면 <svg ...> 여는 태그 바로 뒤에 생성
        content = re.sub(
            r"(<svg[^>]*>)",
            r"\1\n  <defs>" + FILTER_DEF.strip() + r"\n  </defs>",
            content,
            count=1,
        )

    # 2. CSS 규칙을 </style> 앞에 삽입
    if "</style>" in content:
        content = content.replace("</style>", CSS_RULE + "\n  </style>", 1)

    path.write_text(content, encoding="utf-8")
    return True


def main():
    svg_files = sorted(SVG_ROOT.rglob("*.svg"))
    if not svg_files:
        print(f"SVG 파일을 찾지 못했습니다: {SVG_ROOT}")
        return

    processed, skipped = 0, 0
    for svg_path in svg_files:
        if process_svg(svg_path):
            processed += 1
            print(f"  OK {svg_path.relative_to(SVG_ROOT.parent.parent)}")
        else:
            skipped += 1

    print(f"\n완료: {processed}개 처리, {skipped}개 스킵(이미 적용됨)")


if __name__ == "__main__":
    main()
