import { useEffect, useRef, useState } from "react";
import {
  SPRITE_STYLES,
  STUDIO_EXPRESSIONS,
  validateStudioCell,
  type StudioCell,
  type StudioData,
  type StudioPlan,
  type StudioSettings,
  type StudioSheet,
  type StudioStyle,
  type StudioView,
} from "../../server/src/services/villages/sprite-studio-model.js";

type Approved = { view: StudioView; label: string; url: string };
type Props = {
  villager: {
    characterId: string;
    name: string;
    sprite?: { images: Approved[]; framing: { mode: "full" | "half"; cropPercent: number } } | null;
  };
  request: <T>(path: string, init?: RequestInit) => Promise<T>;
  onSaved: (snapshot: unknown) => void;
  onBack: () => void;
  onExport: () => Promise<void>;
};
type Candidate = { sheet: StudioSheet; cell: StudioCell };
const message = (error: unknown) => (error instanceof Error ? error.message : "The sprite action failed.");
// LAN HTTP is common on phones; randomUUID requires a secure context, getRandomValues does not.
function submissionId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6]! & 15) | 64;
  bytes[8] = (bytes[8]! & 63) | 128;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
const readFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The file could not be read."));
    reader.readAsDataURL(file);
  });
const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The image could not be loaded."));
    image.src = url;
  });

/** Only remove a saturated edge-connected matte. White paper borders are never keyed out. */
export function clearStudioMatte(context: CanvasRenderingContext2D, width: number, height: number) {
  const pixels = context.getImageData(0, 0, width, height);
  const rgba = pixels.data;
  const corners = [0, width - 1, width * (height - 1), width * height - 1];
  const sample = corners.find((index) => {
    const p = index * 4;
    return (
      rgba[p + 3]! > 240 &&
      Math.max(rgba[p]!, rgba[p + 1]!, rgba[p + 2]!) - Math.min(rgba[p]!, rgba[p + 1]!, rgba[p + 2]!) > 120
    );
  });
  if (sample === undefined) return;
  const rgb = [rgba[sample * 4]!, rgba[sample * 4 + 1]!, rgba[sample * 4 + 2]!];
  const seen = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0,
    tail = 0;
  const add = (index: number) => {
    if (seen[index]) return;
    seen[index] = 1;
    const p = index * 4;
    if (rgba[p + 3]! < 16 || Math.hypot(rgba[p]! - rgb[0]!, rgba[p + 1]! - rgb[1]!, rgba[p + 2]! - rgb[2]!) < 75)
      queue[tail++] = index;
  };
  for (let x = 0; x < width; x++) {
    add(x);
    add((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    add(y * width);
    add(y * width + width - 1);
  }
  while (head < tail) {
    const index = queue[head++]!;
    rgba[index * 4 + 3] = 0;
    if (index % width > 0) add(index - 1);
    if (index % width < width - 1) add(index + 1);
    if (index >= width) add(index - width);
    if (index < width * (height - 1)) add(index + width);
  }
  context.putImageData(pixels, 0, 0);
}

export async function renderStudioCell(
  sheet: StudioSheet,
  cell: StudioCell,
  cleanup = false,
): Promise<HTMLCanvasElement> {
  validateStudioCell(cell, sheet);
  const image = await loadImage(sheet.url);
  const crop = document.createElement("canvas");
  crop.width = cell.width;
  crop.height = cell.height;
  const cropContext = crop.getContext("2d")!;
  cropContext.drawImage(image, cell.x, cell.y, cell.width, cell.height, 0, 0, cell.width, cell.height);
  if (cleanup) clearStudioMatte(cropContext, crop.width, crop.height);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 768;
  const context = canvas.getContext("2d")!;
  const baseScale =
    sheet.baseScale ??
    Math.min(
      512 / Math.max(...sheet.cells.map((item) => item.width)),
      768 / Math.max(...sheet.cells.map((item) => item.height)),
    );
  const scale = baseScale * cell.scale;
  const width = cell.width * scale,
    height = cell.height * scale;
  context.drawImage(crop, (512 - width) / 2 + cell.offsetX, 768 - height + cell.offsetY, width, height);
  return canvas;
}

function CellPreview({ candidate, mirrored = false }: { candidate: Candidate; mirrored?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    void renderStudioCell(candidate.sheet, candidate.cell, candidate.cell.cleanup)
      .then((canvas) => {
        if (!cancelled && ref.current) {
          ref.current.getContext("2d")!.clearRect(0, 0, 512, 768);
          ref.current.getContext("2d")!.drawImage(canvas, 0, 0);
          setError("");
        }
      })
      .catch((error) => {
        if (!cancelled) setError(message(error));
      });
    return () => {
      cancelled = true;
    };
  }, [candidate.sheet, candidate.cell]);
  return (
    <>
      {error ? <small role="alert">{error}</small> : null}
      <canvas
        ref={ref}
        width={512}
        height={768}
        style={{ transform: mirrored ? "scaleX(-1)" : undefined }}
        role="img"
        aria-label={candidate.cell.view + " " + candidate.cell.label}
      />
    </>
  );
}

const css = `
.vss{--ss-panel:#142038;--ss-border:#354865;color:#eef2ff;display:grid;gap:1rem;min-width:0}
.vss *{box-sizing:border-box}.vss button,.vss input,.vss select,.vss textarea{font:inherit}
.vss button{border:1px solid var(--ss-border);border-radius:.65rem;background:#1c2c48;color:#eef2ff;padding:.6rem .85rem;cursor:pointer}
.vss button:hover{background:#2a3b5d}.vss button:disabled{opacity:.5;cursor:default}.vss button[aria-selected=true],.vss button[aria-pressed=true],.vss .vss-primary{background:#6651b5;border-color:#a497ed}
.vss :focus-visible{outline:3px solid #beadff;outline-offset:3px}.vss h2,.vss h3,.vss p{margin:0}
.vss-header,.vss-row{display:flex;flex-wrap:wrap;align-items:center;gap:.65rem}.vss-header{justify-content:space-between}
.vss-header h2{font-size:1.45rem}.vss small,.vss-hint{color:#bcc9e5;font-size:.85rem;line-height:1.5}
.vss-nav{display:flex;gap:.5rem;border-bottom:1px solid var(--ss-border);padding-bottom:.75rem}
.vss-layout{display:grid;grid-template-columns:minmax(230px,.85fr) minmax(320px,1.2fr);gap:1rem;align-items:start}
.vss-panel{background:var(--ss-panel);border:1px solid var(--ss-border);border-radius:1rem;padding:1rem;display:grid;gap:.9rem;min-width:0}
.vss-preview{position:sticky;top:1rem}.vss-stage{height:clamp(280px,52vh,600px);display:grid;grid-template-rows:minmax(0,1fr);grid-template-columns:minmax(0,1fr);place-items:center;overflow:hidden;border-radius:.75rem;background:linear-gradient(#394b70 0 70%,#526279 70% 72%,#253751 72%);position:relative}
.vss-stage[data-background=light]{background:#f3f1ec}.vss-stage[data-background=dark]{background:#111522}.vss-stage[data-background=checker]{background:repeating-conic-gradient(#c1c5cf 0 25%,#edf0f5 0 50%) 0 0/24px 24px}
.vss-stage canvas,.vss-stage img{width:100%;max-width:100%;min-height:0;max-height:100%;height:100%;object-fit:contain;object-position:center bottom}
.vss-stage[data-half=true] canvas,.vss-stage[data-half=true] img{height:calc(100% * 100 / var(--crop));max-width:none;max-height:none;align-self:start}
.vss label{display:grid;gap:.35rem;min-width:0;font-size:.9rem}.vss label.vss-check{display:flex;align-items:center;gap:.45rem}
.vss input:not([type=checkbox]),.vss select,.vss textarea{min-width:0;width:100%;background:#0c172a;border:1px solid #405577;border-radius:.5rem;color:#eef2ff;padding:.6rem}
.vss textarea{min-height:8rem;resize:vertical}.vss input[type=checkbox]{accent-color:#a390f3}
.vss-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(115px,1fr));gap:.6rem}
.vss-card{display:grid;gap:.35rem;min-width:0;padding:.5rem;border:1px solid var(--ss-border);border-radius:.65rem;background:#0d182b}
.vss-card button{padding:.25rem;display:grid;place-items:center}.vss-card canvas,.vss-card img{height:125px;max-width:100%;object-fit:contain}
.vss-fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem}.vss-source{width:100%;max-height:240px;background:#0c1524}
.vss-error{border:1px solid #e28c91;background:#472739;padding:.75rem;border-radius:.6rem;overflow-wrap:anywhere}
.vss-progress{border-left:3px solid #b7a4ff;padding:.4rem .75rem}.vss-reference{max-width:95px;max-height:115px;object-fit:contain}
.vss details{border-top:1px solid var(--ss-border);padding-top:.7rem}.vss summary{cursor:pointer;margin-bottom:.7rem}.vss a{color:#c7baff}
@media(max-width:760px){.vss-layout{grid-template-columns:1fr}.vss-preview{position:static}.vss-stage{height:310px}.vss-panel{padding:.8rem}.vss-header h2{font-size:1.2rem}.vss-fields{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;

export function SpriteStudio({ villager, request, onSaved, onBack, onExport }: Props) {
  const base = "/villagers/" + encodeURIComponent(villager.characterId) + "/sprites";
  const [data, setData] = useState<StudioData | null>(null);
  const [settings, setSettings] = useState<StudioSettings | null>(null);
  const [tab, setTab] = useState<"Create" | "Review" | "Approved">("Create");
  const [view, setView] = useState<StudioView>("front");
  const [labels, setLabels] = useState<string[]>(["neutral"]);
  const [custom, setCustom] = useState("");
  const [poses, setPoses] = useState<Record<string, string>>({});
  const [individual, setIndividual] = useState(false);
  const [plan, setPlan] = useState<StudioPlan | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [focused, setFocused] = useState("");
  const [draft, setDraft] = useState<StudioCell | null>(null);
  const [background, setBackground] = useState("scene");
  const [facing, setFacing] = useState<"front" | "right" | "left">("front");
  const [approvedIndex, setApprovedIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [importImage, setImportImage] = useState("");
  const [manifest, setManifest] = useState<unknown>(null);
  const [columns, setColumns] = useState(1);
  const [rows, setRows] = useState(1);
  const [importLabels, setImportLabels] = useState("neutral");
  const submission = useRef<string | null>(null);
  const replacement = useRef<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const approved = villager.sprite?.images ?? [];
  const hasFront = approved.some((item) => item.view === "front" && item.label === "neutral");
  const hasNeutral = approved.some((item) => item.view === view && item.label === "neutral");
  const running = data?.jobs.some((job) => job.status === "running") ?? false;
  const candidates: Candidate[] = (data?.jobs ?? []).flatMap((job) =>
    job.sheets.flatMap((sheet) =>
      sheet.cells.filter((cell) => cell.status === "candidate").map((cell) => ({ sheet, cell })),
    ),
  );
  const focusedCandidate = candidates.find((item) => item.cell.id === focused);
  const current = focusedCandidate ? { sheet: focusedCandidate.sheet, cell: draft ?? focusedCandidate.cell } : null;
  const previewApproved = approved.filter((item) => item.view === (facing === "front" ? "front" : "side"));
  const activeApproved =
    previewApproved[approvedIndex % Math.max(1, previewApproved.length)] ??
    approved.find((item) => item.view === "front" && item.label === "neutral");
  const consume = (next: StudioData) => {
    setData(next);
  };
  const call = <T,>(action: string, body?: unknown) =>
    request<T>(
      base + "/studio" + (action ? "/" + action : ""),
      body === undefined ? undefined : { method: "POST", body: JSON.stringify(body) },
    );
  useEffect(() => {
    let stopped = false;
    void request<StudioData>(base + "/studio")
      .then((next) => {
        if (!stopped) {
          setData(next);
          setSettings(next.settings);
          if (
            next.jobs.some(
              (job) =>
                job.status !== "ready" ||
                job.sheets.some((sheet) => sheet.cells.some((cell) => cell.status === "candidate")),
            )
          )
            setTab("Review");
        }
      })
      .catch((cause) => {
        if (!stopped) setError(message(cause));
      });
    heading.current?.focus();
    return () => {
      stopped = true;
    };
  }, [base, request]);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      void request<StudioData>(base + "/studio")
        .then(setData)
        .catch((cause) => setError(message(cause)));
    }, 2000);
    return () => window.clearInterval(timer);
  }, [running, base, request]);
  useEffect(() => {
    setLabels(
      replacement.current
        ? [replacement.current]
        : hasNeutral
          ? STUDIO_EXPRESSIONS.filter((label) => label !== "neutral")
          : ["neutral"],
    );
    replacement.current = null;
    setPlan(null);
    submission.current = null;
  }, [view, hasNeutral]);
  async function perform(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNote("");
    try {
      await action();
    } catch (cause) {
      setError(message(cause));
    } finally {
      setBusy(false);
    }
  }
  async function saveSettings() {
    if (settings) {
      consume(await call<StudioData>("settings", settings));
      setNote("Style and connection saved.");
    }
  }
  function changeSettings(next: StudioSettings) {
    setSettings(next);
    setPlan(null);
    submission.current = null;
  }
  function focusCell(item: Candidate) {
    setFocused(item.cell.id);
    setDraft(structuredClone(item.cell));
    setFacing(item.cell.view === "front" ? "front" : "right");
  }
  function selectLabels(next: string[]) {
    setLabels(next);
    setPlan(null);
    submission.current = null;
  }
  const payload = { view, expressions: labels.map((label) => ({ label, pose: poses[label] ?? "" })), individual };
  async function importSheet() {
    if (!importImage) throw new Error("Choose an image to import.");
    const image = await loadImage(importImage);
    let cells: unknown[];
    if (manifest && typeof manifest === "object" && Array.isArray((manifest as { cells?: unknown }).cells)) {
      cells = (manifest as { cells: unknown[] }).cells;
    } else {
      if (!Number.isInteger(columns) || !Number.isInteger(rows) || columns < 1 || rows < 1 || columns * rows > 48)
        throw new Error("Choose a grid of up to 48 cells.");
      const names = importLabels
        .split(",")
        .map((label) => label.trim().toLowerCase().replace(/\s+/g, "_"))
        .filter(Boolean);
      if (!names.length || names.length > columns * rows)
        throw new Error("Supply one label per occupied cell, separated by commas.");
      cells = names.map((label, index) => {
        const x = Math.floor(((index % columns) * image.naturalWidth) / columns),
          y = Math.floor((Math.floor(index / columns) * image.naturalHeight) / rows);
        return {
          label,
          view,
          x,
          y,
          width: Math.floor((((index % columns) + 1) * image.naturalWidth) / columns) - x,
          height: Math.floor(((Math.floor(index / columns) + 1) * image.naturalHeight) / rows) - y,
        };
      });
    }
    consume(await call<StudioData>("import", { image: importImage, cells }));
    setImportImage("");
    setManifest(null);
    setTab("Review");
    setNote("Imported. Review and approve the cells you want.");
  }
  async function approveSelected() {
    const chosen = candidates.filter((item) => selected.includes(item.cell.id));
    if (!chosen.length) throw new Error("Select at least one candidate.");
    if (draft && focusedCandidate && JSON.stringify(draft) !== JSON.stringify(focusedCandidate.cell))
      throw new Error("Save your crop and alignment before approving.");
    const cells = [];
    for (const item of chosen)
      cells.push({
        id: item.cell.id,
        expected: item.cell,
        image: (await renderStudioCell(item.sheet, item.cell, item.cell.cleanup)).toDataURL("image/png"),
      });
    const result = await call<{ studio: StudioData; snapshot: unknown }>("approve", { cells });
    consume(result.studio);
    onSaved(result.snapshot);
    setSelected([]);
    setFocused("");
    setDraft(null);
    setNote("Selected sprites approved.");
  }
  async function deleteCandidate(item: Candidate) {
    if (!window.confirm(`Delete the ${item.cell.view} ${item.cell.label} candidate from review?`)) return;
    consume(await call<StudioData>("discard", { id: item.cell.id }));
    setSelected((ids) => ids.filter((id) => id !== item.cell.id));
    if (focused === item.cell.id) {
      setFocused("");
      setDraft(null);
    }
    setNote("Candidate removed from review.");
  }
  async function removeApproved(item: Approved) {
    if (!window.confirm(`Remove the approved ${item.view} ${item.label} sprite from scenes?`)) return;
    const result = await call<{ studio: StudioData; snapshot: unknown }>("remove", item);
    consume(result.studio);
    onSaved(result.snapshot);
    setApprovedIndex(0);
    setNote("Approved sprite removed from scenes.");
  }
  return (
    <section className="vss" aria-label={villager.name + " Sprite Studio"}>
      <style>{css}</style>
      <header className="vss-header">
        {data?.reference ? (
          <img
            src={data.reference.url}
            alt={villager.name + " reference portrait"}
            style={{ width: 56, height: 64, objectFit: "contain", borderRadius: 8 }}
          />
        ) : null}
        <div>
          <p className="vss-hint">Villagers / {villager.name}</p>
          <h2 ref={heading} tabIndex={-1}>
            {villager.name}’s Sprite Studio
          </h2>
          <small>
            {approved.length} approved · {candidates.length} awaiting review
          </small>
        </div>
        <button
          onClick={() =>
            void perform(async () => {
              await saveSettings();
              onBack();
            })
          }
          disabled={busy}
        >
          ← Back to Villagers
        </button>
      </header>
      {error ? (
        <p className="vss-error" role="alert">
          {error}
        </p>
      ) : null}
      {note ? <p role="status">{note}</p> : null}
      {!data || !settings ? (
        <p role="status">Loading saved sprite work…</p>
      ) : (
        <>
          <nav className="vss-nav" aria-label="Sprite Studio sections">
            {(["Create", "Review", "Approved"] as const).map((name) => (
              <button
                key={name}
                aria-pressed={tab === name}
                onClick={() => {
                  setTab(name);
                  if (name !== "Review") {
                    setFocused("");
                    setDraft(null);
                  }
                }}
              >
                {name}
                {name === "Review" && candidates.length ? " · " + candidates.length : ""}
              </button>
            ))}
          </nav>
          <div className="vss-layout">
            <aside className="vss-panel vss-preview">
              <div className="vss-row">
                {(["front", "right", "left"] as const).map((direction) => (
                  <button key={direction} aria-pressed={facing === direction} onClick={() => setFacing(direction)}>
                    {direction === "front" ? "Facing you" : direction === "right" ? "Facing right" : "Facing left"}
                  </button>
                ))}
              </div>
              <div
                className="vss-stage"
                data-background={background}
                data-half={villager.sprite?.framing.mode === "half"}
                style={{ "--crop": villager.sprite?.framing.cropPercent ?? 58 } as React.CSSProperties}
              >
                {current ? (
                  <CellPreview candidate={current} mirrored={facing === "left" && current.cell.view === "side"} />
                ) : activeApproved ? (
                  <img
                    src={activeApproved.url}
                    alt={activeApproved.label + " approved sprite"}
                    style={{
                      transform: facing === "left" && activeApproved.view === "side" ? "scaleX(-1)" : undefined,
                    }}
                  />
                ) : data.reference ? (
                  <img src={data.reference.url} alt="Captured identity reference" />
                ) : (
                  <p>Capture or upload a reference to begin.</p>
                )}
              </div>
              <label>
                Preview background
                <select value={background} onChange={(event) => setBackground(event.target.value)}>
                  <option value="scene">Sample scene</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="checker">Transparency checkerboard</option>
                </select>
              </label>
              {!current && previewApproved.length ? (
                <div className="vss-row">
                  <button onClick={() => setApprovedIndex((index) => index + 1)}>Next expression</button>
                  <span>{activeApproved?.label}</span>
                </div>
              ) : null}
              <p className="vss-hint">
                Side poses address the other villager, with the body open to the audience. Left uses mirrored
                right-facing art.
              </p>
              {villager.sprite ? (
                <details>
                  <summary>Display framing</summary>
                  <label>
                    Framing
                    <select
                      value={villager.sprite.framing.mode}
                      onChange={(event) =>
                        void perform(async () =>
                          onSaved(
                            await request(base + "/framing", {
                              method: "PATCH",
                              body: JSON.stringify({
                                mode: event.target.value,
                                cropPercent: villager.sprite?.framing.cropPercent ?? 58,
                              }),
                            }),
                          ),
                        )
                      }
                    >
                      <option value="full">Full body</option>
                      <option value="half">Waist up</option>
                    </select>
                  </label>
                  {villager.sprite.framing.mode === "half" ? (
                    <label>
                      Visible height
                      <input
                        type="range"
                        min={40}
                        max={85}
                        value={villager.sprite.framing.cropPercent}
                        onChange={(event) =>
                          void perform(async () =>
                            onSaved(
                              await request(base + "/framing", {
                                method: "PATCH",
                                body: JSON.stringify({ mode: "half", cropPercent: Number(event.target.value) }),
                              }),
                            ),
                          )
                        }
                      />
                    </label>
                  ) : null}
                </details>
              ) : null}
            </aside>
            <div className="vss-panel">
              {tab === "Create" ? (
                <>
                  <h3>Create sprites</h3>
                  <p className="vss-progress">
                    {!hasFront
                      ? "1 · Establish and approve the front neutral."
                      : !approved.some((item) => item.view === "side" && item.label === "neutral")
                        ? "2 · Establish and approve the side neutral."
                        : "3 · Expand the expression set."}
                  </p>
                  <details open={!data.reference}>
                    <summary>Identity reference</summary>
                    {data.reference ? (
                      <div className="vss-row">
                        <img className="vss-reference" src={data.reference.url} alt="Saved reference" />
                        <small>
                          {data.reference.origin === "snapshot"
                            ? "Captured with the villager snapshot"
                            : data.reference.origin === "upload"
                              ? "Uploaded reference"
                              : "Captured from the current card"}{" "}
                          · {new Date(data.reference.capturedAt).toLocaleDateString()}
                        </small>
                      </div>
                    ) : (
                      <>
                        <p className="vss-hint">
                          This older snapshot has no saved avatar. Capturing now uses the current card, not its
                          historical avatar.
                        </p>
                        <div className="vss-row">
                          <button
                            disabled={busy}
                            onClick={() => void perform(async () => consume(await call<StudioData>("reference", {})))}
                          >
                            Capture current card avatar
                          </button>
                          <label>
                            Upload reference
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file)
                                  void perform(async () =>
                                    consume(await call<StudioData>("reference", { image: await readFile(file) })),
                                  );
                              }}
                            />
                          </label>
                        </div>
                      </>
                    )}
                  </details>
                  <label>
                    Image connection
                    <select
                      value={settings.connectionId}
                      onChange={(event) => changeSettings({ ...settings, connectionId: event.target.value })}
                      onBlur={() => void perform(saveSettings)}
                    >
                      <option value="">Village default</option>
                      {settings.connectionId && !data.connections.some((item) => item.id === settings.connectionId) ? (
                        <option value={settings.connectionId}>Unavailable saved connection — choose another</option>
                      ) : null}
                      {data.connections.map((connection) => (
                        <option key={connection.id} value={connection.id}>
                          {connection.name} · {connection.model}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Style example
                    <select
                      value={settings.style}
                      onChange={(event) => changeSettings({ ...settings, style: event.target.value as StudioStyle })}
                      onBlur={() => void perform(saveSettings)}
                    >
                      {Object.keys(SPRITE_STYLES).map((style) => (
                        <option key={style} value={style}>
                          {style === "PAPERCRAFT" ? "Papercraft" : style === "BATTLEHIGHWAY" ? "Battle Highway" : style}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Draw it in this style
                    <textarea
                      value={settings.prompts[settings.style]}
                      maxLength={6000}
                      onChange={(event) =>
                        changeSettings({
                          ...settings,
                          prompts: { ...settings.prompts, [settings.style]: event.target.value },
                        })
                      }
                      onBlur={() => void perform(saveSettings)}
                    />
                  </label>
                  <div className="vss-row">
                    <button disabled={busy} onClick={() => void perform(saveSettings)}>
                      Save style and connection
                    </button>
                    {settings.style !== "Custom" ? (
                      <button
                        onClick={() =>
                          changeSettings({
                            ...settings,
                            prompts: { ...settings.prompts, [settings.style]: SPRITE_STYLES[settings.style] },
                          })
                        }
                      >
                        Reset example
                      </button>
                    ) : null}
                  </div>
                  <p className="vss-hint">
                    Changes apply to future draws. To restyle the whole character, replace the neutrals first, then
                    regenerate chosen expressions.
                  </p>
                  <label>
                    View
                    <select
                      value={view}
                      onChange={(event) => {
                        setView(event.target.value as StudioView);
                        setFacing(event.target.value === "front" ? "front" : "right");
                      }}
                    >
                      <option value="front">Front · facing you</option>
                      <option value="side">Side · facing villagers</option>
                    </select>
                  </label>
                  <div className="vss-grid">
                    {[...new Set([...STUDIO_EXPRESSIONS, ...approved.map((item) => item.label), ...labels])].map(
                      (label) => (
                        <label key={label} className="vss-check">
                          <input
                            type="checkbox"
                            checked={labels.includes(label)}
                            disabled={label !== "neutral" && !hasNeutral}
                            onChange={(event) =>
                              selectLabels(
                                event.target.checked ? [...labels, label] : labels.filter((item) => item !== label),
                              )
                            }
                          />
                          {label.replace(/_/g, " ")}
                        </label>
                      ),
                    )}
                  </div>
                  <div className="vss-row">
                    <label>
                      Custom expression
                      <input value={custom} onChange={(event) => setCustom(event.target.value)} maxLength={40} />
                    </label>
                    <button
                      disabled={!hasNeutral || !custom.trim()}
                      onClick={() => {
                        const label = custom.trim().toLowerCase().replace(/\s+/g, "_");
                        if (!/^[a-z0-9_-]{1,40}$/.test(label)) {
                          setError("Use letters, numbers, dashes, or underscores.");
                          return;
                        }
                        selectLabels([...new Set([...labels, label])]);
                        setCustom("");
                      }}
                    >
                      Add expression
                    </button>
                  </div>
                  <details>
                    <summary>Expression poses</summary>
                    {labels.map((label) => (
                      <label key={label}>
                        {label}
                        <input
                          value={poses[label] ?? ""}
                          maxLength={500}
                          placeholder="Optional gesture or pose"
                          onChange={(event) => {
                            setPoses({ ...poses, [label]: event.target.value });
                            setPlan(null);
                            submission.current = null;
                          }}
                        />
                      </label>
                    ))}
                  </details>
                  <label className="vss-check">
                    <input
                      type="checkbox"
                      checked={individual}
                      onChange={(event) => {
                        setIndividual(event.target.checked);
                        setPlan(null);
                        submission.current = null;
                      }}
                    />
                    Generate individual images instead of sheets
                  </label>
                  <button
                    disabled={busy || running || !labels.length || (view === "side" && !hasFront)}
                    onClick={() =>
                      void perform(async () => {
                        await saveSettings();
                        setPlan(await call<StudioPlan>("plan", payload));
                        submission.current = null;
                      })
                    }
                  >
                    Review generation plan
                  </button>
                  {plan ? (
                    <div className="vss-panel">
                      <strong>
                        {plan.connection.name} · {plan.connection.model}
                      </strong>
                      <p>
                        {plan.batches.length} image {plan.batches.length === 1 ? "submission" : "submissions"} ·{" "}
                        {labels.length} expressions ·{" "}
                        {plan.estimatedCost === null
                          ? "Cost unavailable"
                          : "Estimated $" + plan.estimatedCost.toFixed(3)}
                      </p>
                      {plan.batches.map((batch, index) => (
                        <small key={index}>
                          Sheet {index + 1}: {batch.cols} × {batch.rows} cells · {batch.width} × {batch.height}px ·{" "}
                          {batch.count} expressions
                        </small>
                      ))}
                      <small>
                        {plan.localWorkflow
                          ? "A local workflow may run multiple internal steps. Internal counts and cost are unavailable."
                          : "Reference inputs may also be billed."}{" "}
                        Villages sends one Engine request per listed sheet and never retries automatically.
                        Provider-internal attempts and usage are unavailable; Studio blocks a separately configured
                        Engine fallback.
                      </small>
                      {plan.customParametersIgnored ? (
                        <small>
                          Custom connection request fields are ignored for Studio draws so they cannot override the
                          reviewed model, size, prompt, or image count.
                        </small>
                      ) : null}
                      <button
                        className="vss-primary"
                        disabled={busy || running}
                        onClick={() =>
                          void perform(async () => {
                            submission.current ??= submissionId();
                            consume(
                              await call<StudioData>("jobs", { ...payload, submissionId: submission.current, plan }),
                            );
                            setTab("Review");
                          })
                        }
                      >
                        Generate selected sprites
                      </button>
                    </div>
                  ) : null}
                  <details>
                    <summary>Import sprites or a sheet · no image calls</summary>
                    <label>
                      Image
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void perform(async () => setImportImage(await readFile(file)));
                        }}
                      />
                    </label>
                    <label>
                      Optional exported JSON manifest
                      <input
                        type="file"
                        accept=".json,application/json"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void perform(async () => setManifest(JSON.parse(await file.text())));
                        }}
                      />
                    </label>
                    {!manifest ? (
                      <>
                        <div className="vss-fields">
                          <label>
                            Columns
                            <input
                              type="number"
                              min={1}
                              max={8}
                              value={columns}
                              onChange={(event) => setColumns(Number(event.target.value))}
                            />
                          </label>
                          <label>
                            Rows
                            <input
                              type="number"
                              min={1}
                              max={24}
                              value={rows}
                              onChange={(event) => setRows(Number(event.target.value))}
                            />
                          </label>
                        </div>
                        <label>
                          Labels in reading order
                          <input value={importLabels} onChange={(event) => setImportLabels(event.target.value)} />
                        </label>
                        <small>Uses the selected front/side view above. A single image uses a 1 × 1 grid.</small>
                      </>
                    ) : (
                      <small>Cell positions and views will be read from the manifest.</small>
                    )}
                    <button disabled={busy || !importImage} onClick={() => void perform(importSheet)}>
                      Import for review
                    </button>
                  </details>
                </>
              ) : tab === "Review" ? (
                <>
                  <h3>Review candidates</h3>
                  {data.jobs.map((job) => (
                    <div key={job.id} className="vss-progress">
                      <strong>
                        {job.model || "Generation"} · {job.status}
                      </strong>
                      <small>
                        {" "}
                        · {job.attempted} submitted / {job.planned} planned
                      </small>
                      {job.error ? <p className="vss-hint">{job.error}</p> : null}
                      {job.pendingAssetId && job.status !== "running" ? (
                        <button
                          disabled={busy}
                          onClick={() =>
                            void perform(async () => consume(await call<StudioData>("recover", { id: job.id })))
                          }
                        >
                          Recover saved original · no image call
                        </button>
                      ) : null}
                      {job.sheets.map((sheet) => (
                        <div key={sheet.assetId}>
                          <a href={sheet.url} target="_blank" rel="noreferrer">
                            Open original sheet
                          </a>
                          {sheet.usage ? (
                            <details>
                              <summary>Provider-reported usage</summary>
                              <pre>{JSON.stringify(sheet.usage, null, 2)}</pre>
                            </details>
                          ) : (
                            <small> · Usage unavailable</small>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                  {!candidates.length ? (
                    <p className="vss-hint">
                      {running
                        ? "Generating. You can leave and return; the job and artwork are saved."
                        : "No candidates awaiting review. Create or import a sheet to begin."}
                    </p>
                  ) : (
                    <>
                      <div className="vss-row">
                        <button onClick={() => setSelected(candidates.map((item) => item.cell.id))}>Select all</button>
                        <button onClick={() => setSelected([])}>Clear selection</button>
                        <button
                          disabled={busy || !selected.length}
                          className="vss-primary"
                          onClick={() => void perform(approveSelected)}
                        >
                          Approve selected ({selected.length})
                        </button>
                      </div>
                      <div className="vss-grid">
                        {candidates.map((item) => (
                          <div key={item.cell.id} className="vss-card">
                            <button
                              aria-label={"Edit " + item.cell.view + " " + item.cell.label}
                              aria-pressed={focused === item.cell.id}
                              onClick={() => focusCell(item)}
                            >
                              <CellPreview candidate={item} />
                            </button>
                            <label className="vss-check">
                              <input
                                type="checkbox"
                                checked={selected.includes(item.cell.id)}
                                onChange={(event) =>
                                  setSelected(
                                    event.target.checked
                                      ? [...selected, item.cell.id]
                                      : selected.filter((id) => id !== item.cell.id),
                                  )
                                }
                              />
                              {item.cell.label}
                            </label>
                            <small>{item.cell.view}</small>
                            <button disabled={busy} onClick={() => void perform(() => deleteCandidate(item))}>
                              Delete candidate
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {current && draft ? (
                    <div className="vss-panel">
                      <h3>Crop and alignment</h3>
                      <svg
                        className="vss-source"
                        viewBox={`0 0 ${current.sheet.width} ${current.sheet.height}`}
                        role="img"
                        aria-label="Original sheet with selected crop"
                      >
                        <image href={current.sheet.url} width={current.sheet.width} height={current.sheet.height} />
                        <rect
                          x={draft.x}
                          y={draft.y}
                          width={draft.width}
                          height={draft.height}
                          fill="none"
                          stroke="#c5a4ff"
                          strokeWidth={Math.max(3, current.sheet.width / 150)}
                        />
                      </svg>
                      <div className="vss-fields">
                        <label>
                          Expression
                          <input
                            value={draft.label}
                            maxLength={40}
                            onChange={(event) => setDraft({ ...draft, label: event.target.value })}
                          />
                        </label>
                        <label>
                          View
                          <select
                            value={draft.view}
                            onChange={(event) => setDraft({ ...draft, view: event.target.value as StudioView })}
                          >
                            <option value="front">Front</option>
                            <option value="side">Side</option>
                          </select>
                        </label>
                        {(["x", "y", "width", "height", "scale", "offsetX", "offsetY"] as const).map((field) => (
                          <label key={field}>
                            {
                              {
                                x: "Crop X",
                                y: "Crop Y",
                                width: "Crop width",
                                height: "Crop height",
                                scale: "Scale",
                                offsetX: "Horizontal offset",
                                offsetY: "Foot offset",
                              }[field]
                            }
                            <input
                              type="number"
                              step={field === "scale" ? 0.05 : 1}
                              value={draft[field]}
                              onChange={(event) => setDraft({ ...draft, [field]: Number(event.target.value) })}
                            />
                          </label>
                        ))}
                      </div>
                      <label className="vss-check">
                        <input
                          type="checkbox"
                          checked={draft.cleanup ?? false}
                          onChange={(event) => setDraft({ ...draft, cleanup: event.target.checked })}
                        />
                        Remove edge-connected color matte locally
                      </label>
                      <small>
                        Reversible. Preserves off-white paper borders. If a cutout still needs work, correct the crop or
                        import a cleaned image.
                      </small>
                      <div className="vss-row">
                        <button
                          disabled={busy}
                          onClick={() =>
                            void perform(async () => {
                              consume(await call<StudioData>("cell", { id: draft.id, cell: draft }));
                              setNote("Crop and alignment saved.");
                            })
                          }
                        >
                          Save crop and alignment
                        </button>
                        <button disabled={busy} onClick={() => void perform(() => deleteCandidate(current))}>
                          Delete candidate
                        </button>
                        <button
                          disabled={running}
                          onClick={() => {
                            setView(draft.view);
                            if (draft.view !== view) replacement.current = draft.label;
                            setLabels([draft.label]);
                            setPoses({ ...poses, [draft.label]: draft.pose });
                            setIndividual(true);
                            setPlan(null);
                            submission.current = null;
                            setTab("Create");
                            setFocused("");
                            setDraft(null);
                          }}
                        >
                          Prepare individual regeneration
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <h3>Approved sprites</h3>
                  <p className="vss-hint">
                    These sprites are used in scenes. Replacements only become active after approval.
                  </p>
                  {!approved.length ? (
                    <p>No sprites approved yet.</p>
                  ) : (
                    <>
                      <div className="vss-grid">
                        {approved.map((item) => (
                          <div className="vss-card" key={item.view + ":" + item.label}>
                            <button
                              onClick={() => {
                                setFacing(item.view === "front" ? "front" : "right");
                                setApprovedIndex(approved.filter((entry) => entry.view === item.view).indexOf(item));
                              }}
                            >
                              <img src={item.url} alt={item.view + " " + item.label} />
                            </button>
                            <span>{item.label}</span>
                            <small>{item.view}</small>
                            <button
                              onClick={() => {
                                setView(item.view);
                                if (item.view !== view) replacement.current = item.label;
                                setLabels([item.label]);
                                setIndividual(true);
                                setPlan(null);
                                submission.current = null;
                                setTab("Create");
                              }}
                            >
                              Replace
                            </button>
                            <button disabled={busy} onClick={() => void perform(() => removeApproved(item))}>
                              Remove approved sprite
                            </button>
                          </div>
                        ))}
                      </div>
                      <button disabled={busy} onClick={() => void perform(onExport)}>
                        Download both views and manifest
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
