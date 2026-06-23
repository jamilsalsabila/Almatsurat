#!/usr/bin/env python3
import html
import json
import re
import sys
from pathlib import Path


UTHMANI_FONT_PATH = Path("/tmp/almatsurat_assets/KFGQPCUthmanicScriptHAFS.otf").resolve()
NASKH_FONT_PATH = Path("/tmp/almatsurat_assets/NotoNaskhArabic-Regular.ttf").resolve()
OUTPUT_DIR = Path("output/pdf")

TITLE_MAP = {
    "Al-Fatihah": "الفاتحة",
    "Al-Baqarah": "البقرة",
    "Al-Ikhlas": "الإخلاص",
    "Al-Falaq": "الفلق",
    "An-Naas": "الناس",
    "Ali Imran": "آل عمران",
    "At-Taubah": "التوبة",
    "Thoha": "طه",
    "Al-Isro": "الإسراء",
    "Al-Mu'minun": "المؤمنون",
    "Ar-Rum": "الروم",
    "Ghafir": "غافر",
    "Al-Hasyr": "الحشر",
    "Az-Zalzalah": "الزلزلة",
    "Al-Kafirun": "الكافرون",
    "An-Nashr": "النصر",
    "Al-Lahab": "المسد",
    "Al-Falaq": "الفلق",
    "Do'a Al-Matsurat": "دعاء المأثورات",
    "Do'a Robithoh": "دعاء الرابطة",
}

ARABIC_DIGITS = str.maketrans("0123456789", "٠١٢٣٤٥٦٧٨٩")

THEMES = {
    "sugro": {
        "title": "المأثورات الصغرى",
        "subtitle": "تنسيق A4 مع التفاف السطر داخل البطاقة مع الحفاظ على شكل الخط العربي",
        "bg_body": "#f4f7f6",
        "bg_card": "#ffffff",
        "text_primary": "#333333",
        "text_secondary": "#666666",
        "accent_color": "#0F3D3E",
        "accent_light": "#e0f2f1",
        "gold": "#c5a059",
        "border_color": "#e1e4e8",
        "arabic_color": "#000000",
        "shadow": "0 4px 15px rgba(0,0,0,0.05)",
    },
    "kubro": {
        "title": "المأثورات الكبرى",
        "subtitle": "نسخة A4 بألوان مختلفة مع التفاف السطور داخل كل بطاقة",
        "bg_body": "#f7f2ea",
        "bg_card": "#fffdf8",
        "text_primary": "#3f3428",
        "text_secondary": "#7c6856",
        "accent_color": "#7a3e2b",
        "accent_light": "#f0dfd3",
        "gold": "#b16a3f",
        "border_color": "#ead7c7",
        "arabic_color": "#1f1711",
        "shadow": "0 6px 18px rgba(122,62,43,0.08)",
    },
}


def clean_text(value: str) -> str:
    value = html.unescape(re.sub(r"<.*?>", " ", value, flags=re.S))
    return re.sub(r"\s+", " ", value).strip()


def to_arabic_digits(value: str) -> str:
    return value.translate(ARABIC_DIGITS)


def extract_cards(source: str) -> list[dict]:
    starts = list(re.finditer(r'<div class="zikir-card"[^>]*id="card-\d+"', source))
    cards = []

    for index, start in enumerate(starts):
        end = starts[index + 1].start() if index + 1 < len(starts) else len(source)
        card = source[start.start():end]

        title_match = re.search(r'<span class="card-title">\s*(.*?)\s*</span>', card, re.S)
        badge_match = re.search(r'<span class="badge-count">(.*?)</span>', card, re.S)
        body_block = card.split('<div class="counter-area"', 1)[0]
        body_match = re.search(r'<div class="card-body">(.*)', body_block, re.S)
        if not (title_match and badge_match and body_match):
            continue

        title_latin = clean_text(title_match.group(1))
        title_arabic = TITLE_MAP.get(title_latin, title_latin)
        count_match = re.search(r"(\d+)", clean_text(badge_match.group(1)))
        count_arabic = to_arabic_digits(count_match.group(1)) if count_match else ""
        body = body_match.group(1)

        entries = []

        for item in re.findall(r'<div class="arabic-quran text-center"[^>]*>(.*?)</div>', body, re.S):
            text = clean_text(item)
            if text:
                entries.append({"type": "basmallah", "text": text})

        verse_matches = re.findall(
            r'<span class="ayat-number">(.*?)</span>\s*<div class="arabic-quran">(.*?)</div>',
            body,
            re.S,
        )
        for ayat_label, arabic_text in verse_matches:
            ayat_match = re.search(r"(\d+)", clean_text(ayat_label))
            ayat_number = to_arabic_digits(ayat_match.group(1)) if ayat_match else ""
            text = clean_text(arabic_text)
            if text:
                entries.append({"type": "verse", "ayat": ayat_number, "text": text})

        if not entries:
            for item in re.findall(r'<div class="arabic-doa">(.*?)</div>', body, re.S):
                text = clean_text(item)
                if text:
                    entries.append({"type": "doa", "text": text})

        script_type = "quran" if any(item["type"] in {"verse", "basmallah"} for item in entries) else "doa"
        cards.append(
            {
                "title_arabic": title_arabic,
                "count_arabic": count_arabic,
                "entries": entries,
                "script_type": script_type,
            }
        )

    return cards


def render_cards_markup(cards: list[dict]) -> str:
    blocks = []
    for card in cards:
        parts = []
        for entry in card["entries"]:
            if entry["type"] == "verse":
                parts.append(
                    "<span class=\"segment verse\">"
                    f"<span class=\"arabic-text\">{html.escape(entry['text'])}</span>"
                    f"<span class=\"ayat-number\">{html.escape(entry['ayat'])}</span>"
                    "</span>"
                )
            elif entry["type"] == "basmallah":
                parts.append(
                    "<span class=\"segment basmallah\">"
                    f"<span class=\"arabic-text\">{html.escape(entry['text'])}</span>"
                    "</span>"
                )
            else:
                parts.append(
                    "<span class=\"segment doa\">"
                    f"<span class=\"arabic-text\">{html.escape(entry['text'])}</span>"
                    "</span>"
                )

        blocks.append(
            f"""
            <article class="zikir-card print-card">
              <div class="card-header">
                <span class="card-title arabic-meta">{html.escape(card['title_arabic'])}</span>
                <span class="badge-count arabic-meta">التكرار {html.escape(card['count_arabic'])}</span>
              </div>
              <div class="card-body single-line-body {card['script_type']}">
                <div class="reading-line">{''.join(parts)}</div>
              </div>
            </article>
            """
        )
    return "\n".join(blocks)


def build_html(cards: list[dict], theme: dict, doc_title: str) -> str:
    quran_font = UTHMANI_FONT_PATH.as_uri()
    naskh_font = NASKH_FONT_PATH.as_uri()
    cards_markup = render_cards_markup(cards)

    return f"""<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{html.escape(doc_title)}</title>
  <style>
    @font-face {{
      font-family: 'UthmaniFont';
      src: url('{quran_font}') format('opentype');
      font-display: swap;
    }}
    @font-face {{
      font-family: 'NaskhArabic';
      src: url('{naskh_font}') format('truetype');
      font-display: swap;
    }}
    :root {{
      --bg-body: {theme['bg_body']};
      --bg-card: {theme['bg_card']};
      --text-primary: {theme['text_primary']};
      --text-secondary: {theme['text_secondary']};
      --accent-color: {theme['accent_color']};
      --accent-light: {theme['accent_light']};
      --gold: {theme['gold']};
      --border-color: {theme['border_color']};
      --arabic-color: {theme['arabic_color']};
      --shadow: {theme['shadow']};
    }}
    * {{ box-sizing: border-box; }}
    html, body {{ margin: 0; padding: 0; background: var(--bg-body); color: var(--text-primary); }}
    body {{
      font-family: 'NaskhArabic', serif;
      padding: 10mm;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }}
    .page-title {{
      background: linear-gradient(135deg, var(--bg-card), color-mix(in srgb, var(--accent-light) 32%, white));
      border: 1px solid var(--border-color);
      border-radius: 18px;
      box-shadow: var(--shadow);
      margin-bottom: 16px;
      padding: 18px 20px;
      text-align: right;
      direction: rtl;
    }}
    .page-title h1 {{
      margin: 0 0 6px;
      color: var(--accent-color);
      font-size: 22px;
      line-height: 1.4;
    }}
    .page-title p {{ margin: 0; color: var(--text-secondary); font-size: 12px; }}
    .zikir-card {{
      background-color: var(--bg-card);
      border-radius: 18px;
      margin-bottom: 14px;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
      overflow: hidden;
      break-inside: avoid;
      page-break-inside: avoid;
    }}
    .card-header {{
      background: linear-gradient(90deg, var(--accent-light), color-mix(in srgb, var(--accent-light) 70%, white));
      padding: 11px 16px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      direction: rtl;
    }}
    .arabic-meta {{ font-family: 'NaskhArabic', serif; direction: rtl; }}
    .card-title {{ font-weight: 700; color: var(--accent-color); font-size: 18px; line-height: 1.2; }}
    .badge-count {{
      background: var(--gold);
      color: #fff;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 700;
      white-space: nowrap;
    }}
    .card-body {{ padding: 16px 18px 18px; }}
    .single-line-body.quran {{ font-family: 'UthmaniFont', 'NaskhArabic', serif; }}
    .single-line-body.doa {{ font-family: 'NaskhArabic', serif; }}
    .reading-line {{
      direction: rtl;
      text-align: right;
      unicode-bidi: plaintext;
      color: var(--arabic-color);
      font-size: 26px;
      line-height: 2.05;
      word-break: normal;
      overflow-wrap: anywhere;
    }}
    .segment {{ display: inline; }}
    .segment + .segment::before {{ content: " "; white-space: pre; }}
    .ayat-number {{
      display: inline-block;
      background: color-mix(in srgb, var(--border-color) 86%, white);
      color: var(--text-secondary);
      font-family: 'NaskhArabic', serif;
      font-size: 16px;
      padding: 2px 9px 1px;
      border-radius: 999px;
      margin: 0 8px 0 6px;
      vertical-align: middle;
      line-height: 1.35;
    }}
    @page {{ size: A4; margin: 10mm; }}
    @media print {{
      body {{ padding: 0; background: #fff; }}
    }}
  </style>
</head>
<body>
  <section class="page-title">
    <h1>{html.escape(theme['title'])}</h1>
    <p>{html.escape(theme['subtitle'])}</p>
  </section>
  {cards_markup}
</body>
</html>
"""


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("Usage: generate_almatsurat_pdf.py <html_path> <base_name> <theme>")

    html_path = Path(sys.argv[1])
    base_name = sys.argv[2]
    theme_name = sys.argv[3]
    theme = THEMES.get(theme_name)
    if theme is None:
        raise SystemExit(f"Unknown theme: {theme_name}")

    output_html = OUTPUT_DIR / f"{base_name}.html"
    output_pdf = OUTPUT_DIR / f"{base_name}.pdf"
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    source = html_path.read_text(encoding="utf-8")
    cards = extract_cards(source)
    html_output = build_html(cards, theme, base_name)
    output_html.write_text(html_output, encoding="utf-8")

    print(json.dumps({
        "cards": len(cards),
        "html": str(output_html),
        "pdf": str(output_pdf),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
