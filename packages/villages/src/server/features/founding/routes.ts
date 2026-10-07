import { fail, SETTINGS_BODY_LIMIT, VENUE_IMAGE_BODY_LIMIT } from "../../adapters/http/route-support.js";
import { readTownMapGeneration, requestTownMapGeneration } from "../../jobs/town-map-generation.js";
import { generateVillageTownMap } from "../media/town-map-image.js";
import { resetVenueSessions } from "../scenes/venue-session.js";
import { buildVillageSnapshot } from "../world/snapshot.js";
import {
  draftVenueDescriptions,
  resetVillage,
  runVillageSetup,
  suggestFoundingPlaces,
  suggestFoundingVenueNames,
} from "../world/village.js";
import { foundingPreparationSnapshot, retryFoundedVillagePreparation } from "./preparation.js";
import { generateFoundingVenueImage, suggestStartingVenues, uploadFoundingVenueImage } from "./founding-drafts.js";
import { draftScenarioImprint } from "./scenario-imprint.js";
import type { FastifyInstance } from "fastify";

export function registerFoundingRoutes(engine: FastifyInstance) {
  const app = engine;
  app.post<{
    Body: {
      foundingCharacterIds?: unknown;
      foundingResidentContexts?: unknown;
      name?: unknown;
      setting?: unknown;
      foundingReason?: unknown;
      foundingDetails?: unknown;
      foundingGuidance?: unknown;
      playerRole?: unknown;
      scenarioImprint?: unknown;
      worldFacts?: unknown;
      selectedLorebookIds?: unknown;
      sceneryArtStyle?: unknown;
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
        foundingResidentContexts: body.foundingResidentContexts,
        name: body.name,
        setting: body.setting,
        foundingReason: body.foundingReason,
        foundingDetails: body.foundingDetails,
        foundingGuidance: body.foundingGuidance,
        playerRole: body.playerRole,
        scenarioImprint: body.scenarioImprint,
        worldFacts: body.worldFacts,
        selectedLorebookIds: body.selectedLorebookIds,
        sceneryArtStyle: body.sceneryArtStyle,
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
      return await suggestStartingVenues(request.body);
    } catch (error) {
      return fail(reply, error, "suggesting starting spaces");
    }
  });
  app.post<{ Body: unknown }>("/setup/scenario-imprint/draft", async (request, reply) => {
    try {
      return await draftScenarioImprint(request.body);
    } catch (error) {
      return fail(reply, error, "drafting the Scenario imprint");
    }
  });
  app.post<{
    Body: {
      structure?: unknown;
      negative?: unknown;
      setting?: unknown;
      options?: unknown;
      connectionId?: unknown;
      selectedLorebookIds?: unknown;
      sceneryArtStyle?: unknown;
      personalizeVenueImagesByDefault?: unknown;
      useVisualLoreByDefault?: unknown;
      useVisualLore?: unknown;
      scenarioImprint?: unknown;
      actionId?: unknown;
      sourceKey?: unknown;
    };
  }>("/setup/town-map/generate", async (request, reply) => {
    try {
      if (request.body?.actionId !== undefined) return await requestTownMapGeneration(request.body);
      return await generateVillageTownMap(request.body ?? {});
    } catch (error) {
      return fail(reply, error, "drawing the village map");
    }
  });
  app.get<{ Params: { actionId: string } }>("/setup/town-map/generation/:actionId", async (request, reply) => {
    try {
      return await readTownMapGeneration(request.params.actionId);
    } catch (error) {
      return fail(reply, error, "retrieving the requested village map");
    }
  });
  app.post("/setup/reset", async (_request, reply) => {
    try {
      await resetVenueSessions();
      return await resetVillage();
    } catch (error) {
      return fail(reply, error, "resetting the village");
    }
  });
  app.post("/bootstrap", async (_request, reply) => {
    try {
      const snapshot = await buildVillageSnapshot();
      return await suggestFoundingPlaces(
        snapshot.settings.setting,
        snapshot.settings.selectedLorebookIds,
        snapshot.settings.loreTokenBudget,
      );
    } catch (error) {
      return fail(reply, error, "suggesting places");
    }
  });
  app.post<{ Body: { setting?: unknown; selectedLorebookIds?: unknown; loreTokenBudget?: unknown } }>(
    "/setup/public-venue/names/suggest",
    async (request, reply) => {
      try {
        return await suggestFoundingVenueNames(
          request.body?.setting,
          request.body?.selectedLorebookIds,
          request.body?.loreTokenBudget,
        );
      } catch (error) {
        return fail(reply, error, "suggesting public venue names");
      }
    },
  );
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
  app.post("/setup/preparation/retry", async (_request, reply) => {
    try {
      return await retryFoundedVillagePreparation();
    } catch (error) {
      return fail(reply, error, "retrying founding preparation");
    }
  });
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
