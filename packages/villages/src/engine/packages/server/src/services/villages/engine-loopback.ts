import { villageEngineJson as unmeteredEngineJson } from "./engine-transport.js";
import { trackUsage } from "./usage-ledger.js";

export { villageEngineBaseUrl, villageEngineForm, deleteVillageSpriteFile } from "./engine-transport.js";
export async function villageEngineJson<T>(
  path: string,
  init: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  if (init.body !== undefined && ["/api/characters/avatar-generation"].includes(path)) {
    const body = init.body as Record<string, unknown>;
    return trackUsage(
      {
        connectionId: typeof body.connectionId === "string" ? body.connectionId : undefined,
        purpose: "images",
        stage: path,
      },
      () => unmeteredEngineJson<T>(path, init),
    );
  }
  return unmeteredEngineJson<T>(path, init);
}
