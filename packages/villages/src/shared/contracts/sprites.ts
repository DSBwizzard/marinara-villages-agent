export type SpriteView = "front" | "side";
export type SpriteFolders = Record<SpriteView, string>;
export const SPRITE_CANVAS = { width: 1024, height: 1536, margin: 32, baseline: 1504, bodyHeight: 1280 };
export type SpriteExpression = { id: string; name: string };
export type SpriteFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  headY?: number;
  footY?: number;
};
export type SpriteArtwork = {
  id: string;
  name: string;
  assetId: string;
  source: { filename: string; url: string; width: number; height: number; sha256: string };
  rendered: { filename: string; url: string };
  frame: SpriteFrame;
  warnings: string[];
} & (
  | { origin: "upload"; engineSource?: never }
  | { origin: "engine"; engineSource: { characterId: string; filename: string } }
);
export type SpriteAssignment = { expressionId: string; view: SpriteView; artworkId: string };
export type SpriteManagerState = {
  version: 1;
  artwork: SpriteArtwork[];
  expressions: SpriteExpression[];
  assignments: SpriteAssignment[];
  defaultExpressionId?: string;
  useSprites?: boolean;
  folders?: SpriteFolders;
  excluded?: Record<SpriteView, string[]>;
  lastSave?: { id: string; digest: string };
  framing: { mode: "full" | "half" };
};
export type SpriteLibraryItem = {
  filename: string;
  label?: string;
  url: string;
  folderId?: string | null;
  version?: string;
  adoptedArtworkId?: string;
};
export type SpriteLibraryFolder = { id: string; name: string; category: "expressions" | "full-body" };

export type SpriteSetupAssignment = {
  approved: boolean;
  artworkId: string;
  name: string;
  view: SpriteView;
  included: boolean;
};
export type SpriteSetupDraft = {
  revision: number;
  manager: SpriteManagerState;
  assignments: SpriteSetupAssignment[];
  defaultArtworkId: string;
  useSprites: boolean;
  errors: Record<string, string>;
};
export type SpriteAppearance = {
  revision: number;
  token: string;
  manager: SpriteManagerState;
  files: SpriteLibraryItem[];
  folders: SpriteLibraryFolder[];
  libraryError?: string;
};

export type SpriteChoice =
  { artworkId: string; filename?: never } | { filename: string; version?: string; artworkId?: never };
export type AppearanceExpression = {
  id: string;
  name: string;
  front?: SpriteChoice;
  side?: SpriteChoice;
};
