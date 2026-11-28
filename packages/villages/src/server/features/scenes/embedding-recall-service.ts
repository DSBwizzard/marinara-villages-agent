import type { CapabilityRuntimeHost } from "@marinara-engine/shared";
import type { VillageEmbeddingChoice, VillageEmbeddingStatus } from "../../../shared/contracts/village.js";
import type { RecallRanking } from "../../domain/rules/text-recall.js";

const MAX_CACHE = 512;
const MAX_BATCH = 8;
const QUERY_MS = 450;
const LOCAL_RETRY_MS = 10_000;
const CONNECTION_RETRY_MS = 60_000;
const MAX_TEXT = 1400;

type EmbeddingHost = NonNullable<Awaited<ReturnType<NonNullable<CapabilityRuntimeHost["embeddingsFor"]>>>>;
type EmbeddingAvailability = EmbeddingHost | "preparing" | null;

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
  resolveHost?: (choice: Exclude<VillageEmbeddingChoice, "off">, signal: AbortSignal) => Promise<EmbeddingAvailability>,
) {
  const cache = new Map<string, Float32Array>();
  const queued = new Map<string, AbortSignal | undefined>();
  let choice: VillageEmbeddingChoice = "off";
  let scope = new AbortController();
  let status: VillageEmbeddingStatus | undefined;
  let checking = false;
  let checkLocalAfter = 0;
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

  function setStatus(next: VillageEmbeddingStatus) {
    status = next;
    checkLocalAfter = Date.now() + (next === "unavailable" ? 15_000 : 2_000);
    if (next !== "ready") resetIndex();
  }

  function select(next: VillageEmbeddingChoice, retry = false) {
    if (choice !== next) {
      scope.abort();
      scope = new AbortController();
      choice = next;
      retryAfter = 0;
      checkLocalAfter = 0;
      active = undefined;
      checking = false;
      status = undefined;
      resetIndex();
    } else if (checking || (!(retry && status === "unavailable") && (next !== "local" || Date.now() < checkLocalAfter)))
      return status;
    if (next === "off") return;
    if (!resolveHost) {
      setStatus("unavailable");
      return status;
    }
    if (!status || retry) status = "preparing";
    checking = true;
    const selected = scope.signal;
    const signal = AbortSignal.any([selected, AbortSignal.timeout(5_000)]);
    void (async () => {
      const host = await currentHost(next, signal);
      if (selected.aborted) return;
      checking = false;
      setStatus(host === "preparing" ? "preparing" : host?.spaceId ? "ready" : "unavailable");
    })();
    return status;
  }

  async function currentHost(selectedChoice: VillageEmbeddingChoice, signal: AbortSignal) {
    if (selectedChoice === "off" || !resolveHost) return;
    return within(
      Promise.resolve().then(() => resolveHost(selectedChoice, signal)),
      signal,
    );
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
      const signal = AbortSignal.any([canceled, AbortSignal.timeout(selectedChoice === "local" ? 60_000 : 15_000)]);
      try {
        const host = await currentHost(selectedChoice, signal);
        if (canceled.aborted || world !== currentWorld) return;
        if (!host || host === "preparing") {
          setStatus(host === "preparing" ? "preparing" : "unavailable");
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
          setStatus("unavailable");
          return;
        }
        dimension ||= vectors[0]?.length ?? 0;
        for (const [index, text] of texts.entries()) {
          const vector = unitVector(vectors[index], dimension);
          if (!vector) {
            setStatus("unavailable");
            return;
          }
          cache.set(text, vector);
          if (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value!);
        }
      } catch {
        if (!canceled.aborted && world === currentWorld) setStatus("unavailable");
      } finally {
        if (active === operation) active = undefined;
        schedule();
      }
    }, 25);
    timer.unref();
  }

  async function ranking(input: string, worldId: string, request?: AbortSignal): Promise<RecallRanking["semantic"]> {
    if (choice === "off" || request?.aborted) return;
    if (status !== "ready") {
      if (choice === "local") select(choice);
      return;
    }
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
    const signal = AbortSignal.any([canceled, AbortSignal.timeout(QUERY_MS)]);
    const operation = (active = Symbol());
    let host: EmbeddingHost | undefined;
    let vector: Float32Array | undefined;
    try {
      const resolved = await currentHost(selectedChoice, signal);
      if (signal.aborted || world !== worldId) return;
      if (!resolved || resolved === "preparing") {
        setStatus(resolved === "preparing" ? "preparing" : "unavailable");
        return;
      }
      host = resolved;
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
          retryAfter = Date.now() + (selectedChoice === "local" ? LOCAL_RETRY_MS : CONNECTION_RETRY_MS);
          return;
        }
        vector = unitVector(raw, dimension);
        if (!vector) {
          setStatus("unavailable");
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
