export const morningScenes = [
  "/backgrounds/morning-mountain.svg",
  "/backgrounds/morning-coast.svg",
  "/backgrounds/morning-city.svg",
];

export const eveningScenes = [
  "/backgrounds/evening-hills.svg",
  "/backgrounds/evening-coast.svg",
  "/backgrounds/evening-city.svg",
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
