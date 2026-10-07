import {
  setScenerySettings,
  setVillageCharacterSpeechColors,
  setVillageLoreSettings,
  setVillageName,
  setVillagePlayer,
  setVillagePromptKnowledge,
  setVillageSendOnEnter,
  setVillageSetting,
  setVillageSpriteCardFlipEnabled,
  setVillageStoryPace,
} from "./village-settings.js";
import { decisionAdapterStatus } from "../../adapters/engine/decisions-adapter.js";
import { listVillageLorebooks } from "../../adapters/engine/lorebooks.js";
import { fail, readCharacterId, SETTINGS_BODY_LIMIT } from "../../adapters/http/route-support.js";
import { readRuntimeDebug, saveRuntimeDebug } from "../../adapters/observability/runtime-debug.js";
import { badRequest, conflict, notFound } from "../../domain/rules/errors.js";
import { readInterpretationDiagnostics } from "../generation/interpretation-diagnostics.js";
import { setVenueVisitRetention } from "../scenes/venue-session.js";
import { buildVillageSnapshot } from "../world/snapshot.js";
import { buildVillagePersonaCatalog, readVillagePersonaPreview, refreshPlayerPersona } from "../world/village.js";
import { setVillageHomeBuildingNames, setVillageVenues } from "../venues/services.js";
import { readVillageConnectionSettings, saveVillageConnections } from "./connections.js";
import { readInterpretationSettings, saveInterpretationSettings } from "./interpretation-settings.js";
import { readVillageWriting, saveVillageWriting } from "./narration-settings.js";
import { readUsageMeter, resetUsagePeriod, saveLinkApiGroup, saveUsageRate } from "./usage-meter.js";
import { previewVillageBurst } from "./usage-preview.js";
import type { FastifyInstance } from "fastify";

export function registerInterpretationRoutes(engine: FastifyInstance) {
  const app = engine;
  engine.get("/interpretation-settings", async (_request, reply) => {
    try {
      const settings = await readInterpretationSettings();
      return {
        settings,
        status: settings.decisionsEnabled
          ? await decisionAdapterStatus()
          : { available: false, reason: "Decisions is off", engineBuild: null },
      };
    } catch (error) {
      return fail(reply, error, "reading interpretation settings");
    }
  });
  engine.patch("/interpretation-settings", { bodyLimit: 1024 }, async (request, reply) => {
    try {
      const settings = await saveInterpretationSettings(request.body);
      return {
        settings,
        status: settings.decisionsEnabled
          ? await decisionAdapterStatus()
          : { available: false, reason: "Decisions is off", engineBuild: null },
      };
    } catch (error) {
      return fail(reply, error, "saving interpretation settings");
    }
  });
  engine.get<{ Params: { sceneId: string } }>("/interpretation-diagnostics/:sceneId", async (request, reply) => {
    try {
      const id = request.params.sceneId;
      if (!/^[a-zA-Z0-9:_-]{1,128}$/u.test(id)) throw badRequest("Invalid Scene ID.");
      return await readInterpretationDiagnostics(id);
    } catch (error) {
      return fail(reply, error, "reading interpretation diagnostics");
    }
  });
}
export function registerPersonaRoutes(engine: FastifyInstance) {
  const app = engine;
  app.get("/personas", async (_request, reply) => {
    try {
      return { personas: await buildVillagePersonaCatalog() };
    } catch (error) {
      return fail(reply, error, "persona catalog");
    }
  });
  app.get<{ Params: { personaId: string } }>("/personas/:personaId", async (request, reply) => {
    try {
      const persona = await readVillagePersonaPreview(readCharacterId(request.params.personaId));
      if (!persona) throw notFound("That Persona is no longer in the library.");
      return { persona };
    } catch (error) {
      return fail(reply, error, "persona preview");
    }
  });
  app.post("/persona/refresh", async (_request, reply) => {
    try {
      await refreshPlayerPersona();
      return await buildVillageSnapshot();
    } catch (error) {
      return fail(reply, error, "refreshing your Persona");
    }
  });
}
export function registerUsageRoutes(engine: FastifyInstance) {
  const app = engine;
  app.get<{ Querystring: { details?: string } }>("/usage", async (request, reply) => {
    try {
      return await readUsageMeter(request.query.details === "1");
    } catch (error) {
      return fail(reply, error, "reading usage");
    }
  });
  app.post<{ Body: unknown }>("/usage/preview", async (request, reply) => {
    try {
      return await previewVillageBurst(request.body);
    } catch (error) {
      return fail(reply, error, "previewing generation requests");
    }
  });
  app.post("/usage/reset", async (_request, reply) => {
    try {
      return await resetUsagePeriod();
    } catch (error) {
      return fail(reply, error, "resetting usage period");
    }
  });
  app.patch<{ Body: { connectionId: string; group: unknown; model?: string } }>(
    "/usage/linkapi",
    async (request, reply) => {
      try {
        return await saveLinkApiGroup(request.body.connectionId, request.body.group, request.body.model);
      } catch (error) {
        return fail(reply, error, "saving LinkAPI token group");
      }
    },
  );
  app.patch<{ Body: { connectionId: string; model: string; rate: unknown } }>(
    "/usage/pricing",
    async (request, reply) => {
      try {
        return await saveUsageRate(request.body.connectionId, request.body.model, request.body.rate);
      } catch (error) {
        return fail(reply, error, "saving usage pricing");
      }
    },
  );
}
export function registerRuntimeDiagnosticsRoutes(engine: FastifyInstance) {
  const app = engine;
  app.get("/debug/runtime", async (_request, reply) => {
    try {
      return await readRuntimeDebug();
    } catch (error) {
      return fail(reply, error, "reading runtime debugging");
    }
  });
  app.patch<{ Body: { verbose?: unknown; showUsageMeter?: unknown } }>("/debug/runtime", async (request, reply) => {
    try {
      return await saveRuntimeDebug(request.body?.verbose, request.body?.showUsageMeter);
    } catch (error) {
      return fail(reply, error, "saving runtime debugging");
    }
  });
}
export function registerVillageSettingsRoutes(engine: FastifyInstance) {
  const app = engine;
  app.get("/lorebooks", async (_request, reply) => {
    try {
      return { books: await listVillageLorebooks() };
    } catch (error) {
      return fail(reply, error, "reading lorebooks");
    }
  });
  app.patch<{
    Body: {
      name?: unknown;
      promptKnowledge?: unknown;
      selectedLorebookIds?: unknown;
      sceneryArtStyle?: unknown;
      personalizeVenueImagesByDefault?: unknown;
      useVisualLoreByDefault?: unknown;
      useVisualLore?: unknown;
      loreTokenBudget?: unknown;
      playerPersonaId?: unknown;
      setting?: unknown;
      venues?: unknown;
      venueScope?: unknown;
      townMapImage?: unknown;
      townMapView?: unknown;
      homeBuildingNames?: unknown;
      storyPace?: unknown;
      characterSpeechColors?: unknown;
      sendOnEnter?: unknown;
      spriteCardFlipEnabled?: unknown;
      visitRetention?: unknown;
    };
  }>("/settings", { bodyLimit: SETTINGS_BODY_LIMIT }, async (request, reply) => {
    try {
      const body = request.body ?? {};
      if (body.townMapImage !== undefined || body.townMapView !== undefined)
        throw conflict("Edit the village map in Village Settings.");
      let snapshot = await buildVillageSnapshot();
      if (
        body.sceneryArtStyle !== undefined ||
        body.personalizeVenueImagesByDefault !== undefined ||
        body.useVisualLoreByDefault !== undefined
      )
        snapshot = await setScenerySettings(body);
      if (body.name !== undefined) snapshot = await setVillageName(body.name);
      if (body.promptKnowledge !== undefined) {
        snapshot = await setVillagePromptKnowledge(body.promptKnowledge);
      }
      if (body.selectedLorebookIds !== undefined || body.loreTokenBudget !== undefined)
        snapshot = await setVillageLoreSettings(body.selectedLorebookIds, body.loreTokenBudget);
      // Choosing who the player is. There used to be a typed name and
      // description beside this, and there is no door left for them: the
      // Persona is the only answer, so this is one write with one shape.
      if (body.playerPersonaId !== undefined) {
        snapshot = await setVillagePlayer({ personaId: body.playerPersonaId });
      }
      if (body.setting !== undefined) snapshot = await setVillageSetting(body.setting);
      if (body.storyPace !== undefined) snapshot = await setVillageStoryPace(body.storyPace);
      if (body.sendOnEnter !== undefined) snapshot = await setVillageSendOnEnter(body.sendOnEnter);
      if (body.spriteCardFlipEnabled !== undefined)
        snapshot = await setVillageSpriteCardFlipEnabled(body.spriteCardFlipEnabled);
      if (body.characterSpeechColors !== undefined)
        snapshot = await setVillageCharacterSpeechColors(body.characterSpeechColors);
      if (body.visitRetention !== undefined) {
        await setVenueVisitRetention(body.visitRetention);
        snapshot = await buildVillageSnapshot();
      }
      if (body.homeBuildingNames !== undefined) snapshot = await setVillageHomeBuildingNames(body.homeBuildingNames);
      // Every place in the village in one list, the houses included: what the
      // panel edits and what the map places are the same records, so there is
      // one way in rather than a list of names and a list of pins that each
      // describe half a place.
      if (body.venues !== undefined)
        snapshot = await setVillageVenues(body.venues, body.venueScope === "homes" ? "homes" : "all");
      return snapshot;
    } catch (error) {
      return fail(reply, error, "saving the village settings");
    }
  });
  app.get("/narration", async (_request, reply) => {
    try {
      return await readVillageWriting();
    } catch (error) {
      return fail(reply, error, "reading how this agent's villagers are written");
    }
  });
  app.put<{
    Body: { tense?: unknown; person?: unknown; rating?: unknown; writingGuidance?: unknown };
  }>("/narration", async (request, reply) => {
    try {
      await saveVillageWriting(request.body ?? {});
      return await readVillageWriting();
    } catch (error) {
      return fail(reply, error, "saving how this agent's villagers are written");
    }
  });
}
export function registerConnectionRoutes(engine: FastifyInstance) {
  const app = engine;
  app.get("/connections", async (_request, reply) => {
    try {
      return await readVillageConnectionSettings();
    } catch (error) {
      return fail(reply, error, "reading this agent's connections");
    }
  });
  app.put<{
    Body: { systemConnectionId?: unknown; narrationConnectionId?: unknown; imageConnectionId?: unknown };
  }>("/connections", async (request, reply) => {
    try {
      return await saveVillageConnections(request.body ?? {});
    } catch (error) {
      return fail(reply, error, "saving this agent's connections");
    }
  });
}
