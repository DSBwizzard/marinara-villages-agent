import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type {
  AppearanceExpression,
  SpriteAppearance,
  SpriteChoice,
  SpriteFolders,
  SpriteView,
} from "../../../shared/contracts/sprites.js";
import { groupSpritesByMood, spriteLabel } from "../../../shared/helpers/sprite-variants.js";
import { messageFrom, request, VillageApiError } from "../../shared/api.js";
import { useConfirmation } from "../../shared/confirmation.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import type { Portrait } from "../../shared/types.js";
import { AvatarFace } from "./ResidentPanels.js";
import { APPEARANCE_STYLES } from "./appearance-styles.js";

type Choice = {
  useSprites: boolean;
  expressions: AppearanceExpression[];
  defaultExpressionId: string;
  folders?: SpriteFolders;
};
type SaveResult = Pick<SpriteAppearance, "revision" | "token" | "manager">;
const views = ["front", "side"] as const;
const empty: Choice = { useSprites: false, expressions: [], defaultExpressionId: "" };

function suggestedFolders({ folders }: SpriteAppearance): SpriteFolders {
  function find(view: SpriteView) {
    const matches = folders.filter((folder) => folder.name.trim().toLowerCase() === view);
    return matches.length === 1 ? matches[0]!.id : "";
  }
  return { front: find("front"), side: find("side") };
}

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
    folders: manager.folders,
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
    JSON.stringify(choice.folders) !== JSON.stringify(baseline.folders) ||
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

  function image(source: SpriteChoice | undefined) {
    if (!source || !data) return "";
    return source.artworkId
      ? (data.manager.artwork.find((art) => art.id === source.artworkId)?.rendered.url ?? "")
      : (data.files.find((file) => file.filename === source.filename)?.url ?? "");
  }

  function chooseFolders(folders: SpriteFolders, library: SpriteAppearance, changedView?: SpriteView) {
    const savedByFile = new Map<string, AppearanceExpression>();
    const filenameByArtwork = new Map(library.manager.artwork.map((art) => [art.id, art.engineSource?.filename]));
    for (const row of [...baseline.expressions, ...choice.expressions]) {
      for (const view of views) {
        const source = row[view];
        const filename = source?.filename ?? (source?.artworkId && filenameByArtwork.get(source.artworkId));
        if (filename && !(row.front && row.side)) savedByFile.set(view + ":" + filename, row);
      }
    }
    const expressions = views.flatMap((view) => {
      const folder = folders[view];
      if (changedView && view !== changedView && choice.folders?.[view] === folder) {
        return choice.expressions.filter((row) => row[view]);
      }
      if (folder && !library.folders.some(({ id }) => id === folder)) {
        return choice.expressions.filter((row) => choice.folders?.[view] === folder && row[view]);
      }
      return library.files
        .filter((file) => (file.folderId ?? "") === folder)
        .map((file) => ({
          id: savedByFile.get(view + ":" + file.filename)?.id ?? "new-" + createVillagesClientId(),
          name:
            spriteLabel(file.label || file.filename)
              .slice(0, 100)
              .trim() || "Sprite",
          [view]: { filename: file.filename, version: file.version },
        }));
    });
    const defaultExpressionId =
      (
        expressions.find((row) => row.id === choice.defaultExpressionId) ??
        groupSpritesByMood(expressions).get("neutral")?.[0] ??
        expressions[0]
      )?.id ?? "";
    edit({ useSprites: true, expressions, defaultExpressionId, folders });
  }

  const pendingFilenames = new Set(
    choice.expressions.flatMap((row) => views.flatMap((view) => row[view]?.filename ?? [])),
  );
  const rowLimit = choice.folders && !choice.folders.front && !choice.folders.side ? 400 : 200;
  const overLimit =
    pendingFilenames.size > 200 || choice.expressions.length > (data?.manager.expressions.length ?? 0) + rowLimit;
  async function refreshFolders() {
    if (!data || working.current) return;
    working.current = true;
    setPending(true);
    setError("");
    try {
      const library = await request<SpriteAppearance>(readPath);
      if (!alive.current) return;
      setData({ ...data, files: library.files, folders: library.folders, libraryError: library.libraryError });
      const folders = choice.folders ?? suggestedFolders(library);
      if (
        !library.libraryError &&
        (choice.folders || folders.front || folders.side || library.files.some((file) => !file.folderId))
      )
        chooseFolders(folders, library);
    } catch (cause) {
      if (alive.current) setError(messageFrom(cause, "Could not refresh sprite folders."));
    } finally {
      working.current = false;
      if (alive.current) setPending(false);
    }
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
                onClick={() => {
                  const folders = suggestedFolders(data);
                  if (label === "Sprites" && !choice.expressions.length && !choice.folders && !data.libraryError) {
                    chooseFolders(folders, data);
                  } else edit({ ...choice, useSprites: label === "Sprites" });
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {choice.useSprites ? (
            <>
              <div className="appearance-set-folders">
                {views.map((view) => (
                  <label key={view}>
                    {view === "front" ? "Front folder" : "Side folder"}
                    <select
                      value={choice.folders?.[view] ?? ""}
                      disabled={locked || Boolean(data.libraryError)}
                      onChange={(event) =>
                        chooseFolders(
                          { ...(choice.folders ?? { front: "", side: "" }), [view]: event.target.value },
                          data,
                          view,
                        )
                      }
                    >
                      <option value="">No folder</option>
                      {choice.folders?.[view] &&
                      !data.folders.some((folder) => folder.id === choice.folders?.[view]) ? (
                        <option value={choice.folders[view]}>Unavailable folder</option>
                      ) : null}
                      {data.folders.map((folder) => (
                        <option
                          key={folder.id}
                          value={folder.id}
                          disabled={folder.id === choice.folders?.[view === "front" ? "side" : "front"]}
                        >
                          {folder.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
              <div className="appearance-actions">
                <button type="button" disabled={locked} onClick={() => void refreshFolders()}>
                  Refresh folders
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
                    Professor mari reminder to offer help with sprites!!!!!
                  </button>
                ) : null}
              </div>
              {data.libraryError ? <p role="alert">{data.libraryError}</p> : null}
              {!selectedGroup ? (
                <p>No sprites in the selected sources.</p>
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
                            <img src={image(row.front ?? row.side) || undefined} alt="" />
                            <span>{mood}</span>
                            {preferred ? <small>Default</small> : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="appearance-preview">
                    <div className="appearance-expression-fields">
                      <h3>{selectedGroup[0]}</h3>
                      <button
                        type="button"
                        disabled={locked || selectedGroup[1].some((row) => row.id === choice.defaultExpressionId)}
                        onClick={() =>
                          edit({
                            ...choice,
                            defaultExpressionId: (selectedGroup[1].find((row) => row.front) ?? selectedGroup[1][0]!).id,
                          })
                        }
                      >
                        Set as default
                      </button>
                    </div>
                    <div className="appearance-views">
                      {views.map((view) => {
                        const label = view === "front" ? "Front" : "Side";
                        const rows = selectedGroup[1].filter((row) => row[view]);
                        return (
                          <section key={view} className="appearance-view" aria-label={label}>
                            <h4>
                              {label} · {rows.length}
                            </h4>
                            <div className="appearance-thumbnails">
                              {rows.map((row) => (
                                <figure key={row.id}>
                                  <img
                                    src={image(row[view]) || undefined}
                                    alt={row.name + " · " + label}
                                    loading="lazy"
                                  />
                                  <figcaption>{row.name}</figcaption>
                                </figure>
                              ))}
                            </div>
                          </section>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
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
            {overLimit ? <p role="alert">Choose smaller folders. You can import up to 200 images per save.</p> : null}
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
                overLimit ||
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
    </section>
  );
}
