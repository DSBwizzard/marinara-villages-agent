import { useEffect, useRef, useState } from "react";
import type {
  RepairIndex,
  RepairPerson,
  RepairRecord,
  RepairRecordPage,
  RepairRequest,
  RepairReview,
  RepairTopic,
  RepairValue,
} from "../../../shared/contracts/repair.js";
import { request, messageFrom } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";

type Draft = { values: Record<string, RepairValue>; knowers: string[]; action: string };
type Section = "memories" | "details";
type View = "hub" | "list" | "edit" | "review" | "done" | "history" | "checkpoints";
export function useRepairController(
  active: boolean,
  onApplied: (kind: RepairReview["kind"]) => Promise<{ title: string; text: string } | null>,
) {
  const [index, setIndex] = useState<RepairIndex | null>(null),
    [topic, setTopic] = useState<RepairTopic>("memories"),
    [view, setView] = useState<View>("hub");
  const [person, setPerson] = useState<RepairPerson | null>(null),
    [section, setSection] = useState<Section>("memories");
  const [records, setRecords] = useState<RepairRecord[]>([]),
    [creation, setCreation] = useState<RepairRecord | null>(null),
    [selected, setSelected] = useState<RepairRecord | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({}),
    [review, setReview] = useState<RepairReview | null>(null);
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [saving, setSaving] = useState(false),
    [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0),
    [total, setTotal] = useState(0),
    [checkpointTitle, setCheckpointTitle] = useState("");
  const [restoreAcknowledged, setRestoreAcknowledged] = useState(false),
    [preservedDraft, setPreservedDraft] = useState<{ title: string; text: string } | null>(null);
  const epoch = useRef(0),
    operation = useRef(0),
    world = useRef(""),
    collection = useRef<"list" | "history" | "checkpoints">("list");
  const pending = useRef<RepairRequest | null>(null),
    checkpointRequest = useRef<{ title: string; operationId: string } | null>(null);
  const draftKey = (id: string) => JSON.stringify([world.current, person?.id ?? "", id]);
  const current = (ticket: number) => epoch.current === ticket;
  const invalidate = () => {
    epoch.current++;
    pending.current = null;
    setReview(null);
    setSelected(null);
    setRecords([]);
    setCreation(null);
    setOffset(0);
    setTotal(0);
    setError("");
    setRestoreAcknowledged(false);
  };
  const acceptIndex = (result: RepairIndex, ticket: number) => {
    if (!current(ticket)) return;
    const identity = result.identity ?? result.seed;
    if (world.current && world.current !== identity) {
      invalidate();
      setDrafts({});
      setPerson(null);
      setView("hub");
      setIndex(result);
      checkpointRequest.current = null;
      world.current = identity;
      return;
    }
    world.current = identity;
    setIndex(result);
  };
  const readIndex = async (historyOffset = 0) => {
    const ticket = epoch.current;
    const result = await request<RepairIndex>(`/repair?historyOffset=${historyOffset}`);
    acceptIndex(result, ticket);
  };
  useEffect(() => {
    if (!active) return;
    const abort = new AbortController(),
      ticket = epoch.current;
    void request<RepairIndex>("/repair", { signal: abort.signal })
      .then((result) => {
        if (abort.signal.aborted || epoch.current !== ticket) return;
        const identity = result.identity ?? result.seed;
        if (world.current && world.current !== identity) {
          epoch.current++;
          world.current = identity;
          pending.current = null;
          setDrafts({});
          setSelected(null);
          setReview(null);
          setPerson(null);
          setRecords([]);
          setCreation(null);
          setView("hub");
          setIndex(result);
          checkpointRequest.current = null;
          return;
        }
        world.current = identity;
        setIndex(result);
      })
      .catch((cause) => {
        if (!abort.signal.aborted && epoch.current === ticket) setError(messageFrom(cause, "Could not open REPAIR."));
      });
    return () => abort.abort();
  }, [active]);
  const act = async (fn: (ticket: number) => Promise<void>) => {
    const ticket = epoch.current,
      id = ++operation.current;
    setError("");
    setBusy(true);
    try {
      await fn(ticket);
    } catch (cause) {
      if (current(ticket)) setError(messageFrom(cause, "The repair could not be completed."));
    } finally {
      if (operation.current === id) setBusy(false);
    }
  };
  const fetchRecords = async (
    nextTopic: RepairTopic,
    start: number,
    search: string,
    who: RepairPerson | null,
    part: Section,
    ticket: number,
  ) => {
    if (!current(ticket)) return;
    if (nextTopic === "restore" || (nextTopic === "people" && !who)) return;
    const result = await request<RepairRecordPage>(
      `/repair/records?topic=${nextTopic}&offset=${start}&query=${encodeURIComponent(search)}${who ? `&personId=${encodeURIComponent(who.id)}&section=${part}` : ""}`,
    );
    if (!current(ticket)) return;
    setRecords(result.records.filter((row) => !row.creating));
    setCreation(result.creation ?? result.records.find((row) => row.creating) ?? null);
    setOffset(start);
    setTotal(result.total);
  };
  const load = (nextTopic: RepairTopic = topic, start = 0, search = query) =>
    act(async (ticket) => {
      setView(nextTopic === "restore" ? "checkpoints" : "list");
      await fetchRecords(nextTopic, start, search, person, section, ticket);
    });
  const chooseTopic = (nextTopic: RepairTopic) => {
    invalidate();
    setPerson(null);
    setSection("memories");
    setQuery("");
    setTopic(nextTopic);
    collection.current = nextTopic === "restore" ? "checkpoints" : "list";
    setView(collection.current);
    return act(async (ticket) => {
      await readIndex();
      await fetchRecords(nextTopic, 0, "", null, "memories", ticket);
    });
  };
  const choosePerson = (who: RepairPerson) => {
    invalidate();
    setPerson(who);
    setTopic("people");
    setSection("memories");
    setQuery("");
    collection.current = "list";
    setView("list");
    return act(async (ticket) => {
      await readIndex();
      await fetchRecords("people", 0, "", who, "memories", ticket);
    });
  };
  const chooseSection = (part: Section) => {
    invalidate();
    setSection(part);
    setQuery("");
    setView("list");
    return act(async (ticket) => {
      await readIndex();
      await fetchRecords(topic, 0, "", person, part, ticket);
    });
  };
  const showHub = () => {
    invalidate();
    setPerson(null);
    setView("hub");
    void act(() => readIndex());
  };
  const showHistory = () => {
    invalidate();
    setPerson(null);
    collection.current = "history";
    setView("history");
    return act(() => readIndex());
  };
  const fetchRecord = async (id: string, ticket: number) => {
    if (!current(ticket)) return;
    const record = await request<RepairRecord>(
      `/repair/record?id=${encodeURIComponent(id)}${person ? `&personId=${encodeURIComponent(person.id)}` : ""}`,
    );
    if (!current(ticket)) return;
    setSelected(record);
    setView("edit");
    const key = draftKey(id),
      focus = record.people?.find((p) => p.id === person?.id),
      values = Object.fromEntries(record.fields.map((f) => [f.key, f.value]));
    setDrafts((prior) =>
      prior[key]
        ? prior
        : {
            ...prior,
            [key]: {
              values,
              knowers: focus ? [focus.id] : (record.people?.slice(0, 1).map((p) => p.id) ?? []),
              action: record.actions[0].id,
            },
          },
    );
  };
  const open = (id: string) => {
    invalidate();
    setView("edit");
    return act((ticket) => fetchRecord(id, ticket));
  };
  const draft = selected ? drafts[draftKey(selected.id)] : undefined;
  const update = (change: Partial<Draft>) => {
    if (!selected) return;
    const key = draftKey(selected.id);
    setDrafts((prior) => ({ ...prior, [key]: { ...prior[key], ...change } }));
    pending.current = null;
    setReview(null);
    setError("");
  };
  const prepare = () =>
    act(async (ticket) => {
      if (!selected || !draft) return;
      pending.current ??= {
        operationId: createVillagesClientId(),
        recordId: selected.id,
        ...draft,
        values:
          selected.topic === "memories" && ["forget", "remember"].includes(draft.action)
            ? Object.fromEntries(selected.fields.map((field) => [field.key, field.value]))
            : draft.values,
        expectedRecord: selected.token ?? "",
        ...(person ? { personId: person.id } : {}),
      };
      const result = await request<RepairReview>("/repair/review", {
        method: "POST",
        body: JSON.stringify(pending.current),
      });
      if (!current(ticket)) return;
      setReview(result);
      setRestoreAcknowledged(false);
      setView("review");
    });
  const apply = () =>
    act(async (ticket) => {
      if (!review) return;
      setSaving(true);
      try {
        await request("/repair/apply", { method: "POST", body: JSON.stringify({ id: review.id }) });
        if (!current(ticket)) return;
        if (selected && review.kind === "repair") {
          const key = draftKey(selected.id);
          setDrafts((prior) => {
            const next = { ...prior };
            delete next[key];
            return next;
          });
        }
        pending.current = null;
        await readIndex();
        const kept = await onApplied(review.kind);
        if (kept) setPreservedDraft(kept);
        if (current(ticket)) setView("done");
      } finally {
        setSaving(false);
      }
    });
  const undo = (id: string) => {
    invalidate();
    setView("history");
    return act(async (ticket) => {
      const result = await request<RepairReview>("/repair/undo", {
        method: "POST",
        body: JSON.stringify({ id, operationId: createVillagesClientId() }),
      });
      if (!current(ticket)) return;
      setReview(result);
      setView("review");
    });
  };
  const restore = (id: string) => {
    invalidate();
    setView("checkpoints");
    return act(async (ticket) => {
      const result = await request<RepairReview>("/repair/restore", {
        method: "POST",
        body: JSON.stringify({ id, operationId: createVillagesClientId() }),
      });
      if (!current(ticket)) return;
      setReview(result);
      setView("review");
    });
  };
  const saveCheckpoint = () =>
    act(async (ticket) => {
      setSaving(true);
      try {
        if (checkpointRequest.current?.title !== checkpointTitle)
          checkpointRequest.current = { title: checkpointTitle, operationId: createVillagesClientId() };
        await request("/repair/checkpoints", { method: "POST", body: JSON.stringify(checkpointRequest.current) });
        if (!current(ticket)) return;
        checkpointRequest.current = null;
        setCheckpointTitle("");
        await readIndex();
      } finally {
        setSaving(false);
      }
    });
  return {
    index,
    topic,
    view,
    person,
    section,
    collection: collection.current,
    records,
    creation,
    selected,
    draft,
    review,
    error,
    busy,
    saving,
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
    chooseTopic,
    choosePerson,
    chooseSection,
    showHub,
    showHistory,
    open,
    update,
    prepare,
    apply,
    undo,
    restore,
    saveCheckpoint,
    readIndex,
    backFromReview: () => {
      setReview(null);
      setView(selected ? "edit" : collection.current);
    },
    historyPage: (start: number) => act(() => readIndex(start)),
  };
}
export type RepairController = ReturnType<typeof useRepairController>;
