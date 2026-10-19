import type { VillageState } from "../models/world.js";
import type { ProjectSupplyTransfer } from "../models/venue-action-model.js";
import { asRecord } from "./coerce.js";

export const projectSourceClaimKey = (venueId: string, supplierId: string, itemName: string) =>
  [venueId, supplierId, itemName.trim().toLocaleLowerCase()].join("\u0000");

export function readProjectSupplyTransfer(value: unknown): ProjectSupplyTransfer | null {
  const row = asRecord(value);
  if (
    !["projectId", "requirementId", "sourceId", "supplierId"].every(
      (key) => typeof row[key] === "string" && !!row[key],
    ) ||
    !Number.isSafeInteger(row.revision) ||
    Number(row.revision) < 1
  )
    return null;
  return {
    projectId: String(row.projectId),
    revision: Number(row.revision),
    requirementId: String(row.requirementId),
    sourceId: String(row.sourceId),
    supplierId: String(row.supplierId),
  };
}

/** An offer authorizes no stock. These are the finite sources eligible for a separately witnessed transfer. */
export function availableProjectSupplyTransfers(
  state: VillageState,
  venueId: string,
  zoneId: string | undefined,
  presentIds: readonly string[],
): ProjectSupplyTransfer[] {
  return state.projects.flatMap((project) => {
    const flow = project.lifecycle,
      task = state.progressTasks.find(
        (task) => task.definition.owner.kind === "project" && task.definition.owner.id === project.id,
      );
    if (
      !flow ||
      flow.phase !== "materials" ||
      project.status === "abandoned" ||
      !task ||
      task.resolvedAt ||
      task.definition.phases[task.phaseIndex]?.id !== "materials"
    )
      return [];
    return flow.sources.flatMap((source) => {
      const requirement = flow.requirements.find(
        (row) => row.id === source.requirementId && row.needed && !row.carriedAt && !row.deliveredAt,
      );
      if (
        !requirement ||
        source.kind !== "resident-offer" ||
        source.acquiredAt ||
        source.venueId !== venueId ||
        (source.zoneId && source.zoneId !== zoneId) ||
        !presentIds.includes(source.supplierId) ||
        !Number.isFinite(Date.parse(source.at)) ||
        !task.receipts.some(
          (receipt) =>
            receipt.requirementId === "source:" + requirement.id && receipt.evidence.sourceId === source.evidenceId,
        ) ||
        state.projectSourceClaims.some(
          (claim) => claim.key === projectSourceClaimKey(source.venueId, source.supplierId, source.itemName),
        )
      )
        return [];
      return [
        {
          projectId: project.id,
          revision: task.definition.revision,
          requirementId: requirement.id,
          sourceId: source.evidenceId,
          supplierId: source.supplierId,
        },
      ];
    });
  });
}

export const sameProjectSupplyTransfer = (left: ProjectSupplyTransfer, right: ProjectSupplyTransfer) =>
  left.projectId === right.projectId &&
  left.revision === right.revision &&
  left.requirementId === right.requirementId &&
  left.sourceId === right.sourceId &&
  left.supplierId === right.supplierId;
