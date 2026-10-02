export const SPRITE_STYLES = {
  PAPERCRAFT:
    "Preserve the reference character design, clothing, colors, anatomy, identifying features, and proportions. Render as a handcrafted 2D papercraft game character with bold clean near-black outlines and a distinct thin off-white paper-cut border around the silhouette. Construct flat overlapping cut-paper shapes with crisp angular cel-shaded color regions, subtle layered-paper depth, and tiny contact shadows between overlapping pieces. Apply matte handmade paper texture with fine fibers and gentle printed color variation to the character only. Slightly imperfect physical cut edges. Clean, expressive, polished storybook design. Avoid painterly rendering, realistic lighting, smooth gradients, glossy 3D materials, and photorealistic detail. Look like an illustrated paper character assembled from printed cutouts. Anatomy and proportions come from the character references, never from a new interpretation of the style.",
  BATTLEHIGHWAY:
    "Use the reference image ONLY as a character-design reference for identity, species/anatomy, core outfit, colors, proportions, and defining features. Redraw the character strictly in the visual style of early-2000s Sonic Battle character art. Reconstruct the character from bold angular graphic shapes, while preserving the character’s anatomy. Preserve the character’s described build, head-to-body ratio, limb lengths, and proportions. Use a strong silhouette and slightly hand-drawn, irregular contours. Build the design from large faceted masses, wedges, spikes, tapered limbs, and simplified shape clusters. Simplify the rendering into angular shapes without shortening limbs or redesigning the body. Use thick dark outer outlines and selective thinner interior lines to divide important forms only. Group repeated details like feathers, fur, hair, folds, fingers, and accessories into a few large simplified shapes instead of many small ones. Use flat saturated colors with one large hard-edged shadow shape per major form and only occasional small highlight accents. Keep strong value separation and graphic cutout-like shading, not realistic form rendering. Include some medium-scale structural details that define the character, but remove microdetail. The final image should feel like Sonic Battle character key art: graphic, angular, simplified, lively, and highly readable, not polished modern anime art, not painterly, not vector-clean, and not realistic. No gradients, soft shading, painterly texture, glossy rendering, realistic lighting, detailed folds, excessive feather/fur/hair separation, or 3D volume.",
  Custom: "",
};
export const STUDIO_NEGATIVE_PROMPT =
  "text, labels, captions, logos, watermarks, decorative borders, cell frames, scenery, floor shadows, checkerboard background, gradient background, textured background, overlapping sprites, cropped-off body parts, unrelated characters, inconsistent faces, extra limbs";
export type StudioStyle = keyof typeof SPRITE_STYLES;
export type StudioStyleSelection = { kind: "default" } | { kind: "profile"; profileId: string } | { kind: "studio" };
export type StudioResolvedStyle = {
  id: string;
  name: string;
  profile: ReturnType<typeof import("@marinara-engine/shared").normalizeImageStyleProfileSettings>["profiles"][number];
  prompt: string;
  fingerprint: string;
};
export type StudioView = "front" | "side";
export const STUDIO_POSE_MAX_LENGTH = 1000;
export const STUDIO_FACING_PROMPTS: Record<StudioView, string> = {
  front:
    "Face the viewer squarely with head and torso forward. Keep both shoulders readable and the body front-facing. Express emotion through this character’s face, posture and gestures.",
  side: "Focus on the conversation partner off-screen to the right. Turn the head and eyes toward them while opening the body toward the camera, like an actor cheating out on stage.",
};
export const defaultStudioFacingPrompts = (): Record<StudioStyle, Record<StudioView, string>> => ({
  PAPERCRAFT: { ...STUDIO_FACING_PROMPTS },
  BATTLEHIGHWAY: { ...STUDIO_FACING_PROMPTS },
  Custom: { ...STUDIO_FACING_PROMPTS },
});
export const PREVIOUS_STUDIO_BATTLEHIGHWAY =
  "Use the reference image ONLY as a character-design reference for identity, species/anatomy, core outfit, colors, proportions, and defining features. Redraw the character strictly in the visual style of early-2000s Sonic Battle character art. Reconstruct the character from bold angular graphic shapes, not smooth modern anatomy. Use exaggerated proportions, a strong asymmetrical silhouette, and slightly hand-drawn, irregular contours. Build the design from large faceted masses, wedges, spikes, tapered limbs, and simplified shape clusters. Do not just take normal anatomy and make it slightly angular. Use thick dark outer outlines and selective thinner interior lines to divide important forms only. Group repeated details like feathers, fur, hair, folds, fingers, and accessories into a few large simplified shapes instead of many small ones. Use flat saturated colors with one large hard-edged shadow shape per major form and only occasional small highlight accents. Keep strong value separation and graphic cutout-like shading, not realistic form rendering. Include some medium-scale structural details that define the character, but remove microdetail. The final image should feel like Sonic Battle character key art: graphic, angular, simplified, lively, and highly readable, not polished modern anime art, not painterly, not vector-clean, and not realistic. No gradients, soft shading, painterly texture, glossy rendering, realistic lighting, detailed folds, excessive feather/fur/hair separation, or 3D volume.";
export const STUDIO_EXPRESSIONS = ["neutral", "happy", "sad", "angry", "surprised", "thinking"];
export const STUDIO_MEANINGS: Record<string, string> = {
  neutral: "Relaxed, listening, or ordinary conversation.",
  happy: "Feeling happy, pleased, or cheerful.",
  sad: "Feeling sad, disappointed, or downhearted.",
  angry: "Feeling angry, frustrated, or annoyed.",
  surprised: "Reacting to something unexpected.",
  thinking: "Considering an idea or deciding what to do.",
};
export type StudioCharacterContext = {
  name: string;
  personality: string;
  description: string;
  summary: string;
  backstory: string;
  appearance: string;
  exampleDialogue: string;
};
export type StudioRequestedExpression = {
  label: string;
  pose: string;
  expressionId?: string;
  name?: string;
  useWhen?: string;
  direction?: string;
};
export type StudioIdentity = {
  settings?: StudioSettings;
  resolvedStyle?: StudioResolvedStyle;
  name: string;
  appearance: string;
  style: string;
  view: StudioView;
  facingPrompt?: string;
  referenceUrl?: string;
  references?: Array<{ url: string; role: string }>;
  character?: StudioCharacterContext;
  interpretation?: string;
};
export type StudioPreparationAttempt = {
  status: "submitted" | "answered" | "unknown";
  connectionId: string;
  model: string;
  submittedAt: string;
  content?: string;
  usage?: Record<string, unknown>;
};
export type StudioPreparation = {
  status: "pending" | "submitted" | "ready" | "failed" | "unknown";
  attempts: StudioPreparationAttempt[];
  interpretation?: string;
  expressions?: StudioRequestedExpression[];
};
export type StudioExpression = {
  id: string;
  label: string;
  name: string;
  pose: string;
  useWhen: string;
  aliases: string[];
};
export type StudioRendered = { assetId: string; filename: string; url: string; fingerprint: string; sha256?: string };
export type StudioAssignment = { expressionId: string; view: StudioView; cellId: string };
export type StudioFile = { assetId: string; expression: string; url: string; error?: string };
export type StudioSettings = {
  styleSelection?: StudioStyleSelection;
  style: StudioStyle;
  prompts: Record<StudioStyle, string>;
  facingPrompts?: Record<StudioStyle, Record<StudioView, string>>;
  connectionId: string;
  individual?: boolean;
  strategy?: "original" | "anchored";
  customParameters?: Record<string, unknown>;
  cleanupEngine?: "studio" | "builtin" | "backgroundremover";
};
export type StudioValidation = {
  version: number;
  status: "passed" | "needs-review" | "blocked";
  findings: Array<{ code: string; severity: "review" | "blocking"; message: string }>;
  foreground?: { left: number; top: number; right: number; bottom: number; count: number; edge: number };
  framing?: { x: number; y: number; width: number; height: number; scale: number };
};
export type StudioDesign = {
  id: string;
  revision: number;
  style: StudioStyle;
  stylePrompt: string;
  identityUrl: string;
  identityInstructions?: string;
  front?: { url: string; sourceUrl?: string; sha256?: string; cellId?: string; approvedAt: string };
  side?: { url: string; sourceUrl?: string; sha256?: string; cellId?: string; approvedAt: string };
  exemplar?: string;
  framing: { scale: number; baseline: number; targetHeight?: number };
};
export type StudioReview = {
  id: string;
  connectionId: string;
  connection?: { model: string; host: string };
  referenceHashes?: string[];
  prompt?: string;
  createdAt: string;
  status: "running" | "complete" | "unknown";
  cellIds: string[];
  fingerprints: string[];
  findings: Array<{ cellId: string; category: string; verdict: "pass" | "fail" | "unknown"; detail: string }>;
  consistency: string;
  error?: string;
};
export type StudioCell = {
  id: string;
  expressionId?: string;
  pending?: boolean;
  rendered?: StudioRendered;
  view: StudioView;
  label: string;
  pose: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  cleanup?: boolean;
  cleanupVersion?: number;
  cleanupEngine?: "studio" | "builtin" | "backgroundremover";
  repairedFrom?: string;
  processingVersion?: number;
  validation?: StudioValidation;
  reviewAcknowledged?: boolean;
  status: "candidate" | "approved" | "discarded";
};
export type StudioSource = {
  provenance?: { kind: "character-library"; characterId: string; filename: string; sha256: string };
  kind: "generated-raw" | "imported" | "legacy";
  sha256?: string;
  matteHex?: string;
  pipelineVersion?: number;
};
export type StudioGenerationRequest = {
  overridePrompt?: string;
  overrideNegativePrompt?: string;
  resolvedStyle?: StudioResolvedStyle;
  promptId?: string;
  pipelineVersion: number;
  matteHex: string;
  draftPrompt: string;
  prompt: string;
  negativePrompt: string;
  fingerprint: string;
  connection?: {
    id: string;
    name: string;
    model: string;
    source: string;
    host: string;
    defaults: Record<string, unknown>;
    quality: string;
    configurationFingerprint?: string;
  };
  referenceHashes?: string[];
  referenceRoles?: string[];
};
export type StudioSheet = {
  source?: StudioSource;
  layout?: { cols: number; rows: number; count: number };
  expectedHeight?: number;
  framingVersion?: number;
  baseScale?: number;
  assetId: string;
  url: string;
  width: number;
  height: number;
  attempts: number | null;
  usage: Record<string, unknown> | null;
  cells: StudioCell[];
  validation?: StudioValidation;
};
export type StudioBatch = {
  width: number;
  height: number;
  cols: number;
  rows: number;
  count: number;
  request?: StudioGenerationRequest;
};
export type StudioPlan = {
  protocol: number;
  reviewToken?: string;
  providerToken?: string;
  settingsToken?: string;
  customParametersIgnored?: boolean;
  preparationRequests?: number;
  connection: { id: string; name: string; model: string; source: string };
  batches: StudioBatch[];
  estimatedCost: number | null;
  localWorkflow: boolean;
  providerResolution?: "unknown";
  exportDimensions?: { width: number; height: number };
  capabilities?: {
    resolution: "unknown" | "configured" | "verified";
    references: "unknown" | "configured" | "verified";
    editing: "unknown" | "configured" | "verified";
  };
  designId?: string;
};
export type StudioJob = {
  styleFingerprint?: string;
  resolvedStyle?: StudioResolvedStyle;
  targetHeight?: number;
  requestedExpressions?: StudioRequestedExpression[];
  frozenIdentity?: StudioIdentity;
  phase?: "preparing" | "drawing" | "review";
  preparation?: StudioPreparation;
  imageAttempts?: Array<{ assetId: string; batchIndex: number; status: "submitted" | "saved" | "unknown" }>;
  individual?: boolean;
  style?: string;
  stylePrompt?: string;
  assignments?: StudioAssignment[];
  id: string;
  fingerprint: string;
  createdAt: string;
  status: "running" | "ready" | "interrupted";
  error: string;
  planned: number;
  attempted: number;
  sheets: StudioSheet[];
  pendingSource?: StudioSource;
  pendingAssetId?: string;
  pendingBatch?: StudioBatch;
  pendingExpressions?: Array<{ label: string; pose: string }>;
  view: StudioView;
  connectionId: string;
  model: string;
  purpose?: "expressions" | "design" | "comparison";
  frozenSettings?: StudioSettings;
  capabilities?: StudioPlan["capabilities"];
  designId?: string;
  receipts?: StudioBatch[];
  reviewStatus?: "not-requested";
  strategy?: "original" | "anchored";
};
export type StudioState = {
  publications?: StudioPublication[];
  adoptions?: Array<{ id: string; fingerprint: string; cellIds: string[]; status: "prepared" | "used" }>;
  version: 2;
  settings: StudioSettings;
  jobs: StudioJob[];
  expressions: StudioExpression[];
  files: StudioFile[];
  submissions: Array<{ id: string; fingerprint: string }>;
  designs?: StudioDesign[];
  reviews?: StudioReview[];
};
export type StudioData = StudioState & {
  styleProfiles?: { defaultProfileId: string; profiles: Array<{ id: string; name: string }> };
  styleError?: string;
  adjustedCellId?: string;
  repairedCells?: Array<{ originalId: string; cellId: string }>;
  assignments: StudioAssignment[];
  defaultExpressionId?: string;
  reference: { url: string; capturedAt: string; origin: string } | null;
  connections: Array<{ id: string; name: string; model: string }>;
  design?: StudioDesign;
  reviewConnections?: Array<{ id: string; name: string; model: string }>;
  cleanupCapabilities?: { builtin: boolean; backgroundremover: boolean };
};
export const defaultStudioState = (): StudioState => ({
  version: 2,
  settings: {
    styleSelection: { kind: "studio" },
    style: "PAPERCRAFT",
    prompts: { ...SPRITE_STYLES },
    facingPrompts: defaultStudioFacingPrompts(),
    connectionId: "",
    individual: false,
    cleanupEngine: "studio",
  },
  jobs: [],
  expressions: STUDIO_EXPRESSIONS.map((label) => ({
    id: "e-" + label,
    label,
    name: label,
    pose: "",
    useWhen: STUDIO_MEANINGS[label] ?? "",
    aliases: [label],
  })),
  files: [],
  submissions: [],
  designs: [],
  reviews: [],
});

export type StudioLibraryItem = {
  filename: string;
  expression: string;
  url: string;
  sha256: string;
  label: string;
  view: StudioView;
};
export type StudioPublicationItem = {
  cellId?: string;
  name: string;
  label: string;
  view: StudioView;
  sourceUrl: string;
  sourceHash: string;
  action: "replace" | "rename" | "skip";
  expected: Array<{ filename: string; sha256: string }>;
  backups: Array<{ filename: string; url: string; sha256: string }>;
  status: "pending" | "saving" | "saved" | "skipped" | "failed" | "unresolved";
  error?: string;
};
export type StudioPublication = {
  id: string;
  token: string;
  createdAt: string;
  restoreOf?: string;
  items: StudioPublicationItem[];
};

export function validateStudioCell(cell: StudioCell, sheet: Pick<StudioSheet, "width" | "height">): void {
  if (!cell || !/^[a-z0-9_-]{1,40}$/.test(cell.label) || !["front", "side"].includes(cell.view))
    throw new Error("Choose a valid view and expression label.");
  if (typeof cell.pose !== "string" || cell.pose.length > STUDIO_POSE_MAX_LENGTH)
    throw new Error("Pose instructions must be at most 1,000 characters.");
  if (
    ![cell.x, cell.y, cell.width, cell.height].every(Number.isInteger) ||
    cell.x < 0 ||
    cell.y < 0 ||
    cell.width < 1 ||
    cell.height < 1 ||
    cell.x + cell.width > sheet.width ||
    cell.y + cell.height > sheet.height
  )
    throw new Error("The crop must fit inside the source image.");
  if (
    ![cell.scale, cell.offsetX, cell.offsetY].every(Number.isFinite) ||
    cell.scale < 0.1 ||
    cell.scale > 3 ||
    Math.abs(cell.offsetX) > 512 ||
    Math.abs(cell.offsetY) > 768
  )
    throw new Error("Choose a scale between 0.1 and 3 and an offset inside the sprite canvas.");
}

export function studioPrompt(input: {
  name: string;
  appearance: string;
  interpretation?: string;
  style: string;
  view: StudioView;
  facingPrompt?: string;
  expressions: StudioRequestedExpression[];
  batch: StudioBatch;
  matteHex?: string;
  referenceRoles?: string[];
}): string {
  const gaze = input.facingPrompt ?? STUDIO_FACING_PROMPTS[input.view];
  return [
    `Character: ${input.name}. ${input.appearance}`,
    "Explicit written anatomy is authoritative: preserve stated limb placement, flight structures, hands, feet, and absent features even if a reference or style suggests otherwise. Never add separate wings, limbs, or species features that contradict the description.",
    input.interpretation
      ? "Character interpretation: " + input.interpretation
      : "Expressions will be prepared from this character’s saved personality before drawing.",
    "Show this character’s own interpretation of each emotion through facial tension, gaze, posture, and gestures. Choose intensity from their personality. Sadness does not automatically mean crying; surprise does not automatically mean a gasping mouth; anger does not automatically mean raised fists. Broad gestures are appropriate only when grounded in this character or explicitly requested.",
    input.referenceRoles?.length
      ? "Identity reference: preserve the reference character’s species, anatomy, core outfit, colors, proportions, and identifying features. Reconstruct the requested poses instead of copying the source pose."
      : "Preserve the character description’s species, anatomy, core outfit, colors, proportions, and identifying features consistently in every cell.",
    ...(input.referenceRoles?.length
      ? [
          "Reference order and roles: " +
            input.referenceRoles.map((role, i) => `${i + 1}: ${role}`).join("; ") +
            ". The original avatar controls the visible outfit, colors, and accessories in EVERY cell. Keep its tops, trousers, skirts, scarves, bags, and other visible garments; never omit clothing or replace it with bare skin, feathers, or fur. A styled neutral reference guides rendering and proportions only and cannot override the original outfit or explicit written anatomy. Simplify garment rendering for the style without removing garments. Do not redesign, add footwear, remove accessories, or change the outfit.",
        ]
      : []),
    `Draw it in this style: ${input.style || "Preserve the visual style of the identity reference."}`,
    ...(gaze ? ["Facing guidance: " + gaze] : []),
    `Create ONE image, ${input.batch.width} by ${input.batch.height}, with exactly ${input.batch.cols} columns and ${input.batch.rows} rows of equal cells. Read cells left-to-right, top-to-bottom. Leave unused cells empty. No labels, cell frames, scenery, text, or floor shadows.`,
    `Each equal cell is ${input.batch.width / input.batch.cols} by ${input.batch.height / input.batch.rows} pixels. Vertical cuts: ${Array.from({ length: input.batch.cols - 1 }, (_, i) => ((i + 1) * input.batch.width) / input.batch.cols).join(", ") || "none"}; horizontal cuts: ${Array.from({ length: input.batch.rows - 1 }, (_, i) => ((i + 1) * input.batch.height) / input.batch.rows).join(", ") || "none"}. These are invisible crop boundaries, not drawn lines.`,
    "Every occupied cell contains one complete full-body character, including the top of the head, both feet and all gestures. Keep the silhouette within the central 80% of cell width and 76% of cell height, with at least 10% clear space above the head and 12% below the feet. Keep the same character proportions, camera distance and body scale across every cell. Align feet at 88% of each cell’s height. No body part may cross a crop boundary. Allow distinct character-grounded poses while preserving this character’s usual bearing and anatomy.",
    ...input.expressions.map(
      (item, i) =>
        `Cell ${i + 1}: ${item.label.replace(/_/g, " ")}. ${item.name && item.name !== item.label ? "Expression name: " + item.name + ". " : ""}${item.useWhen ? "Meaning: " + item.useWhen + " " : ""}${item.direction || item.pose || (item.label === "neutral" ? "Use the character’s natural resting posture." : "Interpret this emotion through the character’s personality and usual bearing.")}${item.direction && item.pose ? " User pose constraint: " + item.pose : ""}`,
    ),
    `Use one perfectly flat, uniform solid background ${input.matteHex ?? "#FF00FF"} across the entire canvas, including gutters and unused cells. Do not generate transparency, checkerboards, gradients, grid lines, background texture, or color spill. Keep character colors fully opaque, including internal highlights and shadows. Preserve intentional character outlines in the chosen style. Background removal happens after generation.`,
  ].join("\n\n");
}

// Migrate only the exact previous built-in preset; custom prose and historical jobs stay intact.
export const LEGACY_STUDIO_PAPERCRAFT =
  "Faithfully preserve the source character’s design, clothing, colors, anatomy, and identifying features. Render as a handcrafted 2D papercraft game character: simplified cartoon proportions, bold clean near-black outlines, and a distinct thin off-white paper-cut border around the entire silhouette. Construct the character from flat overlapping cut-paper shapes with crisp angular cel-shaded color regions, subtle layered-paper depth, and tiny contact shadows between overlapping pieces. Apply a clearly visible matte handmade paper texture with fine fibers and gentle printed color variation across the entire character. Slightly imperfect physical cut edges. Clean, expressive, polished storybook character design. Avoid painterly rendering, realistic lighting, smooth gradients, glossy 3D materials, and photorealistic detail. The result should look like a physical illustrated paper character assembled from printed cutouts.";

export const PREVIOUS_STUDIO_PAPERCRAFT =
  "Preserve the approved character design, clothing, colors, anatomy, identifying features, and proportions. Render as a handcrafted 2D papercraft game character with bold clean near-black outlines and a distinct thin off-white paper-cut border around the silhouette. Construct flat overlapping cut-paper shapes with crisp angular cel-shaded color regions, subtle layered-paper depth, and tiny contact shadows between overlapping pieces. Apply matte handmade paper texture with fine fibers and gentle printed color variation to the character only. Slightly imperfect physical cut edges. Clean, expressive, polished storybook design. Avoid painterly rendering, realistic lighting, smooth gradients, glossy 3D materials, and photorealistic detail. Look like an illustrated paper character assembled from printed cutouts. Anatomy and proportions come from the approved design, never from a new interpretation of the style.";
