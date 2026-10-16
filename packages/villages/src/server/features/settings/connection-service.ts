import type { villageEngineJson } from "../../adapters/engine/engine-transport.js";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { villagesAgentConnectionId, villagesAgentImageConnectionId } from "../../adapters/engine/agent-config.js";
import type { DocumentSlot, mutateDocument } from "../../adapters/storage/document-store.js";
import { asRecord, asTrimmedString } from "../../domain/rules/coerce.js";
import { badRequest } from "../../domain/rules/errors.js";
import {
  MAX_CONNECTION_ID_LENGTH,
  VILLAGES_IMAGE_CONNECTION_DISABLED,
  defaultVillageConnectionSettings,
  coerceVillageConnectionSettings,
  type VillageConnectionSettings,
  type VillageConnectionPurpose,
  type VillageImageConnectionChoice,
} from "../../domain/rules/connection-rules.js";

export type ConnectionSettingsPorts = {
  VILLAGES_PACKAGE_ID: string;
  villagesDocuments(): Pick<CapabilityDocumentStore, "getById">;
  mutateDocument: typeof mutateDocument;
  villageEngineJson: typeof villageEngineJson;
  villagesAgentConnectionId: typeof villagesAgentConnectionId;
  villagesAgentImageConnectionId: typeof villagesAgentImageConnectionId;
};

/** Settings storage and connection selection are supplied by one application. */
export function createConnectionSettings(ports: ConnectionSettingsPorts) {
  const {
    VILLAGES_PACKAGE_ID,
    villagesDocuments,
    mutateDocument,
    villageEngineJson,
    villagesAgentConnectionId,
    villagesAgentImageConnectionId,
  } = ports;
  const CONNECTIONS_DOC_ID = "villages-connections";

  const CONNECTIONS_DOC_KIND = "settings";

  const CONNECTIONS_DOC_NAME = "Connection settings";

  const connectionsSlot: DocumentSlot<VillageConnectionSettings> = {
    kind: CONNECTIONS_DOC_KIND,
    name: CONNECTIONS_DOC_NAME,
    description: "The connections the player chose for this agent's village.",
    coerce: coerceVillageConnectionSettings,
    label: () => CONNECTIONS_DOC_NAME,
  };

  async function readVillageConnectionSettings(): Promise<VillageConnectionSettings> {
    const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, CONNECTIONS_DOC_ID);
    return coerceVillageConnectionSettings(record?.data);
  }

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

  async function saveVillageConnectionSettings(
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

  async function validateVillageSetupConnections(settings: VillageConnectionSettings): Promise<void> {
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

  async function villagesConnectionIdFor(purpose: VillageConnectionPurpose): Promise<string | null> {
    const chosen = await chosenConnectionId(purpose);
    if (purpose === "image" && chosen === VILLAGES_IMAGE_CONNECTION_DISABLED) return null;
    if (chosen.length > 0) return chosen;
    const agentDefault =
      purpose === "image" ? await villagesAgentImageConnectionId() : await villagesAgentConnectionId();
    return agentDefault ?? null;
  }

  async function villagesImageConnectionChoice(): Promise<VillageImageConnectionChoice> {
    const chosen = await chosenConnectionId("image");
    if (chosen === VILLAGES_IMAGE_CONNECTION_DISABLED) return { enabled: false, connectionId: null };
    if (chosen.length > 0) return { enabled: true, connectionId: chosen };
    const agentDefault = await villagesAgentImageConnectionId();
    return { enabled: true, connectionId: agentDefault ?? null };
  }

  const SETTING_KEYS = ["systemConnectionId", "narrationConnectionId", "imageConnectionId"] as const;

  async function saveVillageConnections(body: unknown): Promise<VillageConnectionSettings> {
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
  return {
    readVillageConnectionSettings,
    saveVillageConnectionSettings,
    validateVillageSetupConnections,
    villagesConnectionIdFor,
    villagesImageConnectionChoice,
    saveVillageConnections,
  };
}
export type ConnectionSettings = ReturnType<typeof createConnectionSettings>;
