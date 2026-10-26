import type { RepairTopic, RepairValue } from "../../../shared/contracts/repair.js";
import type { RepairController } from "./useRepairController.js";
import { REPAIR_STYLES } from "./repair-styles.js";
const topics: { id: RepairTopic; name: string; description: string }[] = [
  { id: "memories", name: "Memories", description: "Correct, forget, or record a missing detail." },
  { id: "people", name: "People", description: "Character context, relationships, and routines." },
  { id: "places", name: "Places", description: "Venues, Zones, objects, homes, and access." },
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
  const display = (value: RepairValue | undefined) =>
    typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "");
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
            <button type="button" disabled={c.busy} onClick={() => c.setView("hub")}>
              REPAIR
            </button>
            <span>›</span>
            <button type="button" disabled={c.busy} onClick={() => void c.load(c.topic)}>
              {currentTopic.name}
            </button>
          </nav>
        ) : null}
        <h1>
          {c.view === "hub"
            ? "REPAIR"
            : c.view === "list"
              ? currentTopic.name
              : c.view === "edit"
                ? c.selected?.title
                : c.view === "review"
                  ? "Review repair"
                  : c.view === "done"
                    ? "Repair applied"
                    : c.view === "history"
                      ? "Repair history"
                      : "Backups & repairs"}
        </h1>
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
                    c.setQuery("");
                    void c.load(t.id, 0, "");
                  }}
                >
                  <strong>{t.name}</strong>
                  <span>{t.description}</span>
                </button>
              ))}
            </div>
            <footer>
              <label>
                <input
                  autoComplete="off"
                  type="checkbox"
                  checked={c.inspection}
                  disabled={c.busy}
                  onChange={(e) => c.setInspection(e.target.checked)}
                />{" "}
                Inspect private records · spoilers
              </label>
              <button type="button" onClick={() => c.setView("history")}>
                Repair history
              </button>
            </footer>
          </>
        ) : null}
        {c.view === "list" ? (
          <>
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
                aria-label="Search repair records"
                value={c.query}
                onChange={(e) => c.setQuery(e.target.value)}
                placeholder="Find a record…"
              />
              <button type="submit" disabled={c.busy}>
                Search
              </button>
            </form>
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
                  <small>{r.summary}</small>
                </button>
              ))}
            </div>
            {!c.busy && !c.records.length ? (
              <p>
                No records match.
                {!c.inspection ? " Private records are available through Inspect on the REPAIR menu." : ""}
              </p>
            ) : null}
            <footer>
              <button
                type="button"
                disabled={c.busy || !c.offset}
                onClick={() => void c.load(c.topic, Math.max(0, c.offset - 50))}
              >
                Previous
              </button>
              <span>{c.total ? `${c.offset + 1}–${Math.min(c.offset + 50, c.total)} of ${c.total}` : "0 records"}</span>
              <button
                type="button"
                disabled={c.busy || c.offset + 50 >= c.total}
                onClick={() => void c.load(c.topic, c.offset + 50)}
              >
                Next
              </button>
            </footer>
          </>
        ) : null}
        {c.view === "edit" && c.selected && c.draft ? (
          <div className="repair-layout">
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
                  <label htmlFor={`repair-${f.key}`}>{f.label}</label>
                  <div className="repair-current">
                    <small>Current</small>
                    <p>{display(f.value) || "None"}</p>
                  </div>
                  {f.type === "choice" ? (
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
                      disabled={c.busy || c.draft.action === "forget" || c.draft.action === "remember"}
                      value={display(c.draft?.values[f.key])}
                      onChange={(e) => value(f.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
              {c.selected.people ? (
                <fieldset>
                  <legend>Apply to</legend>
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
                      </label>
                    ))}
                  </div>
                  {c.selected.people
                    .filter((p) => c.draft?.knowers.includes(p.id) && p.text !== undefined)
                    .map((p) => (
                      <p key={p.id} className="repair-current">
                        <small>
                          {p.name} · Current{p.forgotten ? " · Forgotten" : ""}
                        </small>
                        <br />
                        {p.text}
                      </p>
                    ))}
                </fieldset>
              ) : null}
              <div className="repair-buttons">
                <button type="button" disabled={c.busy} onClick={() => void c.load(c.topic)}>
                  Back to records
                </button>
                <button type="button" className="repair-primary" disabled={c.busy} onClick={() => void c.prepare()}>
                  Review repair
                </button>
              </div>
            </section>
            <aside className="repair-source">
              <section className="repair-panel">
                <h2>Source</h2>
                {c.selected.source.length ? (
                  c.selected.source.map((s, i) => <blockquote key={i}>{s}</blockquote>)
                ) : (
                  <p>Player-authored record</p>
                )}
              </section>
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
          </div>
        ) : null}
        {c.view === "review" && c.review ? (
          <>
            <p className="repair-muted">{c.review.title}</p>
            {c.review.changes.map((change, i) => (
              <section key={i} className="repair-comparison" aria-label={change.label}>
                <div>
                  <small>{change.label} · Before</small>
                  <p>{change.before || "None"}</p>
                </div>
                <div>
                  <small>After</small>
                  <p>{change.after || "None"}</p>
                </div>
              </section>
            ))}
            <div className="repair-layout">
              <section className="repair-panel">
                <h2>What this affects</h2>
                <ul>
                  {c.review.affected.map((effect, i) => (
                    <li key={i}>{effect}</li>
                  ))}
                </ul>
              </section>
              <aside className="repair-panel">
                <h2>Recovery</h2>
                <p>
                  {c.review.checkpoint
                    ? "Creates a checkpoint before applying."
                    : c.review.undoAvailable
                      ? "Previous values are saved for safe undo."
                      : "This action has no direct undo. Saved evidence is retained."}
                </p>
                <small>No model request.</small>
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
              <button type="button" disabled={c.busy} onClick={() => c.setView(c.selected ? "edit" : "checkpoints")}>
                Back
              </button>
              <button
                type="button"
                className="repair-primary"
                disabled={c.busy || (isRestore && !c.restoreAcknowledged)}
                onClick={() => void c.apply()}
              >
                {c.busy ? "Saving…" : isRestore ? "Restore checkpoint" : "Apply repair"}
              </button>
            </div>
          </>
        ) : null}
        {c.view === "done" ? (
          <section className="repair-done">
            <p>{c.review?.title}</p>
            <p className="repair-muted">Saved with its previous values and selected scope.</p>
            {c.preservedDraft ? (
              <div className="repair-panel">
                <h2>Kept Scene draft · {c.preservedDraft.title}</h2>
                <textarea autoComplete="off" aria-label="Kept Scene draft" readOnly value={c.preservedDraft.text} />
              </div>
            ) : null}
            <div className="repair-buttons">
              <button type="button" onClick={() => c.setView("history")}>
                View repair history
              </button>
              <button type="button" className="repair-primary" onClick={() => c.setView("hub")}>
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
            <button type="button" onClick={() => c.setView("history")} disabled={c.busy}>
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
