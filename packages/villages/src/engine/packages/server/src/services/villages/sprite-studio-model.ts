export const SPRITE_STYLES = {
  PAPERCRAFT:
    "Preserve the reference character design, clothing, colors, anatomy, identifying features, and proportions. Render as a handcrafted 2D papercraft game character with bold clean near-black outlines and a distinct thin off-white paper-cut border around the silhouette. Construct flat overlapping cut-paper shapes with crisp angular cel-shaded color regions, subtle layered-paper depth, and tiny contact shadows between overlapping pieces. Apply matte handmade paper texture with fine fibers and gentle printed color variation to the character only. Slightly imperfect physical cut edges. Clean, expressive, polished storybook design. Avoid painterly rendering, realistic lighting, smooth gradients, glossy 3D materials, and photorealistic detail. Look like an illustrated paper character assembled from printed cutouts. Anatomy and proportions come from the character references, never from a new interpretation of the style.",
  BATTLEHIGHWAY:
    "Use the reference image ONLY as a character-design reference for identity, species/anatomy, core outfit, colors, proportions, and defining features. Redraw the character strictly in the visual style of early-2000s Sonic Battle character art. Reconstruct the character from bold angular graphic shapes, not smooth modern anatomy. Use exaggerated proportions, a strong asymmetrical silhouette, and slightly hand-drawn, irregular contours. Build the design from large faceted masses, wedges, spikes, tapered limbs, and simplified shape clusters. Do not just take normal anatomy and make it slightly angular. Use thick dark outer outlines and selective thinner interior lines to divide important forms only. Group repeated details like feathers, fur, hair, folds, fingers, and accessories into a few large simplified shapes instead of many small ones. Use flat saturated colors with one large hard-edged shadow shape per major form and only occasional small highlight accents. Keep strong value separation and graphic cutout-like shading, not realistic form rendering. Include some medium-scale structural details that define the character, but remove microdetail. The final image should feel like Sonic Battle character key art: graphic, angular, simplified, lively, and highly readable, not polished modern anime art, not painterly, not vector-clean, and not realistic. No gradients, soft shading, painterly texture, glossy rendering, realistic lighting, detailed folds, excessive feather/fur/hair separation, or 3D volume.",
  Custom: "",
};
export const STUDIO_NEGATIVE_PROMPT =
  "text, labels, captions, logos, watermarks, decorative borders, cell frames, scenery, floor shadows, checkerboard background, gradient background, textured background, overlapping sprites, cropped-off body parts, unrelated characters, inconsistent faces, extra limbs";
export type StudioStyle = keyof typeof SPRITE_STYLES;
export type StudioView = "front" | "side";
export const STUDIO_EXPRESSIONS = ["neutral", "happy", "sad", "angry", "surprised", "thinking"];
export const STUDIO_MEANINGS: Record<string, string> = {
  neutral: "Relaxed, listening, or ordinary conversation.",
  happy: "Feeling happy, pleased, or cheerful.",
  sad: "Feeling sad, disappointed, or downhearted.",
  angry: "Feeling angry, frustrated, or annoyed.",
  surprised: "Reacting to something unexpected.",
  thinking: "Considering an idea or deciding what to do.",
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
  style: StudioStyle;
  prompts: Record<StudioStyle, string>;
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
  kind: "generated-raw" | "imported" | "legacy";
  sha256?: string;
  matteHex?: string;
  pipelineVersion?: number;
};
export type StudioGenerationRequest = {
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
  targetHeight?: number;
  requestedExpressions?: Array<{ label: string; pose: string; expressionId?: string }>;
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
    style: "PAPERCRAFT",
    prompts: { ...SPRITE_STYLES },
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

export function validateStudioCell(cell: StudioCell, sheet: Pick<StudioSheet, "width" | "height">): void {
  if (!cell || !/^[a-z0-9_-]{1,40}$/.test(cell.label) || !["front", "side"].includes(cell.view))
    throw new Error("Choose a valid view and expression label.");
  if (typeof cell.pose !== "string" || cell.pose.length > 500)
    throw new Error("Pose instructions must be at most 500 characters.");
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
  style: string;
  view: StudioView;
  expressions: Array<{ label: string; pose: string }>;
  batch: StudioBatch;
  matteHex?: string;
  referenceRoles?: string[];
}): string {
  const gaze =
    input.view === "front"
      ? "Front view: face and look toward the viewer."
      : "Right-facing three-quarter theatrical stance. Cheat the torso open toward the audience so the pose is readable, but direct the head, eyes, attention, and gestures toward another villager OFF-CANVAS TO THE RIGHT. Do NOT make eye contact with the viewer.";
  return [
    `Character: ${input.name}. ${input.appearance}`,
    input.referenceRoles?.length
      ? "Identity reference: preserve the reference character’s species, anatomy, core outfit, colors, proportions, and identifying features. Reconstruct the requested poses instead of copying the source pose."
      : "Preserve the character description’s species, anatomy, core outfit, colors, proportions, and identifying features consistently in every cell.",
    ...(input.referenceRoles?.length
      ? [
          "Reference order and roles: " +
            input.referenceRoles.map((role, i) => `${i + 1}: ${role}`).join("; ") +
            ". The original avatar controls identity; a styled neutral reference controls proportions, clothing details, and style. Do not redesign, add footwear, remove accessories, or change the outfit.",
        ]
      : []),
    `Draw it in this style: ${input.style || "Preserve the visual style of the identity reference."}`,
    gaze,
    `Create ONE image, ${input.batch.width} by ${input.batch.height}, with exactly ${input.batch.cols} columns and ${input.batch.rows} rows of equal cells. Read cells left-to-right, top-to-bottom. Leave unused cells empty. No labels, cell frames, scenery, text, or floor shadows.`,
    `Each equal cell is ${input.batch.width / input.batch.cols} by ${input.batch.height / input.batch.rows} pixels. Vertical cuts: ${Array.from({ length: input.batch.cols - 1 }, (_, i) => ((i + 1) * input.batch.width) / input.batch.cols).join(", ") || "none"}; horizontal cuts: ${Array.from({ length: input.batch.rows - 1 }, (_, i) => ((i + 1) * input.batch.height) / input.batch.rows).join(", ") || "none"}. These are invisible crop boundaries, not drawn lines.`,
    "Every occupied cell contains one complete full-body character, including the top of the head, both feet and all gestures. Keep the silhouette within the central 80% of cell width and 76% of cell height, with at least 10% clear space above the head and 12% below the feet. Keep the same character proportions, camera distance and body scale across every cell. Align feet at 88% of each cell’s height. No body part may cross a crop boundary. Allow distinct expressive poses rather than requiring the same neutral standing body.",
    ...input.expressions.map(
      (item, i) =>
        `Cell ${i + 1}: ${item.label.replace(/_/g, " ")}. ${item.pose || (item.label === "neutral" ? "Relaxed neutral standing pose." : "Use a readable facial expression and fitting expressive body gesture.")}`,
    ),
    `Use one perfectly flat, uniform solid background ${input.matteHex ?? "#FF00FF"} across the entire canvas, including gutters and unused cells. Do not generate transparency, checkerboards, gradients, grid lines, background texture, or color spill. Keep character colors fully opaque, including internal highlights and shadows. Preserve intentional character outlines in the chosen style. Background removal happens after generation.`,
  ].join("\n\n");
}

// Migrate only the exact previous built-in preset; custom prose and historical jobs stay intact.
export const LEGACY_STUDIO_PAPERCRAFT =
  "Faithfully preserve the source character’s design, clothing, colors, anatomy, and identifying features. Render as a handcrafted 2D papercraft game character: simplified cartoon proportions, bold clean near-black outlines, and a distinct thin off-white paper-cut border around the entire silhouette. Construct the character from flat overlapping cut-paper shapes with crisp angular cel-shaded color regions, subtle layered-paper depth, and tiny contact shadows between overlapping pieces. Apply a clearly visible matte handmade paper texture with fine fibers and gentle printed color variation across the entire character. Slightly imperfect physical cut edges. Clean, expressive, polished storybook character design. Avoid painterly rendering, realistic lighting, smooth gradients, glossy 3D materials, and photorealistic detail. The result should look like a physical illustrated paper character assembled from printed cutouts.";

export const PREVIOUS_STUDIO_PAPERCRAFT =
  "Preserve the approved character design, clothing, colors, anatomy, identifying features, and proportions. Render as a handcrafted 2D papercraft game character with bold clean near-black outlines and a distinct thin off-white paper-cut border around the silhouette. Construct flat overlapping cut-paper shapes with crisp angular cel-shaded color regions, subtle layered-paper depth, and tiny contact shadows between overlapping pieces. Apply matte handmade paper texture with fine fibers and gentle printed color variation to the character only. Slightly imperfect physical cut edges. Clean, expressive, polished storybook design. Avoid painterly rendering, realistic lighting, smooth gradients, glossy 3D materials, and photorealistic detail. Look like an illustrated paper character assembled from printed cutouts. Anatomy and proportions come from the approved design, never from a new interpretation of the style.";
