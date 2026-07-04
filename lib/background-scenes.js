export const morningScenes = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1800&q=80",
];

export const eveningScenes = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1800&q=80",
];

export function getScenesByMode(mode) {
  return mode === "petang" ? eveningScenes : morningScenes;
}

export function pickRandomScene(mode, previousScene = "") {
  const scenes = getScenesByMode(mode);
  if (scenes.length <= 1) {
    return scenes[0] ?? "";
  }

  const filtered = scenes.filter((scene) => scene !== previousScene);
  const pool = filtered.length > 0 ? filtered : scenes;
  return pool[Math.floor(Math.random() * pool.length)];
}
