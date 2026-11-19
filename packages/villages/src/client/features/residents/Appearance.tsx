import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type {
  AppearanceExpression,
  SpriteAppearance,
  SpriteChoice,
  SpriteLibraryItem,
  SpriteView,
} from "../../../shared/contracts/sprites.js";
import { engineSpriteName, engineSpriteUrl, groupSpritesByMood } from "../../../shared/helpers/sprite-variants.js";
import { messageFrom, request, VillageApiError } from "../../shared/api.js";
import { useConfirmation } from "../../shared/confirmation.js";
import { ModalDialog } from "../../shared/ModalDialog.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import type { Portrait } from "../../shared/types.js";
import { AvatarFace } from "./ResidentPanels.js";
import { APPEARANCE_STYLES } from "./appearance-styles.js";
import { SpriteMovePicker } from "./SpriteMovePicker.js";

type Choice = {
  useSprites: boolean;
  expressions: AppearanceExpression[];
  defaultExpressionId: string;
  defaultView?: SpriteView;
};
type SaveResult = Pick<SpriteAppearance, "revision" | "token" | "manager">;
const views = ["front", "side"] as const;
const viewLabels = { front: "Front", side: "Right-facing" };
const addLabels = { front: "Add Front sprites", side: "Add right-facing sprites" };
const empty: Choice = { useSprites: false, expressions: [], defaultExpressionId: "" };
const spriteKey = (source: SpriteChoice) => (source.filename ? "engine:" + source.filename : "art:" + source.artworkId);

function SpriteBatchPicker({
  view,
  readPath,
  assigned,
  onClose,
  onAdd,
}: {
  view: SpriteView;
  readPath: string;
  assigned: ReadonlyMap<string, SpriteChoice>;
  onClose(): void;
  onAdd(files: SpriteLibraryItem[]): void;
}) {
  const label = viewLabels[view];
  const [library, setLibrary] = useState<Pick<SpriteAppearance, "files" | "folders" | "libraryError">>();
  const [source, setSource] = useState("");
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    void request<SpriteAppearance>(readPath, { signal: controller.signal })
      .then((value) => {
        if (!controller.signal.aborted) setLibrary(value);
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setLibrary({ files: [], folders: [], libraryError: messageFrom(cause, "Could not load Engine sprites.") });
      });
    return () => controller.abort();
  }, [readPath]);

  const visible = library?.files.filter((file) => (file.folderId ?? "") === source) ?? [];
  const nameOf = (file: SpriteLibraryItem) => engineSpriteName(file.label ?? "", file.filename);
  const names = new Set<string>();
  const duplicateNames = new Set<string>();
  for (const file of visible) {
    const name = nameOf(file).toLocaleLowerCase();
    if (names.has(name)) duplicateNames.add(name);
    names.add(name);
  }
  const selected = library?.files.filter((file) => checked.includes(file.filename)) ?? [];
  const available = visible.filter((file) => !assigned.get(file.filename)?.artworkId);
  return (
    <ModalDialog title={addLabels[view]} onClose={onClose} className="appearance-picker" scrollBody>
      <div className="appearance-picker-body">
        <div className="appearance-source">
          <label>
            Sprite source
            <select value={source} onChange={(event) => setSource(event.target.value)} disabled={!library}>
              <option value="">No folder</option>
              {library?.folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </label>
          {available.length > 0 ? (
            <button
              type="button"
              onClick={() => setChecked([...new Set([...checked, ...available.map((file) => file.filename)])])}
            >
              Select all
            </button>
          ) : null}
        </div>
        {!library ? <p role="status">Loading Engine sprites…</p> : null}
        {library?.libraryError ? <p role="alert">{library.libraryError}</p> : null}
        {library && !library.libraryError && !visible.length ? <p>No sprites in this source.</p> : null}
        <div className="appearance-picker-grid">
          {visible.map((file) => (
            <label key={file.filename}>
              <input
                type="checkbox"
                autoComplete="off"
                disabled={Boolean(assigned.get(file.filename)?.artworkId)}
                checked={checked.includes(file.filename)}
                onChange={(event) =>
                  setChecked(
                    event.target.checked
                      ? [...checked, file.filename]
                      : checked.filter((filename) => filename !== file.filename),
                  )
                }
              />
              <img src={file.url} alt="" loading="lazy" />
              <span>{nameOf(file)}</span>
              {duplicateNames.has(nameOf(file).toLocaleLowerCase()) ? <small>{file.filename}</small> : null}
              {assigned.get(file.filename)?.artworkId ? <small>Added</small> : null}
            </label>
          ))}
        </div>
      </div>
      <footer>
        <span aria-live="polite">{selected.length} selected</span>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="appearance-primary"
          disabled={!selected.length || selected.length > 200}
          onClick={() => onAdd(selected)}
        >
          Add {selected.length} {label} {selected.length === 1 ? "sprite" : "sprites"}
        </button>
      </footer>
    </ModalDialog>
  );
}

function SpriteGallery({
  view,
  rows,
  image,
  onRemove,
  onDefault,
  defaultExpressionId,
  defaultView,
  locked,
}: {
  view: SpriteView;
  rows: AppearanceExpression[];
  image(source: SpriteChoice | undefined): string;
  onRemove(row: AppearanceExpression): void;
  onDefault(row: AppearanceExpression): void;
  defaultExpressionId: string;
  defaultView?: SpriteView;
  locked: boolean;
}) {
  const label = viewLabels[view];
  const [selection, setSelection] = useState("");
  const row =
    rows.find(({ id }) => id === selection) ??
    (view === defaultView ? rows.find(({ id }) => id === defaultExpressionId) : undefined) ??
    rows[0];
  const isDefault = row?.id === defaultExpressionId && view === defaultView;
  return (
    <section className="appearance-view" aria-label={label}>
      <h4>
        {label} · {rows.length}
      </h4>
      {row ? (
        <>
          <img className="appearance-full-sprite" src={image(row[view]) || undefined} alt={row.name + " · " + label} />
          {rows.length > 1 ? (
            <div className="appearance-gallery" role="group" aria-label={label + " variants"}>
              {rows.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  aria-pressed={variant === row}
                  onClick={() => setSelection(variant.id)}
                >
                  <img src={image(variant[view]) || undefined} alt="" loading="lazy" />
                  <span>{variant.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <span className="appearance-variant-name">{row.name}</span>
          )}
          <div className="appearance-expression-fields">
            <button type="button" disabled={locked || isDefault} onClick={() => onDefault(row)}>
              {isDefault ? "Default" : "Set as default"}
            </button>
            <button
              type="button"
              className="appearance-link"
              aria-label={`Remove ${row.name} from ${label}`}
              disabled={locked}
              onClick={() => onRemove(row)}
            >
              Remove
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}

function savedChoice(manager: SpriteAppearance["manager"], enabled: boolean): Choice {
  const expressions = manager.expressions.flatMap((expression) => {
    const row: AppearanceExpression = { ...expression };
    for (const view of views) {
      const art = manager.assignments.find((slot) => slot.expressionId === row.id && slot.view === view);
      if (art) {
        row[view] = art.engineFilename
          ? { filename: art.engineFilename, version: art.version }
          : { artworkId: art.artworkId };
      }
    }
    return row.front || row.side ? [row] : [];
  });
  return {
    useSprites: enabled && manager.useSprites !== false && expressions.length > 0,
    expressions,
    defaultExpressionId: manager.defaultExpressionId ?? "",
    defaultView: manager.defaultView,
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
  const [picker, setPicker] = useState<SpriteView>();
  const [moveOpen, setMoveOpen] = useState(false);
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
    choice.defaultView !== baseline.defaultView ||
    JSON.stringify(choice.expressions) !== JSON.stringify(baseline.expressions);
  const dirty = spriteEdits || choice.useSprites !== baseline.useSprites;
  const locked = pending || uncertain;
  const selected =
    choice.expressions.find((row) => row.id === selectedId) ??
    choice.expressions.find((row) => row.id === choice.defaultExpressionId) ??
    choice.expressions[0];
  const groups = groupSpritesByMood(choice.expressions);
  const selectedGroup = [...groups].find(([, members]) => members.includes(selected!));
  const [reload, setReload] = useState(0);
  const [reviewPrevious, setReviewPrevious] = useState(false);
  const acknowledged = useRef(selectedRevision);
  const filesByName = new Map(data?.files.map((file) => [file.filename, file]));
  const ownedEngineFiles = new Map(data?.manager.artwork.map((art) => [art.id, art.engineSource?.filename]));
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
    const path =
      !resident && !reviewPrevious && acknowledged.current === undefined ? readPath + "?automatic=true" : readPath;
    void request<SpriteAppearance>(path, { signal: controller.signal })
      .then((value) => {
        if (controller.signal.aborted) return;
        const revisionMismatch =
          !resident && acknowledged.current !== undefined && acknowledged.current !== value.revision;
        const same = resident || !revisionMismatch;
        const next = savedChoice(value.manager, same);
        setData(value);
        setBaseline(next);
        setChoice(next);
        select(next.defaultExpressionId);
        setStale(revisionMismatch || (reviewPrevious && acknowledged.current === undefined && !value.automatic));
        setUncertain(false);
        setError(revisionMismatch ? "Appearance changed. Review the sprites and save, or use Portrait." : "");
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(messageFrom(cause, "Could not load appearance."));
      });
    return () => controller.abort();
  }, [readPath, reload, resident, reviewPrevious]);

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

  function image(source: SpriteChoice | undefined) {
    if (!source || !data) return "";
    if (source.filename) {
      const file = filesByName.get(source.filename);
      return file && file.version === source.version
        ? file.url
        : engineSpriteUrl(characterId, source.filename, source.version);
    }
    return data.manager.artwork.find((art) => art.id === source.artworkId)?.rendered.url ?? "";
  }

  function assignedFiles(view: SpriteView) {
    const files = new Map<string, SpriteChoice>();
    for (const row of choice.expressions) {
      const source = row[view];
      if (!source) continue;
      const filename =
        source.filename ?? data?.manager.artwork.find((art) => art.id === source.artworkId)?.engineSource?.filename;
      if (filename) files.set(filename, source);
    }
    return files;
  }

  function choiceForSprites(expressions: AppearanceExpression[]): Choice {
    const current = expressions.find((row) => row.id === choice.defaultExpressionId);
    const front = expressions.filter((row) => row.front);
    const preferred = groupSpritesByMood(front).get("neutral")?.[0] ?? front[0];
    const row =
      (choice.defaultView && !current?.[choice.defaultView] ? preferred : current) ??
      preferred ??
      groupSpritesByMood(expressions).get("neutral")?.[0] ??
      expressions[0];
    const defaultView = choice.defaultView
      ? row?.id === choice.defaultExpressionId && row[choice.defaultView]
        ? choice.defaultView
        : views.find((view) => row?.[view])
      : undefined;
    return { useSprites: true, expressions, defaultExpressionId: row?.id ?? "", defaultView };
  }

  function removeSprite(row: AppearanceExpression, view: SpriteView) {
    const remaining = { ...row, [view]: undefined };
    edit(
      choiceForSprites(
        choice.expressions.flatMap((entry) =>
          entry !== row ? [entry] : remaining.front || remaining.side ? [remaining] : [],
        ),
      ),
    );
  }

  function addSprites(view: SpriteView, files: SpriteLibraryItem[]) {
    const expressions = [...choice.expressions];
    const existing = assignedFiles(view);
    const reclassified = new Set<string>();
    let first = "";
    for (const { filename, label, version } of files) {
      if (existing.get(filename)?.artworkId) continue;
      if (view === "side") reclassified.add(filename);
      const index = expressions.findIndex((row) => row[view]?.filename === filename);
      const row = {
        ...expressions[index],
        id: expressions[index]?.id ?? "new-" + createVillagesClientId(),
        name: engineSpriteName(label ?? "", filename),
        [view]: { filename, version },
      };
      if (index === -1) expressions.push(row);
      else expressions[index] = row;
      first ||= row.id;
    }
    const automaticFront = new Map(
      data?.manager.assignments
        .filter((slot) => slot.automatic)
        .map((slot) => [slot.expressionId, slot.engineFilename]),
    );
    edit(
      choiceForSprites(
        expressions.flatMap((row) => {
          const filename = row.front?.filename;
          if (!filename || !reclassified.has(filename) || automaticFront.get(row.id) !== filename) return [row];
          return row.side ? [{ ...row, front: undefined }] : [];
        }),
      ),
    );
    if (first) select(first);
    setPicker(undefined);
  }

  const baselineRows = new Map(baseline.expressions.map((row) => [row.id, row]));
  const overLimit =
    choice.expressions.reduce(
      (count, row) =>
        count +
        views.filter((view) => {
          const file = row[view];
          const prior = baselineRows.get(row.id);
          return (
            file?.filename &&
            (file.filename !== prior?.[view]?.filename ||
              file.version !== prior?.[view]?.version ||
              row.name !== prior?.name)
          );
        }).length,
      0,
    ) > 200;
  async function save(nextChoice = choice) {
    if (!data || working.current) return false;
    const body = { ...nextChoice, token: data.token, resident, ...(data.automatic ? { automatic: true } : {}) };
    const key = JSON.stringify(body);
    if (lastSave.current?.key !== key) lastSave.current = { key, id: createVillagesClientId() };
    working.current = true;
    if (!resident) setChoice(nextChoice);
    setPending(true);
    setError("");
    try {
      const saved = await request<SaveResult>(base + "/save", {
        method: "POST",
        body: JSON.stringify({ ...body, requestId: lastSave.current.id }),
      });
      if (!alive.current) return false;
      if (
        !saved ||
        typeof saved.token !== "string" ||
        !saved.token ||
        !Number.isSafeInteger(saved.revision) ||
        saved.revision < 0 ||
        !Array.isArray(saved.manager?.artwork) ||
        !Array.isArray(saved.manager?.expressions) ||
        !Array.isArray(saved.manager?.assignments)
      )
        throw new VillageApiError("Could not confirm the appearance save. Retry to check it.", 200, "INVALID_RESPONSE");
      const currentIndex = nextChoice.expressions.findIndex((row) => row.id === selected?.id);
      const next = savedChoice(saved.manager, true);
      setData({ ...data, ...saved, automatic: undefined });
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
      return true;
    } catch (cause) {
      if (alive.current) {
        setError(messageFrom(cause, "Could not save appearance."));
        if (cause instanceof VillageApiError) {
          if (cause.status >= 400 && cause.status < 500 && cause.status !== 408) {
            setUncertain(false);
            if (cause.status === 409) setStale(true);
            if (!resident) setChoice(baseline);
          }
          if (
            cause.status === 0 ||
            cause.status === 408 ||
            cause.status >= 500 ||
            cause.code === "INVALID_RESPONSE" ||
            cause.code === "RESPONSE_READ_FAILED"
          )
            setUncertain(true);
        } else if (!resident) setUncertain(true);
      }
      return false;
    } finally {
      working.current = false;
      if (alive.current) setPending(false);
    }
  }

  function reloadAppearance() {
    if (!resident && acknowledged.current !== undefined && data && acknowledged.current !== data.revision) {
      acknowledged.current = undefined;
      setReviewPrevious(true);
    } else if (!resident && acknowledged.current === undefined && reviewPrevious) {
      setReviewPrevious(false);
      void onSave(undefined);
    }
    setReload(reload + 1);
  }

  async function saveMove(nextChoice?: Choice) {
    if (await save(nextChoice)) setMoveOpen(false);
  }

  function moveSprites(from: SpriteView, ids: Set<string>) {
    const to = from === "front" ? "side" : "front";
    const occupied = new Set(choice.expressions.flatMap((row) => (row[to] ? [spriteKey(row[to])] : [])));
    const destinationFiles = new Set(
      choice.expressions.flatMap((row) => {
        const moving = ids.has(row.id) ? row[from] : undefined;
        return [
          row[to]?.filename,
          ownedEngineFiles.get(row[to]?.artworkId ?? ""),
          ownedEngineFiles.get(moving?.artworkId ?? ""),
        ];
      }),
    );
    const expressions = choice.expressions.flatMap((row) => {
      const source = row[from];
      if (!ids.has(row.id) || !source) return [row];
      const file = source.filename ? filesByName.get(source.filename) : undefined;
      if (source.filename && !file) return [row];
      const remaining = { ...row, [from]: undefined };
      const key = spriteKey(source);
      if (occupied.has(key) || (source.filename && destinationFiles.has(source.filename)))
        return remaining[to] ? [remaining] : [];
      occupied.add(key);
      const moved = {
        id: remaining[to] ? "new-" + createVillagesClientId() : row.id,
        name: file ? engineSpriteName(file.label ?? "", file.filename) : row.name,
        [to]: file ? { filename: file.filename, version: file.version } : source,
      };
      return remaining[to] ? [remaining, moved] : [moved];
    });
    void saveMove(choiceForSprites(expressions));
  }

  const title = name + "’s appearance";
  const mode = (
    <div className="appearance-mode" role="group" aria-label="Appearance mode">
      {(["Portrait", "Sprites"] as const).map((label) => {
        const useSprites = label === "Sprites";
        const selected = (resident ? choice : baseline).useSprites === useSprites;
        return (
          <button
            type="button"
            key={label}
            aria-pressed={selected}
            disabled={locked || (!resident && ((stale && !!error) || (useSprites && !choice.expressions.length)))}
            onClick={() => {
              if (resident) edit({ ...choice, useSprites });
              else if (!selected) void save({ ...choice, useSprites });
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
  const previousAppearance =
    data?.automatic && data.revision > 0 && acknowledged.current === undefined ? (
      <button
        type="button"
        className="appearance-link"
        disabled={locked}
        onClick={async () => {
          if (await mayLeave()) setReviewPrevious(true);
        }}
      >
        Review previous appearance
      </button>
    ) : null;
  if (!resident) {
    const front = baseline.expressions.filter((row) => row.front);
    const side = baseline.expressions.filter((row) => row.side);
    const moveEntries = (view: SpriteView) =>
      (view === "front" ? front : side).map((row) => {
        const source = row[view]!;
        const filename = source.filename ?? ownedEngineFiles.get(source.artworkId ?? "");
        const file = filename ? filesByName.get(filename) : undefined;
        return {
          id: row.id,
          name: row.name,
          image: image(source),
          folderId: file?.folderId,
          unavailable: !!source.filename && !file,
        };
      });
    return (
      <section className="villages-appearance appearance-compact" aria-label={title}>
        <style>{APPEARANCE_STYLES}</style>
        {data ? (
          <div className="appearance-compact-row">
            {mode}
            {baseline.useSprites ? (
              <div className="appearance-compact-sprites">
                <span role="status">{`${front.length} Front · ${side.length} Side`}</span>
                <button
                  type="button"
                  disabled={locked || stale}
                  onClick={() => {
                    setError("");
                    setMoveOpen(true);
                  }}
                >
                  Assign Side
                </button>
              </div>
            ) : null}
          </div>
        ) : !error ? (
          <span role="status">Loading appearance…</span>
        ) : null}
        {moveOpen && data ? (
          <SpriteMovePicker
            sprites={{ front: moveEntries("front"), side: moveEntries("side") }}
            folders={data.folders}
            pending={pending}
            uncertain={uncertain}
            stale={stale}
            error={error}
            onMove={moveSprites}
            onRetry={() => void saveMove()}
            onReload={() => {
              setMoveOpen(false);
              reloadAppearance();
            }}
            onClose={() => {
              setMoveOpen(false);
              if (!stale) setError("");
            }}
          />
        ) : (
          <>
            {error ? <p role="alert">{error}</p> : null}
            {pending ? <p role="status">Saving appearance…</p> : null}
            {uncertain ? (
              <button type="button" className="appearance-primary" onClick={() => void save()}>
                Retry save
              </button>
            ) : null}
            {!uncertain && (stale || (!data && error)) ? (
              <button type="button" onClick={reloadAppearance}>
                Reload appearance
              </button>
            ) : null}
            {stale && !error && !pending ? (
              <button type="button" onClick={() => void save()}>
                Use this appearance
              </button>
            ) : null}
            {previousAppearance}
          </>
        )}
      </section>
    );
  }
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
          {mode}
          {choice.useSprites ? (
            <>
              {choice.expressions.length ? (
                <div className="appearance-views appearance-sprite-previews" aria-label="Sprite previews" role="group">
                  {views.map((view) => {
                    const rows = choice.expressions.filter((row) => row[view]);
                    const row =
                      rows.find((item) => item.id === choice.defaultExpressionId) ??
                      groupSpritesByMood(rows).get("neutral")?.[0] ??
                      rows[0];
                    return row ? (
                      <div key={view} className="appearance-view">
                        <strong>{viewLabels[view]}</strong>
                        <span>
                          {rows.length} {rows.length === 1 ? "sprite" : "sprites"}
                        </span>
                        <img
                          className="appearance-full-sprite"
                          src={image(row[view]) || undefined}
                          alt={viewLabels[view] + " preview"}
                        />
                      </div>
                    ) : null;
                  })}
                </div>
              ) : null}
              <div className="appearance-actions">
                <button type="button" disabled={locked} onClick={() => setPicker("side")}>
                  {addLabels.side}
                </button>
                {!choice.expressions.length ? (
                  <button type="button" disabled={locked} onClick={() => setPicker("front")}>
                    {addLabels.front}
                  </button>
                ) : null}
              </div>
              <details className="appearance-sprite-body">
                <summary>Manage expressions</summary>
                <div className="appearance-actions">
                  {choice.expressions.length ? (
                    <button type="button" disabled={locked} onClick={() => setPicker("front")}>
                      {addLabels.front}
                    </button>
                  ) : null}
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
                      Open Character sprites
                    </button>
                  ) : null}
                </div>
                {!selectedGroup ? (
                  <p>No sprites added.</p>
                ) : (
                  <div className="appearance-layout">
                    <div className="appearance-preview">
                      <h3>Expressions</h3>
                      <div className="appearance-expressions" role="group" aria-label="Expressions">
                        {[...groups].map(([mood, members]) => {
                          const preferred = members.find((row) => row.id === choice.defaultExpressionId);
                          const row = preferred ?? members[0]!;
                          return (
                            <button
                              key={mood}
                              type="button"
                              aria-pressed={mood === selectedGroup[0]}
                              onClick={() => select(row.id)}
                            >
                              <span className="appearance-expression-image">
                                <img
                                  src={
                                    image(
                                      (preferred && choice.defaultView ? preferred[choice.defaultView] : undefined) ??
                                        row.front ??
                                        row.side,
                                    ) || undefined
                                  }
                                  alt=""
                                />
                              </span>
                              <span>{mood}</span>
                              {preferred ? <small>Default</small> : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="appearance-preview">
                      <h3>{selectedGroup[0]}</h3>
                      <div className="appearance-views">
                        {views.map((view) => (
                          <SpriteGallery
                            key={selectedGroup[0] + ":" + view}
                            view={view}
                            rows={selectedGroup[1].filter((row) => row[view])}
                            locked={locked}
                            image={image}
                            onRemove={(row) => removeSprite(row, view)}
                            onDefault={(row) => edit({ ...choice, defaultExpressionId: row.id, defaultView: view })}
                            defaultExpressionId={choice.defaultExpressionId}
                            defaultView={choice.defaultView}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </details>
              {picker ? (
                <SpriteBatchPicker
                  view={picker}
                  readPath={readPath}
                  assigned={assignedFiles(picker)}
                  onClose={() => setPicker(undefined)}
                  onAdd={(files) => addSprites(picker, files)}
                />
              ) : null}
            </>
          ) : null}
          {!choice.useSprites ? (
            <div className="appearance-preview appearance-portrait">
              <h3>Scene portrait</h3>
              <AvatarFace className={`${ELEMENT_TAG}-avatar`} name={name} portrait={portrait} />
            </div>
          ) : null}
          <div className="appearance-footer">
            <span role="status">{notice}</span>
            {overLimit ? <p role="alert">You can add up to 200 sprites per save.</p> : null}
            {dirty || stale || uncertain ? (
              <button
                type="button"
                disabled={pending || uncertain}
                onClick={() => {
                  if (stale || uncertain) {
                    reloadAppearance();
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
                overLimit ||
                choice.expressions.some((row) => !row.name.trim()) ||
                (choice.useSprites && !choice.expressions.length && !baseline.expressions.length)
              }
              onClick={() => void save()}
            >
              {pending ? "Saving…" : uncertain ? "Retry save" : "Save"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
