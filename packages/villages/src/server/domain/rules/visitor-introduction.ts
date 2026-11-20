import type { SceneAttendance, VenueScene } from "../models/scene-model.js";
import type { VillageState, VillageVenue } from "../models/world.js";
import { memoryHash } from "./memory-integrity.js";
import { villageWorldScope } from "./village-identity.js";
import { contactNeighbors } from "./venue-contact.js";
import { evaluateZoneAccess } from "./venue-access.js";
import { zoneClosed } from "./venue-zones.js";
import { activeNarrativeConditions } from "./narrative-environment.js";
import { hasAssociatedNpc } from "./places.js";
import { PROFESSOR_MARI_ID } from "../../../shared/helpers/professor-mari.js";

export { PROFESSOR_MARI_ID } from "../../../shared/helpers/professor-mari.js";
export const visitorIntroductionId = (state: VillageState) =>
  "mari-first-visit-" + memoryHash(villageWorldScope(state)).slice(0, 32);

export function visitorIntroductionDue(state: VillageState, now: Date) {
  return (
    !!state.visitorIntroduction &&
    !state.visitorIntroduction.completedAt &&
    !!state.setupAt &&
    now.getTime() >= Date.parse(state.setupAt) + 86_400_000 &&
    now.getTime() >= Date.parse(state.clock?.trustedAt ?? now.toISOString())
  );
}

export function visitorIntroductionVenue(
  state: VillageState,
  venue: VillageVenue,
  attendance: SceneAttendance,
  now: Date,
) {
  const entrance = venue.zones?.find((zone) => zone.kind === "exterior");
  if (
    !entrance ||
    !venue.access ||
    venue.constructionStatus === "worksite" ||
    state.opening?.stage === "gathering" ||
    hasAssociatedNpc(state, venue.id) ||
    zoneClosed(state, venue, entrance)
  )
    return false;
  const heardZones = new Set([entrance.id, ...contactNeighbors(venue, entrance.id)]);
  if (
    attendance.occupants.some((person) => heardZones.has(person.zoneId)) ||
    activeNarrativeConditions(state.narrative, now.toISOString()).some(
      (condition) => condition.venueId === venue.id && (!condition.zoneId || heardZones.has(condition.zoneId)),
    )
  )
    return false;
  return (
    ["player", PROFESSOR_MARI_ID].every(
      (actor) =>
        evaluateZoneAccess(venue, entrance, actor, {
          at: now,
          accepting: false,
          environment: state.narrative,
        }).allowed,
    ) && venue.zones!.some((zone) => zone.kind === "public" && zone.access?.mode === "public")
  );
}

export function writeVisitorIntroduction(scene: VenueScene, state: VillageState) {
  const mari = state.visitors!.find((person) => person.characterId === PROFESSOR_MARI_ID)!;
  scene.visitorIntroduction = true;
  scene.status = "opening";
  const participant = { characterId: PROFESSOR_MARI_ID, name: mari.cardSnapshot.name, doing: "visiting" };
  scene.participants = [participant];
  scene.activeIds = [PROFESSOR_MARI_ID];
  scene.sceneAttendance!.occupants.push({ ...participant, zoneId: scene.zoneId! });
}

export function appendVisitorIntroductionTutorial(scene: VenueScene) {
  if (!scene.visitorIntroduction) return;
  const mari = scene.participants.find((person) => person.characterId === PROFESSOR_MARI_ID)!;
  const paragraphs: ["narration" | "dialogue", string][] = [
    [
      "dialogue",
      "I'm your first Visitor. Villagers live here; Visitors come and go. You can choose unused Character Cards in People, under Visitors, and let chance bring them along.",
    ],
    [
      "dialogue",
      "Once you've met someone in a Scene, they stay in People even when they're away. Write them a letter. A friendship doesn't have to fit inside the village boundary.",
    ],
    [
      "dialogue",
      "A letter can invite them back, or ask for a little space. An invitation is encouragement, not a summons. You can also turn their visits off in Character Tools.",
    ],
    [
      "dialogue",
      "Most Visitors stay for a couple of nights. They can be company without taking on a Villager's regular work and agenda. If you later ask them to move in, your history together comes with them.",
    ],
    [
      "dialogue",
      "Today's just a quick hello for me. I'll leave you to it—there's an entire village waiting, and I've already used rather a lot of dialogue boxes. Do keep in touch.",
    ],
    [
      "narration",
      "Mari gives a small wave and heads back down the road. The entrance settles into its ordinary rhythm again.",
    ],
  ];
  const at = scene.lines.at(-1)?.at ?? scene.startedAt;
  for (const [index, [kind, content]] of paragraphs.entries()) {
    const id = `${scene.id}-visitors-${index}`;
    if (scene.lines.some((line) => line.id === id)) continue;
    scene.lines.push({
      id,
      role: "assistant",
      kind,
      content,
      at,
      speakerId: kind === "dialogue" ? PROFESSOR_MARI_ID : "__venue_scene__",
      name: kind === "dialogue" ? mari.name : "Narration",
      zoneId: scene.zoneId,
      heardBy: ["player", PROFESSOR_MARI_ID],
    });
  }
}

export function completeVisitorIntroduction(state: VillageState, scene: VenueScene) {
  if (
    !scene.visitorIntroduction ||
    scene.villageSeed !== state.seed ||
    scene.continuity?.setupAt !== state.setupAt ||
    scene.id !== visitorIntroductionId(state) ||
    !state.visitorIntroduction ||
    state.visitorIntroduction.completedAt
  )
    return;
  const visitor = state.visitors?.find((person) => person.characterId === PROFESSOR_MARI_ID);
  const captured = scene.continuity.facts.visitors?.find((person) => person.characterId === PROFESSOR_MARI_ID);
  if (!visitor || visitor.incarnation !== captured?.incarnation) return;
  if (scene.lines.some((line) => line.kind === "dialogue" && line.speakerId === PROFESSOR_MARI_ID)) {
    visitor.firstMetAt ||= scene.startedAt;
    visitor.trip ??= {
      arrivedAt: scene.startedAt,
      leavesAt: new Date(Date.parse(scene.startedAt) + 2 * 86_400_000).toISOString(),
    };
  }
  if (scene.status === "closed" && visitor.trip)
    visitor.trip.leavesAt = new Date(
      Math.max(Date.parse(scene.startedAt) + 1, Date.parse(scene.endedAt)),
    ).toISOString();
  state.visitorIntroduction = { sceneId: scene.id, completedAt: scene.status === "closed" ? scene.endedAt : "" };
}
