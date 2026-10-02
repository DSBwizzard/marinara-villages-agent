import { useEffect, useState } from "react";
import type {
  StudioData,
  StudioLibraryItem,
  StudioPublication,
  StudioView,
} from "../../server/src/services/villages/sprite-studio-model.js";

type Request = <T>(path: string, init?: RequestInit) => Promise<T>;
type Props = {
  characterId: string;
  request: Request;
  data: StudioData;
  onData: (data: StudioData) => void;
  onSaved: (result: { studio: StudioData; snapshot: unknown }) => void;
  mode: "adopt" | "publish";
};
const identifier = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6]! & 15) | 64;
  bytes[8] = (bytes[8]! & 63) | 128;
  const h = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};

export function SpriteCharacterLibrary({ characterId, request, data, onData, onSaved, mode }: Props) {
  const base = `/villagers/${encodeURIComponent(characterId)}/sprites/studio/`;
  const [library, setLibrary] = useState<StudioLibraryItem[]>([]);
  const [selected, setSelected] = useState<Record<string, { label: string; view: StudioView }>>({});
  const [cutouts, setCutouts] = useState<Record<string, { name: string; action: string }>>({});
  const [publication, setPublication] = useState<StudioPublication | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [adoptionId, setAdoptionId] = useState(identifier);
  const call = <T,>(action: string, body: unknown = {}) =>
    request<T>(base + action, { method: "POST", body: JSON.stringify(body) });
  const perform = async (action: () => Promise<void>) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Artwork could not be saved.");
      try {
        onData(await request<StudioData>(base.slice(0, -1)));
      } catch {
        /* Keep visible receipts. */
      }
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    if (mode !== "adopt") return;
    let stopped = false;
    void request<{ items: StudioLibraryItem[]; error: string }>(base + "character-library", {
      method: "POST",
      body: "{}",
    })
      .then((answer) => {
        if (!stopped) {
          setLibrary(answer.items);
          setError(answer.error);
        }
      })
      .catch(() => {
        if (!stopped) setError("The character library is unavailable. Saved Studio artwork remains available.");
      });
    return () => {
      stopped = true;
    };
  }, [base, request, mode]);
  const refresh = async () => {
    const answer = await call<{ items: StudioLibraryItem[]; error: string }>("character-library");
    setLibrary(answer.items);
    setSelected({});
    setAdoptionId(identifier());
    setError(answer.error);
  };
  const candidates = data.jobs
    .flatMap((job) => job.sheets.flatMap((sheet) => sheet.cells))
    .filter((cell) => cell.rendered && cell.status !== "discarded" && cell.validation?.status !== "blocked");
  const plan = async (items: unknown[], restoreOf?: string) => {
    setPublication(await call<StudioPublication>(restoreOf ? "restore-plan" : "publish-plan", { items, restoreOf }));
  };
  const save = async () => {
    if (!publication) return;
    const next = await call<StudioData>("publish", { id: publication.id, token: publication.token });
    onData(next);
    setPublication(next.publications?.find((item) => item.id === publication.id) ?? null);
    setNotice("Publication status updated. Only items marked Saved are confirmed in the character library.");
  };
  return (
    <section className="vss-panel" aria-label={mode === "adopt" ? "Character library" : "Save to character"}>
      <h3>{mode === "adopt" ? "Character library" : "Save to character"}</h3>
      {error ? <p role="alert">{error}</p> : null}
      {notice ? <p role="status">{notice}</p> : null}
      {mode === "adopt" ? (
        <>
          <p>Use existing full-body character art. Villages keeps an adopted copy when the character card changes.</p>
          <button disabled={busy} onClick={() => void perform(refresh)}>
            Refresh character library
          </button>
          {!library.length && !error ? <p>No supported full-body sprites on this character.</p> : null}
          <div className="vss-grid">
            {library.map((item) => {
              const mapping = selected[item.filename];
              const active = data.assignments.some(
                (assignment) =>
                  assignment.view === (mapping?.view ?? item.view) &&
                  data.expressions.some(
                    (slot) => slot.id === assignment.expressionId && slot.label === (mapping?.label ?? item.label),
                  ),
              );
              return (
                <div className="vss-character-card" key={item.filename}>
                  <img src={item.url} alt={item.expression} style={{ width: 96, height: 144, objectFit: "contain" }} />
                  <label>
                    <input
                      type="checkbox"
                      checked={!!mapping}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        setAdoptionId(identifier());
                        setSelected((prior) => {
                          const next = { ...prior };
                          if (checked) next[item.filename] = { label: item.label, view: item.view };
                          else delete next[item.filename];
                          return next;
                        });
                      }}
                    />
                    {item.filename}
                  </label>
                  {mapping ? (
                    <>
                      <label>
                        Expression
                        <input
                          maxLength={40}
                          value={mapping.label}
                          onChange={(event) => {
                            setAdoptionId(identifier());
                            setSelected({ ...selected, [item.filename]: { ...mapping, label: event.target.value } });
                          }}
                        />
                      </label>
                      <label>
                        View
                        <select
                          aria-label={"Character artwork view · " + item.filename}
                          value={mapping.view}
                          onChange={(event) => {
                            setAdoptionId(identifier());
                            setSelected({
                              ...selected,
                              [item.filename]: { ...mapping, view: event.target.value as StudioView },
                            });
                          }}
                        >
                          <option value="front">Front</option>
                          <option value="side">Side</option>
                        </select>
                      </label>
                      {active ? <small>Replaces this Villages assignment</small> : null}
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
          <button
            className="vss-primary"
            disabled={busy || !Object.keys(selected).length}
            onClick={() =>
              void perform(async () => {
                const items = library
                  .filter((item) => selected[item.filename])
                  .map((item) => ({ filename: item.filename, sha256: item.sha256, ...selected[item.filename] }));
                onSaved(
                  await call<{ studio: StudioData; snapshot: unknown }>("adopt-character", {
                    submissionId: adoptionId,
                    items,
                  }),
                );
                setNotice("Selected character artwork is now in use in Villages.");
              })
            }
          >
            Use selected
          </button>
        </>
      ) : (
        <>
          <p>
            Choose saved cutouts to publish as named full-body sprites. Engine does not store Villages’ view assignments
            or expression meanings.
          </p>
          <div className="vss-grid">
            {candidates.map((cell) => (
              <div className="vss-character-card" key={cell.id}>
                <img
                  src={cell.rendered!.url}
                  alt={`${cell.view} ${cell.label}`}
                  style={{ width: 96, height: 144, objectFit: "contain" }}
                />
                <label>
                  <input
                    type="checkbox"
                    checked={!!cutouts[cell.id]}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setPublication(null);
                      setCutouts((prior) => {
                        const next = { ...prior };
                        if (checked)
                          next[cell.id] = {
                            name: `full_${cell.label}${cell.view === "side" ? "_side" : ""}`,
                            action: "rename",
                          };
                        else delete next[cell.id];
                        return next;
                      });
                    }}
                  />
                  {cell.label} · {cell.view}
                </label>
                {cutouts[cell.id] ? (
                  <label>
                    Character sprite name
                    <input
                      value={cutouts[cell.id]!.name}
                      onChange={(event) => {
                        setPublication(null);
                        setCutouts({ ...cutouts, [cell.id]: { ...cutouts[cell.id]!, name: event.target.value } });
                      }}
                    />
                  </label>
                ) : null}
              </div>
            ))}
          </div>
          <button
            disabled={busy || !Object.keys(cutouts).length}
            onClick={() =>
              void perform(() => plan(Object.entries(cutouts).map(([cellId, item]) => ({ cellId, ...item }))))
            }
          >
            Review saving to character
          </button>
        </>
      )}
      {publication ? (
        <div aria-label="Publication review">
          <h4>{publication.restoreOf ? "Restore replaced artwork" : "Review character sprites"}</h4>
          {publication.items.map((item, index) => (
            <div className="vss-panel" key={index}>
              <img
                src={item.sourceUrl}
                alt={`New ${item.name}`}
                style={{ width: 96, height: 144, objectFit: "contain" }}
              />
              <strong>
                {item.name} · {item.status}
              </strong>
              {item.error ? <p>{item.error}</p> : null}
              {item.expected.length ? (
                <>
                  <p>Existing artwork with this name:</p>
                  {item.expected.map((file) => (
                    <img
                      key={file.filename}
                      src={`/api/sprites/${encodeURIComponent(characterId)}/file/${encodeURIComponent(file.filename)}`}
                      alt={`Existing ${file.filename}`}
                      style={{ width: 96, height: 144, objectFit: "contain" }}
                    />
                  ))}
                </>
              ) : null}
              <label>
                Action
                <select
                  disabled={busy || item.status === "saved"}
                  value={item.action}
                  onChange={(event) =>
                    setPublication({
                      ...publication,
                      token: "",
                      items: publication.items.map((row, i) =>
                        i === index ? { ...row, action: event.target.value as typeof item.action } : row,
                      ),
                    })
                  }
                >
                  <option value="rename">{item.expected.length ? "Rename new sprite" : "Save with this name"}</option>
                  <option value="replace">Replace · keep backup</option>
                  <option value="skip">Skip</option>
                </select>
              </label>
              {item.action === "rename" ? (
                <label>
                  New name
                  <input
                    value={item.name}
                    disabled={busy || item.status === "saved"}
                    onChange={(event) =>
                      setPublication({
                        ...publication,
                        token: "",
                        items: publication.items.map((row, i) =>
                          i === index ? { ...row, name: event.target.value } : row,
                        ),
                      })
                    }
                  />
                </label>
              ) : null}
            </div>
          ))}
          {!publication.token ? (
            <button
              disabled={busy}
              onClick={() =>
                void perform(() =>
                  plan(
                    publication.items.map((item) => ({
                      cellId: item.cellId,
                      backupUrl: publication.restoreOf ? item.sourceUrl : undefined,
                      name: item.name,
                      action: item.action,
                    })),
                    publication.restoreOf,
                  ),
                )
              }
            >
              Review updated names and conflicts
            </button>
          ) : (
            <button
              className="vss-primary"
              disabled={
                busy ||
                publication.items.every((item) => item.status === "saved" || item.status === "skipped") ||
                publication.items.some(
                  (item) => item.status !== "saved" && item.action === "rename" && item.expected.length,
                )
              }
              onClick={() => void perform(save)}
            >
              {publication.restoreOf ? "Restore selected artwork" : "Save reviewed sprites to character"}
            </button>
          )}
        </div>
      ) : null}
      {mode === "publish" && data.publications?.length ? (
        <details>
          <summary>Publishing history and replacement backups</summary>
          {[...data.publications].reverse().map((entry) => (
            <div className="vss-panel" key={entry.id}>
              <small>{new Date(entry.createdAt).toLocaleString()}</small>
              {entry.items.map((item, index) => (
                <p key={index}>
                  {item.name}: {item.status}
                  {item.error ? ` · ${item.error}` : ""}
                </p>
              ))}
              {entry.items.some(
                (item) =>
                  item.status === "unresolved" ||
                  item.status === "saving" ||
                  item.status === "pending" ||
                  item.status === "failed",
              ) ? (
                <button disabled={busy} onClick={() => setPublication(entry)}>
                  Review saved publication
                </button>
              ) : null}
              {entry.items.flatMap((item) =>
                item.backups.map((backup) => (
                  <button
                    key={backup.url}
                    disabled={busy}
                    onClick={() =>
                      void perform(() =>
                        plan(
                          [
                            {
                              backupUrl: backup.url,
                              name: backup.filename.slice(0, backup.filename.lastIndexOf(".")),
                              action: "replace",
                            },
                          ],
                          entry.id,
                        ),
                      )
                    }
                  >
                    Restore replaced artwork · {backup.filename}
                  </button>
                )),
              )}
            </div>
          ))}
        </details>
      ) : null}
    </section>
  );
}
