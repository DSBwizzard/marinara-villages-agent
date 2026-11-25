import type { VenueReplyLine, VenueScene } from "../models/scene-model.js";
import type { NpcIdentity } from "../models/places.js";
import { coerceSession } from "../decoding/scene-codec.js";
import type { readNarrationReply } from "./narration-contract.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import type { ContactMove } from "./venue-contact.js";
import { routeZoneEvents } from "./zone-events.js";
import { fenceIntroductionWitnesses, revealsNpcName } from "./npc-participation.js";
import { settleSceneSpriteCues, type SpriteSelectionContext } from "./sprite-expressions.js";

/** Bind labels, routing and presentation once, before any source fingerprint or saved episode is authored. */
export function narrationLines(
  reply: ReturnType<typeof readNarrationReply>,
  scene: VenueScene,
  episodeId: string,
  at: string,
  moves: Pick<ContactMove, "characterId" | "zoneId" | "segment">[],
  playerMoves: { zoneId: string; segment: number }[] = [],
  presentation?: SpriteSelectionContext,
  npcIdentity?: (id: string) => Pick<NpcIdentity, "name" | "label"> | undefined,
  allowSpokenName = false,
) {
  memoryRequire(scene.contactGeneration?.venue, "narration needs its captured routing scope");
  const ids = reply.segments.map((row) => "line-" + memoryHash([episodeId, row.id]).slice(0, 32));
  const lines: VenueReplyLine[] = reply.segments.map((row) =>
    row.kind === "narration"
      ? { kind: "narration", speakerId: "__venue_scene__", content: row.text, heardBy: [], staging: row.staging }
      : {
          kind: row.delivery === "whisper" ? "whisper" : row.presentation === "aside" ? "side" : "dialogue",
          speakerId: row.speakerId,
          content: row.text,
          heardBy: [],
          staging: row.staging,
          ...(row.delivery ? { delivery: row.delivery } : {}),
          ...(row.presentation ? { presentation: row.presentation } : {}),
          ...(row.targetId ? { targetId: row.targetId } : {}),
        },
  );
  routeZoneEvents(reply.segments, scene, lines, moves, playerMoves);
  if (scene.pendingNpcAdmissions?.length) fenceIntroductionWitnesses(lines, scene.pendingNpcAdmissions);
  settleSceneSpriteCues(lines, presentation, episodeId);
  const cast = [
    ...new Map(
      [...scene.participants, ...(scene.sceneAttendance?.occupants ?? [])].map((person) => [
        person.characterId,
        person,
      ]),
    ).values(),
  ];
  const publicNames = new Map<string, string>();
  const nameReveals = new Map<number, string>();
  const newlyHeard = new Set(scene.pendingNpcAdmissions?.map(({ npc }) => npc.id));
  const canonical = coerceSession({
    version: 5,
    participants: cast,
    lines: lines.map((line, index) => {
      const person = cast.find((person) => person.characterId === line.speakerId);
      memoryRequire(line.kind === "narration" || person, "narration speaker has no captured identity");
      const row = reply.segments[index];
      const npc = row.kind === "dialogue" ? npcIdentity?.(line.speakerId) : undefined;
      const firstAtAdmission =
        npc && !line.contactHidden && line.heardBy.includes("player") && newlyHeard.delete(line.speakerId);
      if (
        npc &&
        row.kind === "dialogue" &&
        npc.label !== npc.name &&
        !publicNames.has(line.speakerId) &&
        revealsNpcName(line, npc.name, !!firstAtAdmission, row.speakerLabel, allowSpokenName)
      ) {
        publicNames.set(line.speakerId, npc.name);
        nameReveals.set(index, npc.name);
      }
      return {
        ...line,
        id: ids[index],
        role: "assistant",
        name:
          publicNames.get(line.speakerId) ??
          (npc && npc.label === npc.name ? npc.label : undefined) ??
          person?.name ??
          "Narration",
        at,
        ...(line.anchorIndex !== undefined ? { asideFor: ids[line.anchorIndex] } : {}),
      };
    }),
  }).lines;
  memoryRequire(canonical.length === reply.segments.length, "canonical narration lost a generated segment");
  return {
    lines: canonical,
    labels: Object.fromEntries(reply.segments.map((row, index) => [row.id, ids[index]])),
    nameReveals,
  };
}
