import { asRecord, asTrimmedString } from "./coerce.js";

export const MAX_CONNECTION_ID_LENGTH = 128;

export type VillageConnectionPurpose = "system" | "narration" | "image";

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
