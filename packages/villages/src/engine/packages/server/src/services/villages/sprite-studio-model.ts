export const SPRITE_STYLES = {
  PAPERCRAFT:
    "Faithfully preserve the source character’s design, clothing, colors, anatomy, and identifying features. Render as a handcrafted 2D papercraft game character: simplified cartoon proportions, bold clean near-black outlines, and a distinct thin off-white paper-cut border around the entire silhouette. Construct the character from flat overlapping cut-paper shapes with crisp angular cel-shaded color regions, subtle layered-paper depth, and tiny contact shadows between overlapping pieces. Apply a clearly visible matte handmade paper texture with fine fibers and gentle printed color variation across the entire character. Slightly imperfect physical cut edges. Clean, expressive, polished storybook character design. Avoid painterly rendering, realistic lighting, smooth gradients, glossy 3D materials, and photorealistic detail. The result should look like a physical illustrated paper character assembled from printed cutouts.",
  BATTLEHIGHWAY:
    "Use the reference image ONLY as a character-design reference for identity, species/anatomy, core outfit, colors, proportions, and defining features. Redraw the character strictly in the visual style of early-2000s Sonic Battle character art. Reconstruct the character from bold angular graphic shapes, not smooth modern anatomy. Use exaggerated proportions, a strong asymmetrical silhouette, and slightly hand-drawn, irregular contours. Build the design from large faceted masses, wedges, spikes, tapered limbs, and simplified shape clusters. Do not just take normal anatomy and make it slightly angular. Use thick dark outer outlines and selective thinner interior lines to divide important forms only. Group repeated details like feathers, fur, hair, folds, fingers, and accessories into a few large simplified shapes instead of many small ones. Use flat saturated colors with one large hard-edged shadow shape per major form and only occasional small highlight accents. Keep strong value separation and graphic cutout-like shading, not realistic form rendering. Include some medium-scale structural details that define the character, but remove microdetail. The final image should feel like Sonic Battle character key art: graphic, angular, simplified, lively, and highly readable, not polished modern anime art, not painterly, not vector-clean, and not realistic. No gradients, soft shading, painterly texture, glossy rendering, realistic lighting, detailed folds, excessive feather/fur/hair separation, or 3D volume.",
  Custom: "",
};
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
export type StudioRendered = { assetId: string; filename: string; url: string; fingerprint: string };
export type StudioAssignment = { expressionId: string; view: StudioView; cellId: string };
export type StudioFile = { assetId: string; expression: string; url: string; error?: string };
export type StudioSettings = { style: StudioStyle; prompts: Record<StudioStyle, string>; connectionId: string };
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
  status: "candidate" | "approved" | "discarded";
};
export type StudioSheet = {
  baseScale?: number;
  assetId: string;
  url: string;
  width: number;
  height: number;
  attempts: number | null;
  usage: Record<string, unknown> | null;
  cells: StudioCell[];
};
export type StudioBatch = { width: number; height: number; cols: number; rows: number; count: number };
export type StudioPlan = {
  protocol: number;
  reviewToken?: string;
  providerToken?: string;
  customParametersIgnored?: boolean;
  connection: { id: string; name: string; model: string; source: string };
  batches: StudioBatch[];
  estimatedCost: number | null;
  localWorkflow: boolean;
};
export type StudioJob = {
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
  pendingAssetId?: string;
  pendingBatch?: StudioBatch;
  pendingExpressions?: Array<{ label: string; pose: string }>;
  view: StudioView;
  connectionId: string;
  model: string;
};
export type StudioState = {
  version: 2;
  settings: StudioSettings;
  jobs: StudioJob[];
  expressions: StudioExpression[];
  files: StudioFile[];
  submissions: Array<{ id: string; fingerprint: string }>;
};
export type StudioData = StudioState & {
  adjustedCellId?: string;
  assignments: StudioAssignment[];
  defaultExpressionId?: string;
  reference: { url: string; capturedAt: string; origin: string } | null;
  connections: Array<{ id: string; name: string; model: string }>;
};
export const defaultStudioState = (): StudioState => ({
  version: 2,
  settings: { style: "PAPERCRAFT", prompts: { ...SPRITE_STYLES }, connectionId: "" },
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
}): string {
  const gaze =
    input.view === "front"
      ? "Front view: face and look toward the viewer."
      : "Right-facing three-quarter theatrical stance. Cheat the torso open toward the audience so the pose is readable, but direct the head, eyes, attention, and gestures toward another villager OFF-CANVAS TO THE RIGHT. Do NOT make eye contact with the viewer.";
  return [
    `Character: ${input.name}. ${input.appearance}`,
    "Identity reference: preserve the reference character’s species, anatomy, core outfit, colors, proportions, and identifying features. Reconstruct the requested poses instead of copying the source pose.",
    `Draw it in this style: ${input.style || "Preserve the visual style of the identity reference."}`,
    gaze,
    `Create ONE image, ${input.batch.width} by ${input.batch.height}, with exactly ${input.batch.cols} columns and ${input.batch.rows} rows of equal cells. Read cells left-to-right, top-to-bottom. Leave unused cells empty. No labels, cell frames, scenery, text, or floor shadows.`,
    "Every occupied cell contains one full-body isolated character, including feet and all gestures. Maintain a shared character scale and foot baseline. Leave generous clear gutters and margins; no body part may cross into another cell. Allow distinct expressive poses rather than requiring the same neutral standing body.",
    ...input.expressions.map(
      (item, i) =>
        `Cell ${i + 1}: ${item.label.replace(/_/g, " ")}. ${item.pose || (item.label === "neutral" ? "Relaxed neutral standing pose." : "Use a readable facial expression and fitting expressive body gesture.")}`,
    ),
    "Transparent background with real alpha. If unavailable, use one flat saturated magenta background, with no checkerboard, gradient, or color spill. Any intentional off-white paper-cut silhouette border and internal paper-layer contact shadows are character artwork; retain them.",
  ].join("\n\n");
}
