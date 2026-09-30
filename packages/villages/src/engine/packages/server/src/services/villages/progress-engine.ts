/** Deterministic, model-free accounting for Villages tasks. Domain verifiers own the meaning of evidence. */
import { asRecord, asTrimmedString } from "./coerce.js";
export type ProgressOwner = { kind: "project" | "wish" | "test"; id: string };
export type ProgressRoute = {
  id: string;
  verifier: string;
  params: Record<string, string | number | boolean>;
  automatic?: boolean;
  evidenceKinds?: string[];
};
export type ProgressRequirement = { id: string; title: string; routes: ProgressRoute[] };
export type ProgressPhase = { id: string; title: string; requirements: ProgressRequirement[] };
export type ProgressDefinition = {
  id: string;
  revision: number;
  owner: ProgressOwner;
  resolver: string;
  phases: ProgressPhase[];
};
export type ProgressEvidence = {
  id: string;
  kind: string;
  at: string;
  sourceId: string;
  lineId?: string;
  speakerId?: string;
  venueId?: string;
  area?: string;
  excerpt?: string;
  grade?: "cited-interpretation";
  interpretationVersion?: number;
  citations?: { lineId: string; quote: string }[];
};
export function readProgressInterpretation(
  value: unknown,
): Pick<ProgressEvidence, "grade" | "interpretationVersion" | "citations"> {
  const row = asRecord(value);
  if (row.grade !== "cited-interpretation") return {};
  return {
    grade: "cited-interpretation",
    interpretationVersion: Number(row.interpretationVersion),
    citations: Array.isArray(row.citations)
      ? row.citations.slice(0, 6).map((value) => {
          const citation = asRecord(value);
          return { lineId: asTrimmedString(citation.lineId), quote: asTrimmedString(citation.quote).slice(0, 1200) };
        })
      : [],
  };
}
export type ProgressReceipt = {
  id: string;
  definitionRevision: number;
  phaseId: string;
  requirementId: string;
  routeId: string;
  verifier: string;
  evidence: ProgressEvidence;
};
export type ProgressAttempt = {
  evidenceId: string;
  phaseId: string;
  requirementId: string;
  routeId: string;
  status: "rejected" | "unavailable";
  reason: string;
  at: string;
};
export type ProgressTask = {
  definition: ProgressDefinition;
  definedAt: string;
  revisionHistory: {
    definition: ProgressDefinition;
    receipts: ProgressReceipt[];
    transitions: ProgressTask["transitions"];
  }[];
  visibleAt: string;
  requirementVisibleAt: Record<string, string>;
  phaseIndex: number;
  receipts: ProgressReceipt[];
  attempts: ProgressAttempt[];
  transitions: { phaseId: string; at: string; evidenceId: string }[];
  resolvedAt: string;
  resolutionKey: string;
};
export type ProgressVerdict = { status: "accepted" } | { status: "rejected" | "unavailable"; reason: string };
export type ProgressVerifier<Context> = (
  route: ProgressRoute,
  evidence: ProgressEvidence,
  context: Context,
) => ProgressVerdict;
export type ProgressRegistry<Context> = {
  verifiers: Record<string, ProgressVerifier<Context>>;
  /** Must mutate only the same transaction's state. External effects need their own outbox. */
  resolvers: Record<string, (task: ProgressTask, resolutionKey: string, context: Context) => void>;
  /** Rechecks requirements whose facts can cease to be true before advancing. */
  receiptStillValid?: (receipt: ProgressReceipt, context: Context) => boolean;
  /** Rejects reuse across tasks for exclusive sources such as a physical handoff. */
  sourceAvailable?: (evidence: ProgressEvidence, task: ProgressTask, context: Context) => boolean;
};

const ATTEMPT_LIMIT = 24;

export function rejectProgressEvidence(
  task: ProgressTask,
  phaseId: string,
  requirementId: string,
  routeId: string,
  evidence: ProgressEvidence,
  reason: string,
  status: ProgressAttempt["status"] = "rejected",
): void {
  if (
    task.attempts.some(
      (attempt) =>
        attempt.evidenceId === evidence.id &&
        attempt.phaseId === phaseId &&
        attempt.requirementId === requirementId &&
        attempt.routeId === routeId &&
        attempt.status === status &&
        attempt.reason === reason,
    )
  )
    return;
  task.attempts.push({ evidenceId: evidence.id, phaseId, requirementId, routeId, status, reason, at: evidence.at });
  task.attempts = task.attempts.slice(-ATTEMPT_LIMIT);
}

export function createProgressTask(
  definition: ProgressDefinition,
  visibleAt = "",
  definedAt = new Date().toISOString(),
): ProgressTask {
  if (!definition.id || !definition.owner.id || !definition.resolver || !Number.isInteger(definition.revision))
    throw new Error("A progress task needs an id, owner, resolver, and integer revision.");
  if (!definition.phases.length) throw new Error("A progress task needs at least one phase.");
  const ids = new Set<string>();
  for (const phase of definition.phases) {
    if (!phase.id || ids.has(phase.id) || !phase.requirements.length)
      throw new Error("Each progress phase needs a unique id and requirements.");
    ids.add(phase.id);
    const requirementIds = new Set<string>();
    for (const requirement of phase.requirements) {
      if (!requirement.id || requirementIds.has(requirement.id) || !requirement.routes.length)
        throw new Error("Each progress requirement needs a unique id and an evidence route.");
      requirementIds.add(requirement.id);
      if (new Set(requirement.routes.map((route) => route.id)).size !== requirement.routes.length)
        throw new Error("Progress route ids must be unique within a requirement.");
      if (requirement.routes.some((route) => !route.id || !route.verifier))
        throw new Error("A progress route needs an id and registered verifier name.");
    }
  }
  return {
    definition,
    definedAt,
    revisionHistory: [],
    visibleAt,
    requirementVisibleAt: {},
    phaseIndex: 0,
    receipts: [],
    attempts: [],
    transitions: [],
    resolvedAt: "",
    resolutionKey: "",
  };
}

export function revealProgress(task: ProgressTask, at: string, requirementId = ""): void {
  if (requirementId) {
    if (!task.definition.phases.some((phase) => phase.requirements.some((row) => row.id === requirementId)))
      throw new Error("Unknown progress requirement.");
    task.requirementVisibleAt[requirementId] ||= at;
  } else task.visibleAt ||= at;
}

export function visibleProgress(task: ProgressTask) {
  if (!task.visibleAt) return null;
  return {
    id: task.definition.id,
    owner: task.definition.owner,
    phaseIndex: task.phaseIndex,
    resolvedAt: task.resolvedAt,
    phases: task.definition.phases.map((phase) => ({
      id: phase.id,
      title: phase.title,
      requirements: phase.requirements
        .filter((requirement) => !!task.requirementVisibleAt[requirement.id])
        .map((requirement) => ({
          id: requirement.id,
          title: requirement.title,
          complete: task.receipts.some((receipt) => receipt.requirementId === requirement.id),
        })),
    })),
  };
}

export function reviseProgress(task: ProgressTask, definition: ProgressDefinition, carryReceiptIds: string[]): void {
  if (task.resolvedAt) throw new Error("A resolved task cannot be revised.");
  if (definition.id !== task.definition.id || definition.revision <= task.definition.revision)
    throw new Error("Progress revisions must increase for the same task.");
  const retained = new Set(carryReceiptIds);
  task.revisionHistory.push({
    definition: task.definition,
    receipts: task.receipts.map((receipt) => ({ ...receipt, evidence: { ...receipt.evidence } })),
    transitions: task.transitions.map((transition) => ({ ...transition })),
  });
  task.receipts = task.receipts.filter((receipt) => retained.has(receipt.id));
  task.definition = definition;
  task.phaseIndex = 0;
  task.resolvedAt = "";
  task.resolutionKey = "";
  task.transitions = [];
  task.requirementVisibleAt = Object.fromEntries(
    Object.entries(task.requirementVisibleAt).filter(([id]) =>
      definition.phases.some((phase) => phase.requirements.some((requirement) => requirement.id === id)),
    ),
  );
}

export function submitProgressEvidence<Context>(
  task: ProgressTask,
  requirementId: string,
  routeId: string,
  evidence: ProgressEvidence,
  context: Context,
  registry: ProgressRegistry<Context>,
): ProgressVerdict {
  if (task.resolvedAt) return { status: "rejected", reason: "This task is already resolved." };
  const phase = task.definition.phases[task.phaseIndex];
  const requirement = phase?.requirements.find((row) => row.id === requirementId);
  const route = requirement?.routes.find((row) => row.id === routeId);
  if (!phase || !requirement || !route)
    return { status: "rejected", reason: "This route is not in the current phase." };
  if (!Number.isFinite(Date.parse(evidence.at)) || Date.parse(evidence.at) < Date.parse(task.definedAt)) {
    rejectProgressEvidence(
      task,
      phase.id,
      requirementId,
      routeId,
      evidence,
      "This source predates the task definition.",
    );
    return { status: "rejected", reason: "This source predates the task definition." };
  }
  if (task.receipts.some((receipt) => receipt.evidence.id === evidence.id && receipt.requirementId === requirementId))
    return { status: "accepted" };
  if (task.receipts.some((receipt) => receipt.evidence.id === evidence.id)) {
    rejectProgressEvidence(
      task,
      phase.id,
      requirementId,
      routeId,
      evidence,
      "This saved source has already advanced this task.",
    );
    return { status: "rejected", reason: "This saved source has already advanced this task." };
  }
  const verifier = registry.verifiers[route.verifier];
  const verdict: ProgressVerdict = !verifier
    ? { status: "unavailable", reason: `Verifier ${route.verifier} is not registered.` }
    : registry.sourceAvailable && !registry.sourceAvailable(evidence, task, context)
      ? { status: "rejected", reason: "That evidence source is already used or unavailable." }
      : verifier(route, evidence, context);
  if (verdict.status !== "accepted") {
    rejectProgressEvidence(task, phase.id, requirementId, routeId, evidence, verdict.reason, verdict.status);
    return verdict;
  }
  const id = [task.definition.id, task.definition.revision, phase.id, requirementId, routeId, evidence.id].join(":");
  task.receipts.push({
    id,
    definitionRevision: task.definition.revision,
    phaseId: phase.id,
    requirementId,
    routeId,
    verifier: route.verifier,
    evidence: { ...evidence, excerpt: evidence.excerpt?.slice(0, 300) },
  });
  advanceProgress(task, evidence, context, registry);
  return verdict;
}

/** An event is considered only by routes that opt into its saved source kind. */
export function ingestProgressEvent<Context>(
  tasks: ProgressTask[],
  evidence: ProgressEvidence,
  context: Context,
  registry: ProgressRegistry<Context>,
): void {
  for (const task of tasks) {
    const phase = task.definition.phases[task.phaseIndex];
    if (!phase || task.resolvedAt) continue;
    for (const requirement of phase.requirements) {
      if (task.receipts.some((receipt) => receipt.phaseId === phase.id && receipt.requirementId === requirement.id))
        continue;
      for (const route of requirement.routes) {
        if (route.automatic && route.evidenceKinds?.includes(evidence.kind))
          submitProgressEvidence(task, requirement.id, route.id, evidence, context, registry);
        if (task.phaseIndex !== task.definition.phases.indexOf(phase)) break;
      }
      if (task.phaseIndex !== task.definition.phases.indexOf(phase)) break;
    }
  }
}

export function advanceProgress<Context>(
  task: ProgressTask,
  evidence: ProgressEvidence,
  context: Context,
  registry: ProgressRegistry<Context>,
): void {
  if (task.resolvedAt) return;
  const phase = task.definition.phases[task.phaseIndex];
  if (!phase) return;
  if (
    phase.requirements.some(
      (requirement) =>
        !task.receipts.some(
          (receipt) =>
            receipt.phaseId === phase.id &&
            receipt.requirementId === requirement.id &&
            requirement.routes.some((route) => route.id === receipt.routeId) &&
            (!registry.receiptStillValid || registry.receiptStillValid(receipt, context)),
        ),
    )
  )
    return;
  task.transitions.push({ phaseId: phase.id, at: evidence.at, evidenceId: evidence.id });
  task.phaseIndex += 1;
  if (task.phaseIndex < task.definition.phases.length) return;
  const resolutionKey = `${task.definition.id}:${task.definition.revision}:resolved`;
  const resolver = registry.resolvers[task.definition.resolver];
  if (!resolver) throw new Error(`Resolver ${task.definition.resolver} is not registered.`);
  resolver(task, resolutionKey, context);
  task.resolutionKey = resolutionKey;
  task.resolvedAt = evidence.at;
}

/** Coerce the village document without ever treating prose or an unknown verifier as proof. */
export function coerceProgressTasks(value: unknown): ProgressTask[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry): ProgressTask[] => {
    try {
      const raw = asRecord(entry);
      const draft = asRecord(raw.definition);
      const owner = asRecord(draft.owner);
      if (owner.kind !== "project" && owner.kind !== "wish" && owner.kind !== "test") return [];
      const definition: ProgressDefinition = {
        id: asTrimmedString(draft.id),
        revision: Number(draft.revision),
        owner: { kind: owner.kind, id: asTrimmedString(owner.id) },
        resolver: asTrimmedString(draft.resolver),
        phases: Array.isArray(draft.phases)
          ? draft.phases.map((item) => {
              const phase = asRecord(item);
              return {
                id: asTrimmedString(phase.id),
                title: asTrimmedString(phase.title),
                requirements: Array.isArray(phase.requirements)
                  ? phase.requirements.map((candidate) => {
                      const requirement = asRecord(candidate);
                      return {
                        id: asTrimmedString(requirement.id),
                        title: asTrimmedString(requirement.title),
                        routes: Array.isArray(requirement.routes)
                          ? requirement.routes.map((possible) => {
                              const route = asRecord(possible);
                              const params = Object.fromEntries(
                                Object.entries(asRecord(route.params)).filter(
                                  ([, parameter]) =>
                                    typeof parameter === "string" ||
                                    typeof parameter === "number" ||
                                    typeof parameter === "boolean",
                                ),
                              ) as ProgressRoute["params"];
                              return {
                                id: asTrimmedString(route.id),
                                verifier: asTrimmedString(route.verifier),
                                params,
                                automatic: route.automatic === true,
                                evidenceKinds: Array.isArray(route.evidenceKinds)
                                  ? route.evidenceKinds.filter((kind): kind is string => typeof kind === "string")
                                  : [],
                              };
                            })
                          : [],
                      };
                    })
                  : [],
              };
            })
          : [],
      };
      const task = createProgressTask(definition, asTrimmedString(raw.visibleAt));
      task.definedAt = asTrimmedString(raw.definedAt) || "1970-01-01T00:00:00.000Z";
      task.revisionHistory = Array.isArray(raw.revisionHistory)
        ? raw.revisionHistory.flatMap((entry) => {
            const previous = asRecord(entry);
            const historyTask = coerceProgressTasks([
              { definition: previous.definition, receipts: previous.receipts, transitions: previous.transitions },
            ])[0];
            return historyTask &&
              historyTask.definition.id === definition.id &&
              historyTask.definition.revision < definition.revision
              ? [
                  {
                    definition: historyTask.definition,
                    receipts: historyTask.receipts,
                    transitions: historyTask.transitions,
                  },
                ]
              : [];
          })
        : [];
      task.requirementVisibleAt = Object.fromEntries(
        Object.entries(asRecord(raw.requirementVisibleAt)).filter(
          ([id, at]) =>
            typeof at === "string" &&
            definition.phases.some((phase) => phase.requirements.some((requirement) => requirement.id === id)),
        ),
      ) as Record<string, string>;
      const phaseIds = new Set(definition.phases.map((phase) => phase.id));
      task.receipts = Array.isArray(raw.receipts)
        ? raw.receipts.flatMap((entry): ProgressReceipt[] => {
            const receipt = asRecord(entry);
            const evidence = asRecord(receipt.evidence);
            const phase = definition.phases.find((row) => row.id === receipt.phaseId);
            const requirement = phase?.requirements.find((row) => row.id === receipt.requirementId);
            const route = requirement?.routes.find((row) => row.id === receipt.routeId);
            if (
              !route ||
              route.verifier !== receipt.verifier ||
              !asTrimmedString(receipt.id) ||
              !asTrimmedString(evidence.id) ||
              !asTrimmedString(evidence.sourceId)
            )
              return [];
            return [
              {
                id: asTrimmedString(receipt.id),
                definitionRevision: Number(receipt.definitionRevision) || definition.revision,
                phaseId: phase!.id,
                requirementId: requirement!.id,
                routeId: route.id,
                verifier: route.verifier,
                evidence: {
                  id: asTrimmedString(evidence.id),
                  kind: asTrimmedString(evidence.kind),
                  at: asTrimmedString(evidence.at),
                  sourceId: asTrimmedString(evidence.sourceId),
                  lineId: asTrimmedString(evidence.lineId),
                  speakerId: asTrimmedString(evidence.speakerId),
                  venueId: asTrimmedString(evidence.venueId),
                  ...(asTrimmedString(evidence.area) ? { area: asTrimmedString(evidence.area) } : {}),
                  excerpt: asTrimmedString(evidence.excerpt).slice(0, 300),
                  ...readProgressInterpretation(evidence),
                },
              },
            ];
          })
        : [];
      task.attempts = Array.isArray(raw.attempts)
        ? raw.attempts
            .flatMap((entry): ProgressAttempt[] => {
              const attempt = asRecord(entry);
              return attempt.status === "rejected" || attempt.status === "unavailable"
                ? [
                    {
                      evidenceId: asTrimmedString(attempt.evidenceId),
                      phaseId: asTrimmedString(attempt.phaseId),
                      requirementId: asTrimmedString(attempt.requirementId),
                      routeId: asTrimmedString(attempt.routeId),
                      status: attempt.status,
                      reason: asTrimmedString(attempt.reason).slice(0, 300),
                      at: asTrimmedString(attempt.at),
                    },
                  ]
                : [];
            })
            .slice(-ATTEMPT_LIMIT)
        : [];
      task.transitions = Array.isArray(raw.transitions)
        ? raw.transitions.flatMap((entry) => {
            const transition = asRecord(entry);
            const phaseId = asTrimmedString(transition.phaseId);
            return phaseIds.has(phaseId)
              ? [{ phaseId, at: asTrimmedString(transition.at), evidenceId: asTrimmedString(transition.evidenceId) }]
              : [];
          })
        : [];
      task.phaseIndex = Math.max(0, Math.min(definition.phases.length, Math.floor(Number(raw.phaseIndex) || 0)));
      const resolutionKey = `${definition.id}:${definition.revision}:resolved`;
      if (task.phaseIndex === definition.phases.length && raw.resolutionKey === resolutionKey) {
        task.resolutionKey = resolutionKey;
        task.resolvedAt = asTrimmedString(raw.resolvedAt);
      }
      return [task];
    } catch {
      return [];
    }
  });
}
