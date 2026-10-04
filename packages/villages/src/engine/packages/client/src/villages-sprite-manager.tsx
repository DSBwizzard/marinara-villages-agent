import { useEffect, useRef, useState } from "react";
import {
  SPRITE_UPLOAD_GUIDANCE,
  type SpriteArtwork,
  type SpriteFrame,
  type SpriteLibraryItem,
  type SpriteManagerState,
  type SpriteView,
} from "../../server/src/services/villages/sprite-manager-model.js";
import { renderSpritePixels, type SpritePixels } from "../../server/src/services/villages/sprite-manager-pixels.js";

type Request = <T>(path: string, init?: RequestInit) => Promise<T>;
type Props = {
  villager: { characterId: string; name: string };
  request: Request;
  onSaved: (snapshot: unknown) => void;
  onBack: () => void;
  backLabel?: string;
};
type Saved = {
  manager: SpriteManagerState;
  snapshot: unknown;
  addedArtworkIds?: string[];
  selectedArtworkIds?: string[];
};
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
    if (image)
      canvas.current
        ?.getContext("2d")
        ?.putImageData(new ImageData(new Uint8ClampedArray(image.data), image.width, image.height), 0, 0);
  }, [image]);
  return <canvas ref={canvas} width={1024} height={1536} aria-label="Framed sprite preview" />;
}
const css = `
.vsm{--sm-line:color-mix(in srgb,var(--foreground,#edf0f5) 18%,transparent);--sm-panel:color-mix(in srgb,var(--background,#101a29) 94%,var(--foreground,#edf0f5));color:var(--foreground,#edf0f5);display:grid;gap:1.25rem;padding:1rem;min-width:0;max-width:100%;box-sizing:border-box}
.vsm *{box-sizing:border-box}.vsm h2,.vsm h3,.vsm p,.vsm figure{margin:0}.vsm header{display:flex;align-items:center;gap:1rem;flex-wrap:wrap}.vsm header div{flex:1}.vsm header small{display:block;margin-top:.3rem;opacity:.7}.vsm button,.vsm input,.vsm select,.vsm textarea{font:inherit;color:inherit;border:1px solid var(--sm-line);border-radius:.45rem;background:var(--sm-panel);padding:.6rem .75rem;min-height:44px}.vsm button{cursor:pointer}.vsm button:disabled{opacity:.5;cursor:default}.vsm :focus-visible{outline:3px solid var(--primary,#b6a0ed);outline-offset:3px}.vsm .vsm-primary{background:var(--primary,#8670bb);color:var(--primary-foreground,#fff);border-color:transparent}.vsm-toolbar{display:flex;gap:.6rem;flex-wrap:wrap}.vsm-guidance{padding:1rem;border:1px solid var(--sm-line);border-radius:.75rem;line-height:1.5;font-size:.9rem}.vsm-layout{display:grid;grid-template-columns:minmax(200px,.65fr) minmax(0,1.6fr);gap:1.2rem}.vsm-artwork{display:grid;grid-template-columns:repeat(auto-fill,minmax(115px,1fr));gap:.65rem;align-content:start}.vsm-artwork button{padding:.35rem;min-width:0;overflow:hidden;text-align:left}.vsm-artwork button[aria-pressed=true]{outline:2px solid var(--primary,#b6a0ed)}.vsm-artwork img{display:block;width:100%;height:170px;object-fit:contain;background:repeating-conic-gradient(#8792a522 0 25%,transparent 0 50%) 0 0/14px 14px}.vsm-artwork span{display:block;padding:.4rem;overflow-wrap:anywhere;font-size:.85rem}.vsm-editor{display:grid;gap:1rem;min-width:0}.vsm-panel{border:1px solid var(--sm-line);background:var(--sm-panel);padding:1rem;border-radius:.75rem;display:grid;gap:.8rem}.vsm-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem}.vsm label{display:grid;gap:.35rem;font-size:.9rem}.vsm input,.vsm select,.vsm textarea{width:100%;min-width:0}.vsm textarea{min-height:80px;resize:vertical}.vsm-comparison{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem}.vsm-comparison figure{min-width:0}.vsm-image{aspect-ratio:2/3;position:relative;background:repeating-conic-gradient(#8792a522 0 25%,transparent 0 50%) 0 0/16px 16px;overflow:hidden;max-height:390px}.vsm-image canvas,.vsm-image img{display:block;width:100%;height:100%;object-fit:contain}.vsm-safe{position:absolute;inset:2.083333% 3.125%;border:1px dashed #b6a0ed;pointer-events:none}.vsm-comparison figcaption{font-size:.8rem;padding-top:.4rem;opacity:.8}.vsm-alert{padding:.8rem 1rem;border-left:3px solid #e9b87c;background:#d99b4315;line-height:1.5}.vsm-error{border-color:#f09090}.vsm-original{position:relative;max-width:330px;margin:auto}.vsm-original img{display:block;width:100%;max-height:300px;object-fit:contain}.vsm-original-inner{position:relative}.vsm-marker{position:absolute;left:0;right:0;border-top:2px dashed #f5cd82;pointer-events:none}.vsm-source-crop{position:absolute;border:2px solid #b6a0ed;pointer-events:none}.vsm-previews{display:grid;grid-template-columns:1.5fr 1fr;gap:.7rem;align-items:start}.vsm-scene{height:220px;border-radius:.5rem;position:relative;overflow:hidden;background:linear-gradient(#46566a 0 85%,#65735e 85%);display:flex;align-items:end;justify-content:center}.vsm-scene[data-mobile=true]{height:290px;width:100%;max-width:180px;margin:auto}.vsm-scene canvas{height:100%;width:66.6667%;object-fit:contain;object-position:center bottom}.vsm-scene[data-half=true] canvas{object-fit:cover;object-position:center top}.vsm-library{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:.6rem}.vsm-library img{width:100%;height:150px;object-fit:contain}.vsm-library label{border:1px solid var(--sm-line);padding:.6rem;border-radius:.5rem;overflow-wrap:anywhere}.vsm-library input{width:auto}.vsm-empty{padding:2rem 1rem;text-align:center;line-height:1.6;opacity:.8}.vsm-list{display:flex;gap:.5rem;flex-wrap:wrap}.vsm-danger{color:#f3aaaa!important}.vsm-file{position:absolute;width:1px!important;height:1px;opacity:0;pointer-events:none}
@media(max-width:760px){.vsm{padding:.7rem}.vsm-layout{grid-template-columns:1fr}.vsm-artwork{grid-template-columns:repeat(auto-fill,minmax(95px,1fr))}.vsm-artwork img{height:130px}.vsm-image{max-height:280px}.vsm-fields{gap:.5rem}.vsm-toolbar>button{flex:1}.vsm-scene{height:170px}.vsm-scene[data-mobile=true]{height:220px}}
`;

export function SpriteManager({ villager, request, onSaved, onBack, backLabel = "← Back to Villagers" }: Props) {
  const base = `/villagers/${encodeURIComponent(villager.characterId)}/sprites/manager`;
  const [manager, setManager] = useState<SpriteManagerState | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [frame, setFrame] = useState<SpriteFrame | null>(null),
    [pixels, setPixels] = useState<SpritePixels | null>(null);
  const [expressionId, setExpressionId] = useState(""),
    [name, setName] = useState(""),
    [useWhen, setUseWhen] = useState(""),
    [view, setView] = useState<SpriteView>("front");
  const [library, setLibrary] = useState<SpriteLibraryItem[] | null>(null),
    [libraryError, setLibraryError] = useState(""),
    [librarySelected, setLibrarySelected] = useState<string[]>([]);
  const [preview, setPreview] = useState<{ image: SpritePixels | null; warnings: string[]; clipped: boolean }>({
    image: null,
    warnings: [],
    clipped: false,
  });
  const fileInput = useRef<HTMLInputElement>(null),
    heading = useRef<HTMLHeadingElement>(null);
  const selected = manager?.artwork.find((item) => item.id === selectedId);
  const defaultAssignment =
    manager?.assignments.find((item) => item.expressionId === manager.defaultExpressionId && item.view === view) ??
    manager?.assignments.find((item) => item.expressionId === manager.defaultExpressionId);
  const defaultArt = manager?.artwork.find((item) => item.id === defaultAssignment?.artworkId);
  function choose(art: SpriteArtwork, state: SpriteManagerState) {
    setSelectedId(art.id);
    setFrame(art.frame);
    setPixels(null);
    const assigned = state.assignments.find((item) => item.artworkId === art.id);
    const expression = state.expressions.find((item) => item.id === assigned?.expressionId);
    setExpressionId(expression?.id ?? "");
    setName(expression?.name ?? art.name.replace(/\.[^.]+$/, "").replace(/^full_/, ""));
    setUseWhen(expression?.useWhen ?? "");
    setView(assigned?.view ?? "front");
  }
  useEffect(() => {
    let stopped = false;
    request<SpriteManagerState>(base)
      .then((state) => {
        if (stopped) return;
        setManager(state);
        heading.current?.focus();
      })
      .catch((cause: unknown) => {
        if (!stopped) setError(cause instanceof Error ? cause.message : "Sprite Manager could not be opened.");
      });
    return () => {
      stopped = true;
    };
  }, [base, request]);
  useEffect(() => {
    let stopped = false;
    if (selected)
      void loadPixels(selected.source.url)
        .then((source) => {
          if (!stopped) setPixels(source);
        })
        .catch((cause: unknown) => {
          if (!stopped) setError(cause instanceof Error ? cause.message : "The original could not be loaded.");
        });
    return () => {
      stopped = true;
    };
  }, [selected]);
  useEffect(() => {
    let stopped = false;
    void Promise.resolve().then(() => {
      if (stopped) return;
      if (!pixels || !frame) {
        setPreview({ image: null, warnings: [], clipped: false });
        return;
      }
      try {
        const rendered = renderSpritePixels(pixels, frame);
        setPreview({ image: rendered.image, warnings: rendered.warnings, clipped: rendered.clipped });
      } catch (cause) {
        setPreview({
          image: null,
          warnings: [cause instanceof Error ? cause.message : "Check the framing."],
          clipped: true,
        });
      }
    });
    return () => {
      stopped = true;
    };
  }, [pixels, frame]);
  const call = <T,>(action: string, body: unknown = {}) =>
    request<T>(base + "/" + action, { method: "POST", body: JSON.stringify(body) });
  async function perform(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Artwork could not be saved.");
    } finally {
      setBusy(false);
    }
  }
  function accept(saved: Saved, pickId?: string, preserveEditor = false) {
    setManager(saved.manager);
    onSaved(saved.snapshot);
    if (preserveEditor) return;
    const art = saved.manager.artwork.find((item) => item.id === (pickId ?? selectedId));
    if (art) choose(art, saved.manager);
    else {
      setSelectedId("");
      setFrame(null);
      setPixels(null);
    }
  }
  async function upload(files: File[]) {
    const images = [];
    for (const file of files) images.push({ name: file.name, image: await readFile(file) });
    const saved = await call<Saved>("import", { images });
    accept(saved, saved.addedArtworkIds?.[0]);
    setNotice("Artwork uploaded. Choose its expression and facing, then Save and use in Scenes.");
  }
  const dirty = Boolean(selected && frame && JSON.stringify(frame) !== JSON.stringify(selected.frame));
  return (
    <section className="vsm" aria-label={`${villager.name} Sprite Manager`}>
      <style>{css}</style>
      <header>
        <button onClick={onBack} disabled={busy}>
          {backLabel}
        </button>
        <div>
          <h2 ref={heading} tabIndex={-1}>
            {villager.name}’s Sprite Manager
          </h2>
          <small>Finished artwork. Your expressions. One set for every screen.</small>
        </div>
      </header>
      <p className="vsm-guidance">{SPRITE_UPLOAD_GUIDANCE}</p>
      {error ? (
        <p role="alert" className="vsm-alert vsm-error">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="vsm-alert">
          {notice}
        </p>
      ) : null}
      <div className="vsm-toolbar">
        <button className="vsm-primary" disabled={busy || !manager} onClick={() => fileInput.current?.click()}>
          Upload images
        </button>
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
        <button
          disabled={busy || !manager}
          onClick={() =>
            void perform(async () => {
              const answer = await call<{ items: SpriteLibraryItem[]; error: string }>("library");
              setLibrary(answer.items);
              setLibraryError(answer.error);
              setLibrarySelected([]);
            })
          }
        >
          Choose from Engine character sprites
        </button>
      </div>
      {library ? (
        <section className="vsm-panel" aria-label="Engine character sprites">
          <h3>Engine character sprites</h3>
          {libraryError ? (
            <p role="alert">{libraryError}</p>
          ) : !library.length ? (
            <p>No supported character sprites are available.</p>
          ) : null}
          <div className="vsm-library">
            {library.map((item) => (
              <label key={item.filename}>
                <img src={item.url} alt="" loading="lazy" />
                <span>
                  <input
                    type="checkbox"
                    checked={librarySelected.includes(item.filename)}
                    disabled={busy || Boolean(item.adoptedArtworkId)}
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
          <div className="vsm-toolbar">
            <button
              disabled={busy || !librarySelected.length}
              onClick={() =>
                void perform(async () => {
                  const saved = await call<Saved>("adopt", { filenames: librarySelected });
                  accept(saved, saved.selectedArtworkIds?.[0] ?? saved.addedArtworkIds?.[0]);
                  setLibrary(null);
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
            <button disabled={busy} onClick={() => setLibrary(null)}>
              Close library
            </button>
          </div>
        </section>
      ) : null}
      {!manager ? (
        <p role="status">Loading artwork…</p>
      ) : !manager.artwork.length ? (
        <p className="vsm-empty">
          No sprites assigned yet.
          <br />
          Upload finished artwork or choose a character sprite to begin. Until then, Scenes use the character portrait.
        </p>
      ) : (
        <div className="vsm-layout">
          <section aria-label="Artwork">
            <h3>Artwork</h3>
            <div className="vsm-artwork">
              {manager.artwork.map((art) => (
                <button
                  key={art.id}
                  disabled={busy}
                  aria-pressed={art.id === selectedId}
                  onClick={() => choose(art, manager)}
                >
                  <img src={art.rendered.url} alt="" loading="lazy" />
                  <span>{art.name}</span>
                  <span>
                    {manager.assignments.some((item) => item.artworkId === art.id) ? "Assigned" : "Available"}
                  </span>
                </button>
              ))}
            </div>
          </section>
          {!selected || !frame ? (
            <p className="vsm-empty">Select artwork to assign an expression or adjust its framing.</p>
          ) : (
            <div className="vsm-editor">
              <section className="vsm-panel" aria-label="Expression and facing">
                <h3>Expression and facing</h3>
                <label>
                  Expression
                  <select
                    aria-label="Expression"
                    disabled={busy}
                    value={expressionId}
                    onChange={(event) => {
                      const id = event.target.value,
                        expression = manager.expressions.find((item) => item.id === id);
                      setExpressionId(id);
                      setName(expression?.name ?? selected.name.replace(/\.[^.]+$/, ""));
                      setUseWhen(expression?.useWhen ?? "");
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
                <div className="vsm-fields">
                  <label>
                    Expression name
                    <input
                      value={name}
                      maxLength={100}
                      disabled={busy}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </label>
                  <label>
                    Facing
                    <select
                      aria-label="Facing"
                      value={view}
                      disabled={busy}
                      onChange={(event) => setView(event.target.value as SpriteView)}
                    >
                      <option value="front">Front · faces the viewer</option>
                      <option value="side">Side · faces right</option>
                    </select>
                  </label>
                </div>
                <p>Side artwork faces right and mirrors automatically when looking left.</p>
                <label>
                  Use when…
                  <textarea
                    value={useWhen}
                    maxLength={1000}
                    disabled={busy}
                    placeholder="For example: restrained anger when responding to defiance."
                    onChange={(event) => setUseWhen(event.target.value)}
                  />
                </label>
                <p>This description guides the narration AI’s expression choice.</p>
              </section>
              <section className="vsm-panel" aria-label="Framing">
                <h3>Framing</h3>
                <div className="vsm-comparison">
                  <figure>
                    <div className="vsm-image">
                      <PixelPreview image={preview.image} />
                      <span className="vsm-safe" />
                    </div>
                    <figcaption>Selected expression · 1024 × 1536</figcaption>
                  </figure>
                  <figure>
                    <div className="vsm-image">
                      {defaultArt ? <img src={defaultArt.rendered.url} alt="Default expression" /> : null}
                      <span className="vsm-safe" />
                    </div>
                    <figcaption>Default expression{defaultArt ? "" : " · not chosen yet"}</figcaption>
                  </figure>
                </div>
                {preview.warnings.map((warning) => (
                  <p className="vsm-alert" key={warning}>
                    {warning}
                  </p>
                ))}
                <div className="vsm-fields">
                  {(["scale", "offsetX", "offsetY"] as const).map((field) => (
                    <label key={field}>
                      {{ scale: "Scale", offsetX: "Horizontal position", offsetY: "Foot position" }[field]}
                      <input
                        type="number"
                        step={field === "scale" ? 0.05 : 1}
                        value={frame[field]}
                        disabled={busy}
                        onChange={(event) => setFrame({ ...frame, [field]: Number(event.target.value) })}
                      />
                    </label>
                  ))}
                </div>
                <p>Positions shift artwork in canvas pixels. Foot position 0 aligns feet to y = 1504.</p>
                <details>
                  <summary>Crop and body-height markers</summary>
                  <p>
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
                            setFrame({
                              ...frame,
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
                  <div className="vsm-original">
                    <div
                      className="vsm-original-inner"
                      style={{ aspectRatio: `${selected.source.width}/${selected.source.height}` }}
                    >
                      <img
                        src={selected.source.url}
                        alt="Uploaded original"
                        style={{ maxHeight: "none", height: "100%" }}
                      />
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
                  </div>
                </details>
              </section>
              <section className="vsm-panel" aria-label="Scene previews">
                <h3>Scene previews</h3>
                <div className="vsm-previews">
                  {[false, true].map((mobile) => (
                    <figure key={String(mobile)}>
                      <div className="vsm-scene" data-mobile={mobile} data-half={manager.framing.mode === "half"}>
                        <PixelPreview image={preview.image} />
                      </div>
                      <figcaption>{mobile ? "Mobile" : "Desktop"}</figcaption>
                    </figure>
                  ))}
                </div>
                <div className="vsm-fields">
                  <label>
                    Scene framing
                    <select
                      aria-label="Scene framing"
                      disabled={busy}
                      value={manager.framing.mode}
                      onChange={(event) => {
                        const mode = event.target.value;
                        void perform(async () =>
                          accept(
                            await call<Saved>("framing", { mode, cropPercent: manager.framing.cropPercent }),
                            undefined,
                            true,
                          ),
                        );
                      }}
                    >
                      <option value="full">Full body</option>
                      <option value="half">Half body</option>
                    </select>
                  </label>
                </div>
              </section>
              <div className="vsm-toolbar">
                <button
                  className="vsm-primary"
                  disabled={busy || !name.trim() || preview.clipped || !preview.image}
                  onClick={() =>
                    void perform(async () => {
                      accept(
                        await call<Saved>("save", {
                          artworkId: selected.id,
                          expectedUrl: selected.rendered.url,
                          expressionId,
                          name,
                          useWhen,
                          view,
                          frame,
                        }),
                      );
                      setNotice("Expression and artwork saved for Scenes.");
                    })
                  }
                >
                  Save and use in Scenes
                </button>
                <button
                  disabled={
                    busy ||
                    !expressionId ||
                    !manager.assignments.some((item) => item.expressionId === expressionId) ||
                    manager.defaultExpressionId === expressionId
                  }
                  onClick={() =>
                    void perform(async () => accept(await call<Saved>("default", { expressionId }), undefined, true))
                  }
                >
                  Make default
                </button>
                <button
                  disabled={busy || dirty}
                  onClick={() =>
                    void perform(async () => {
                      const response = await fetch(selected.rendered.url);
                      if (!response.ok) throw new Error("The saved PNG could not be downloaded.");
                      const url = URL.createObjectURL(await response.blob());
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${name.replace(/[^a-z0-9_-]/gi, "-") || "sprite"}-${view}.png`;
                      link.click();
                      setTimeout(() => URL.revokeObjectURL(url), 30000);
                    })
                  }
                >
                  Download PNG
                </button>
                <button
                  className="vsm-danger"
                  disabled={busy}
                  onClick={() =>
                    void perform(async () => {
                      accept(
                        await call<Saved>("remove", { artworkId: selected.id, expectedUrl: selected.rendered.url }),
                      );
                      setNotice("Artwork removed from Sprite Manager and its Scene assignments.");
                    })
                  }
                >
                  Remove artwork
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
