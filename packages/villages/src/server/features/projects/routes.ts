import { villagesDebugAgentsEnabled } from "../../adapters/engine/runtime-host.js";
import { fail, readVenueId } from "../../adapters/http/route-support.js";
import { notFound } from "../../domain/rules/errors.js";
import { progressBacklog } from "../scenes/venue-session.js";
import { readVillageState } from "../world/village-store.js";
import { buildVillageSnapshot } from "../world/village.js";
import {
  listProjectEvidenceCandidates,
  reallocateHeldProjectSupply,
  recordExistingProjectSource,
  recordProjectSpokenEvidence,
} from "./project-evidence.js";
import {
  acceptProjectRequirements,
  createNewVenueProject,
  createRenovationProject,
  debugCompleteProjectConstruction,
  deliverProjectMaterial,
  lockProjectBuilder,
  openFinishedProject,
  placeNewVenueProject,
  renewRenovationApprovals,
  requestProjectMailbox,
  reviseRenovationProject,
  startProjectConstruction,
} from "./project-lifecycle.js";
import type { FastifyInstance } from "fastify";

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
  projectAction("place", placeNewVenueProject);
  projectAction("request-approval", (projectId) => requestProjectMailbox(projectId));
  projectAction("builder", lockProjectBuilder);
  projectAction("requirements", (projectId) => acceptProjectRequirements(projectId));
  projectAction("deliver", deliverProjectMaterial);
  projectAction("start", (projectId) => startProjectConstruction(projectId));
  projectAction("debug-complete", (projectId) => debugCompleteProjectConstruction(projectId));
  projectAction("open", openFinishedProject);
  projectAction("revise", reviseRenovationProject);
  projectAction("renew-approvals", (id) => renewRenovationApprovals(id));
  projectAction("record", recordProjectSpokenEvidence);
  projectAction("existing-source", recordExistingProjectSource);
  projectAction("reallocate-held", reallocateHeldProjectSupply);
  app.get<{ Params: { projectId: string } }>("/projects/:projectId/evidence", async (request, reply) => {
    try {
      return { candidates: await listProjectEvidenceCandidates(readVenueId(request.params.projectId)) };
    } catch (error) {
      return fail(reply, error, "reading saved Project evidence");
    }
  });
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
        backlog: await progressBacklog(),
      };
    } catch (error) {
      return fail(reply, error, "reading Progress Engine diagnostics");
    }
  });
  app.post<{ Params: { venueId: string }; Body: unknown }>("/projects/renovations/:venueId", async (request, reply) => {
    try {
      await createRenovationProject(readVenueId(request.params.venueId), request.body);
      return await buildVillageSnapshot();
    } catch (error) {
      return fail(reply, error, "starting a Renovation");
    }
  });
}
