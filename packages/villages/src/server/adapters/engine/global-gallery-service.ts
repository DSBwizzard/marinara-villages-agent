import type { VillageVenueImage } from "../../domain/models/world.js";

import { asRecord, asTrimmedString } from "../../domain/rules/coerce.js";

import { badRequest, VillagesRequestError } from "../../domain/rules/errors.js";

import {
  globalGalleryRef,
  MAX_VENUE_IMAGE_URL_LENGTH,
  VILLAGES_GALLERY_FOLDER_NAME,
} from "../../domain/rules/prompt-preset.js";

import type { villageEngineForm, villageEngineJson } from "./engine-transport.js";

/** One picture, ready to be handed to the gallery. */
export type VillageGalleryUpload = {
  bytes: Uint8Array;
  /** The type the Engine said it produced, e.g. `image/png`. */
  mime: string;
  /** What the picture is of, used only to name the file. */
  name: string;
  /** What was asked for, kept on the gallery entry so the picture is traceable. */
  prompt: string;
  width?: number;
  height?: number;
};
export type GlobalGalleryPorts = {
  villageEngineJson: typeof villageEngineJson;
  villageEngineForm: typeof villageEngineForm;
};
export function createGlobalGallery(ports: GlobalGalleryPorts) {
  const { villageEngineJson, villageEngineForm } = ports;

  // Villages — the pictures the village asks the Engine to keep for it.
  //
  // A venue's picture is NOT stored in the village document. It is uploaded to
  // the Engine's own gallery and the village keeps a reference to it, which is
  // the same thing every other picture in the Engine does and the reason a
  // village document stays small enough to travel in a backup. What is kept here
  // is the one piece of ceremony that needs doing: the pictures are filed
  // together in a folder named after the package, so a player who wants to throw
  // the village art away can find all of it in one place.
  //
  // Filing is best-effort by design. A folder is an ornament — a picture at the
  // root of the gallery draws exactly as well — so nothing here is allowed to
  // fail an upload over it.

  const FOLDERS_PATH = "/api/global-gallery/folders";

  const UPLOAD_PATH = "/api/global-gallery/upload";

  /**
   * Which file extension belongs to which image type.
   *
   * The Engine checks a picture's magic bytes against the extension on its name
   * and refuses the upload when the two disagree, so the extension is derived
   * from the type the Engine said it produced rather than guessed. A type that is
   * not in this map is refused here, with a message naming it, rather than sent
   * on to be refused less clearly on the other side.
   */
  const EXTENSION_BY_MIME: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
  };

  /**
   * The folder the village's pictures live in, once it is known.
   *
   * Held as the PROMISE rather than the id for two reasons that happen to
   * coincide: two pictures asked for at the same moment share one lookup instead
   * of racing to create the same folder twice, and a lookup still in flight is
   * awaited rather than repeated.
   */
  let villagesGalleryFolder: Promise<string | null> | null = null;

  /**
   * The id of the village's gallery folder, or null when it cannot be had.
   *
   * Null is not a failure the caller has to handle, it is an answer: it means
   * "file this at the root". A lookup that fails is not remembered, so a blip
   * heals and the next upload files properly again; a folder that genuinely
   * cannot be created costs one extra list call per upload, which is a cheap
   * price for never quietly giving up on the tidiness.
   */
  function ensureVillagesGalleryFolder(): Promise<string | null> {
    villagesGalleryFolder ??= resolveVillagesGalleryFolder().catch(() => {
      // Reset BEFORE the promise settles, so the caller that triggered this
      // lookup still gets its null while the next caller tries afresh.
      villagesGalleryFolder = null;
      return null;
    });
    return villagesGalleryFolder;
  }

  async function resolveVillagesGalleryFolder(): Promise<string | null> {
    const existing = findFolderId(await villageEngineJson<unknown>(FOLDERS_PATH));
    if (existing) return existing;
    // Matched by name rather than by remembering an id across restarts, because
    // the gallery is the player's and they are free to rename or delete the
    // folder. The Engine allows two folders to share a name, so a duplicate
    // created after a rename is untidy rather than wrong — and reused from then
    // on, which is what stops it multiplying.
    const created = await villageEngineJson<unknown>(FOLDERS_PATH, {
      body: { name: VILLAGES_GALLERY_FOLDER_NAME },
    });
    const id = asTrimmedString(asRecord(created).id);
    return id.length > 0 ? id : null;
  }

  function findFolderId(listed: unknown): string | null {
    if (!Array.isArray(listed)) return null;
    const wanted = VILLAGES_GALLERY_FOLDER_NAME.toLowerCase();
    for (const entry of listed) {
      const record = asRecord(entry);
      if (asTrimmedString(record.name).toLowerCase() !== wanted) continue;
      const id = asTrimmedString(record.id);
      if (id.length > 0) return id;
    }
    return null;
  }

  /**
   * Put one picture in the gallery and describe it the way the village stores it.
   *
   * The returned object is the whole of what the village keeps: a reference it
   * can hand back to the Engine, a url the browser can draw, and the gallery's
   * own id so the tab can tell one picture from another. No bytes, ever — a
   * village document that held them would be a document that grew without bound
   * and a document that could not be backed up.
   *
   * The provider is recorded as this package rather than as the connection that
   * drew the picture, because that is the truthful answer to "who put this here".
   * Which model drew it is already visible on the venue, and a gallery entry
   * claiming a model would be claiming a provenance this package cannot vouch for
   * after a fallback.
   */
  async function uploadVillageGalleryImage(input: VillageGalleryUpload): Promise<VillageVenueImage> {
    const mime = input.mime.trim().toLowerCase();
    const extension = EXTENSION_BY_MIME[mime];
    if (!extension) {
      throw badRequest(`The Engine returned ${input.mime || "an unknown image type"}, which the gallery cannot store.`);
    }
    if (input.bytes.byteLength === 0) {
      throw badRequest("The Engine returned an empty image.");
    }

    const form = new FormData();
    form.append("prompt", input.prompt.trim());
    form.append("provider", "villages");
    if (typeof input.width === "number" && Number.isFinite(input.width)) {
      form.append("width", String(input.width));
    }
    if (typeof input.height === "number" && Number.isFinite(input.height)) {
      form.append("height", String(input.height));
    }
    form.append(
      "file",
      new Blob([input.bytes as Uint8Array<ArrayBuffer>], { type: mime }),
      `${fileStem(input.name)}${extension}`,
    );

    const folderId = await ensureVillagesGalleryFolder();
    const path = folderId ? `${UPLOAD_PATH}?folderId=${encodeURIComponent(folderId)}` : UPLOAD_PATH;

    const record = asRecord(await villageEngineForm<unknown>(path, form));
    const id = asTrimmedString(record.id);
    const url = asTrimmedString(record.url);
    // Both are required, and the url is checked against the same ceiling the
    // village stores under, so that what comes back from here is always
    // something the document can hold. A picture the gallery accepted but cannot
    // describe is a picture the village will not keep: better a clear failure
    // than a picture that is drawn today and gone after the next restart.
    if (id.length === 0 || url.length === 0 || url.length > MAX_VENUE_IMAGE_URL_LENGTH) {
      throw new VillagesRequestError(502, "The gallery accepted the picture but did not say where it went.");
    }
    return { ref: globalGalleryRef(id), url, id };
  }

  /**
   * A file name the gallery will accept a picture under.
   *
   * The Engine renames every upload to its own id, so this name is thrown away
   * almost immediately — its only job is to carry the extension past the type
   * check, and its only rule is that it cannot be empty or contain a path.
   */
  function fileStem(name: string): string {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
    return slug.length > 0 ? slug : "village-place";
  }
  return { ensureVillagesGalleryFolder, uploadVillageGalleryImage };
}
export type GlobalGallery = ReturnType<typeof createGlobalGallery>;
