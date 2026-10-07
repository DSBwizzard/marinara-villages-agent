import type { InterpretationCheck, InterpretationEvidence } from "../../domain/models/interpretation-check-model.js";
import type { InterpretationBatch } from "../../domain/models/interpretation-model.js";
import type { VenueLine, VenueScene } from "../../domain/models/scene-model.js";
import type { VillageState } from "../../domain/models/world.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { projectSpeechContexts, type ProjectSpeechProposal } from "../../domain/rules/project-interpretation.js";
import {
  applyRecordedProjectPickup,
  pickupRevision,
  projectExchangeRelevant,
} from "../../domain/rules/project-check-rules.js";
import { physicalVenueEvents } from "../../domain/rules/venue-scene-state.js";
import type { SceneQueries } from "../scenes/services.js";

export interface ProjectChecksPorts {
  readVillageState(): Promise<VillageState>;
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  sceneQueries(): Pick<SceneQueries, "readProjectTurnEvidence">;
  pipelineSignal(name: "projectRelevanceSkips"): void;
  contextualChecks: typeof import("../generation/interpretation-evidence.js").contextualChecks;
  boundInterpretationEvidence: typeof import("../generation/interpretation-evidence.js").boundInterpretationEvidence;
  routeInterpretationChecks: typeof import("../generation/interpretation-routing.js").routeInterpretationChecks;
  recordInterpretationRouting: typeof import("../generation/interpretation-routing.js").recordInterpretationRouting;
  interpretChecks(checks: InterpretationCheck[], stage: string, sceneId?: string): Promise<InterpretationBatch>;
  saveInterpretationContext: typeof import("../generation/interpretation-evidence.js").saveInterpretationContext;
  writeInterpretationDiagnostics: typeof import("../generation/interpretation-diagnostics.js").writeInterpretationDiagnostics;
}

/** Inert Project interpretation, diagnostics and verified-pickup coordination. */
export function createProjectChecks({
  readVillageState,
  mutateVillageState,
  sceneQueries,
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
    draft: Pick<VenueLine, "speakerId" | "content" | "kind" | "heardBy" | "contactHidden" | "contactReport">[],
    heardPlayerBy: string[],
    key: string,
  ): InterpretationCheck[] {
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
        if (
          !["approval", "builder", "requirements"].includes(flow.phase) &&
          !(flow.phase === "construction" && project.status === "blocked")
        )
          return [];
        if (!projectExchangeRelevant(scene, project, context.revision, actor, message, draft)) {
          pipelineSignal("projectRelevanceSkips");
          return [];
        }
        const kind =
          flow.phase === "approval"
            ? "approval"
            : flow.phase === "requirements" && actor === flow.builderId
              ? "requirements"
              : "builder";
        if (kind === "approval" && !flow.affectedIds.includes(actor)) return [];
        const name = village.villagers.find((person) => person.characterId === actor)?.cardSnapshot.name ?? actor;
        const history = scene.lines.filter(
          (line) =>
            !line.contactHidden &&
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
        const currentPhaseAt = village.progressTasks
          .find((task) => task.definition.owner.id === project.id)
          ?.transitions.at(-1)?.at;
        const requirementCitationIds = history
          .filter(
            (line) =>
              line.speakerId === actor &&
              (!currentPhaseAt || line.at >= currentPhaseAt) &&
              scene.submissions.some(
                (turn) =>
                  turn.replyLineIds?.includes(line.id) &&
                  turn.projectContexts?.some(
                    (item) =>
                      item.projectId === context.projectId &&
                      item.revision === context.revision &&
                      item.phase === context.phase,
                  ),
              ),
          )
          .map((line) => line.id);
        const outcome = kind === "approval" ? "approve" : kind === "requirements" ? "requirements" : "commit";
        return [
          {
            id: `${key}:${project.id}:${actor}:${kind}`,
            domain: "project" as const,
            question:
              kind === "requirements"
                ? `What complete current requirements did ${name} define for ${project.title}?`
                : `Did ${name} personally ${kind === "approval" ? "approve" : "commit to building"} ${project.title}?`,
            outcomes: [
              {
                id: outcome,
                statement: `${name} ${kind === "approval" ? "personally approves this specific change" : kind === "builder" ? "personally commits to building this specific Project, rather than merely stating capability or conditional willingness" : "defines a complete faithful checklist"} in the latest exchange, resolving references from the witnessed conversation.`,
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
              currentRequirements: flow.requirements,
              requirementCitationIds,
              instructions:
                "Do not apply one ambiguous answer to multiple Projects. Distinguish discussion, capability, conditional willingness, present commitment and completed work. A lack of materials is not necessarily a condition on willingness. Quotations or other people's agreements are not this person's commitment.",
            },
            ...(kind === "requirements"
              ? {
                  decisionEligible: false,
                  systemInstruction:
                    'For outcome requirements, return details:{citations:[{evidenceId,quote}],checklist:[{category:"structure"|"equipment"|"finish",title:"faithful concise item and specifications",needed:boolean,citation:0}]}. Exactly three categories; never infer missing categories. Explicit unnecessary categories need no prescribed phrase. Use latest requirements, including changed requirements across exchanges. Historical requirement citations must be in facts.requirementCitationIds; current draft citations are also permitted. Every item must have an exact quote from the assigned builder. Include at least one current draft citation first. If incomplete, ambiguous, or unsupported, return unresolved and no checklist.',
                }
              : {}),
          },
        ];
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

  /** Allocate an already completed, inventory-debited pickup; interpretation cannot authorize the transfer itself. */
  async function applyProjectPickup(sceneId: string, submissionId: string) {
    const state = await readVillageState();
    const event = physicalVenueEvents(state).find((item) => item.actionReceipt?.submissionId === submissionId);
    const proof = event?.actionReceipt;
    if (
      !event ||
      !proof?.happened ||
      proof.itemTransfer?.recipientId !== "player" ||
      proof.removeItem !== proof.itemTransfer.itemName ||
      state.projectSourceClaims.some((claim) => claim.sourceId === event.id)
    )
      return;
    const turn = await sceneQueries().readProjectTurnEvidence(sceneId, submissionId);
    const checks: InterpretationCheck[] = state.projects.flatMap((project) =>
      project.lifecycle?.phase === "materials"
        ? project.lifecycle.requirements
            .filter(
              (item) =>
                item.needed &&
                !item.carriedAt &&
                project.lifecycle!.sources.some(
                  (source) =>
                    source.requirementId === item.id &&
                    source.kind === "existing-item" &&
                    !source.acquiredAt &&
                    source.venueId === event.venueId &&
                    (!source.zoneId || source.zoneId === event.zoneId) &&
                    source.itemName === proof.removeItem,
                ),
            )
            .map((item) => ({
              id: `${submissionId}:${project.id}:${item.id}`,
              domain: "project" as const,
              question: `Does this recorded pickup satisfy ${item.title} for ${project.title}?`,
              outcomes: [
                {
                  id: "allocate",
                  statement:
                    "The recorded item actually satisfies this specific Project requirement and the player's contextual intent identifies this Project.",
                },
              ],
              decisionEligible: false,
              decisionReason: "Recorded supply allocation uses System; the physical transfer is already validated",
              facts: {
                projectId: project.id,
                requirementId: item.id,
                revision: pickupRevision(state, project.id),
                phase: project.lifecycle!.phase,
                title: project.title,
                requirement: item.title,
                recordedItem: proof.itemTransfer!.itemName,
                transferId: event.id,
                playerId: "player",
                message: turn.message,
              },
              evidence: [
                ...turn.contextLines.map((line) => ({
                  id: line.id,
                  speakerId: line.role === "user" ? "player" : line.speakerId,
                  name: line.name,
                  kind: line.kind,
                  content: line.content,
                })),
                {
                  id: event.id,
                  speakerId: "player",
                  name: "Verified pickup",
                  kind: "receipt",
                  content: event.text,
                  current: true,
                },
              ],
            }))
        : [],
    );
    if (!checks.length) return;
    const batch = await interpretChecks(checks, `recorded-supply:${submissionId}`, sceneId);
    const candidates = batch.results.flatMap((result, index) =>
      result.outcome === "allocate" && result.evidenceIds.includes(event.id) ? [index] : [],
    );
    if (candidates.length !== 1) {
      for (const trace of batch.traces)
        trace.applied =
          candidates.length > 1
            ? "Unresolved: choose which Project receives this acquired supply"
            : "No Project allocation; the pickup remains recorded";
      await writeInterpretationDiagnostics(sceneId, batch.traces).catch(() => {});
      return;
    }
    const index = candidates[0],
      facts = asRecord(batch.checks[index].facts);
    let recorded = false;
    await mutateVillageState((current) => {
      recorded = applyRecordedProjectPickup(
        current,
        event.id,
        String(facts.projectId),
        String(facts.requirementId),
        Number(facts.revision),
        submissionId,
      );
    });
    for (const [i, trace] of batch.traces.entries())
      trace.applied =
        i === index
          ? recorded
            ? "Acquired supply allocated using System; actual inventory transfer and current requirement validated"
            : "Rejected: current transfer or Project state changed"
          : "No Project allocation";
    await writeInterpretationDiagnostics(sceneId, batch.traces).catch(() => {});
  }

  return { interpretProjectDraft, finalizeProjectDiagnostics, applyProjectPickup };
}
export type ProjectChecks = ReturnType<typeof createProjectChecks>;
