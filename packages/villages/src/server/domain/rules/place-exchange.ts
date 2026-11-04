import { createHash } from "node:crypto";
import type { VillageState } from "../models/world.js";
import type { VenueScene, VenueSubmission } from "../models/scene-model.js";
import { establishPlace } from "./place-discovery.js";
import { readNpc } from "./places.js";
import { asRecord } from "./coerce.js";
import { conflict } from "./errors.js";
import { z } from "zod";

/** Saved Scene sources are the replay outbox; identity and discovery receipts publish in the world CAS. */
export function applyPlaceExchange(
  state: VillageState,
  scene: VenueScene,
  turn: Pick<
    VenueSubmission,
    "id" | "at" | "replyLineIds" | "npcAdmissions" | "placeDiscoveries" | "establishmentProgress" | "zoneIdAtTurn"
  >,
): void {
  if (!turn.npcAdmissions?.length && !turn.placeDiscoveries?.length && !turn.establishmentProgress?.length) return;
  if (state.seed !== scene.villageSeed) throw conflict("The Village changed.");
  const key = `place-exchange:${scene.id}:${turn.id}`;
  const fingerprint = createHash("sha256")
    .update(JSON.stringify([turn.npcAdmissions, turn.placeDiscoveries, turn.establishmentProgress]))
    .digest("hex");
  if (state.worldPlaces.receipts[key]) {
    if (state.worldPlaces.receipts[key] !== fingerprint) throw conflict("Saved Place evidence changed.");
    return;
  }
  const lineAt = (index: unknown) => {
    if (!Number.isInteger(index) || Number(index) < 0) throw conflict("Invalid Place source.");
    const id = turn.replyLineIds?.[Number(index)],
      line = scene.lines.find((row) => row.id === id);
    if (!line) throw conflict("The saved Place source is missing.");
    return line;
  };
  for (const admission of turn.npcAdmissions ?? []) {
    const source = lineAt(admission.segment);
    if (
      source.content !== admission.source ||
      source.kind !== "narration" ||
      source.contactHidden ||
      (turn.zoneIdAtTurn && admission.zoneId !== turn.zoneIdAtTurn)
    )
      throw conflict("The character introduction source changed.");
    const npc = readNpc(admission.npc),
      previous = state.worldPlaces.npcs[npc.id];
    if (previous && (previous.disabled || previous.revision !== npc.revision))
      throw conflict("The supporting character changed.");
    const saved = (state.worldPlaces.npcs[npc.id] ??= npc);
    if (!saved.associations.some((row) => row.placeId === scene.placeId)) {
      saved.associations = [...saved.associations.slice(-11), { placeId: scene.placeId, role: "Encountered here" }];
      saved.revision++;
    }
  }
  const discoveries = turn.placeDiscoveries ?? [];
  if (discoveries.length > 2) throw conflict("Too many Place discoveries.");
  for (const [index, value] of discoveries.entries()) {
    const proposal = asRecord(value),
      line = lineAt(proposal.segment);
    if (line.contactHidden || (line.kind === "whisper" && line.targetId !== "player")) continue;
    const source = `scene:${scene.id}:${turn.id}:${line.id}`;
    const existingId = typeof proposal.existingId === "string" ? proposal.existingId : undefined;
    const existing = existingId ? state.worldPlaces.places[existingId] : undefined;
    if (existingId && state.venues.some((venue) => venue.id === existingId)) continue;
    if (existingId && !existing) throw conflict("The referenced Place is missing.");
    if (existing) {
      existing.knownBy = [...new Set([...existing.knownBy, "player", ...line.heardBy])];
      existing.revision++;
    } else {
      const id = "place:" + createHash("sha256").update(`${scene.id}:${turn.id}:${index}`).digest("hex");
      const mapId =
        state.venues.find((venue) => venue.id === scene.placeId)?.presentation.mapId ??
        state.worldPlaces.places[scene.placeId]?.location.presentation.mapId ??
        state.maps[0]?.id;
      if (!mapId) throw conflict("The discovery has no world map.");
      const place = establishPlace(state, proposal.place, id, mapId, source, turn.at!, false);
      place.knownBy = [...new Set(["player", ...line.heardBy])];
    }
  }
  const progress = z
    .array(
      z
        .object({
          projectId: z.string(),
          revision: z.number().int().positive(),
          objectiveId: z.string(),
          segment: z.number().int().nonnegative(),
          quote: z.string().trim().min(1).max(1200),
          met: z.literal(true),
        })
        .strict(),
    )
    .max(8)
    .safeParse(turn.establishmentProgress ?? []);
  if (!progress.success) throw conflict("Invalid establishment evidence.");
  for (const outcome of progress.data) {
    const project = state.projects.find((row) => row.id === outcome.projectId);
    const objective = project?.establishment?.objectives.find((row) => row.id === outcome.objectiveId);
    const line = lineAt(outcome.segment);
    if (
      !project ||
      !objective ||
      project.lifecycle?.revision !== outcome.revision ||
      !["planning", "working", "paused"].includes(project.status) ||
      !line.content.includes(outcome.quote) ||
      line.contactHidden ||
      line.contactReport ||
      line.soundOnly?.player ||
      (line.kind === "whisper" && line.targetId !== "player")
    )
      throw conflict("The establishment outcome is not a current witnessed source.");
    objective.met = true;
    objective.evidence.push({ source: `scene:${scene.id}:${turn.id}:${line.id}`, quote: outcome.quote });
    objective.evidence = objective.evidence.slice(-8);
    project.updatedAt = turn.at!;
  }
  state.worldPlaces.receipts[key] = fingerprint;
  state.worldPlaces.revision++;
}
