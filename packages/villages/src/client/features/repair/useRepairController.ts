import { useEffect, useRef, useState } from "react";
import type {
  RepairBrowseItem,
  RepairIndex,
  RepairPerson,
  RepairPersonSection,
  RepairRecord,
  RepairRecordPage,
  RepairRequest,
  RepairReview,
  RepairTopic,
  RepairValue,
} from "../../../shared/contracts/repair.js";
import { REPAIR_NO_CHANGES } from "../../../shared/contracts/repair.js";
import { repairClockMinutes } from "../../../shared/helpers/repair-clock.js";
import { request, messageFrom, VillageApiError } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";

type Draft = { values: Record<string, RepairValue>; knowers: string[]; action: string; agendaToken?: string };
type Section = RepairPersonSection;
type RecordTopic = RepairTopic | "all";
type AgendaPick = { index: number | "new"; token?: string };
type View = "hub" | "list" | "edit" | "review" | "done" | "history" | "checkpoints";
export function useRepairController(
  active: boolean,
  onApplied: (kind: RepairReview["kind"]) => Promise<{ title: string; text: string } | null>,
) {
  const [index, setIndex] = useState<RepairIndex | null>(null),
    [topic, setTopic] = useState<RecordTopic>("people"),
    [view, setView] = useState<View>("list");
  const [person, setPerson] = useState<RepairPerson | null>(null),
    [section, setSection] = useState<Section>("memories");
  const [agendaPick, setAgendaPick] = useState<AgendaPick>();
  const [records, setRecords] = useState<RepairRecord[]>([]),
    [creation, setCreation] = useState<RepairRecord | null>(null),
    [selected, setSelected] = useState<RepairRecord | null>(null);
  const [placeDirectory, setPlaceDirectory] = useState<RepairBrowseItem[]>([]),
    [placePath, setPlacePath] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({}),
    [review, setReview] = useState<RepairReview | null>(null);
  const [draftActions, setDraftActions] = useState<Record<string, string>>({});
  const [memoryState, setMemoryState] = useState("remembered");
  const [failure, setFailure] = useState<{ message: string; field?: string; noChanges?: boolean }>(),
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
  const reviewRef = useRef<Pick<RepairReview, "id" | "token"> | null>(null);
  const abandonReview = () => {
    const retained = reviewRef.current;
    reviewRef.current = null;
    if (retained) void request("/repair/cancel", { method: "POST", body: JSON.stringify(retained) }).catch(() => {});
    pending.current = null;
    setReview(null);
  };
  const recordKey = (id: string, pick: AgendaPick | undefined) =>
    JSON.stringify([world.current, person?.id ?? "", id, pick?.index]);
  const draftKey = (
    id: string,
    pick: AgendaPick | undefined,
    action = draftActions[recordKey(id, pick)] ?? (pick?.index === "new" ? "add-activity" : "correct"),
  ) => JSON.stringify([recordKey(id, pick), action]);
  const editorFields = (record: RepairRecord, pick: AgendaPick | undefined) =>
    record.agendaDay ? record.fields.filter((field) => field.key.endsWith(`:${pick?.index}`)) : record.fields;
  const current = (ticket: number) => epoch.current === ticket;
  const invalidate = () => {
    abandonReview();
    setAgendaPick(undefined);
    epoch.current++;
    setSelected(null);
    setRecords([]);
    setCreation(null);
    setOffset(0);
    setTotal(0);
    setFailure(undefined);
    setRestoreAcknowledged(false);
  };
  const acceptIndex = (result: RepairIndex, ticket: number) => {
    if (!current(ticket)) return;
    const identity = result.identity ?? result.seed;
    if (world.current && world.current !== identity) {
      reviewRef.current = null;
      invalidate();
      setDrafts({});
      setPerson(null);
      setPlaceDirectory([]);
      setPlacePath([]);
      setView("hub");
      setIndex(result);
      checkpointRequest.current = null;
      world.current = identity;
      return;
    }
    world.current = identity;
    setIndex(result);
  };
  const readIndex = async (historyOffset = 0, checkpointOffset = 0) => {
    const ticket = epoch.current;
    const result = await request<RepairIndex>(
      `/repair?historyOffset=${historyOffset}&checkpointOffset=${checkpointOffset}`,
    );
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
          reviewRef.current = null;
          epoch.current++;
          world.current = identity;
          pending.current = null;
          setDrafts({});
          setSelected(null);
          setReview(null);
          setPerson(null);
          setRecords([]);
          setPlaceDirectory([]);
          setPlacePath([]);
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
        if (!abort.signal.aborted && epoch.current === ticket)
          setFailure({ message: messageFrom(cause, "Could not open REPAIR.") });
      });
    return () => abort.abort();
  }, [active]);
  const act = async (fn: (ticket: number) => Promise<void>) => {
    const ticket = epoch.current,
      id = ++operation.current;
    setFailure(undefined);
    setBusy(true);
    try {
      await fn(ticket);
    } catch (cause) {
      if (current(ticket))
        setFailure({
          message: messageFrom(cause, "The repair could not be completed."),
          field: cause instanceof VillageApiError ? /^repair-field:(.+)$/u.exec(cause.code ?? "")?.[1] : undefined,
          noChanges: cause instanceof VillageApiError && cause.code === REPAIR_NO_CHANGES,
        });
    } finally {
      if (operation.current === id) setBusy(false);
    }
  };
  const fetchRecords = async (
    nextTopic: RecordTopic,
    start: number,
    search: string,
    who: RepairPerson | null,
    part: Section,
    ticket: number,
    status = memoryState,
  ) => {
    if (!current(ticket)) return;
    if (nextTopic === "restore" || (nextTopic === "people" && !who)) return;
    const result = await request<RepairRecordPage>(
      `/repair/records?topic=${nextTopic}&offset=${start}&query=${encodeURIComponent(search)}${who ? `&personId=${encodeURIComponent(who.id)}&section=${part}${part === "memories" ? `&memoryState=${status}` : ""}` : ""}${nextTopic === "places" ? "&browse=places" : ""}`,
    );
    if (!current(ticket)) return;
    if (nextTopic === "places") setPlaceDirectory(result.directory ?? []);
    setRecords(result.records.filter((row) => !row.creating));
    setCreation(result.creation ?? result.records.find((row) => row.creating) ?? null);
    setOffset(start);
    setTotal(result.total);
  };
  const load = (nextTopic: RecordTopic = topic, start = 0, search = query) => {
    if (reviewRef.current) {
      abandonReview();
      epoch.current++;
    }
    return act(async (ticket) => {
      setView(nextTopic === "restore" ? "checkpoints" : "list");
      await fetchRecords(nextTopic, start, search, person, section, ticket);
    });
  };
  const searchRecords = (search: string, start = 0, status = memoryState) => {
    setMemoryState(status);
    abandonReview();
    epoch.current++;
    return act((ticket) => fetchRecords(topic, start, search, person, section, ticket, status));
  };
  const chooseTopic = (nextTopic: RecordTopic, search = "") => {
    invalidate();
    setPerson(null);
    setPlaceDirectory([]);
    setPlacePath([]);
    setSection("memories");
    setQuery(search);
    setTopic(nextTopic);
    collection.current = nextTopic === "restore" ? "checkpoints" : "list";
    setView(collection.current);
    return act(async (ticket) => {
      await readIndex();
      await fetchRecords(nextTopic, 0, search, null, "memories", ticket);
    });
  };
  const choosePerson = (who: RepairPerson, part: Section = "memories") => {
    invalidate();
    setPerson(who);
    setTopic("people");
    setSection(part);
    setQuery("");
    collection.current = "list";
    setView("list");
    return act(async (ticket) => {
      await readIndex();
      await fetchRecords("people", 0, "", who, part, ticket);
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
    setQuery("");
    collection.current = "list";
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
  const fetchRecord = async (id: string, ticket: number, pick: AgendaPick | undefined, resetDraft = false) => {
    if (!current(ticket)) return;
    const record = await request<RepairRecord>(
      `/repair/record?id=${encodeURIComponent(id)}${person ? `&personId=${encodeURIComponent(person.id)}` : ""}`,
    );
    if (pick)
      record.actions = record.actions.filter((action) =>
        pick.index === "new" ? action.id === "add-activity" : action.id !== "add-activity",
      );
    if (!current(ticket)) return;
    if (pick && record.token !== pick.token) {
      await fetchRecords(topic, 0, "", person, section, ticket);
      throw new Error("This date changed. Select the activity again.");
    }
    setSelected(record);
    setView(pick ? "list" : "edit");
    const rememberedAction = draftActions[recordKey(id, pick)];
    const action =
        pick?.index === "new"
          ? "add-activity"
          : record.actions.some((option) => option.id === rememberedAction && option.id !== "add-activity")
            ? rememberedAction!
            : (record.actions[0]?.id ?? ""),
      key = draftKey(id, pick, action),
      focus = record.people?.find((p) => p.id === person?.id),
      values = Object.fromEntries(editorFields(record, pick).map((f) => [f.key, f.value]));
    setDraftActions((prior) => ({ ...prior, [recordKey(id, pick)]: action }));
    setDrafts((prior) =>
      prior[key] && !resetDraft
        ? prior
        : {
            ...prior,
            [key]: {
              values,
              knowers: focus ? [focus.id] : (record.people?.slice(0, 1).map((p) => p.id) ?? []),
              action,
              ...(record.agendaDay ? { agendaToken: record.token } : {}),
            },
          },
    );
  };
  const closeAgendaEditor = () => {
    abandonReview();
    epoch.current++;
    setSelected(null);
    setAgendaPick(undefined);
    setFailure(undefined);
  };
  const open = (id: string, pick?: AgendaPick) => {
    if (pick) {
      closeAgendaEditor();
      setAgendaPick(pick);
    } else {
      abandonReview();
      epoch.current++;
      if (view !== "edit") setSelected(null);
      setAgendaPick(undefined);
      setFailure(undefined);
      setView("edit");
    }
    return act((ticket) => fetchRecord(id, ticket, pick));
  };
  const draft = selected ? drafts[draftKey(selected.id, agendaPick)] : undefined;
  const fields = selected ? editorFields(selected, agendaPick) : [];
  const hasFieldChanges = fields.some(({ key, value, type }) => {
    const next = draft?.values[key] ?? value;
    if (type === "clock") {
      const before = repairClockMinutes(String(value));
      if (before !== undefined) return repairClockMinutes(String(next)) !== before;
    }
    return key.startsWith("activity:") ? String(next).trim() !== String(value).trim() : next !== value;
  });
  const canReview = Boolean(
    selected &&
    draft?.action &&
    (draft.action !== "teach" ||
      (draft.knowers.length === 1 && selected.recipients?.some((person) => person.id === draft.knowers[0]))) &&
    !failure?.noChanges &&
    (selected.topic === "memories" &&
    draft.action === "correct" &&
    !selected.creating &&
    selected.people?.some((p) => p.text !== undefined)
      ? hasFieldChanges ||
        selected.people.some(
          (person) =>
            draft.knowers.includes(person.id) &&
            (person.forgotten ||
              (person.text ?? selected.fields.find((field) => field.key === "text")?.value) !== draft.values.text),
        )
      : draft.action === "correct" || draft.action === "add-activity" || selected.creating
        ? hasFieldChanges
        : true),
  );
  const update = (change: Partial<Draft>) => {
    if (!selected) return;
    const action = change.action ?? draft?.action ?? selected.actions[0]?.id ?? "";
    const key = draftKey(selected.id, agendaPick, action);
    if (change.action) setDraftActions((prior) => ({ ...prior, [recordKey(selected.id, agendaPick)]: action }));
    setDrafts((prior) => ({
      ...prior,
      [key]: {
        ...(prior[key] ?? {
          values: Object.fromEntries(fields.map((field) => [field.key, field.value])),
          knowers: selected.people?.some((member) => member.id === person?.id)
            ? [person!.id]
            : (selected.people?.slice(0, 1).map((member) => member.id) ?? []),
          action,
        }),
        ...change,
      },
    }));
    abandonReview();
    epoch.current++;
    setFailure(undefined);
  };
  const prepare = () => {
    if (!selected || !draft || !canReview) return;
    return act(async (ticket) => {
      pending.current ??= {
        operationId: createVillagesClientId(),
        recordId: selected.id,
        action: draft.action,
        knowers: draft.knowers,
        values:
          selected.topic === "memories" && ["forget", "remember"].includes(draft.action)
            ? Object.fromEntries(selected.fields.map((field) => [field.key, field.value]))
            : draft.values,
        expectedRecord: draft.agendaToken ?? selected.token ?? "",
        ...(person ? { personId: person.id } : {}),
      };
      const result = await request<RepairReview>("/repair/review", {
        method: "POST",
        body: JSON.stringify(pending.current),
      });
      if (!current(ticket)) return;
      reviewRef.current = { id: result.id, token: result.token };
      setReview(result);
      setRestoreAcknowledged(false);
      setView("review");
    });
  };
  const apply = () =>
    act(async (ticket) => {
      if (!review) return;
      setSaving(true);
      try {
        await request("/repair/apply", {
          method: "POST",
          body: JSON.stringify({ id: review.id, token: review.token }),
        });
        if (!current(ticket)) return;
        reviewRef.current = null;
        if (selected && review.kind === "repair") {
          const key = draftKey(selected.id, agendaPick);
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
      reviewRef.current = { id: result.id, token: result.token };
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
      reviewRef.current = { id: result.id, token: result.token };
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
  const deleteCheckpoint = (id: string, token: string) =>
    act(async (ticket) => {
      await request("/repair/checkpoints", { method: "DELETE", body: JSON.stringify({ id, token }) });
      if (current(ticket)) await readIndex(index?.historyOffset ?? 0);
    });
  const discard = () => {
    if (!selected) return;
    const key = draftKey(selected.id, agendaPick);
    abandonReview();
    epoch.current++;
    setDrafts((prior) => ({
      ...prior,
      [key]: {
        values: Object.fromEntries(editorFields(selected, agendaPick).map((field) => [field.key, field.value])),
        knowers: selected.people?.some((entry) => entry.id === person?.id)
          ? [person!.id]
          : (selected.people?.slice(0, 1).map((entry) => entry.id) ?? []),
        action: draft?.action ?? (agendaPick?.index === "new" ? "add-activity" : (selected.actions[0]?.id ?? "")),
        ...(selected.agendaDay ? { agendaToken: selected.token } : {}),
      },
    }));
    setFailure(undefined);
  };
  return {
    index,
    topic,
    view,
    person,
    section,
    collection: collection.current,
    records,
    placeDirectory,
    placePath,
    setPlacePath,
    creation,
    selected,
    editorFields: fields,
    draft,
    review,
    canReview,
    error: failure?.noChanges ? "" : (failure?.message ?? ""),
    errorField: failure?.field,
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
    searchRecords,
    chooseTopic,
    choosePerson,
    chooseSection,
    showHub,
    showHistory,
    open,
    refreshSelected: () =>
      selected ? act((ticket) => fetchRecord(selected.id, ticket, agendaPick, true)) : Promise.resolve(),
    closeAgendaEditor,
    update,
    discard,
    prepare,
    apply,
    undo,
    restore,
    saveCheckpoint,
    deleteCheckpoint,
    readIndex,
    backFromReview: () => {
      abandonReview();
      epoch.current++;
      setView(selected && !agendaPick ? "edit" : collection.current);
    },
    leave: () => {
      epoch.current++;
      if (reviewRef.current) {
        abandonReview();
        setView(selected && !agendaPick ? "edit" : collection.current);
      }
    },
    historyPage: (start: number) => act(() => readIndex(start, index?.checkpointOffset ?? 0)),
    checkpointPage: (start: number) => act(() => readIndex(index?.historyOffset ?? 0, start)),
  };
}
export type RepairController = ReturnType<typeof useRepairController>;
