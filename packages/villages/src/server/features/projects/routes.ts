import { villagesDebugAgentsEnabled } from "../../adapters/engine/runtime-host.js";
import { fail, readVenueId } from "../../adapters/http/route-support.js";
import { notFound } from "../../domain/rules/errors.js";
import { progressBacklog } from "../scenes/services.js";
import { buildVillageSnapshot } from "../world/snapshot.js";
import { readVillageState } from "../world/village-store.js";
import { listProjectEvidenceCandidates, recordProjectSpokenEvidence } from "./project-evidence.js";
import {
  saveProjectPlan,
  decideOpeningProposal,
  createNewVenueProject,
  createRenovationProject,
  debugCompleteProjectConstruction,
  lockProjectBuilder,
  placeNewVenueProject,
  renewRenovationApprovals,
  requestProjectMailbox,
  reviseRenovationProject,
  startProjectConstruction,
  resumeProject,
  cancelProject,
} from "./project-lifecycle.js";
import type { FastifyInstance } from "fastify";

export function registerProjectRoutes(engine: FastifyInstance) {
  const app = engine;
  app.post<{ Body: unknown }>("/projects/opening", async (request, reply) => {
    try {
      await decideOpeningProposal(request.body);
      return await buildVillageSnapshot();
    } catch (error) {
      return fail(reply, error, "updating the opening");
    }
  });
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
  projectAction("request-approval", requestProjectMailbox);
  projectAction("builder", lockProjectBuilder);
  projectAction("start", startProjectConstruction);
  projectAction("resume", resumeProject);
  projectAction("cancel", cancelProject);
  projectAction("debug-complete", debugCompleteProjectConstruction);
  projectAction("revise", reviseRenovationProject);
  projectAction("renew-approvals", renewRenovationApprovals);
  projectAction("record", recordProjectSpokenEvidence);
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
