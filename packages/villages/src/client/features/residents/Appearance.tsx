import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type {
  AppearanceExpression,
  SpriteAppearance,
  SpriteChoice,
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
type PickerTarget = { expressionId: string; view: SpriteView } | null;
type SaveResult = Pick<SpriteAppearance, "revision" | "token" | "manager">;
const views = ["front", "side"] as const;
const empty: Choice = { useSprites: false, expressions: [], defaultExpressionId: "" };

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
  const [picker, setPicker] = useState<{ target: PickerTarget } | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [stale, setStale] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const working = useRef(false);
  const lastSave = useRef<{ key: string; id: string } | null>(null);
  const alive = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const dirty = JSON.stringify(choice) !== JSON.stringify(baseline);
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

  async function mayLeave() {
    if (working.current || uncertain) return false;
    return (
      !dirty || (await confirm("Discard unsaved appearance changes?", { cancel: "Keep editing", confirm: "Discard" }))
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

  function applyChoices(target: PickerTarget, choices: Array<{ name: string; source: SpriteChoice }>) {
    if (target) {
      edit({
        ...choice,
        expressions: choice.expressions.map((row) =>
          row.id === target.expressionId ? { ...row, [target.view]: choices[0]!.source } : row,
        ),
      });
    } else {
      const sameSource = (left: SpriteChoice | undefined, right: SpriteChoice) =>
        left &&
        (left.artworkId && right.artworkId
          ? left.artworkId === right.artworkId
          : left.filename && right.filename
            ? left.filename === right.filename
            : data?.manager.artwork.some(
                (art) =>
                  art.id === (left.artworkId ?? right.artworkId) &&
                  art.engineSource?.filename === (left.filename ?? right.filename),
              ));
      const rows = choices
        .filter(
          ({ source }) =>
            !choice.expressions.some((row) => sameSource(row.front, source) || sameSource(row.side, source)),
        )
        .map(({ name, source }) => ({
          id: "new-" + createVillagesClientId(),
          name:
            name
              .replace(/\.(png|jpe?g|webp)$/i, "")
              .replace(/^full_/i, "")
              .trim()
              .slice(0, 100) || "Sprite",
          front: source,
        }));
      const next = updateSprites({ ...choice, useSprites: true }, [...choice.expressions, ...rows]);
      edit(next);
      if (!choice.expressions.length) select(next.defaultExpressionId);
      else if (rows[0]) select(rows[0].id);
    }
    setPicker(null);
  }

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

  function openPicker(target: PickerTarget) {
    setPicker({ target });
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
          <div className="appearance-layout">
            <div>
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
              <div className="appearance-actions">
                <button type="button" disabled={locked} onClick={() => openPicker(null)}>
                  Choose from Engine
                </button>
                {typeof openCharacter === "function" ? (
                  <button
                    type="button"
                    className="appearance-link"
                    disabled={locked}
                    onClick={async () => {
                      if (await mayLeave()) {
                        edit(baseline);
                        openCharacter(characterId, { tab: "sprites" });
                      }
                    }}
                  >
                    Edit art in Engine ↗
                  </button>
                ) : null}
              </div>
              {choice.useSprites && choice.expressions.length ? (
                <div className="appearance-expressions" aria-label="Expressions">
                  {choice.expressions.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      aria-pressed={selected?.id === row.id}
                      onClick={() => select(row.id)}
                    >
                      <img src={image(row.front ?? row.side) || undefined} alt="" />
                      <span>{row.name || "Unnamed expression"}</span>
                      {row.id === choice.defaultExpressionId ? <small>Default</small> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="appearance-preview">
              {choice.useSprites && selected ? (
                <>
                  <h3>{selected.name || "Expression"}</h3>
                  <div className="appearance-views">
                    {views.map((view) => {
                      const label = view === "front" ? "Front" : "Side";
                      const source = selected[view];
                      return (
                        <div key={view} className="appearance-view">
                          <h4>{label}</h4>
                          {source ? (
                            <img src={image(source) || undefined} alt={selected.name + " · " + label} />
                          ) : (
                            <button
                              type="button"
                              disabled={locked}
                              onClick={() => openPicker({ expressionId: selected.id, view })}
                            >
                              + Add {view} view
                            </button>
                          )}
                          {source ? (
                            <button
                              type="button"
                              className="appearance-link"
                              disabled={locked}
                              onClick={() => openPicker({ expressionId: selected.id, view })}
                            >
                              Replace {view} view
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                  <details>
                    <summary>Expression options</summary>
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
                    <div className="appearance-actions">
                      <button
                        type="button"
                        disabled={locked || selected.id === choice.defaultExpressionId}
                        onClick={() => edit({ ...choice, defaultExpressionId: selected.id })}
                      >
                        Set as default
                      </button>
                      {selected.front && selected.side ? (
                        <button type="button" disabled={locked} onClick={() => updateSelected({ side: undefined })}>
                          Remove side view
                        </button>
                      ) : null}
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
                    </div>
                  </details>
                </>
              ) : (
                <div className="appearance-portrait">
                  <h3>Scene portrait</h3>
                  <AvatarFace className={`${ELEMENT_TAG}-avatar`} name={name} portrait={portrait} />
                </div>
              )}
            </div>
          </div>
          <div className="appearance-footer">
            <span role="status">{notice}</span>
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
          selectedName={choice.expressions.find((row) => row.id === picker.target?.expressionId)?.name ?? ""}
          target={picker.target}
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
          onChoose={(choices) => applyChoices(picker.target, choices)}
        />
      ) : null}
    </section>
  );
}

function EnginePicker({
  readPath,
  data,
  selectedName,
  target,
  onLibrary,
  onClose,
  onChoose,
}: {
  readPath: string;
  data: SpriteAppearance;
  selectedName: string;
  target: PickerTarget;
  onLibrary(value: SpriteAppearance): void;
  onClose(): void;
  onChoose(choices: Array<{ name: string; source: SpriteChoice }>): void;
}) {
  const [selected, select] = useState<string[]>([]);
  const [folder, setFolder] = useState("");
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
  const engine = data.files.map((file) => ({
    key: "file:" + file.filename,
    name: file.label || file.filename,
    url: file.url,
    source: { filename: file.filename, version: file.version } as SpriteChoice,
    folderId: file.folderId ?? null,
  }));
  const saved = data.manager.artwork.map((art) => ({
    key: art.id,
    name: art.name,
    url: art.rendered.url,
    source: { artworkId: art.id } as SpriteChoice,
    folderId: "saved",
  }));
  const library = [...engine, ...saved];
  const visible =
    folder === "saved"
      ? saved
      : !folder
        ? engine
        : engine.filter((item) => item.folderId === (folder === "unfiled" ? null : folder));
  const valid = library.filter((item) => selected.includes(item.key));
  const title = target
    ? (target.view === "side" ? "Side view for " : "Front view for ") + selectedName
    : "Choose from Engine";
  return (
    <ModalDialog className="appearance-picker" title={title} onClose={onClose} scrollBody>
      {target?.view === "side" ? <p>Choose a right-facing image.</p> : null}
      <div className="appearance-actions">
        <select aria-label="Sprite folder" value={folder} onChange={(event) => setFolder(event.target.value)}>
          <option value="">All Engine sprites</option>
          {data.folders.map((entry) => (
            <option value={entry.id} key={entry.id}>
              {entry.name}
            </option>
          ))}
          <option value="unfiled">Unfiled</option>
          {saved.length ? <option value="saved">Saved copies</option> : null}
        </select>
        {!target && visible.length > 1 ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => select([...new Set([...selected, ...visible.map((item) => item.key)])])}
          >
            Select all
          </button>
        ) : null}
      </div>
      {loading ? <p role="status">Loading sprites…</p> : null}
      {!loading && (error || data.libraryError) ? (
        <div role="alert">
          <p>{error || data.libraryError}</p>
          <button type="button" onClick={() => setReload(reload + 1)}>
            Retry Engine library
          </button>
        </div>
      ) : null}
      {!loading && !visible.length && !error && !data.libraryError ? <p>No sprites in this folder.</p> : null}
      <div className="appearance-picker-grid">
        {!loading
          ? visible.map((item) => (
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
            ))
          : null}
      </div>
      <div className="appearance-footer">
        {!target ? <span>{valid.length} selected</span> : <span />}
        <button type="button" className="appearance-link" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="appearance-primary"
          disabled={loading || !valid.length || valid.length > 200}
          onClick={() => onChoose(valid)}
        >
          {target
            ? "Use as " + target.view + " view"
            : "Add " + valid.length + (valid.length === 1 ? " sprite" : " sprites")}
        </button>
      </div>
    </ModalDialog>
  );
}
