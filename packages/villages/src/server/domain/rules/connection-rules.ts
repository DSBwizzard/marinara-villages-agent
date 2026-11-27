import type { VillageConnectionSettings, VillageEmbeddingChoice } from "../../../shared/contracts/village.js";
export type { VillageConnectionSettings } from "../../../shared/contracts/village.js";
import { asRecord, asTrimmedString } from "./coerce.js";

export const MAX_CONNECTION_ID_LENGTH = 128;

export type VillageConnectionPurpose = "system" | "narration" | "image";

export const VILLAGES_IMAGE_CONNECTION_DISABLED = "__villages_image_disabled__";

export type VillageImageConnectionChoice =
  { enabled: false; connectionId: null } | { enabled: true; connectionId: string | null };

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

export function embeddingChoice(value: unknown): VillageEmbeddingChoice | undefined {
  if (value === "local" || value === "off") return value;
  if (typeof value !== "string" || !value.startsWith("connection:")) return;
  const id = value.slice("connection:".length);
  if (id && id.length <= MAX_CONNECTION_ID_LENGTH && id === id.trim()) return value as VillageEmbeddingChoice;
}

export function coerceVillageConnectionSettings(value: unknown): VillageConnectionSettings {
  const raw = asRecord(value);
  const embedding = embeddingChoice(raw.embedding);
  return {
    systemConnectionId: coerceConnectionId(raw.systemConnectionId),
    narrationConnectionId: coerceConnectionId(raw.narrationConnectionId),
    imageConnectionId:
      raw.imageConnectionId === undefined
        ? VILLAGES_IMAGE_CONNECTION_DISABLED
        : coerceConnectionId(raw.imageConnectionId),
    ...(embedding ? { embedding } : {}),
  };
}
