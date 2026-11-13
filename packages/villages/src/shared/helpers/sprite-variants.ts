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
    if (numbered.length >= 2 && labels.size === members.length) {
      return [{ name: numberedSpriteLabel(numbered[0]!.name)!.name, members }];
    }
    return members.map((pair) => ({ name: pair.name, members: [pair] }));
  });
}
