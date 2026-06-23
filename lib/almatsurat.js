import sugro from "@/data/sugro.json";
import kubro from "@/data/kubro.json";

export const themes = {
  sugro: {
    slug: "sugro",
    label: "Sugro",
    title: "المأثورات الصغرى",
    subtitle: "Wazifah ringkas untuk pagi dan petang.",
    accent: "#1a5660",
    accentSoft: "#dfeef1",
    accentStrong: "#14454d",
    surface: "#ffffff",
    background: "linear-gradient(180deg, #f4f8fa 0%, #edf3f6 100%)",
    darkBackground: "linear-gradient(180deg, #0f1518 0%, #121a1d 100%)",
    darkAccent: "#77bcc7",
    chip: "#967546",
    darkText: "#edf4f6",
    text: "#18282d",
  },
  kubro: {
    slug: "kubro",
    label: "Kubro",
    title: "المأثورات الكبرى",
    subtitle: "Wazifah lengkap dengan susunan bacaan yang rapi.",
    accent: "#465f4d",
    accentSoft: "#e3ece5",
    accentStrong: "#374c3d",
    surface: "#ffffff",
    background: "linear-gradient(180deg, #f4f7f3 0%, #edf2ee 100%)",
    darkBackground: "linear-gradient(180deg, #111614 0%, #171d1a 100%)",
    darkAccent: "#9fc7ab",
    chip: "#7b6a44",
    darkText: "#eef4ef",
    text: "#202923",
  },
};

export const collections = {
  sugro,
  kubro,
};

export function getCollection(slug) {
  return collections[slug] ?? null;
}

export function getTheme(slug) {
  return themes[slug] ?? themes.sugro;
}

export function getVersionList() {
  return Object.values(themes);
}
