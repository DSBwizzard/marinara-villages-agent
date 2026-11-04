import { useCallback, useEffect, useRef, useState } from "react";
import type { SpriteSetupState, SpriteView } from "../../../shared/contracts/sprites.js";
import { messageFrom, request, VillageApiError } from "../../shared/api.js";
import type { Portrait } from "../../shared/types.js";
import { AvatarFace } from "./ResidentPanels.js";
import { FOUNDING_SPRITE_STYLES } from "./founding-sprite-styles.js";

type Source = {
  key: string;
  name: string;
  url: string;
  folderId: string | null;
  artworkId?: string;
  filename?: string;
  owned?: boolean;
};
type Props = {
  characterId: string;
  name: string;
  portrait?: Portrait;
  onDone(revision?: number): void | Promise<void>;
  onBusyChange?(busy: boolean): void;
  selectedRevision?: number;
};
const choiceKey = (value: Pick<SpriteSetupState, "useSprites" | "defaultArtworkId" | "assignments" | "manager">) =>
  JSON.stringify([
    value.useSprites,
    value.defaultArtworkId,
    value.assignments.map((item) => [item.artworkId, item.name.trim(), item.view, item.included, item.approved]),
    value.manager,
  ]);

export function FoundingSpriteSetup({ characterId, name, portrait, onDone, onBusyChange, selectedRevision }: Props) {
  const base = `/characters/${encodeURIComponent(characterId)}/sprites/setup`;
  const [data, setData] = useState<SpriteSetupState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reloadRequired, setReloadRequired] = useState(false);
  const [folder, setFolder] = useState<string | null>(null);
  const [picked, setPicked] = useState("");
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState({ front: 0, side: 0 });
  const [fit, setFit] = useState({ columns: 3, rows: 2, assigned: 3 });
  const [saved, setSaved] = useState(false);
  const [dropTarget, setDropTarget] = useState<SpriteView | null>(null);
  const sourceGrid = useRef<HTMLDivElement>(null);
  const destination = useRef<HTMLDivElement>(null);
  const working = useRef(false);
  const dragged = useRef("");
  const acknowledged = useRef(selectedRevision);
  const pendingSave = useRef<{ revision: number; choice: string } | null>(null);

  const receive = useCallback(
    async (value: SpriteSetupState, select = true) => {
      // A reusable character setup is not the current founding draft's choice.
      if (
        pendingSave.current &&
        (value.revision !== pendingSave.current.revision + 1 || choiceKey(value) !== pendingSave.current.choice)
      ) {
        setData(value);
        setError("Sprite setup changed. Choose Portrait or Sprites.");
        setReloadRequired(false);
        return false;
      }
      if (!select && !pendingSave.current) {
        if (acknowledged.current === undefined) {
          setData({ ...value, useSprites: false });
          setReloadRequired(false);
          return true;
        }
        if (value.revision !== acknowledged.current) {
          setData(value);
          setError("Sprite setup changed. Choose Portrait or Sprites.");
          setReloadRequired(false);
          return false;
        }
      }
      setData(value);
      const included = value.assignments.filter((item) => item.included);
      if (
        value.useSprites &&
        included.length &&
        (!included.every((item) => item.approved && item.name.trim()) ||
          !included.some((item) => item.artworkId === value.defaultArtworkId))
      ) {
        setError("Choose a default sprite or use Portrait.");
        setReloadRequired(false);
        return false;
      }
      await onDone(value.revision);
      acknowledged.current = value.revision;
      pendingSave.current = null;
      setReloadRequired(false);
      setSaved(true);
      return true;
    },
    [onDone],
  );

  useEffect(() => {
    const controller = new AbortController();
    onBusyChange?.(true);
    void request<SpriteSetupState>(base + "/settled", { signal: controller.signal })
      .then(async (value) => {
        if (controller.signal.aborted) return;
        const confirmed = await receive(value, false);
        if (!controller.signal.aborted) onBusyChange?.(!confirmed);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) {
          setError(messageFrom(cause, "Could not load sprites."));
          setReloadRequired(true);
        }
      });
    return () => controller.abort();
  }, [base, receive, onBusyChange]);

  useEffect(() => {
    const grid = sourceGrid.current,
      folders = destination.current;
    if (!grid || !folders) return;
    const measure = () => {
      const rem = parseFloat(getComputedStyle(grid).fontSize);
      const next = {
        columns: Math.max(1, Math.min(4, Math.floor((grid.clientWidth + 8) / (5.2 * rem + 8)))),
        rows: Math.max(1, Math.floor((grid.clientHeight + 8) / (7.5 * rem + 8))),
        assigned: Math.max(1, Math.min(4, Math.floor((folders.clientWidth - 24) / (5.2 * rem + 6)))),
      };
      setFit((prior) =>
        prior.columns === next.columns && prior.rows === next.rows && prior.assigned === next.assigned ? prior : next,
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    observer.observe(folders);
    measure();
    return () => observer.disconnect();
  }, []);

  async function perform(action: () => Promise<void | boolean>) {
    if (working.current) return;
    working.current = true;
    onBusyChange?.(true);
    setBusy(true);
    setError("");
    setSaved(false);
    let confirmed = false;
    try {
      confirmed = (await action()) !== false;
    } catch (cause) {
      setError(messageFrom(cause, "Could not save sprite setup."));
      setReloadRequired(true);
    } finally {
      working.current = false;
      setBusy(false);
      onBusyChange?.(!confirmed);
    }
  }

  async function save(next: SpriteSetupState) {
    const included = next.assignments.filter((item) => item.included && item.name.trim());
    const choice = {
      assignments: next.assignments.map((item) => ({
        ...item,
        name: item.name.trim(),
        approved: item.included && Boolean(item.name.trim()),
      })),
      defaultArtworkId: included.some((item) => item.artworkId === next.defaultArtworkId)
        ? next.defaultArtworkId
        : (included[0]?.artworkId ?? ""),
      useSprites: next.useSprites,
    };
    pendingSave.current = { revision: next.revision, choice: choiceKey({ ...next, ...choice }) };
    const value = await request<SpriteSetupState>(base + "/save", {
      method: "POST",
      body: JSON.stringify({
        revision: next.revision,
        ...choice,
        validateForUse: true,
      }),
    }).catch((cause) => {
      if (cause instanceof VillageApiError && cause.status >= 400 && cause.status < 500 && cause.status !== 408)
        pendingSave.current = null;
      throw cause;
    });
    return receive(value);
  }

  const sources: Source[] = (data?.files ?? []).map((file) => {
    const art = data?.manager.artwork.find(
      (item) => item.engineSource?.characterId === characterId && item.engineSource.filename === file.filename,
    );
    return {
      key: "file:" + file.filename,
      filename: file.filename,
      name: file.label?.trim() || file.filename.replace(/\.(png|jpe?g|webp)$/i, ""),
      url: art?.rendered.url ?? file.url,
      folderId: file.folderId ?? null,
      artworkId: art?.id,
      owned: !!file.adoptedArtworkId && !art,
    };
  });
  for (const art of data?.manager.artwork ?? [])
    if (!sources.some((source) => source.artworkId === art.id))
      sources.push({
        key: "art:" + art.id,
        name: data?.assignments.find((item) => item.artworkId === art.id)?.name || art.name,
        url: art.rendered.url,
        folderId: null,
        artworkId: art.id,
      });
  const folders = data?.folders ?? [];
  const activeFolder =
    folder !== null && (folder === "unfiled" || folders.some((item) => item.id === folder))
      ? folder
      : (folders.find((item) => sources.some((source) => source.folderId === item.id))?.id ?? "unfiled");
  const library = sources.filter((source) => source.folderId === (activeFolder === "unfiled" ? null : activeFolder));
  const capacity = fit.columns * fit.rows;
  const count = Math.max(1, Math.ceil(library.length / capacity));
  const currentPage = Math.min(page, count - 1);
  const assignment = (source: Source) =>
    data?.assignments.find((item) => item.included && item.artworkId === source.artworkId);
  const blocked = busy || reloadRequired || !data;

  async function assign(key: string, view: SpriteView) {
    const source = sources.find((item) => item.key === key);
    if (!data || !source || blocked || !data.useSprites || source.owned || assignment(source)) return;
    setPicked("");
    await perform(async () => {
      let next = data;
      if (!source.artworkId) {
        next = await request<SpriteSetupState>(base + "/prepare", {
          method: "POST",
          body: JSON.stringify({
            revision: next.revision,
            folderId: source.folderId,
            view: "unassigned",
            filenames: [source.filename],
          }),
        });
      }
      const art = next.manager.artwork.find(
        (item) =>
          item.id === source.artworkId ||
          (item.engineSource?.characterId === characterId && item.engineSource.filename === source.filename),
      );
      if (!art) throw new Error(next.errors[source.filename ?? ""] || "The sprite could not be imported.");
      const item = next.assignments.find((item) => item.artworkId === art.id);
      if (item?.included) throw new Error("This sprite is already assigned. Reload sprites.");
      const confirmed = await save({
        ...next,
        assignments: next.assignments.map((item) =>
          item.artworkId === art.id
            ? { ...item, included: true, view, name: item.name.trim() || source.name || "Sprite" }
            : item,
        ),
      });
      setPages((prior) => ({
        ...prior,
        [view]: Math.floor(
          next.assignments.filter((item) => item.included && item.view === view).length / fit.assigned,
        ),
      }));
      return confirmed;
    });
  }

  function pager(value: number, total: number, change: (page: number) => void, label: string) {
    if (total <= 1) return null;
    return (
      <nav className="founding-sprite-pagination" aria-label={`${label} pages`}>
        <button
          type="button"
          disabled={value === 0}
          aria-label={`Previous ${label} page`}
          onClick={() => change(value - 1)}
        >
          <span className="founding-sprite-page-word">Previous</span>
          <span className="founding-sprite-page-arrow" aria-hidden="true">
            ‹
          </span>
        </button>
        <span aria-live="polite">
          {value + 1} / {total}
        </span>
        <button
          type="button"
          disabled={value + 1 >= total}
          aria-label={`Next ${label} page`}
          onClick={() => change(value + 1)}
        >
          <span className="founding-sprite-page-word">Next</span>
          <span className="founding-sprite-page-arrow" aria-hidden="true">
            ›
          </span>
        </button>
      </nav>
    );
  }

  return (
    <section className="villages-founding-sprite-setup" aria-label={`${name} sprite setup`}>
      <style>{FOUNDING_SPRITE_STYLES}</style>
      <header className="founding-sprite-heading">
        <h3>{name}’s appearance</h3>
        <div role="group" aria-label="Appearance mode">
          <button
            type="button"
            disabled={blocked}
            aria-pressed={data ? !data.useSprites : false}
            onClick={() => data && void perform(() => save({ ...data, useSprites: false }))}
          >
            Use Portrait
          </button>
          <button
            type="button"
            disabled={blocked}
            aria-pressed={!!data?.useSprites}
            onClick={() => data && void perform(() => save({ ...data, useSprites: true }))}
          >
            Use Sprites
          </button>
        </div>
      </header>
      {error || data?.libraryError ? (
        <div className="founding-sprite-error" role="alert">
          <p>{error || data?.libraryError}</p>
          {reloadRequired || data?.libraryError ? (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void perform(async () => {
                  return receive(await request<SpriteSetupState>(base + "/settled"), false);
                })
              }
            >
              Reload sprites
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="founding-sprite-body">
        <section className="founding-sprite-library" aria-label="Engine sprite library">
          <div className="founding-sprite-label">
            <h4>Engine sprites</h4>
            <span>{sources.length}</span>
          </div>
          <label>
            Engine folder
            <select
              aria-label="Engine folder"
              value={activeFolder}
              disabled={!data || busy}
              onChange={(event) => {
                setFolder(event.target.value);
                setPage(0);
                setPicked("");
              }}
            >
              {folders.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({sources.filter((source) => source.folderId === item.id).length})
                </option>
              ))}
              <option value="unfiled">
                Uncategorized ({sources.filter((source) => source.folderId === null).length})
              </option>
            </select>
          </label>
          <div
            className="founding-sprite-source-grid"
            ref={sourceGrid}
            style={{
              gridTemplateColumns: `repeat(${fit.columns},minmax(0,1fr))`,
              gridTemplateRows: `repeat(${fit.rows},minmax(0,1fr))`,
            }}
          >
            {library.slice(currentPage * capacity, (currentPage + 1) * capacity).map((source) => {
              const item = assignment(source);
              const assigned = item ? (item.view === "front" ? "Front" : "Side") : source.owned ? "Imported" : "";
              const disabled = blocked || !data?.useSprites || !!assigned;
              return (
                <button
                  key={source.key}
                  type="button"
                  className="founding-sprite-source"
                  data-source={source.key}
                  data-assigned={assigned || undefined}
                  disabled={disabled}
                  draggable={!disabled}
                  aria-pressed={picked === source.key}
                  aria-label={`${source.name}${assigned ? ` · ${assigned}` : ""}`}
                  onClick={() => setPicked(picked === source.key ? "" : source.key)}
                  onDragStart={(event) => {
                    if (disabled) {
                      event.preventDefault();
                      return;
                    }
                    dragged.current = source.key;
                    event.dataTransfer.setData("text/plain", source.key);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => {
                    dragged.current = "";
                    setDropTarget(null);
                  }}
                >
                  <span className="founding-sprite-assignment">{assigned}</span>
                  <img src={source.url} alt="" draggable={false} />
                  <span>{source.name}</span>
                </button>
              );
            })}
            {!library.length ? (
              <p className="founding-sprite-empty">{data ? "No sprites in this folder." : "Reading sprites…"}</p>
            ) : null}
          </div>
          {pager(currentPage, count, setPage, "Engine sprite")}
        </section>
        <div className="founding-sprite-destinations" ref={destination}>
          {data?.useSprites ? (
            (["front", "side"] as const).map((view) => {
              const label = view === "front" ? "Front" : "Side";
              const items = data.assignments.filter((item) => item.included && item.view === view);
              const count = Math.max(1, Math.ceil(items.length / fit.assigned)),
                page = Math.min(pages[view], count - 1);
              return (
                <section
                  className="founding-sprite-folder"
                  key={view}
                  data-drag-over={dropTarget === view || undefined}
                  aria-label={`${label} sprite folder`}
                  onDragOver={(event) => {
                    if (!blocked && dragged.current) {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      setDropTarget(view);
                    }
                  }}
                  onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropTarget(null);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const key = dragged.current || event.dataTransfer.getData("text/plain");
                    dragged.current = "";
                    setDropTarget(null);
                    void assign(key, view);
                  }}
                >
                  <div className="founding-sprite-label">
                    <h4>
                      {label} <span>{items.length}</span>
                    </h4>
                    <button
                      type="button"
                      disabled={blocked || !picked}
                      aria-label={`Assign selected sprite to ${label}`}
                      onClick={() => void assign(picked, view)}
                    >
                      +
                    </button>
                  </div>
                  <div
                    className="founding-sprite-assigned-grid"
                    style={{ gridTemplateColumns: `repeat(${fit.assigned},minmax(0,1fr))` }}
                  >
                    {items.slice(page * fit.assigned, (page + 1) * fit.assigned).map((item) => {
                      const art = data.manager.artwork.find((art) => art.id === item.artworkId)!;
                      const isDefault = data.defaultArtworkId === item.artworkId;
                      return (
                        <div
                          key={item.artworkId}
                          className="founding-sprite-card"
                          data-default={isDefault || undefined}
                        >
                          <button
                            type="button"
                            className="founding-sprite-remove"
                            disabled={blocked}
                            aria-label={`Remove ${item.name} from ${label}`}
                            onClick={() =>
                              void perform(() =>
                                save({
                                  ...data,
                                  assignments: data.assignments.map((other) =>
                                    other.artworkId === item.artworkId ? { ...other, included: false } : other,
                                  ),
                                }),
                              )
                            }
                          >
                            ×
                          </button>
                          <button
                            type="button"
                            className="founding-sprite-default"
                            disabled={blocked}
                            aria-pressed={isDefault}
                            aria-label={isDefault ? `${item.name} · Default` : `Set ${item.name} as Default`}
                            onClick={() => void perform(() => save({ ...data, defaultArtworkId: item.artworkId }))}
                          >
                            <img src={art.rendered.url} alt="" draggable={false} />
                            <span>{item.name}</span>
                            <small>
                              {isDefault ? (
                                <>
                                  <span className="founding-sprite-check" aria-hidden="true">
                                    ✓
                                  </span>{" "}
                                  Default
                                </>
                              ) : (
                                "Set default"
                              )}
                            </small>
                          </button>
                        </div>
                      );
                    })}
                    {!items.length ? <p className="founding-sprite-empty">Drop sprites here</p> : null}
                  </div>
                  {pager(page, count, (value) => setPages((prior) => ({ ...prior, [view]: value })), `${label} sprite`)}
                </section>
              );
            })
          ) : (
            <section className="founding-sprite-portrait" aria-label="Portrait scene preview">
              <h4>Scene preview</h4>
              <div>
                <AvatarFace portrait={portrait} name={name} glyph="person" className="founding-sprite-scene-avatar" />
                <strong>{name}</strong>
              </div>
            </section>
          )}
        </div>
      </div>
      <span className="founding-sprite-status" role="status">
        {busy
          ? "Saving…"
          : reloadRequired
            ? "Changes not confirmed"
            : saved
              ? "Saved"
              : !data
                ? "Reading sprites…"
                : ""}
      </span>
    </section>
  );
}
