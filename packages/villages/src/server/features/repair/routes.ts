import type { FastifyInstance } from "fastify";
import type { RepairRequest } from "../../../shared/contracts/repair.js";
import { fail } from "../../adapters/http/route-support.js";
import { repairs } from "./repair.js";
export function registerRepairRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { inspection?: string; historyOffset?: string } }>("/repair", async (request, reply) => {
    try {
      return await repairs().index(
        request.query.inspection === "true",
        Math.max(0, Math.floor(Number(request.query.historyOffset) || 0)),
      );
    } catch (e) {
      return fail(reply, e, "reading REPAIR");
    }
  });
  app.get<{
    Querystring: {
      topic: string;
      inspection?: string;
      query?: string;
      offset?: string;
      personId?: string;
      section?: string;
    };
  }>("/repair/records", async (request, reply) => {
    try {
      return await repairs().list(
        request.query.topic,
        request.query.inspection === "true",
        request.query.query ?? "",
        Math.max(0, Number(request.query.offset) || 0),
        request.query.personId,
        request.query.section,
      );
    } catch (e) {
      return fail(reply, e, "reading repair records");
    }
  });
  app.get<{ Querystring: { id: string; inspection?: string; personId?: string } }>(
    "/repair/record",
    async (request, reply) => {
      try {
        return await repairs().inspect(request.query.id, request.query.inspection === "true", request.query.personId);
      } catch (e) {
        return fail(reply, e, "inspecting a repair record");
      }
    },
  );
  app.post<{ Body: RepairRequest }>("/repair/review", async (request, reply) => {
    try {
      return await repairs().prepare(request.body);
    } catch (e) {
      return fail(reply, e, "reviewing a repair");
    }
  });
  app.post<{ Body: { id: string } }>("/repair/apply", async (request, reply) => {
    try {
      return await repairs().apply(request.body.id);
    } catch (e) {
      return fail(reply, e, "applying a repair");
    }
  });
  app.post<{ Body: { id: string; operationId: string; inspection?: boolean } }>(
    "/repair/undo",
    async (request, reply) => {
      try {
        return await repairs().undo(request.body.id, request.body.operationId, request.body.inspection === true);
      } catch (e) {
        return fail(reply, e, "reviewing repair undo");
      }
    },
  );
  app.post<{ Body: { title: string; operationId?: string } }>("/repair/checkpoints", async (request, reply) => {
    try {
      return await repairs().createCheckpoint(request.body.title, request.body.operationId);
    } catch (e) {
      return fail(reply, e, "saving a checkpoint");
    }
  });
  app.post<{ Body: { id: string; operationId: string; inspection?: boolean } }>(
    "/repair/restore",
    async (request, reply) => {
      try {
        return await repairs().restore(request.body.id, request.body.operationId, request.body.inspection === true);
      } catch (e) {
        return fail(reply, e, "reviewing checkpoint restoration");
      }
    },
  );
}
