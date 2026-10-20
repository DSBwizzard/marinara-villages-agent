export type SpriteView = "front" | "side";
export type SpriteDirection = "front" | "left" | "right";
export const SPRITE_CANVAS = { width: 1024, height: 1536, margin: 32, baseline: 1504, bodyHeight: 1280 };
export const SPRITE_UPLOAD_GUIDANCE =
  "Recommended: transparent PNG, 1024 × 1536 pixels. Include one complete character with space around the silhouette. Use consistent body proportions across expressions. Smaller images also work; adjust size and foot position in the preview.";
export type SpriteExpression = { id: string; name: string; useWhen: string };
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
  direction?: SpriteDirection;
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
  framing: { mode: "full" | "half" };
};
export type SpriteLibraryItem = { filename: string; url: string; adoptedArtworkId?: string };

export type SpriteSetupAssignment = {
  approved?: boolean;
  artworkId: string;
  name: string;
  useWhen: string;
  direction: SpriteDirection | "";
  included: boolean;
};
export type SpriteSetupDraft = {
  revision: number;
  manager: SpriteManagerState;
  assignments: SpriteSetupAssignment[];
  suggestions: SpriteSetupAssignment[];
  defaultArtworkId: string;
  suggestedDefaultArtworkId?: string;
  analysisTraits?: Record<
    string,
    {
      expression: "neutral" | "mild" | "strong" | "unknown";
      pose: "relaxed-standing" | "other" | "unknown";
    }
  >;
  useSprites: boolean;
  errors: Record<string, string>;
  analysisRequests: string[];
};
export type SpriteSetupState = SpriteSetupDraft & {
  files: SpriteLibraryItem[];
  resident: boolean;
  residentToken: string;
  libraryError?: string;
};
