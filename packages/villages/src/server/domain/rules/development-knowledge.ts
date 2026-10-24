import type { VillageState } from "../models/world.js";
import type { VenueScene } from "../models/scene-model.js";
import type { SavedDevelopmentChange } from "./development-scene.js";
export function knownDevelopment(state: VillageState, characterId: string) {
  return (state.development?.residents[characterId]?.pursuits ?? []).flatMap((p) =>
    p.known ? [{ id: p.id, ...p.known, title: knownPursuitTitle(p.known) }] : [],
  );
}
/** Publish only retained witnessed after-values, never current private progress. */
export function publishDevelopmentKnowledge(state: VillageState, sceneId: string, submissionId: string): void {
  for (const receipt of Object.values(state.exchangeReceipts)) {
    if (receipt.sceneId !== sceneId || receipt.submissionId !== submissionId || receipt.status !== "applied") continue;
    const facts = receipt.sceneFacts?.development;
    if (!facts) continue;
    const resident = state.development?.residents[facts.characterId];
    for (const saved of facts.resident.pursuits) {
      const current = resident?.pursuits.find((p) => p.id === saved.id);
      if (saved.known && current && (!current.known || Date.parse(saved.known.at) >= Date.parse(current.known.at)))
        current.known = structuredClone(saved.known);
    }
  }
}
/** Older snapshots contain this fixed summary format. Read its saved name, never current private housing. */
export function knownPursuitTitle(known: { title?: string; text: string }): string {
  const legacy = known.text.match(/^.+: move to (.+) : (?:considering|stalled|arranged|completed|ended)\.$/u);
  return known.title ?? (legacy ? `Move to ${legacy[1]}` : "Move");
}

/** Project accepted, fully heard speech after settlement, independent of model proposal order. */
export function recordWitnessedPursuits(
  state: VillageState,
  scene: VenueScene,
  changes: SavedDevelopmentChange[],
  at: string,
): void {
  const spoken = (change: SavedDevelopmentChange) =>
    change.citations
      .map((c) => c.quote)
      .join(" ")
      .slice(0, 600);
  const pursuit = (change: SavedDevelopmentChange) =>
    state.development!.residents[change.characterId]!.pursuits.find((p) => p.id === change.pursuitId)!;
  for (const change of changes.filter((change) => change.kind === "disclose")) {
    const p = pursuit(change);
    if (p.known && knownPursuitTitle(p.known) !== "Move") continue;
    const home = state.venues.find((v) => v.id === p.targetVenueId)?.name ?? p.targetVenueId;
    const normalize = (text: string) => text.toLowerCase().replace(/[’‘]/gu, "'");
    const escaped = normalize(home).replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const named = new RegExp(`(^|[^\\p{L}\\p{N}_])${escaped}($|[^\\p{L}\\p{N}_])`, "u").test(normalize(spoken(change)));
    if (!p.known) p.known = { at, text: spoken(change), title: "Move", status: "considering" };
    if (named) p.known.title = `Move to ${home}`;
  }
  const ordered = [...changes].sort(
    (a, b) =>
      scene.lines.findIndex((line) => line.id === a.lineIds[0]) -
      scene.lines.findIndex((line) => line.id === b.lineIds[0]),
  );
  for (const change of ordered) {
    const p = pursuit(change);
    if (!p.known) continue;
    const status =
      change.kind === "end"
        ? "ended"
        : change.kind === "wait" || (change.kind === "consent" && change.decision !== "agree")
          ? "stalled"
          : p.known.status;
    const title = knownPursuitTitle(p.known);
    const agreements = [...(p.known.agreements ?? [])];
    if (change.kind === "consent" && change.decision) {
      const previous = agreements.findIndex((entry) => entry.characterId === change.actorId);
      if (previous >= 0) agreements.splice(previous, 1);
      agreements.push({
        characterId: change.actorId,
        name:
          change.actorId === "player"
            ? "You"
            : (state.villagers.find((v) => v.characterId === change.actorId)?.cardSnapshot.name ?? change.actorId),
        decision: change.decision,
        at,
      });
    }
    const name =
      state.villagers.find((v) => v.characterId === change.characterId)?.cardSnapshot.name ?? change.characterId;
    p.known = {
      at,
      title,
      status,
      text: `${name}: ${title} : ${status}.`.slice(0, 600),
      facts: [...(p.known.facts ?? []), { at, text: spoken(change), sceneId: scene.id, lineIds: change.lineIds }].slice(
        -12,
      ),
      agreements: agreements.slice(-100),
    };
  }
}
export function developmentSceneContext(state: VillageState, actorIds: string[]) {
  return actorIds.flatMap((characterId) => {
    const resident = state.development?.residents[characterId];
    return (resident?.pursuits ?? [])
      .filter((p) => !["ended", "completed"].includes(p.status))
      .map((p) => ({ characterId, expectedRevision: resident!.revision, ...p }));
  });
}

export const DEVELOPMENT_SCENE_INSTRUCTION =
  'The root developmentChanges array is required, including when context.development is empty. Return developmentChanges:[] or [{pursuitId,characterId,expectedRevision,kind:"disclose|consent|wait|end",actorId,decision?:"agree|refuse|conditional",citations:[{segment,quote}]}]. Cite exact current speech by actorId, heard by the mover; player consent requires actual captured player speech. Independently inspect each context.development pursuit; use its id as pursuitId. Record disclose when the mover tells the player about this exact intention, even if its status and consent are unchanged. Disclosure updates player knowledge and does not require a new plan. For example, the mover telling the player that they wanted the listed home but its household refused requires a disclose row, even though the move remains stalled. wait/end require the mover explaining their own changed intention. Agreement must be unconditional for this exact move and supplied home/room; unsupported conditions remain conditional. Refusals can change a plan. Player suggestions alone never decide the resident’s intention. Do not invent an intention or arrange/complete a move here. No change means []. ';
