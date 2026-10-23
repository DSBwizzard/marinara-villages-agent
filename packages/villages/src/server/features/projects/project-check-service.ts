import { refreshProjectAgreements } from "../../domain/rules/project-lifecycle-rules.js";
import type { InterpretationCheck, InterpretationEvidence } from "../../domain/models/interpretation-check-model.js";
import type { InterpretationBatch } from "../../domain/models/interpretation-model.js";
import type { VenueLine, VenueScene } from "../../domain/models/scene-model.js";
import type { VillageState } from "../../domain/models/world.js";
import { projectSpeechContexts, type ProjectSpeechProposal } from "../../domain/rules/project-interpretation.js";
import { projectExchangeRelevant } from "../../domain/rules/project-check-rules.js";
import type { SceneQueries } from "../scenes/services.js";

export interface ProjectChecksPorts {
  readVillageState(): Promise<VillageState>;
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  sceneQueries(): Pick<SceneQueries, "readProjectTurnEvidence">;
  pipelineSignal(name: "projectRelevanceSkips"): void;
  contextualChecks: typeof import("../generation/interpretation-evidence.js").contextualChecks;
  boundInterpretationEvidence: typeof import("../../domain/rules/interpretation-evidence-rules.js").boundInterpretationEvidence;
  routeInterpretationChecks: typeof import("../../domain/rules/interpretation-routing.js").routeInterpretationChecks;
  recordInterpretationRouting: typeof import("../generation/interpretation.js").recordInterpretationRouting;
  interpretChecks(checks: InterpretationCheck[], stage: string, sceneId?: string): Promise<InterpretationBatch>;
  saveInterpretationContext: typeof import("../generation/interpretation-evidence.js").saveInterpretationContext;
  writeInterpretationDiagnostics: typeof import("../generation/interpretation-diagnostics.js").writeInterpretationDiagnostics;
}

/** Inert Project interpretation, diagnostics and verified-pickup coordination. */
export function createProjectChecks({
  readVillageState,
  pipelineSignal,
  contextualChecks,
  boundInterpretationEvidence,
  routeInterpretationChecks,
  recordInterpretationRouting,
  interpretChecks,
  saveInterpretationContext,
  writeInterpretationDiagnostics,
}: ProjectChecksPorts) {
  /** Discover from live task phases and actual speakers, never from a positive score or a keyword list. */
  function projectInterpretationChecks(
    scene: VenueScene,
    village: VillageState,
    message: string,
    draft: (Pick<VenueLine, "speakerId" | "content" | "kind" | "heardBy" | "contactHidden" | "contactReport"> &
      Partial<Pick<VenueLine, "role" | "attentionEvidence">>)[],
    heardPlayerBy: string[],
    key: string,
  ): InterpretationCheck[] {
    refreshProjectAgreements(village);
    const speakers = [
      ...new Set(
        draft
          .filter(
            (line) =>
              !line.contactHidden &&
              !line.contactReport &&
              line.kind !== "narration" &&
              line.kind !== "side" &&
              line.kind !== "whisper",
          )
          .map((line) => line.speakerId),
      ),
    ];
    return projectSpeechContexts(village, speakers, "").flatMap((context) => {
      const project = village.projects.find((entry) => entry.id === context.projectId)!;
      const flow = project.lifecycle!;
      return speakers.flatMap((actor) => {
        const witnessedMessage = heardPlayerBy.includes(actor)
          ? message
          : draft
              .filter((line) => line.attentionEvidence && line.role === "user" && line.heardBy.includes(actor))
              .map((line) => line.content)
              .join("\n");
        if (!projectExchangeRelevant(scene, project, context.revision, actor, witnessedMessage, draft)) {
          pipelineSignal("projectRelevanceSkips");
          return [];
        }
        const kinds: ("approval" | "builder" | "withdrawal")[] =
          flow.phase === "working"
            ? ["withdrawal"]
            : [...(flow.affectedIds.includes(actor) ? ["approval" as const] : []), "builder", "withdrawal"];
        const name = village.villagers.find((person) => person.characterId === actor)?.cardSnapshot.name ?? actor;
        const history = scene.lines.filter(
          (line) =>
            (!line.contactHidden || line.attentionEvidence) &&
            !line.contactReport &&
            line.kind !== "side" &&
            line.kind !== "whisper" &&
            (line.speakerId === actor || line.heardBy.includes(actor)),
        );
        const evidence: InterpretationEvidence[] = [
          ...history.map((line) => ({
            id: line.id,
            speakerId: line.role === "user" ? "player" : line.speakerId,
            name: line.role === "user" ? village.playerPersonaName || "Player" : line.name,
            content: line.content,
            kind: line.kind,
          })),
          ...(message && heardPlayerBy.includes(actor)
            ? [
                {
                  id: "player-input",
                  speakerId: "player",
                  name: village.playerPersonaName || "Player",
                  content: message,
                },
              ]
            : []),
          ...draft.flatMap((line, index) =>
            line.attentionEvidence && line.heardBy.includes(actor)
              ? [
                  {
                    id: `draft:${index}`,
                    speakerId: line.role === "user" ? "player" : "__venue_scene__",
                    name: line.role === "user" ? "Player" : "Sound",
                    content: line.content,
                    kind: line.kind,
                    current: true,
                  },
                ]
              : [],
          ),
          ...draft.flatMap((line, index) =>
            !line.contactHidden &&
            !line.contactReport &&
            line.speakerId === actor &&
            line.kind !== "narration" &&
            line.kind !== "side" &&
            line.kind !== "whisper"
              ? [
                  {
                    id: `draft:${index}`,
                    speakerId: actor,
                    name,
                    content: line.content,
                    kind: line.kind,
                    current: true,
                  },
                ]
              : [],
          ),
        ];
        return kinds.map((kind) => {
          const outcome = kind === "approval" ? "approve" : kind === "withdrawal" ? "withdraw" : "commit";
          return {
            id: `${key}:${project.id}:${actor}:${kind}`,
            domain: "project" as const,
            question:
              "Did " +
              name +
              " " +
              (kind === "approval"
                ? "approve"
                : kind === "withdrawal"
                  ? "explicitly withdraw from"
                  : "commit to leading") +
              " " +
              project.title +
              "?",
            outcomes: [
              {
                id: outcome,
                statement:
                  kind === "withdrawal"
                    ? "This resident explicitly withdraws their approval or willingness to lead this specific Project."
                    : name +
                      (kind === "approval"
                        ? " unconditionally approves this physical design."
                        : " personally commits to leading this Project; capability, offers of objects and conditional willingness are insufficient."),
              },
            ],
            evidence,
            facts: {
              ...context,
              actorId: actor,
              kind,
              title: project.title,
              description: flow.change?.detail ?? project.venueDraft?.description ?? "",
              venueId: project.venueId,
              playerId: "player",
              playerName: village.playerPersonaName,
              affectedIds: flow.affectedIds,
              builderId: flow.builderId,
              instructions:
                "Do not apply one ambiguous answer to multiple Projects. Distinguish discussion, capability, conditional willingness, present commitment and completed work. A lack of materials is not necessarily a condition on willingness. Quotations or other people's agreements are not this person's commitment.",
            },
          } satisfies InterpretationCheck;
        });
      });
    });
  }

  async function interpretProjectDraft(
    scene: VenueScene,
    village: VillageState,
    message: string,
    draft: Pick<VenueLine, "speakerId" | "content" | "kind" | "heardBy" | "contactHidden" | "contactReport">[],
    heardPlayerBy: string[],
    key: string,
    routing?: unknown,
    projectActors: string[] = [],
  ) {
    const checks = projectInterpretationChecks(scene, village, message, draft, heardPlayerBy, key);
    const selection = routeInterpretationChecks(
      (await contextualChecks(scene.id, checks)).map(boundInterpretationEvidence),
      routing,
      {
        actorIds: [...scene.activeIds, ...draft.map((line) => line.speakerId)],
        projectActors: scene.pendingProjectQuestions?.length ? scene.activeIds : projectActors,
      },
    );
    await recordInterpretationRouting(scene.id, selection).catch(() => {});
    return selection.checks.length
      ? interpretChecks(selection.checks, `project-interpretation:${key}`, scene.id)
      : null;
  }

  async function finalizeProjectDiagnostics(
    sceneId: string,
    batch: InterpretationBatch,
    proposals: ProjectSpeechProposal[],
    submissionId?: string,
  ) {
    await saveInterpretationContext(sceneId, batch, submissionId).catch(() => {});
    const state = await readVillageState();
    for (const trace of batch.traces) {
      const proposal = proposals.find((item) => item.contextual?.checkId === trace.id);
      if (!proposal) {
        if (trace.applied === "Not yet applied")
          trace.applied =
            trace.result.outcome === "unresolved" ? "Unresolved: natural clarification needed" : "No Project change";
        continue;
      }
      const project = state.projects.find((item) => item.id === proposal.projectId);
      const recorded = project?.lifecycle?.spokenProofs.some((proof) => proof.lineId === proposal.citations[0]?.lineId);
      const task = state.progressTasks.find((item) => item.definition.owner.id === proposal.projectId);
      const reason = task?.attempts.findLast((attempt) =>
        attempt.evidenceId.endsWith(`:${proposal.citations[0]?.lineId}`),
      )?.reason;
      trace.applied = recorded
        ? `Project ${proposal.kind} recorded using ${trace.result.source}; authority, revision and citations validated`
        : `Rejected or deferred: ${reason || "saved Project state has not accepted this proposal"}`;
    }
    await writeInterpretationDiagnostics(sceneId, batch.traces).catch(() => {});
  }

  return { interpretProjectDraft, finalizeProjectDiagnostics };
}
export type ProjectChecks = ReturnType<typeof createProjectChecks>;
