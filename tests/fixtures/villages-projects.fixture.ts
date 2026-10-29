import { randomUUID } from "node:crypto";
import {
  coerceVillageState,
  defaultVillageState,
} from "../../packages/villages/src/server/domain/decoding/village-codec.js";
import type {
  VillageProject,
  VillageState,
  VillageVenue,
} from "../../packages/villages/src/server/domain/models/world.js";
import { unwrittenVillageAgenda } from "../../packages/villages/src/server/domain/rules/agenda-plan.js";
import { approvalScope, projectDesignKey } from "../../packages/villages/src/server/domain/rules/project-terms.js";
import { initializeVenueAccess } from "../../packages/villages/src/server/domain/rules/venue-access.js";
import { defaultVenueSpace } from "../../packages/villages/src/server/domain/rules/venue-model.js";
import {
  draftNewVenueProject,
  draftRenovationProject,
} from "../../packages/villages/src/server/features/projects/project-drafts.js";
import { createProjectLifecycle } from "../../packages/villages/src/server/features/projects/project-lifecycle-service.js";

export function venue(id = "cafe", role: "community" | "residence" = "community"): VillageVenue {
  const entrance = {
    ...defaultVenueSpace(role),
    id: "exterior",
    name: "Entrance",
    kind: "exterior" as const,
    seen: true,
    connectedTo: ["common"],
  };
  const common = {
    ...defaultVenueSpace(role, "A shared room."),
    id: "common",
    name: "Common room",
    purpose: "Meeting",
    kind: role === "residence" ? ("shared-residence" as const) : ("public" as const),
    seen: true,
    connectedTo: ["exterior"],
  };
  const result: VillageVenue = {
    id,
    name: id,
    classes: [role],
    layoutVersion: 1,
    zones: [entrance, common],
    spaces: [common],
    privateSpaces: [],
    residentIds: role === "residence" ? ["a"] : [],
    residenceCapacity: 2,
    description: "A familiar place.",
    category: "",
    form: "A building",
    occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
    presentation: { mapId: "map-projects", image: null, x: 0.2, y: 0.2 },
    capabilities: [],
    state: { revision: 0, recent: null, updatedAt: "" },
  };
  initializeVenueAccess(result);
  result.access!.managerIds = ["a"];
  return result;
}
export function fixture() {
  let state = defaultVillageState();
  state.seed = "fresh-projects";
  state.setupAt = state.foundedAt = "2026-10-23T12:00:00.000Z";
  state.maps = [
    {
      id: "map-projects",
      name: "Village",
      width: 1440,
      height: 900,
      revision: 1,
      view: { fit: "cover", focusX: 50, focusY: 50, zoom: 1 },
      artwork: { id: "map-art", ref: "global-gallery:map-art", url: "/map.png" },
    },
  ];
  state.venues = [venue()];
  state.villagers = ["a", "b", "c"].map((id) => ({
    characterId: id,
    addedAt: state.setupAt,
    ingestSchedule: false,
    wishes: [],
    cardSnapshot: {
      id,
      name: id,
      tags: [],
      summary: "A resident.",
      revision: 1,
      sourceStatus: "available",
      capturedAt: state.setupAt,
    },
    agenda: unwrittenVillageAgenda(state.venues, id),
  })) as VillageState["villagers"];
  const mutate = async (fn: (state: VillageState) => void) => {
    const next = structuredClone(state);
    fn(next);
    state = coerceVillageState(next);
    return state;
  };
  const service = createProjectLifecycle({
    mutateVillageState: mutate,
    draftNewVenueProject,
    draftRenovationProject,
    villagesDebugAgentsEnabled: () => true,
    outsideVenueOperation: (fn: () => void) => fn(),
    preparePrivateSpaces: async () => {},
    loadProjectWishProgress: async () => ({ processProjectWishOutbox: async () => {} }),
  } as any);
  const get = (id: string) => state.projects.find((project) => project.id === id)!;
  const body = (id: string, extra: Record<string, unknown> = {}) => ({
    requestId: randomUUID(),
    expectedRevision: get(id).lifecycle!.revision,
    mapId: state.maps[0].id,
    expectedMapRevision: state.maps[0].revision,
    ...extra,
  });
  const agree = async (id: string, lead = "a") =>
    mutate((current) => {
      const project = current.projects.find((project) => project.id === id)!,
        flow = project.lifecycle!;
      flow.candidates.push({
        residentId: lead,
        evidenceId: "spoken:" + id,
        scope: projectDesignKey(project),
        at: current.setupAt,
      });
      flow.builderId = lead;
      if (flow.change) {
        const target = current.venues.find((venue) => venue.id === project.venueId)!;
        for (const residentId of flow.affectedIds)
          flow.approvals.push({
            residentId,
            source: "conversation",
            scope: approvalScope(target, flow.change, residentId, flow.changedZoneIds),
            evidenceId: "consent:" + id,
            at: current.setupAt,
          });
      }
    });
  const newProject = async (name = "Workshop", lead = "a", position = { x: 0.7, y: 0.7 }) => {
    const requestId = randomUUID();
    await service.createNewVenueProject({
      requestId,
      name,
      classes: ["community"],
      description: "A shared place for making art.",
    });
    const id = "project:" + requestId;
    await service.saveProjectPlan(
      id,
      body(id, {
        form: "A pavilion",
        exteriorDescription: "A clear entrance.",
        layoutVersion: 1,
        layout: "common",
        capacity: 2,
        spaces: [
          {
            id: "work",
            name: "Work room",
            purpose: "Making art",
            venueClass: "community",
            description: "A room for making art.",
            connectedTo: ["exterior"],
          },
        ],
        privateSpaces: [],
      }),
    );
    await service.placeNewVenueProject(id, body(id, position));
    await agree(id, lead);
    return id;
  };
  return { service, get, body, agree, newProject, mutate, state: () => state };
}
export type Fixture = ReturnType<typeof fixture>;
export async function renovation(f: Fixture, change: Record<string, unknown> = {}) {
  const requestId = randomUUID();
  await f.service.createRenovationProject("cafe", {
    requestId,
    title: "Renovate",
    detail: "A larger shared room.",
    capacity: 3,
    ...change,
  });
  return "project:" + requestId;
}
export const projectState = (project: VillageProject) => ({
  status: project.status,
  deadline: project.lifecycle?.workOrder?.completesAt,
});
