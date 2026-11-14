import type { CompletedActivity } from "../models/resident-plans.js";
import type { VenueScene } from "../models/scene-model.js";
import type { VillageState } from "../models/world.js";
import { continuityActor } from "./continuity-actors.js";
import { actorEpisodeView } from "./episodes.js";

export function activityMoments(state: VillageState, activity: Pick<CompletedActivity, "appointment" | "sceneId">) {
  const { appointment, sceneId } = activity;
  const resident = continuityActor(state, appointment.resident.id);
  const player = continuityActor(state, "player");
  if (
    resident?.incarnation !== appointment.resident.incarnation ||
    player?.incarnation !== appointment.playerIncarnation
  )
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
      return theirView.segments
        .filter(
          (segment) =>
            (segment.speakerId === resident.id || segment.kind === "narration") &&
            segment.channel !== "sound-only" &&
            segment.channel !== "private" &&
            ourView.segments.some(
              (row) => row.id === segment.id && row.text === segment.text && row.channel === segment.channel,
            ),
        )
        .map((segment) => ({ id: segment.id, text: segment.text.slice(0, 1200) }));
    })
    .slice(-12);
}

export function recordCompletedActivity(state: VillageState, scene: VenueScene) {
  const appointment = scene.activity;
  if (
    !appointment ||
    scene.villageSeed !== state.seed ||
    !scene.endedAt ||
    Object.hasOwn(state.residentPlans.activities ?? {}, appointment.id)
  )
    return;
  const activity: CompletedActivity = {
    appointment,
    sceneId: scene.id,
    endedAt: scene.endedAt,
    outcome: "quiet",
  };
  if (
    ["player", "scene"].includes(scene.endReason) &&
    scene.submissions.some(
      (turn) =>
        turn.mode === "chat" &&
        turn.id !== "greeting" &&
        turn.acceptance.status === "applied" &&
        turn.episodeId &&
        state.episodes.records.some(
          (episode) =>
            episode.id === turn.episodeId &&
            episode.sceneId === scene.id &&
            episode.actors.some(
              (actor) =>
                actor.id === appointment.resident.id &&
                actor.incarnation === appointment.resident.incarnation &&
                episode.actors.some(
                  (other) =>
                    other.id === "player" &&
                    other.incarnation === appointment.playerIncarnation &&
                    other.zoneId === actor.zoneId,
                ),
            ),
        ),
    ) &&
    activityMoments(state, activity).length
  )
    activity.outcome = "pending";
  state.residentPlans.activities = { ...state.residentPlans.activities, [appointment.id]: activity };
}
