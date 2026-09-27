// Villages — the package's privileged route surface, mounted at `/api/villages`.
//
// Everything behind this plugin is the Engine owner (the host authenticates
// before the handler runs), so the routes only have to validate input and map
// failures to status codes.
//
// Venue conversations are village documents. Spinoff creation is NYI; existing
// native Engine roleplays can still be identified through the read-only route
// below. The retired scene lock remains exported for older extension surfaces.
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  activeVenueSession,
  continueVenueWithoutGreeting,
  endVenueSession,
  leaveVenueSession,
  enterResidencePrivateSpace,
  leaveVenueMemoryPending,
  enterVenue,
  greetVenue,
  listVenueVisitSummaries,
  readVenueVisit,
  deleteVenueVisit,
  deleteAllVenueVisits,
  setVenueVisitRetention,
  backfillVenueMemories,
  resetVenueSessions,
  sendVenueTurn,
  touchVenueSession,
  discardVenueVisitDebug,
} from "../services/villages/venue-session.js";
import { readVillageConnectionSettings, saveVillageConnections } from "../services/villages/connections.js";
import { readVillageWriting, saveVillageWriting } from "../services/villages/narration-settings.js";
import { badRequest, statusCodeOf } from "../services/villages/errors.js";
import { VENUE_CLASSES } from "../services/villages/venue-model.js";
import type { VillageVenueClass } from "../services/villages/types.js";
import { listVillageLorebooks } from "../services/villages/lorebooks.js";
import {
  generateVillageLocationImage,
  MAX_LOCATION_IMAGE_BASE64_LENGTH,
  storeVillageVenueImage,
} from "../services/villages/location-image.js";
import { generateVillageTownMap } from "../services/villages/town-map-image.js";
import {
  draftFoundingVenueText,
  generateFoundingVenueImage,
  uploadFoundingVenueImage,
} from "../services/villages/founding-drafts.js";
import {
  approveResidentSprite,
  generateResidentSprite,
  importSourceResidentSprite,
  listSourceResidentSprites,
  setResidentSpriteFraming,
} from "../services/villages/resident-sprites.js";
import { villagesLogger, villagesDebugAgentsEnabled } from "../services/villages/package-runtime.js";
import { MAX_SUBMISSION_ID_LENGTH, MAX_TOWN_MAP_IMAGE_LENGTH } from "../services/villages/prompt-preset.js";
import {
  readChatSpinOff,
  readSpinOffPresetPicker,
  readSpinOffPresetVariables,
  readVillageSceneLock,
} from "../services/villages/spinoff.js";
import {
  addNotice,
  addVillager,
  applyVillagerRefresh,
  buildVillageAgendas,
  buildVillageCatalog,
  buildVillagePersonaCatalog,
  buildVillageSnapshot,
  assertFoundedVillageReady,
  foundingPreparationSnapshot,
  retryFoundedVillagePreparation,
  buildVillageStory,
  buildVillageMemories,
  clearVillagerAgenda,
  correctCompletedWish,
  setVillagerScheduleIngestion,
  clearVillagerRemap,
  createVillageVenue,
  decideVillageVenueRequest,
  decideVillageHomeUpgrade,
  decideVillageResidence,
  completeVillageResidence,
  retryResidencePrivateSpaceAdaptation,
  draftVenueDescriptions,
  deleteVillageVenue,
  approveVillageResidence,
  previewVillageVenueDeletion,
  previewVillagerRefresh,
  proposeVillageResidence,
  proposeResidenceSpaceEdit,
  readVillageTownMapImage,
  refreshPlayerPersona,
  removeChronicleEntry,
  removeVillageRecollection,
  removeNoticeAt,
  removeVillager,
  resetVillage,
  suggestFoundingPlaces,
  suggestFoundingVenueNames,
  runVillageSetup,
  reconcileVillage,
  setVillageName,
  setVillagePlayer,
  setVillagePromptKnowledge,
  setVillageLoreSettings,
  setVillageStoryPace,
  setVillageSetting,
  setVillageTownMapImage,
  setVillageVenueImage,
  setVillageHomeBuildingNames,
  setVillageVenues,
  updateVillageVenue,
} from "../services/villages/village.js";
import {
  proposeVenueChange,
  proposePlayerMove,
  decideVillagerVenueImprovement,
} from "../services/villages/venue-mailbox.js";

/** Read one id off a route parameter without trusting its type. */
function readCharacterId(value: unknown): string {
  const characterId = typeof value === "string" ? value.trim() : "";
  if (characterId.length === 0) throw badRequest("A character id is required.");
  return characterId;
}

/** The same, for a place. */
function readVenueId(value: unknown): string {
  const venueId = typeof value === "string" ? value.trim() : "";
  if (venueId.length === 0) throw badRequest("A place id is required.");
  return venueId;
}

function readVenueSpaceClass(value: unknown): VillageVenueClass | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !VENUE_CLASSES.includes(value as VillageVenueClass))
    throw badRequest("Choose a valid Venue Class space.");
  return value as VillageVenueClass;
}

/** The same, for a chat. */
function readChatId(value: unknown): string {
  const chatId = typeof value === "string" ? value.trim() : "";
  if (chatId.length === 0) throw badRequest("A chat id is required.");
  return chatId;
}

function readMessage(value: unknown): string {
  const message = typeof value === "string" ? value.trim() : "";
  if (message.length === 0) throw badRequest("Write something before sending it.");
  if (message.length > 4000) {
    throw badRequest("A line can be at most 4000 characters.");
  }
  return message;
}

function readSubmissionId(value: unknown): string {
  const submissionId = typeof value === "string" ? value.trim() : "";
  if (submissionId.length === 0 || submissionId.length > MAX_SUBMISSION_ID_LENGTH) {
    throw badRequest(`A submission id must be between 1 and ${MAX_SUBMISSION_ID_LENGTH} characters.`);
  }
  return submissionId;
}

/**
 * Which place a room belongs to.
 *
 * The place travels in the BODY rather than in the path, the way a venue image
 * already does. A place id is a village id and can be any short string the
 * bootstrap chose, so a path segment would put an identifier inside a URL that
 * nothing else in this package puts there — and it is the one value the room
 * routes take, which makes it the one value worth stating once.
 */
function readPlaceId(value: unknown): string {
  const placeId = typeof value === "string" ? value.trim() : "";
  if (placeId.length === 0) throw badRequest("A place is required.");
  return placeId;
}

/**
 * Report a failure to the tab. An intentional status code is honoured; anything
 * else becomes a 500 whose message is kept, which is far easier to act on than
 * a generic "something went wrong".
 */
function fail(reply: FastifyReply, error: unknown, context: string) {
  const statusCode = statusCodeOf(error);
  const message = error instanceof Error ? error.message : "The village could not do that.";
  if (statusCode >= 500) villagesLogger().error(error, "[villages] %s failed", context);
  return reply.code(statusCode).send({ error: message });
}

type CharacterParams = { characterId: string };
type VenueTurnBody = {
  sessionId?: unknown;
  message?: unknown;
  mode?: unknown;
  targetId?: unknown;
  submissionId?: unknown;
};

/**
 * How large a settings request may be.
 *
 * One JSON body carrying one town map is the only thing here that is ever big,
 * so the transport budget is the storage budget plus the wrapper around it.
 * Stated by the package rather than inherited on purpose: the host's own limit
 * is far larger, and a route that silently depended on that number would stop
 * accepting maps the day it moved.
 */
const SETTINGS_BODY_LIMIT = MAX_TOWN_MAP_IMAGE_LENGTH + 64 * 1024;

/**
 * How large a body carrying one place's picture may be.
 *
 * A place's picture is not stored in the village, so it is not held to the town
 * map's much smaller budget — it is posted straight through to the Engine's
 * gallery, and the Engine's own ceiling is what should refuse it. The number is
 * taken from the one place that knows it so the transport budget and the
 * decoding budget cannot drift apart into an upload that is allowed through the
 * door and then rejected inside.
 */
const VENUE_IMAGE_BODY_LIMIT = MAX_LOCATION_IMAGE_BASE64_LENGTH + 64 * 1024;

// ── RETIRED 0.4.43 — the scene lane's return path. Kept, not called. ─────────
//
// Everything from here down to `sceneLockedRoutes` is the village-wide lock. Up to
// 0.4.42 an open scene held the whole village still: the narrative rule was that
// the player was doing something with one character, and a village they could keep
// rearranging behind that was a village not taking its own story seriously. Every
// write route on this plugin went through the locked surface below, and the three
// ways out were the three scene routes.
//
// That rule is gone, and it went with the rest of the two-way lane. The player's
// instruction was explicit — a spin-off makes a chat and then the village "doesnt
// care anymore and doesnt freeze, lock up, prevent input, wait for it, nothing" —
// and a lock is precisely the thing being described. A snapshot needs no
// protection: nothing about an open chat can be invalidated by the player
// reorganising the village they were taken out of, because the villager in that
// chat cannot see the village any more.
//
// `sceneLockedRoutes` is EXPORTED rather than merely declared, and that is the one
// edit made purely to keep this code alive. An unused local function is an ESLint
// error; an unused export is not, so exporting it is what lets the whole subgraph
// — the exit-path list, the message, the wrapper, and the `readVillageSceneLock`
// import above — stay in the file, type-checked and correct, without a single
// commented-out line. It is not public API and nothing outside this file should
// call it. If the lock ever comes back, `const app = sceneLockedRoutes(engine)` is
// the one line that has to change.

/**
 * The routes a scene stood in front of.
 *
 * A scene is the player's attention somewhere else. While a villager is away, the
 * village is not a place to rearrange, run, or hold another conversation in — and
 * the rule is enforced HERE rather than in the tab for the reason every rule is
 * enforced at the route: a screen can be bypassed, a reload or a second tab can
 * outlive the state that drew it, and a gate that only exists in a component is a
 * gate that doesn't exist. The tab still greys itself out; that is courtesy, and
 * this is the rule.
 *
 * THE LOCK IS EVERYTHING THAT WRITES. It is not a list of the routes that are
 * refused; it is a list of the three that are not, which is the smaller list and
 * the only one that stays true. A route added to this file next month is refused
 * without anybody remembering to add it, and the wrong way to be wrong is the
 * safe one: a write nobody meant to lock is a village held still for a moment, and
 * a write nobody remembered to lock is a player rearranging a village they are
 * supposed to be away from.
 *
 * Reads are absent by construction, since the lock never sees a GET and drawing
 * the village keeps working while a scene is open — which is what lets the screen
 * show the player why it is closed.
 *
 * The three exceptions are the exits: opening a scene, bringing one home, and
 * forgetting one. A lock with no exits is a trap, and the one thing worse than a
 * village that will not move on is one that will not let the player go.
 *
 * Named by the path each route is REGISTERED under, matched exactly, and that is
 * a fact about which handler is about to run rather than a guess about a caller's
 * url. The path is relative to the mount point, so the plugin's `/api/villages`
 * prefix is not repeated here and cannot drift from it. It is knowable here
 * because the lock is applied at registration and not per request — see
 * `sceneLockedRoutes` for why it has to be.
 *
 * Two entries, three routes: opening a scene and forgetting the link to one are
 * the same path with different methods, and both of them are ways out.
 */
const SCENE_EXIT_PATHS: string[] = [
  // Opening a scene for a villager, or forgetting the link to one.
  "/villagers/:characterId/scene",
  // Reading a scene back into the village, which is how one ends.
  "/villagers/:characterId/scene/end",
];

/**
 * Why the village will not do that, naming the villager who is away.
 *
 * The name is the whole reason this is a sentence and not a status code. "The
 * village is busy" is a wall; "Mira is away in a scene" tells the player which
 * villager to fetch and that fetching is the way out. A card that has since left
 * the library has no name to offer, so it falls back to the general form rather
 * than to an empty gap where a name should be.
 */
function sceneLockMessage(name: string): string {
  const who = name.length > 0 ? name : "A villager";
  return `${who} is away in a scene. Bring them home before doing anything else in the village.`;
}

/** One route handler, in the plain shape the lock wrapper works on. */
type VillageRouteHandler = (request: FastifyRequest, reply: FastifyReply) => unknown;

/**
 * One handler with the lock in front of it.
 *
 * The refusal is sent through `fail` rather than thrown, so the tab reads the
 * sentence out of the same `error` field every other refusal in this file writes.
 * A throw would hand the message to the host's own serializer and the tab would
 * show a status code instead of who is away.
 *
 * A lock that cannot be read fails OPEN, and that is the only safe direction: the
 * alternative is a village that refuses every action for a reason it cannot name,
 * which is indistinguishable from broken. The warn stays because a lock that
 * cannot be read is a bug worth seeing even while the village keeps working.
 */
function lockFirst(handler: VillageRouteHandler): VillageRouteHandler {
  return async (request, reply) => {
    try {
      const lock = await readVillageSceneLock();
      if (lock) return fail(reply, badRequest(sceneLockMessage(lock.name)), "a locked village");
    } catch (error) {
      villagesLogger().warn("[villages] could not read the scene lock: %s", String(error));
    }
    return handler(request, reply);
  };
}

/**
 * The surface the routes below are registered on, with the scene lock in front of
 * every write.
 *
 * THE LOCK CANNOT BE A HOOK, and that is a fact about the object the host hands a
 * package rather than a preference about where a gate belongs. A capability
 * package is NOT given a Fastify instance: the host builds a collector carrying
 * only the five route methods and `addContentTypeParser`, casts it to
 * `FastifyInstance` and calls the plugin with it (the Engine's
 * `capability-route-registration.service`; it registers the collected definitions
 * itself, so a package cannot install a plugin-wide hook even in principle).
 * `addHook` is not on that collector. Calling it throws at registration, which
 * fails the whole server entrypoint, and an entrypoint that fails to activate
 * takes the package to `status: "error"` — gone from Installed Agents and gone
 * from Home, with the cause only in the Engine's own log.
 *
 * So the lock is applied where the routes are registered instead. It is the same
 * moment in the request (before any handler below runs) and a better one for being
 * impossible to forget: a route registered through this surface is locked because
 * of how it was registered, not because somebody remembered to wrap it.
 *
 * `get` is deliberately NOT wrapped, so a read is never locked. Making that a
 * property of the construction rather than a branch inside the guard is what keeps
 * it true as routes are added.
 */
export function sceneLockedRoutes(engine: FastifyInstance): FastifyInstance {
  const raw = engine as unknown as Record<string, (path: string, ...rest: unknown[]) => unknown>;
  // ponytail: this surface carries the five route methods and nothing else, which
  // is exactly what the host gives a package and all this file uses. `engine` stays
  // in scope for the one thing a route cannot express — `addContentTypeParser`, if a
  // route ever needs a body type the host does not already parse — so reaching for
  // it there would be a decision rather than an accident.
  const register = (method: "get" | "post" | "put" | "patch" | "delete") => {
    const target = raw[method];
    return (path: string, optionsOrHandler: unknown, handler?: unknown) => {
      // Two shapes, both used in this file: `(path, handler)`, and
      // `(path, options, handler)` where `PATCH /settings` states its own body
      // limit. Restated here rather than imported because the host's own
      // normalisation is not exported.
      const supplied = (typeof optionsOrHandler === "function" ? optionsOrHandler : handler) as VillageRouteHandler;
      const locked = method === "get" || SCENE_EXIT_PATHS.includes(path) ? supplied : lockFirst(supplied);
      const options = typeof optionsOrHandler === "object" && optionsOrHandler !== null ? optionsOrHandler : undefined;
      // Called with `engine` as the receiver rather than as a bare function: the
      // host's collector does not care, but the tests hand over a real Fastify
      // instance, and a real Fastify instance needs its own `this`.
      if (options === undefined) target.call(engine, path, locked);
      else target.call(engine, path, options, locked);
    };
  };
  return {
    delete: register("delete"),
    get: register("get"),
    patch: register("patch"),
    post: register("post"),
    put: register("put"),
  } as unknown as FastifyInstance;
}

export async function villagesRoutes(engine: FastifyInstance) {
  // `app` is the object the host handed over, unchanged. It used to be the locked
  // surface — `sceneLockedRoutes(engine)` — and that is the whole of what 0.4.43
  // removed from this file's behaviour: routes are registered on the collector the
  // host built, exactly as every other package does it, and nothing stands between
  // a request and its handler any more.
  //
  // The five method names are still called with `engine` as the receiver rather
  // than as bare functions, which the collector does not need but a real Fastify
  // instance does. See `sceneLockedRoutes` above.
  const app = engine;

  app.get("/", async (_request, reply) => {
    try {
      return await buildVillageSnapshot();
    } catch (error) {
      return fail(reply, error, "village snapshot");
    }
  });

  app.get("/catalog", async (_request, reply) => {
    try {
      return { characters: await buildVillageCatalog() };
    } catch (error) {
      return fail(reply, error, "character catalog");
    }
  });

  // The Personas the player could be. Read on the same terms as the character
  // catalog and for the same reason: the picker offers what the library holds
  // now, so a Persona deleted a minute ago simply stops being an option.
  app.get("/personas", async (_request, reply) => {
    try {
      return { personas: await buildVillagePersonaCatalog() };
    } catch (error) {
      return fail(reply, error, "persona catalog");
    }
  });

  // Bring the copy of the player's Persona up to date, then hand back the whole
  // snapshot so the tab that asked has the refreshed name in the same round
  // trip.
  //
  // Its own route rather than a flag on `/snapshot`, and a POST rather than a
  // GET, because it writes: a snapshot read happens on every chat send and on a
  // once-a-minute pulse, and neither of those is a moment the player said "go
  // and look at my Persona again". The tab asks for this exactly twice — when
  // the village tab opens and when its settings open — and the diff inside
  // `refreshPlayerPersona` means the second ask usually costs nothing.
  app.post("/persona/refresh", async (_request, reply) => {
    try {
      await refreshPlayerPersona();
      return await buildVillageSnapshot();
    } catch (error) {
      return fail(reply, error, "refreshing your Persona");
    }
  });

  // The town map on its own. It would be simpler to carry the picture on the
  // snapshot, but a snapshot is rebuilt on every chat send, and an image in it
  // would be re-sent whole on every turn. The tab fetches this instead.
  app.get("/town-map", async (_request, reply) => {
    try {
      return await readVillageTownMapImage();
    } catch (error) {
      return fail(reply, error, "reading the town map");
    }
  });

  app.post<{ Body: { characterId?: unknown } }>("/villagers", async (request, reply) => {
    try {
      await addVillager(readCharacterId(request.body?.characterId));
      return await buildVillageSnapshot();
    } catch (error) {
      return fail(reply, error, "adding a villager");
    }
  });

  app.get<{ Params: CharacterParams }>("/villagers/:characterId/refresh", async (request, reply) => {
    try {
      return await previewVillagerRefresh(readCharacterId(request.params.characterId));
    } catch (error) {
      return fail(reply, error, "previewing a villager refresh");
    }
  });

  app.post<{ Params: CharacterParams }>("/villagers/:characterId/refresh", async (request, reply) => {
    try {
      return await applyVillagerRefresh(readCharacterId(request.params.characterId));
    } catch (error) {
      return fail(reply, error, "refreshing a villager snapshot");
    }
  });

  app.delete<{ Params: CharacterParams }>("/villagers/:characterId", async (request, reply) => {
    try {
      await removeVillager(readCharacterId(request.params.characterId));
      return await buildVillageSnapshot();
    } catch (error) {
      return fail(reply, error, "removing a villager");
    }
  });

  app.get<{ Params: CharacterParams }>("/villagers/:characterId/sprites/source", async (request, reply) => {
    try {
      return { sprites: await listSourceResidentSprites(readCharacterId(request.params.characterId)) };
    } catch (error) {
      return fail(reply, error, "listing source sprites");
    }
  });

  app.post<{
    Params: CharacterParams;
    Body: { view?: unknown; expression?: unknown; appearance?: unknown; useReference?: unknown };
  }>("/villagers/:characterId/sprites/generate", async (request, reply) => {
    try {
      return await generateResidentSprite(readCharacterId(request.params.characterId), request.body ?? {});
    } catch (error) {
      return fail(reply, error, "drawing a resident sprite");
    }
  });

  app.post<{ Params: CharacterParams; Body: { view?: unknown; expression?: unknown; image?: unknown } }>(
    "/villagers/:characterId/sprites/approve",
    { bodyLimit: SETTINGS_BODY_LIMIT },
    async (request, reply) => {
      try {
        return await approveResidentSprite(readCharacterId(request.params.characterId), request.body ?? {});
      } catch (error) {
        return fail(reply, error, "approving a resident sprite");
      }
    },
  );

  app.post<{ Params: CharacterParams; Body: { view?: unknown; expression?: unknown } }>(
    "/villagers/:characterId/sprites/import",
    async (request, reply) => {
      try {
        return await importSourceResidentSprite(
          readCharacterId(request.params.characterId),
          request.body?.expression,
          request.body?.view,
        );
      } catch (error) {
        return fail(reply, error, "copying a source sprite");
      }
    },
  );

  app.patch<{ Params: CharacterParams; Body: { mode?: unknown; cropPercent?: unknown } }>(
    "/villagers/:characterId/sprites/framing",
    async (request, reply) => {
      try {
        return await setResidentSpriteFraming(readCharacterId(request.params.characterId), request.body ?? {});
      } catch (error) {
        return fail(reply, error, "framing a resident sprite");
      }
    },
  );

  // One active venue visit, restored across reloads and archived when it ends.
  app.get("/rooms/active", async (_request, reply) => {
    try {
      return { session: await activeVenueSession(), debugDiscardEnabled: villagesDebugAgentsEnabled() };
    } catch (error) {
      return fail(reply, error, "reading the active venue");
    }
  });
  app.post<{ Body: { venueId?: unknown; spaceClass?: unknown; privateOwnerId?: unknown } }>(
    "/rooms",
    async (request, reply) => {
      try {
        await assertFoundedVillageReady();
        const spaceClass = request.body?.spaceClass;
        if (
          spaceClass !== undefined &&
          spaceClass !== "residence" &&
          spaceClass !== "workplace" &&
          spaceClass !== "gathering" &&
          spaceClass !== "other"
        )
          throw badRequest("Choose a valid Venue Class space.");
        return {
          session: await enterVenue(
            readPlaceId(request.body?.venueId),
            spaceClass,
            typeof request.body?.privateOwnerId === "string" ? request.body.privateOwnerId : "",
          ),
        };
      } catch (error) {
        return fail(reply, error, "entering a venue");
      }
    },
  );
  app.post<{ Body: { sessionId?: unknown } }>("/rooms/greet", async (request, reply) => {
    try {
      await assertFoundedVillageReady();
      return { session: await greetVenue(readChatId(request.body?.sessionId)) };
    } catch (error) {
      return fail(reply, error, "greeting a venue");
    }
  });
  app.post<{ Body: { sessionId?: unknown } }>("/rooms/continue", async (request, reply) => {
    try {
      await assertFoundedVillageReady();
      return { session: await continueVenueWithoutGreeting(readChatId(request.body?.sessionId)) };
    } catch (error) {
      return fail(reply, error, "continuing a venue without a greeting");
    }
  });
  app.post<{ Body: { sessionId?: unknown } }>("/rooms/activity", async (request, reply) => {
    try {
      return { session: await touchVenueSession(readChatId(request.body?.sessionId)) };
    } catch (error) {
      return fail(reply, error, "updating venue activity");
    }
  });
  app.post<{ Body: { sessionId?: unknown; ownerId?: unknown } }>("/rooms/enter-private", async (request, reply) => {
    try {
      await assertFoundedVillageReady();
      return {
        session: await enterResidencePrivateSpace(
          readChatId(request.body?.sessionId),
          readCharacterId(request.body?.ownerId),
        ),
      };
    } catch (error) {
      return fail(reply, error, "entering a private Residence space");
    }
  });
  app.post<{ Body: { sessionId?: unknown } }>("/rooms/debug/discard", async (request, reply) => {
    try {
      await discardVenueVisitDebug(readChatId(request.body?.sessionId));
      return { discarded: true };
    } catch (error) {
      return fail(reply, error, "discarding a debug venue visit");
    }
  });

  app.post<{ Body: VenueTurnBody }>("/rooms/turn", async (request, reply) => {
    try {
      await assertFoundedVillageReady();
      const mode = request.body?.mode;
      if (mode !== "chat" && mode !== "ask" && mode !== "fulfill" && mode !== "act")
        throw badRequest("Choose Chat, Ask, Fulfill, or Act.");
      return await sendVenueTurn({
        sessionId: readChatId(request.body?.sessionId),
        message: readMessage(request.body?.message),
        mode,
        targetId: typeof request.body?.targetId === "string" ? request.body.targetId : "",
        submissionId: readSubmissionId(request.body?.submissionId),
      });
    } catch (error) {
      return fail(reply, error, "sending a venue turn");
    }
  });
  app.post<{ Body: { sessionId?: unknown; submissionId?: unknown; message?: unknown } }>(
    "/rooms/leave",
    async (request, reply) => {
      try {
        return await leaveVenueSession(
          readChatId(request.body?.sessionId),
          readSubmissionId(request.body?.submissionId),
          typeof request.body?.message === "string" ? request.body.message : "",
        );
      } catch (error) {
        return fail(reply, error, "leaving a venue naturally");
      }
    },
  );
  app.post<{ Body: { sessionId?: unknown } }>("/rooms/end", async (request, reply) => {
    try {
      return { session: await endVenueSession(readChatId(request.body?.sessionId)) };
    } catch (error) {
      return fail(reply, error, "ending a venue conversation");
    }
  });
  app.post<{ Body: { sessionId?: unknown } }>("/rooms/leave-pending", async (request, reply) => {
    try {
      return { session: await leaveVenueMemoryPending(readChatId(request.body?.sessionId)) };
    } catch (error) {
      return fail(reply, error, "leaving a venue with memory pending");
    }
  });
  app.get<{ Querystring: { venueId?: string; characterId?: string; offset?: string; limit?: string } }>(
    "/rooms/archive",
    async (request, reply) => {
      try {
        await backfillVenueMemories();
        return await listVenueVisitSummaries({
          placeId: request.query?.venueId,
          characterId: request.query?.characterId,
          offset: Number(request.query?.offset ?? 0),
          limit: Number(request.query?.limit ?? 20),
        });
      } catch (error) {
        return fail(reply, error, "listing venue visits");
      }
    },
  );
  app.get<{ Params: { id: string } }>("/rooms/archive/:id", async (request, reply) => {
    try {
      return { visit: await readVenueVisit(request.params.id) };
    } catch (error) {
      return fail(reply, error, "reading a venue visit");
    }
  });
  app.post<{ Params: { id: string } }>("/rooms/archive/:id/retry-memory", async (request, reply) => {
    try {
      return { session: await endVenueSession(request.params.id) };
    } catch (error) {
      return fail(reply, error, "retrying venue memory");
    }
  });
  app.delete<{ Params: { id: string } }>("/rooms/archive/:id", async (request, reply) => {
    try {
      await deleteVenueVisit(request.params.id);
      return { deleted: true };
    } catch (error) {
      return fail(reply, error, "deleting a venue visit");
    }
  });
  app.delete("/rooms/archive", async (_request, reply) => {
    try {
      await deleteAllVenueVisits();
      return { deleted: true };
    } catch (error) {
      return fail(reply, error, "deleting venue visits");
    }
  });

  // ── Village settings ───────────────────────────────────────────────────────
  app.get("/lorebooks", async (_request, reply) => {
    try {
      return { books: await listVillageLorebooks() };
    } catch (error) {
      return fail(reply, error, "reading lorebooks");
    }
  });
  // Patch-shaped on purpose: the settings panel saves one field at a time, so a
  // cleared textarea must be able to send "" without it reading as "absent".
  app.patch<{
    Body: {
      name?: unknown;
      promptKnowledge?: unknown;
      selectedLorebookIds?: unknown;
      loreTokenBudget?: unknown;
      playerPersonaId?: unknown;
      setting?: unknown;
      venues?: unknown;
      venueScope?: unknown;
      townMapImage?: unknown;
      townMapView?: unknown;
      homeBuildingNames?: unknown;
      storyPace?: unknown;
      visitRetention?: unknown;
    };
  }>("/settings", { bodyLimit: SETTINGS_BODY_LIMIT }, async (request, reply) => {
    try {
      const body = request.body ?? {};
      let snapshot = await buildVillageSnapshot();
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
      // The framing rides along with the picture and is ignored without one, so
      // a patch that only names a framing changes nothing rather than quietly
      // cropping whichever map happens to be drawn.
      if (body.townMapImage !== undefined) {
        snapshot = await setVillageTownMapImage(body.townMapImage, body.townMapView);
      }
      return snapshot;
    } catch (error) {
      return fail(reply, error, "saving the village settings");
    }
  });

  // ── Per-village venue writing ──────────────────────────────────────────────
  app.get("/narration", async (_request, reply) => {
    try {
      return await readVillageWriting();
    } catch (error) {
      return fail(reply, error, "reading how this agent's villagers are written");
    }
  });

  app.put<{
    Body: { tense?: unknown; person?: unknown; rating?: unknown; styleInstructions?: unknown; replyGuidance?: unknown };
  }>("/narration", async (request, reply) => {
    try {
      await saveVillageWriting(request.body ?? {});
      return await readVillageWriting();
    } catch (error) {
      return fail(reply, error, "saving how this agent's villagers are written");
    }
  });

  // ── Which connection does the work ────────────────────────────────────────
  // Deliberately not part of `/settings`. These choices belong to the agent and
  // not to the village, and "Reset the village and start over" rewrites the
  // village — so they are kept in a document of their own and survive it. Only
  // the CHOSEN ids live here; the list of connections to choose between is the
  // Engine's own and the panel reads it from `/api/connections`.
  app.get("/connections", async (_request, reply) => {
    try {
      return await readVillageConnectionSettings();
    } catch (error) {
      return fail(reply, error, "reading this agent's connections");
    }
  });

  // Patch-shaped like `/settings`: clearing a picker back to the Engine default
  // sends "", which has to be distinguishable from leaving the field out.
  app.put<{
    Body: { systemConnectionId?: unknown; narrationConnectionId?: unknown; imageConnectionId?: unknown };
  }>("/connections", async (request, reply) => {
    try {
      return await saveVillageConnections(request.body ?? {});
    } catch (error) {
      return fail(reply, error, "saving this agent's connections");
    }
  });

  // ── Founding the village ──────────────────────────────────────────────────
  // One request, one write. The wizard collects the name, the setting, the
  // player and the places before sending any of it, so a village is never left
  // half founded by a step that failed in the middle.
  app.post<{
    Body: {
      name?: unknown;
      setting?: unknown;
      foundingReason?: unknown;
      foundingDetails?: unknown;
      selectedLorebookIds?: unknown;
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
        name: body.name,
        setting: body.setting,
        foundingReason: body.foundingReason,
        foundingDetails: body.foundingDetails,
        selectedLorebookIds: body.selectedLorebookIds,
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

  // A paid operation with no side effects: the result stays in the founding
  // wizard until the final setup write. Closing the wizard leaves no half-made
  // village and no map attached to one.
  app.post<{
    Body: {
      structure?: unknown;
      negative?: unknown;
      setting?: unknown;
      options?: unknown;
      connectionId?: unknown;
      selectedLorebookIds?: unknown;
    };
  }>("/setup/town-map/generate", async (request, reply) => {
    try {
      return await generateVillageTownMap(request.body ?? {});
    } catch (error) {
      return fail(reply, error, "drawing the village map");
    }
  });

  // The destructive half of the pair the General settings panel offers. Posted
  // rather than deleted because it does not remove the village: it puts it back
  // to how it was before it was founded.
  app.post("/setup/reset", async (_request, reply) => {
    try {
      await resetVenueSessions();
      return await resetVillage();
    } catch (error) {
      return fail(reply, error, "resetting the village");
    }
  });

  // Ask the model for places, from scratch. Split from PATCH /settings because
  // it is slow (one model call) and can fail for reasons that have nothing to do
  // with the village's own state, so it must not be able to take a bad setting
  // write down with it.
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

  app.post<{ Body: unknown }>("/setup/venues/draft", async (request, reply) => {
    try {
      return await draftFoundingVenueText(request.body);
    } catch (error) {
      return fail(reply, error, "drafting founding venues");
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

  // ── Pictures of places ───────────────────────────────────────────────────
  //
  // The picture is what the chat surface is drawn on. It is deliberately NOT
  // part of `PATCH /settings` alongside the venues themselves: the panel saves
  // names and notes in one gesture, while a picture arrives separately and may
  // take twenty seconds to arrive at all. As part of the same write, any edit
  // made while a picture was being drawn would have thrown it away.
  //
  // Exterior and shared-space draws use this player action. First entry to a
  // private room uses the same generator once in the background, with a
  // persisted attempt marker so visits and refreshes cannot repeat it.

  app.post<{ Body: { venueId?: unknown; connectionId?: unknown; spaceClass?: unknown; privateOwnerId?: unknown } }>(
    "/locations/venue/image",
    async (request, reply) => {
      try {
        return await generateVillageLocationImage(
          readVenueId(request.body?.venueId),
          // A connection the tab named wins; anything else is left to the
          // package's own choice. The value is not validated here because
          // whether it draws images is a question only the Engine can answer,
          // and it already answers it with a better message than this could.
          typeof request.body?.connectionId === "string" ? request.body.connectionId : undefined,
          readVenueSpaceClass(request.body?.spaceClass),
          typeof request.body?.privateOwnerId === "string" ? request.body.privateOwnerId : "",
        );
      } catch (error) {
        return fail(reply, error, "drawing a place");
      }
    },
  );

  // A picture the player already has. Same road past the drawing: it goes to
  // the gallery and the village keeps a reference, so a village with twenty
  // photographed places weighs the same as one with none.
  app.put<{ Body: { venueId?: unknown; image?: unknown; spaceClass?: unknown; privateOwnerId?: unknown } }>(
    "/locations/venue/image",
    { bodyLimit: VENUE_IMAGE_BODY_LIMIT },
    async (request, reply) => {
      try {
        return await storeVillageVenueImage(
          readVenueId(request.body?.venueId),
          request.body?.image,
          readVenueSpaceClass(request.body?.spaceClass),
          typeof request.body?.privateOwnerId === "string" ? request.body.privateOwnerId : "",
        );
      } catch (error) {
        return fail(reply, error, "keeping a place's picture");
      }
    },
  );

  // Taking the picture away leaves the gallery entry where it is. The Engine's
  // gallery is the player's, and an image that lands there is theirs to keep or
  // delete; a package that reached in and removed it would be deleting from a
  // library it does not own. It costs a reference on one venue and nothing else.
  app.delete<{ Body: { venueId?: unknown; spaceClass?: unknown; privateOwnerId?: unknown } }>(
    "/locations/venue/image",
    async (request, reply) => {
      try {
        await setVillageVenueImage(
          readVenueId(request.body?.venueId),
          null,
          readVenueSpaceClass(request.body?.spaceClass),
          typeof request.body?.privateOwnerId === "string" ? request.body.privateOwnerId : "",
        );
        return await buildVillageSnapshot();
      } catch (error) {
        return fail(reply, error, "taking a place's picture away");
      }
    },
  );

  app.post<{ Body: unknown }>("/locations/venue", async (request, reply) => {
    try {
      return await createVillageVenue(request.body);
    } catch (error) {
      return fail(reply, error, "creating a place");
    }
  });

  app.post<{ Params: { requestId: string }; Body: unknown }>(
    "/venue-requests/:requestId/approve",
    async (request, reply) => {
      try {
        return await decideVillageVenueRequest(readVenueId(request.params.requestId), true, request.body);
      } catch (error) {
        return fail(reply, error, "approving a venue request");
      }
    },
  );

  app.post<{ Params: { requestId: string } }>("/venue-requests/:requestId/deny", async (request, reply) => {
    try {
      return await decideVillageVenueRequest(readVenueId(request.params.requestId), false, null);
    } catch (error) {
      return fail(reply, error, "denying a venue request");
    }
  });

  app.post<{ Params: { requestId: string } }>("/venue-upgrades/:requestId/approve", async (request, reply) => {
    try {
      return await decideVillageHomeUpgrade(readVenueId(request.params.requestId), true);
    } catch (error) {
      return fail(reply, error, "approving a home upgrade");
    }
  });
  app.post<{ Params: { requestId: string } }>("/venue-upgrades/:requestId/deny", async (request, reply) => {
    try {
      return await decideVillageHomeUpgrade(readVenueId(request.params.requestId), false);
    } catch (error) {
      return fail(reply, error, "denying a home upgrade");
    }
  });

  app.put<{ Params: { venueId: string }; Body: unknown }>("/locations/venue/:venueId", async (request, reply) => {
    try {
      return await updateVillageVenue(readVenueId(request.params.venueId), request.body);
    } catch (error) {
      return fail(reply, error, "updating a place");
    }
  });

  app.post<{ Params: { venueId: string }; Body: unknown }>(
    "/locations/venue/:venueId/edit-proposals",
    async (request, reply) => {
      try {
        return await proposeResidenceSpaceEdit(readVenueId(request.params.venueId), request.body);
      } catch (error) {
        return fail(reply, error, "proposing a Residence edit");
      }
    },
  );

  app.get<{ Params: { venueId: string } }>("/locations/venue/:venueId/dependencies", async (request, reply) => {
    try {
      return await previewVillageVenueDeletion(readVenueId(request.params.venueId));
    } catch (error) {
      return fail(reply, error, "checking place dependencies");
    }
  });

  app.delete<{ Params: { venueId: string }; Body: { confirmed?: unknown } }>(
    "/locations/venue/:venueId",
    async (request, reply) => {
      try {
        return await deleteVillageVenue(readVenueId(request.params.venueId), request.body?.confirmed === true);
      } catch (error) {
        return fail(reply, error, "deleting a place");
      }
    },
  );

  app.post<{ Body: { characterId?: unknown; venueId?: unknown } }>("/residences/proposals", async (request, reply) => {
    try {
      return await proposeVillageResidence(request.body?.characterId, request.body?.venueId);
    } catch (error) {
      return fail(reply, error, "proposing a residence");
    }
  });

  app.post<{ Params: { venueId: string }; Body: unknown }>(
    "/locations/venue/:venueId/proposals",
    async (request, reply) => {
      try {
        await proposeVenueChange(readVenueId(request.params.venueId), request.body);
        return await buildVillageSnapshot();
      } catch (error) {
        return fail(reply, error, "proposing a Venue change");
      }
    },
  );

  app.post<{ Params: { venueId: string } }>("/locations/venue/:venueId/player-move", async (request, reply) => {
    try {
      await proposePlayerMove(readVenueId(request.params.venueId));
      return await buildVillageSnapshot();
    } catch (error) {
      return fail(reply, error, "requesting a player move");
    }
  });

  app.post<{
    Params: { mailId: string };
    Body: { approved?: unknown; title?: unknown; description?: unknown; extraBeds?: unknown; slot?: unknown };
  }>("/venue-mail/:mailId/decision", async (request, reply) => {
    try {
      await decideVillagerVenueImprovement(
        readVenueId(request.params.mailId),
        request.body?.approved === true,
        request.body,
      );
      return await buildVillageSnapshot();
    } catch (error) {
      return fail(reply, error, "deciding a Venue improvement");
    }
  });

  app.post<{ Body: { characterId?: unknown } }>("/residences/approvals", async (request, reply) => {
    try {
      return await approveVillageResidence(request.body?.characterId);
    } catch (error) {
      return fail(reply, error, "approving a residence");
    }
  });

  app.post<{ Body: { characterId?: unknown } }>("/residences/denials", async (request, reply) => {
    try {
      return await decideVillageResidence(request.body?.characterId, false, "player");
    } catch (error) {
      return fail(reply, error, "denying a residence change");
    }
  });

  app.post<{ Body: { characterId?: unknown } }>("/residences/debug/complete-now", async (request, reply) => {
    try {
      return await completeVillageResidence(request.body?.characterId, true);
    } catch (error) {
      return fail(reply, error, "completing a residence change");
    }
  });

  app.post<{ Body: { characterId?: unknown } }>("/residences/private-space/retry", async (request, reply) => {
    try {
      return await retryResidencePrivateSpaceAdaptation(request.body?.characterId);
    } catch (error) {
      return fail(reply, error, "adapting a private space");
    }
  });

  app.post<{ Body: { notice?: unknown } }>("/noticeboard", async (request, reply) => {
    try {
      return await addNotice(request.body?.notice);
    } catch (error) {
      return fail(reply, error, "pinning up a notice");
    }
  });

  app.delete<{ Params: { index: string } }>("/noticeboard/:index", async (request, reply) => {
    try {
      return await removeNoticeAt(request.params.index);
    } catch (error) {
      return fail(reply, error, "taking a notice down");
    }
  });

  // Advance deterministic village state to the current exact instant, then
  // optionally make the day's bounded creative call. Posted because it can
  // write. Snapshot GETs remain free of hidden persistence.
  app.post<{ Body: { forceStory?: unknown } }>("/reconcile", async (request, reply) => {
    try {
      return await reconcileVillage({ forceStory: request.body?.forceStory === true });
    } catch (error) {
      return fail(reply, error, "writing down what has been happening");
    }
  });

  // ── The village story ──────────────────────────────────────────────────────
  // The debug surface for the village's memory, and nothing else reads these two
  // routes yet. They are on their own path rather than on the snapshot for the
  // same reason the town map is: the story is the one part of the record that
  // grows without a ceiling, and a snapshot is rebuilt on every chat send.
  //
  // Reading is deliberately unguarded by any "is it developed" flag. The whole
  // point of shipping this before deciding what to expose is to be able to look
  // at what the village actually remembers, and a review surface behind a switch
  // is one nobody turns on.
  app.get<{ Querystring: { offset?: string; limit?: string } }>("/story", async (request, reply) => {
    try {
      await backfillVenueMemories();
      const entries = await buildVillageStory();
      const offset = Math.max(0, Number(request.query?.offset ?? 0) || 0);
      const limit = Math.min(100, Math.max(1, Number(request.query?.limit ?? 50) || 50));
      return { entries: entries.slice(offset, offset + limit), total: entries.length };
    } catch (error) {
      return fail(reply, error, "reading the village story");
    }
  });

  // ── Player-facing memory library ──────────────────────────────────────────
  app.get("/memories", async (_request, reply) => {
    try {
      // Returning to the library gives one pending visit a best-effort retry.
      // The visit is already closed and archived, so a failing model never
      // holds the room or prevents this read from succeeding.
      let archive = await listVenueVisitSummaries({ limit: 100 });
      const pending = archive.visits.find((visit) => visit.memoryPending);
      if (pending) {
        try {
          await endVenueSession(pending.id);
        } catch (error) {
          villagesLogger().warn("[villages] pending memory retry failed for %s: %s", pending.id, String(error));
        }
        archive = await listVenueVisitSummaries({ limit: 100 });
      }
      return {
        ...(await buildVillageMemories()),
        archive: {
          total: archive.total,
          pendingReviewCount: archive.visits.filter((visit) => visit.memoryPending).length,
          recent: archive.visits.slice(0, 6),
        },
      };
    } catch (error) {
      return fail(reply, error, "reading villager memories");
    }
  });

  app.delete<{ Params: { id: string } }>("/memories/durable/:id", async (request, reply) => {
    try {
      await removeChronicleEntry(request.params.id);
      return buildVillageMemories();
    } catch (error) {
      return fail(reply, error, "forgetting a durable memory");
    }
  });

  app.delete<{ Params: { id: string } }>("/memories/recollections/:id", async (request, reply) => {
    try {
      await removeVillageRecollection(request.params.id);
      return buildVillageMemories();
    } catch (error) {
      return fail(reply, error, "letting go of a passing recollection");
    }
  });

  // Forgetting one memory answers with the whole list again, so the tab has one
  // source of truth for what it draws and cannot drift out of step with a delete
  // that removed something other than what the press was aimed at.
  app.delete<{ Params: { id: string } }>("/story/:id", async (request, reply) => {
    try {
      await removeChronicleEntry(request.params.id);
      const entries = await buildVillageStory();
      return { entries: entries.slice(0, 50), total: entries.length };
    } catch (error) {
      return fail(reply, error, "forgetting a memory");
    }
  });

  // ── What each villager is after ────────────────────────────────────────────
  // The third debug surface, on its own path for the third time and for the same
  // reason: one model call's worth of text per villager, and nothing on any other
  // screen reads a word of it.
  //
  // It also carries how the Engine's week for each villager happens here, and the
  // prompt that translation is written from, because the two are only readable
  // together: the moves mean nothing without the week they were made from, and a
  // prompt nobody can read is a prompt nobody can fix.
  //
  // The deletes are the only writes here and they spend nothing — clearing
  // whatever was cached means the village writes it again on the next part of the
  // day it already runs on. They are split into two presses rather than one
  // because they are two separate model calls with two separate prompts, and
  // asking again for one of them should not throw away the other. Both answer
  // with the whole list, like every other delete on this package, so the tab has
  // one source of truth for what it draws.
  app.get("/agendas", async (_request, reply) => {
    try {
      return { villagers: await buildVillageAgendas() };
    } catch (error) {
      return fail(reply, error, "reading what the villagers wish for");
    }
  });

  app.delete<{ Params: CharacterParams }>("/agendas/:characterId", async (request, reply) => {
    try {
      await clearVillagerAgenda(readCharacterId(request.params.characterId));
      return { villagers: await buildVillageAgendas() };
    } catch (error) {
      return fail(reply, error, "forgetting what a villager wishes for");
    }
  });

  app.post<{ Params: CharacterParams }>("/agendas/:characterId/regenerate", async (request, reply) => {
    try {
      await clearVillagerAgenda(readCharacterId(request.params.characterId));
      return { villagers: await buildVillageAgendas() };
    } catch (error) {
      return fail(reply, error, "regenerating a villager's agenda");
    }
  });

  app.post<{ Params: CharacterParams & { wishId: string } }>(
    "/agendas/:characterId/completed/:wishId/correct",
    async (request, reply) => {
      try {
        await correctCompletedWish(readCharacterId(request.params.characterId), request.params.wishId);
        return { villagers: await buildVillageAgendas() };
      } catch (error) {
        return fail(reply, error, "correcting a completed wish");
      }
    },
  );

  app.patch<{ Params: CharacterParams; Body: { ingestSchedule?: unknown } }>(
    "/agendas/:characterId/ingestion",
    async (request, reply) => {
      try {
        if (typeof request.body?.ingestSchedule !== "boolean")
          throw badRequest("Choose whether to use the Marinara schedule.");
        await setVillagerScheduleIngestion(readCharacterId(request.params.characterId), request.body.ingestSchedule);
        return { villagers: await buildVillageAgendas() };
      } catch (error) {
        return fail(reply, error, "changing schedule ingestion");
      }
    },
  );

  // The translation on its own path, next to the wishes it belongs with, because
  // the button that clears it sits in the same panel: it is the way to correct a
  // prompt without waiting for Monday, which is the only other thing that
  // invalidates a translation. The press only DELETES — the next part of the day
  // writes the new translation — so the failure message names forgetting rather
  // than retrying, and a model that refuses again is a refusal rather than a
  // failure of this request.
  app.delete<{ Params: CharacterParams }>("/remaps/:characterId", async (request, reply) => {
    try {
      await clearVillagerRemap(readCharacterId(request.params.characterId));
      return { villagers: await buildVillageAgendas() };
    } catch (error) {
      return fail(reply, error, "forgetting a villager's translation");
    }
  });

  // ── A villager in a chat of their own ──────────────────────────────────────
  // The four routes on this plugin that touch an Engine chat, so the only four
  // with a permission the rest of the package does not need: `chat-read` to ask
  // what a chat is, and `chat-write` to make one.
  //
  // A spin-off is a real roleplay chat: it appears in the chat list, it runs on the
  // player's own preset and connection, and the Engine's pipeline writes it. The
  // package's part in it is to MAKE one, once, and to be able to answer whose a
  // given chat is. That is all four routes below and there is deliberately no fifth.
  //
  // WHAT IS NOT HERE, and each absence is a decision rather than an omission:
  //
  //   - THERE IS NO LISTING. The package keeps no record of the chats it has made,
  //     so there is nothing to list. A tab that wanted rows would be a tab holding
  //     a second copy of the player's chat list, out of date the moment they
  //     renamed or deleted one.
  //   - THERE IS NO WAY TO READ A CHAT'S WORDS. Nothing is brought back into the
  //     village, so nothing needs to be read. The package never sees what is said
  //     in a spin-off after the opening line.
  //   - THERE IS NO WAY TO FILE, END OR FORGET ONE. All three are words for a link,
  //     and there is no link. The chat is the player's; the Engine's own delete is
  //     how it goes away, and the package will simply stop recognising it.
  //   - NOTHING IS LOCKED. An open spin-off holds nothing still — see the banner
  //     above `sceneLockedRoutes`.
  //
  // The one fact the package does keep is stamped into the CHAT's own metadata at
  // creation, not into a village document, which is why the last route below can
  // answer "whose is this" for a chat made on a tab that has long since closed.

  // The presets a spin-off could run on, plus the label for "no preset" and the
  // longest name the popup may accept.
  //
  // Its own route rather than a field on something else, because on this lane there
  // is nothing else to read: the popup opens from a villager's tile, has no rows to
  // draw beside it, and would otherwise make the tab fetch the village's document
  // store in order to offer a dropdown.
  app.get("/spinoffs/prompts", async (_request, reply) => {
    try {
      return await readSpinOffPresetPicker();
    } catch (error) {
      return fail(reply, error, "reading the presets a spin-off could run on");
    }
  });

  // The questions a preset asks, so the spawn popup can put them to the player
  // before there is a chat to put them in.
  //
  // Answered as an empty list rather than a failure when a preset has no
  // questions, because "this preset asks nothing" is the common case, not an
  // error, and it is the same shape the popup draws either way. The path is the
  // Engine's own route for a preset's choice blocks, passed through rather than
  // reimplemented — `readSpinOffPresetVariables` says why.
  app.get<{ Params: { presetId: string } }>("/presets/:presetId/variables", async (request, reply) => {
    try {
      return await readSpinOffPresetVariables(request.params.presetId);
    } catch (error) {
      return fail(reply, error, "reading a preset's questions");
    }
  });

  // Take this villager out of the village: make the chat, leave the snapshot in it,
  // and let the villager open it.
  //
  // The body is deliberately three optional fields and nothing else. Everything
  // that decides what the chat IS — the mode, the persona, the character — is the
  // package's call and is not settable from a request; the three things that are
  // genuinely the player's — what to call it, which preset to run it on, and how
  // they answered that preset's own questions — are the three fields here.
  // Validation of all three lives in `spawnVillagerSpinOff`, where the ceilings and
  // the fallbacks are the same code that applies them.
  //
  // It answers with the chat it made and nothing about how it will go, because
  // there is nothing to know: the request is over the moment the opening line
  // lands, and nothing that happens in that chat afterwards reaches this package.
  // Is this chat one of ours, and whose was it?
  //
  // The only route in the package that is asked about a chat the package does not
  // own, which is why it is also the only one that answers `null` instead of
  // failing: a roleplay chat the player made themselves is the ordinary input
  // here, not a bad request, and the two in-chat surfaces both mount on chats that
  // mostly are not ours. `readChatSpinOff` never throws; the only refusal reachable
  // from here is a missing chat id in the path.
  app.get<{ Params: { chatId: string } }>("/spinoffs/:chatId", async (request, reply) => {
    try {
      return await readChatSpinOff(readChatId(request.params.chatId));
    } catch (error) {
      return fail(reply, error, "reading where a roleplay came from");
    }
  });

  /*
   * RETIRED 0.4.43 — the scene lane's return path. Kept, not called.
   *
   * The four routes that were registered here. They are commented out rather than
   * deleted because they are the worked example of the whole crossing — a listing
   * read, a spawn, a bring-home and a forget — and because the four service
   * functions behind them are all still in `spinoff.ts`, exported, correct and
   * equally uncalled. Together the two halves are a complete two-way lane that
   * could be switched on again by uncommenting this block and restoring one line
   * at the top of `villagesRoutes`.
   *
   * They are NOT registered, and the difference is not cosmetic. Registering them
   * would put four routes on the wire whose handlers write village records about
   * chats the player owns, which is exactly the association the lane was inverting
   * away from. A route that exists is a route a tab will eventually call.
   *
   * What each one would need if it came back: `readVillageSceneLock` is already
   * imported above for the lock, and the other four names — `listVillagerScenes`,
   * `spawnVillagerScene`, `importVillagerScene`, `unlinkVillagerScene` — have to be
   * added back to the import from `../services/villages/spinoff.js`, along with
   * `SceneBody` in place of `SpinOffBody`.
   *
   * // The listing: which villagers are somewhere tonight, where, and on what preset.
   * app.get("/scenes", async (_request, reply) => {
   *   try {
   *     return await listVillagerScenes();
   *   } catch (error) {
   *     return fail(reply, error, "listing scenes");
   *   }
   * });
   *
   * // Stand up a chat for this villager.
   * app.post<{ Params: CharacterParams; Body: SceneBody }>("/villagers/:characterId/scene", async (request, reply) => {
   *   try {
   *     const characterId = readCharacterId(request.params.characterId);
   *     const body = request.body ?? {};
   *     return await spawnVillagerScene(characterId, {
   *       presetId: body.presetId,
   *       name: body.name,
   *       presetChoices: body.presetChoices,
   *     });
   *   } catch (error) {
   *     return fail(reply, error, "opening a scene");
   *   }
   * });
   *
   * // Bring the scene home: read what was written in it, remember it, and leave the
   * // chat exactly where it is.
   * app.post<{ Params: CharacterParams }>("/villagers/:characterId/scene/end", async (request, reply) => {
   *   try {
   *     return await importVillagerScene(readCharacterId(request.params.characterId));
   *   } catch (error) {
   *     return fail(reply, error, "bringing a scene back");
   *   }
   * });
   *
   * // Forget the link and only the link: the chat stays in the Engine with every
   * // word in it.
   * app.delete<{ Params: CharacterParams }>("/villagers/:characterId/scene", async (request, reply) => {
   *   try {
   *     return await unlinkVillagerScene(readCharacterId(request.params.characterId));
   *   } catch (error) {
   *     return fail(reply, error, "forgetting a scene");
   *   }
   * });
   *
   * The preset-variables route above is the one survivor of the four: it was
   * registered on exactly this path before, it is a read of the Engine's own preset
   * metadata rather than anything about a scene, and the spawn popup needs it
   * either way. Only its service function was renamed.
   */
}
