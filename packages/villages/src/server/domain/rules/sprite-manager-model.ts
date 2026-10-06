import type { SpriteArtwork, SpriteManagerState } from "../../../shared/contracts/sprites.js";

export const isEngineSpriteFilename = (value: unknown): value is string =>
  typeof value === "string" && /^[\p{L}\p{N}._-]+\.(png|jpe?g|webp)$/iu.test(value) && !value.includes("..");
export const emptySpriteManager = (): SpriteManagerState => ({
  version: 1,
  artwork: [],
  expressions: [],
  assignments: [],
  framing: { mode: "full" },
});
export function coerceSpriteManager(value: unknown): SpriteManagerState | null {
  if (!value || typeof value !== "object") return null;
  const state = value as SpriteManagerState;
  if (
    state.version !== 1 ||
    !Array.isArray(state.artwork) ||
    !Array.isArray(state.expressions) ||
    !Array.isArray(state.assignments)
  )
    return null;
  const validId = (id: unknown) => typeof id === "string" && /^[ae]-[a-f0-9-]{36}$/i.test(id);
  const seenArtwork = new Set<string>();
  const artwork = state.artwork
    .filter((art) => {
      if (
        !art ||
        !validId(art.id) ||
        seenArtwork.has(art.id) ||
        typeof art.name !== "string" ||
        !/^villages-[a-f0-9-]{36}$/i.test(art.assetId) ||
        !art.source ||
        !art.rendered ||
        !art.frame
      )
        return false;
      if (
        !/^[a-z0-9_-]{1,40}\.(png|jpeg|jpg|webp)$/.test(art.source.filename) ||
        !/^[a-z0-9_-]{1,40}\.png$/.test(art.rendered.filename) ||
        art.source.url !== `/api/sprites/${art.assetId}/file/${art.source.filename}` ||
        art.rendered.url !== `/api/sprites/${art.assetId}/file/${art.rendered.filename}` ||
        !/^[a-f0-9]{64}$/.test(art.source.sha256)
      )
        return false;
      if (
        ![art.source.width, art.source.height].every((n) => Number.isInteger(n) && n > 0 && n <= 8192) ||
        art.source.width * art.source.height > 16_000_000
      )
        return false;
      const f = art.frame;
      if (
        ![f.x, f.y, f.width, f.height].every(Number.isInteger) ||
        f.x < 0 ||
        f.y < 0 ||
        f.width < 1 ||
        f.height < 1 ||
        f.x + f.width > art.source.width ||
        f.y + f.height > art.source.height ||
        ![f.scale, f.offsetX, f.offsetY].every(Number.isFinite)
      )
        return false;
      seenArtwork.add(art.id);
      return true;
    })
    .map<SpriteArtwork>((art) => ({
      ...structuredClone(art),
      origin: art.origin === "upload" || art.origin === "engine" ? art.origin : undefined,
      engineSource:
        typeof art.engineSource?.characterId === "string" &&
        art.engineSource.characterId.length > 0 &&
        !/[\\/]/.test(art.engineSource.characterId) &&
        !art.engineSource.characterId.includes("..") &&
        isEngineSpriteFilename(art.engineSource.filename)
          ? { characterId: art.engineSource.characterId, filename: art.engineSource.filename }
          : undefined,
      warnings: Array.isArray(art.warnings) ? art.warnings.filter((warning) => typeof warning === "string") : [],
    }));
  const seenExpressions = new Set<string>();
  const expressions = state.expressions
    .filter((entry) => {
      if (
        !entry ||
        !validId(entry.id) ||
        seenExpressions.has(entry.id) ||
        typeof entry.name !== "string" ||
        !entry.name.trim() ||
        entry.name.length > 100 ||
        typeof entry.useWhen !== "string" ||
        entry.useWhen.length > 1000
      )
        return false;
      seenExpressions.add(entry.id);
      return true;
    })
    .map((entry) => ({ id: entry.id, name: entry.name, useWhen: entry.useWhen }));
  const seenAssignments = new Set<string>();
  const assignments = state.assignments
    .filter((entry) => {
      if (
        !entry ||
        !seenArtwork.has(entry.artworkId) ||
        !seenExpressions.has(entry.expressionId) ||
        !["front", "side"].includes(entry.view) ||
        seenAssignments.has(entry.expressionId + ":" + entry.view)
      )
        return false;
      seenAssignments.add(entry.expressionId + ":" + entry.view);
      return true;
    })
    .map((entry) => ({ expressionId: entry.expressionId, view: entry.view, artworkId: entry.artworkId }));
  const framing = state.framing;
  return {
    version: 1,
    artwork,
    expressions,
    assignments,
    defaultExpressionId: assignments.some((entry) => entry.expressionId === state.defaultExpressionId)
      ? state.defaultExpressionId
      : assignments[0]?.expressionId,
    framing: {
      mode: framing?.mode === "half" ? "half" : "full",
    },
  };
}
export function managerResidentSprite(state: SpriteManagerState | null | undefined) {
  if (!state) return null;
  const expressions = state.assignments.flatMap((assignment) => {
    const art = state.artwork.find((item) => item.id === assignment.artworkId);
    const expression = state.expressions.find((item) => item.id === assignment.expressionId);
    if (!art || !expression) return [];
    return [
      {
        view: assignment.view,
        label: expression.id,
        expressionId: expression.id,
        name: expression.name,
        useWhen: expression.useWhen,
        filename: art.rendered.filename,
        assetId: art.assetId,
      },
    ];
  });
  return expressions.length
    ? {
        assetId: expressions[0]!.assetId,
        expressions,
        defaultExpressionId: state.defaultExpressionId,
        framing: state.framing,
      }
    : null;
}
