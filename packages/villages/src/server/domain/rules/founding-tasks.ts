import { foundingIdentity } from "./founding-requests.js";
import type {
  FoundingResidentTasks,
  FoundingTask,
  FoundingTaskKind,
} from "../../../shared/contracts/founding-tasks.js";
import type { VillageState } from "../models/world.js";
import { asRecord } from "./coerce.js";
import { backgroundRevision } from "./background-revision.js";
import { agendaRevision } from "./agenda-revision.js";
export function foundingTaskRevision(state: VillageState, id: string, kind: FoundingTaskKind): string {
  const resident = state.villagers.find((row) => row.characterId === id);
  return backgroundRevision([
    1,
    state.seed,
    kind,
    kind === "routine" ? state.opening?.id : null,
    agendaRevision(state, id),
    state.foundingDetails,
    state.scenarioImprint,
    state.playerBackground,
    state.playerPersonaName,
    foundingIdentity({ ...resident?.cardSnapshot, admission: resident?.admission }),
    resident?.scheduleInfluence,
    state.venues.map((venue) => [venue.id, venue.state.condition, venue.state.publicFacts.slice(0, 2)]),
    kind === "wish" ? [resident?.agenda?.wishes, resident?.wishLifecycle?.needs] : null,
  ]);
}
export const foundingSlot = (kind: FoundingTaskKind, id: string) =>
  "villages-background-" + backgroundRevision([kind === "routine" ? "agenda" : "wish", id]);
export function ownsFoundingTask(
  state: VillageState,
  id: string,
  kind: FoundingTaskKind,
  revision: string,
  allowanceId?: string,
): boolean {
  const marker = state.foundingPreparation,
    task = marker?.tasks?.[id]?.[kind];
  return (
    !!task &&
    marker?.tasksVersion === 1 &&
    marker.status !== "ready" &&
    task.status !== "completed" &&
    task.revision === revision &&
    foundingTaskRevision(state, id, kind) === revision &&
    (kind !== "wish" ||
      (task.allowanceId === allowanceId &&
        state.villagers.find((row) => row.characterId === id)?.wishLifecycle?.attempt?.id === allowanceId))
  );
}
export function completeFoundingTask(state: VillageState, id: string, kind: FoundingTaskKind, revision: string): void {
  const task = state.foundingPreparation?.tasks?.[id]?.[kind];
  if (task?.revision === revision) {
    task.status = "completed";
    task.receipt = revision;
    task.error = "";
  }
}
export function coerceFoundingTasks(value: unknown): FoundingResidentTasks {
  return Object.fromEntries(
    Object.entries(asRecord(value))
      .slice(0, 12)
      .map(([id, row]) => [
        id,
        Object.fromEntries(
          (["routine", "wish"] as const).flatMap((kind) => {
            const raw = asRecord(asRecord(row)[kind]);
            if (
              raw.contract !== 1 ||
              typeof raw.revision !== "string" ||
              typeof raw.jobId !== "string" ||
              !["pending", "running", "failed", "completed"].includes(String(raw.status))
            )
              return [];
            const task: FoundingTask = {
              contract: 1,
              revision: raw.revision,
              jobId: raw.jobId,
              status: raw.status as FoundingTask["status"],
              attempt: Number.isInteger(raw.attempt) ? Math.max(0, Number(raw.attempt)) : 0,
              error: typeof raw.error === "string" ? raw.error.slice(0, 300) : "",
              ...(typeof raw.receipt === "string" ? { receipt: raw.receipt } : {}),
              ...(typeof raw.allowanceId === "string" ? { allowanceId: raw.allowanceId } : {}),
            };
            return [[kind, task]];
          }),
        ),
      ]),
  );
}

/** Derive the visible counter from the same receipts as the resident rows. */
export function foundingCompletedIds(state: Pick<VillageState, "villagers" | "foundingPreparation">): string[] {
  const marker = state.foundingPreparation;
  return state.villagers
    .filter((row) =>
      marker?.tasksVersion === 1
        ? ["routine", "wish"].every(
            (kind) => marker.tasks?.[row.characterId]?.[kind as FoundingTaskKind]?.status === "completed",
          )
        : marker?.completedIds.includes(row.characterId),
    )
    .map((row) => row.characterId);
}
