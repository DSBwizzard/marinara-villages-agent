import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { memoryRequire } from "../../domain/rules/memory-integrity.js";
import type { VillageMemoryWrite } from "../../domain/models/world-repository.js";
import { capturedJobOwners, capturedWorldOwners, type CapturedAdmissionOwners } from "./captured-admissions.js";
import { validateBackgroundJobRecord } from "./background-responses.js";
import { worldWishOwners } from "./world-wishes.js";
import { departureHistoryOwner } from "./departure-history.js";
import { relationshipDocumentId, readRelationshipOwner } from "./relationship-payload-store.js";

/** Call only under full repair admission, held through the new owner's actual publication acknowledgement. */
export async function capturedPublicationOwners(
  documents: CapabilityDocumentStore,
  world: Awaited<ReturnType<CapabilityDocumentStore["getById"]>> | undefined,
  jobs: VillageMemoryWrite["sourceJobs"] = [],
): Promise<CapturedAdmissionOwners> {
  const into: CapturedAdmissionOwners = { wishes: [], relationships: [] };
  const add = (owners: CapturedAdmissionOwners) => {
    into.wishes.push(...owners.wishes);
    into.relationships.push(...owners.relationships);
  };
  if (world) {
    memoryRequire(
      world.id === "villages-village" &&
        world.packageId === "villages" &&
        world.kind === "village" &&
        Number.isSafeInteger(world.revision) &&
        world.revision > 0,
      "invalid captured World owner identity",
    );
    const live = worldWishOwners(world.data);
    into.wishes.push(...live.owners);
    add(capturedWorldOwners(world.data));
    const departure = departureHistoryOwner(world.data);
    if (departure?.head) into.relationships.push({ scope: departure.scope, head: departure.head });
    const row = await documents.getById("villages", relationshipDocumentId(live.scope.seed));
    if (row) {
      memoryRequire(
        row.packageId === "villages" && Number.isSafeInteger(row.revision) && row.revision > 0,
        "invalid captured relationship owner",
      );
      const root = readRelationshipOwner(row, live.scope);
      into.relationships.push({ scope: live.scope, head: root.head });
    }
  }
  for (const hint of jobs) {
    const row = await documents.getById("villages", hint.slot);
    memoryRequire(
      row?.id === hint.slot &&
        row.packageId === "villages" &&
        row.kind === "background-work" &&
        Number.isSafeInteger(row.revision) &&
        row.revision > 0,
      "captured source job is missing or changed",
    );
    validateBackgroundJobRecord(row);
    const raw = row.data as { id: string; instanceId: string; attempt: number };
    memoryRequire(
      raw.id === hint.id && raw.instanceId === hint.instanceId && raw.attempt === hint.attempt,
      "captured source job changed",
    );
    add(capturedJobOwners(row.data));
  }
  return into;
}
