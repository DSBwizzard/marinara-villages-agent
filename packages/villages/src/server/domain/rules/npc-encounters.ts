import type { VillageState } from "../models/world.js";
import type { NpcPage, VillageNpcView } from "../../../shared/contracts/village.js";
import { actorEpisodeView, actorEpisodeViews } from "./episodes.js";
import type { NpcIdentity } from "../models/places.js";
import { continuityActor } from "./continuity-actors.js";
import { continuitySourceUnit } from "./continuity.js";
import { memoryHash } from "./memory-integrity.js";
import { npcNameKey } from "./npc-index.js";
import { DEFAULT_NPC_LABEL, revealsNpcName } from "./npc-participation.js";
import { villageWorldScope } from "./village-identity.js";
import { badRequest, conflict } from "./errors.js";

/** Recover a previously heard introduction when the saved public label still predates it. */
export function savedNpcNameReveal(state: VillageState, npc: NpcIdentity) {
  const player = continuityActor(state, "player");
  if (!player) return undefined;
  for (const episode of state.episodes.records) {
    const admission = episode.commandReceipts.find((receipt) => receipt.admission?.npc.id === npc.id)?.admission;
    const first =
      admission &&
      episode.segments.findIndex(
        (line, index) =>
          index > admission.segment &&
          line.speakerId === npc.id &&
          !line.contactHidden &&
          line.heardBy.includes("player"),
      );
    const lines = episode.segments.filter(
      (line, index) =>
        line.role === "assistant" && line.speakerId === npc.id && revealsNpcName(line, npc.name, index === first),
    );
    if (!lines.length) continue;
    const view = actorEpisodeView(episode, state.continuity, player, state.episodes);
    const heard = lines.find((line) => view?.segments.some(({ id, channel }) => id === line.id && channel === "words"));
    if (heard) return { sceneId: episode.sceneId, lineId: heard.id };
  }
}

/** Surviving Player encounters gate the authored NPC overview; private Memories remain separate. */
export function npcEncounterIndex(state: VillageState) {
  const people = new Map<string, VillageNpcView>();
  for (const { episode, view } of actorEpisodeViews(
    state.episodes,
    state.continuity,
    continuityActor(state, "player")!,
  )) {
    if (!view) continue;
    const met = new Set<string>();
    for (const receipt of episode.commandReceipts) {
      if (
        receipt.kind === "npc" &&
        receipt.observedBy?.includes("player") &&
        episode.grounding.some(
          (source) =>
            (episode.dependencies["native:" + receipt.id] ?? []).includes(continuitySourceUnit(source)) &&
            source.perceptions.some(
              (perception) =>
                perception.actorId === "player" &&
                perception.channel === "sight" &&
                view.segments.some(
                  (line) =>
                    line.id === source.unitId && line.channel === "sight" && line.text.includes(perception.text),
                ),
            ),
        )
      )
        met.add(receipt.targetId);
    }
    const positions = new Map(episode.actors.map((actor) => [actor.id, actor.zoneId]));
    for (const [index, raw] of episode.segments.entries()) {
      for (const receipt of episode.commandReceipts) {
        if (receipt.movement?.segment === index) positions.set(receipt.movement.actorId, receipt.movement.zoneId);
        if (receipt.departure?.segment === index) positions.delete(receipt.departure.actorId);
        if (receipt.admission?.segment === index) positions.set(receipt.targetId, receipt.admission.zoneId);
      }
      if (
        raw.speakerId.startsWith("npc:") &&
        !raw.contactHidden &&
        positions.has(raw.speakerId) &&
        positions.get(raw.speakerId) === positions.get("player") &&
        view.segments.some((line) => line.id === raw.id && line.speakerId === raw.speakerId && line.channel === "words")
      )
        met.add(raw.speakerId);
    }
    for (const id of met) {
      const npc = state.worldPlaces.npcs[id];
      if (!npc || (people.get(id)?.at ?? "") > episode.capturedAt) continue;
      const usefulRole = (role: string) =>
        !!role.trim() &&
        ![npcNameKey(npc.name), npcNameKey(DEFAULT_NPC_LABEL), "encountered here"].includes(npcNameKey(role));
      const role = usefulRole(npc.label)
        ? npc.label
        : (npc.associations.find((row) => row.placeId === episode.room?.placeId && usefulRole(row.role))?.role ?? "");
      people.set(id, {
        characterId: id,
        name: npc.name,
        role,
        appearance: npc.appearance ?? "",
        personality: npc.characterization,
        at: episode.capturedAt,
        placeName: episode.placeName ?? "",
      });
    }
  }
  return people;
}

export function readNpcPeople(state: VillageState, query: { scope: string; query?: string; cursor?: string }): NpcPage {
  const scope = villageWorldScope(state);
  if (query.scope !== scope) throw conflict("The Village changed. Open People again.");
  const search = (query.query ?? "").trim().toLocaleLowerCase();
  const rows = [...npcEncounterIndex(state).values()]
    .filter((row) =>
      `${row.name} ${row.role} ${row.appearance} ${row.personality} ${row.placeName}`
        .toLocaleLowerCase()
        .includes(search),
    )
    .sort((a, b) => b.at.localeCompare(a.at) || a.characterId.localeCompare(b.characterId));
  const revision = memoryHash([scope, search, rows]);
  const [token, offset] = query.cursor?.split(":") ?? [revision, "0"],
    start = Number(offset);
  if (!Number.isSafeInteger(start) || start < 0) throw badRequest("Invalid People page.");
  if (token !== revision) throw conflict("People changed. Refresh People.");
  return {
    scope,
    revision,
    items: rows.slice(start, start + 4),
    nextCursor: start + 4 < rows.length ? `${revision}:${start + 4}` : null,
  };
}
