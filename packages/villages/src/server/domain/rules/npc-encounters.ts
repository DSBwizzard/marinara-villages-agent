import type { VillageState } from "../models/world.js";
import type { NpcEncounter, NpcPage, VillageNpcView } from "../../../shared/contracts/village.js";
import { actorEpisodeViews } from "./episodes.js";
import { continuityActor } from "./continuity-actors.js";
import { continuitySourceUnit } from "./continuity.js";
import { memoryHash } from "./memory-integrity.js";
import { villageWorldScope } from "./village-identity.js";
import { badRequest, conflict, notFound } from "./errors.js";

/** Accepted Player evidence is the directory; NPC registry metadata is never Player knowledge. */
export function npcEncounterIndex(state: VillageState) {
  const people = new Map<string, { person: VillageNpcView; encounters: NpcEncounter[]; learnedName?: string }>();
  for (const { episode, view } of actorEpisodeViews(
    state.episodes,
    state.continuity,
    continuityActor(state, "player")!,
  )) {
    if (!view) continue;
    const visible = [...view.input, ...view.segments];
    const supported = (receiptId: string, channel: "sight" | "words", label?: string) =>
      episode.grounding.some(
        (source) =>
          (episode.dependencies["native:" + receiptId] ?? []).includes(continuitySourceUnit(source)) &&
          source.perceptions.some(
            (perception) =>
              perception.actorId === "player" &&
              perception.channel === channel &&
              (!label || perception.text.toLocaleLowerCase().includes(label.toLocaleLowerCase())) &&
              visible.some(
                (line) => line.id === source.unitId && line.channel === channel && line.text.includes(perception.text),
              ),
          ),
      );
    const met = new Map<string, string>();
    for (const receipt of episode.commandReceipts) {
      if (receipt.kind === "npc" && receipt.observedBy?.includes("player") && supported(receipt.id, "sight")) {
        const label = receipt.admission?.npc.label;
        met.set(receipt.targetId, label && supported(receipt.id, "sight", label) ? label : "Stranger");
      }
      const prior = people.get(receipt.targetId);
      if (
        receipt.kind === "npc-introduction" &&
        prior &&
        receipt.witnesses.includes("player") &&
        supported(receipt.id, "words")
      ) {
        prior.learnedName = receipt.text;
        prior.person.name = receipt.text;
      }
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
        met.set(raw.speakerId, raw.name || "Stranger");
    }
    const input = view.input
      .filter((line) => line.channel === "words")
      .map((line) => ({
        line: { speaker: "You", text: line.text },
        moment: episode.grounding.find((source) => source.id === line.id)?.moment ?? { index: 0, side: "before" },
      }));
    const lines = episode.segments.flatMap((raw, index) => [
      ...input.filter((row) => row.moment.index === index && row.moment.side === "before").map((row) => row.line),
      ...view.segments
        .filter((line) => line.id === raw.id && line.channel !== "private")
        .map((line) => ({
          speaker: line.channel !== "words" || line.speakerId === "__venue_scene__" ? "" : raw.name || "Someone",
          text: line.text,
        })),
      ...input.filter((row) => row.moment.index === index && row.moment.side === "after").map((row) => row.line),
    ]);
    for (const [id, label] of met) {
      const prior = people.get(id);
      const introduction = episode.commandReceipts.find(
        (receipt) =>
          receipt.kind === "npc-introduction" &&
          receipt.targetId === id &&
          receipt.witnesses.includes("player") &&
          supported(receipt.id, "words"),
      );
      const learnedName = introduction?.text ?? prior?.learnedName;
      const encounter = { id: episode.id, at: episode.capturedAt, placeName: episode.placeName ?? "", lines };
      const encounters = prior?.encounters ?? [];
      encounters.push(encounter);
      people.set(id, {
        person: {
          characterId: id,
          name: learnedName ?? (label === "Stranger" ? (prior?.person.name ?? label) : label),
          at: encounter.at,
          placeName: encounter.placeName,
          excerpt: (
            view.segments.find((line) => line.speakerId === id && line.channel === "words")?.text ??
            lines[0]?.text ??
            ""
          ).slice(0, 240),
        },
        encounters,
        learnedName,
      });
    }
  }
  return people;
}

export function readNpcPeople(
  state: VillageState,
  query: {
    scope: string;
    query?: string;
    cursor?: string;
    characterId?: string;
  },
): NpcPage<VillageNpcView | NpcEncounter> {
  const scope = villageWorldScope(state);
  if (query.scope !== scope) throw conflict("The Village changed. Open People again.");
  const index = npcEncounterIndex(state),
    person = query.characterId ? index.get(query.characterId) : undefined;
  if (query.characterId && !person) throw notFound("No encounters recorded for this person.");
  const search = (query.query ?? "").trim().toLocaleLowerCase();
  const rows = person
    ? person.encounters.toReversed()
    : [...index.values()]
        .map((row) => row.person)
        .filter((row) => `${row.name} ${row.placeName} ${row.excerpt}`.toLocaleLowerCase().includes(search))
        .sort((a, b) => b.at.localeCompare(a.at) || a.characterId.localeCompare(b.characterId));
  const revision = memoryHash([scope, search, query.characterId ?? "", rows]);
  const [token, offset] = query.cursor?.split(":") ?? [revision, "0"],
    start = Number(offset);
  if (!Number.isSafeInteger(start) || start < 0) throw badRequest("Invalid People page.");
  if (token !== revision) throw conflict("Encounters changed. Refresh People.");
  return {
    scope,
    revision,
    items: rows.slice(start, start + 4),
    nextCursor: start + 4 < rows.length ? `${revision}:${start + 4}` : null,
  };
}
