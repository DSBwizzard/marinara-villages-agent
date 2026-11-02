import { resetVillage } from "../world/village.js";
import { fail, SETTINGS_BODY_LIMIT, VENUE_IMAGE_BODY_LIMIT } from "../../adapters/http/route-support.js";
import { requestFoundingSuggestions, readFoundingSuggestions } from "./founding-suggestions.js";
import { readTownMapGeneration, requestTownMapGeneration } from "../../jobs/town-map-generation.js";

import { resetVenueSessions } from "../scenes/archive.js";
import { draftVenueDescriptions, runVillageSetup } from "./founding-setup.js";
import { foundingPreparationSnapshot, retryFoundedVillagePreparation } from "./preparation.js";
import { generateFoundingVenueImage, suggestStartingVenues, uploadFoundingVenueImage } from "./founding-drafts.js";
import type { FastifyInstance } from "fastify";

export function registerFoundingRoutes(engine: FastifyInstance) {
  const app = engine;
  app.post<{
    Body: {
      foundingCharacterIds?: unknown;
      foundingSpriteRevisions?: unknown;
      foundingResidentAdmissions?: unknown;
      name?: unknown;
      timeZone?: unknown;
      setting?: unknown;
      worldRules?: unknown;
      worldName?: unknown;
      communityVenueId?: unknown;
      playerBackground?: unknown;
      circumstances?: unknown;
      selectedLorebookIds?: unknown;
      sceneryArtStyle?: unknown;
      sceneryStyleProfileId?: unknown;
      personalizeVenueImagesByDefault?: unknown;
      useVisualLoreByDefault?: unknown;
      useVisualLore?: unknown;
      loreTokenBudget?: unknown;
      playerPersonaId?: unknown;
      venues?: unknown;
      townMapImage?: unknown;
      townMapView?: unknown;
      homeBuildingNames?: unknown;
    };
  }>("/setup", { bodyLimit: SETTINGS_BODY_LIMIT }, async (request, reply) => {
    try {
      const body = request.body ?? {};
      return await runVillageSetup({
        foundingCharacterIds: body.foundingCharacterIds,
        foundingSpriteRevisions: body.foundingSpriteRevisions,
        foundingResidentAdmissions: body.foundingResidentAdmissions,
        name: body.name,
        timeZone: body.timeZone,
        setting: body.setting,
        worldRules: body.worldRules,
        worldName: body.worldName,
        communityVenueId: body.communityVenueId,
        playerBackground: body.playerBackground,
        circumstances: body.circumstances,
        selectedLorebookIds: body.selectedLorebookIds,
        sceneryArtStyle: body.sceneryArtStyle,
        sceneryStyleProfileId: body.sceneryStyleProfileId,
        personalizeVenueImagesByDefault: body.personalizeVenueImagesByDefault,
        useVisualLoreByDefault: body.useVisualLoreByDefault,
        loreTokenBudget: body.loreTokenBudget,
        playerPersonaId: body.playerPersonaId,
        venues: body.venues,
        townMapImage: body.townMapImage,
        townMapView: body.townMapView,
        homeBuildingNames: body.homeBuildingNames,
      });
    } catch (error) {
      return fail(reply, error, "setting the village up");
    }
  });
  app.post<{ Body: unknown }>("/setup/venues/suggest", async (request, reply) => {
    try {
      const body = request.body as { actionId?: unknown } | null;
      if (body?.actionId !== undefined) return await requestFoundingSuggestions(request.body);
      return await suggestStartingVenues(request.body);
    } catch (error) {
      return fail(reply, error, "suggesting starting spaces");
    }
  });
  app.get<{ Params: { actionId: string; targetId: string } }>(
    "/setup/venues/suggestions/:actionId",
    async (request, reply) => {
      try {
        return await readFoundingSuggestions(request.params.actionId);
      } catch (error) {
        return fail(reply, error, "retrieving Venue suggestions");
      }
    },
  );
  app.post<{
    Body: {
      structure?: unknown;
      negative?: unknown;
      setting?: unknown;
      connectionId?: unknown;
      selectedLorebookIds?: unknown;
      sceneryArtStyle?: unknown;
      sceneryStyleProfileId?: unknown;
      personalizeVenueImagesByDefault?: unknown;
      useVisualLoreByDefault?: unknown;
      useVisualLore?: unknown;
      actionId?: unknown;
      targetId?: unknown;
      sourceKey?: unknown;
    };
  }>("/maps/generate", async (request, reply) => {
    try {
      return await requestTownMapGeneration(request.body);
    } catch (error) {
      return fail(reply, error, "drawing the village map");
    }
  });
  app.get<{ Params: { actionId: string; targetId: string } }>(
    "/maps/generation/:targetId/:actionId",
    async (request, reply) => {
      try {
        return await readTownMapGeneration(request.params.actionId, request.params.targetId);
      } catch (error) {
        return fail(reply, error, "retrieving the requested village map");
      }
    },
  );
  app.post("/setup/reset", async (_request, reply) => {
    try {
      await resetVenueSessions();
      return await resetVillage();
    } catch (error) {
      return fail(reply, error, "resetting the village");
    }
  });
  app.post<{ Body: unknown }>("/locations/venue/descriptions/draft", async (request, reply) => {
    try {
      return await draftVenueDescriptions(request.body);
    } catch (error) {
      return fail(reply, error, "drafting venue descriptions");
    }
  });
  app.get("/setup/preparation", async (_request, reply) => {
    try {
      return await foundingPreparationSnapshot();
    } catch (error) {
      return fail(reply, error, "reading founding preparation");
    }
  });
  app.post<{ Body: import("../../../shared/contracts/founding-tasks.js").FoundingRetry }>(
    "/setup/preparation/retry",
    async (request, reply) => {
      try {
        return await retryFoundedVillagePreparation(request.body ?? {});
      } catch (error) {
        return fail(reply, error, "retrying founding preparation");
      }
    },
  );
  app.post<{ Body: unknown }>("/setup/venue-image/generate", async (request, reply) => {
    try {
      return await generateFoundingVenueImage(request.body);
    } catch (error) {
      return fail(reply, error, "drawing a founding venue");
    }
  });
  app.put<{ Body: unknown }>("/setup/venue-image", { bodyLimit: VENUE_IMAGE_BODY_LIMIT }, async (request, reply) => {
    try {
      return await uploadFoundingVenueImage(request.body);
    } catch (error) {
      return fail(reply, error, "keeping a founding venue image");
    }
  });
}
