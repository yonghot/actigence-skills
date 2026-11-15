"""
사업계획서 자동 작성 헬퍼 함수 템플릿

이 파일은 스킬의 BOOTSTRAP 단계에서 프로젝트 루트에 _helpers.py로 복사된다.
python-docx 기반으로 docx 양식을 편집하는 유틸리티 함수 모음.
"""

try:
    from docx import Document
    from docx.oxml.ns import qn
    from docx.shared import Pt, RGBColor, Emu
    from lxml import etree
except ImportError:
    raise SystemExit("Missing packages. Install: python -m pip install python-docx lxml")
import json
import os
import re


# ═══════════════ 텍스트 조작 ═══════════════

def get_text(paragraph):
    """문단의 전체 텍스트를 반환"""
    return ''.join(run.text for run in paragraph.runs)


def clear_para(paragraph):
    """문단의 모든 run을 제거"""
    for run in paragraph.runs:
        run._element.getparent().remove(run._element)


def set_para_text(paragraph, text, bold=False, color="#000000", font_name="Pretendard", font_size=11):
    """문단에 단일 스타일 텍스트를 설정"""
    clear_para(paragraph)
    run = paragraph.add_run(text)
    run.font.name = font_name
    run.font.size = Pt(font_size)
    run.bold = bold
    if color:
        run.font.color.rgb = RGBColor.from_string(color.lstrip('#'))
    # Pretendard 적용 (East Asian font)
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find(qn('w:rFonts'))
    if rFonts is None:
        rFonts = etree.SubElement(rPr, qn('w:rFonts'))
    rFonts.set(qn('w:eastAsia'), font_name)
    # themeColor 제거
    _remove_theme_color(rPr)
    return run


def add_run_to_para(paragraph, text, bold=False, color="#000000", underline=False,
                     font_name="Pretendard", font_size=11):
    """문단에 run을 추가"""
    run = paragraph.add_run(text)
    run.font.name = font_name
    run.font.size = Pt(font_size)
    run.bold = bold
    if underline:
        run.underline = True
    if color:
        run.font.color.rgb = RGBColor.from_string(color.lstrip('#'))
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find(qn('w:rFonts'))
    if rFonts is None:
        rFonts = etree.SubElement(rPr, qn('w:rFonts'))
    rFonts.set(qn('w:eastAsia'), font_name)
    _remove_theme_color(rPr)
    return run


def set_para_mixed_runs(paragraph, runs_data):
    """
    문단에 복합 스타일 텍스트를 설정.
    runs_data: [{"text": str, "bold": bool, "color": str, "underline": bool(opt)}]
    모든 run에 w:sz val="22" (11pt), Pretendard 적용. word wrap만(강제 줄바꿈 금지).
    themeColor 속성 제거.
    ★ 텍스트에 \n이 포함되어 있으면 자동으로 공백으로 치환한다.
      \n이 있으면 텍스트가 페이지 오른쪽 끝까지 가지 않고 중간에서 끊긴다.
    """
    clear_para(paragraph)
    for rd in runs_data:
        text = rd.get("text", "").replace("\n", " ")  # ★ 강제 줄바꿈 제거
        bold = rd.get("bold", False)
        color = rd.get("color", "#000000")
        underline = rd.get("underline", False)
        add_run_to_para(paragraph, text, bold=bold, color=color,
                        underline=underline, font_name="Pretendard", font_size=11)


# ═══════════════ 표 셀 조작 ═══════════════

def clean_cell_before_write(cell):
    """
    셀에 내용을 기입하기 전에 호출한다.
    셀 안의 텍스트박스(mc:AlternateContent) XML 요소를 통째로 제거하고,
    기존 파란색 run을 제거하여 셀을 완전히 비운다.

    ★ 텍스트박스의 텍스트만 지우고 빈 껍데기를 남기면,
      새로 기입한 텍스트가 보이지 않는 박스 안에 갇혀서 오른쪽이 잘린다.
      반드시 mc:AlternateContent XML 요소 자체를 제거해야 한다.
    """
    blue_patterns = ['0000FF', '0047AB', '2E75B6', '4472C4']

    # 1. 텍스트박스(mc:AlternateContent) XML 요소 자체를 통째로 제거
    for alt in list(cell._element.iter(qn('mc:AlternateContent'))):
        alt.getparent().remove(alt)

    # 2. 파란색 run 제거
    for r in list(cell._element.iter(qn('w:r'))):
        rPr = r.find(qn('w:rPr'))
        if rPr is not None:
            color_elem = rPr.find(qn('w:color'))
            if color_elem is not None:
                val = color_elem.get(qn('w:val'), '').upper()
                if val in blue_patterns:
                    r.getparent().remove(r)


def set_cell_value(table, row, col, text, bold=False, color="#000000"):
    """표의 특정 셀에 텍스트를 설정. 기입 전 텍스트박스 잔존물을 자동으로 제거한다."""
    cell = table.cell(row, col)
    clean_cell_before_write(cell)  # ★ 텍스트박스 껍데기 + 파란색 run 제거
    text = text.replace("\n", " ")  # ★ 강제 줄바꿈 제거
    if cell.paragraphs:
        set_para_text(cell.paragraphs[0], text, bold=bold, color=color)
    return cell


def set_cell_mixed_runs(table, row, col, runs_data):
    """표의 특정 셀에 복합 스타일 텍스트를 설정. 기입 전 텍스트박스 잔존물을 자동으로 제거한다."""
    cell = table.cell(row, col)
    clean_cell_before_write(cell)  # ★ 텍스트박스 껍데기 + 파란색 run 제거
    if cell.paragraphs:
        set_para_mixed_runs(cell.paragraphs[0], runs_data)
    return cell


# ═══════════════ 안내문구 삭제 ═══════════════

def delete_all_notices(doc, target_chapters):
    """
    현재 패스 대상 챕터의 ※ 파란색 안내문구를 삭제한다.
    비작성 챕터의 ※는 유지한다.

    ★ 핵심: 표 셀 안의 텍스트박스 처리
      빈 텍스트박스가 셀에 남으면 보이지 않는 박스가 되어
      새로 기입한 텍스트가 그 박스를 피해 흐르면서 오른쪽이 들쭉날쭉해진다.
      반드시 텍스트박스 XML 요소 자체를 통째로 제거하여 셀을 완전히 비운다.

    텍스트박스가 존재하는 두 가지 형태:
      1) mc:AlternateContent 안에 w:txbxContent
      2) w:drawing(wp:anchor 또는 wp:inline) 안에 wps:txbx

    둘 다 XML 요소 자체를 제거해야 한다.
    """
    body = doc.element.body
    blue_patterns = ['0000FF', '0047AB', '2E75B6', '4472C4']

    # 1. mc:AlternateContent 텍스트박스 → XML 요소 자체 제거
    for alt in list(body.iter(qn('mc:AlternateContent'))):
        colors = alt.xpath('.//w:color/@w:val',
                          namespaces={'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'})
        texts = alt.xpath('.//w:t',
                         namespaces={'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'})
        has_blue = any(c.upper() in blue_patterns for c in colors)
        has_notice = any(t.text and '※' in t.text for t in texts)
        if has_blue or has_notice:
            alt.getparent().remove(alt)

    # 2. w:drawing 안 텍스트박스(wps:txbx) → w:drawing 요소 자체 제거
    #    wp:anchor/wp:inline 안에 wps:txbx가 있으면 텍스트박스 포함 drawing이다
    wps_ns = 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape'
    for drawing in list(body.iter(qn('w:drawing'))):
        txbx_list = drawing.findall('.//' + '{%s}txbx' % wps_ns)
        if txbx_list:
            # 파란색 또는 ※ 포함 여부 확인
            colors = drawing.xpath('.//w:color/@w:val',
                                  namespaces={'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'})
            texts = drawing.xpath('.//w:t',
                                namespaces={'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'})
            has_blue = any(c.upper() in blue_patterns for c in colors)
            has_notice = any(t.text and '※' in t.text for t in texts)
            if has_blue or has_notice:
                drawing.getparent().remove(drawing)

    # 3. 일반 문단/표 셀의 파란색 run 제거
    for element in list(body):
        _remove_blue_notices_from_element(element, blue_patterns)


def cleanup_all_remaining_notices(doc):
    """
    ST 완료 시 전용. 전체 문서에서 잔여 ※ 파란색 텍스트 + 표 안 텍스트박스를 일괄 제거.
    PS에서 남겨둔 비작성 챕터의 ※도 이 시점에서 전부 삭제.

    ★ 핵심: 텍스트박스(mc:AlternateContent)는 텍스트만 지우면 안 된다.
      XML 요소 자체를 통째로 제거하여 셀을 완전히 비운다.
      완료 후 파란색 텍스트 0건, 텍스트박스 잔존 0건이어야 한다.
    """
    body = doc.element.body
    blue_patterns = ['0000FF', '0047AB', '2E75B6', '4472C4']

    # 1. 모든 텍스트박스(mc:AlternateContent) 중 파란색 포함 → 제거
    for alt in list(body.iter(qn('mc:AlternateContent'))):
        texts = alt.xpath('.//w:t', namespaces={'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'})
        for t in texts:
            if t.text and '※' in t.text:
                alt.getparent().remove(alt)
                break

    # 2. 모든 문단/표 셀에서 파란색 run 제거
    for r in list(body.iter(qn('w:r'))):
        rPr = r.find(qn('w:rPr'))
        if rPr is not None:
            color_elem = rPr.find(qn('w:color'))
            if color_elem is not None:
                val = color_elem.get(qn('w:val'), '').upper()
                if val in blue_patterns:
                    r.getparent().remove(r)

    # 3. 잔여 텍스트박스(w:txbxContent) 중 파란색 포함 → 제거
    for txbx in list(body.iter(qn('w:txbxContent'))):
        colors = txbx.xpath('.//w:color/@w:val',
                           namespaces={'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'})
        for c in colors:
            if c.upper() in blue_patterns:
                # txbxContent의 최상위 컨테이너 제거
                parent = txbx.getparent()
                while parent is not None and parent.tag != qn('mc:AlternateContent'):
                    parent = parent.getparent()
                if parent is not None:
                    parent.getparent().remove(parent)
                break


def _remove_blue_notices_from_element(element, blue_patterns):
    """요소 내 파란색 ※ 안내문구를 제거하는 내부 함수"""
    for r in list(element.iter(qn('w:r'))):
        t = r.find(qn('w:t'))
        if t is not None and t.text and '※' in t.text:
            rPr = r.find(qn('w:rPr'))
            if rPr is not None:
                color_elem = rPr.find(qn('w:color'))
                if color_elem is not None:
                    val = color_elem.get(qn('w:val'), '').upper()
                    if val in blue_patterns:
                        r.getparent().remove(r)


# ═══════════════ 유틸리티 ═══════════════

def _remove_theme_color(rPr):
    """rPr에서 themeColor 속성을 제거"""
    color_elem = rPr.find(qn('w:color'))
    if color_elem is not None:
        for attr in ['themeColor', 'themeTint', 'themeShade']:
            if qn('w:' + attr[0].lower() + attr[1:]) in color_elem.attrib:
                del color_elem.attrib[qn('w:' + attr[0].lower() + attr[1:])]
            # camelCase 형태도 제거
            if attr in color_elem.attrib:
                del color_elem.attrib[attr]


def count_chars(doc):
    """문서의 총 문자 수를 반환"""
    total = 0
    for para in doc.paragraphs:
        total += len(get_text(para))
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for para in cell.paragraphs:
                    total += len(get_text(para))
    return total


def validate_chapter_length(doc, chapter_name, min_bullets=5):
    """챕터 내 ㅇ 대주제별 • 불렛 수를 검증"""
    # 구현: 챕터 범위를 찾고 각 ㅇ 뒤의 • 개수를 카운트
    issues = []
    # ... (프로젝트별 양식 구조에 맞게 구현)
    return issues


def verify_budget_total(doc, max_support):
    """사업비 합계가 최대 지원금과 일치하는지 검증"""
    # 구현: 사업비 표를 찾아 합계를 계산하고 max_support와 비교
    pass


def analyze_form_structure(doc_path):
    """
    양식 docx를 분석하여 구조 정보를 반환.
    Returns: {chapters[], tables{field_map}, page_limit, hints[]}
    field_map: 각 표의 "라벨 셀(제목)" → "값 셀(내용 기입 위치)" 좌표 매핑
    """
    doc = Document(doc_path)
    result = {
        'chapters': [],
        'tables': [],
        'field_map': {},
        'page_limit': 0,
        'hints': [],
        'chapter_guides': {}
    }

    # 챕터 식별
    for i, para in enumerate(doc.paragraphs):
        text = get_text(para).strip()
        if text.startswith('ㅇ') or re.match(r'^\d+\.', text):
            result['chapters'].append({'index': i, 'text': text})

    # 표 분석 + field_map 생성
    for t_idx, table in enumerate(doc.tables):
        table_info = {'index': t_idx, 'rows': len(table.rows), 'cols': len(table.columns), 'fields': {}}
        for r_idx, row in enumerate(table.rows):
            for c_idx, cell in enumerate(row.cells):
                cell_text = cell.text.strip()
                # ※ 안내문구가 있는 셀 = 값 셀
                if '※' in cell_text:
                    # 이 셀의 왼쪽 또는 위쪽에서 라벨 찾기
                    label = _find_label_for_cell(table, r_idx, c_idx)
                    if label:
                        table_info['fields'][label] = {'row': r_idx, 'col': c_idx, 'hint': cell_text}
                        result['field_map'][label] = {'table': t_idx, 'row': r_idx, 'col': c_idx}
                    result['chapter_guides'][f"table_{t_idx}_r{r_idx}_c{c_idx}"] = cell_text
        result['tables'].append(table_info)

    return result


def _find_label_for_cell(table, row, col):
    """값 셀에 대응하는 라벨 셀을 찾는다 (왼쪽 또는 위쪽)"""
    # 왼쪽 셀 확인
    if col > 0:
        left_text = table.cell(row, col - 1).text.strip()
        if left_text and '※' not in left_text:
            return left_text
    # 위쪽 셀 확인
    if row > 0:
        top_text = table.cell(row - 1, col).text.strip()
        if top_text and '※' not in top_text:
            return top_text
    return None


def set_hanging_indent(paragraph, left=1000, hanging=400):
    """문단에 hanging indent를 설정"""
    pPr = paragraph._element.get_or_add_pPr()
    ind = pPr.find(qn('w:ind'))
    if ind is None:
        ind = etree.SubElement(pPr, qn('w:ind'))
    ind.set(qn('w:left'), str(left))
    ind.set(qn('w:hanging'), str(hanging))
