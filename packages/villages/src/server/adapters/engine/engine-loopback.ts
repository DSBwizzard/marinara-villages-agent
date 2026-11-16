import { trackUsage } from "../models/usage-ledger.js";
import { villageEngineJson as unmeteredEngineJson } from "./engine-transport.js";

export { villageEngineBaseUrl, villageEngineForm, deleteVillageSpriteFile } from "./engine-transport.js";
export async function villageEngineJson<T>(
  path: string,
  init: {
    method?: string;
    body?: unknown;
    signal?: AbortSignal;
    providerDispatch?: (start: () => Promise<T>) => Promise<T>;
  } = {},
): Promise<T> {
  if (init.body !== undefined && ["/api/characters/avatar-generation"].includes(path)) {
    const body = init.body as Record<string, unknown>;
    let submitted = false;
    const { value } = await trackUsage(
      {
        connectionId: typeof body.connectionId === "string" ? body.connectionId : undefined,
        purpose: "images",
        stage: path,
        refusedBeforeDispatch: () => !!init.providerDispatch && !submitted,
      },
      async () => {
        let imageFallback = false;
        const start = () => {
          submitted = true;
          return unmeteredEngineJson<T>(path, init, (headers) => {
            imageFallback = headers.has("X-Marinara-Fallback-Used");
          });
        };
        const value = await (init.providerDispatch ? init.providerDispatch(start) : start());
        return { value, imageFallback };
      },
    );
    return value;
  }
  return unmeteredEngineJson<T>(path, init);
}
