// Villages — which connection does the work, and which one draws.
//
// These are NOT village settings, and that is why they are not in the village
// record. Both "Run setup again" and "Reset the village and start over" rewrite
// that record, so a player who started their village over would lose their
// model choices with it — the one setting nobody wants to enter twice. So they
// live in a document of their own and outlive every reset.
//
// Three purposes rather than one, because the village spends model calls on
// three kinds of work that are not worth the same money:
//
//   * SYSTEM does the heavy lifting — founding the village, reading the day
//     back out of the request, translating a week of schedules, judging a
//     claim. Each of those is one long call about the whole village.
//   * NARRATION carries the villager conversations, which are short, frequent,
//     and the ones a player is most likely to want on a cheaper model.
//   * IMAGE draws a place, and only ever when the player presses the button.
//
// An empty choice is not an error. It means "use whatever this agent already
// uses", which is what makes the whole panel optional: a player who never opens
// it gets exactly the behaviour they had before it existed.
//
// Nothing in here reads an Engine table, and that is deliberate rather than
// incidental. Which connections exist is a question the ENGINE answers at
// `/api/connections`, and the panel asks it there; a package that reached into
// the connection store itself would be a second, silently diverging copy of the
// Engine's own list.
import { asRecord, asTrimmedString } from "./coerce.js";
import { villageEngineJson } from "./engine-loopback.js";
import { badRequest } from "./errors.js";
import {
  VILLAGES_PACKAGE_ID,
  villagesAgentConnectionId,
  villagesAgentImageConnectionId,
  villagesDocuments,
} from "./package-runtime.js";
import { mutateDocument, type DocumentSlot } from "./village-store.js";

const CONNECTIONS_DOC_ID = "villages-connections";
const CONNECTIONS_DOC_KIND = "settings";
const CONNECTIONS_DOC_NAME = "Connection settings";
/** Long enough for any Engine id, short enough that a pasted blob is refused. */
const MAX_CONNECTION_ID_LENGTH = 128;

export type VillageConnectionPurpose = "system" | "narration" | "image";

/** Persisted image choice used by the founding wizard's explicit off mode. */
export const VILLAGES_IMAGE_CONNECTION_DISABLED = "__villages_image_disabled__";

export type VillageImageConnectionChoice =
  { enabled: false; connectionId: null } | { enabled: true; connectionId: string | null };

export type VillageConnectionSettings = {
  systemConnectionId: string;
  narrationConnectionId: string;
  imageConnectionId: string;
};

export function defaultVillageConnectionSettings(): VillageConnectionSettings {
  return {
    systemConnectionId: "",
    narrationConnectionId: "",
    imageConnectionId: VILLAGES_IMAGE_CONNECTION_DISABLED,
  };
}

function coerceConnectionId(value: unknown): string {
  const id = asTrimmedString(value);
  return id.length > MAX_CONNECTION_ID_LENGTH ? "" : id;
}

export function coerceVillageConnectionSettings(value: unknown): VillageConnectionSettings {
  const raw = asRecord(value);
  return {
    systemConnectionId: coerceConnectionId(raw.systemConnectionId),
    narrationConnectionId: coerceConnectionId(raw.narrationConnectionId),
    imageConnectionId:
      raw.imageConnectionId === undefined
        ? VILLAGES_IMAGE_CONNECTION_DISABLED
        : coerceConnectionId(raw.imageConnectionId),
  };
}

const connectionsSlot: DocumentSlot<VillageConnectionSettings> = {
  kind: CONNECTIONS_DOC_KIND,
  name: CONNECTIONS_DOC_NAME,
  description: "The connections the player chose for this agent's village.",
  coerce: coerceVillageConnectionSettings,
  label: () => CONNECTIONS_DOC_NAME,
};

// ── The stored choice ────────────────────────────────────────────────────────

export async function readVillageConnectionSettings(): Promise<VillageConnectionSettings> {
  const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, CONNECTIONS_DOC_ID);
  return coerceVillageConnectionSettings(record?.data);
}

/**
 * The key one purpose reads, with an unreadable document read as "nothing
 * chosen yet".
 *
 * The catch is the whole reason this is separate from the reader above. The
 * panel wants to be TOLD when the document store is unreachable, because a
 * settings box that silently shows nothing is a lie. A villager's reply wants
 * the opposite: the agent default below is already a complete answer, so a
 * store that hiccuped must cost the player a model choice and not a
 * conversation.
 */
async function chosenConnectionId(purpose: VillageConnectionPurpose): Promise<string> {
  try {
    const settings = await readVillageConnectionSettings();
    if (purpose === "system") return settings.systemConnectionId;
    if (purpose === "narration") return settings.narrationConnectionId;
    return settings.imageConnectionId;
  } catch {
    return "";
  }
}

/** Write the keys that were given and leave the rest alone. */
export async function saveVillageConnectionSettings(
  patch: Partial<VillageConnectionSettings>,
): Promise<VillageConnectionSettings> {
  let next = defaultVillageConnectionSettings();
  await mutateDocument(CONNECTIONS_DOC_ID, connectionsSlot, (state) => {
    if (patch.systemConnectionId !== undefined) state.systemConnectionId = patch.systemConnectionId;
    if (patch.narrationConnectionId !== undefined) state.narrationConnectionId = patch.narrationConnectionId;
    if (patch.imageConnectionId !== undefined) state.imageConnectionId = patch.imageConnectionId;
    next = state;
  });
  return next;
}

/**
 * Check the choices that are safe to persist at any time before setup spends
 * them. The Engine owns the connection list, so setup reads that list once and
 * refuses vanished or mismatched choices before it writes a village record.
 */
export async function validateVillageSetupConnections(settings: VillageConnectionSettings): Promise<void> {
  const systemId = settings.systemConnectionId.trim();
  const narrationId = settings.narrationConnectionId.trim();
  if (systemId.length === 0 || narrationId.length === 0) {
    throw badRequest("Choose both System and Narration connections before founding the village.");
  }
  const listed = await villageEngineJson<unknown>("/api/connections");
  const rows = Array.isArray(listed) ? listed.map(asRecord) : [];
  const byId = new Map(rows.map((row) => [asTrimmedString(row.id), asTrimmedString(row.provider)]));
  const isLanguageConnection = (id: string) => {
    const provider = byId.get(id);
    return (
      provider !== undefined &&
      !["image_generation", "video_generation", "decision", "audio_generation"].includes(provider)
    );
  };
  if (!isLanguageConnection(systemId)) throw badRequest("Choose a valid language connection for System.");
  if (!isLanguageConnection(narrationId)) throw badRequest("Choose a valid language connection for Narration.");

  const imageId = settings.imageConnectionId.trim();
  if (imageId.length === 0 || imageId === VILLAGES_IMAGE_CONNECTION_DISABLED) return;
  if (byId.get(imageId) !== "image_generation") {
    throw badRequest("Choose a valid image-generation connection, use the Engine default, or disable images.");
  }
}

// ── Choosing a connection for a call ─────────────────────────────────────────

/**
 * The connection one kind of work should be sent to.
 *
 * Three steps, and every one of them may be empty:
 *
 *   1. what the player picked for this village;
 *   2. what the agent itself was set up with — `connectionId` for talk,
 *      `settings.imageConnectionId` for pictures, which is a separate field
 *      because an agent talks with one connection and draws with another;
 *   3. nothing at all, which leaves the Engine to use its own default.
 *
 * Returning null for the last step matters: the Engine's model host reads a
 * missing connection as "use the default one", so a package that invented an id
 * here would break an agent that has never been configured.
 */
export async function villagesConnectionIdFor(purpose: VillageConnectionPurpose): Promise<string | null> {
  const chosen = await chosenConnectionId(purpose);
  if (purpose === "image" && chosen === VILLAGES_IMAGE_CONNECTION_DISABLED) return null;
  if (chosen.length > 0) return chosen;
  const agentDefault = purpose === "image" ? await villagesAgentImageConnectionId() : await villagesAgentConnectionId();
  return agentDefault ?? null;
}

/** Resolve the image mode without allowing disabled to become an Engine default. */
export async function villagesImageConnectionChoice(): Promise<VillageImageConnectionChoice> {
  const chosen = await chosenConnectionId("image");
  if (chosen === VILLAGES_IMAGE_CONNECTION_DISABLED) return { enabled: false, connectionId: null };
  if (chosen.length > 0) return { enabled: true, connectionId: chosen };
  const agentDefault = await villagesAgentImageConnectionId();
  return { enabled: true, connectionId: agentDefault ?? null };
}

// ── Reading and writing it from the panel ────────────────────────────────────

/** The three keys a panel may patch, in one list so a typo cannot invent a fourth. */
const SETTING_KEYS = ["systemConnectionId", "narrationConnectionId", "imageConnectionId"] as const;

/**
 * Apply a patch from the panel, leaving out whatever it did not send.
 *
 * Only the shape is checked here. Whether an id names a connection that still
 * exists is the Engine's question and the Engine's answer: it is asked at the
 * moment the connection is used, and the panel already draws a stored id it
 * cannot find as "Missing" instead of quietly showing the default. An empty
 * string is always accepted for language connections — that is the "Engine
 * default" option. Images additionally accept the package-owned disabled value.
 */
export async function saveVillageConnections(body: unknown): Promise<VillageConnectionSettings> {
  const patch = asRecord(body);
  const accepted: Partial<VillageConnectionSettings> = {};
  for (const key of SETTING_KEYS) {
    if (patch[key] === undefined) continue;
    const id = asTrimmedString(patch[key]);
    if (id.length > MAX_CONNECTION_ID_LENGTH) throw badRequest("That is not a connection id.");
    if (key === "imageConnectionId" && id === VILLAGES_IMAGE_CONNECTION_DISABLED) {
      accepted[key] = id;
      continue;
    }
    accepted[key] = id;
  }
  return saveVillageConnectionSettings(accepted);
}
