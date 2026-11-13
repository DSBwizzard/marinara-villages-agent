import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type {
  AppearanceExpression,
  SpriteAppearance,
  SpriteChoice,
  SpriteLibraryItem,
  SpriteView,
} from "../../../shared/contracts/sprites.js";
import { messageFrom, request, VillageApiError } from "../../shared/api.js";
import { useConfirmation } from "../../shared/confirmation.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { ModalDialog } from "../../shared/ModalDialog.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import type { Portrait } from "../../shared/types.js";
import { AvatarFace } from "./ResidentPanels.js";
import { APPEARANCE_STYLES } from "./appearance-styles.js";

type Choice = { useSprites: boolean; expressions: AppearanceExpression[]; defaultExpressionId: string };
type PickerTarget = { expressionId: string; view: SpriteView };
type Picker = "set" | "front" | PickerTarget;
type NewExpression = Omit<AppearanceExpression, "id">;
type SaveResult = Pick<SpriteAppearance, "revision" | "token" | "manager">;
const views = ["front", "side"] as const;
const empty: Choice = { useSprites: false, expressions: [], defaultExpressionId: "" };
const spriteName = (name: string) =>
  name
    .trim()
    .replace(/\.(png|jpe?g|webp)$/i, "")
    .replace(/^full_/i, "")
    .trim();
const engineChoice = ({ filename, version }: SpriteLibraryItem): SpriteChoice => ({ filename, version });

function savedChoice(manager: SpriteAppearance["manager"], enabled: boolean): Choice {
  const expressions = manager.expressions.flatMap((expression) => {
    const row: AppearanceExpression = { ...expression };
    for (const view of views) {
      const art = manager.assignments.find((slot) => slot.expressionId === row.id && slot.view === view);
      if (art) row[view] = { artworkId: art.artworkId };
    }
    return row.front || row.side ? [row] : [];
  });
  return {
    useSprites: enabled && manager.useSprites !== false && expressions.length > 0,
    expressions,
    defaultExpressionId: manager.defaultExpressionId ?? "",
  };
}

export function Appearance({
  characterId,
  name,
  portrait,
  resident = false,
  selectedRevision,
  onSave,
  onBack,
  onBusyChange,
  onLeaveGuard,
  host,
}: {
  characterId: string;
  name: string;
  portrait?: Portrait;
  resident?: boolean;
  selectedRevision?: number;
  onSave(revision?: number): void | Promise<void>;
  onBack?(): void;
  onBusyChange?(busy: boolean): void;
  onLeaveGuard?(guard: (() => Promise<boolean>) | null): void;
  host?: HTMLElement;
}) {
  const base = "/characters/" + encodeURIComponent(characterId) + "/sprites/setup";
  const readPath = base + "/settled" + (resident ? "?resident=true" : "");
  const confirm = useConfirmation(characterId);
  const [data, setData] = useState<SpriteAppearance | null>(null);
  const [baseline, setBaseline] = useState<Choice>(empty);
  const [choice, setChoice] = useState<Choice>(empty);
  const [selectedId, select] = useState("");
  const [picker, setPicker] = useState<Picker | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [stale, setStale] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const working = useRef(false);
  const lastSave = useRef<{ key: string; id: string } | null>(null);
  const alive = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const spriteEdits =
    choice.defaultExpressionId !== baseline.defaultExpressionId ||
    JSON.stringify(choice.expressions) !== JSON.stringify(baseline.expressions);
  const dirty = spriteEdits || choice.useSprites !== baseline.useSprites;
  const locked = pending || uncertain;
  const selected =
    choice.expressions.find((row) => row.id === selectedId) ??
    choice.expressions.find((row) => row.id === choice.defaultExpressionId) ??
    choice.expressions[0];
  const [reload, setReload] = useState(0);
  const acknowledged = useRef(selectedRevision);
  const openCharacter = (host as (HTMLElement & { capabilityProps?: { openCharacter?: unknown } }) | undefined)
    ?.capabilityProps?.openCharacter;

  useLayoutEffect(() => {
    alive.current = true;
    if (resident) heading.current?.focus({ preventScroll: true });
    return () => {
      alive.current = false;
    };
  }, [resident]);

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    void request<SpriteAppearance>(readPath, { signal: controller.signal })
      .then((value) => {
        if (controller.signal.aborted) return;
        const same = resident || acknowledged.current === value.revision;
        const next = savedChoice(value.manager, same);
        setData(value);
        setBaseline(next);
        setChoice(next);
        select(next.defaultExpressionId);
        setStale(!resident && acknowledged.current !== undefined && !same);
        setUncertain(false);
        setError(
          !resident && acknowledged.current !== undefined && !same
            ? "Appearance changed. Review the sprites and save, or use Portrait."
            : "",
        );
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(messageFrom(cause, "Could not load appearance."));
      });
    return () => controller.abort();
  }, [readPath, reload, resident]);

  useLayoutEffect(() => {
    onBusyChange?.(pending || dirty || stale || uncertain);
    return () => onBusyChange?.(false);
  }, [pending, dirty, stale, uncertain, onBusyChange]);

  async function mayLeave(hasChanges = dirty) {
    if (working.current || uncertain) return false;
    return (
      !hasChanges ||
      (await confirm("Discard unsaved appearance changes?", { cancel: "Keep editing", confirm: "Discard" }))
    );
  }

  useLayoutEffect(() => {
    onLeaveGuard?.(mayLeave);
    return () => onLeaveGuard?.(null);
  });

  function edit(next: Choice) {
    setChoice(next);
    setNotice("");
    if (!stale) setError("");
  }

  function updateSelected(change: Partial<AppearanceExpression>) {
    if (!selected) return;
    edit({
      ...choice,
      expressions: choice.expressions.map((row) => (row.id === selected.id ? { ...row, ...change } : row)),
    });
  }

  function updateSprites(next: Choice, rows: AppearanceExpression[]) {
    return {
      ...next,
      expressions: rows,
      defaultExpressionId: rows.some((row) => row.id === next.defaultExpressionId)
        ? next.defaultExpressionId
        : ((rows.find((row) => row.name.trim().toLowerCase() === "neutral") ?? rows[0])?.id ?? ""),
    };
  }

  function image(source: SpriteChoice | undefined) {
    if (!source || !data) return "";
    return source.artworkId
      ? (data.manager.artwork.find((art) => art.id === source.artworkId)?.rendered.url ?? "")
      : (data.files.find((file) => file.filename === source.filename)?.url ?? "");
  }

  function addExpressions(expressions: NewExpression[]) {
    const rows = expressions.map((row) => ({
      ...row,
      id: "new-" + createVillagesClientId(),
      name: row.name.slice(0, 100) || "Sprite",
    }));
    const next = updateSprites({ ...choice, useSprites: true }, [...choice.expressions, ...rows]);
    edit(next);
    select(choice.expressions.length ? rows[0]!.id : next.defaultExpressionId);
    setPicker(null);
  }

  const assignedArtwork = new Set(
    choice.expressions.flatMap((row) => views.flatMap((view) => row[view]?.artworkId ?? [])),
  );
  const pendingFilenames = new Set(
    choice.expressions.flatMap((row) => views.flatMap((view) => row[view]?.filename ?? [])),
  );
  const availableRows = (data?.manager.expressions.length ?? 0) + 200 - choice.expressions.length;
  const assignedFilenames = new Set([
    ...pendingFilenames,
    ...(data?.manager.artwork.flatMap((art) =>
      assignedArtwork.has(art.id) && art.engineSource ? [art.engineSource.filename] : [],
    ) ?? []),
  ]);
  async function save() {
    if (!data || working.current) return;
    const body = { ...choice, token: data.token, resident };
    const key = JSON.stringify(body);
    if (lastSave.current?.key !== key) lastSave.current = { key, id: createVillagesClientId() };
    working.current = true;
    setPending(true);
    setError("");
    try {
      const saved = await request<SaveResult>(base + "/save", {
        method: "POST",
        body: JSON.stringify({ ...body, requestId: lastSave.current.id }),
      });
      if (!alive.current) return;
      const currentIndex = choice.expressions.findIndex((row) => row.id === selected?.id);
      const next = savedChoice(saved.manager, true);
      setData({ ...data, ...saved });
      setChoice(next);
      setBaseline(next);
      select(next.expressions[currentIndex]?.id ?? next.defaultExpressionId);
      acknowledged.current = saved.revision;
      setStale(false);
      setUncertain(false);
      try {
        await onSave(saved.revision);
        if (alive.current) setNotice("Saved");
      } catch {
        if (alive.current) setNotice("Saved. Reopen the profile to refresh its artwork.");
      }
    } catch (cause) {
      if (alive.current) {
        setError(messageFrom(cause, "Could not save appearance."));
        if (cause instanceof VillageApiError) {
          if (cause.status >= 400 && cause.status < 500 && cause.status !== 408) {
            setUncertain(false);
            if (cause.status === 409) setStale(true);
          }
          if (
            cause.status === 0 ||
            cause.status === 408 ||
            cause.status >= 500 ||
            cause.code === "INVALID_RESPONSE" ||
            cause.code === "RESPONSE_READ_FAILED"
          )
            setUncertain(true);
        }
      }
    } finally {
      working.current = false;
      if (alive.current) setPending(false);
    }
  }

  const title = name + "’s appearance";
  return (
    <section className="villages-appearance" aria-label={title}>
      <style>{APPEARANCE_STYLES}</style>
      {onBack ? (
        <button
          type="button"
          className="appearance-link"
          onClick={async () => {
            if (await mayLeave()) onBack();
          }}
        >
          ← Profile
        </button>
      ) : null}
      <h2 ref={heading} tabIndex={-1}>
        {title}
      </h2>
      {error ? <p role="alert">{error}</p> : null}
      {!data ? (
        error ? (
          <button type="button" onClick={() => setReload(reload + 1)}>
            Reload appearance
          </button>
        ) : (
          <p role="status">Loading appearance…</p>
        )
      ) : (
        <>
          <div className="appearance-mode" role="group" aria-label="Appearance mode">
            {(["Portrait", "Sprites"] as const).map((label) => (
              <button
                type="button"
                key={label}
                aria-pressed={choice.useSprites === (label === "Sprites")}
                disabled={locked}
                onClick={() => edit({ ...choice, useSprites: label === "Sprites" })}
              >
                {label}
              </button>
            ))}
          </div>
          {choice.useSprites ? (
            <div className="appearance-actions">
              <button type="button" disabled={locked} onClick={() => setPicker("set")}>
                Add sprite set
              </button>
              <button type="button" disabled={locked} onClick={() => setPicker("front")}>
                Add front sprites
              </button>
              {typeof openCharacter === "function" ? (
                <button
                  type="button"
                  className="appearance-link"
                  disabled={locked}
                  onClick={async () => {
                    if (await mayLeave(spriteEdits)) {
                      edit(baseline);
                      openCharacter(characterId, { tab: "sprites" });
                    }
                  }}
                >
                  Edit art in Engine ↗
                </button>
              ) : null}
            </div>
          ) : null}
          {choice.useSprites && selected ? (
            <div className="appearance-layout">
              <div className="appearance-preview">
                <h3>Expressions</h3>
                <div className="appearance-expressions" role="group" aria-label="Expressions">
                  {choice.expressions.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      aria-pressed={selected.id === row.id}
                      onClick={() => select(row.id)}
                    >
                      <img src={image(row.front ?? row.side) || undefined} alt="" />
                      <span>{row.name || "Unnamed expression"}</span>
                      {row.id === choice.defaultExpressionId ? <small>Default</small> : null}
                    </button>
                  ))}
                </div>
              </div>
              <div className="appearance-preview">
                <div className="appearance-expression-fields">
                  <label>
                    Expression name{" "}
                    <input
                      autoComplete="off"
                      value={selected.name}
                      maxLength={100}
                      disabled={locked}
                      onChange={(event) => updateSelected({ name: event.target.value })}
                    />
                  </label>
                  <button
                    type="button"
                    disabled={locked || selected.id === choice.defaultExpressionId}
                    onClick={() => edit({ ...choice, defaultExpressionId: selected.id })}
                  >
                    Set as default
                  </button>
                </div>
                <div className="appearance-views">
                  {views.map((view) => {
                    const label = view === "front" ? "Front" : "Side";
                    const source = selected[view];
                    return (
                      <div key={view} className="appearance-view">
                        <h4>{label}</h4>
                        {source ? (
                          <>
                            <img src={image(source) || undefined} alt={selected.name + " · " + label} />
                            <div className="appearance-view-actions">
                              <button
                                type="button"
                                className="appearance-link"
                                disabled={locked}
                                onClick={() => setPicker({ expressionId: selected.id, view })}
                              >
                                Replace {view} view
                              </button>
                              {view === "side" && selected.front ? (
                                <button
                                  type="button"
                                  className="appearance-link"
                                  disabled={locked}
                                  onClick={() => updateSelected({ side: undefined })}
                                >
                                  Remove side view
                                </button>
                              ) : null}
                            </div>
                          </>
                        ) : (
                          <button
                            type="button"
                            disabled={locked}
                            onClick={() => setPicker({ expressionId: selected.id, view })}
                          >
                            + Add {view} view
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
          {!choice.useSprites ? (
            <div className="appearance-preview appearance-portrait">
              <h3>Scene portrait</h3>
              <AvatarFace className={`${ELEMENT_TAG}-avatar`} name={name} portrait={portrait} />
            </div>
          ) : null}
          <div className="appearance-footer">
            {choice.useSprites && selected ? (
              <button
                type="button"
                disabled={locked}
                onClick={() => {
                  edit(
                    updateSprites(
                      choice,
                      choice.expressions.filter((row) => row.id !== selected.id),
                    ),
                  );
                }}
              >
                Remove expression
              </button>
            ) : null}
            <span role="status">{notice}</span>
            {pendingFilenames.size > 200 ? (
              <p role="alert">
                Remove a pending sprite or discard your changes. You can add up to 200 images per save.
              </p>
            ) : null}
            {dirty || stale || uncertain ? (
              <button
                type="button"
                disabled={pending || uncertain}
                onClick={() => {
                  if (stale || uncertain) {
                    if (!resident) {
                      acknowledged.current = undefined;
                      void onSave(undefined);
                    }
                    setReload(reload + 1);
                  } else edit(baseline);
                }}
              >
                {stale || uncertain ? "Reload appearance" : "Discard changes"}
              </button>
            ) : null}
            <button
              className="appearance-primary"
              type="button"
              disabled={
                pending ||
                (!dirty && !stale && !uncertain) ||
                pendingFilenames.size > 200 ||
                choice.expressions.some((row) => !row.name.trim()) ||
                (choice.useSprites && !choice.expressions.length)
              }
              onClick={() => void save()}
            >
              {pending ? "Saving…" : uncertain ? "Retry save" : "Save"}
            </button>
          </div>
        </>
      )}
      {picker && data ? (
        <EnginePicker
          readPath={readPath}
          data={data}
          selectedName={selected?.name ?? ""}
          picker={picker}
          availableImports={200 - pendingFilenames.size}
          availableRows={availableRows}
          assignedArtwork={assignedArtwork}
          assignedFilenames={assignedFilenames}
          onLibrary={(library) =>
            setData(
              (prior) =>
                prior && {
                  ...prior,
                  files: library.files,
                  folders: library.folders,
                  libraryError: library.libraryError,
                },
            )
          }
          onClose={() => setPicker(null)}
          onAdd={addExpressions}
          onChoose={(target, source) => {
            edit({
              ...choice,
              expressions: choice.expressions.map((row) =>
                row.id === target.expressionId ? { ...row, [target.view]: source } : row,
              ),
            });
            setPicker(null);
          }}
        />
      ) : null}
    </section>
  );
}

function EnginePicker({
  readPath,
  data,
  selectedName,
  picker,
  availableImports,
  availableRows,
  assignedArtwork,
  assignedFilenames,
  onLibrary,
  onClose,
  onAdd,
  onChoose,
}: {
  readPath: string;
  data: SpriteAppearance;
  selectedName: string;
  picker: Picker;
  availableImports: number;
  availableRows: number;
  assignedArtwork: ReadonlySet<string>;
  assignedFilenames: ReadonlySet<string>;
  onLibrary(value: SpriteAppearance): void;
  onClose(): void;
  onAdd(choices: NewExpression[]): void;
  onChoose(target: PickerTarget, source: SpriteChoice): void;
}) {
  const target = typeof picker === "object" ? picker : null;
  const [selected, select] = useState<string[]>([]);
  const [folder, setFolder] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const publish = useRef(onLibrary);
  useLayoutEffect(() => {
    publish.current = onLibrary;
  }, [onLibrary]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    void request<SpriteAppearance>(readPath, { signal: controller.signal })
      .then((value) => {
        if (!controller.signal.aborted) publish.current(value);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(messageFrom(cause, "Could not load Engine sprites."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [readPath, reload]);

  const title = target
    ? (target.view === "side" ? "Side view for " : "Front view for ") + selectedName
    : picker === "set"
      ? "Add sprite set"
      : "Choose front sprites";
  const problem = error || data.libraryError;
  const activeFolder = folder ?? preferredFolder(data.folders, target?.view ?? "front");
  const engine = data.files
    .filter((file) => target || !assignedFilenames.has(file.filename))
    .map((file) => ({
      key: "file:" + file.filename,
      name: file.label || file.filename,
      url: file.url,
      source: engineChoice(file),
      folderId: folderKey(file),
    }));
  const saved = data.manager.artwork
    .filter(
      (art) => target || (!assignedArtwork.has(art.id) && !assignedFilenames.has(art.engineSource?.filename ?? "")),
    )
    .map((art) => ({
      key: art.id,
      name: art.name,
      url: art.rendered.url,
      source: { artworkId: art.id } as SpriteChoice,
      folderId: "saved",
    }));
  const visible =
    activeFolder === "saved" ? saved : engine.filter((item) => !activeFolder || item.folderId === activeFolder);
  const valid = [...engine, ...saved].filter((item) => selected.includes(item.key));
  const tooMany =
    !target && (valid.length > availableRows || valid.filter((item) => item.source.filename).length > availableImports);

  return (
    <ModalDialog className="appearance-picker" title={title} onClose={onClose} scrollBody>
      {loading ? <p role="status">Loading sprites…</p> : null}
      {!loading && problem ? (
        <div role="alert">
          <p>{problem}</p>
          <button type="button" onClick={() => setReload(reload + 1)}>
            Retry Engine library
          </button>
        </div>
      ) : null}
      {!loading && picker === "set" && !problem ? (
        <SpriteSet
          data={data}
          assignedFilenames={assignedFilenames}
          availableImports={Math.min(availableImports, availableRows)}
          onClose={onClose}
          onAdd={onAdd}
        />
      ) : null}
      {!loading && picker !== "set" ? (
        <>
          {target?.view === "side" ? <p>Choose a right-facing image.</p> : null}
          <div className="appearance-actions">
            <select aria-label="Sprite folder" value={activeFolder} onChange={(event) => setFolder(event.target.value)}>
              <option value="">All Engine sprites</option>
              {data.folders.map((entry) => (
                <option value={"folder:" + entry.id} key={entry.id}>
                  {entry.name}
                </option>
              ))}
              <option value="unfiled">Unfiled</option>
              {saved.length ? <option value="saved">Saved copies</option> : null}
            </select>
            {!target && visible.length > 1 ? (
              <button
                type="button"
                onClick={() => select([...new Set([...selected, ...visible.map((item) => item.key)])])}
              >
                Select all
              </button>
            ) : null}
          </div>
          {!visible.length && !problem ? <p>No available sprites in this folder.</p> : null}
          <div className="appearance-picker-grid">
            {visible.map((item) => (
              <label key={item.key}>
                <img src={item.url} alt="" loading="lazy" />
                <span>
                  <input
                    autoComplete="off"
                    type={target ? "radio" : "checkbox"}
                    name={target ? "appearance-facing" : undefined}
                    checked={selected.includes(item.key)}
                    onChange={() =>
                      select(
                        target
                          ? [item.key]
                          : selected.includes(item.key)
                            ? selected.filter((key) => key !== item.key)
                            : [...selected, item.key],
                      )
                    }
                  />
                  {item.name}
                </span>
              </label>
            ))}
          </div>
          <div className="appearance-footer">
            <span>{!target ? valid.length + " selected" : null}</span>
            <button type="button" className="appearance-link" onClick={onClose}>
              Cancel
            </button>
            {tooMany ? (
              <p role="alert">Save your current changes before adding more sprites, or select fewer images.</p>
            ) : null}
            <button
              type="button"
              className="appearance-primary"
              disabled={!valid.length || tooMany}
              onClick={() =>
                target
                  ? onChoose(target, valid[0]!.source)
                  : onAdd(valid.map((item) => ({ name: spriteName(item.name), front: item.source })))
              }
            >
              {target
                ? "Use as " + target.view + " view"
                : "Add " + valid.length + (valid.length === 1 ? " expression" : " expressions")}
            </button>
          </div>
        </>
      ) : null}
    </ModalDialog>
  );
}

function preferredFolder(folders: SpriteAppearance["folders"], name: SpriteView) {
  const matches = folders.filter((entry) => entry.name.trim().toLowerCase() === name);
  return matches.length === 1 ? "folder:" + matches[0]!.id : "";
}

function folderKey(file: SpriteLibraryItem) {
  return file.folderId ? "folder:" + file.folderId : "unfiled";
}

function SpriteSet({
  data,
  assignedFilenames,
  availableImports,
  onClose,
  onAdd,
}: {
  data: SpriteAppearance;
  assignedFilenames: ReadonlySet<string>;
  availableImports: number;
  onClose(): void;
  onAdd(choices: NewExpression[]): void;
}) {
  const [frontFolder, setFrontFolder] = useState(() => preferredFolder(data.folders, "front"));
  const [sideFolder, setSideFolder] = useState(() => preferredFolder(data.folders, "side"));
  const filesIn = (folder: string) => data.files.filter((file) => folderKey(file) === folder);
  const front = filesIn(frontFolder);
  const side = filesIn(sideFolder);
  const labelOf = (file: SpriteLibraryItem) => spriteName(file.label || file.filename);
  const keyOf = (file: SpriteLibraryItem) => labelOf(file).toLowerCase();
  const frontCounts = new Map<string, number>();
  for (const file of front) {
    const key = keyOf(file);
    frontCounts.set(key, (frontCounts.get(key) ?? 0) + 1);
  }
  const sideByLabel = new Map<string, SpriteLibraryItem | null>();
  for (const file of side) {
    const key = keyOf(file);
    sideByLabel.set(key, sideByLabel.has(key) ? null : file);
  }
  const pairs = front
    .filter((file) => !assignedFilenames.has(file.filename))
    .map((file) => {
      const key = keyOf(file);
      const match = key ? sideByLabel.get(key) : undefined;
      const ambiguous = match === null || (match && frontCounts.get(key)! > 1);
      const paired = !ambiguous && match && !assignedFilenames.has(match.filename) ? match : undefined;
      const reason = ambiguous ? "Duplicate label" : match ? "Already in use" : sideFolder ? "No match" : "—";
      return { name: labelOf(file) || "Sprite", front: file, side: paired, reason };
    });
  const pairCount = pairs.filter((row) => row.side).length;
  const skippedFront = front.length - pairs.length;
  const limitExceeded = pairs.length + pairCount > availableImports;
  const folders = data.folders.map((folder) => ({ key: "folder:" + folder.id, name: folder.name }));
  if (data.files.some((file) => !file.folderId)) folders.push({ key: "unfiled", name: "Unfiled" });

  return (
    <>
      <div className="appearance-set-folders">
        {views.map((view) => (
          <label key={view}>
            {view === "front" ? "Front folder" : "Side folder"}
            <select
              value={view === "front" ? frontFolder : sideFolder}
              onChange={(event) => (view === "front" ? setFrontFolder : setSideFolder)(event.target.value)}
            >
              <option value="">{view === "front" ? "Choose a folder" : "None"}</option>
              {folders.map((folder) => (
                <option
                  key={folder.key}
                  value={folder.key}
                  disabled={folder.key === (view === "front" ? sideFolder : frontFolder)}
                >
                  {folder.name}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      {frontFolder && !front.length ? <p>No sprites in the Front folder.</p> : null}
      {skippedFront ? (
        <p>
          {skippedFront} front {skippedFront === 1 ? "sprite already in use" : "sprites already in use"}.
        </p>
      ) : null}
      {pairs.length ? (
        <table className="appearance-pairs" aria-label="Sprite pairs">
          <thead>
            <tr>
              <th scope="col">Expression</th>
              <th scope="col">Front</th>
              <th scope="col">Side</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((row) => (
              <tr key={row.front.filename}>
                <th scope="row">{row.name}</th>
                <td>
                  <img src={row.front.url} alt={row.name + " · Front"} loading="lazy" />
                </td>
                <td>{row.side ? <img src={row.side.url} alt={row.name + " · Side"} loading="lazy" /> : row.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {frontFolder && side.length > pairCount ? <p>{side.length - pairCount} side sprites will be left out.</p> : null}
      {limitExceeded ? (
        <p role="alert">Choose smaller folders or save your current changes before adding this set.</p>
      ) : null}
      <div className="appearance-footer">
        <span>{pairs.length ? pairCount + " paired" : null}</span>
        <button type="button" className="appearance-link" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="appearance-primary"
          disabled={!pairs.length || limitExceeded}
          onClick={() =>
            onAdd(
              pairs.map((row) => ({
                name: row.name,
                front: engineChoice(row.front),
                side: row.side && engineChoice(row.side),
              })),
            )
          }
        >
          Add to appearance
        </button>
      </div>
    </>
  );
}
