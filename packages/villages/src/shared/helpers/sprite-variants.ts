export function spriteLabel(value: string) {
  return value
    .trim()
    .replace(/\.(png|jpe?g|webp)$/iu, "")
    .replace(/^full_/iu, "")
    .trim();
}

export const engineSpriteName = (label: string, filename: string) =>
  spriteLabel(label || filename)
    .slice(0, 100)
    .trim() || "Sprite";

export const engineSpriteUrl = (owner: string, filename: string, version?: string) =>
  `/api/sprites/${encodeURIComponent(owner)}/file/${encodeURIComponent(filename)}${version ? `?v=${version}` : ""}`;

export function spriteLabelKey(value: string) {
  return spriteLabel(value)
    .replace(/_sprite_[a-f0-9]{12}$/iu, "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/^full[\s_-]+/u, "")
    .replace(/[^\p{L}\p{M}\p{N}.-]+/gu, "_")
    .replace(/^_|_$/gu, "");
}

export const spriteMood = (value: string) => spriteLabelKey(value).split("_")[0] ?? "";
export const spriteLook = (value: string) => spriteLabelKey(value).replace(/(?:_\d+)+$/u, "");

export function groupSpritesByMood<T extends { name: string }>(sprites: readonly T[]) {
  const groups = new Map<string, T[]>();
  for (const sprite of sprites) {
    const mood = spriteMood(sprite.name) || spriteLabelKey(sprite.name);
    const members = groups.get(mood);
    if (members) members.push(sprite);
    else groups.set(mood, [sprite]);
  }
  return groups;
}

export function matchingSpriteLabels<T extends { name: string }>(sprites: readonly T[], request: string): readonly T[] {
  const mood = spriteMood(request);
  if (!mood) return [];
  const candidates = sprites.filter(({ name }) => spriteMood(name) === mood);
  const key = spriteLabelKey(request);
  const look = spriteLook(key);
  if (key !== look) {
    const exact = candidates.filter(({ name }) => spriteLabelKey(name) === key);
    if (exact.length) return exact;
  }
  const tokens = look.split("_");
  const isFrame = (name: string) =>
    /_(?:talk(?:ing)?|speak(?:ing)?|(?:mouth_open|open_mouth)|blink(?:ing)?|eyes_closed|closed_eyes|eyes_shut)$/u.test(
      spriteLook(name),
    );
  while (tokens.length > 1) {
    const prefix = tokens.join("_");
    const exact = candidates.filter(({ name }) => spriteLook(name) === prefix);
    if (exact.length) return exact;
    const longer = candidates.filter(({ name }) => spriteLook(name).startsWith(prefix + "_") && !isFrame(name));
    if (longer.length) return longer;
    tokens.pop();
  }
  return look === mood ? candidates : candidates.filter(({ name }) => !isFrame(name));
}

export function numberedSpriteLabel(label: string) {
  const match = /^(.+)_([0-9]+)$/u.exec(label.trim());
  return match && { name: match[1]!.trimEnd(), number: match[2]! };
}

export function groupNumberedSpritePairs<T extends { name: string }>(pairs: readonly T[]) {
  const byName = new Map<string, T[]>();
  for (const pair of pairs) {
    const name = (numberedSpriteLabel(pair.name)?.name ?? pair.name.trim()).toLowerCase();
    const members = byName.get(name);
    if (members) members.push(pair);
    else byName.set(name, [pair]);
  }
  return [...byName.values()].flatMap((members) => {
    const numbered = members.filter((pair) => numberedSpriteLabel(pair.name));
    const labels = new Set(members.map((pair) => pair.name.trim().toLowerCase()));
    if (members.length >= 2 && numbered.length && labels.size === members.length) {
      return [{ name: numberedSpriteLabel(numbered[0]!.name)!.name, members }];
    }
    return members.map((pair) => ({ name: pair.name, members: [pair] }));
  });
}
