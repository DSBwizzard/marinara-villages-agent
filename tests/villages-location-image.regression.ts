// Villages — proof for the pictures a place can have.
//
// A place's picture spends the player's image tokens, so these tests cover:
//
//   * explicit drawing for exterior and shared spaces, and one automatic
//     attempt only after the player first enters a private space; and
//   * what comes back is a REFERENCE, never bytes.
//
// The generation boundary is checked structurally so founding, remapping, and
// the clock cannot start extra image requests.
//
// The second half is proved at the document: what the village writes is three
// short strings, and the picture itself lives in the Engine's own gallery
// where the player can find it.
//
// The rest is the boundary between this package and the Engine, which is where
// the feature is genuinely delicate:
//
//   * The Engine's avatar route IGNORES a prompt override whose id does not
//     match its own arithmetic — silently, at full price, producing a portrait
//     of a place instead of a view of one. The id is therefore compared,
//     character for character, against the Engine's own source rather than
//     against a second copy of the rule written here and agreed with itself.
//   * The picture is uploaded over loopback, so the transport is faked and the
//     exact requests are read back: which endpoint, with what body, filed in
//     which folder, named which way.
//   * A gallery folder is an ornament. A lookup that fails has to cost the
//     player nothing at all, which is asserted by making the first lookup fail
//     and watching the picture land anyway.
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * The path the Engine draws a character's picture on, written out rather than
 * imported for the same reason the connection regression writes its document id
 * out: it is a compatibility surface with another codebase, so a rename should
 * fail this test rather than be followed by it.
 */
const AVATAR_PATH = "/api/characters/avatar-generation";

/** The Engine's own gallery endpoints, on the same terms. */
const FOLDERS_PATH = "/api/global-gallery/folders";
const UPLOAD_PATH = "/api/global-gallery/upload";

/** One pixel of PNG. Real enough to decode, small enough to read. */
const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8AAAwAB/AGtLQAAAABJRU5ErkJggg==";

/** Every `.ts`/`.tsx` under a directory, with its contents. */
async function collectSources(root: string): Promise<Array<{ path: string; source: string }>> {
  const found: Array<{ path: string; source: string }> = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const child = join(root, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await collectSources(child)));
      continue;
    }
    if (/\.tsx?$/.test(entry.name)) found.push({ path: child, source: await readFile(child, "utf8") });
  }
  return found;
}

async function main() {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const engineRoot = process.env.MARINARA_ENGINE_ROOT;
  assert.ok(engineRoot, "Set MARINARA_ENGINE_ROOT to the current Marinara Engine checkout.");
  const moduleUrl = (relativePath: string) => pathToFileURL(join(repoRoot, relativePath)).href;
  const services = "packages/villages/src/engine/packages/server/src/services/villages";

  const { avatarPromptId, buildLocationPrompt, decodeImageDataUrl, MAX_LOCATION_IMAGE_BASE64_LENGTH } = await import(
    moduleUrl(`${services}/location-image.ts`)
  );
  const {
    GLOBAL_GALLERY_REF_PREFIX,
    isGlobalGalleryRef,
    MAX_VENUE_IMAGE_BYTES,
    MAX_VENUE_IMAGE_ID_LENGTH,
    MAX_VENUE_IMAGE_URL_LENGTH,
    MAX_PLACES,
    MAX_SETTING_LENGTH,
    VILLAGES_GALLERY_FOLDER_NAME,
  } = await import(moduleUrl(`${services}/prompt-preset.ts`));
  const { coerceVillageState, readVillageState, mutateVillageState } = await import(
    moduleUrl(`${services}/village-store.ts`)
  );
  const { villageEngineBaseUrl } = await import(moduleUrl(`${services}/engine-loopback.ts`));
  const { describeMoment } = await import(moduleUrl(`${services}/village-clock.ts`));

  // ── The one number two codebases have to agree on ──────────────────────────
  // The tab refuses a file before encoding it, the package refuses a data url
  // before decoding it, and the Engine refuses the upload. Three ceilings that
  // agree today are three ceilings that will disagree tomorrow, so all three are
  // derived from one byte count, and that byte count is the Engine's own.
  assert.equal(MAX_VENUE_IMAGE_BYTES, 20 * 1024 * 1024, "the ceiling is the Engine's own gallery upload limit");
  assert.equal(
    MAX_LOCATION_IMAGE_BASE64_LENGTH,
    Math.ceil(MAX_VENUE_IMAGE_BYTES / 3) * 4,
    "the decoding ceiling is the transport ceiling, not a second guess at it",
  );
  assert.equal(
    VILLAGES_GALLERY_FOLDER_NAME,
    "Villages",
    "the gallery folder is named after the package and nothing else",
  );

  // ── The prompt id the Engine has to recognise ──────────────────────────────
  // The Engine builds this key itself, in `characters.routes.ts`, and looks an
  // override up BY it. A copy that has drifted does not fail — it is ignored,
  // and the player pays for a portrait of a place. So the rule is read out of
  // the Engine's own source and the copy is checked against what is there.
  const engineRoutes = await readFile(join(engineRoot, "packages/server/src/routes/characters.routes.ts"), "utf8");
  const squeeze = (text: string) => text.replace(/\s+/g, "");
  const engineRule = squeeze(
    `name.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 120) || "character"`,
  );
  assert.ok(
    squeeze(engineRoutes).includes(engineRule),
    "the Engine's avatar prompt id rule moved; `avatarPromptId` in location-image.ts has to move with it",
  );
  assert.ok(
    squeeze(engineRoutes).includes(squeeze(`\${purpose === "character-sheet" ? "character-sheet" : "avatar"}:\${`)),
    "the Engine's avatar prompt id prefix moved",
  );
  assert.ok(
    squeeze(engineRoutes).includes(
      squeeze('promptOverrideById.get(avatarGenerationPromptId(body.name ?? "character", body.purpose))'),
    ),
    "the Engine stopped looking the override up by this key, which is the only reason the key matters",
  );

  const slugOf = (name: string) =>
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 120) || "character";
  for (const name of ["the mill pond", "  The  Mill Pond!  ", "Mill_Pond-2", "???", "", "   ", "x".repeat(400)]) {
    assert.equal(
      avatarPromptId(name, "avatar"),
      `avatar:${slugOf(name)}`,
      `the prompt id for ${JSON.stringify(name)} has to be the one the Engine computes`,
    );
  }
  assert.equal(avatarPromptId("the mill pond", "character-sheet"), `character-sheet:${slugOf("the mill pond")}`);
  assert.equal(
    avatarPromptId("the mill pond", "something-else" as any),
    `avatar:${slugOf("the mill pond")}`,
    "anything that is not a reference sheet is a portrait, exactly as it is in the Engine",
  );

  // ── What counts as a picture on the way in ────────────────────────────────
  const decoded = decodeImageDataUrl(TINY_PNG);
  assert.equal(decoded.mime, "image/png");
  assert.ok(decoded.bytes.byteLength > 0);
  assert.equal(
    decodeImageDataUrl("data:IMAGE/PNG;base64,AAAA").mime,
    "image/png",
    "the type is normalised, because it is about to be matched against an extension",
  );
  for (const refused of [
    "",
    "   ",
    null,
    undefined,
    42,
    "not an image at all",
    "data:text/plain;base64,AAAA",
    "data:image/png,AAAA",
    "data:image/png;base64,",
    "data:image/png;base64,!!!",
  ]) {
    assert.throws(() => decodeImageDataUrl(refused), undefined, `${JSON.stringify(refused)} is not a picture`);
  }
  assert.throws(
    () => decodeImageDataUrl(`data:image/png;base64,${"A".repeat(MAX_LOCATION_IMAGE_BASE64_LENGTH + 4)}`),
    /at most \d+ MB of image data/,
    "something too large is refused with the size in the message rather than decoded first",
  );

  // ── What the model is asked for ───────────────────────────────────────────
  // Assembled out of what the village already knows, so the picture agrees with
  // the words beside it. Nothing here is invented and nothing here is a second
  // call: the moment was worked out from the clock, for free.
  const moment = {
    dateLabel: "11 September",
    weekday: "Friday",
    season: "autumn" as const,
    dayPhase: "morning",
    instant: "2026-09-11T16:30:00.000Z",
    localTime: "09:30",
    minuteOfDay: 570,
    timeZone: "America/Los_Angeles",
    hour: 9,
    minute: 30,
    weather: "fine drizzle",
    dayIndex: 3,
    nextTransitionAt: "2026-09-11T16:31:00.000Z",
  };
  const setting = "A mill town at the foot of a ridge.";
  const village = coerceVillageState({ setting });
  assert.equal(
    buildLocationPrompt(
      village,
      coerceVillageState({
        venues: [{ id: "mill", name: "the mill pond", form: "where the grain is ground" }],
      }).venues[0]!,
      moment,
    ),
    [
      "A wide, empty exterior view of the mill pond and its approach in Willowbrook. Show the building from outside; do not show an interior.",
      "Venue roles: other.",
      "Venue form: where the grain is ground.",
      `Village setting and theme: ${setting}.`,
      `It is ${describeMoment(moment)}, and the weather is ${moment.weather}.`,
      "Honor these facts and do not invent conflicting architecture, technology or geography.",
      "Painted background art for a story: no people, no animals, no text, no lettering, no watermark.",
    ].join(" "),
    "the prompt is the place, the village, the weather, and an explicit refusal of people",
  );
  const interiorPrompt = buildLocationPrompt(
    village,
    coerceVillageState({
      venues: [{ id: "mill", name: "the mill pond", form: "grain", description: "A timbered room" }],
    }).venues[0]!,
    moment,
    "",
    "interior",
  );
  assert.match(interiorPrompt, /interior view/u);
  assert.match(interiorPrompt, /A timbered room/u);
  assert.doesNotMatch(interiorPrompt, /building from outside/u);
  assert.match(
    buildLocationPrompt(
      village,
      coerceVillageState({ venues: [{ id: "mill", name: "the mill pond", form: "" }] }).venues[0]!,
      moment,
      "The mill walls are red brick",
    ),
    /Established visual lore: The mill walls are red brick/,
    "relevant lore reaches a generated venue image",
  );
  const factual = buildLocationPrompt(
    coerceVillageState({
      setting,
      foundingDetails: "Built beside the ridge",
      venues: [{ id: "square", name: "market square", form: "trade" }],
    }),
    coerceVillageState({
      venues: [
        {
          id: "mill",
          name: "the mill pond",
          form: "a stone watermill",
          description: "A stone mill beside shallow water",
          exteriorState: {
            condition: "weathered but sound",
            items: ["oak workbench"],
            publicFacts: ["the wheel turns east"],
          },
          state: {
            condition: "a private interior repair",
            furniture: ["a hidden cabinet"],
            publicFacts: ["a Private Space fact"],
            upgrades: ["new roof"],
            updatedAt: "",
          },
        },
      ],
    }).venues[0]!,
    moment,
  );
  for (const fact of [
    "a stone watermill",
    "A stone mill beside shallow water",
    "weathered but sound",
    "oak workbench",
    "the wheel turns east",
    "new roof",
    "market square",
  ])
    assert.ok(factual.includes(fact), `${fact} informs the venue image`);
  assert.doesNotMatch(factual, /private interior repair|hidden cabinet|Private Space fact/u);
  const occupiedExterior = buildLocationPrompt(
    village,
    coerceVillageState({
      venues: [
        {
          id: "home",
          name: "Bob's home",
          form: "a brick cottage",
          classes: ["residence"],
          residentIds: ["bob"],
          description: "a brick porch beneath ivy",
          state: {
            condition: "a secret interior leak",
            furniture: ["hidden room chest"],
            publicFacts: ["Private Space fact"],
          },
        },
      ],
    }).venues[0]!,
    moment,
  );
  assert.match(occupiedExterior, /brick cottage|brick porch/u);
  assert.doesNotMatch(occupiedExterior, /secret|hidden room chest|Private Space fact/u);
  assert.equal(
    buildLocationPrompt(
      village,
      coerceVillageState({ venues: [{ id: "mill", name: "the mill pond", form: "   " }] }).venues[0]!,
      moment,
    ).includes("—"),
    false,
    "a place with no note does not get a dangling dash",
  );
  const chatty = buildLocationPrompt(
    coerceVillageState({ setting: "y".repeat(MAX_SETTING_LENGTH + 200) }),
    coerceVillageState({ venues: [{ id: "mill", name: "the mill pond", form: "" }] }).venues[0]!,
    moment,
  );
  assert.ok(chatty.length < 1_200, "a two-thousand-character setting is cut for a picture rather than refused");

  // ── What a stored picture is allowed to be ────────────────────────────────
  // A reference is only worth keeping if all of it is well formed. Half of one
  // is worse than none: a ref with no url cannot be drawn, and a url with no ref
  // is a picture nothing protects from deletion.
  const picture = { ref: "global-gallery:abc123", url: "/api/global-gallery/file/abc123.png", id: "abc123" };
  const venuesWith = (image: unknown) =>
    coerceVillageState({ venues: [{ id: "mill", name: "the mill pond", presentation: { image } }] }).venues;

  assert.deepEqual(venuesWith(picture)[0]!.presentation.image, picture, "a well-formed reference survives the store");
  assert.deepEqual(
    venuesWith({ ref: picture.ref, url: picture.url })[0]!.presentation.image,
    picture,
    "an id that went missing is derived from the reference rather than treated as a broken picture",
  );
  for (const refused of [
    null,
    undefined,
    7,
    "global-gallery:abc123",
    { ref: "abc123", url: picture.url },
    { ref: "global-gallery:", url: picture.url },
    { ref: "global-gallery:abc/def", url: picture.url },
    { ref: "global-gallery:abc 123", url: picture.url },
    { ref: picture.ref },
    { ref: picture.ref, url: "   " },
    { ref: picture.ref, url: 42 },
    { ref: picture.ref, url: "x".repeat(MAX_VENUE_IMAGE_URL_LENGTH + 1) },
  ]) {
    assert.equal(
      venuesWith(refused)[0]!.presentation.image,
      null,
      `${JSON.stringify(refused)} is not a picture, and half of one is not a picture either`,
    );
  }
  assert.ok(
    venuesWith({ ref: picture.ref, url: "x".repeat(MAX_VENUE_IMAGE_URL_LENGTH) })[0]!.presentation.image,
    "a url exactly at the ceiling is still a url",
  );
  assert.deepEqual(
    Object.keys(venuesWith(picture)[0]!.presentation.image!).sort(),
    ["id", "ref", "url"],
    "a stored picture is three short strings — the bytes are the gallery's, forever",
  );
  assert.ok(isGlobalGalleryRef(picture.ref) && GLOBAL_GALLERY_REF_PREFIX === "global-gallery:");
  assert.ok(MAX_VENUE_IMAGE_ID_LENGTH > 0 && MAX_VENUE_IMAGE_URL_LENGTH > 0);
  // A place with no name is still not a place, picture or no picture.
  assert.deepEqual(coerceVillageState({ venues: [{ name: "  ", presentation: { image: picture } }] }).venues, []);

  // ── What a stored place is allowed to be ──────────────────────────────────
  // The village holds ONE list of places. Some of them are houses and some are
  // somewhere a villager can be sent, and which is which is asked in one place
  // rather than decided here — see `isHousePlace`. What is pinned below is the
  // consequence: a place that says it is a house may have no NAME, because the
  // village has no name for one, while a place that says nothing else and has no
  // name is not a place at all — its name is the whole of what the translation
  // list can say about it.
  const placesOf = (entries: unknown[]) => coerceVillageState({ venues: entries }).venues;
  const house = (id: string, characterId: string | null, extra: Record<string, unknown> = {}) => ({
    id,
    name: "",
    form: "",
    occupancy: { playerHome: false, residentCharacterId: characterId, homeKind: "small-home" },
    ...extra,
  });

  assert.deepEqual(
    Object.keys(placesOf([house("bram-house", "character-bram")])[0]!).sort(),
    [
      "archivedPrivateSpaces",
      "archivedZones",
      "baseClasses",
      "buildProjectId",
      "capabilities",
      "category",
      "classes",
      "constructionStatus",
      "description",
      "editProposals",
      "exteriorState",
      "form",
      "id",
      "imageContext",
      "improvements",
      "layoutVersion",
      "name",
      "occupancy",
      "playerInvitations",
      "playerSeenPrivateIds",
      "playerSeenPublic",
      "playerSeenShared",
      "presentation",
      "privateSpaces",
      "residenceCapacity",
      "residentIds",
      "spaces",
      "state",
      "usedInvitationIds",
      "workerIds",
      "zones",
    ],
    "a stored place has normalized presentation, occupancy, capabilities, and state fields",
  );
  assert.deepEqual(
    placesOf([house("bram-house", "character-bram")]).map((place) => place.id),
    ["bram-house"],
    "a place with no name is kept when somebody lives in it, because the village knows 'Bram's house' — a sentence " +
      "about Bram, not a name for a building",
  );
  assert.deepEqual(
    placesOf([house("empty-house", null)]).map((place) => place.id),
    ["empty-house"],
    "and an empty one is still a house: the wizard asks for four houses on the map and the player may fill them in " +
      "later, so a roof nobody has moved into yet must not become a destination",
  );
  assert.deepEqual(
    placesOf([
      house("player-house", null, { occupancy: { playerHome: true, residentCharacterId: null, homeKind: null } }),
    ]).map((place) => place.id),
    ["player-house"],
    "and the player's own home is nameless and may have no building either — it is their house whether or not the " +
      "village has decided what it looks like",
  );
  assert.deepEqual(
    placesOf([{ id: "nameless", name: "   ", form: "", occupancy: {} }]),
    [],
    "while the same nameless place with nothing saying it is a house is dropped rather than kept as a blank row in " +
      "the player's editor",
  );
  assert.equal(
    placesOf([
      house("player-house", "character-bram", {
        occupancy: { playerHome: true, residentCharacterId: "character-bram", homeKind: "small-home" },
      }),
    ])[0]!.occupancy.residentCharacterId,
    null,
    "and the player's home holds nobody: an occupant written against it is an accident, and a resident parked there " +
      "would never be found in the place they actually live",
  );

  // ── The two rules no single place can check for itself ────────────────────
  // Only one place is the player's, and a character lives in one place at a
  // time. Both are enforced on the way IN rather than trusted, because a
  // duplicate makes every reader of the list disagree about who lives where, and
  // the disagreement is silent — it only shows up as somebody standing in the
  // wrong room.
  assert.deepEqual(
    placesOf([
      house("first", null, { occupancy: { playerHome: true, residentCharacterId: null, homeKind: "small-home" } }),
      house("second", null, { occupancy: { playerHome: true, residentCharacterId: null, homeKind: "small-home" } }),
    ]).map((place) => place.id),
    ["first"],
    "only one place is the player's, and it is the one the village wrote first rather than a guess at which was meant",
  );
  assert.deepEqual(
    placesOf([house("bram-house", "character-bram"), house("bram-again", "character-bram")]).map((place) => place.id),
    ["bram-house"],
    "a character lives in one place at a time, and the duplicate is dropped rather than merged because which one the " +
      "player meant cannot be guessed from here",
  );
  assert.deepEqual(
    placesOf([house("bram-house", "character-bram"), house("bram-house", "character-rosa")]).map((place) => place.id),
    ["bram-house"],
    "and a place is one place, so a second entry wearing the first one's id does not become a second pin",
  );
  assert.deepEqual(
    placesOf([
      house("player-house", "character-bram", {
        occupancy: { playerHome: true, residentCharacterId: "character-bram", homeKind: "small-home" },
      }),
      house("bram-house", "character-bram"),
    ]).map((place) => [place.id, place.occupancy.residentCharacterId]),
    [
      ["player-house", null],
      ["bram-house", "character-bram"],
    ],
    "and the occupant discarded from the player's home is not counted as having been placed, so the house they " +
      "really live in is still kept",
  );

  // ── Where a place stands ──────────────────────────────────────────────────
  // A position is read as a whole or not at all, because half a position is not
  // one: a place with an x and no y cannot be drawn, and keeping the x would let
  // a later write put the pin on the left edge believing the village had meant
  // it. Nothing is clamped either, for the same reason — a coordinate outside
  // the picture reads as "no position", which costs the player a pin rather than
  // moving it somewhere they never put it.
  const spot = (x: unknown, y: unknown) =>
    placesOf([{ id: "mill", name: "the mill", form: "", presentation: { x, y } }])[0]!;
  assert.deepEqual([spot(0.25, 0.5).presentation.x, spot(0.25, 0.5).presentation.y], [0.25, 0.5]);
  assert.deepEqual(
    [spot(0, 1).presentation.x, spot(0, 1).presentation.y],
    [0, 1],
    "and the corners are inside the picture, at both ends",
  );
  for (const [x, y] of [
    [0.25, null],
    [null, 0.5],
    [1.2, 0.5],
    [0.5, -0.1],
    [Number.NaN, 0.5],
    ["0.5", 0.5],
  ] as const) {
    assert.deepEqual(
      [spot(x, y).presentation.x, spot(x, y).presentation.y],
      [null, null],
      `${JSON.stringify(x)},${JSON.stringify(y)} is not a position, and half of one is not a position either`,
    );
  }

  // The cap counts the houses, because this is the list that holds them; the
  // translator's smaller budget is applied where it belongs — see `remapVenues`.
  assert.equal(
    placesOf(
      Array.from({ length: MAX_PLACES + 6 }, (_, index) => ({
        id: `place-${index}`,
        name: `place ${index}`,
        form: "",
      })),
    ).length,
    MAX_PLACES,
    "a village holds MAX_PLACES places, houses included",
  );

  // ── Where the Engine is ───────────────────────────────────────────────────
  // Read from the environment because that is where the truth is: the package
  // is loaded INTO the Engine's process. A wrong guess costs one refused call
  // and a thrown guess would cost the feature, so an unreadable PORT takes the
  // shipped default.
  const original = { PORT: process.env.PORT, SSL_CERT: process.env.SSL_CERT, SSL_KEY: process.env.SSL_KEY };
  try {
    delete process.env.PORT;
    delete process.env.SSL_CERT;
    delete process.env.SSL_KEY;
    assert.equal(villageEngineBaseUrl(), "http://127.0.0.1:7860", "the Engine's shipped port is the fallback");
    process.env.PORT = "1234";
    assert.equal(villageEngineBaseUrl(), "http://127.0.0.1:1234");
    process.env.PORT = "not a port";
    assert.equal(villageEngineBaseUrl(), "http://127.0.0.1:7860", "a PORT nobody can read is the shipped default");
    process.env.PORT = "1234";
    process.env.SSL_CERT = "/etc/cert.pem";
    process.env.SSL_KEY = "/etc/key.pem";
    assert.equal(villageEngineBaseUrl(), "https://127.0.0.1:1234", "both halves of a certificate mean HTTPS");
    delete process.env.SSL_KEY;
    assert.equal(villageEngineBaseUrl(), "http://127.0.0.1:1234", "half a certificate is not a secure server");
  } finally {
    for (const [name, value] of Object.entries(original)) {
      if (value === undefined) delete (process.env as Record<string, string | undefined>)[name];
      else process.env[name] = value;
    }
  }

  // ── The Engine, faked at the transport ────────────────────────────────────
  // Everything the package does to the Engine's own API goes through the global
  // fetch, so replacing it turns the whole loopback surface into a ledger. Every
  // assertion about what was asked for is read off that ledger.
  const engineCalls: Array<{
    path: string;
    method: string;
    body: any;
    search: string;
    form: Record<string, any> | null;
  }> = [];
  const json = (payload: unknown) =>
    new Response(JSON.stringify(payload), { status: 200, headers: { "content-type": "application/json" } });

  /** Flipped to make the gallery folder un-listable, which must cost nothing. */
  let folderLookupFails = true;
  const folderRows: unknown[] = [];
  let uploads = 0;
  let connectionRows: unknown[] = [
    { id: "connection-system", provider: "language_model" },
    { id: "connection-narration", provider: "language_model" },
    { id: "connection-brush", provider: "image_generation", isDefault: "true" },
  ];

  globalThis.fetch = (async (input: any, init: any = {}) => {
    const url = new URL(String(input));
    const method = String(init.method ?? "GET").toUpperCase();
    let body: unknown;
    if (typeof init.body === "string") {
      try {
        body = JSON.parse(init.body);
      } catch {
        body = init.body;
      }
    }
    let form: Record<string, any> | null = null;
    if (init.body instanceof FormData) {
      form = {};
      for (const [name, value] of init.body.entries()) {
        form[name] =
          typeof value === "string"
            ? value
            : { name: (value as File).name, type: (value as Blob).type, size: (value as Blob).size };
      }
    }
    engineCalls.push({ path: url.pathname, method, body, search: url.search, form });

    if (url.pathname === FOLDERS_PATH) {
      if (folderLookupFails) throw new Error("connect ECONNREFUSED 127.0.0.1:7860");
      if (method === "GET") return json(folderRows);
      return json({ id: "folder-villages", name: VILLAGES_GALLERY_FOLDER_NAME, createdAt: "2026-01-01T00:00:00.000Z" });
    }
    if (url.pathname === UPLOAD_PATH) {
      uploads += 1;
      return json({
        id: `gallery-${uploads}`,
        url: `/api/global-gallery/file/gallery-${uploads}.png`,
        prompt: form?.prompt ?? "",
        provider: form?.provider ?? "",
      });
    }
    if (url.pathname === AVATAR_PATH) return json({ image: TINY_PNG, prompt: body?.appearance });
    if (url.pathname === "/api/connections") return json(connectionRows);
    if (url.pathname === "/api/image-metadata/inspect") return json({ width: 1, height: 1 });
    throw new Error(`the test's Engine does not serve ${url.pathname}`);
  }) as any;

  const draws = () => engineCalls.filter((call) => call.path === AVATAR_PATH);
  const galleryCalls = (path: string) => engineCalls.filter((call) => call.path === path);

  // ── The host ──────────────────────────────────────────────────────────────
  const Fastify = (
    await import(pathToFileURL(join(engineRoot, "packages/server/node_modules/fastify/fastify.js")).href)
  ).default;

  const documentsByKey = new Map<string, any>();
  const keyOf = (packageId: string, id: string) => `${packageId}::${id}`;
  const documents = {
    async list(packageId: string, kind: string) {
      return [...documentsByKey.values()].filter((row) => row.packageId === packageId && row.kind === kind);
    },
    async getById(packageId: string, id: string) {
      return documentsByKey.get(keyOf(packageId, id)) ?? null;
    },
    async create(input: any) {
      const stored = keyOf(input.packageId, input.id);
      if (documentsByKey.has(stored)) throw new Error("UNIQUE constraint failed: capability_documents.id");
      const row = { ...input, revision: 1 };
      documentsByKey.set(stored, row);
      return row;
    },
    async update(input: any) {
      const stored = keyOf(input.packageId, input.id);
      const current = documentsByKey.get(stored);
      if (!current || current.revision !== input.expectedRevision) return null;
      const next = { ...current, ...input, revision: current.revision + 1 };
      documentsByKey.set(stored, next);
      return next;
    },
    async remove(packageId: string, id: string, expectedRevision: number) {
      const stored = keyOf(packageId, id);
      const current = documentsByKey.get(stored);
      if (!current || current.revision !== expectedRevision) return false;
      documentsByKey.delete(stored);
      return true;
    },
  };

  /** A card arrives as JSON text, not an object, and the double stays honest about that. */
  const library: any[] = [
    {
      id: "character-millie",
      comment: "Millie",
      data: JSON.stringify({ name: "Millie", description: "Tends the mill wheel." }),
    },
  ];

  /** Rewritten per assertion: what the Engine would report as this agent's own setup. */
  let agentConfig: any = null;
  const languageModels = {
    async resolveForRequest() {
      return {
        name: "Fixture connection",
        connectionId: "agent-talk",
        model: "fixture-model",
        maxContext: 8192,
        maxOutputTokens: 4096,
        fitContext(messages: any[], options: any) {
          return { messages, maxTokens: options?.maxTokens };
        },
        async chatComplete() {
          return { content: "Nothing worth proposing today.", finishReason: "stop" };
        },
      };
    },
  };

  const app = Fastify();
  const context = {
    api: {
      runtime: {
        logger: { debugOverride() {}, error() {}, info() {}, warn() {}, debug() {} },
        persistence: {
          documents,
          async listChats() {
            return [];
          },
        },
        resources: {
          async listCharacters(characterIds?: string[]) {
            if (!characterIds) return library.map((card) => ({ ...card }));
            return library.filter((card) => characterIds.includes(card.id)).map((card) => ({ ...card }));
          },
          async listPersonas() {
            // One Persona, because founding a village cannot be finished without
            // one: who the player is has a single answer now. This suite is about
            // pictures, so there is nothing else to read off the row.
            return [{ id: "persona-robin", data: { id: "persona-robin", name: "Robin", description: "" } }];
          },
        },
        languageModels,
        // `parseJsonish` only, like the live host.
        json: Object.freeze({ parseJsonish: (raw: string) => JSON.parse(raw) }),
        async getAgentConfig() {
          return agentConfig;
        },
        isDebugAgentsEnabled() {
          return false;
        },
      },
      async registerPrivilegedRoutes(routes: any, options: { prefix: string }) {
        await app.register(routes, { prefix: options.prefix });
        await app.ready();
        return () => {};
      },
      // Activation registers one prompt-context contributor, and the host hands
      // back the way to take it off again. What that block SAYS belongs to the
      // scene suite; here the double only has to carry the member, because an api
      // missing a call the package makes is a host that cannot start it at all.
      registerPromptContext() {
        return () => {};
      },
    },
  } as any;

  const get = (url: string) => app.inject({ method: "GET", url });
  const post = (url: string, payload?: any) => app.inject({ method: "POST", url, payload });
  const put = (url: string, payload?: any) => app.inject({ method: "PUT", url, payload });
  const patch = (url: string, payload?: any) => app.inject({ method: "PATCH", url, payload });
  const del = (url: string, payload?: any) => app.inject({ method: "DELETE", url, payload });

  const { activate } = await import(moduleUrl(`${services}/server-entry.ts`));
  await activate(context);

  // ── Founding a village costs nothing ──────────────────────────────────────
  // The whole point of the button. A village that draws art while it is being
  // set up would bill the player for a picture of a place they have not seen
  // yet, and the setup flow is exactly where that would be easiest to hide.
  const settingText = "A mill town at the foot of a ridge, where the river floods each spring.";
  await put("/api/villages/connections", {
    systemConnectionId: "connection-system",
    narrationConnectionId: "connection-narration",
  });
  const founded = await post("/api/villages/setup", {
    name: "Ashcroft",
    setting: settingText,
    foundingReason: "fresh-start",
    foundingDetails: "The group arrives at the riverside and opens the first shared path.",
    playerPersonaId: "persona-robin",
    venues: [
      {
        id: "player-home",
        layoutVersion: 1,
        layout: "both",
        privateSpaces: [
          {
            id: "private:player",
            venueClass: "residence",
            description: "A personal sleeping nook",
            name: "Your Private Space",
            purpose: "Personal space",
            ownerId: "player",
          },
        ],
        name: "Robin's Diner",
        form: "A converted diner",
        classes: ["residence"],
        description: "A modest home for the player.",
        spaces: [{ venueClass: "residence", description: "A warm room with tables and a small hearth." }],
        presentation: { x: 0.2, y: 0.3 },
        occupancy: { playerHome: true, residentCharacterId: null, homeKind: null },
      },
      {
        id: "millie-home",
        layoutVersion: 1,
        layout: "both",
        privateSpaces: [
          {
            id: "private:character-millie",
            venueClass: "residence",
            name: "Private Space",
            purpose: "Personal space",
            ownerId: "character-millie",
          },
        ],
        name: "Millie's Pod",
        form: "A sleeping pod",
        classes: ["residence"],
        description: "Millie's small home.",
        spaces: [{ venueClass: "residence", description: "A compact room with a woven mat." }],
        presentation: { x: 0.4, y: 0.5 },
        occupancy: { playerHome: false, residentCharacterId: "character-millie", homeKind: null },
      },
      {
        id: "village-square",
        layoutVersion: 1,
        layout: "common",
        name: "Village square",
        form: "An open square",
        classes: ["gathering"],
        description: "A public square where neighbours meet.",
        spaces: [{ venueClass: "gathering", description: "An open central yard with benches." }],
        category: "public-center",
        presentation: { x: 0.6, y: 0.7 },
        occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
      },
    ],
  });
  assert.equal(founded.statusCode, 200);
  let preparation = (await readVillageState()).foundingPreparation;
  for (let attempt = 0; attempt < 30 && !preparation?.venueDetailsSeeded; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 20));
    preparation = (await readVillageState()).foundingPreparation;
  }
  assert.equal(
    preparation?.venueDetailsSeeded,
    true,
    "failed detail seeding is recorded without holding up preparation",
  );
  assert.equal((await readVillageState()).venues[0]?.state.condition, "", "seed failure leaves details empty");
  assert.equal(
    founded.json().settings.venues.filter((venue: any) => venue.classes.includes("gathering")).length,
    1,
    "founding creates exactly one public venue",
  );
  assert.equal(draws().length, 0, "founding a village does not spend the player's money on a picture");
  assert.equal(galleryCalls(UPLOAD_PATH).length, 0, "and it puts nothing in their gallery either");
  const editedHome = await put("/api/villages/locations/venue/player-home", {
    description: "A snug home overlooking the square.",
  });
  assert.equal(editedHome.statusCode, 200, "Edit Room accepts a home without a custom name");
  assert.equal(
    editedHome.json().settings.venues.find((venue: any) => venue.id === "player-home").description,
    "A snug home overlooking the square.",
  );
  const movedOccupiedHome = await put("/api/villages/locations/venue/millie-home", {
    presentation: { x: 0.9, y: 0.9 },
  });
  assert.equal(movedOccupiedHome.statusCode, 400, "an occupied home cannot be moved on the map");

  // ── A place can be added without a picture ────────────────────────────────
  const added = await patch("/api/villages/settings", {
    venues: [
      ...founded.json().settings.venues,
      {
        id: "mill",
        name: "the mill pond",
        form: "where the grain is ground",
        description: "A stone mill beside shallow water.",
      },
      {
        id: "ridge",
        name: "the ridge path",
        form: "A path along the ridge",
        description: "A narrow path over the ridge.",
      },
    ],
  });
  assert.equal(added.statusCode, 409, "finished buildings must use Projects");
  await mutateVillageState((state) => {
    state.venues.push(
      ...placesOf([
        {
          id: "mill",
          name: "the mill pond",
          form: "where the grain is ground",
          description: "A stone mill beside shallow water.",
        },
        {
          id: "ridge",
          name: "the ridge path",
          form: "A path along the ridge",
          description: "A narrow path over the ridge.",
        },
      ]),
    );
  });
  const addedSnapshot = (await import(moduleUrl(`${services}/village.ts`))).buildVillageSnapshot;
  assert.deepEqual(
    (await addedSnapshot()).settings.venues
      .filter((venue: any) => ["mill", "ridge"].includes(venue.id))
      .map((venue: any) => venue.presentation.image),
    [null, null],
    "a place starts with no picture, which is what makes drawing one a decision",
  );
  assert.equal(draws().length, 0, "and saving places draws nothing");

  // ── A picture the player already has ──────────────────────────────────────
  // The first upload is the interesting one: the gallery folder cannot be
  // listed. A folder is an ornament, so the picture has to land anyway — at the
  // root of the gallery, which draws exactly as well.
  const kept = await put("/api/villages/locations/venue/image", { venueId: "mill", image: TINY_PNG });
  assert.equal(kept.statusCode, 200, kept.body);
  assert.deepEqual(
    kept
      .json()
      .settings.venues.filter((venue: any) => ["mill", "ridge"].includes(venue.id))
      .map((venue: any) => venue.presentation.image),
    [{ ref: "global-gallery:gallery-1", url: "/api/global-gallery/file/gallery-1.png", id: "gallery-1" }, null],
    "the picture is kept as a reference and no other place is touched",
  );
  assert.equal(draws().length, 0, "choosing a picture the player already has never asks the Engine to draw");

  const firstUpload = galleryCalls(UPLOAD_PATH)[0]!;
  assert.equal(firstUpload.method, "POST");
  assert.equal(firstUpload.search, "", "a folder that cannot be found costs tidiness and nothing else");
  assert.equal(firstUpload.form?.provider, "villages", "the gallery entry says who put the picture there");
  assert.equal(firstUpload.form?.file?.name, "the-mill-pond.png", "the file carries the extension its type needs");
  assert.equal(firstUpload.form?.file?.type, "image/png");
  assert.equal(firstUpload.form?.width, undefined, "a picture nobody drew has no claimed size");

  // The next one finds the folder missing and makes it, and every upload after
  // that reuses it — which is what stops twenty places making twenty folders.
  folderLookupFails = false;
  const second = await put("/api/villages/locations/venue/image", { venueId: "ridge", image: TINY_PNG });
  assert.equal(second.statusCode, 200, second.body);
  assert.equal(
    second.json().settings.venues.find((venue: any) => venue.id === "ridge").presentation.image.ref,
    "global-gallery:gallery-2",
  );
  assert.deepEqual(
    galleryCalls(FOLDERS_PATH)
      .slice(0, 3)
      .map((call) => call.method),
    ["GET", "GET", "POST"],
    "the folder is looked for, looked for again once the lookup heals, and then made",
  );
  assert.equal(galleryCalls(FOLDERS_PATH)[2]!.body?.name, "Villages");
  assert.equal(galleryCalls(UPLOAD_PATH)[1]!.search, "?folderId=folder-villages", "and then everything is filed in it");

  // ── Drawing one ───────────────────────────────────────────────────────────
  // Which connection is used is a three-step chain the connections regression
  // proves for talk. Pictures read a DIFFERENT agent field, and that is the bug
  // worth catching here: an agent that talks with a hosted model and draws with
  // a local endpoint is the ordinary arrangement.
  const asksFor = async (payload: Record<string, unknown> = {}) => {
    const before = engineCalls.length;
    const answered = await post("/api/villages/locations/venue/image", { venueId: "mill", ...payload });
    return { answered, call: engineCalls.slice(before).find((entry) => entry.path === AVATAR_PATH)! };
  };

  agentConfig = { connectionId: "agent-talk", settings: { imageConnectionId: "connection-agent-brush" } };
  await put("/api/villages/connections", { imageConnectionId: "connection-village-brush" });
  const villageChoice = await asksFor();
  assert.equal(villageChoice.answered.statusCode, 200, villageChoice.answered.body);
  assert.equal(
    villageChoice.call.body.connectionId,
    "connection-village-brush",
    "the village's own image picker wins over the agent's",
  );

  await put("/api/villages/connections", { imageConnectionId: "" });
  const onTheAgent = await asksFor();
  assert.equal(
    onTheAgent.call.body.connectionId,
    "connection-agent-brush",
    "with the picker cleared, pictures fall back to the agent's IMAGE connection rather than the one it talks with",
  );

  agentConfig = { connectionId: "agent-talk" };
  connectionRows = [{ id: "connection-listed", provider: "image_generation", isDefault: "true" }];
  const onTheEngine = await asksFor();
  assert.equal(
    onTheEngine.call.body.connectionId,
    "connection-listed",
    "with the agent unconfigured too, the Engine's own list decides — and it is asked",
  );
  assert.ok(
    engineCalls.some((call) => call.path === "/api/connections" && call.method === "GET"),
    "the Engine's connection list is read over its own API rather than reached into",
  );

  agentConfig = null;
  connectionRows = [];
  assert.equal(
    (await post("/api/villages/locations/venue/image", { venueId: "mill" })).statusCode,
    400,
    "with nothing able to draw, the player is told so instead of being handed a failure with no reason",
  );
  assert.match(
    (await post("/api/villages/locations/venue/image", { venueId: "mill" })).json().error,
    /image connection/i,
    "and the message says which kind of connection is missing",
  );

  connectionRows = [{ id: "connection-listed", provider: "image_generation", isDefault: "true" }];
  const named = await asksFor({ connectionId: "connection-named" });
  assert.equal(
    named.call.body.connectionId,
    "connection-named",
    "an explicit choice is passed through untouched — whether it draws images is the Engine's question",
  );

  // The request itself, which is the whole feature. The Engine draws a wide
  // empty scene through a route named for faces, and it only does that because
  // the override REPLACES the portrait prompt it would otherwise compile.
  const request = named.call.body;
  assert.equal(named.call.method, "POST");
  assert.equal(request.purpose, "avatar");
  assert.equal(request.name, "the mill pond");
  assert.equal(request.width, 1216);
  assert.equal(request.height, 832);
  assert.deepEqual(
    { width: request.width, height: request.height },
    { width: 1216, height: 832 },
    "a wide landscape, because the picture is a room the conversation is held in",
  );
  assert.equal(request.promptOverrides.length, 1, "exactly one override, so the Engine has exactly one key to match");
  assert.equal(
    request.promptOverrides[0].id,
    avatarPromptId("the mill pond", "avatar"),
    "the override id is built by the one function that knows the Engine's arithmetic",
  );
  assert.equal(
    request.promptOverrides[0].prompt,
    request.appearance,
    "the override carries the scene the body also carries, so what is drawn is what was asked for",
  );
  assert.ok(
    request.appearance.startsWith(
      "A wide, empty exterior view of the mill pond and its approach in Ashcroft. Show the building from outside; do not show an interior.",
    ),
    "the picture is of the place, with its own note",
  );
  assert.ok(request.appearance.includes("Venue form: where the grain is ground."));
  assert.ok(request.appearance.includes(settingText), "and it knows which village it stands in");
  assert.match(request.appearance, /It is .+, and the weather is .+\./, "and what the weather is doing right now");
  assert.match(request.appearance, /no people/i, "and that nobody is to be painted into it");
  assert.match(request.promptOverrides[0].negativePrompt, /people/);
  assert.match(request.promptOverrides[0].negativePrompt, /lettering/);

  // What came back went to the gallery, was described with the size it was
  // drawn at, and reached the village as a reference — the same road as a
  // picture the player chose, which is the point of routing both through it.
  const drawnUpload = galleryCalls(UPLOAD_PATH).at(-1)!;
  assert.equal(drawnUpload.form?.width, "1216");
  assert.equal(drawnUpload.form?.height, "832");
  assert.ok(String(drawnUpload.form?.prompt).includes("the mill pond"), "the gallery entry keeps what was asked for");
  assert.deepEqual(galleryCalls(FOLDERS_PATH).length, 3, "the folder is not looked for again once it is known");

  const stored = kept.json().settings.venues.find((venue: any) => venue.id === "mill").presentation.image;
  const drawn = await get("/api/villages");
  assert.equal(drawn.statusCode, 200);
  const drawnImage = drawn.json().settings.venues.find((venue: any) => venue.id === "mill").presentation.image;
  assert.deepEqual(
    Object.keys(drawnImage).sort(),
    ["id", "ref", "url"],
    "and a village holds three short strings per place, however many times a picture is redrawn",
  );
  assert.equal(JSON.stringify(drawn.json()).includes("base64"), false, "the picture's bytes never reach the snapshot");
  assert.ok(JSON.stringify(drawnImage).length < 400, "and a place's picture costs a village about a caption");
  assert.notDeepEqual(drawnImage, stored, "redrawing replaces the reference rather than accumulating one");

  // ── Taking one away ───────────────────────────────────────────────────────
  const beforeRemoval = galleryCalls(UPLOAD_PATH).length;
  const removed = await del("/api/villages/locations/venue/image", { venueId: "mill" });
  assert.equal(removed.statusCode, 200);
  assert.equal(
    removed.json().settings.venues.find((venue: any) => venue.id === "mill").presentation.image,
    null,
    "the place goes back to having no picture",
  );
  assert.ok(
    removed.json().settings.venues.find((venue: any) => venue.id === "ridge").presentation.image,
    "and the other place keeps its own",
  );
  assert.equal(
    galleryCalls(UPLOAD_PATH).length,
    beforeRemoval,
    "the gallery entry is left where it is: the gallery is the player's",
  );

  // ── A place that is gone ──────────────────────────────────────────────────
  // A picture arrives twenty seconds after it was asked for, so the panel can
  // have deleted the place in between. Doing nothing quietly would leave the
  // player holding an image they never asked to keep, with no hint where it came
  // from, so a missing place is refused.
  assert.equal(
    (await put("/api/villages/locations/venue/image", { venueId: "gone", image: TINY_PNG })).statusCode,
    404,
    "a picture for a place that is gone is refused rather than dropped",
  );
  assert.equal((await post("/api/villages/locations/venue/image", { venueId: "gone" })).statusCode, 404);
  assert.equal((await del("/api/villages/locations/venue/image", { venueId: "gone" })).statusCode, 404);
  assert.equal((await post("/api/villages/locations/venue/image", {})).statusCode, 400, "and a place has to be named");
  assert.equal(
    (await put("/api/villages/locations/venue/image", { venueId: "mill", image: "nonsense" })).statusCode,
    400,
    "and what arrives has to be a picture",
  );

  // ── Only player actions and first private entry draw ──────────────────────
  // Count the files that can reach generation so founding, remapping, and the
  // simulation clock cannot create additional charges.
  const packageRoot = join(repoRoot, "packages/villages/src");
  const sources = await collectSources(packageRoot);
  const canDraw = sources
    .filter(
      (file) =>
        file.source.includes("AVATAR_GENERATION_PATH") ||
        file.source.includes(AVATAR_PATH) ||
        file.source.includes("generateVillageLocationImage"),
    )
    .map((file) => relative(packageRoot, file.path).split(sep).join("/"))
    .sort();
  assert.deepEqual(
    canDraw,
    [
      "engine/packages/server/src/routes/villages.routes.ts",
      "engine/packages/server/src/services/villages/image-generation.ts",
      "engine/packages/server/src/services/villages/location-image.ts",
      "engine/packages/server/src/services/villages/sprite-studio-generation.ts",
    ],
    "only explicit scenery draws and Studio raw generation reach image providers",
  );
  for (const silent of [
    "village.ts",
    "village-store.ts",
    "village-bootstrap.ts",
    "village-clock.ts",
    "village-refresh-scheduler.ts",
    "native-remap.ts",
    "native-schedules.ts",
    "chat.ts",
    "wishes.ts",
    "catalog.ts",
  ]) {
    const source = await readFile(join(repoRoot, services, silent), "utf8");
    assert.equal(
      source.includes(AVATAR_PATH),
      false,
      `${silent} must not be able to draw outside the single private-entry exception`,
    );
  }

  // Manual image controls still draw only on a press. The separate private-entry
  // path has a durable one-attempt marker and is not a UI redraw effect.
  //
  // The shared venue image control serves exterior, Class, and private spaces.
  const client = await readFile(
    join(repoRoot, "packages/villages/src/engine/packages/client/src/villages-package-entry.tsx"),
    "utf8",
  );
  const presses: Record<string, number> = { drawPlaceImage: 2, keepPlaceImage: 2, dropPlaceImage: 2 };
  for (const [handler, count] of Object.entries(presses)) {
    assert.equal(
      client.split(handler).length - 1,
      count,
      `${handler} must be defined once and reached only from the control the player presses`,
    );
  }
  assert.equal(
    client.split('"/locations/venue/image"').length - 1,
    3,
    "the tab reaches the three picture routes and nothing else",
  );
  assert.match(
    client,
    /onClick=\{\(\) => void drawPlaceImage\(place\.id, spaceClass, ownerId, zoneId\)\}/,
    "and wired to a click on the screen that stands in a place",
  );
  const imageService = await readFile(join(repoRoot, services, "location-image.ts"), "utf8");
  const venueSession = await readFile(join(repoRoot, services, "venue-session.ts"), "utf8");
  assert.match(imageService, /initialImageAttemptedAt/u, "first private drawing has a durable attempt marker");
  assert.match(venueSession, /generateFirstPrivateSpaceImage/u, "private entry starts the one automatic draw");

  const foundingVenue = {
    id: "founding-home",
    name: "Cliff House",
    form: "A stone cottage",
    description: "Blue slate roof above the harbor.",
    spaceDescription: "A copper stove beside a low table.",
    venueClass: "residence",
    residentCharacterId: "",
  };
  const foundingImageInput = {
    villageName: "Ashcroft",
    setting: "A cliffside village above the sea.",
    foundingDetails: "On Day 1, a storm damages several boats.",
    selectedLorebookIds: [],
  };
  const beforeInvalidImage = draws().length;
  assert.equal(
    (
      await post("/api/villages/setup/venue-image/generate", {
        ...foundingImageInput,
        area: "exterior",
        venue: { ...foundingVenue, description: "" },
      })
    ).statusCode,
    400,
  );
  assert.equal(draws().length, beforeInvalidImage, "a blank exterior description cannot spend image tokens");
  assert.equal(
    (
      await post("/api/villages/setup/venue-image/generate", {
        ...foundingImageInput,
        area: "interior",
        venue: { ...foundingVenue, spaceDescription: "" },
      })
    ).statusCode,
    400,
  );
  assert.equal(draws().length, beforeInvalidImage, "a blank interior description cannot spend image tokens");
  assert.equal(
    (
      await post("/api/villages/setup/venue-image/generate", {
        ...foundingImageInput,
        area: "exterior",
        venue: foundingVenue,
      })
    ).statusCode,
    200,
  );
  assert.match(draws().at(-1)?.body?.appearance ?? "", /Blue slate roof above the harbor/u);
  assert.doesNotMatch(draws().at(-1)?.body?.appearance ?? "", /copper stove/u);
  assert.equal(
    (
      await post("/api/villages/setup/venue-image/generate", {
        ...foundingImageInput,
        area: "interior",
        venue: foundingVenue,
      })
    ).statusCode,
    200,
  );
  assert.match(draws().at(-1)?.body?.appearance ?? "", /copper stove/u);
  assert.doesNotMatch(draws().at(-1)?.body?.appearance ?? "", /Blue slate roof/u);

  // One saved style applies to maps, founding areas and later venue areas.
  await mutateVillageState((state) => {
    state.sceneryArtStyle = "Pixel art with a restrained sea-green palette";
  });
  const styledVenue = await asksFor();
  assert.equal(styledVenue.answered.statusCode, 200, styledVenue.answered.body);
  assert.match(styledVenue.call.body.appearance, /Pixel art with a restrained sea-green palette/);
  assert.doesNotMatch(styledVenue.call.body.appearance, /Painted background art/);
  assert.ok(styledVenue.call.body.appearance.length <= 4000);
  for (const area of ["exterior", "interior"]) {
    const styledFounding = await post("/api/villages/setup/venue-image/generate", {
      ...foundingImageInput,
      sceneryArtStyle: "Pixel art with a restrained sea-green palette",
      area,
      venue: foundingVenue,
    });
    assert.equal(styledFounding.statusCode, 200, styledFounding.body);
    assert.match(draws().at(-1).body.appearance, /Pixel art with a restrained sea-green palette/);
    assert.doesNotMatch(draws().at(-1).body.appearance, /Painted background art|watercolor illustration/i);
  }
  const styledMap = await post("/api/villages/setup/town-map/generate", {
    setting: "Misty cliffs",
    sceneryArtStyle: "Pixel art with a restrained sea-green palette",
    useVisualLore: false,
  });
  assert.equal(styledMap.statusCode, 200, styledMap.body);
  assert.match(draws().at(-1).body.appearance, /Pixel art with a restrained sea-green palette/);
  assert.ok(draws().at(-1).body.appearance.length <= 4000);

  // The package must not have grown a private Engine import to do any of this.
  // The image connection, the gallery and the drawing are all the Engine's own
  // API; reaching past it would be a second copy of each.
  const boundary = JSON.parse(await readFile(join(repoRoot, "packages/villages/engine-boundary.json"), "utf8"));
  assert.deepEqual(boundary.privateEngineImports, [], "the pictures add no private Engine import");
  for (const bound of sources.filter((file) => file.path.endsWith("engine-loopback.ts"))) {
    assert.ok(bound.source.includes("127.0.0.1"), "and the Engine is reached over its own loopback address");
  }

  process.stdout.write(
    "Villages location image regression: prompts, gallery, manual draw, one private-entry exception ok\n",
  );
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
