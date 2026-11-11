import type { FastifyInstance } from "fastify";
import { createEstablishmentProject, completeEstablishmentProject } from "./project-lifecycle.js";
import { villagesDebugAgentsEnabled } from "../../adapters/engine/runtime-host.js";
import { fail, readVenueId } from "../../adapters/http/route-support.js";
import { notFound } from "../../domain/rules/errors.js";
import { sceneQueries } from "../scenes/services.js";
import { buildVillageSnapshot } from "../world/snapshot.js";
import { readVillageState } from "../world/village-store.js";
import { findLocation } from "../../domain/rules/places.js";
import { projectRoomEntries } from "../../domain/rules/project-room-edits.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import {
  cancelProject,
  createNewVenueProject,
  createRenovationProject,
  debugCompleteProjectConstruction,
  lockProjectBuilder,
  placeNewVenueProject,
  renewRenovationApprovals,
  resumeProject,
  reviseRenovationProject,
  saveProjectPlan,
  startProjectConstruction,
} from "./project-lifecycle.js";

export function registerProjectRoutes(engine: FastifyInstance) {
  const app = engine;
  app.post<{ Body: unknown }>("/projects", async (request, reply) => {
    try {
      await createNewVenueProject(request.body);
      return await buildVillageSnapshot();
    } catch (error) {
      return fail(reply, error, "proposing a build project");
    }
  });
  const projectAction = (suffix: string, action: (projectId: string, body: unknown) => Promise<void>) => {
    app.post<{ Params: { projectId: string }; Body: unknown }>(
      `/projects/:projectId/${suffix}`,
      async (request, reply) => {
        try {
          await action(readVenueId(request.params.projectId), request.body);
          return await buildVillageSnapshot();
        } catch (error) {
          return fail(reply, error, `${suffix} build project`);
        }
      },
    );
  };
  projectAction("plan", saveProjectPlan);
  projectAction("place", placeNewVenueProject);
  projectAction("builder", lockProjectBuilder);
  projectAction("start", startProjectConstruction);
  projectAction("complete", completeEstablishmentProject);
  projectAction("resume", resumeProject);
  projectAction("cancel", cancelProject);
  projectAction("debug-complete", debugCompleteProjectConstruction);
  projectAction("revise", reviseRenovationProject);
  projectAction("renew-approvals", renewRenovationApprovals);
  app.get<{ Params: { placeId: string; zoneId: string } }>(
    "/projects/rooms/:placeId/:zoneId",
    async (request, reply) => {
      try {
        const state = await readVillageState({ memories: true });
        const venue = findLocation(state, readVenueId(request.params.placeId));
        if (!venue) throw notFound("Choose an existing location.");
        return {
          entries: projectRoomEntries(state, venue, readVenueId(request.params.zoneId), villageNow().toISOString()),
        };
      } catch (error) {
        return fail(reply, error, "reading Room entries");
      }
    },
  );
  app.get("/progress/debug", async (_request, reply) => {
    try {
      if (!villagesDebugAgentsEnabled()) throw notFound("Progress debugging is unavailable.");
      const village = await readVillageState();
      return {
        engineVersion: village.progressEngineVersion,
        tasks: village.progressTasks,
        speechProofs: village.projects.flatMap((project) =>
          (project.lifecycle?.spokenProofs ?? []).map((proof) => ({ projectId: project.id, ...proof })),
        ),
        backlog: await sceneQueries().progressBacklog(),
      };
    } catch (error) {
      return fail(reply, error, "reading Progress Engine diagnostics");
    }
  });
  app.post<{ Params: { placeId: string }; Body: unknown }>(
    "/projects/establishments/:placeId",
    async (request, reply) => {
      try {
        await createEstablishmentProject(readVenueId(request.params.placeId), request.body);
        return await buildVillageSnapshot();
      } catch (error) {
        return fail(reply, error, "establishing a Place");
      }
    },
  );
  app.post<{ Params: { venueId: string }; Body: unknown }>("/projects/renovations/:venueId", async (request, reply) => {
    try {
      await createRenovationProject(readVenueId(request.params.venueId), request.body);
      return await buildVillageSnapshot();
    } catch (error) {
      return fail(reply, error, "starting a Renovation");
    }
  });
}
