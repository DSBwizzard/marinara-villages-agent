import { randomUUID } from "node:crypto";
import { normalizeSpriteExpressionLabel } from "@marinara-engine/shared";
import { asRecord, asString } from "./coerce.js";
import { badRequest } from "./errors.js";
import { studioDigest, studioEngineJson, studioAsset } from "./sprite-studio-engine.js";
import { villageEngineBaseUrl } from "./engine-loopback.js";
import { inspectVillageImage } from "./image-generation.js";
import { readSpriteExpression, readSpriteView } from "./resident-sprites.js";
import { decodeStudioSource } from "./sprite-studio-processing.js";
import { withStudioLibrary, readSpriteStudio } from "./sprite-studio.js";
import type { StudioLibraryItem, StudioPublication, StudioPublicationItem } from "./sprite-studio-model.js";

type Context = Parameters<Parameters<typeof withStudioLibrary>[1]>[0];
type NativeFile = { filename: string; expression: string; url: string; sha256: string; image: string };
const mimeFor: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
};
const snapshot = (files: NativeFile[]) =>
  files.map(({ filename, sha256 }) => ({ filename, sha256 })).sort((a, b) => a.filename.localeCompare(b.filename));
const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const errorMessage = "Character artwork could not be saved. Inspect publication status before retrying.";

async function nativeFiles(characterId: string): Promise<NativeFile[]> {
  // A stale sprite directory is not evidence that the source card still exists.
  await studioEngineJson(`/api/characters/${encodeURIComponent(characterId)}`);
  const response = await studioEngineJson<unknown>(`/api/sprites/${encodeURIComponent(characterId)}`);
  const files: NativeFile[] = [];
  for (const value of Array.isArray(response) ? response : []) {
    const row = asRecord(value),
      filename = asString(row.filename),
      expression = asString(row.expression);
    if (
      !/^full_/i.test(expression) ||
      !/^[\p{L}\p{N}._-]+\.(png|jpe?g|webp|avif|gif|svg)$/iu.test(filename) ||
      filename.includes("..")
    )
      continue;
    if (filename.slice(0, filename.lastIndexOf(".")) !== expression) continue;
    const url = `/api/sprites/${encodeURIComponent(characterId)}/file/${encodeURIComponent(filename)}`;
    const res = await fetch(villageEngineBaseUrl() + url);
    if (!res.ok || Number(res.headers.get("content-length")) > 12_000_000)
      throw badRequest("Character artwork could not be read. Refresh the library.");
    const bytes = Buffer.from(await res.arrayBuffer());
    if (!bytes.length || bytes.length > 12_000_000) throw badRequest("Character artwork is empty or too large.");
    files.push({
      filename,
      expression,
      url,
      sha256: studioDigest(bytes),
      image: `data:${mimeFor[filename.split(".").at(-1)!.toLowerCase()]};base64,${bytes.toString("base64")}`,
    });
  }
  return files;
}
function named(files: NativeFile[], name: string) {
  return files.filter((file) => file.expression.toLowerCase() === name.toLowerCase());
}
function nativeName(raw: unknown) {
  const name = normalizeSpriteExpressionLabel(asString(raw), { fullBody: true });
  if (!name || name === "full_" || name.length > 100)
    throw badRequest("Choose a full-body sprite name of at most 100 characters.");
  return name;
}
async function retainBackup(context: Context, file: NativeFile) {
  const assetId = `villages-${randomUUID()}`,
    expression = "backup";
  const extension = file.filename.split(".").at(-1)!.toLowerCase();
  const url = `/api/sprites/${assetId}/file/${expression}.${extension === "jpg" ? "jpeg" : extension}`;
  await context.mutate((state) => state.files.push({ assetId, expression, url }));
  const saved = asRecord(
    await studioEngineJson(`/api/sprites/${assetId}`, { body: { expression, image: file.image } }),
  );
  const filename = asString(saved.filename);
  if (filename !== url.split("/").at(-1)) throw badRequest("Engine could not preserve the replacement backup.");
  const preserved = await studioAsset(url);
  if (studioDigest(Buffer.from(preserved.split(",")[1]!, "base64")) !== file.sha256)
    throw badRequest("Engine could not verify the replacement backup. Character artwork was not changed.");
  return { filename: file.filename, url, sha256: file.sha256 };
}

export async function listStudioCharacterLibrary(characterId: string) {
  return withStudioLibrary(characterId, async (context) => {
    try {
      const files = await nativeFiles(characterId),
        state = await context.read();
      const items: StudioLibraryItem[] = files
        .filter((file) => /\.(png|jpe?g|webp)$/i.test(file.filename))
        .map((file) => {
          const mapping = [...(state.publications ?? [])]
            .reverse()
            .flatMap((entry) => entry.items)
            .find(
              (item) => item.status === "saved" && item.name === file.expression && item.sourceHash === file.sha256,
            );
          const proposed =
            file.expression
              .slice(5)
              .replace(/[^a-z0-9_-]/g, "_")
              .slice(0, 40) || "neutral";
          return {
            filename: file.filename,
            expression: file.expression,
            url: file.url,
            sha256: file.sha256,
            label: mapping?.label ?? proposed,
            view: mapping?.view ?? "front",
          };
        });
      return { available: true, items, error: "" };
    } catch {
      return {
        available: false,
        items: [],
        error: "The character library is unavailable. Your adopted artwork remains saved in Studio.",
      };
    }
  });
}

export async function adoptStudioCharacterSprites(characterId: string, raw: unknown) {
  return withStudioLibrary(characterId, async (context) => {
    const body = asRecord(raw),
      id = asString(body.submissionId);
    if (!/^[a-f0-9-]{36}$/i.test(id)) throw badRequest("Refresh the library before using sprites.");
    const entries = (Array.isArray(body.items) ? body.items : []).map(asRecord);
    if (!entries.length || entries.length > 40) throw badRequest("Choose between one and forty character sprites.");
    const fingerprint = studioDigest(JSON.stringify(entries)),
      state = await context.read();
    let receipt = state.adoptions?.find((entry) => entry.id === id);
    if (receipt && receipt.fingerprint !== fingerprint) throw badRequest("This adoption changed. Refresh the library.");
    if (receipt?.status === "used")
      return { studio: await readSpriteStudio(characterId), snapshot: await context.snapshot() };
    if (!receipt) {
      const files = await nativeFiles(characterId),
        seen = new Set<string>();
      const prepared = [];
      for (const entry of entries) {
        const file = files.find((file) => file.filename === entry.filename && file.sha256 === entry.sha256);
        if (!file) throw badRequest("Character artwork changed. Refresh the library before using it.");
        const label = readSpriteExpression(entry.label),
          view = readSpriteView(entry.view),
          key = label + ":" + view;
        if (seen.has(key)) throw badRequest("Choose one sprite per expression and view.");
        seen.add(key);
        const pixels = await decodeStudioSource(file.image),
          size = await inspectVillageImage(file.image);
        prepared.push({
          file,
          label,
          view,
          size,
          cleanup: !pixels.data.some((alpha, index) => index % 4 === 3 && alpha < 255),
        });
      }
      await context.mutate((next) => {
        next.adoptions ??= [];
        next.adoptions.push({ id, fingerprint, cellIds: [], status: "prepared" });
      });
      for (const item of prepared) {
        const imported = await context.importImage({
          image: item.file.image,
          cells: [{ label: item.label, view: item.view, x: 0, y: 0, ...item.size, cleanup: item.cleanup }],
        });
        const cellId = imported.jobs.find((job) => job.id === imported.importedJobId)!.sheets[0]!.cells[0]!.id;
        await context.mutate((next) => {
          const source = next.jobs.find((job) => job.id === imported.importedJobId)!.sheets[0]!.source!;
          source.provenance = {
            kind: "character-library",
            characterId,
            filename: item.file.filename,
            sha256: item.file.sha256,
          };
          next.adoptions!.find((entry) => entry.id === id)!.cellIds.push(cellId);
        });
      }
      receipt = (await context.read()).adoptions!.find((entry) => entry.id === id);
    }
    if (receipt!.cellIds.length !== entries.length)
      throw badRequest(
        "Some artwork was saved before adoption stopped. Use saved gallery entries or refresh to import the missing artwork.",
      );
    const result = await context.assign({ cells: receipt!.cellIds.map((cellId) => ({ id: cellId })) });
    await context.mutate((next) => {
      next.adoptions!.find((entry) => entry.id === id)!.status = "used";
    });
    return result;
  });
}

export async function planStudioPublication(characterId: string, raw: unknown) {
  return withStudioLibrary(characterId, async (context) => {
    const body = asRecord(raw),
      state = await context.read(),
      files = await nativeFiles(characterId);
    const restoreOf = asString(body.restoreOf),
      previous = state.publications?.find((entry) => entry.id === restoreOf);
    if (restoreOf && !previous) throw badRequest("Choose a recorded publication to restore.");
    const selections = (Array.isArray(body.items) ? body.items : []).map(asRecord);
    if (!selections.length || selections.length > 40) throw badRequest("Choose between one and forty cutouts.");
    const items: StudioPublicationItem[] = [],
      seen = new Set<string>();
    for (const selection of selections) {
      let sourceUrl: string, sourceHash: string, label: string, view: "front" | "side", cellId: string | undefined;
      if (previous) {
        const backup = previous.items
          .flatMap((item) => item.backups.map((backup) => ({ item, backup })))
          .find((entry) => entry.backup.url === selection.backupUrl);
        if (!backup) throw badRequest("Choose recorded replacement backups.");
        ({ label, view } = backup.item);
        sourceUrl = backup.backup.url;
        sourceHash = backup.backup.sha256;
      } else {
        cellId = asString(selection.cellId);
        const candidate = await context.cell(cellId);
        ({ label, view } = candidate.cell);
        sourceUrl = candidate.cell.rendered!.url;
        sourceHash = studioDigest(Buffer.from(candidate.image.split(",")[1]!, "base64"));
      }
      const name = nativeName(selection.name || `full_${label}${view === "side" ? "_side" : ""}`);
      if (seen.has(name)) throw badRequest("Give every selected sprite a unique character-library name.");
      seen.add(name);
      const action = selection.action === "skip" ? "skip" : selection.action === "replace" ? "replace" : "rename";
      const conflicts = named(files, name);
      items.push({
        cellId,
        name,
        label,
        view,
        sourceUrl,
        sourceHash,
        action,
        expected: snapshot(conflicts),
        backups: [],
        status: action === "skip" ? "skipped" : "pending",
      });
    }
    const publication: StudioPublication = {
      id: randomUUID(),
      token: studioDigest(JSON.stringify(items)),
      createdAt: new Date().toISOString(),
      ...(restoreOf ? { restoreOf } : {}),
      items,
    };
    await context.mutate((next) => {
      next.publications ??= [];
      next.publications.push(publication);
    });
    return publication;
  });
}

export async function executeStudioPublication(characterId: string, raw: unknown) {
  return withStudioLibrary(characterId, async (context) => {
    const body = asRecord(raw),
      id = asString(body.id),
      token = asString(body.token);
    const publication = (await context.read()).publications?.find((entry) => entry.id === id);
    if (!publication || publication.token !== token) throw badRequest("Review this publication before saving.");
    const update = async (index: number, change: (item: StudioPublicationItem) => void) =>
      context.mutate((state) => change(state.publications!.find((entry) => entry.id === id)!.items[index]!));
    // Prepare every source and every backup before modifying the character library.
    const sources = await Promise.all(
      publication.items.map(async (item) => {
        if (item.action === "skip" || item.status === "saved") return "";
        try {
          const image = await studioAsset(item.sourceUrl);
          if (studioDigest(Buffer.from(image.split(",")[1]!, "base64")) !== item.sourceHash)
            throw badRequest("Saved artwork changed. Review the publication again.");
          return image;
        } catch (error) {
          await update(publication.items.indexOf(item), (current) => {
            current.status = "failed";
            current.error = "Saved cutout could not be verified. Review the publication again.";
          });
          throw error;
        }
      }),
    );
    let files = await nativeFiles(characterId);
    for (const [index, item] of publication.items.entries()) {
      if (!sources[index]) continue;
      const existing = named(files, item.name);
      if (existing.length === 1 && existing[0]!.sha256 === item.sourceHash) {
        await update(index, (current) => {
          current.status = "saved";
          current.error = "";
        });
        sources[index] = "";
        continue;
      }
      const afterInterruption = item.status === "saving" || item.status === "unresolved";
      const unchanged = equal(snapshot(existing), item.expected);
      const remainingExpected =
        afterInterruption &&
        item.expected.length > 0 &&
        existing.every((file) =>
          item.expected.some((record) => record.filename === file.filename && record.sha256 === file.sha256),
        ) &&
        item.backups.length === item.expected.length;
      try {
        if (!unchanged && !remainingExpected)
          throw badRequest("Character artwork changed. Review its conflicts again.");
        if (existing.length && item.action !== "replace")
          throw badRequest("Resolve existing-name conflicts with Replace, Rename or Skip.");
        for (const file of existing) {
          if (item.backups.some((backup) => backup.filename === file.filename && backup.sha256 === file.sha256))
            continue;
          const backup = await retainBackup(context, file);
          item.backups.push(backup);
          await update(index, (current) => {
            current.backups = structuredClone(item.backups);
          });
        }
      } catch (error) {
        await update(index, (current) => {
          current.status = "failed";
          current.error = "Conflict review or replacement backup failed. Character artwork was not changed.";
        });
        throw error;
      }
    }
    for (const [index, item] of publication.items.entries()) {
      if (!sources[index]) continue;
      try {
        await update(index, (current) => {
          current.status = "saving";
          current.error = "";
        });
        files = await nativeFiles(characterId);
        const existing = named(files, item.name);
        const allowed = item.backups.map(({ filename, sha256 }) => ({ filename, sha256 }));
        if (
          existing.some(
            (file) => !allowed.some((backup) => file.filename === backup.filename && file.sha256 === backup.sha256),
          )
        )
          throw badRequest("Character artwork changed before saving. Review conflicts again.");
        // Existing Engine DELETE removes one same-name file at a time.
        for (let remaining = existing.length; remaining > 0; remaining--) {
          const latest = named(await nativeFiles(characterId), item.name);
          if (!latest.length) break;
          if (
            latest.some(
              (file) => !allowed.some((backup) => backup.filename === file.filename && backup.sha256 === file.sha256),
            )
          )
            throw badRequest("Character artwork changed before replacement.");
          await studioEngineJson(
            `/api/sprites/${encodeURIComponent(characterId)}/${encodeURIComponent(latest[0]!.expression)}`,
            { method: "DELETE" },
          );
        }
        if (named(await nativeFiles(characterId), item.name).length)
          throw badRequest("The destination changed before upload. Review conflicts again.");
        await studioEngineJson(`/api/sprites/${encodeURIComponent(characterId)}`, {
          body: { expression: item.name, image: sources[index] },
        });
        const actual = named(await nativeFiles(characterId), item.name);
        if (actual.length !== 1 || actual[0]!.sha256 !== item.sourceHash)
          throw badRequest("Engine could not verify saved artwork.");
        await update(index, (current) => {
          current.status = "saved";
        });
      } catch {
        let confirmed = false;
        try {
          const actual = named(await nativeFiles(characterId), item.name);
          confirmed = actual.length === 1 && actual[0]!.sha256 === item.sourceHash;
        } catch {
          /* Outcome stays explicit. */
        }
        await update(index, (current) => {
          current.status = confirmed ? "saved" : "unresolved";
          current.error = confirmed ? "" : errorMessage;
        });
        // A later item never conceals an uncertain earlier replacement.
        break;
      }
    }
    return readSpriteStudio(characterId);
  });
}
