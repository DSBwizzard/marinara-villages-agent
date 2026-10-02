import { processStudioCell } from "../../server/src/services/villages/sprite-studio-pixels.js";
import { STUDIO_CLEANUP_VERSION } from "../../server/src/services/villages/sprite-studio-matte.js";
import { createStudioRenderCache, type StudioRenderCache } from "./villages-sprite-render-cache.js";
import { removeStudioMatte } from "../../server/src/services/villages/sprite-studio-matte.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { SpriteCharacterLibrary } from "./villages-sprite-library.js";
import {
  SPRITE_STYLES,
  STUDIO_EXPRESSIONS,
  STUDIO_POSE_MAX_LENGTH,
  STUDIO_FACING_PROMPTS,
  defaultStudioFacingPrompts,
  type StudioExpression,
  validateStudioCell,
  type StudioCell,
  type StudioData,
  type StudioPlan,
  type StudioSettings,
  type StudioSheet,
  type StudioStyle,
  type StudioJob,
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
const STUDIO_RENDER_VERSION = 4;
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

/** Cleanup is shared by gallery previews, scene assignment, and PNG export. */
export function clearStudioMatte(context: CanvasRenderingContext2D, width: number, height: number) {
  const pixels = context.getImageData(0, 0, width, height);
  if (removeStudioMatte(pixels.data, width, height)) context.putImageData(pixels, 0, 0);
}

export function studioRenderKey(sheet: StudioSheet, cell: StudioCell, cleanup = false): string {
  return JSON.stringify({
    source: [sheet.url, sheet.source?.sha256, sheet.source?.matteHex],
    sheetSize: [sheet.width, sheet.height],
    baseScale:
      sheet.baseScale ??
      Math.min(
        512 / Math.max(...sheet.cells.map((item) => item.width)),
        768 / Math.max(...sheet.cells.map((item) => item.height)),
      ),
    crop: [cell.x, cell.y, cell.width, cell.height],
    transform: [cell.scale, cell.offsetX, cell.offsetY],
    canvas: [512, 768],
    cleanup,
    cleanupEngine: cell.cleanupEngine,
    cached: cell.rendered?.sha256,
    processingVersion: cell.processingVersion,
    cleanupVersion: cleanup ? STUDIO_CLEANUP_VERSION : 0,
    rendererVersion: STUDIO_RENDER_VERSION,
  });
}
export async function renderStudioCell(
  sheet: StudioSheet,
  cell: StudioCell,
  cleanup = false,
  cache?: StudioRenderCache<HTMLCanvasElement>,
): Promise<HTMLCanvasElement> {
  validateStudioCell(cell, sheet);
  if (!cache) return renderUncachedStudioCell(sheet, cell, cleanup);
  const cached = await cache.get(studioRenderKey(sheet, cell, cleanup), () =>
    renderUncachedStudioCell(sheet, cell, cleanup),
  );
  // Consumers may draw, resize, or attach their canvas without changing the cache.
  const copy = document.createElement("canvas");
  copy.width = cached.width;
  copy.height = cached.height;
  copy.getContext("2d")!.drawImage(cached, 0, 0);
  return copy;
}
async function renderUncachedStudioCell(
  sheet: StudioSheet,
  cell: StudioCell,
  cleanup = false,
): Promise<HTMLCanvasElement> {
  validateStudioCell(cell, sheet);
  if (cell.cleanupEngine && cell.cleanupEngine !== "studio" && cleanup && cell.rendered) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 768;
    canvas.getContext("2d")!.drawImage(await loadImage(cell.rendered.url), 0, 0);
    return canvas;
  }
  const image = await loadImage(sheet.url);
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = image.naturalWidth;
  sourceCanvas.height = image.naturalHeight;
  const sourceContext = sourceCanvas.getContext("2d")!;
  sourceContext.drawImage(image, 0, 0);
  const pixels = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  const result = processStudioCell(
    { width: sourceCanvas.width, height: sourceCanvas.height, data: pixels.data },
    sheet,
    { ...cell, cleanup },
  );
  if (result.validation.status === "blocked")
    throw new Error(
      result.validation.findings
        .filter((f) => f.severity === "blocking")
        .map((f) => f.message)
        .join(" "),
    );
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 768;
  canvas.getContext("2d")!.putImageData(new ImageData(result.image.data, 512, 768), 0, 0);
  return canvas;
}

function CellPreview({
  candidate,
  mirrored = false,
  renderCache,
}: {
  candidate: Candidate;
  mirrored?: boolean;
  renderCache: StudioRenderCache<HTMLCanvasElement>;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (candidate.cell.rendered) return;
    let cancelled = false;
    void renderStudioCell(candidate.sheet, candidate.cell, candidate.cell.cleanup, renderCache)
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
  }, [candidate.sheet, candidate.cell, renderCache]);
  if (candidate.cell.rendered)
    return (
      <img
        src={candidate.cell.rendered.url}
        alt={candidate.cell.view + " " + candidate.cell.label}
        style={{ transform: mirrored ? "scaleX(-1)" : undefined }}
      />
    );
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

function StudioExpressionEditor({
  slot,
  busy,
  removable,
  onSave,
  onRemove,
}: {
  slot: StudioExpression;
  busy: boolean;
  removable: boolean;
  onSave: (body: Record<string, unknown>) => void;
  onRemove: () => void;
}) {
  return (
    <details>
      <summary>Edit {slot.name}</summary>
      <form
        className="vss-expression-form"
        onSubmit={(event) => {
          event.preventDefault();
          const fields = new FormData(event.currentTarget);
          onSave({
            id: slot.id,
            name: fields.get("name"),
            label: fields.get("name"),
            pose: fields.get("pose"),
            useWhen: fields.get("useWhen"),
          });
        }}
      >
        <label>
          Name
          <input name="name" defaultValue={slot.name} maxLength={40} required />
        </label>
        <label>
          Pose instructions · optional
          <textarea name="pose" defaultValue={slot.pose} maxLength={STUDIO_POSE_MAX_LENGTH} />
        </label>
        <label>
          Use when · optional
          <textarea name="useWhen" defaultValue={slot.useWhen} maxLength={1000} />
        </label>
        <div className="vss-row">
          <button disabled={busy}>Save expression</button>
          <button type="button" disabled={busy || !removable} onClick={onRemove}>
            Remove empty slot
          </button>
        </div>
      </form>
    </details>
  );
}

const css = `
.vss-designs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem}.vss-designs figure{margin:0}.vss-designs .vss-stage{height:auto;aspect-ratio:2/3;max-height:300px}.vss-aligned{position:relative;aspect-ratio:2/3;width:100%;background:#111522}.vss-aligned[data-background=light]{background:#f3f1ec}.vss-aligned[data-background=checker]{background:repeating-conic-gradient(#c1c5cf 0 25%,#edf0f5 0 50%) 0 0/16px 16px}.vss-card .vss-aligned img,.vss-card .vss-aligned canvas{display:block;width:100%;height:100%;object-fit:contain}.vss-design-thumb{max-height:160px;max-width:130px}.vss-safe{position:absolute;inset:2.0833% 3.125%;border:1px dashed #d6baff;pointer-events:none;border-bottom:2px solid #d6baff}.vss{--ss-panel:#142038;--ss-border:#354865;color:#eef2ff;display:grid;gap:1rem;min-width:0}
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
.vss-card,.vss-character-card{display:grid;gap:.35rem;min-width:0;padding:.5rem;border:1px solid var(--ss-border);border-radius:.65rem;background:#0d182b;overflow-wrap:anywhere}
.vss-card button{padding:.25rem;display:grid;place-items:center}.vss-card canvas,.vss-card img{height:125px;max-width:100%;object-fit:contain}
.vss-fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem}.vss-source{width:100%;max-height:240px;background:#0c1524}
.vss-error{border:1px solid #e28c91;background:#472739;padding:.75rem;border-radius:.6rem;overflow-wrap:anywhere}
.vss-progress{border-left:3px solid #b7a4ff;padding:.4rem .75rem}.vss-reference{max-width:95px;max-height:115px;object-fit:contain}
.vss details{border-top:1px solid var(--ss-border);padding-top:.7rem}.vss summary{cursor:pointer;margin-bottom:.7rem}.vss a{color:#c7baff}
.vss-create-panel{max-width:960px;width:100%;margin-inline:auto}.vss .vss-reset{justify-self:start;background:transparent;border:0;padding:.2rem 0;color:#c7baff}.vss .vss-edit-button{justify-self:start}.vss .vss-expressions{display:flex;flex-wrap:wrap}.vss button.vss-style-choice[aria-pressed=true]{background:#292640;border-color:#b29bf1}.vss-style-choices{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.65rem}.vss .vss-style-choice{display:grid;gap:.65rem;text-align:left;align-content:start;padding:.75rem}.vss-example-pair{display:flex;justify-content:center;gap:.4rem}.vss-example{width:100%;max-width:86px;aspect-ratio:2/3;border:1px dashed #6a7b98;border-radius:.4rem;background:#101a2d;display:grid;place-content:center;text-align:center;gap:.25rem;font-size:.72rem;color:#c4cee1}.vss-style-caption{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.35rem}.vss-facing{display:flex;flex-wrap:wrap;gap:.5rem}.vss-facing button{flex:1;min-width:145px}.vss-expressions{display:flex;flex-wrap:wrap;gap:.5rem}.vss-expressions .vss-check{padding:.5rem .65rem;background:#0c172a;border:1px solid var(--ss-border);border-radius:.5rem}.vss-expression-form{display:grid;gap:.75rem;border:1px solid var(--ss-border);border-radius:.65rem;padding:.75rem}.vss-expression-form .vss-fields{grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}.vss-expression-form textarea{min-height:5rem}
@media(max-width:520px){.vss-style-choices{grid-template-columns:1fr}.vss .vss-style-choice{grid-template-columns:1fr auto;align-items:center}.vss-example-pair{min-width:124px}.vss-example{max-width:60px}.vss-style-choice .vss-example{min-width:60px}}
@media(max-width:760px){.vss-layout{grid-template-columns:1fr}.vss-preview{position:static}.vss-stage{height:310px}.vss-panel{padding:.8rem}.vss-header h2{font-size:1.2rem}.vss-fields{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;

export function SpriteStudio({ villager, request, onSaved, onBack, onExport }: Props) {
  const renderCache = useMemo(() => createStudioRenderCache<HTMLCanvasElement>(), []);
  const disposal = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // Strict Mode rehearses cleanup/setup on mount. Cancel that deferred dispose.
    if (disposal.current !== null) clearTimeout(disposal.current);
    return () => {
      disposal.current = setTimeout(() => renderCache.dispose(), 0);
    };
  }, [renderCache]);
  const base = "/villagers/" + encodeURIComponent(villager.characterId) + "/sprites";
  const [data, setData] = useState<StudioData | null>(null);
  const [settings, setSettings] = useState<StudioSettings | null>(null);
  const [tab, setTab] = useState<"Create" | "Review" | "In use">("Create");
  const [view, setView] = useState<StudioView>("front");
  const [labels, setLabels] = useState<string[]>([...STUDIO_EXPRESSIONS]);
  const [custom, setCustom] = useState("");
  const [addingExpression, setAddingExpression] = useState(false);
  const [editingExpressions, setEditingExpressions] = useState(false);
  const [poses, setPoses] = useState<Record<string, string>>({});
  const [individual, setIndividual] = useState(false);
  const [plan, setPlan] = useState<StudioPlan | null>(null);
  const [planError, setPlanError] = useState("");
  const [planning, setPlanning] = useState(false);
  const [picked, setPicked] = useState("");
  const [target, setTarget] = useState("");
  const [draft, setDraft] = useState<StudioCell | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [pendingOnly, setPendingOnly] = useState(false);
  const [showSlots, setShowSlots] = useState(false);
  const [deletion, setDeletion] = useState<{ ids?: string[]; batchId?: string; deleteFiles: boolean } | null>(null);
  const deleteDialog = useRef<HTMLDialogElement>(null);
  const [importImage, setImportImage] = useState("");
  const [manifest, setManifest] = useState<unknown>(null);
  const [columns, setColumns] = useState(1);
  const [rows, setRows] = useState(1);
  const [importLabels, setImportLabels] = useState("neutral");
  const submission = useRef<string | null>(null);
  const lastPayload = useRef("");
  const heading = useRef<HTMLHeadingElement>(null);
  const call = <T,>(action: string, body?: unknown) =>
    request<T>(
      base + "/studio" + (action ? "/" + action : ""),
      body === undefined ? undefined : { method: "POST", body: JSON.stringify(body) },
    );
  const saved = (result: { studio: StudioData; snapshot: unknown }) => {
    setData(result.studio);
    onSaved(result.snapshot);
  };
  const candidates: Candidate[] = (data?.jobs ?? []).flatMap((job) =>
    job.sheets.flatMap((sheet) => sheet.cells.map((cell) => ({ sheet, cell }))),
  );
  const current = candidates.find((item) => item.cell.id === picked);
  const adjusting = draft ? candidates.find((item) => item.cell.id === draft.id) : null;
  const running = data?.jobs.some((job) => job.status === "running") ?? false;
  const approved = villager.sprite?.images ?? [];
  const pending = candidates.filter((item) => item.cell.pending).length;
  const slots = data?.expressions ?? [];
  const selectedEngineProfileId = settings?.styleSelection?.kind === "profile" ? settings.styleSelection.profileId : "";
  const payload = {
    view,
    individual,
    settings: settings ? { ...settings, individual } : settings,
    expressions: labels
      .filter((label) => slots.some((slot) => slot.label === label))
      .map((label) => {
        const slot = slots.find((item) => item.label === label)!;
        return { label, pose: poses[label] ?? slot.pose, expressionId: slot.id };
      }),
  };
  const planKey = JSON.stringify(payload),
    referenceUrl = data?.reference?.url;
  useEffect(() => {
    if (deletion && !deleteDialog.current?.open) deleteDialog.current?.showModal();
    if (!deletion && deleteDialog.current?.open) deleteDialog.current.close();
  }, [deletion]);
  useEffect(() => {
    let stopped = false;
    void request<StudioData>(base + "/studio")
      .then((next) => {
        if (!stopped) {
          setData(next);
          setSettings(next.settings);
          setIndividual(next.settings.individual ?? false);
          if (next.jobs.length) setTab("Review");
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
    let stopped = false;
    setPlan(null);
    setPlanError("");
    if (lastPayload.current !== planKey) {
      submission.current = null;
      lastPayload.current = planKey;
    }
    if (!JSON.parse(planKey).settings || !JSON.parse(planKey).expressions.length) {
      setPlanning(false);
      return;
    }
    setPlanning(true);
    const timer = window.setTimeout(() => {
      void request<StudioPlan>(base + "/studio/plan", { method: "POST", body: planKey })
        .then((next) => {
          if (!stopped) setPlan(next);
        })
        .catch((cause) => {
          if (!stopped) setPlanError(message(cause));
        })
        .finally(() => {
          if (!stopped) setPlanning(false);
        });
    }, 350);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [planKey, referenceUrl, base, request]);
  async function perform(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNote("");
    try {
      await action();
    } catch (cause) {
      setError(message(cause));
      // Expose saved partial cutouts and cleanup receipts for an explicit retry.
      try {
        setData(await call<StudioData>(""));
      } catch {
        /* Preserve the original actionable error. */
      }
    } finally {
      setBusy(false);
    }
  }
  async function generate() {
    const refreshed = await call<StudioPlan>("plan", payload);
    setPlan(refreshed);
    submission.current ??= submissionId();
    try {
      const submittedId = submission.current;
      const next = await call<StudioData>("jobs", { ...payload, plan: refreshed, submissionId: submittedId });
      setData(next);
      submission.current = null;
      if (!next.jobs.some((job) => job.id === submittedId)) {
        setNote("This submission already completed and its artwork was removed. Click Generate to start a new batch.");
        return;
      }
      setTab("Review");
      setNote("Drawing a saved batch. Existing scene images stay active.");
    } catch (cause) {
      if (/plan changed|model changed|size changed/i.test(message(cause))) {
        setPlan(await call<StudioPlan>("plan", payload));
        setNote("Summary refreshed. Click Generate to submit the updated request.");
      } else throw cause;
    }
  }
  async function assign(items: Array<{ candidate: Candidate; expressionId: string }>, batchId?: string) {
    if (!items.length) throw new Error("Choose cutouts and expression slots.");
    const cells = [];
    for (const { candidate: item, expressionId } of items)
      cells.push({
        id: item.cell.id,
        expressionId,
        expected: item.cell,
        ...(item.cell.rendered
          ? {}
          : {
              image: (await renderStudioCell(item.sheet, item.cell, item.cell.cleanup, renderCache)).toDataURL(
                "image/png",
              ),
            }),
      });
    saved(await call<{ studio: StudioData; snapshot: unknown }>("assign", { cells, batchId }));
    setNote("Assigned. These images are now used in scenes.");
  }
  async function applyBatch(job: StudioJob) {
    const remembered = (job.assignments ?? []).filter((entry) => slots.some((slot) => slot.id === entry.expressionId));
    const choices = new Map<string, { candidate: Candidate; expressionId: string }>();
    for (const sheet of job.sheets)
      for (const cell of sheet.cells) {
        if (
          cell.validation?.status === "blocked" ||
          !cell.expressionId ||
          !slots.some((slot) => slot.id === cell.expressionId) ||
          remembered.some((entry) => entry.cellId === cell.id)
        )
          continue;
        choices.set(cell.view + ":" + cell.expressionId, {
          candidate: { sheet, cell },
          expressionId: cell.expressionId,
        });
      }
    for (const entry of remembered) {
      const item = candidates.find((candidate) => candidate.cell.id === entry.cellId);
      if (item && item.cell.validation?.status !== "blocked")
        choices.set(entry.view + ":" + entry.expressionId, { candidate: item, expressionId: entry.expressionId });
    }
    await assign([...choices.values()], job.id);
  }
  async function repairBatch(job: StudioJob) {
    const next = await call<StudioData>("repair-background", { batchId: job.id });
    setData(next);
    setNote("Repaired options saved. Choose Use on a repaired sprite to replace its current assignment.");
  }
  function pick(item: Candidate) {
    setPicked(item.cell.id);
    setTarget(
      data?.assignments.find((entry) => entry.cellId === item.cell.id)?.expressionId ??
        item.cell.expressionId ??
        slots[0]?.id ??
        "",
    );
    setDraft(null);
  }
  async function deleteArtwork(body: { ids?: string[]; batchId?: string; deleteFiles: boolean }) {
    const result = await call<{ studio: StudioData; deleted: number; failures: Array<{ error: string }> }>("delete", {
      ...body,
      confirmed: true,
    });
    setData(result.studio);
    setDeletion(null);
    submission.current = null;
    setPicked("");
    setDraft(null);
    setNote(
      "Artwork removed. " +
        result.deleted +
        " unused files deleted." +
        (result.failures.length
          ? " Use Delete unused files to retry: " + result.failures.map((item) => item.error).join("; ")
          : ""),
    );
  }
  async function importSheet() {
    const image = await loadImage(importImage);
    let cells: unknown[];
    if (manifest && typeof manifest === "object" && Array.isArray((manifest as { cells?: unknown }).cells))
      cells = (manifest as { cells: unknown[] }).cells;
    else {
      if (!Number.isInteger(columns) || !Number.isInteger(rows) || columns < 1 || rows < 1)
        throw new Error("Choose a valid grid.");
      const names = importLabels
        .split(",")
        .map((label) => label.trim().toLowerCase().replace(/\s+/g, "_"))
        .filter(Boolean);
      if (!names.length || names.length > columns * rows)
        throw new Error("Supply one name per occupied cell, separated by commas.");
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
    setData(await call<StudioData>("import", { image: importImage, cells }));
    setImportImage("");
    setManifest(null);
    setTab("Review");
  }
  function retry(job: StudioJob) {
    if (job.style && Object.hasOwn(SPRITE_STYLES, job.style)) {
      const style = job.style as StudioStyle;
      setSettings((prior) =>
        prior
          ? {
              ...prior,
              style,
              connectionId: job.connectionId,
              prompts: { ...prior.prompts, [style]: job.stylePrompt ?? prior.prompts[style] },
              facingPrompts: job.frozenSettings?.facingPrompts ?? prior.facingPrompts,
            }
          : prior,
      );
    }
    const saved = new Set(job.sheets.flatMap((sheet) => sheet.cells.map((cell) => cell.label)));
    const expressions = (job.requestedExpressions ?? job.pendingExpressions ?? []).filter(
      (item) => !saved.has(item.label),
    );
    if (!expressions.length) {
      setNote("All requested images are saved. Choose Regenerate on an image to replace it.");
      return;
    }
    setLabels([...new Set(expressions.map((item) => item.label))]);
    setPoses(Object.fromEntries(expressions.map((item) => [item.label, item.pose])));
    setView(job.view);
    setIndividual(job.individual ?? false);
    submission.current = null;
    setTab("Create");
    setNote("Retry prepared. Generate creates a new batch with the displayed request count.");
  }
  const panel = (
    <aside className="vss-panel vss-slots" data-open={showSlots} aria-label="Expression assignment panel">
      <h3>Expressions · {slots.length}</h3>
      <p className="vss-hint">
        {current
          ? "Selected: " + current.cell.label + " · " + current.cell.view
          : "Select a sprite, then choose its expression and Assign."}
      </p>
      <label>
        Assign selected cutout to
        <select
          aria-label="Assign selected cutout to"
          value={target}
          onChange={(event) => setTarget(event.target.value)}
        >
          <option value="">Choose expression</option>
          {slots.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {slot.name}
            </option>
          ))}
        </select>
      </label>
      <button
        className="vss-primary"
        disabled={busy || !current || !target}
        onClick={() => current && void perform(() => assign([{ candidate: current, expressionId: target }]))}
      >
        Assign
      </button>
      <button className="vss-slot-toggle" aria-expanded={showSlots} onClick={() => setShowSlots(!showSlots)}>
        {showSlots ? "Hide expressions" : "Show expressions"}
      </button>
      <div className="vss-slot-list">
        {slots.map((slot) => {
          const assigned = (data?.assignments ?? []).filter((entry) => entry.expressionId === slot.id);
          return (
            <div key={slot.id} className="vss-slot">
              <strong>
                {slot.name}
                {data?.defaultExpressionId === slot.id ? " · Default" : ""}
              </strong>
              <small>{slot.useWhen || slot.pose || "Uses this expression's name as guidance."}</small>
              <div className="vss-row">
                {assigned.map((entry) => {
                  const item = candidates.find((candidate) => candidate.cell.id === entry.cellId);
                  return item ? (
                    <div key={entry.view} className="vss-mini">
                      <CellPreview renderCache={renderCache} candidate={item} />
                      <small>{entry.view}</small>
                    </div>
                  ) : null;
                })}
                {!assigned.length ? <small>Empty · optional</small> : null}
              </div>
              <button
                disabled={busy || !current}
                aria-label={"Assign selected cutout to " + slot.name}
                onClick={() => current && void perform(() => assign([{ candidate: current, expressionId: slot.id }]))}
              >
                Assign {current?.cell.view ?? ""} here
              </button>
              {assigned.length && data?.defaultExpressionId !== slot.id ? (
                <button
                  disabled={busy}
                  onClick={() =>
                    void perform(async () =>
                      saved(
                        await call<{ studio: StudioData; snapshot: unknown }>("expression", { defaultId: slot.id }),
                      ),
                    )
                  }
                >
                  Use as default scene image
                </button>
              ) : null}
              <StudioExpressionEditor
                key={slot.id + slot.name + slot.pose + slot.useWhen}
                slot={slot}
                busy={busy}
                removable={!assigned.length}
                onSave={(body) =>
                  void perform(async () =>
                    saved(await call<{ studio: StudioData; snapshot: unknown }>("expression", body)),
                  )
                }
                onRemove={() =>
                  void perform(async () =>
                    saved(await call<{ studio: StudioData; snapshot: unknown }>("expression", { removeId: slot.id })),
                  )
                }
              />
            </div>
          );
        })}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const name = custom.trim();
          void perform(async () => {
            saved(await call<{ studio: StudioData; snapshot: unknown }>("expression", { name }));
            setCustom("");
            setLabels((prior) => [...new Set([...prior, name.toLowerCase().replace(/\s+/g, "_")])]);
          });
        }}
      >
        <label>
          New expression
          <input
            value={custom}
            maxLength={40}
            onChange={(event) => setCustom(event.target.value)}
            placeholder="Delighted, running…"
          />
        </label>
        <button disabled={busy || !custom.trim()}>Add expression</button>
      </form>
    </aside>
  );
  return (
    <section className="vss" aria-label={villager.name + " Sprite Studio"}>
      <style>{css + libraryCss}</style>
      <header className="vss-header">
        <div>
          <p className="vss-hint">Villagers / {villager.name}</p>
          <h2 ref={heading} tabIndex={-1}>
            {villager.name}’s Sprite Studio
          </h2>
          <small>
            {approved.length} in use · {candidates.length} saved sprites
          </small>
        </div>
        <button
          disabled={busy}
          onClick={() =>
            void perform(async () => {
              if (settings) await call("settings", settings);
              onBack();
            })
          }
        >
          ← Back to Villagers
        </button>
      </header>
      {error && !deletion ? (
        <p className="vss-error" role="alert">
          {error}
        </p>
      ) : null}
      <p role="status" aria-live="polite">
        {note}
      </p>
      {!data || !settings ? (
        <p>Loading saved sprite work…</p>
      ) : (
        <>
          <nav className="vss-nav" aria-label="Sprite Studio sections">
            {(["Create", "Review", "In use"] as const).map((name) => (
              <button
                key={name}
                aria-pressed={tab === name}
                onClick={() => {
                  setTab(name);
                  setDraft(null);
                }}
              >
                {name}
                {name === "Review" && pending ? " · " + pending : ""}
              </button>
            ))}
          </nav>
          {tab === "Create" ? (
            <div className="vss-panel vss-create-panel">
              <h3>Create sprites</h3>
              <div className="vss-style-choices" role="group" aria-label="Choose a style">
                {(Object.keys(SPRITE_STYLES) as StudioStyle[]).map((style) => {
                  const name =
                    style === "PAPERCRAFT"
                      ? "Papercraft"
                      : style === "BATTLEHIGHWAY"
                        ? "Battle Highway"
                        : "Write your own";
                  return (
                    <button
                      key={style}
                      type="button"
                      className="vss-style-choice"
                      aria-label={name}
                      aria-pressed={settings.styleSelection?.kind === "studio" && settings.style === style}
                      onClick={() => setSettings({ ...settings, style, styleSelection: { kind: "studio" } })}
                    >
                      <strong>{name}</strong>
                      {style === "Custom" ? (
                        <span className="vss-example" aria-hidden="true">
                          Your style
                        </span>
                      ) : (
                        <span className="vss-example-pair">
                          {(["front", "side"] as const).map((exampleView) => (
                            <span
                              className="vss-example"
                              key={exampleView}
                              role="img"
                              aria-label={name + " " + exampleView + " example placeholder, 512 by 768 pixels"}
                            >
                              <span>{exampleView === "front" ? "Front" : "Side"}</span>
                              <span>512 × 768 px</span>
                              <span>Example art</span>
                            </span>
                          ))}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <small>
                Example spaces are reserved for your artwork. They are visual guides, never character references.
              </small>
              <div className="vss-style-caption">
                {settings.styleSelection?.kind !== "studio" ? <strong>Engine style</strong> : null}
                {settings.styleSelection?.kind === "studio" &&
                settings.style !== "Custom" &&
                settings.prompts[settings.style] !== SPRITE_STYLES[settings.style] ? (
                  <span className="vss-badge">Edited</span>
                ) : null}
              </div>
              {settings.styleSelection?.kind === "studio" ? (
                <>
                  <small>Start with a template. Make it yours.</small>
                  <label>
                    {settings.style === "Custom" ? "Your style prompt" : "Style prompt"}
                    <textarea
                      aria-label="Style prompt"
                      value={settings.prompts[settings.style]}
                      maxLength={6000}
                      onChange={(event) =>
                        setSettings({
                          ...settings,
                          prompts: { ...settings.prompts, [settings.style]: event.target.value },
                        })
                      }
                    />
                  </label>
                  {settings.style !== "Custom" ? (
                    <button
                      className="vss-reset"
                      type="button"
                      onClick={() =>
                        setSettings({
                          ...settings,
                          prompts: { ...settings.prompts, [settings.style]: SPRITE_STYLES[settings.style] },
                        })
                      }
                    >
                      Reset to template
                    </button>
                  ) : null}
                </>
              ) : (
                <p className="vss-hint">
                  Using{" "}
                  {settings.styleSelection?.kind === "profile"
                    ? (data.styleProfiles?.profiles.find((profile) => profile.id === selectedEngineProfileId)?.name ??
                      "the selected Engine profile")
                    : "Engine’s configured style"}
                  . Choose a template above to write your own style guidance.
                </p>
              )}
              <strong>Facing</strong>
              <div className="vss-facing" role="group" aria-label="Facing">
                <button type="button" aria-pressed={view === "front"} onClick={() => setView("front")}>
                  Front · facing you
                </button>
                <button type="button" aria-pressed={view === "side"} onClick={() => setView("side")}>
                  Side · conversation stance
                </button>
              </div>
              <label>
                Facing prompt
                <textarea
                  aria-label="Facing prompt"
                  maxLength={6000}
                  value={settings.facingPrompts?.[settings.style]?.[view] ?? STUDIO_FACING_PROMPTS[view]}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      facingPrompts: {
                        ...(settings.facingPrompts ?? defaultStudioFacingPrompts()),
                        [settings.style]: {
                          ...(settings.facingPrompts?.[settings.style] ?? STUDIO_FACING_PROMPTS),
                          [view]: event.target.value,
                        },
                      },
                    })
                  }
                />
              </label>
              <small>Editable guidance for this facing. Front and Side keep separate drafts.</small>
              <button
                className="vss-reset"
                type="button"
                onClick={() =>
                  setSettings({
                    ...settings,
                    facingPrompts: {
                      ...(settings.facingPrompts ?? defaultStudioFacingPrompts()),
                      [settings.style]: {
                        ...(settings.facingPrompts?.[settings.style] ?? STUDIO_FACING_PROMPTS),
                        [view]: STUDIO_FACING_PROMPTS[view],
                      },
                    },
                  })
                }
              >
                Reset facing prompt
              </button>
              <div className="vss-style-caption">
                <strong>Expressions to include</strong>
                <button
                  type="button"
                  aria-expanded={addingExpression}
                  onClick={() => setAddingExpression(!addingExpression)}
                >
                  + Add expression
                </button>
              </div>
              <div className="vss-expressions">
                {slots.map((slot) => (
                  <label className="vss-check" key={slot.id}>
                    <input
                      type="checkbox"
                      checked={labels.includes(slot.label)}
                      onChange={(event) =>
                        setLabels(
                          event.target.checked
                            ? [...labels, slot.label]
                            : labels.filter((label) => label !== slot.label),
                        )
                      }
                    />
                    {slot.name}
                  </label>
                ))}
              </div>
              <button
                className="vss-edit-button"
                type="button"
                aria-expanded={editingExpressions}
                onClick={() => setEditingExpressions(!editingExpressions)}
              >
                Edit expressions
              </button>
              {editingExpressions ? (
                <div aria-label="Edit expressions">
                  {slots.map((slot) => (
                    <StudioExpressionEditor
                      key={slot.id + slot.name + slot.pose + slot.useWhen}
                      slot={slot}
                      busy={busy}
                      removable={!data.assignments.some((entry) => entry.expressionId === slot.id)}
                      onSave={(body) =>
                        void perform(async () => {
                          const result = await call<{ studio: StudioData; snapshot: unknown }>("expression", body);
                          saved(result);
                          const renamed = result.studio.expressions.find((item) => item.id === slot.id)!.label;
                          setLabels((prior) => prior.map((label) => (label === slot.label ? renamed : label)));
                          setPoses((prior) => {
                            const next = { ...prior };
                            delete next[slot.label];
                            next[renamed] = String(body.pose ?? "");
                            return next;
                          });
                        })
                      }
                      onRemove={() =>
                        void perform(async () => {
                          saved(
                            await call<{ studio: StudioData; snapshot: unknown }>("expression", { removeId: slot.id }),
                          );
                          setLabels((prior) => prior.filter((label) => label !== slot.label));
                        })
                      }
                    />
                  ))}
                </div>
              ) : null}
              {addingExpression ? (
                <form
                  className="vss-expression-form"
                  aria-label="New expression"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const fields = new FormData(event.currentTarget);
                    const name = custom.trim();
                    void perform(async () => {
                      const result = await call<{ studio: StudioData; snapshot: unknown }>("expression", {
                        name,
                        pose: fields.get("pose"),
                        useWhen: fields.get("useWhen"),
                      });
                      saved(result);
                      const added = result.studio.expressions.find((slot) => slot.name === name);
                      if (added) setLabels((prior) => [...new Set([...prior, added.label])]);
                      setCustom("");
                      setAddingExpression(false);
                    });
                  }}
                >
                  <strong>New expression</strong>
                  <div className="vss-fields">
                    <label>
                      Name
                      <input
                        aria-label="New expression name"
                        value={custom}
                        maxLength={40}
                        required
                        onChange={(event) => setCustom(event.target.value)}
                        placeholder="Smug, suspicious…"
                      />
                    </label>
                    <label>
                      Pose instructions · optional
                      <textarea name="pose" maxLength={STUDIO_POSE_MAX_LENGTH} />
                    </label>
                    <label>
                      Use when · optional
                      <textarea name="useWhen" maxLength={1000} />
                    </label>
                  </div>
                  <div className="vss-row">
                    <button disabled={busy || !custom.trim()}>Add expression</button>
                    <button type="button" disabled={busy} onClick={() => setAddingExpression(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : null}
              <div aria-label="Generation request summary">
                {planning ? (
                  <p>Preparing…</p>
                ) : plan ? (
                  <p>
                    {payload.expressions.length} expressions · {plan.batches.length} image{" "}
                    {plan.batches.length === 1 ? "request" : "requests"} · {plan.connection.name}
                    {plan.preparationRequests ? " · 1 System request to prepare character expressions on Generate" : ""}
                  </p>
                ) : (
                  <p className="vss-hint">{planError || "Select expressions to generate."}</p>
                )}
              </div>
              <button
                className="vss-primary"
                disabled={busy || running || planning || !plan || !payload.expressions.length}
                onClick={() => void perform(generate)}
              >
                {busy ? "Working…" : "Generate"}
              </button>
              <details>
                <summary>Advanced</summary>
                <label>
                  Style source
                  <select
                    aria-label="Style source"
                    value={settings.styleSelection?.kind ?? "studio"}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        styleSelection:
                          event.target.value === "profile"
                            ? { kind: "profile", profileId: data.styleProfiles?.profiles[0]?.id ?? "" }
                            : { kind: event.target.value as "default" | "studio" },
                      })
                    }
                  >
                    <option value="default">Engine’s configured style</option>
                    <option value="profile">Engine profile</option>
                    <option value="studio">Studio preset / custom</option>
                  </select>
                </label>
                {settings.styleSelection?.kind === "profile" ? (
                  <label>
                    Engine profile
                    <select
                      aria-label="Engine profile"
                      value={settings.styleSelection.profileId}
                      onChange={(event) =>
                        setSettings({ ...settings, styleSelection: { kind: "profile", profileId: event.target.value } })
                      }
                    >
                      {data.styleProfiles?.profiles.map((profile) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                <label>
                  Image connection
                  <select
                    aria-label="Image connection"
                    value={settings.connectionId}
                    onChange={(event) => setSettings({ ...settings, connectionId: event.target.value })}
                  >
                    <option value="">Village default</option>
                    {data.connections.map((connection) => (
                      <option key={connection.id} value={connection.id}>
                        {connection.name} · {connection.model}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Drawing layout
                  <select
                    aria-label="Drawing layout"
                    value={individual ? "individual" : "sheet"}
                    onChange={(event) => setIndividual(event.target.value === "individual")}
                  >
                    <option value="sheet">Sheets · up to six sprites each</option>
                    <option value="individual">Individual sprites</option>
                  </select>
                </label>
                {slots
                  .filter((slot) => labels.includes(slot.label))
                  .map((slot) => (
                    <label key={slot.id}>
                      Pose · {slot.name}
                      <input
                        value={poses[slot.label] ?? slot.pose}
                        maxLength={STUDIO_POSE_MAX_LENGTH}
                        onChange={(event) => setPoses({ ...poses, [slot.label]: event.target.value })}
                      />
                    </label>
                  ))}
                <details>
                  <summary>Image request</summary>
                  {plan?.batches.map((batch, index) => (
                    <section key={index}>
                      <strong>
                        Sheet {index + 1} · {batch.width} × {batch.height}
                      </strong>
                      <pre aria-label={"Sheet " + (index + 1) + " positive prompt"}>{batch.request?.prompt}</pre>
                      <pre aria-label={"Sheet " + (index + 1) + " negative prompt"}>
                        {batch.request?.negativePrompt}
                      </pre>
                    </section>
                  ))}
                </details>
              </details>
              {data.styleError ? <p className="vss-hint">{data.styleError}</p> : null}
              <SpriteCharacterLibrary
                characterId={villager.characterId}
                request={request}
                data={data}
                onData={setData}
                onSaved={saved}
                mode="adopt"
              />
              <details>
                <summary>Import images or a sheet</summary>
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
                          value={columns}
                          onChange={(event) => setColumns(Number(event.target.value))}
                        />
                      </label>
                      <label>
                        Rows
                        <input
                          type="number"
                          min={1}
                          value={rows}
                          onChange={(event) => setRows(Number(event.target.value))}
                        />
                      </label>
                    </div>
                    <label>
                      Expression names in reading order
                      <input value={importLabels} onChange={(event) => setImportLabels(event.target.value)} />
                    </label>
                  </>
                ) : (
                  <small>Using manifest cell positions and views.</small>
                )}
                <button disabled={busy || !importImage} onClick={() => void perform(importSheet)}>
                  Import to gallery
                </button>
              </details>
            </div>
          ) : tab === "Review" ? (
            <>
              <h3>Saved artwork</h3>
              <details>
                <summary>Gallery options</summary>
                <div className="vss-row">
                  <button
                    disabled={busy || !pending}
                    onClick={() =>
                      void perform(async () => {
                        setData(await call<StudioData>("clear-review", {}));
                        setPendingOnly(false);
                        setNote("Pending review cleared. All saved artwork remains available.");
                      })
                    }
                  >
                    Clear pending review
                  </button>
                  <label className="vss-check">
                    <input
                      type="checkbox"
                      checked={pendingOnly}
                      onChange={(event) => setPendingOnly(event.target.checked)}
                    />
                    Pending only
                  </label>
                  <button
                    disabled={busy}
                    onClick={() =>
                      void perform(async () => {
                        if (
                          !window.confirm(
                            "Delete unused Studio-owned files? Saved alternatives, active assignments, shared originals, and the identity reference are retained.",
                          )
                        )
                          return;
                        const result = await call<{
                          studio: StudioData;
                          deleted: number;
                          failures: Array<{ error: string }>;
                        }>("delete-unused", {});
                        setData(result.studio);
                        setNote(
                          result.deleted +
                            " unused files deleted." +
                            (result.failures.length
                              ? " Retry needed: " + result.failures.map((item) => item.error).join("; ")
                              : ""),
                        );
                      })
                    }
                  >
                    Delete unused files
                  </button>
                </div>
              </details>
              <SpriteCharacterLibrary
                characterId={villager.characterId}
                request={request}
                data={data}
                onData={setData}
                onSaved={saved}
                mode="publish"
              />
              <div className="vss-library">
                <div className="vss-gallery">
                  {!data.jobs.length ? (
                    <div className="vss-panel">
                      <p>Generate or import artwork to begin. Each batch stays here for future swaps.</p>
                    </div>
                  ) : null}
                  {[...data.jobs].reverse().map((job) => {
                    const items = job.sheets.flatMap((sheet) =>
                      sheet.cells.filter((cell) => !pendingOnly || cell.pending).map((cell) => ({ sheet, cell })),
                    );
                    if (pendingOnly && !items.length && job.status === "ready") return null;
                    return (
                      <article key={job.id} className="vss-panel" aria-label={"Batch " + job.id}>
                        <h3>
                          {job.resolvedStyle?.name ||
                            (job.style === "PAPERCRAFT"
                              ? "Papercraft"
                              : job.style === "BATTLEHIGHWAY"
                                ? "Battle Highway"
                                : job.style || job.model || "Saved batch")}
                        </h3>
                        <small>
                          {new Date(job.createdAt).toLocaleString()} · {job.model} · {job.attempted} submitted /{" "}
                          {job.planned} planned requests ·{" "}
                          {job.status === "ready"
                            ? "Generation completed"
                            : job.status === "running"
                              ? job.phase === "preparing"
                                ? "Preparing expressions"
                                : "Drawing sprites"
                              : job.status}{" "}
                          · {job.sheets.reduce((count, sheet) => count + sheet.cells.length, 0)} sprites
                        </small>
                        {job.error ? <p className="vss-hint">{job.error}</p> : null}
                        {job.status === "interrupted" && job.preparation ? (
                          <p className="vss-hint">
                            Retry reuses saved work. An uncertain request may already have been billed and may be
                            repeated.
                          </p>
                        ) : null}
                        <div className="vss-row">
                          <button
                            className="vss-primary"
                            disabled={busy || job.status === "running" || !items.length}
                            onClick={() => void perform(() => applyBatch(job))}
                          >
                            Use this batch
                          </button>
                          <button
                            disabled={busy || job.status === "running"}
                            onClick={() => setDeletion({ batchId: job.id, deleteFiles: false })}
                          >
                            Delete batch
                          </button>
                          <button
                            disabled={busy || job.status === "running" || !items.length}
                            onClick={() => void perform(() => repairBatch(job))}
                          >
                            Repair backgrounds
                          </button>
                          {job.status === "interrupted" && job.preparation ? (
                            <button
                              disabled={busy || running}
                              onClick={() =>
                                void perform(async () => {
                                  setData(await call<StudioData>("recover", { id: job.id, retryGeneration: true }));
                                  setNote(
                                    "Retrying this saved batch. Completed directions and artwork will be reused.",
                                  );
                                })
                              }
                            >
                              {job.preparation.status === "ready"
                                ? "Retry remaining images"
                                : "Retry expression preparation"}
                            </button>
                          ) : job.status === "interrupted" ? (
                            <button disabled={busy || running} onClick={() => retry(job)}>
                              Prepare retry
                            </button>
                          ) : null}
                          {job.pendingAssetId && job.status !== "running" ? (
                            <button
                              disabled={busy}
                              onClick={() =>
                                void perform(async () => setData(await call<StudioData>("recover", { id: job.id })))
                              }
                            >
                              Recover saved original · no image request
                            </button>
                          ) : null}
                        </div>
                        {job.preparation ? (
                          <details>
                            <summary>Character expression directions</summary>
                            <p>{job.preparation.interpretation || "Expressions have not been prepared yet."}</p>
                            {job.preparation.expressions?.map((entry) => (
                              <p key={entry.label}>
                                <strong>{entry.name || entry.label}</strong>: {entry.direction}
                                {entry.pose ? " User pose: " + entry.pose : ""}
                              </p>
                            ))}
                            <small>
                              {job.preparation.attempts.length} System preparation request(s). Use Regenerate and edit
                              the pose instructions to change a direction.
                            </small>
                            {job.receipts?.map((batch, index) => (
                              <details key={index}>
                                <summary>Saved image prompt {index + 1}</summary>
                                <pre>{batch.request?.prompt}</pre>
                              </details>
                            ))}
                          </details>
                        ) : null}
                        <div className="vss-originals">
                          {job.sheets.map((sheet, index) => (
                            <details key={sheet.assetId + ":" + index}>
                              <summary>
                                Original sheet {index + 1}
                                <img
                                  className="vss-sheet-thumb"
                                  src={sheet.url}
                                  alt={"Sheet thumbnail " + (index + 1)}
                                />
                              </summary>
                              <a href={sheet.url} target="_blank" rel="noreferrer">
                                <img src={sheet.url} alt={"Original sheet " + (index + 1)} />
                              </a>
                              <small>
                                {sheet.width} × {sheet.height}px · Provider usage{" "}
                                {sheet.usage ? JSON.stringify(sheet.usage) : "unavailable"}
                              </small>
                            </details>
                          ))}
                        </div>
                        <div className="vss-grid">
                          {items.map((item) => {
                            const active = data.assignments.filter((entry) => entry.cellId === item.cell.id);
                            return (
                              <div className="vss-card" key={item.cell.id}>
                                <button
                                  aria-label={"Select " + item.cell.view + " " + item.cell.label + " cutout"}
                                  aria-pressed={picked === item.cell.id}
                                  onClick={() => pick(item)}
                                >
                                  <div className="vss-aligned" data-background="checker">
                                    <CellPreview renderCache={renderCache} candidate={item} />
                                  </div>
                                </button>
                                <strong>{item.cell.label.replaceAll("_", " ")}</strong>
                                <small>{item.cell.view}</small>
                                {item.cell.validation?.findings.length ? (
                                  <details>
                                    <summary>
                                      {item.cell.validation.status === "blocked"
                                        ? "Image unavailable"
                                        : "Check framing"}
                                    </summary>
                                    {item.cell.validation.findings.map((f) => (
                                      <small key={f.code}>{f.message}</small>
                                    ))}
                                  </details>
                                ) : null}
                                <button
                                  className="vss-primary"
                                  disabled={
                                    busy ||
                                    job.status === "running" ||
                                    item.cell.validation?.status === "blocked" ||
                                    !item.cell.expressionId
                                  }
                                  onClick={() =>
                                    void perform(() =>
                                      assign([{ candidate: item, expressionId: item.cell.expressionId! }]),
                                    )
                                  }
                                >
                                  Use
                                </button>
                                <button
                                  disabled={busy || running}
                                  onClick={() => {
                                    if (job.style && Object.hasOwn(SPRITE_STYLES, job.style)) {
                                      const style = job.style as StudioStyle;
                                      setSettings((prior) =>
                                        prior
                                          ? {
                                              ...prior,
                                              style,
                                              styleSelection: job.frozenSettings?.styleSelection ?? { kind: "studio" },
                                              connectionId: job.connectionId || prior.connectionId,
                                              facingPrompts: job.frozenSettings?.facingPrompts ?? prior.facingPrompts,
                                              prompts: {
                                                ...prior.prompts,
                                                [style]: job.stylePrompt ?? prior.prompts[style],
                                              },
                                            }
                                          : prior,
                                      );
                                    }
                                    setView(item.cell.view);
                                    setLabels([item.cell.label]);
                                    setPoses({ [item.cell.label]: item.cell.pose });
                                    setTab("Create");
                                    setNote("Ready to regenerate this expression.");
                                  }}
                                >
                                  Regenerate
                                </button>
                                {active.length ? (
                                  <span className="vss-badge">
                                    In use ·{" "}
                                    {active
                                      .map((entry) => slots.find((slot) => slot.id === entry.expressionId)?.name)
                                      .join(", ")}
                                  </span>
                                ) : (
                                  <small>{item.cell.pending ? "Pending review" : "Saved alternative"}</small>
                                )}
                                <button
                                  disabled={busy}
                                  onClick={() => {
                                    pick(item);
                                    setDraft(structuredClone(item.cell));
                                  }}
                                >
                                  Adjust
                                </button>
                                <button
                                  disabled={busy || job.status === "running"}
                                  onClick={() => setDeletion({ ids: [item.cell.id], deleteFiles: false })}
                                >
                                  Delete
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </article>
                    );
                  })}
                </div>
                <details>
                  <summary>Manage expressions and assignments</summary>
                  {panel}
                </details>
              </div>
              {draft && adjusting ? (
                <div className="vss-panel" aria-label="Adjust image">
                  <h3>Adjust image · saves another cutout</h3>
                  <div className="vss-adjust">
                    <div className="vss-stage" data-background="checker">
                      <CellPreview
                        renderCache={renderCache}
                        candidate={{ sheet: adjusting.sheet, cell: { ...draft, rendered: undefined } }}
                      />
                    </div>
                    <svg
                      className="vss-source"
                      viewBox={"0 0 " + adjusting.sheet.width + " " + adjusting.sheet.height}
                      role="img"
                      aria-label="Original sheet with selected crop"
                    >
                      <image href={adjusting.sheet.url} width={adjusting.sheet.width} height={adjusting.sheet.height} />
                      <rect
                        x={draft.x}
                        y={draft.y}
                        width={draft.width}
                        height={draft.height}
                        fill="none"
                        stroke="#c5a4ff"
                        strokeWidth={Math.max(3, adjusting.sheet.width / 150)}
                      />
                    </svg>
                  </div>
                  <div className="vss-fields">
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
                    Remove background
                  </label>
                  <div className="vss-row">
                    <button
                      disabled={busy}
                      onClick={() =>
                        void perform(async () => {
                          const next = await call<StudioData>("cell", { id: draft.id, cell: draft });
                          setData(next);
                          setPicked(next.adjustedCellId ?? picked);
                          setDraft(null);
                          setNote("Adjusted cutout saved. Assign it when ready.");
                        })
                      }
                    >
                      Save adjusted cutout
                    </button>
                    <button onClick={() => setDraft(null)}>Cancel</button>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="vss-panel">
              <h3>In use</h3>
              <p className="vss-hint">These assignments are used in scenes. Saved alternatives remain in Review.</p>
              <div className="vss-grid">
                {approved.map((item) => (
                  <div className="vss-card" key={item.view + ":" + item.label}>
                    <img src={item.url} alt={item.label + " " + item.view} />
                    <strong>{item.label.replaceAll("_", " ")}</strong>
                    <small>{item.view}</small>
                    <button
                      disabled={busy}
                      onClick={() =>
                        void perform(async () => {
                          saved(await call<{ studio: StudioData; snapshot: unknown }>("remove", item));
                          setNote("Removed from scenes. Saved artwork remains available.");
                        })
                      }
                    >
                      Remove from scenes
                    </button>
                  </div>
                ))}
              </div>
              {!approved.length ? (
                <p>No assigned images yet.</p>
              ) : (
                <>
                  <label>
                    Scene framing
                    <select
                      value={villager.sprite?.framing.mode ?? "full"}
                      onChange={(event) =>
                        void perform(async () =>
                          onSaved(
                            await request(base + "/framing", {
                              method: "POST",
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
                      <option value="half">Half body</option>
                    </select>
                  </label>
                  {villager.sprite?.framing.mode === "half" ? (
                    <label>
                      Visible body height · percent
                      <input
                        type="number"
                        min={40}
                        max={85}
                        defaultValue={villager.sprite.framing.cropPercent}
                        onBlur={(event) => {
                          const cropPercent = Number(event.target.value);
                          if (cropPercent === villager.sprite?.framing.cropPercent) return;
                          void perform(async () =>
                            onSaved(
                              await request(base + "/framing", {
                                method: "POST",
                                body: JSON.stringify({ mode: "half", cropPercent }),
                              }),
                            ),
                          );
                        }}
                      />
                    </label>
                  ) : null}
                  <button disabled={busy} onClick={() => void perform(onExport)}>
                    Download both views and manifest
                  </button>
                </>
              )}
              {panel}
            </div>
          )}
        </>
      )}
      <dialog
        ref={deleteDialog}
        className="vss-delete-dialog"
        aria-labelledby="vss-delete-title"
        onCancel={() => setDeletion(null)}
      >
        {deletion ? (
          <div className="vss-panel">
            <h3 id="vss-delete-title">Delete saved artwork?</h3>
            {error ? (
              <p className="vss-error" role="alert">
                {error}
              </p>
            ) : null}
            <p>
              {deletion.batchId
                ? "Remove this batch from the gallery."
                : "Remove " + deletion.ids?.length + " selected cutouts from the gallery."}{" "}
              Images currently in use are protected.
            </p>
            <label className="vss-check">
              <input
                type="checkbox"
                checked={deletion.deleteFiles}
                onChange={(event) => setDeletion({ ...deletion, deleteFiles: event.target.checked })}
              />
              Also delete unused files from disk
            </label>
            <small>
              Shared originals and retained alternatives stay saved. Files kept on disk can be removed later with Delete
              unused files.
            </small>
            <div className="vss-row">
              <button disabled={busy} onClick={() => setDeletion(null)}>
                Cancel
              </button>
              <button disabled={busy} onClick={() => void perform(() => deleteArtwork(deletion))}>
                Delete artwork
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
const libraryCss = `
.vss-request{min-width:0}.vss pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;font-size:.85rem;max-height:20rem;overflow:auto;background:#0c1524;padding:.7rem;border-radius:.5rem}
.vss-create{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(280px,1fr);gap:1rem;align-items:start}
.vss-create>div:last-child{display:grid;gap:1rem}.vss-library{display:grid;grid-template-columns:minmax(0,1fr);gap:1rem;align-items:start}
.vss-library:has(>details[open]){grid-template-columns:minmax(0,1fr) 310px}.vss-gallery{display:grid;gap:1.25rem;min-width:0}.vss-slots{position:sticky;top:1rem}.vss-slot-list{display:grid;gap:.75rem;max-height:65vh;overflow:auto;padding:.2rem}
.vss-slot{display:grid;gap:.5rem;padding:.7rem;border:1px solid #405577;border-radius:.75rem;background:#0d182b}.vss-slot:hover{border-color:#ac96fa}
.vss-slot form,.vss-slots>form{display:grid;gap:.5rem}.vss-mini{display:grid;gap:.2rem}.vss-mini canvas,.vss-mini img{width:64px;height:96px;object-fit:contain}.vss-slot-toggle{display:none}.vss-originals img.vss-sheet-thumb{display:block;width:150px;height:110px;margin-top:.5rem}
.vss-grid{grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:.8rem}.vss-card{padding:.7rem;gap:.5rem}.vss-card canvas,.vss-card img{height:270px;width:100%;object-fit:contain}
.vss-card>button:first-child{background:repeating-conic-gradient(#27344d 0 25%,#34425a 0 50%) 0 0/20px 20px}.vss-card>button:first-child[aria-pressed=true]{outline:3px solid #c5a4ff}
.vss-badge{color:#d9caff;font-size:.8rem;background:#493767;border-radius:.4rem;padding:.3rem}.vss-originals{display:flex;gap:1rem;flex-wrap:wrap}
.vss-originals details{max-width:100%;flex:1 1 150px}.vss-originals img{max-width:100%;max-height:280px;object-fit:contain;background:#0c172a}
.vss-expressions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem}.vss-adjust{display:grid;grid-template-columns:220px minmax(0,1fr);gap:1rem}.vss-delete-dialog{padding:0;max-width:550px;width:calc(100% - 2rem);background:#142038;color:#eef2ff;border:1px solid #ac96fa;border-radius:1rem}.vss-delete-dialog::backdrop{background:#000a}
.vss-adjust .vss-stage{height:300px}.vss-reference{max-width:100%;width:100%;max-height:240px}
@media(max-width:850px){.vss-library,.vss-library:has(>details[open]),.vss-create{grid-template-columns:1fr}.vss-slots{position:static;order:-1}.vss-slot-toggle{display:block}.vss-slots[data-open=false] .vss-slot-list{display:none}.vss-slot-list{max-height:330px}.vss-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.vss-card canvas,.vss-card img{height:180px}.vss-adjust{grid-template-columns:1fr}.vss-expressions{grid-template-columns:1fr}}
`;
