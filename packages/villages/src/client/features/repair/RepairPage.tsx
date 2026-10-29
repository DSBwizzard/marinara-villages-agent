import { useLetterFont, letterFontFamily } from "../../shared/letter-font-css.js";
import type { RepairTopic, RepairValue } from "../../../shared/contracts/repair.js";
import type { RepairController } from "./useRepairController.js";
import { REPAIR_STYLES } from "./repair-styles.js";
const topics: { id: RepairTopic; name: string; description: string }[] = [
  { id: "memories", name: "Memories", description: "Edit, add, or forget a memory." },
  { id: "people", name: "People", description: "Villagers, their memories, and character details." },
  { id: "places", name: "Places", description: "Venues, Zones, homes, and access." },
  { id: "world", name: "World & history", description: "Setting, founding details, and Scene corrections." },
  { id: "progress", name: "Progress", description: "Wishes, Projects, Pursuits, and saved work." },
  { id: "restore", name: "Backups & repairs", description: "Review repairs, undo, or restore a checkpoint." },
];
export function RepairPage({
  controller: c,
  onBack,
  onScene,
}: {
  controller: RepairController;
  onBack(): void;
  onScene?: () => void;
}) {
  const currentTopic = topics.find((t) => t.id === c.topic)!;
  const isRestore = c.review?.kind === "restore";
  const addingMemory = c.review?.memory?.creating === true;
  const memoryRecord = c.selected?.topic === "memories";
  const forgettingMemory = memoryRecord && c.draft?.action === "forget";
  const restoringMemory = memoryRecord && c.draft?.action === "remember";
  const memoryReadOnly = forgettingMemory || restoringMemory;
  const reviewTitle = forgettingMemory
    ? "Review forgetting"
    : restoringMemory
      ? "Review restoration"
      : "Review changes";
  const source = [...new Set(c.selected?.source ?? [])].filter(
    (excerpt) => !c.selected?.fields.some((field) => String(field.value).trim() === excerpt.trim()),
  );
  const hasSource = !!source.length || !!c.selected?.related.length;
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
  const value = (key: string, next: RepairValue) => c.update({ values: { ...c.draft?.values, [key]: next } });
  return (
    <div className="villages-repair" aria-label="REPAIR">
      <style>{REPAIR_STYLES}</style>
      <header className="repair-chrome">
        <span>Villages</span>
        <button type="button" disabled={c.busy} onClick={onBack}>
          Main menu
        </button>
      </header>
      <main>
        {c.view !== "hub" ? (
          <nav aria-label="Repair navigation">
            <button type="button" disabled={c.saving} onClick={c.showHub}>
              REPAIR
            </button>
            <span>›</span>
            <button
              type="button"
              disabled={c.saving}
              onClick={() =>
                void (c.collection === "history"
                  ? c.showHistory()
                  : c.chooseTopic(c.collection === "checkpoints" ? "restore" : c.topic))
              }
            >
              {c.collection === "history"
                ? "Repair history"
                : c.collection === "checkpoints"
                  ? "Backups & repairs"
                  : currentTopic.name}
            </button>
            {c.person ? (
              <>
                <span>›</span>
                <button type="button" disabled={c.busy} onClick={() => void c.load()}>
                  {c.person.name}
                </button>
              </>
            ) : null}
          </nav>
        ) : null}
        <div className="repair-heading">
          <h1>
            {c.view === "hub"
              ? "REPAIR"
              : c.view === "list"
                ? (c.person?.name ?? currentTopic.name)
                : c.view === "edit"
                  ? editorTitle
                  : c.view === "review"
                    ? addingMemory
                      ? "Add memory"
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
                        : "Backups & repairs"}
          </h1>
        </div>
        {c.view === "hub" ? <p className="repair-muted">Choose what needs correcting.</p> : null}
        {c.index?.sceneOpen ? (
          <div className="repair-notice">
            Scene in progress · Repairs preserve its captured context and draft.{" "}
            {onScene ? (
              <button type="button" onClick={onScene} disabled={c.busy}>
                Back to Scene
              </button>
            ) : null}
          </div>
        ) : null}
        {c.error ? (
          <p role="alert" className="repair-error">
            {c.error}
          </p>
        ) : null}
        {!c.index ? <p role="status">Opening REPAIR…</p> : null}
        {c.view === "hub" ? (
          <>
            <div className="repair-grid">
              {topics.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  className="repair-tile"
                  disabled={c.busy}
                  onClick={() => {
                    void c.chooseTopic(t.id);
                  }}
                >
                  <strong>{t.name}</strong>
                  <span>{t.description}</span>
                </button>
              ))}
            </div>
            <footer>
              <button type="button" disabled={c.busy} onClick={() => void c.showHistory()}>
                Repair history
              </button>
            </footer>
          </>
        ) : null}
        {c.view === "list" ? (
          <>
            {c.person ? (
              <div className="repair-actions" role="group" aria-label="Villager records">
                <button
                  type="button"
                  disabled={c.busy}
                  aria-pressed={c.section === "memories"}
                  onClick={() => void c.chooseSection("memories")}
                >
                  Memories
                </button>
                <button
                  type="button"
                  disabled={c.busy}
                  aria-pressed={c.section === "details"}
                  onClick={() => void c.chooseSection("details")}
                >
                  Details
                </button>
              </div>
            ) : null}
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
            {directory ? (
              <div className="repair-people">
                {people.map((person) => (
                  <button
                    type="button"
                    className="repair-person"
                    disabled={c.busy}
                    key={person.id}
                    onClick={() => void c.choosePerson(person)}
                  >
                    {person.name}
                  </button>
                ))}
                {!c.busy && c.index && !people.length ? <p>No villagers match.</p> : null}
              </div>
            ) : (
              <>
                {c.creation ? (
                  <button type="button" disabled={c.busy} onClick={() => void c.open(c.creation!.id)}>
                    {c.creation.title}
                  </button>
                ) : null}
                <div className="repair-records">
                  {c.records.map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      className="repair-record"
                      disabled={c.busy}
                      onClick={() => void c.open(r.id)}
                    >
                      <strong>{r.title}</strong>
                      {r.summary ? <small>{r.summary}</small> : null}
                    </button>
                  ))}
                </div>
                {!c.busy && !c.records.length ? <p>No records match.</p> : null}
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
              </>
            )}
          </>
        ) : null}
        {c.view === "edit" && c.selected && c.draft ? (
          <div className="repair-layout" data-single={!hasSource}>
            <section className="repair-panel repair-editor">
              {c.selected.actions.length > 1 ? (
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
              {c.selected.fields.map((f) => (
                <div className="repair-field" key={f.key}>
                  {memoryReadOnly ? <h2>{f.label}</h2> : <label htmlFor={`repair-${f.key}`}>{f.label}</label>}
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
                      id={`repair-${f.key}`}
                      disabled={c.busy}
                      value={display(c.draft?.values[f.key])}
                      onChange={(e) => value(f.key, e.target.value)}
                    >
                      {f.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "number" ? (
                    <input
                      autoComplete="off"
                      id={`repair-${f.key}`}
                      type="number"
                      min={f.min}
                      max={f.max}
                      step="any"
                      disabled={c.busy}
                      value={display(c.draft?.values[f.key])}
                      onChange={(e) => value(f.key, e.target.value === "" ? "" : Number(e.target.value))}
                    />
                  ) : f.type === "boolean" ? (
                    <input
                      autoComplete="off"
                      id={`repair-${f.key}`}
                      type="checkbox"
                      disabled={c.busy}
                      checked={c.draft?.values[f.key] === true}
                      onChange={(e) => value(f.key, e.target.checked)}
                    />
                  ) : (
                    <textarea
                      autoComplete="off"
                      id={`repair-${f.key}`}
                      disabled={c.busy}
                      value={display(c.draft?.values[f.key])}
                      onChange={(e) => value(f.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
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
                <button type="button" disabled={c.busy} onClick={() => void c.load(c.topic)}>
                  Back to records
                </button>
                <button type="button" className="repair-primary" disabled={c.busy} onClick={() => void c.prepare()}>
                  {reviewTitle}
                </button>
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
                    <small>Requires its own review.</small>
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
                    <p>{change.after || "None"}</p>
                  </div>
                </section>
              ))
            )}
            <div className="repair-layout">
              <section className="repair-panel">
                <h2>{c.review.memory ? (addingMemory ? "Who remembers this?" : "Applies to") : "Affected records"}</h2>
                <ul>
                  {(c.review.memory?.people ?? c.review.affected).map((effect, i) => (
                    <li key={i}>{effect}</li>
                  ))}
                </ul>
              </section>
              <aside className="repair-panel">
                <h2>{c.review.checkpoint ? "Checkpoint" : "Undo"}</h2>
                <p>
                  {c.review.checkpoint
                    ? "Created before saving."
                    : c.review.undoAvailable
                      ? "Available in Repair history."
                      : "Unavailable for this action."}
                </p>
                {c.review.related.map((r) => (
                  <p key={r.id}>{r.title} · Separate repair</p>
                ))}
              </aside>
            </div>
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
              <button type="button" className="repair-primary" disabled={c.busy} onClick={c.showHub}>
                Back to REPAIR
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
            <small>Undo checks for later changes before restoring previous values.</small>
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
            <button type="button" onClick={() => void c.showHistory()} disabled={c.busy}>
              Repair history
            </button>
            <div className="repair-records">
              {c.index?.checkpoints.map((p) => (
                <section key={p.id} className="repair-panel">
                  <h2>{p.title}</h2>
                  <p className="repair-muted">
                    {new Date(p.at).toLocaleString()} · {p.records} saved records
                  </p>
                  <button type="button" disabled={c.busy || c.index?.sceneOpen} onClick={() => void c.restore(p.id)}>
                    Review restoration
                  </button>
                </section>
              ))}
            </div>
            <p className="repair-muted">
              Whole-world restoration requires a concluded Scene. Current time, spending records and purchased responses
              are retained.
            </p>
          </>
        ) : null}
        {c.busy && c.view !== "review" ? <p role="status">Working…</p> : null}
      </main>
    </div>
  );
}
