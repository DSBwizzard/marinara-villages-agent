import type { VillageState } from "./types.js";
import type { VenueScene, VenueLine } from "./venue-session.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import {
  interpretChecks,
  type InterpretationBatch,
  type InterpretationCheck,
  type InterpretationEvidence,
} from "./interpretation.js";
import {
  projectSpeechContexts,
  legacyProjectRevision,
  validateProjectSpeech,
  type ProjectSpeechProposal,
} from "./project-interpretation.js";
import { readVillageState, mutateVillageState } from "./village-store.js";
import { writeInterpretationDiagnostics } from "./interpretation-diagnostics.js";
import { recordProjectProgress } from "./project-progress.js";

function pickupRevision(state: VillageState, projectId: string) {
  const project = state.projects.find((item) => item.id === projectId);
  return state.progressEngineVersion === 1
    ? state.progressTasks.find(
        (item) => item.definition.owner.kind === "project" && item.definition.owner.id === projectId,
      )?.definition.revision
    : project && legacyProjectRevision(project);
}

/** Apply a semantic allocation only against an existing inventory-debited receipt. */
export function applyRecordedProjectPickup(
  state: VillageState,
  eventId: string,
  projectId: string,
  requirementId: string,
  revision: number,
  submissionId: string,
) {
  const event = state.venueEvents.find((item) => item.id === eventId),
    receipt = event?.actionReceipt;
  const project = state.projects.find((item) => item.id === projectId),
    flow = project?.lifecycle;
  const requirement = flow?.requirements.find((item) => item.id === requirementId && item.needed);
  if (
    !event ||
    !project ||
    !flow ||
    !requirement ||
    requirement.carriedAt ||
    flow.phase !== "materials" ||
    pickupRevision(state, project.id) !== revision ||
    !receipt?.happened ||
    receipt.submissionId !== submissionId ||
    receipt.transferTo !== "player" ||
    receipt.itemTransfer?.recipientId !== "player" ||
    receipt.removeItem !== receipt.itemTransfer.itemName ||
    !receipt.removeItem ||
    state.projectSourceClaims.some((claim) => claim.sourceId === event.id)
  )
    return false;
  if (state.progressEngineVersion === 1) {
    const source = flow.sources.find((item) => item.requirementId === requirementId);
    // Selected finite physical stock is already debited by Act. No second debit or invented supplier handoff.
    if (
      !source ||
      source.kind !== "existing-item" ||
      source.acquiredAt ||
      source.venueId !== event.venueId ||
      (source.zoneId && source.zoneId !== event.zoneId) ||
      source.itemName !== receipt.removeItem ||
      !Number.isFinite(Date.parse(source.at)) ||
      Date.parse(event.at) < Date.parse(source.at) ||
      !flow.recordedItems.some(
        (item) =>
          item.venueId === source.venueId &&
          item.itemName === source.itemName &&
          (!source.zoneId || item.zoneId === source.zoneId),
      )
    )
      return false;
    source.acquiredAt = event.at;
    requirement.carriedAt = event.at;
    recordProjectProgress(state, project, `acquired:${requirementId}`, {
      id: `pickup:${event.id}`,
      kind: "project-handoff",
      at: event.at,
      sourceId: event.id,
      lineId: event.id,
      speakerId: "player",
      venueId: event.venueId,
      zoneId: event.zoneId,
      excerpt: `Verified pickup of ${source.itemName}`,
    });
  } else requirement.carriedAt = event.at;
  state.projectSourceClaims.push({ key: `acquired-transfer:${event.id}`, projectId, sourceId: event.id, submissionId });
  flow.evidenceIds = [...new Set([...flow.evidenceIds, event.id])];
  project.updatedAt = event.at;
  return true;
}

/** Discover from live task phases and actual speakers, never from a positive score or a keyword list. */
export function projectInterpretationChecks(
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
          ? [{ id: "player-input", speakerId: "player", name: village.playerPersonaName || "Player", content: message }]
          : []),
        ...draft.flatMap((line, index) =>
          !line.contactHidden &&
          !line.contactReport &&
          line.speakerId === actor &&
          line.kind !== "narration" &&
          line.kind !== "side" &&
          line.kind !== "whisper"
            ? [{ id: `draft:${index}`, speakerId: actor, name, content: line.content, kind: line.kind, current: true }]
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

export function projectProposals(batch: InterpretationBatch): ProjectSpeechProposal[] {
  return batch.results.flatMap((result, index) => {
    const check = batch.checks[index],
      facts = asRecord(check.facts);
    const kind = facts.kind as ProjectSpeechProposal["kind"];
    if (!["approve", "commit", "requirements"].includes(result.outcome)) return [];
    const conflicting = batch.results.some(
      (other, otherIndex) =>
        otherIndex !== index &&
        ["approve", "commit"].includes(other.outcome) &&
        asRecord(batch.checks[otherIndex].facts).actorId === facts.actorId &&
        asRecord(batch.checks[otherIndex].facts).kind === kind,
    );
    if (conflicting) {
      batch.traces[index].applied = "Unresolved: multiple Project targets require clarification";
      return [];
    }
    const details = asRecord(result.details);
    const allowed = check.evidence.filter(
      (line) =>
        line.current || (Array.isArray(facts.requirementCitationIds) && facts.requirementCitationIds.includes(line.id)),
    );
    const citations =
      kind === "requirements" && Array.isArray(details.citations)
        ? details.citations.slice(0, 12).map((value) => {
            const row = asRecord(value),
              line = allowed.find((item) => item.id === row.evidenceId);
            return { lineId: line?.id ?? "", quote: asTrimmedString(row.quote) };
          })
        : check.evidence
            .filter(
              (line) =>
                line.current &&
                line.speakerId === facts.actorId &&
                (result.source === "decisions" || result.evidenceIds.includes(line.id)),
            )
            .map((line) => ({ lineId: line.id, quote: line.content }));
    if (
      !citations.length ||
      !citations[0].lineId.startsWith("draft:") ||
      citations.some((citation) => {
        const line = allowed.find((item) => item.id === citation.lineId);
        return !line || line.speakerId !== facts.actorId || !citation.quote || !line.content.includes(citation.quote);
      })
    ) {
      batch.traces[index].applied = "Rejected: Project interpretation has no exact current speaker evidence";
      return [];
    }
    const checklist =
      kind === "requirements" && Array.isArray(details.checklist)
        ? details.checklist.map((value) => {
            const row = asRecord(value);
            return {
              category: row.category as "structure" | "equipment" | "finish",
              title: asTrimmedString(row.title),
              needed: row.needed as boolean,
              citation: Number(row.citation),
            };
          })
        : [];
    if (
      kind === "requirements" &&
      (checklist.length !== 3 ||
        new Set(checklist.map((item) => item.category)).size !== 3 ||
        checklist.some(
          (item) =>
            !["structure", "equipment", "finish"].includes(item.category) ||
            typeof item.needed !== "boolean" ||
            !item.title ||
            item.title.length > 100 ||
            !Number.isInteger(item.citation) ||
            !citations[item.citation],
        ))
    ) {
      batch.traces[index].applied = "Unresolved: incomplete or uncited checklist";
      return [];
    }
    batch.traces[index].applied = "Project proposal awaiting saved-state validation";
    return [
      {
        version: 1 as const,
        projectId: String(facts.projectId),
        revision: Number(facts.revision),
        phase: String(facts.phase),
        kind,
        speakerId: String(facts.actorId),
        citations: citations.map((item) => ({
          ...item,
          lineId: item.lineId.startsWith("draft:") ? item.lineId.slice(6) : item.lineId,
        })),
        checklist,
        contextual: { version: 1 as const, source: result.source, checkId: batch.traces[index].id },
      },
    ];
  });
}

export async function interpretProjectDraft(
  scene: VenueScene,
  village: VillageState,
  message: string,
  draft: Pick<VenueLine, "speakerId" | "content" | "kind" | "heardBy" | "contactHidden" | "contactReport">[],
  heardPlayerBy: string[],
  key: string,
) {
  const checks = projectInterpretationChecks(scene, village, message, draft, heardPlayerBy, key);
  return checks.length ? interpretChecks(checks, `project-interpretation:${key}`, scene.id) : null;
}

export async function finalizeProjectDiagnostics(
  sceneId: string,
  batch: InterpretationBatch,
  proposals: ProjectSpeechProposal[],
) {
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

/** Older Villages retain their lifecycle, but use the same semantic interface without speech-as-stock. */
export async function applyLegacyProjectInterpretation(sceneId: string, submissionId: string) {
  if ((await readVillageState()).progressEngineVersion === 1) return;
  const turn = await (await import("./venue-session.js")).readProjectTurnEvidence(sceneId, submissionId);
  await mutateVillageState((state) => {
    for (const proposal of turn.projectSpeech) {
      const project = state.projects.find((item) => item.id === proposal.projectId),
        flow = project?.lifecycle;
      const line = turn.lines.find((item) => item.id === proposal.citations[0]?.lineId);
      if (
        !project ||
        !flow ||
        !line ||
        line.speakerId !== proposal.speakerId ||
        !turn.activeIdsAtTurn.includes(line.speakerId) ||
        !state.villagers.some((person) => person.characterId === line.speakerId) ||
        legacyProjectRevision(project) !== proposal.revision ||
        flow.phase !== proposal.phase ||
        flow.evidenceIds.includes(line.id) ||
        validateProjectSpeech(proposal, [...turn.lines, ...turn.contextLines])
      )
        continue;
      if (
        proposal.kind === "approval" &&
        flow.phase === "approval" &&
        project.kind === "renovation" &&
        flow.affectedIds.includes(line.speakerId)
      ) {
        if (!flow.approvals.some((item) => item.residentId === line.speakerId))
          flow.approvals.push({ residentId: line.speakerId, source: "conversation", evidenceId: line.id, at: turn.at });
        if (flow.affectedIds.every((id) => flow.approvals.some((item) => item.residentId === id)))
          flow.phase = flow.completedAt ? "finishing" : "builder";
      } else if (proposal.kind === "builder" && ["builder", "requirements", "materials"].includes(flow.phase)) {
        if (!flow.candidates.some((item) => item.residentId === line.speakerId))
          flow.candidates.push({ residentId: line.speakerId, evidenceId: line.id, at: turn.at });
      } else if (
        proposal.kind === "requirements" &&
        flow.phase === "requirements" &&
        flow.builderId === line.speakerId
      ) {
        flow.requirements = proposal.checklist.map((item, index) => ({
          id: `${project.id}:${index}:${item.category}`,
          category: item.category,
          title: item.title,
          needed: item.needed,
          carriedAt: "",
          deliveredAt: "",
        }));
        flow.requirementsEvidenceId = line.id;
      } else continue;
      flow.evidenceIds = [...new Set([...flow.evidenceIds, line.id])];
      flow.spokenProofs.push({
        lineId: line.id,
        sessionId: sceneId,
        submissionId,
        speakerId: line.speakerId,
        venueId: turn.venueId,
        zoneId: turn.zoneId,
        quote: line.content.slice(0, 300),
        at: turn.at,
        grade: "cited-interpretation",
        interpretationVersion: 1,
        citations: proposal.citations,
      });
      project.updatedAt = turn.at;
    }
  });
}

/** Allocate an already completed, inventory-debited pickup; interpretation cannot authorize the transfer itself. */
export async function applyProjectPickup(sceneId: string, submissionId: string) {
  const state = await readVillageState();
  const event = state.venueEvents.find((item) => item.actionReceipt?.submissionId === submissionId);
  const proof = event?.actionReceipt;
  if (
    !event ||
    !proof?.happened ||
    proof.itemTransfer?.recipientId !== "player" ||
    proof.removeItem !== proof.itemTransfer.itemName ||
    state.projectSourceClaims.some((claim) => claim.sourceId === event.id)
  )
    return;
  const turn = await (await import("./venue-session.js")).readProjectTurnEvidence(sceneId, submissionId);
  const checks: InterpretationCheck[] = state.projects.flatMap((project) =>
    project.lifecycle?.phase === "materials"
      ? project.lifecycle.requirements
          .filter(
            (item) =>
              item.needed &&
              !item.carriedAt &&
              (state.progressEngineVersion !== 1 ||
                project.lifecycle!.sources.some(
                  (source) =>
                    source.requirementId === item.id &&
                    source.kind === "existing-item" &&
                    !source.acquiredAt &&
                    source.venueId === event.venueId &&
                    (!source.zoneId || source.zoneId === event.zoneId) &&
                    source.itemName === proof.removeItem,
                )),
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
