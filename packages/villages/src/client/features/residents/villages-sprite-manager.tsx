import {
  SPRITE_UPLOAD_GUIDANCE,
  type SpriteArtwork,
  type SpriteFrame,
  type SpriteLibraryItem,
  type SpriteManagerState,
  type SpriteView,
} from "../../../shared/contracts/sprites.js";
import { initialSpriteFrame, renderSpritePixels, type SpritePixels } from "../../../shared/helpers/sprite-framing.js";
import { SPRITE_MANAGER_STYLES } from "./villages-sprite-manager-styles.js";
import { useEffect, useRef, useState } from "react";

type Request = <T>(path: string, init?: RequestInit) => Promise<T>;
type Props = {
  villager: { characterId: string; name: string };
  request: Request;
  onSaved: (snapshot: unknown) => void;
  onBack: () => void;
  backLabel?: string;
  onLeaveGuard: (guard: (() => boolean) | null) => void;
};
type Saved = {
  manager: SpriteManagerState;
  snapshot: unknown;
  addedArtworkIds?: string[];
  selectedArtworkIds?: string[];
};
type Draft = { frame: SpriteFrame; expressionId: string; name: string; useWhen: string; view: SpriteView };
function savedDraft(
  art: SpriteArtwork,
  state: SpriteManagerState,
  context?: Pick<Draft, "expressionId" | "view">,
): Draft {
  const assignment =
    state.assignments.find(
      (item) =>
        context &&
        item.artworkId === art.id &&
        item.expressionId === context.expressionId &&
        item.view === context.view,
    ) ?? state.assignments.find((item) => item.artworkId === art.id);
  const expression = state.expressions.find((item) => item.id === assignment?.expressionId);
  return {
    frame: art.frame,
    expressionId: expression?.id ?? "",
    name: expression?.name ?? art.name.replace(/\.[^.]+$/, "").replace(/^full_/, ""),
    useWhen: expression?.useWhen ?? "",
    view: assignment?.view ?? "front",
  };
}
const differs = (a: Draft, b: Draft) => JSON.stringify(a) !== JSON.stringify(b);
const message = (cause: unknown, fallback: string) => (cause instanceof Error ? cause.message : fallback);
async function loadPixels(url: string): Promise<SpritePixels> {
  const image = new Image();
  image.src = url;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("The browser cannot preview artwork.");
  context.drawImage(image, 0, 0);
  return {
    width: canvas.width,
    height: canvas.height,
    data: context.getImageData(0, 0, canvas.width, canvas.height).data,
  };
}
async function readFile(file: File) {
  if (!file.size || file.size > 12_000_000 || !["image/png", "image/jpeg", "image/webp"].includes(file.type))
    throw new Error("Choose a nonempty PNG, WebP, or JPEG up to 12 MB.");
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The image could not be read."));
    reader.readAsDataURL(file);
  });
}
function PixelPreview({ image }: { image: SpritePixels | null }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    context?.clearRect(0, 0, 1024, 1536);
    if (image) context?.putImageData(new ImageData(new Uint8ClampedArray(image.data), image.width, image.height), 0, 0);
  }, [image]);
  return <canvas ref={canvas} width={1024} height={1536} aria-label="Framed sprite preview" />;
}

export function SpriteManager({
  villager,
  request,
  onSaved,
  onBack,
  onLeaveGuard,
  backLabel = "← Back to Villagers",
}: Props) {
  const base = `/villagers/${encodeURIComponent(villager.characterId)}/sprites/manager`;
  const [manager, setManager] = useState<SpriteManagerState | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0),
    [pixelAttempt, setPixelAttempt] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [contexts, setContexts] = useState<Record<string, Pick<Draft, "expressionId" | "view">>>({});
  const [pixels, setPixels] = useState<{ url: string; image: SpritePixels } | null>(null);
  const [pixelError, setPixelError] = useState("");
  const [preview, setPreview] = useState<{
    source: SpritePixels;
    frame: SpriteFrame;
    image: SpritePixels | null;
    warnings: string[];
    clipped: boolean;
  } | null>(null);
  const [previewMobile, setPreviewMobile] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false),
    [libraryLoading, setLibraryLoading] = useState(false);
  const [library, setLibrary] = useState<SpriteLibraryItem[]>([]),
    [libraryError, setLibraryError] = useState("");
  const [librarySelected, setLibrarySelected] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null),
    heading = useRef<HTMLHeadingElement>(null);
  const libraryDialog = useRef<HTMLDialogElement>(null),
    libraryButton = useRef<HTMLButtonElement>(null);
  const moreActions = useRef<HTMLDetailsElement>(null);
  const expressionSelect = useRef<HTMLSelectElement>(null);
  const focusExpression = useRef(false);
  const inFlight = useRef(false);
  const selected = manager?.artwork.find((item) => item.id === selectedId);
  const baseline = selected && manager ? savedDraft(selected, manager, contexts[selected.id]) : null;
  const draft = selected ? (drafts[selected.id] ?? baseline) : null;
  const dirty = Boolean(draft && baseline && differs(draft, baseline));
  const dirtyCount =
    manager?.artwork.filter(
      (art) => drafts[art.id] && differs(drafts[art.id], savedDraft(art, manager, contexts[art.id])),
    ).length ?? 0;
  const source = selected && pixels?.url === selected.source.url ? pixels.image : null;
  const currentPreview =
    source && draft && preview?.source === source && preview.frame === draft.frame ? preview : null;
  const defaultAssignment =
    manager?.assignments.find(
      (item) => item.expressionId === manager.defaultExpressionId && item.view === draft?.view,
    ) ?? manager?.assignments.find((item) => item.expressionId === manager.defaultExpressionId);
  const defaultArt = manager?.artwork.find((item) => item.id === defaultAssignment?.artworkId);
  const canSave = Boolean(draft?.name.trim() && currentPreview?.image && !currentPreview.clipped && !busy);

  useEffect(() => {
    if (!busy && focusExpression.current) {
      focusExpression.current = false;
      expressionSelect.current?.focus({ preventScroll: true });
    }
  }, [busy]);

  useEffect(() => {
    let stopped = false;
    request<SpriteManagerState>(base)
      .then((state) => {
        if (stopped) return;
        setManager(state);
        const defaultId = state.assignments.find((item) => item.expressionId === state.defaultExpressionId)?.artworkId;
        setSelectedId(defaultId ?? state.artwork[0]?.id ?? "");
        heading.current?.focus();
      })
      .catch((cause: unknown) => {
        if (!stopped) setError(message(cause, "Sprite Manager could not be opened."));
      });
    return () => {
      stopped = true;
    };
  }, [base, request, loadAttempt]);
  const sourceUrl = selected?.source.url;
  useEffect(() => {
    let stopped = false;
    if (sourceUrl)
      void loadPixels(sourceUrl)
        .then((image) => {
          if (!stopped) {
            setPixels({ url: sourceUrl, image });
            setPixelError("");
          }
        })
        .catch((cause: unknown) => {
          if (!stopped) setPixelError(message(cause, "The original could not be loaded."));
        });
    return () => {
      stopped = true;
    };
  }, [sourceUrl, pixelAttempt]);
  const frame = draft?.frame;
  useEffect(() => {
    // Cancel pending slider work and render only the latest framing on the next paint.
    const task = requestAnimationFrame(() => {
      if (!source || !frame) return;
      try {
        setPreview({ source, frame, ...renderSpritePixels(source, frame) });
      } catch (cause) {
        setPreview({ source, frame, image: null, warnings: [message(cause, "Check the framing.")], clipped: true });
      }
    });
    return () => cancelAnimationFrame(task);
  }, [source, frame]);
  function mayLeave() {
    if (inFlight.current) return false;
    return (
      !dirtyCount ||
      window.confirm("Discard unsaved Sprite Manager changes and leave? Your saved artwork will stay in use.")
    );
  }
  useEffect(() => {
    onLeaveGuard(mayLeave);
    return () => onLeaveGuard(null);
  });
  useEffect(() => {
    if (!dirtyCount && !busy) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirtyCount, busy]);
  useEffect(() => {
    if (libraryOpen) libraryDialog.current?.showModal();
    else if (libraryDialog.current?.open) {
      libraryDialog.current.close();
      libraryButton.current?.focus({ preventScroll: true });
    }
  }, [libraryOpen]);
  function edit(change: Partial<Draft>) {
    if (selected && draft) setDrafts((prior) => ({ ...prior, [selected.id]: { ...draft, ...change } }));
    setError("");
    setNotice("");
  }
  function editFrame(change: Partial<SpriteFrame>) {
    if (frame) edit({ frame: { ...frame, ...change } });
  }
  function closeMoreActions() {
    if (moreActions.current) {
      moreActions.current.open = false;
      moreActions.current.querySelector<HTMLElement>("summary")?.focus({ preventScroll: true });
    }
  }
  function discard(id: string) {
    setDrafts((prior) => {
      const next = { ...prior };
      delete next[id];
      return next;
    });
    setError("");
    setNotice("");
  }
  function choose(id: string) {
    setSelectedId(id);
    setPixelError("");
    setError("");
    setNotice("");
  }
  const call = <T,>(action: string, body: unknown = {}) =>
    request<T>(base + "/" + action, { method: "POST", body: JSON.stringify(body) });
  async function perform(action: () => Promise<void>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (cause) {
      setError(message(cause, "Artwork could not be saved."));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  function accept(saved: Saved, pickId?: string) {
    setManager(saved.manager);
    onSaved(saved.snapshot);
    if (pickId) choose(pickId);
    else if (!saved.manager.artwork.some((art) => art.id === selectedId)) choose(saved.manager.artwork[0]?.id ?? "");
  }
  async function upload(files: File[]) {
    const images = [];
    for (const file of files) images.push({ name: file.name, image: await readFile(file) });
    const saved = await call<Saved>("import", { images });
    accept(saved, saved.addedArtworkIds?.[0]);
    setNotice("Artwork uploaded. Choose its expression and facing, then Save and use in Scenes.");
  }
  async function openLibrary() {
    setLibraryOpen(true);
    setError("");
    setNotice("");
    setLibraryLoading(true);
    setLibraryError("");
    setLibrarySelected([]);
    try {
      const answer = await call<{ items: SpriteLibraryItem[]; error: string }>("library");
      setLibrary(answer.items);
      setLibraryError(answer.error);
    } catch (cause) {
      setLibrary([]);
      setLibraryError(message(cause, "The character library could not be opened."));
    } finally {
      setLibraryLoading(false);
    }
  }
  async function save() {
    if (!selected || !draft) return;
    const saved = await call<Saved>("save", { artworkId: selected.id, expectedUrl: selected.rendered.url, ...draft });
    const assignment = saved.manager.assignments.find(
      (item) =>
        item.artworkId === selected.id &&
        item.view === draft.view &&
        (draft.expressionId
          ? item.expressionId === draft.expressionId
          : !manager?.expressions.some((expression) => expression.id === item.expressionId)),
    );
    if (assignment)
      setContexts((prior) => ({
        ...prior,
        [selected.id]: { expressionId: assignment.expressionId, view: assignment.view },
      }));
    discard(selected.id);
    accept(saved);
    setNotice("Expression and artwork saved for Scenes.");
  }
  const feedback = (
    <>
      {error ? (
        <p role="alert" className="vsm-feedback vsm-feedback-error">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="vsm-feedback">
          {notice}
        </p>
      ) : null}
    </>
  );
  return (
    <section className="vsm" aria-label={`${villager.name} Sprite Manager`}>
      <style>{SPRITE_MANAGER_STYLES}</style>
      <header className="vsm-heading">
        <button
          aria-label={backLabel}
          disabled={busy}
          onClick={() => {
            if (mayLeave()) onBack();
          }}
        >
          {backLabel === "← Back to profile" ? "← Profile" : backLabel.replace("← Back to ", "← ")}
        </button>
        <div>
          <h2 ref={heading} tabIndex={-1}>
            {villager.name}’s Sprite Manager
          </h2>
          <small>Artwork for every Scene</small>
        </div>
        <div className="vsm-toolbar">
          <button className="vsm-primary" disabled={busy || !manager} onClick={() => fileInput.current?.click()}>
            Upload images
          </button>
          <button ref={libraryButton} disabled={busy || !manager || libraryLoading} onClick={() => void openLibrary()}>
            Character library
          </button>
        </div>
      </header>
      <input
        className="vsm-file"
        ref={fileInput}
        type="file"
        accept="image/png,image/webp,image/jpeg"
        multiple
        aria-label="Upload sprite images"
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          event.target.value = "";
          if (files.length) void perform(() => upload(files));
        }}
      />
      {manager && !(selected && draft && frame) ? feedback : null}
      <details className="vsm-help">
        <summary>Artwork tips</summary>
        <p>{SPRITE_UPLOAD_GUIDANCE} PNG, WebP, or JPEG; up to 12 MB per image.</p>
      </details>
      {!manager ? (
        <div className="vsm-empty">
          {error ? (
            <>
              <p role="alert">{error}</p>
              <button
                onClick={() => {
                  setError("");
                  setLoadAttempt((prior) => prior + 1);
                }}
              >
                Try again
              </button>
            </>
          ) : (
            <p role="status">Loading artwork…</p>
          )}
        </div>
      ) : !manager.artwork.length ? (
        <p className="vsm-empty">
          No sprites assigned yet.
          <br />
          Upload finished artwork or choose a character sprite to begin. Until then, Scenes use the character portrait.
        </p>
      ) : (
        <div className="vsm-workspace">
          <section className="vsm-panel vsm-gallery" aria-label="Artwork">
            <h3>
              Artwork <span className="vsm-hint">· {manager.artwork.length}</span>
            </h3>
            <div className="vsm-artwork">
              {manager.artwork.map((art) => {
                const assignments = manager.assignments.filter((item) => item.artworkId === art.id);
                const unsaved = drafts[art.id] && differs(drafts[art.id], savedDraft(art, manager, contexts[art.id]));
                return (
                  <button
                    key={art.id}
                    disabled={busy}
                    aria-pressed={art.id === selectedId}
                    onClick={() => choose(art.id)}
                  >
                    <img src={art.rendered.url} alt="" loading="lazy" />
                    <span className="vsm-artwork-name">{art.name}</span>
                    <span className="vsm-badges">
                      {assignments.some((item) => item.expressionId === manager.defaultExpressionId) ? (
                        <span className="vsm-default">Default</span>
                      ) : null}
                      {assignments.length ? (
                        assignments.map((item) => (
                          <span key={item.expressionId + item.view}>
                            {manager.expressions.find((expression) => expression.id === item.expressionId)?.name} ·{" "}
                            {item.view === "front" ? "Front" : "Side"}
                          </span>
                        ))
                      ) : (
                        <span>Unassigned</span>
                      )}
                      {unsaved ? <span>Unsaved</span> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
          {selected && draft && frame ? (
            <>
              <section className="vsm-panel vsm-preview" aria-label="Scene preview">
                <div className="vsm-preview-head">
                  <h3>Scene preview</h3>
                  <div className="vsm-toggle" role="group" aria-label="Preview screen">
                    <button aria-pressed={!previewMobile} onClick={() => setPreviewMobile(false)}>
                      Desktop
                    </button>
                    <button aria-pressed={previewMobile} onClick={() => setPreviewMobile(true)}>
                      Mobile
                    </button>
                  </div>
                </div>
                <div className="vsm-scene" data-mobile={previewMobile} data-half={manager.framing.mode === "half"}>
                  <PixelPreview image={currentPreview?.image ?? null} />
                </div>
                {!currentPreview && !pixelError ? <p className="vsm-hint">Updating preview…</p> : null}
                {pixelError ? (
                  <>
                    <p role="alert" className="vsm-alert vsm-error">
                      {pixelError}
                    </p>
                    <button
                      onClick={() => {
                        setPixelError("");
                        setPixelAttempt((prior) => prior + 1);
                      }}
                    >
                      Retry preview
                    </button>
                  </>
                ) : null}
                {currentPreview?.warnings.map((warning) => (
                  <p className="vsm-alert" key={warning}>
                    {warning}
                  </p>
                ))}
                <details>
                  <summary>Compare with default</summary>
                  <div className="vsm-comparison">
                    <figure>
                      <div className="vsm-image">
                        <PixelPreview image={currentPreview?.image ?? null} />
                        <span className="vsm-safe" />
                      </div>
                      <figcaption>Selected · 1024 × 1536</figcaption>
                    </figure>
                    <figure>
                      <div className="vsm-image">
                        {defaultArt ? <img src={defaultArt.rendered.url} alt="Default expression" /> : null}
                        <span className="vsm-safe" />
                      </div>
                      <figcaption>Default{defaultArt ? "" : " · not chosen yet"}</figcaption>
                    </figure>
                  </div>
                </details>
              </section>
              <div className="vsm-panel vsm-settings">
                <section className="vsm-actions" aria-label="Save artwork">
                  <div className="vsm-actions-buttons">
                    <button className="vsm-primary" disabled={!canSave} onClick={() => void perform(save)}>
                      Save and use in Scenes
                    </button>
                    <button disabled={busy || !dirty} onClick={() => discard(selected.id)}>
                      Discard changes
                    </button>
                    <details className="vsm-more" ref={moreActions}>
                      <summary aria-label="More artwork actions">•••</summary>
                      <div className="vsm-more-menu">
                        <button
                          disabled={
                            busy ||
                            dirty ||
                            !draft.expressionId ||
                            !manager.assignments.some(
                              (item) => item.expressionId === draft.expressionId && item.artworkId === selected.id,
                            ) ||
                            manager.defaultExpressionId === draft.expressionId
                          }
                          onClick={() => {
                            closeMoreActions();
                            void perform(async () => {
                              accept(await call<Saved>("default", { expressionId: draft.expressionId }));
                              setNotice("Default expression saved.");
                            });
                          }}
                        >
                          Make default
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => {
                            closeMoreActions();
                            void perform(async () => {
                              const response = await fetch(selected.rendered.url);
                              if (!response.ok) throw new Error("The saved PNG could not be downloaded.");
                              const url = URL.createObjectURL(await response.blob());
                              const link = document.createElement("a");
                              link.href = url;
                              link.download = `${(baseline?.name ?? selected.name).replace(/[^a-z0-9_-]/gi, "-") || "sprite"}-${baseline?.view ?? "front"}.png`;
                              link.click();
                              setTimeout(() => URL.revokeObjectURL(url), 30000);
                            });
                          }}
                        >
                          Download saved PNG
                        </button>
                        <button
                          className="vsm-danger"
                          disabled={busy}
                          onClick={() => {
                            const count = manager.assignments.filter((item) => item.artworkId === selected.id).length;
                            if (
                              !window.confirm(
                                `Remove ${selected.name}? This removes its ${count} Scene ${count === 1 ? "assignment" : "assignments"} and any unsaved edits to this image.`,
                              )
                            )
                              return;
                            closeMoreActions();
                            void perform(async () => {
                              const saved = await call<Saved>("remove", {
                                artworkId: selected.id,
                                expectedUrl: selected.rendered.url,
                              });
                              discard(selected.id);
                              accept(saved);
                              setNotice("Artwork removed from Sprite Manager and its Scene assignments.");
                            });
                          }}
                        >
                          Remove artwork
                        </button>
                      </div>
                    </details>
                  </div>
                  <p className="vsm-hint">
                    {busy
                      ? "Saving…"
                      : dirtyCount
                        ? `Unsaved changes · ${dirtyCount} ${dirtyCount === 1 ? "image" : "images"}`
                        : selected && !manager.assignments.some((item) => item.artworkId === selected.id)
                          ? "Not yet assigned"
                          : "Changes saved"}
                  </p>
                  {feedback}
                </section>
                <section aria-label="Expression and facing">
                  <h3>Expression</h3>
                  <label>
                    Expression
                    <select
                      ref={expressionSelect}
                      aria-label="Expression"
                      disabled={busy}
                      value={draft.expressionId}
                      onChange={(event) => {
                        const id = event.target.value,
                          expression = manager.expressions.find((item) => item.id === id);
                        edit({
                          expressionId: id,
                          name: expression?.name ?? selected.name.replace(/\.[^.]+$/, "").replace(/^full_/, ""),
                          useWhen: expression?.useWhen ?? "",
                        });
                      }}
                    >
                      <option value="">New expression</option>
                      {manager.expressions.map((item) => (
                        <option value={item.id} key={item.id}>
                          {item.name}
                          {item.id === manager.defaultExpressionId ? " · Default" : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Expression name
                    <input
                      value={draft.name}
                      maxLength={100}
                      disabled={busy}
                      onChange={(event) => edit({ name: event.target.value })}
                    />
                  </label>
                  <div>
                    <p className="vsm-hint">Facing</p>
                    <div className="vsm-toggle" role="group" aria-label="Facing">
                      {(["front", "side"] as const).map((view) => (
                        <button
                          key={view}
                          disabled={busy}
                          aria-pressed={draft.view === view}
                          onClick={() => edit({ view })}
                        >
                          {view === "front" ? "Front" : "Side"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="vsm-hint">Side faces right; Scenes mirror it when looking left.</p>
                  {manager.assignments.some((item) => item.artworkId === selected.id) ? (
                    <div className="vsm-assignments" role="group" aria-label="Saved assignments">
                      <p className="vsm-hint">Assignments</p>
                      {manager.assignments
                        .filter((item) => item.artworkId === selected.id)
                        .map((assignment) => {
                          const facing = assignment.view === "front" ? "Front" : "Side",
                            expression = manager.expressions.find((item) => item.id === assignment.expressionId);
                          return (
                            <div className="vsm-assignment" key={assignment.expressionId + assignment.view}>
                              <span>
                                {expression?.name} · {facing}
                              </span>
                              <button
                                disabled={busy || dirty}
                                aria-label={`Remove ${facing} assignment for ${expression?.name}`}
                                onClick={() => {
                                  void perform(async () => {
                                    const saved = await call<Saved>("unassign", {
                                      artworkId: selected.id,
                                      expectedUrl: selected.rendered.url,
                                      expressionId: assignment.expressionId,
                                      view: assignment.view,
                                    });
                                    discard(selected.id);
                                    setContexts((prior) => {
                                      const next = { ...prior };
                                      delete next[selected.id];
                                      return next;
                                    });
                                    accept(saved);
                                    focusExpression.current = true;
                                    setNotice(`${facing} assignment removed. Artwork kept.`);
                                  });
                                }}
                              >
                                Remove {facing} assignment
                              </button>
                            </div>
                          );
                        })}
                      <p className="vsm-hint">
                        {dirty
                          ? "Save or discard this artwork’s edits before removing an assignment."
                          : "Removing an assignment keeps the artwork and its other assignments."}
                      </p>
                    </div>
                  ) : null}
                  <label>
                    Use when…
                    <textarea
                      aria-label="Use when…"
                      value={draft.useWhen}
                      maxLength={1000}
                      disabled={busy}
                      placeholder="For example: listening calmly or speaking with reassurance."
                      onChange={(event) => edit({ useWhen: event.target.value })}
                    />
                  </label>
                  <p className="vsm-hint">
                    Guides the narration AI’s expression choice.
                    {draft.expressionId ? " Name and description apply to every facing of this expression." : ""}
                  </p>
                </section>
                <section aria-label="Framing">
                  <h3>Framing</h3>
                  {(["scale", "offsetX", "offsetY"] as const).map((field) => (
                    <label key={field}>
                      <span className="vsm-slider-label">
                        <span>
                          {{ scale: "Size", offsetX: "Horizontal position", offsetY: "Foot position" }[field]}
                        </span>
                        <span aria-hidden="true">
                          {field === "scale" ? `${Math.round(frame[field] * 100)}%` : `${frame[field]} px`}
                        </span>
                      </span>
                      <input
                        aria-label={{ scale: "Size", offsetX: "Horizontal position", offsetY: "Foot position" }[field]}
                        type="range"
                        min={field === "scale" ? 0.05 : field === "offsetX" ? -1024 : -1536}
                        max={field === "scale" ? 10 : field === "offsetX" ? 1024 : 1536}
                        step={field === "scale" ? 0.05 : 1}
                        value={frame[field]}
                        disabled={busy}
                        onChange={(event) => editFrame({ [field]: Number(event.target.value) })}
                      />
                    </label>
                  ))}
                  <button
                    disabled={busy}
                    onClick={() => edit({ frame: initialSpriteFrame(selected.source.width, selected.source.height) })}
                  >
                    Reset framing
                  </button>
                  <label>
                    Scene framing
                    <select
                      aria-label="Scene framing"
                      disabled={busy}
                      value={manager.framing.mode}
                      onChange={(event) => {
                        const mode = event.target.value;
                        void perform(async () => {
                          accept(await call<Saved>("framing", { mode }));
                          setNotice("Scene framing saved for all of this resident’s artwork.");
                        });
                      }}
                    >
                      <option value="full">Full body</option>
                      <option value="half">Half body</option>
                    </select>
                  </label>
                  <p className="vsm-hint">Applies to all this resident’s artwork and saves immediately.</p>
                  <details>
                    <summary>Advanced framing</summary>
                    <p className="vsm-hint">Exact canvas positions. Foot position 0 aligns feet to y = 1504.</p>
                    <div className="vsm-fields">
                      {(["scale", "offsetX", "offsetY"] as const).map((field) => (
                        <label key={field}>
                          {
                            { scale: "Scale", offsetX: "Horizontal position (px)", offsetY: "Foot position (px)" }[
                              field
                            ]
                          }
                          <input
                            type="number"
                            step={field === "scale" ? 0.05 : 1}
                            disabled={busy}
                            value={frame[field]}
                            onChange={(event) => editFrame({ [field]: Number(event.target.value) })}
                          />
                        </label>
                      ))}
                    </div>
                    <p className="vsm-hint">
                      Crop away extra figures. Optional head and foot markers match body height across poses; use
                      original-image pixel coordinates.
                    </p>
                    <div className="vsm-fields">
                      {(["x", "y", "width", "height", "headY", "footY"] as const).map((field) => (
                        <label key={field}>
                          {
                            {
                              x: "Crop left",
                              y: "Crop top",
                              width: "Crop width",
                              height: "Crop height",
                              headY: "Head marker (optional)",
                              footY: "Foot marker (optional)",
                            }[field]
                          }
                          <input
                            type="number"
                            step={1}
                            value={frame[field] ?? ""}
                            disabled={busy}
                            onChange={(event) =>
                              editFrame({
                                [field]:
                                  event.target.value === "" && (field === "headY" || field === "footY")
                                    ? undefined
                                    : Number(event.target.value),
                              })
                            }
                          />
                        </label>
                      ))}
                    </div>
                    <div
                      className="vsm-original"
                      style={{ aspectRatio: `${selected.source.width}/${selected.source.height}` }}
                    >
                      <img src={selected.source.url} alt="Uploaded original" />
                      <span
                        className="vsm-source-crop"
                        style={{
                          left: `${(100 * frame.x) / selected.source.width}%`,
                          top: `${(100 * frame.y) / selected.source.height}%`,
                          width: `${(100 * frame.width) / selected.source.width}%`,
                          height: `${(100 * frame.height) / selected.source.height}%`,
                        }}
                      />
                      {(["headY", "footY"] as const).map((field) =>
                        frame[field] === undefined ? null : (
                          <span
                            className="vsm-marker"
                            key={field}
                            style={{ top: `${(100 * frame[field]!) / selected.source.height}%` }}
                          />
                        ),
                      )}
                    </div>
                  </details>
                </section>
              </div>
            </>
          ) : (
            <p className="vsm-empty">Select artwork to assign an expression or adjust its framing.</p>
          )}
        </div>
      )}
      <dialog
        ref={libraryDialog}
        className="vsm-dialog"
        aria-label="Engine character sprites"
        onCancel={(event) => {
          if (busy) event.preventDefault();
          else setLibraryOpen(false);
        }}
        onClose={() => setLibraryOpen(false)}
      >
        <div className="vsm-dialog-header">
          <h3>Character library</h3>
          <button disabled={busy} onClick={() => setLibraryOpen(false)} autoFocus>
            Close library
          </button>
        </div>
        <p className="vsm-hint">Independent copies of this character’s Engine sprites. Existing copies are reused.</p>
        {libraryLoading ? (
          <p role="status">Loading character sprites…</p>
        ) : libraryError ? (
          <>
            <p role="alert" className="vsm-alert vsm-error">
              {libraryError}
            </p>
            <button onClick={() => void openLibrary()}>Retry library</button>
          </>
        ) : !library.length ? (
          <p>No supported character sprites are available.</p>
        ) : null}
        {!libraryLoading ? (
          <div className="vsm-library">
            {library.map((item) => (
              <label key={item.filename}>
                <img src={item.url} alt="" loading="lazy" />
                <span>
                  <input
                    type="checkbox"
                    disabled={busy || Boolean(item.adoptedArtworkId)}
                    checked={librarySelected.includes(item.filename)}
                    onChange={(event) =>
                      setLibrarySelected((prior) =>
                        event.target.checked
                          ? [...prior, item.filename]
                          : prior.filter((name) => name !== item.filename),
                      )
                    }
                  />{" "}
                  {item.filename}
                  {item.adoptedArtworkId ? " · Already added" : ""}
                </span>
              </label>
            ))}
          </div>
        ) : null}
        {error && libraryOpen ? (
          <p role="alert" className="vsm-alert vsm-error">
            {error}
          </p>
        ) : null}
        <div className="vsm-dialog-footer">
          <p className="vsm-hint">{librarySelected.length} selected</p>
          <button
            className="vsm-primary"
            disabled={busy || libraryLoading || !librarySelected.length}
            onClick={() =>
              void perform(async () => {
                const saved = await call<Saved>("adopt", { filenames: librarySelected });
                accept(saved, saved.selectedArtworkIds?.[0] ?? saved.addedArtworkIds?.[0]);
                setLibraryOpen(false);
                setNotice(
                  saved.addedArtworkIds?.length
                    ? "Independent artwork copies added. Choose their expressions and facing."
                    : "Selected artwork is already in Sprite Manager.",
                );
              })
            }
          >
            Add selected artwork
          </button>
        </div>
      </dialog>
    </section>
  );
}
