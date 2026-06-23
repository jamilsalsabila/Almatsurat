#!/usr/bin/env python3
import html
import json
import re
import sys
from pathlib import Path


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
    "Do'a Al-Matsurat": "دعاء المأثورات",
    "Do'a Robithoh": "دعاء الرابطة",
}

ARABIC_DIGITS = str.maketrans("0123456789", "٠١٢٣٤٥٦٧٨٩")


def clean_text(value: str) -> str:
    value = html.unescape(re.sub(r"<.*?>", " ", value, flags=re.S))
    return re.sub(r"\s+", " ", value).strip()


def to_arabic_digits(value: str) -> str:
    return value.translate(ARABIC_DIGITS)


def extract_intro(source: str) -> dict:
    intro_match = re.search(
        r'<div class="header-section">\s*<p class="arabic-quran text-center">(.*?)</p>\s*<p class="translate-text text-center"[^>]*>(.*?)</p>',
        source,
        re.S,
    )
    if not intro_match:
        return {}
    return {
        "arabic": clean_text(intro_match.group(1)),
        "translation": clean_text(intro_match.group(2)),
    }


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
        count_match = re.search(r"(\d+)", clean_text(badge_match.group(1)))
        count = int(count_match.group(1)) if count_match else 1

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
            ayat_number = ayat_match.group(1) if ayat_match else ""
            text = clean_text(arabic_text)
            if text:
                entries.append(
                    {
                        "type": "verse",
                        "ayat": ayat_number,
                        "ayatArabic": to_arabic_digits(ayat_number) if ayat_number else "",
                        "text": text,
                    }
                )

        if not entries:
            for item in re.findall(r'<div class="arabic-doa">(.*?)</div>', body, re.S):
                text = clean_text(item)
                if text:
                    entries.append({"type": "doa", "text": text})

        cards.append(
            {
                "titleLatin": title_latin,
                "titleArabic": TITLE_MAP.get(title_latin, title_latin),
                "count": count,
                "countArabic": to_arabic_digits(str(count)),
                "scriptType": "quran" if any(e["type"] in {"basmallah", "verse"} for e in entries) else "doa",
                "entries": entries,
            }
        )

    return cards


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("Usage: extract_almatsurat_data.py <slug> <input_html> <output_json>")

    slug, input_html, output_json = sys.argv[1:]
    source = Path(input_html).read_text(encoding="utf-8")
    payload = {
        "slug": slug,
        "intro": extract_intro(source),
        "cards": extract_cards(source),
    }

    output_path = Path(output_json)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(output_path)


if __name__ == "__main__":
    main()
