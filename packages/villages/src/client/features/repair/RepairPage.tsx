import { useEffect, useRef, useState } from "react";
import { AgendaPlanner } from "../../shared/AgendaPlanner.js";
import { useLetterFont, letterFontFamily } from "../../shared/letter-font-css.js";
import { VillageIcon, type VillageIconName } from "../../shared/VillageIcon.js";
import type { RepairRecord, RepairTopic, RepairValue } from "../../../shared/contracts/repair.js";
import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import type { RepairController } from "./useRepairController.js";
import { REPAIR_STYLES } from "./repair-styles.js";
const topics = {
  memories: "Memories",
  people: "People",
  places: "Places & venues",
  world: "World & history",
  progress: "Recover work",
  restore: "Checkpoints",
  all: "Search results",
} satisfies Record<RepairTopic | "all", string>;
const browseTopics = ["people", "places", "world"] as const;
const topicIcons = {
  memories: "memory",
  people: "people",
  places: "places",
  world: "world",
  progress: "projects",
  restore: "details",
} satisfies Record<RepairTopic, VillageIconName>;

function searchSummary(record: RepairRecord) {
  if (record.topic !== "memories") return [topics[record.topic], record.summary].filter(Boolean).join(" · ");
  const remembered = record.people?.filter((person) => !person.forgotten).map((person) => person.name);
  const forgotten = record.people?.filter((person) => person.forgotten).map((person) => person.name);
  return [
    remembered?.length && `Remembered by ${remembered.join(", ")}`,
    forgotten?.length && `Forgotten by ${forgotten.join(", ")}`,
    record.summary,
  ]
    .filter(Boolean)
    .join(" · ");
}

function RepairTile({
  title,
  icon,
  summary,
  disabled,
  onClick,
}: {
  title: string;
  icon: VillageIconName;
  summary?: string;
  disabled: boolean;
  onClick(): void;
}) {
  return (
    <button type="button" className="repair-tile" disabled={disabled} onClick={onClick}>
      <VillageIcon name={icon} />
      <span>
        <strong>{title}</strong>
        {summary ? <small>{summary}</small> : null}
      </span>
      <span aria-hidden="true" className="repair-chevron">
        ›
      </span>
    </button>
  );
}

export function RepairPage({
  controller: c,
  onBack,
  onScene,
  preparation,
  preparationProblem,
  onRetryPreparation,
}: {
  controller: RepairController;
  onBack(): void;
  onScene?: () => void;
  preparation?: VillageSnapshot["foundingPreparation"];
  preparationProblem?: string;
  onRetryPreparation?: () => Promise<void>;
}) {
  const currentTopic = topics[c.topic];
  const consoleSection =
    c.view === "hub"
      ? "records"
      : c.collection !== "list"
        ? "backups"
        : c.topic === "progress"
          ? "recovery"
          : "records";
  const isRestore = c.review?.kind === "restore";
  const addingMemory = c.review?.memory?.creating === true;
  const memoryRecord = c.selected?.topic === "memories";
  const forgettingMemory = memoryRecord && c.draft?.action === "forget";
  const restoringMemory = memoryRecord && c.draft?.action === "remember";
  const memoryReadOnly = forgettingMemory || restoringMemory;
  const correctingMemory = memoryRecord && c.review?.kind === "repair" && !addingMemory && !memoryReadOnly;
  const reviewTitle = forgettingMemory
    ? "Review forgetting"
    : restoringMemory
      ? "Review restoration"
      : "Review changes";
  const source = [...new Set(c.selected?.source ?? [])].filter(
    (excerpt) => !c.selected?.fields.some((field) => String(field.value).trim() === excerpt.trim()),
  );
  const hasSource = !c.selected?.agendaDay && (!!source.length || !!c.selected?.related.length);
  const editorTitle = memoryRecord
    ? c.selected?.creating
      ? "Add memory"
      : c.draft?.action === "forget"
        ? "Forget memory"
        : c.draft?.action === "remember"
          ? "Restore memory"
          : "Modify memory"
    : c.selected?.title;
  const directory = c.view === "list" && c.topic === "people" && !c.person;
  const browsingAgenda = c.topic === "people" && c.section === "agenda";
  const [agendaDate, setAgendaDate] = useState<string>();
  const agendaEditorHeading = useRef<HTMLHeadingElement>(null);
  const editor = useRef<HTMLElement>(null);
  const editingAgenda = browsingAgenda && c.view === "list" && Boolean(c.selected?.agendaDay);
  useEffect(() => {
    if (!editingAgenda || !c.selected) return;
    agendaEditorHeading.current?.focus({ preventScroll: true });
    agendaEditorHeading.current?.scrollIntoView({ block: "nearest" });
  }, [editingAgenda, c.selected]);
  const openAgendaActivity = (date: string, index: number | "new") => {
    const record = c.records.find((row) => row.agenda?.date === date);
    if (record) void c.open(record.id, { index, token: record.token });
  };
  const agendaDraftStale = c.selected?.agendaDay && c.draft?.agendaToken !== c.selected.token;
  const venueId = c.draft?.values["venue:new"];
  const venue = c.editorFields.find((field) => field.key === "venue:new")?.options?.find((o) => o.value === venueId);
  const fields = c.editorFields.flatMap((field) =>
    field.key !== "zone:new"
      ? [field]
      : venueId
        ? [{ ...field, options: [{ value: "", label: "Choose automatically" }, ...(venue?.zones ?? [])] }]
        : [],
  );
  const inlineError =
    (c.view === "edit" || editingAgenda) &&
    !agendaDraftStale &&
    !memoryReadOnly &&
    fields.some((field) => field.key === c.errorField)
      ? c.errorField
      : undefined;
  useEffect(() => {
    if (inlineError && !c.busy) editor.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
  }, [inlineError, c.error, c.busy]);
  const browsingPlaces = c.view !== "hub" && c.topic === "places" && c.collection === "list";
  let placeItems = c.placeDirectory;
  const placeTrail = [];
  for (const id of c.placePath) {
    const item = placeItems.find((node) => node.id === id);
    if (!item?.children) break;
    placeTrail.push(item);
    placeItems = item.children;
  }
  const showPlacePath = (path: string[]) => {
    c.setPlacePath(path);
    if (c.view !== "list") void c.load();
  };
  const people = (c.index?.people ?? []).filter((p) =>
    c.query
      .toLocaleLowerCase()
      .split(/\s+/u)
      .filter(Boolean)
      .every((word) => p.name.toLocaleLowerCase().includes(word)),
  );
  const display = (value: RepairValue | undefined) =>
    typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "");
  const previewFontId =
    c.view === "edit" && c.selected?.fields.some((f) => f.key === "letterFontId")
      ? display(c.draft?.values.letterFontId)
      : undefined;
  useLetterFont(previewFontId);
  const value = (key: string, next: RepairValue) =>
    c.update({
      values: {
        ...c.draft?.values,
        [key]: next,
        ...(key === "venue:new" ? { "zone:new": "" } : {}),
      },
    });
  return (
    <div className="villages-repair" aria-label="REPAIR">
      <style>{REPAIR_STYLES}</style>
      <header className="repair-chrome">
        <span>Villages</span>
        <strong>REPAIR</strong>
        <button
          type="button"
          disabled={c.busy}
          onClick={() => {
            c.leave();
            onBack();
          }}
        >
          Main menu
        </button>
      </header>
      <nav className="repair-console-nav" aria-label="REPAIR sections">
        <button
          type="button"
          disabled={c.saving}
          aria-current={consoleSection === "records" ? "page" : undefined}
          onClick={c.showHub}
        >
          Find a record
        </button>
        <button
          type="button"
          disabled={c.saving}
          aria-current={consoleSection === "recovery" ? "page" : undefined}
          onClick={() => void c.chooseTopic("progress")}
        >
          Recover work
        </button>
        <button
          type="button"
          disabled={c.saving}
          aria-current={consoleSection === "backups" ? "page" : undefined}
          onClick={() => void c.showHistory()}
        >
          History &amp; backups
        </button>
      </nav>
      <main>
        {browsingPlaces && (placeTrail.length > 0 || c.view !== "list") ? (
          <nav className="repair-links" aria-label="Repair location navigation">
            <button type="button" disabled={c.busy} onClick={() => showPlacePath([])}>
              {topics.places}
            </button>
            {(c.view === "list" ? placeTrail.slice(0, -1) : placeTrail).map((item, i) => (
              <span className="repair-crumb" key={item.id}>
                <span aria-hidden="true">›</span>
                <button type="button" disabled={c.busy} onClick={() => showPlacePath(c.placePath.slice(0, i + 1))}>
                  {item.title}
                </button>
              </span>
            ))}
          </nav>
        ) : null}
        {!browsingPlaces && (c.person || c.view === "edit" || c.view === "review" || c.view === "done") ? (
          <nav className="repair-links" aria-label="Repair record navigation">
            {c.person ? (
              <button type="button" disabled={c.saving} onClick={() => void c.chooseTopic("people")}>
                People
              </button>
            ) : null}
            {c.view !== "list" ? (
              <button
                type="button"
                disabled={c.saving}
                onClick={() =>
                  void (c.collection === "history"
                    ? c.showHistory()
                    : c.collection === "checkpoints"
                      ? c.chooseTopic("restore")
                      : c.person || c.topic === "all"
                        ? c.load()
                        : c.chooseTopic(c.topic))
                }
              >
                {c.collection === "history"
                  ? "Repair history"
                  : c.collection === "checkpoints"
                    ? "Checkpoints"
                    : (c.person?.name ?? currentTopic)}
              </button>
            ) : null}
          </nav>
        ) : null}
        <div className="repair-heading">
          <h1>
            {c.view === "hub"
              ? "Find a record"
              : c.view === "list"
                ? c.person && browsingAgenda
                  ? c.person.name + " · Agenda"
                  : (c.person?.name ?? (browsingPlaces ? placeTrail.at(-1)?.title : null) ?? currentTopic)
                : c.view === "edit"
                  ? editorTitle
                  : c.view === "review"
                    ? addingMemory
                      ? "Add memory"
                      : correctingMemory
                        ? "Review memory correction"
                        : reviewTitle
                    : c.view === "done"
                      ? c.review?.kind === "undo"
                        ? "Changes undone"
                        : isRestore
                          ? "Checkpoint restored"
                          : addingMemory
                            ? "Memory added"
                            : "Changes saved"
                      : c.view === "history"
                        ? "Repair history"
                        : "Checkpoints"}
          </h1>
        </div>
        {c.index?.sceneOpen && onScene ? (
          <div className="repair-links">
            <button
              type="button"
              onClick={() => {
                c.leave();
                onScene();
              }}
              disabled={c.busy}
            >
              Back to Scene
            </button>
          </div>
        ) : null}
        {c.error && !inlineError ? (
          <p role="alert" className="repair-error">
            {c.error}
          </p>
        ) : null}
        {!c.index ? <p role="status">Opening REPAIR…</p> : null}
        {c.view === "hub" ? (
          <>
            <div className="repair-tiles repair-hub-tiles">
              {browseTopics.map((topic) => (
                <RepairTile
                  key={topic}
                  title={topics[topic]}
                  icon={topicIcons[topic]}
                  disabled={c.busy}
                  onClick={() => void c.chooseTopic(topic)}
                />
              ))}
            </div>
            <form
              autoComplete="off"
              className="repair-search"
              onSubmit={(e) => {
                e.preventDefault();
                if (c.query.trim()) void c.chooseTopic("all", c.query.trim());
              }}
            >
              <input
                autoComplete="off"
                type="search"
                aria-label="Search records"
                placeholder="Search records"
                value={c.query}
                onChange={(e) => c.setQuery(e.target.value)}
              />
              <button type="submit" disabled={c.busy || !c.query.trim()}>
                Search
              </button>
            </form>
            {preparation?.status === "failed" ? (
              <footer>
                <span>Initial preparation needs attention</span>
                <button type="button" disabled={c.busy} onClick={() => void c.chooseTopic("progress")}>
                  Review
                </button>
              </footer>
            ) : null}
          </>
        ) : null}
        {c.view === "history" || c.view === "checkpoints" ? (
          <nav className="repair-links" aria-label="History and backups">
            <button
              type="button"
              disabled={c.busy}
              aria-current={c.view === "history" ? "page" : undefined}
              onClick={() => void c.showHistory()}
            >
              Repair history
            </button>
            <button
              type="button"
              disabled={c.busy}
              aria-current={c.view === "checkpoints" ? "page" : undefined}
              onClick={() => void c.chooseTopic("restore")}
            >
              Checkpoints
            </button>
          </nav>
        ) : null}
        {c.view === "list" && browsingPlaces ? (
          <>
            <div className="repair-tiles">
              {placeItems.map((item) => (
                <RepairTile
                  key={item.id}
                  title={item.title}
                  icon={item.icon}
                  summary={item.summary}
                  disabled={c.busy}
                  onClick={() =>
                    item.children
                      ? showPlacePath([...placeTrail.map((node) => node.id), item.id])
                      : void c.open(item.id)
                  }
                />
              ))}
            </div>
            {!c.busy && !c.error && !placeItems.length ? <p>No editable records here.</p> : null}
          </>
        ) : null}
        {c.view === "list" && !browsingPlaces ? (
          <>
            {c.topic === "progress" && preparation?.status === "failed" && onRetryPreparation ? (
              <section className="repair-notice" aria-label="Initial preparation">
                <strong>Initial preparation</strong>
                <p>{preparation.error}</p>
                <button type="button" disabled={c.busy} onClick={() => void onRetryPreparation()}>
                  Retry unfinished work
                </button>
                {preparationProblem ? <p role="alert">{preparationProblem}</p> : null}
              </section>
            ) : null}
            {c.person ? (
              <div className="repair-tiles repair-sections" role="group" aria-label="Villager records">
                <button
                  type="button"
                  disabled={c.busy}
                  aria-pressed={c.section === "memories"}
                  onClick={() => void c.chooseSection("memories")}
                >
                  <VillageIcon name="memory" />
                  Memories
                </button>
                {c.person.hasAgenda ? (
                  <button
                    type="button"
                    disabled={c.busy}
                    aria-pressed={browsingAgenda}
                    onClick={() => void c.chooseSection("agenda")}
                  >
                    <VillageIcon name="calendar" />
                    Agenda
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={c.busy}
                  aria-pressed={c.section === "details"}
                  onClick={() => void c.chooseSection("details")}
                >
                  <VillageIcon name="details" />
                  Details
                </button>
              </div>
            ) : null}
            {!browsingAgenda ? (
              <form
                autoComplete="off"
                className="repair-search"
                onSubmit={(e) => {
                  e.preventDefault();
                  void c.load(c.topic);
                }}
              >
                <input
                  autoComplete="off"
                  type="search"
                  aria-label={directory ? "Search villagers" : "Search repair records"}
                  value={c.query}
                  onChange={(e) => c.setQuery(e.target.value)}
                  placeholder={directory ? "Find a villager…" : "Find a record…"}
                />
                <button type="submit" disabled={c.busy}>
                  Search
                </button>
              </form>
            ) : null}
            {directory ? (
              <div className="repair-tiles">
                {people.map((person) => (
                  <RepairTile
                    title={person.name}
                    icon="people"
                    disabled={c.busy}
                    key={person.id}
                    onClick={() => void c.choosePerson(person)}
                  />
                ))}
                {!c.busy && c.index && !people.length ? <p>No villagers match.</p> : null}
              </div>
            ) : (
              <>
                {c.creation ? (
                  <RepairTile
                    title={c.creation.title}
                    icon="memory"
                    disabled={c.busy}
                    onClick={() => void c.open(c.creation!.id)}
                  />
                ) : null}
                {browsingAgenda && c.records.length ? (
                  <AgendaPlanner
                    days={c.records.flatMap((record) => (record.agenda ? [record.agenda] : []))}
                    date={agendaDate}
                    disabled={c.busy}
                    onDate={(date) => {
                      setAgendaDate(date);
                      c.closeAgendaEditor();
                    }}
                    onActivity={(day, block) => {
                      if (block.repairIndex === undefined) c.closeAgendaEditor();
                      else openAgendaActivity(day.date, block.repairIndex);
                    }}
                    renderDayAction={(day) => (
                      <button type="button" disabled={c.busy} onClick={() => openAgendaActivity(day.date, "new")}>
                        Add activity
                      </button>
                    )}
                  />
                ) : (
                  <div className="repair-records">
                    {c.records.map((r) => (
                      <RepairTile
                        key={r.id}
                        title={r.title}
                        icon={r.agendaDay ? "calendar" : topicIcons[r.topic]}
                        summary={c.topic === "all" ? searchSummary(r) : r.summary}
                        disabled={c.busy}
                        onClick={() => {
                          if (r.agenda) {
                            const resident = c.index?.people.find((person) => person.id === r.agenda!.residentId);
                            if (resident) {
                              setAgendaDate(r.agenda.date);
                              void c.choosePerson(resident, "agenda");
                            }
                          } else void c.open(r.id);
                        }}
                      />
                    ))}
                  </div>
                )}
                {!c.busy && !c.records.length ? <p>No records match.</p> : null}
                {c.total > 50 ? (
                  <footer>
                    <button
                      type="button"
                      disabled={c.busy || !c.offset}
                      onClick={() => void c.load(c.topic, Math.max(0, c.offset - 50))}
                    >
                      Previous
                    </button>
                    <span>
                      {c.total ? `${c.offset + 1}–${Math.min(c.offset + 50, c.total)} of ${c.total}` : "0 records"}
                    </span>
                    <button
                      type="button"
                      disabled={c.busy || c.offset + 50 >= c.total}
                      onClick={() => void c.load(c.topic, c.offset + 50)}
                    >
                      Next
                    </button>
                  </footer>
                ) : null}
              </>
            )}
          </>
        ) : null}
        {(c.view === "edit" || editingAgenda) && c.selected && c.draft ? (
          <div className="repair-layout" data-single={!hasSource}>
            <section ref={editor} className="repair-panel repair-editor" data-agenda={!!c.selected.agendaDay}>
              {editingAgenda ? (
                <h2 tabIndex={-1} ref={agendaEditorHeading}>
                  {c.draft.action === "add-activity" ? "Add activity" : "Edit activity"}
                </h2>
              ) : null}
              {!editingAgenda && c.selected.actions.length > 1 ? (
                <div className="repair-actions" role="group" aria-label="Repair action">
                  {c.selected.actions.map((a) => (
                    <button
                      type="button"
                      key={a.id}
                      aria-pressed={c.draft?.action === a.id}
                      disabled={c.busy}
                      onClick={() => c.update({ action: a.id })}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              ) : null}
              {agendaDraftStale && c.selected.actions.length ? (
                <div className="repair-notice" role="status">
                  <p>This date changed since you started editing.</p>
                  <button
                    type="button"
                    disabled={c.busy}
                    onClick={() =>
                      c.update({
                        agendaToken: c.selected!.token,
                        values: Object.fromEntries(c.editorFields.map((field) => [field.key, field.value])),
                      })
                    }
                  >
                    Discard draft and load this date
                  </button>
                </div>
              ) : null}
              {!agendaDraftStale &&
                fields.map((f) => {
                  const id = `repair-${f.key}`;
                  const invalid = inlineError === f.key;
                  const control = {
                    id,
                    disabled: c.busy,
                    "aria-invalid": invalid || undefined,
                    "aria-describedby": invalid ? `${id}-error` : undefined,
                  };
                  return (
                    <div className="repair-field" key={f.key}>
                      {memoryReadOnly ? (
                        <h2>{f.label}</h2>
                      ) : (
                        <label htmlFor={id}>
                          {c.selected!.agendaDay
                            ? f.label
                                .replace(/ \d+/, "")
                                .replace("Activity start", "Start")
                                .replace("Activity end", "End")
                            : f.label}
                        </label>
                      )}
                      {invalid ? (
                        <p role="alert" id={`${id}-error`} className="repair-error">
                          {c.error}
                        </p>
                      ) : null}
                      {f.key === "letterFontId" ? (
                        <div>
                          <p
                            style={{
                              fontFamily: letterFontFamily(display(c.draft?.values[f.key])),
                              fontSize: "1.25rem",
                              lineHeight: 1.6,
                            }}
                          >
                            Dear friend, I hope this letter finds you well. 123
                          </p>
                        </div>
                      ) : null}
                      {memoryReadOnly ? (
                        <p>{display(f.value)}</p>
                      ) : f.type === "choice" ? (
                        <select
                          {...control}
                          value={display(c.draft?.values[f.key])}
                          onChange={(e) => value(f.key, e.target.value)}
                        >
                          {f.options?.some((option) => option.value === display(c.draft?.values[f.key])) ? null : (
                            <option value={display(c.draft?.values[f.key])} disabled>
                              Choose an option
                            </option>
                          )}
                          {f.options?.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      ) : f.type === "number" ? (
                        <input
                          {...control}
                          autoComplete="off"
                          type="number"
                          min={f.min}
                          max={f.max}
                          step="any"
                          value={display(c.draft?.values[f.key])}
                          onChange={(e) => value(f.key, e.target.value === "" ? "" : Number(e.target.value))}
                        />
                      ) : f.type === "boolean" ? (
                        <input
                          {...control}
                          autoComplete="off"
                          type="checkbox"
                          checked={c.draft?.values[f.key] === true}
                          onChange={(e) => value(f.key, e.target.checked)}
                        />
                      ) : f.type === "clock" ? (
                        <input
                          {...control}
                          autoComplete="off"
                          type="text"
                          placeholder="HH:MM"
                          maxLength={5}
                          value={display(c.draft?.values[f.key])}
                          onChange={(e) => value(f.key, e.target.value)}
                        />
                      ) : (
                        <textarea
                          {...control}
                          autoComplete="off"
                          value={display(c.draft?.values[f.key])}
                          onChange={(e) => value(f.key, e.target.value)}
                        />
                      )}
                    </div>
                  );
                })}
              {c.selected.people ? (
                <fieldset>
                  <legend>
                    {c.selected.creating
                      ? "Who remembers this?"
                      : memoryRecord
                        ? c.draft.action === "forget"
                          ? "Forget for"
                          : c.draft.action === "remember"
                            ? "Restore for"
                            : "Change for"
                        : "Apply to"}
                  </legend>
                  <div className="repair-audience">
                    {c.selected.people.map((p) => (
                      <label key={p.id}>
                        <input
                          autoComplete="off"
                          type="checkbox"
                          disabled={c.busy}
                          checked={c.draft?.knowers.includes(p.id)}
                          onChange={(e) =>
                            c.update({
                              knowers: e.target.checked
                                ? [...c.draft!.knowers, p.id]
                                : c.draft!.knowers.filter((k) => k !== p.id),
                            })
                          }
                        />
                        {p.name}
                        {p.forgotten ? " (forgotten)" : ""}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : null}
              <div className="repair-buttons">
                <button
                  type="button"
                  disabled={c.busy}
                  onClick={() => (editingAgenda ? c.closeAgendaEditor() : void c.load(c.topic))}
                >
                  {editingAgenda ? "Close" : "Back to records"}
                </button>
                {c.selected.actions.length && !agendaDraftStale ? (
                  <button type="button" className="repair-primary" disabled={c.busy} onClick={() => void c.prepare()}>
                    {reviewTitle}
                  </button>
                ) : null}
              </div>
            </section>
            {hasSource ? (
              <aside className="repair-source">
                {source.length ? (
                  <section className="repair-panel">
                    <h2>Source</h2>
                    {source.map((s, i) => (
                      <blockquote key={i}>{s}</blockquote>
                    ))}
                  </section>
                ) : null}
                {c.selected.related.length ? (
                  <section className="repair-panel">
                    <h2>Related records</h2>
                    {c.selected.related.map((r) => (
                      <p key={r.id}>
                        <button type="button" disabled={c.busy} onClick={() => void c.open(r.id)}>
                          {r.title}
                        </button>
                      </p>
                    ))}
                  </section>
                ) : null}
              </aside>
            ) : null}
          </div>
        ) : null}
        {c.view === "review" && c.review ? (
          <>
            {!c.review.memory ? <p className="repair-muted">{c.review.title}</p> : null}
            {addingMemory ? (
              <section className="repair-panel repair-addition" aria-label="Memory to add">
                <h2>Memory</h2>
                <p>{c.review.changes[0]?.after}</p>
              </section>
            ) : (
              c.review.changes.map((change, i) => (
                <section key={i} className="repair-comparison" aria-label={change.label}>
                  <h2>{change.label}</h2>
                  <div>
                    <small>Before</small>
                    <p>{change.before || "None"}</p>
                  </div>
                  <div>
                    <small>After</small>
                    <p>
                      <strong>{change.after || "None"}</strong>
                    </p>
                  </div>
                </section>
              ))
            )}
            <div className="repair-review-meta">
              <section aria-labelledby="repair-affected">
                <h2 id="repair-affected">
                  {c.review.memory ? (addingMemory ? "Who remembers this?" : "Applies to") : "Affected records"}
                </h2>
                <ul className={c.review.memory ? "repair-review-people" : undefined}>
                  {(c.review.memory?.people ?? c.review.affected).map((effect, i) => (
                    <li key={i}>{effect}</li>
                  ))}
                </ul>
              </section>
              <aside className="repair-muted">
                <p>
                  {c.review.checkpoint
                    ? "A checkpoint will be saved."
                    : c.review.undoAvailable
                      ? "Undo available in Repair history."
                      : "Undo unavailable."}
                </p>
                {c.review.related.map((r) => (
                  <p key={r.id}>{r.title} · Separate repair</p>
                ))}
              </aside>
            </div>
            {source.length ? (
              <details className="repair-review-source">
                <summary>Source</summary>
                {source.map((excerpt, i) => (
                  <blockquote key={i}>{excerpt}</blockquote>
                ))}
              </details>
            ) : null}
            {isRestore ? (
              <label className="repair-confirm">
                <input
                  autoComplete="off"
                  type="checkbox"
                  checked={c.restoreAcknowledged}
                  disabled={c.busy}
                  onChange={(e) => c.setRestoreAcknowledged(e.target.checked)}
                />{" "}
                Replace Village progress with this checkpoint
              </label>
            ) : null}
            <div className="repair-buttons">
              <button type="button" disabled={c.busy} onClick={c.backFromReview}>
                Back
              </button>
              <button
                type="button"
                className="repair-primary"
                disabled={c.busy || (isRestore && !c.restoreAcknowledged)}
                onClick={() => void c.apply()}
              >
                {c.busy
                  ? "Saving…"
                  : isRestore
                    ? "Restore checkpoint"
                    : addingMemory
                      ? "Add memory"
                      : c.review.kind === "undo"
                        ? "Undo changes"
                        : forgettingMemory
                          ? "Forget memory"
                          : restoringMemory
                            ? "Restore memory"
                            : correctingMemory
                              ? "Save correction"
                              : "Save changes"}
              </button>
            </div>
          </>
        ) : null}
        {c.view === "done" ? (
          <section className="repair-done">
            {!c.review?.memory ? <p>{c.review?.title}</p> : null}
            {c.preservedDraft ? (
              <div className="repair-panel">
                <h2>Kept Scene draft · {c.preservedDraft.title}</h2>
                <textarea autoComplete="off" aria-label="Kept Scene draft" readOnly value={c.preservedDraft.text} />
              </div>
            ) : null}
            <div className="repair-buttons">
              <button type="button" disabled={c.busy} onClick={() => void c.showHistory()}>
                View repair history
              </button>
              <button
                type="button"
                className="repair-primary"
                disabled={c.busy}
                onClick={() => {
                  if (browsingAgenda) {
                    c.closeAgendaEditor();
                    void c.load();
                  } else c.showHub();
                }}
              >
                {browsingAgenda ? "Back to Agenda" : "Back to REPAIR"}
              </button>
            </div>
          </section>
        ) : null}
        {c.view === "history" ? (
          <div className="repair-panel">
            {c.index?.history.length ? (
              c.index.history.map((h) => (
                <section key={h.id} className="repair-history-entry">
                  <div>
                    <h2>
                      {h.title}
                      {h.undone ? " · Undone" : ""}
                    </h2>
                    <small>{new Date(h.at).toLocaleString()}</small>
                    {h.changes.map((change, i) => (
                      <div key={i} className="repair-history-change">
                        <strong>{change.label}</strong>
                        <p>
                          {change.before || "None"} → {change.after || "None"}
                        </p>
                      </div>
                    ))}
                  </div>
                  {h.canUndo && !h.undone ? (
                    <button type="button" disabled={c.busy} onClick={() => void c.undo(h.id)}>
                      Review undo
                    </button>
                  ) : null}
                </section>
              ))
            ) : (
              <p>No repairs yet.</p>
            )}
            {(c.index?.historyTotal ?? 0) > 50 ? (
              <div className="repair-buttons">
                <button
                  type="button"
                  disabled={c.busy || !c.index?.historyOffset}
                  onClick={() => void c.historyPage(Math.max(0, (c.index?.historyOffset ?? 0) - 50))}
                >
                  Newer repairs
                </button>
                <span>
                  {(c.index?.historyOffset ?? 0) + 1}–
                  {Math.min((c.index?.historyOffset ?? 0) + 50, c.index?.historyTotal ?? 0)} of {c.index?.historyTotal}
                </span>
                <button
                  type="button"
                  disabled={c.busy || (c.index?.historyOffset ?? 0) + 50 >= (c.index?.historyTotal ?? 0)}
                  onClick={() => void c.historyPage((c.index?.historyOffset ?? 0) + 50)}
                >
                  Older repairs
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
        {c.view === "checkpoints" ? (
          <>
            <form
              autoComplete="off"
              className="repair-search"
              onSubmit={(e) => {
                e.preventDefault();
                void c.saveCheckpoint();
              }}
            >
              <input
                autoComplete="off"
                aria-label="Checkpoint name"
                value={c.checkpointTitle}
                placeholder="Checkpoint name"
                disabled={c.busy}
                onChange={(e) => c.setCheckpointTitle(e.target.value)}
                maxLength={120}
              />
              <button type="submit" disabled={c.busy}>
                Save checkpoint
              </button>
            </form>
            <div className="repair-records">
              {c.index?.checkpoints.map((p) => (
                <section key={p.id} className="repair-panel">
                  <h2>{p.title}</h2>
                  <p className="repair-muted">
                    {new Date(p.at).toLocaleString()} · {p.mode === "automatic" ? "Automatic" : "Manual"}
                  </p>
                  <div className="repair-buttons">
                    <button type="button" disabled={c.busy || c.index?.sceneOpen} onClick={() => void c.restore(p.id)}>
                      Review restoration
                    </button>
                    {p.mode === "manual" ? (
                      <button type="button" disabled={c.busy} onClick={() => void c.deleteCheckpoint(p.id, p.token)}>
                        Delete checkpoint
                      </button>
                    ) : null}
                  </div>
                </section>
              ))}
            </div>
            {(c.index?.checkpointTotal ?? 0) > 50 ? (
              <div className="repair-buttons">
                <button
                  type="button"
                  disabled={c.busy || !c.index?.checkpointOffset}
                  onClick={() => void c.checkpointPage(Math.max(0, (c.index?.checkpointOffset ?? 0) - 50))}
                >
                  Previous
                </button>
                <span>
                  {(c.index?.checkpointOffset ?? 0) + 1}–
                  {Math.min((c.index?.checkpointOffset ?? 0) + 50, c.index?.checkpointTotal ?? 0)} of{" "}
                  {c.index?.checkpointTotal}
                </span>
                <button
                  type="button"
                  disabled={c.busy || (c.index?.checkpointOffset ?? 0) + 50 >= (c.index?.checkpointTotal ?? 0)}
                  onClick={() => void c.checkpointPage((c.index?.checkpointOffset ?? 0) + 50)}
                >
                  Next
                </button>
              </div>
            ) : null}
            {c.index?.sceneOpen ? <p role="status">Conclude the Scene to restore.</p> : null}
          </>
        ) : null}
        {c.busy && c.view !== "review" ? <p role="status">Working…</p> : null}
      </main>
    </div>
  );
}
