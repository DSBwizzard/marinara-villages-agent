import type { FastifyInstance } from "fastify";
import type { RepairRequest } from "../../../shared/contracts/repair.js";
import { fail } from "../../adapters/http/route-support.js";
import { repairs } from "./repair.js";
export function registerRepairRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { historyOffset?: string; checkpointOffset?: string } }>("/repair", async (request, reply) => {
    try {
      return await repairs().index(
        Math.max(0, Math.floor(Number(request.query.historyOffset) || 0)),
        Math.max(0, Math.floor(Number(request.query.checkpointOffset) || 0)),
      );
    } catch (e) {
      return fail(reply, e, "reading REPAIR");
    }
  });
  app.get<{
    Querystring: {
      topic: string;
      query?: string;
      offset?: string;
      personId?: string;
      section?: string;
    };
  }>("/repair/records", async (request, reply) => {
    try {
      return await repairs().list(
        request.query.topic,
        request.query.query ?? "",
        Math.max(0, Number(request.query.offset) || 0),
        request.query.personId,
        request.query.section,
      );
    } catch (e) {
      return fail(reply, e, "reading repair records");
    }
  });
  app.get<{ Querystring: { id: string; personId?: string } }>("/repair/record", async (request, reply) => {
    try {
      return await repairs().inspect(request.query.id, request.query.personId);
    } catch (e) {
      return fail(reply, e, "inspecting a repair record");
    }
  });
  app.post<{ Body: RepairRequest }>("/repair/review", async (request, reply) => {
    try {
      return await repairs().prepare(request.body);
    } catch (e) {
      return fail(reply, e, "reviewing a repair");
    }
  });
  app.post<{ Body: { id: string; token: string } }>("/repair/apply", async (request, reply) => {
    try {
      return await repairs().apply(request.body.id, request.body.token);
    } catch (e) {
      return fail(reply, e, "applying a repair");
    }
  });
  app.post<{ Body: { id: string; token: string } }>("/repair/cancel", async (request, reply) => {
    try {
      return await repairs().cancelReview(request.body.id, request.body.token);
    } catch (e) {
      return fail(reply, e, "closing a repair review");
    }
  });
  app.post<{ Body: { id: string; operationId: string } }>("/repair/undo", async (request, reply) => {
    try {
      return await repairs().undo(request.body.id, request.body.operationId);
    } catch (e) {
      return fail(reply, e, "reviewing repair undo");
    }
  });
  app.post<{ Body: { title: string; operationId?: string } }>("/repair/checkpoints", async (request, reply) => {
    try {
      return await repairs().createCheckpoint(request.body.title, request.body.operationId);
    } catch (e) {
      return fail(reply, e, "saving a checkpoint");
    }
  });
  app.post<{ Body: { id: string; operationId: string } }>("/repair/restore", async (request, reply) => {
    try {
      return await repairs().restore(request.body.id, request.body.operationId);
    } catch (e) {
      return fail(reply, e, "reviewing checkpoint restoration");
    }
  });
  app.delete<{ Body: { id: string; token: string } }>("/repair/checkpoints", async (request, reply) => {
    try {
      return await repairs().deleteCheckpoint(request.body.id, request.body.token);
    } catch (e) {
      return fail(reply, e, "deleting a checkpoint");
    }
  });
}
