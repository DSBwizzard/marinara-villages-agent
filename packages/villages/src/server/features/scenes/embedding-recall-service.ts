import type { CapabilityRuntimeHost } from "@marinara-engine/shared";
import type { VillageEmbeddingChoice, VillageEmbeddingStatus } from "../../../shared/contracts/village.js";
import type { RecallRanking } from "../../domain/rules/text-recall.js";

const MAX_CACHE = 512;
const MAX_BATCH = 8;
const LOCAL_QUERY_MS = 125;
const CONNECTION_QUERY_MS = 450;
const CONNECTION_RETRY_MS = 60_000;
const MAX_TEXT = 1400;

type EmbeddingHost = NonNullable<Awaited<ReturnType<NonNullable<CapabilityRuntimeHost["embeddingsFor"]>>>>;

function unitVector(vector: number[] | undefined, dimension: number) {
  if (!vector || !dimension || dimension > 4096 || vector.length !== dimension || !vector.every(Number.isFinite))
    return;
  const norm = Math.hypot(...vector);
  if (!norm || !Number.isFinite(norm)) return;
  return Float32Array.from(vector, (value) => value / norm);
}

function within<T>(work: Promise<T>, signal: AbortSignal): Promise<T | undefined> {
  if (signal.aborted) return Promise.resolve(undefined);
  return new Promise((resolve) => {
    const cancel = () => resolve(undefined);
    signal.addEventListener("abort", cancel, { once: true });
    void work.then(resolve, cancel).finally(() => signal.removeEventListener("abort", cancel));
  });
}

/** A bounded, disposable index over projected text. Native memories do not depend on it. */
export function createEmbeddingRecall(
  resolveHost?: (id: string | null, signal: AbortSignal) => Promise<EmbeddingHost | null>,
) {
  const cache = new Map<string, Float32Array>();
  const queued = new Map<string, AbortSignal | undefined>();
  let choice: VillageEmbeddingChoice = "off";
  let scope = new AbortController();
  let local: EmbeddingHost | undefined;
  let status: VillageEmbeddingStatus | undefined;
  let retryAfter = 0;
  let dimension = 0;
  let space = "";
  let active: symbol | undefined;
  let worldScope = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let world = "";

  function resetIndex() {
    dimension = 0;
    space = "";
    cache.clear();
    queued.clear();
    clearTimeout(timer);
    timer = undefined;
  }

  function unavailable() {
    status = "unavailable";
    resetIndex();
  }

  function select(next: VillageEmbeddingChoice, retry = false) {
    if (choice === next && (!retry || status !== "unavailable")) return status;
    scope.abort();
    scope = new AbortController();
    choice = next;
    retryAfter = 0;
    active = undefined;
    status = undefined;
    local = undefined;
    resetIndex();
    if (next === "off") return;
    if (!resolveHost) {
      unavailable();
      return status;
    }
    status = "preparing";
    const signal = AbortSignal.any([scope.signal, AbortSignal.timeout(next === "local" ? 90_000 : 5_000)]);
    const selected = scope;
    void (async () => {
      const host = await within(
        Promise.resolve().then(() => resolveHost(next === "local" ? null : next.slice("connection:".length), signal)),
        signal,
      );
      if (selected.signal.aborted) return;
      if (!host?.spaceId || host.spaceId.startsWith("local:") !== (next === "local")) {
        unavailable();
        return;
      }
      if (next === "local") {
        const raw = (
          await within(
            Promise.resolve().then(() => host.embed(["Village memory"], signal, "query")),
            signal,
          )
        )?.[0];
        if (selected.signal.aborted) return;
        if (!unitVector(raw, raw?.length ?? 0)) {
          unavailable();
          return;
        }
        dimension = raw!.length;
        space = host.spaceId;
        local = host;
      }
      status = "ready";
    })();
    return status;
  }

  async function currentHost(selectedChoice: VillageEmbeddingChoice, signal: AbortSignal) {
    if (selectedChoice === "local") return local;
    if (selectedChoice === "off" || !resolveHost) return;
    const host = await within(
      Promise.resolve().then(() => resolveHost(selectedChoice.slice("connection:".length), signal)),
      signal,
    );
    return host?.spaceId && !host.spaceId.startsWith("local:") ? host : undefined;
  }

  function schedule() {
    if (timer || active || !queued.size || status !== "ready") return;
    timer = setTimeout(async () => {
      timer = undefined;
      if (active || !queued.size || status !== "ready") return;
      const selected = scope,
        selectedChoice = choice,
        currentWorld = world,
        currentSpace = space;
      const entries = [...queued].filter(([, request]) => !request?.aborted);
      queued.clear();
      if (!entries.length) return;
      const texts = entries.map(([text]) => text);
      const operation = (active = Symbol());
      const canceled = AbortSignal.any([
        selected.signal,
        worldScope.signal,
        ...entries.flatMap(([, request]) => (request ? [request] : [])),
      ]);
      const signal = AbortSignal.any([canceled, AbortSignal.timeout(15_000)]);
      try {
        const host = await currentHost(selectedChoice, signal);
        if (signal.aborted || world !== currentWorld) return;
        if (!host) {
          unavailable();
          return;
        }
        if (host.spaceId !== currentSpace) {
          resetIndex();
          return;
        }
        const vectors = await within(
          Promise.resolve().then(() => (signal.aborted ? null : host.embed(texts, signal, "document"))),
          signal,
        );
        if (canceled.aborted || world !== currentWorld) return;
        if (signal.aborted || vectors?.length !== texts.length) {
          unavailable();
          return;
        }
        dimension ||= vectors[0]?.length ?? 0;
        for (const [index, text] of texts.entries()) {
          const vector = unitVector(vectors[index], dimension);
          if (!vector) {
            unavailable();
            return;
          }
          cache.set(text, vector);
          if (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value!);
        }
      } catch {
        if (!canceled.aborted && world === currentWorld) unavailable();
      } finally {
        if (active === operation) active = undefined;
        schedule();
      }
    }, 25);
    timer.unref();
  }

  async function ranking(input: string, worldId: string, request?: AbortSignal): Promise<RecallRanking["semantic"]> {
    if (choice === "off" || status !== "ready" || request?.aborted) return;
    if (world !== worldId) {
      world = worldId;
      worldScope.abort();
      worldScope = new AbortController();
      resetIndex();
    }
    if (active || Date.now() < retryAfter) return;
    const selected = scope,
      selectedChoice = choice;
    const canceled = AbortSignal.any([selected.signal, worldScope.signal, ...(request ? [request] : [])]);
    const signal = AbortSignal.any([
      canceled,
      AbortSignal.timeout(selectedChoice === "local" ? LOCAL_QUERY_MS : CONNECTION_QUERY_MS),
    ]);
    const operation = (active = Symbol());
    let host: EmbeddingHost | undefined;
    let vector: Float32Array | undefined;
    try {
      host = await currentHost(selectedChoice, signal);
      if (signal.aborted || world !== worldId) return;
      if (!host) {
        unavailable();
        return;
      }
      if (space !== host.spaceId) {
        resetIndex();
        space = host.spaceId;
      }
      const query = input.trim().slice(0, MAX_TEXT);
      if (query && cache.size) {
        const raw = (
          await within(
            Promise.resolve().then(() => (signal.aborted ? null : host!.embed([query], signal, "query"))),
            signal,
          )
        )?.[0];
        if (canceled.aborted) return;
        if (signal.aborted) {
          if (selectedChoice !== "local") retryAfter = Date.now() + CONNECTION_RETRY_MS;
          return;
        }
        vector = unitVector(raw, dimension);
        if (!vector) {
          unavailable();
          return;
        }
      }
    } finally {
      if (active === operation) active = undefined;
      schedule();
    }
    return (texts) => {
      const hits = new Map<number, number>();
      if (
        selected.signal.aborted ||
        request?.aborted ||
        status !== "ready" ||
        world !== worldId ||
        space !== host?.spaceId
      )
        return hits;
      let added = 0;
      for (let index = texts.length - 1; index >= 0; index--) {
        const text = texts[index];
        if (!text.trim() || text.length > MAX_TEXT) continue;
        const stored = cache.get(text);
        if (!stored) {
          if (!queued.has(text) && queued.size < MAX_BATCH && added < MAX_BATCH / 2) {
            queued.set(text, request);
            added++;
          }
          continue;
        }
        if (vector)
          hits.set(
            index,
            stored.reduce((sum, value, position) => sum + value * vector[position], 0),
          );
      }
      schedule();
      return hits;
    };
  }

  return { select, ranking, dispose: () => select("off") };
}
