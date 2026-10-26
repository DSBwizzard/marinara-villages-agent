import { useEffect, useRef, useState } from "react";
import type {
  RepairIndex,
  RepairRecord,
  RepairRequest,
  RepairReview,
  RepairTopic,
  RepairValue,
} from "../../../shared/contracts/repair.js";
import { request, messageFrom } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";
type Draft = { values: Record<string, RepairValue>; knowers: string[]; action: string };
export function useRepairController(
  active: boolean,
  onApplied: (kind: RepairReview["kind"]) => Promise<{ title: string; text: string } | null>,
) {
  const [index, setIndex] = useState<RepairIndex | null>(null);
  const [topic, setTopic] = useState<RepairTopic>("memories");
  const [view, setView] = useState<"hub" | "list" | "edit" | "review" | "done" | "history" | "checkpoints">("hub");
  const [inspection, setInspection] = useState(false);
  const [records, setRecords] = useState<RepairRecord[]>([]);
  const [selected, setSelected] = useState<RepairRecord | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [review, setReview] = useState<RepairReview | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [checkpointTitle, setCheckpointTitle] = useState("");
  const [restoreAcknowledged, setRestoreAcknowledged] = useState(false);
  const [preservedDraft, setPreservedDraft] = useState<{ title: string; text: string } | null>(null);
  const sequence = useRef(0),
    pending = useRef<RepairRequest | null>(null),
    checkpointRequest = useRef<{ title: string; operationId: string } | null>(null),
    world = useRef("");
  const readIndex = async (signal?: AbortSignal, historyOffset = 0) => {
    const result = await request<RepairIndex>(`/repair?inspection=${inspection}&historyOffset=${historyOffset}`, {
      signal,
    });
    if (world.current && world.current !== (result.identity ?? result.seed)) {
      setDrafts({});
      setSelected(null);
      setReview(null);
      setView("hub");
      pending.current = null;
    }
    world.current = result.identity ?? result.seed;
    setIndex(result);
  };
  useEffect(() => {
    if (!active) return;
    const abort = new AbortController();
    void request<RepairIndex>(`/repair?inspection=${inspection}`, { signal: abort.signal })
      .then((result) => {
        if (abort.signal.aborted) return;
        if (world.current && world.current !== (result.identity ?? result.seed)) {
          setDrafts({});
          setSelected(null);
          setReview(null);
          setView("hub");
          pending.current = null;
        }
        world.current = result.identity ?? result.seed;
        setIndex(result);
      })
      .catch((cause) => {
        if (!abort.signal.aborted) setError(messageFrom(cause, "Could not open REPAIR."));
      });
    return () => abort.abort();
  }, [active, inspection]);
  const act = async (fn: () => Promise<void>) => {
    setError("");
    setBusy(true);
    try {
      await fn();
    } catch (cause) {
      setError(messageFrom(cause, "The repair could not be completed."));
    } finally {
      setBusy(false);
    }
  };
  const load = async (nextTopic: RepairTopic = topic, start = 0, search = query) => {
    const ticket = ++sequence.current;
    setTopic(nextTopic);
    setView(nextTopic === "restore" ? "checkpoints" : "list");
    setError("");
    if (nextTopic === "restore") {
      await act(() => readIndex());
      return;
    }
    await act(async () => {
      const result = await request<{ records: RepairRecord[]; total: number }>(
        `/repair/records?topic=${nextTopic}&inspection=${inspection}&offset=${start}&query=${encodeURIComponent(search)}`,
      );
      if (sequence.current !== ticket) return;
      setRecords(result.records);
      setOffset(start);
      setTotal(result.total);
    });
  };
  const open = async (id: string) =>
    act(async () => {
      const record = await request<RepairRecord>(
        `/repair/record?id=${encodeURIComponent(id)}&inspection=${inspection}`,
      );
      setSelected(record);
      setTopic(record.topic);
      setView("edit");
      setReview(null);
      pending.current = null;
      setDrafts((prior) =>
        prior[id]
          ? prior
          : {
              ...prior,
              [id]: {
                values: Object.fromEntries(record.fields.map((f) => [f.key, f.value])),
                knowers: record.people?.slice(0, 1).map((p) => p.id) ?? [],
                action: record.actions[0].id,
              },
            },
      );
    });
  const draft = selected ? drafts[selected.id] : undefined;
  const update = (change: Partial<Draft>) => {
    if (!selected) return;
    setDrafts((prior) => ({ ...prior, [selected.id]: { ...prior[selected.id], ...change } }));
    pending.current = null;
    setReview(null);
    setError("");
  };
  const prepare = () =>
    act(async () => {
      if (!selected || !draft) return;
      pending.current ??= {
        operationId: createVillagesClientId(),
        recordId: selected.id,
        ...draft,
        inspection,
        expectedRecord: selected.token ?? "",
      };
      const result = await request<RepairReview>("/repair/review", {
        method: "POST",
        body: JSON.stringify(pending.current),
      });
      setReview(result);
      setRestoreAcknowledged(false);
      setView("review");
    });
  const apply = () =>
    act(async () => {
      if (!review) return;
      await request("/repair/apply", { method: "POST", body: JSON.stringify({ id: review.id }) });
      if (selected)
        setDrafts((prior) => {
          const next = { ...prior };
          delete next[selected.id];
          return next;
        });
      pending.current = null;
      setView("done");
      await readIndex();
      const kept = await onApplied(review.kind);
      if (kept) setPreservedDraft(kept);
    });
  const undo = (id: string) =>
    act(async () => {
      const result = await request<RepairReview>("/repair/undo", {
        method: "POST",
        body: JSON.stringify({ id, operationId: createVillagesClientId() }),
      });
      setReview(result);
      setView("review");
      setRestoreAcknowledged(false);
    });
  const restore = (id: string) =>
    act(async () => {
      const result = await request<RepairReview>("/repair/restore", {
        method: "POST",
        body: JSON.stringify({ id, operationId: createVillagesClientId() }),
      });
      setSelected(null);
      setReview(result);
      setView("review");
      setRestoreAcknowledged(false);
    });
  const saveCheckpoint = () =>
    act(async () => {
      if (checkpointRequest.current?.title !== checkpointTitle)
        checkpointRequest.current = { title: checkpointTitle, operationId: createVillagesClientId() };
      await request("/repair/checkpoints", { method: "POST", body: JSON.stringify(checkpointRequest.current) });
      checkpointRequest.current = null;
      setCheckpointTitle("");
      await readIndex();
    });
  return {
    index,
    topic,
    view,
    setView,
    inspection,
    setInspection,
    records,
    selected,
    draft,
    review,
    error,
    busy,
    query,
    setQuery,
    offset,
    total,
    checkpointTitle,
    setCheckpointTitle,
    restoreAcknowledged,
    preservedDraft,
    setRestoreAcknowledged,
    load,
    open,
    update,
    prepare,
    apply,
    undo,
    restore,
    saveCheckpoint,
    readIndex,
    historyPage: (start: number) => act(() => readIndex(undefined, start)),
  };
}
export type RepairController = ReturnType<typeof useRepairController>;
