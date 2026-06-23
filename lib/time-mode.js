const EVENING_REPLACEMENTS = [
  ["أَصْبَحْنَا وَأَصْبَحَ (أَمْسَيْنَا وَأَمْسَى)", "أَمْسَيْنَا وَأَمْسَى"],
  ["أَصْبَحْنَا (أَمْسَيْنَا)", "أَمْسَيْنَا"],
  ["أَصْبَحْتُ (أَمْسَيتُ)", "أَمْسَيْتُ"],
  ["أَصْبَحَ (أَمْسَ)", "أَمْسَى"],
  ["نَهَارِكَ (لَيْلِكَ)", "لَيْلِكَ"],
  ["لَيْلِكَ (نَهَارِكَ)", "نَهَارِكَ"],
  ["النُّشُوْرُ (الْمَصِيْرُ)", "الْمَصِيْرُ"],
];

export function applyTimeMode(text, mode) {
  if (!text) {
    return text;
  }

  if (mode === "petang") {
    let output = text;
    for (const [morning, evening] of EVENING_REPLACEMENTS) {
      output = output.replaceAll(morning, evening);
    }

    return output.replace(/\s+/g, " ").trim();
  }

  return text.replace(/\s*\([^()]+\)/g, "").replace(/\s+/g, " ").trim();
}
