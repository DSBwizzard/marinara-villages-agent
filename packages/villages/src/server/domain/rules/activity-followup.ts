import type { SceneFollowup } from "../models/resident-plans.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type { VenueScene } from "../models/scene-model.js";
import type { VillageState } from "../models/world.js";
import { continuityActor } from "./continuity-actors.js";
import { actorEpisodeView } from "./episodes.js";
import { agendaDateKey } from "./agenda-week.js";
import { memoryHash } from "./memory-integrity.js";

export function activityMoments(
  state: VillageState,
  activity: Pick<SceneFollowup, "resident" | "playerIncarnation" | "sceneId" | "purpose">,
) {
  const { sceneId } = activity;
  const resident = continuityActor(state, activity.resident.id);
  const player = continuityActor(state, "player");
  if (resident?.incarnation !== activity.resident.incarnation || player?.incarnation !== activity.playerIncarnation)
    return [];
  return state.episodes.records
    .filter(
      (episode) =>
        episode.sceneId === sceneId &&
        episode.submissionId !== "greeting" &&
        episode.actors.some(
          (actor) =>
            actor.id === resident.id &&
            episode.actors.some((other) => other.id === player.id && other.zoneId === actor.zoneId),
        ),
    )
    .slice(-12)
    .flatMap((episode) => {
      const theirView = actorEpisodeView(episode, state.continuity, { kind: "actor", ...resident }, state.episodes);
      const ourView = actorEpisodeView(episode, state.continuity, { kind: "actor", ...player }, state.episodes);
      if (!theirView || !ourView) return [];
      const input = activity.purpose
        ? []
        : theirView.input.filter(
            (excerpt) =>
              ["words", "sight"].includes(excerpt.channel) &&
              ourView.input.some((row) => row.id === excerpt.id && row.text === excerpt.text),
          );
      const segments = theirView.segments.filter(
        (segment) =>
          (segment.speakerId === resident.id || segment.kind === "narration") &&
          segment.channel !== "sound-only" &&
          segment.channel !== "private" &&
          ourView.segments.some(
            (row) => row.id === segment.id && row.text === segment.text && row.channel === segment.channel,
          ),
      );
      return [...input, ...segments].map((moment) => ({ id: moment.id, text: moment.text.slice(0, 1200) }));
    })
    .slice(-12);
}

export function recordSceneFollowup(state: VillageState, scene: VenueScene) {
  if (
    scene.status !== "closed" ||
    !["player", "scene"].includes(scene.endReason) ||
    scene.villageSeed !== state.seed ||
    !scene.endedAt ||
    Object.values(state.residentPlans.activities ?? {}).some((row) => row.sceneId === scene.id)
  )
    return;
  const settled = new Set(
    scene.submissions.flatMap((turn) =>
      turn.mode === "chat" && turn.id !== "greeting" && turn.acceptance.status === "applied" && turn.episodeId
        ? [turn.episodeId]
        : [],
    ),
  );
  if (!settled.size) return;
  const player = continuityActor(state, "player")!;
  const cast = new Map(state.villagers.map((resident) => [resident.characterId, resident.incarnation]));
  const candidates = new Map<string, SceneFollowup>();
  for (const episode of state.episodes.records) {
    if (!settled.has(episode.id) || episode.sceneId !== scene.id) continue;
    const witness = episode.actors.find((actor) => actor.id === "player" && actor.incarnation === player.incarnation);
    if (!witness) continue;
    for (const { id, incarnation, zoneId } of episode.actors) {
      if (zoneId !== witness.zoneId || cast.get(id) !== incarnation) continue;
      candidates.set(id, {
        id: "scene-followup-" + memoryHash([state.seed, scene.id]).slice(0, 32),
        resident: { id, incarnation },
        playerIncarnation: player.incarnation,
        sceneId: scene.id,
        endedAt: scene.endedAt,
        outcome: "pending",
      });
    }
  }
  const picked = [...candidates.values()]
    .map((row) => ({ row, moments: activityMoments(state, row).length }))
    .filter(({ moments }) => moments > 0)
    .sort((a, b) => b.moments - a.moments)[0]?.row;
  if (picked) state.residentPlans.activities = { ...state.residentPlans.activities, [picked.id]: picked };
}

export function keepsakeAvailable(state: VillageState, activity: SceneFollowup, at: string) {
  const zone = state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localDay = (instant: string) => Date.parse(agendaDateKey(new ZonedDate(instant, zone)));
  const today = localDay(at);
  return !Object.values(state.residentPlans.activities ?? {}).some((row) => {
    if (
      !row.keepsake ||
      row.resident.id !== activity.resident.id ||
      row.resident.incarnation !== activity.resident.incarnation ||
      row.playerIncarnation !== activity.playerIncarnation
    )
      return false;
    const letter = state.mailbox.messages[row.keepsake.letterId];
    return letter?.status === "delivered" && today - localDay(letter.deliveredAt ?? letter.at) < 3 * 86_400_000;
  });
}
