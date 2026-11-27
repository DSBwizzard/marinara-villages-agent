export const PROFESSOR_MARI_ID = "__professor_mari__";

export const MARI_SPRITE_NAMES = [
  "Happy",
  "Happy_2",
  "Neutral",
  "Neutral_2",
  "Neutral_3",
  "Neutral_4",
  "Playful",
  "Thinking",
  "Thinking_2",
  "Wave",
  "Angry",
  "Sad",
  "Surprised",
] as const;

export const MARI_SPRITE_FOLDER = { id: "villages-mari-front", name: "Professor Mari", category: "full-body" as const };

export const mariSpriteFiles = [
  ...MARI_SPRITE_NAMES.map((name) => ({
    filename: `villages-mari-${name}.png`,
    label: name,
    folderId: MARI_SPRITE_FOLDER.id,
    url: `/api/capability-packages/villages/assets/mari-visitor-sprites/${name}.png`,
  })),
  {
    filename: "villages-mari-Presenting.webp",
    label: "Presenting",
    folderId: MARI_SPRITE_FOLDER.id,
    url: "/api/capability-packages/villages/assets/mari-founding-presenting.webp",
  },
];

export function bundledMariSpriteUrl(owner: string, filename: string) {
  return owner === PROFESSOR_MARI_ID ? mariSpriteFiles.find((file) => file.filename === filename)?.url : undefined;
}
