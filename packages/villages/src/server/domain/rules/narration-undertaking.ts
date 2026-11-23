import type { VillageState } from "../models/world.js";
import type { NarrationReadset } from "../models/narration-model.js";
import type { ContinuityEvidence } from "../models/continuity-model.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { projectSpeechTerms } from "./project-interpretation.js";
import { undertakingApprovers, undertakingAgreed } from "./undertaking.js";
import { narrationWitnesses, type NarrationSourceContext } from "./narration-sources.js";
import { projectAgendaReservations } from "./project-focus.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { lifecycle } from "./project-lifecycle-rules.js";
import { validateUndertaking } from "./undertaking.js";
import { assertNarrationPlayerIntent } from "./narration-scene.js";
import type { UndertakingPlan } from "../../../shared/contracts/projects.js";
import { continuityActor } from "./continuity-actors.js";

export function proposeNarratedUndertaking(
  state: VillageState,
  command: { title: string; plan: UndertakingPlan },
  readset: NarrationReadset,
  context: NarrationSourceContext,
  sources: ContinuityEvidence[],
  receiptId: string,
  at: string,
): AcceptedEpisode["commandReceipts"][number] {
  memoryRequire(!readset.manualProjectCreation, "Create Projects through New Project.");
  assertNarrationPlayerIntent(context, sources);
  memoryRequire(
    state.seed === readset.source.seed && context.episodeId === readset.source.episodeId,
    "the Project proposal belongs to another exchange",
  );
  memoryRequire(
    state.projects.filter((row) => row.status === "planning" && row.kind === "undertaking").length < 6,
    "six Project drafts maximum",
  );
  memoryRequire(
    command.plan.roles.every(
      (role) =>
        context.actors.some(
          (actor) =>
            actor.id === role.actorId && actor.incarnation === continuityActor(state, role.actorId)?.incarnation,
        ) &&
        sources.every(
          (source) =>
            source.positions?.[role.actorId] === source.positions?.player &&
            source.positions?.player === command.plan.zoneId,
        ),
    ),
    "propose roles for the people currently involved",
  );
  const project = {
    id: "project:" + memoryHash([state.seed, receiptId]).slice(0, 32),
    kind: "undertaking" as const,
    title: command.title,
    venueId: context.scene.placeId,
    participantIds: command.plan.roles.map((role) => role.actorId),
    progress: 0,
    status: "planning" as const,
    updatedAt: at,
    undertaking: { plan: structuredClone(command.plan), completed: [] },
    lifecycle: lifecycle(context.scene.placeId),
  };
  validateUndertaking(state, project);
  memoryRequire(!state.projects.some((row) => row.id === project.id), "replay the retained Project proposal");
  project.lifecycle.affectedIds = undertakingApprovers(state, project);
  state.projects.push(project);
  return {
    id: receiptId,
    kind: "project",
    targetId: project.id,
    revision: 1,
    text: "Project planned · " + project.title,
    witnesses: narrationWitnesses(sources),
  };
}

/** A completed deed can advance a plan; this supplies no physical or Wish authority. */
export function advanceNarratedUndertaking(
  state: VillageState,
  command: { project: string; step: string },
  readset: NarrationReadset,
  context: NarrationSourceContext,
  sources: ContinuityEvidence[],
  receiptId: string,
  at: string,
  admissionState: VillageState = state,
): AcceptedEpisode["commandReceipts"][number] {
  const project = state.projects.find((row) => row.id === command.project);
  const admitted = admissionState.projects.find((row) => row.id === command.project);
  const captured = readset.projects.find((row) => row.projectId === command.project);
  if (project?.kind !== "undertaking" && project?.firstUse) {
    memoryRequire(
      project.lifecycle && project.status === "complete" && !project.firstUse.completed && command.step === "first-use",
      "finish construction before the first shared use",
    );
    memoryRequire(
      captured?.phase === "ready-to-open" &&
        Date.parse(readset.capturedAt) >= Date.parse(project.lifecycle.completedAt),
      "first use must be witnessed after construction completion",
    );
    memoryRequire(
      state.seed === readset.source.seed &&
        context.episodeId === readset.source.episodeId &&
        captured &&
        admitted?.lifecycle &&
        captured.revision === admitted.lifecycle.revision &&
        memoryHash(captured.terms) === memoryHash(projectSpeechTerms(admissionState, admitted)),
      "the Project changed since this exchange was admitted",
    );
    memoryRequire(context.scene.placeId === project.venueId, "first use must happen at this Project's Venue");
    const venue = state.venues.find((row) => row.id === project.venueId);
    const observed = sources.find((source) => {
      if (source.kind !== "observation" || source.episodeId !== context.episodeId) return false;
      const witnesses = narrationWitnesses([source], ["sight"]),
        zoneId = source.positions?.player;
      const zone = venue?.zones?.find((row) => row.id === zoneId);
      return (
        zone &&
        (zone.kind !== "exterior" || venue?.zones?.every((row) => row.kind === "exterior")) &&
        witnesses.includes("player") &&
        witnesses.some(
          (id) =>
            id !== "player" &&
            source.positions?.[id] === zoneId &&
            state.villagers.some(
              (person) =>
                person.characterId === id &&
                person.incarnation === context.actors.find((actor) => actor.id === id)?.incarnation,
            ),
        ) &&
        (project.kind === "new-venue" ||
          !project.lifecycle!.changedZoneIds.some((id) => id !== "exterior") ||
          project.lifecycle!.changedZoneIds.includes(zoneId!))
      );
    });
    memoryRequire(
      observed,
      "first use needs a current shared deed seen by the player and a local Villager in the finished space",
    );
    project.firstUse.completed = {
      at,
      episodeId: context.episodeId,
      evidenceId: receiptId,
      zoneId: observed.positions!.player,
    };
    project.lifecycle.revision++;
    project.updatedAt = at;
    return {
      id: receiptId,
      kind: "project",
      targetId: project.id,
      revision: project.lifecycle.revision,
      text: project.title + " · first shared use",
      witnesses: narrationWitnesses([observed]),
    };
  }
  memoryRequire(
    project?.kind === "undertaking" && project.undertaking && project.lifecycle && project.status === "working",
    "the shared Project is not active",
  );
  const { plan, completed } = project.undertaking;
  memoryRequire(
    state.seed === readset.source.seed &&
      context.episodeId === readset.source.episodeId &&
      captured &&
      admitted?.lifecycle &&
      captured.revision === admitted.lifecycle.revision &&
      memoryHash(captured.terms) === memoryHash(projectSpeechTerms(admissionState, admitted)),
    "the shared Project changed since this exchange was admitted",
  );
  memoryRequire(
    undertakingApprovers(state, project).every((id) => undertakingAgreed(state, project, id)),
    "the shared plan needs current agreements",
  );
  const step = plan.milestones[completed.length];
  memoryRequire(
    step && step.id === command.step && !completed.some((row) => row.evidenceId === receiptId),
    "complete the current milestone once",
  );
  const observations = sources.filter(
    (source) => source.kind === "observation" && source.episodeId === context.episodeId,
  );
  const witnesses = narrationWitnesses(observations, ["sight"]);
  const participants = plan.roles.filter((role) => witnesses.includes(role.actorId));
  memoryRequire(
    observations.length > 0 && witnesses.includes("player") && participants.length > 0,
    "shared progress needs a current deed seen by the player and a participating Villager",
  );
  if (step.kind === "first-use") {
    memoryRequire(
      context.scene.placeId === project.venueId &&
        observations.some((source) => source.positions?.player === plan.zoneId),
      "first use must happen in the agreed Zone",
    );
    memoryRequire(
      !plan.constructionId ||
        state.projects.some(
          (row) => row.id === plan.constructionId && row.kind !== "undertaking" && row.status === "complete",
        ),
      "finish the linked physical work before first use",
    );
  }
  completed.push({ milestoneId: step.id, at, episodeId: context.episodeId, evidenceId: receiptId });
  project.progress = Math.round((100 * completed.length) / plan.milestones.length);
  project.updatedAt = at;
  project.lifecycle.revision++;
  if (completed.length === plan.milestones.length) {
    project.status = project.lifecycle.phase = "complete";
    project.lifecycle.completedAt = at;
  }
  projectAgendaReservations(state, new ZonedDate(at, state.timeZone));
  return {
    id: receiptId,
    kind: "project",
    targetId: project.id,
    revision: project.lifecycle.revision,
    text: project.title + ": " + step.title + (project.status === "complete" ? " · complete" : ""),
    witnesses: narrationWitnesses(sources),
  };
}
