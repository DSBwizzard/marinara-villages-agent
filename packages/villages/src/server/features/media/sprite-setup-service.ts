import { createHash, randomUUID } from "node:crypto";
import type {
  SpriteSetupAssignment,
  SpriteSetupDraft,
  SpriteSetupState,
  SpriteManagerState,
  SpriteLibraryFolder,
} from "../../../shared/contracts/sprites.js";
import type { mutateDocument } from "../../adapters/storage/document-store.js";
import type { villagesDocuments } from "../../adapters/engine/runtime-host.js";
import type { villageEngineJson } from "../../adapters/engine/engine-transport.js";
import type { SpriteManager } from "./sprite-manager-service.js";
import type { SpriteWrites } from "./sprite-writes.js";
import type { VillageState } from "../../domain/models/world.js";
import { emptySpriteManager } from "../../domain/rules/sprite-manager-model.js";
import { asRecord, asString } from "../../domain/rules/coerce.js";
import { badRequest, conflict, badGateway, VillagesRequestError } from "../../domain/rules/errors.js";
import { isEngineSpriteFilename } from "../../domain/rules/sprite-manager-model.js";

export interface SpriteSetupPorts {
  villagesDocuments: typeof villagesDocuments;
  mutateDocument: typeof mutateDocument;
  villageEngineJson: typeof villageEngineJson;
  manager: Pick<SpriteManager, "prepareArtwork" | "readImage" | "reframeArtwork">;
  writes: SpriteWrites;
  readVillageState(): Promise<VillageState>;
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
}
const empty = (): SpriteSetupDraft => ({
  revision: 0,
  manager: emptySpriteManager(),
  assignments: [],
  defaultArtworkId: "",
  useSprites: false,
  errors: {},
});
const documentId = (id: string) => "villages-sprite-setup-" + createHash("sha256").update(id).digest("hex");
const complete = (item: SpriteSetupAssignment) =>
  item.included && item.name.trim() && ["front", "side"].includes(item.view);
const ready = (item: SpriteSetupAssignment) => item.approved === true && complete(item);
const residentToken = (person: VillageState["villagers"][number]) =>
  createHash("sha256")
    .update(JSON.stringify([person.addedAt, person.spriteManager ?? null]))
    .digest("hex");

export function createSpriteSetup(ports: SpriteSetupPorts) {
  const slot = {
    kind: "sprite-setup",
    name: "Sprite setup",
    description: "Prepared character artwork and reviewed Scene assignments.",
    label: () => "Sprite setup",
    coerce: (value: unknown): SpriteSetupDraft => {
      if (!asRecord(value).revision) return empty();
      return structuredClone(value) as SpriteSetupDraft;
    },
  };
  async function draft(id: string) {
    return slot.coerce((await ports.villagesDocuments().getById("villages", documentId(id)))?.data);
  }
  async function files(id: string) {
    await ports.villageEngineJson(`/api/characters/${encodeURIComponent(id)}`);
    let catalog: Record<string, unknown> = {};
    try {
      catalog = asRecord(await ports.villageEngineJson(`/api/sprites/${encodeURIComponent(id)}/catalog`));
      if (!Array.isArray(catalog.folders) || !Array.isArray(catalog.sprites))
        throw badGateway("The Engine returned invalid sprite folder information. Refresh folders to retry.");
    } catch (error) {
      if (!(error instanceof VillagesRequestError) || !error.message.includes("(404)")) throw error;
      // Older Engines retain the flat full-body import.
    }
    const folderSupport = Array.isArray(catalog.folders) && Array.isArray(catalog.sprites);
    const folders: SpriteLibraryFolder[] = (Array.isArray(catalog.folders) ? catalog.folders : [])
      .map(asRecord)
      .flatMap((folder) =>
        typeof folder.id === "string" &&
        typeof folder.name === "string" &&
        (folder.category === "expressions" || folder.category === "full-body")
          ? [{ id: folder.id, name: folder.name, category: folder.category } as SpriteLibraryFolder]
          : [],
      );
    const response = folderSupport
      ? catalog.sprites
      : await ports.villageEngineJson<unknown>(`/api/sprites/${encodeURIComponent(id)}`);
    const items = (Array.isArray(response) ? response : []).map(asRecord).flatMap((file) => {
      const filename = asString(file.filename);
      return isEngineSpriteFilename(filename) && (folderSupport || /^full_/i.test(filename))
        ? [
            {
              filename,
              label: asString(file.label).trim() || filename,
              folderId: folders.some((folder) => folder.id === file.folderId) ? asString(file.folderId) : null,
              url: `/api/sprites/${encodeURIComponent(id)}/file/${encodeURIComponent(filename)}`,
            },
          ]
        : [];
    });
    return { items, folders, folderSupport };
  }
  async function read(id: string): Promise<SpriteSetupState> {
    const person = (await ports.readVillageState()).villagers.find((person) => person.characterId === id);
    const current = await draft(id);
    let library: Awaited<ReturnType<typeof files>> = { items: [], folders: [], folderSupport: true },
      libraryError = "";
    try {
      library = await files(id);
    } catch {
      libraryError = "Character sprites are unavailable. Retry import or add without using sprites.";
    }
    return {
      ...current,
      files: library.items.map((file) => {
        const art = [...(person?.spriteManager?.artwork ?? []), ...current.manager.artwork].find(
          (art) =>
            art.origin === "engine" &&
            art.engineSource.characterId === id &&
            art.engineSource.filename === file.filename,
        );
        return { ...file, ...(art ? { adoptedArtworkId: art.id } : {}) };
      }),
      folders: library.folders,
      folderSupport: library.folderSupport,
      libraryError,
      resident: Boolean(person),
      residentToken: person ? residentToken(person) : "",
    };
  }
  async function write(id: string, expected: number, change: (next: SpriteSetupDraft) => void) {
    await ports.mutateDocument(documentId(id), slot, (next) => {
      if (next.revision !== expected) throw conflict("Sprite setup changed. Reopen it before saving.");
      change(next);
      next.revision++;
    });
    return draft(id);
  }
  function prepare(id: string, signal?: AbortSignal, raw?: unknown) {
    return ports.writes.serialize("setup:" + id, async () => {
      const current = await draft(id);
      const library = await files(id);
      const input = asRecord(raw),
        scoped = raw !== undefined;
      if (scoped && current.revision !== input.revision)
        throw conflict("Sprite setup changed. Reload before importing.");
      if (
        scoped &&
        (!["front", "side", "unassigned"].includes(asString(input.view)) ||
          !Array.isArray(input.filenames) ||
          !input.filenames.length ||
          input.filenames.length > 40 ||
          new Set(input.filenames).size !== input.filenames.length ||
          !(input.folderId === null || library.folders.some((folder) => folder.id === input.folderId)))
      )
        throw badRequest("Choose a folder and Front, Side, or Unassigned.");
      if (library.folderSupport && !scoped) throw badRequest("Choose a sprite folder before importing.");
      const selected = scoped
        ? library.items.filter(
            (file) => file.folderId === input.folderId && (input.filenames as unknown[]).includes(file.filename),
          )
        : library.items;
      if (scoped && selected.length !== (input.filenames as unknown[]).length)
        throw conflict("The Engine folder changed. Reload before importing.");
      const person = (await ports.readVillageState()).villagers.find((person) => person.characterId === id);
      const existing = person?.spriteManager?.artwork ?? [];
      const manager = structuredClone(current.manager);
      const errors = { ...current.errors };
      const missing = selected
        .filter(
          (file) =>
            ![...manager.artwork, ...existing].some(
              (art) =>
                art.origin === "engine" &&
                art.engineSource.characterId === id &&
                art.engineSource.filename === file.filename,
            ),
        )
        .slice(0, 40);
      if (!missing.length && current.revision) return read(id);
      let attempted = false;
      for (const file of missing) {
        if (signal?.aborted) break;
        try {
          // Bound setup image memory/CPU across characters, without locking portrait actions.
          const art = await ports.writes.serialize("setup-import", async () => {
            if (signal?.aborted) return null;
            attempted = true;
            return ports.manager.prepareArtwork(file.filename, await ports.manager.readImage(file.url), {
              characterId: id,
              filename: file.filename,
            });
          });
          if (!art) break;
          manager.artwork.push(art);
          delete errors[file.filename];
        } catch {
          errors[file.filename] = "Could not import image.";
        }
      }
      if (!attempted && signal?.aborted) return read(id);
      await write(id, current.revision, (next) => {
        next.manager = manager;
        next.errors = errors;
        next.assignments = [
          ...current.assignments,
          ...manager.artwork
            .filter((art) => !current.assignments.some((item) => item.artworkId === art.id))
            .map(
              (art) =>
                ({
                  artworkId: art.id,
                  name: (library.items.find((file) => file.filename === art.engineSource?.filename)?.label ?? art.name)
                    .replace(/\.(png|jpe?g|webp)$/i, "")
                    .replace(/^full_/i, "")
                    .slice(0, 100),
                  view: input.view === "side" ? "side" : "front",
                  included: input.view !== "unassigned",
                  approved: false,
                }) as SpriteSetupAssignment,
            ),
        ];
      });
      return read(id);
    });
  }
  function assignments(value: unknown, current: SpriteSetupDraft): SpriteSetupAssignment[] {
    if (!Array.isArray(value) || value.length !== current.manager.artwork.length)
      throw badRequest("Review the imported artwork before saving.");
    const seen = new Set<string>();
    return value.map((raw) => {
      const item = asRecord(raw),
        artworkId = asString(item.artworkId),
        name = asString(item.name).trim(),
        view = asString(item.view);
      if (
        seen.has(artworkId) ||
        !current.manager.artwork.some((art) => art.id === artworkId) ||
        name.length > 100 ||
        !["front", "side"].includes(view) ||
        typeof item.included !== "boolean"
      )
        throw badRequest("Check the sprite assignments.");
      seen.add(artworkId);
      return {
        artworkId,
        name,
        view: view as SpriteSetupAssignment["view"],
        included: item.included,
        approved: item.approved === true,
      };
    });
  }
  function buildManager(value: SpriteSetupDraft): SpriteManagerState {
    const manager = structuredClone(value.manager);
    manager.expressions = [];
    manager.assignments = [];
    manager.defaultExpressionId = undefined;
    if (!value.useSprites) return manager;
    for (const item of value.assignments.filter(ready)) {
      const view = item.view;
      let expression = manager.expressions.find(
        (entry) =>
          entry.name.toLocaleLowerCase() === item.name.toLocaleLowerCase() &&
          !manager.assignments.some((assignment) => assignment.expressionId === entry.id && assignment.view === view),
      );
      if (!expression) {
        expression = { id: "e-" + randomUUID(), name: item.name };
        manager.expressions.push(expression);
      }
      manager.assignments.push({ expressionId: expression.id, view, artworkId: item.artworkId });
      if (item.artworkId === value.defaultArtworkId) manager.defaultExpressionId = expression.id;
    }
    if (!manager.defaultExpressionId)
      throw badRequest("Choose an approved default sprite or add without using sprites.");
    return manager;
  }
  function save(id: string, body: unknown) {
    return ports.writes.serialize("setup:" + id, async () => {
      const current = await draft(id),
        input = asRecord(body);
      const updated = {
        ...current,
        assignments: assignments(input.assignments, current),
        defaultArtworkId: asString(input.defaultArtworkId),
        useSprites: input.useSprites === true,
      };
      if (input.validateForUse === true) buildManager(updated);
      await write(id, Number(input.revision), (next) => {
        Object.assign(next, updated);
      });
      return read(id);
    });
  }
  async function preparedManager(id: string, revision?: number): Promise<SpriteManagerState | null> {
    const current = await draft(id);
    if (revision === undefined) return null;
    if (!Number.isSafeInteger(revision) || revision < 0 || current.revision !== revision)
      throw conflict("Sprite setup changed. Review this character’s sprites again before adding.");
    return current.revision ? buildManager(current) : null;
  }
  function frame(id: string, raw: unknown) {
    return ports.writes.serialize("setup:" + id, async () => {
      const current = await draft(id),
        input = asRecord(raw);
      if (current.revision !== Number(input.revision))
        throw conflict("Sprite setup changed. Reopen it before framing.");
      const art = current.manager.artwork.find((art) => art.id === input.artworkId);
      if (!art) throw badRequest("Select imported artwork.");
      const updated = await ports.manager.reframeArtwork(
        art,
        asRecord(input.frame) as unknown as import("../../../shared/contracts/sprites.js").SpriteFrame,
      );
      await write(id, current.revision, (next) => {
        next.manager.artwork = next.manager.artwork.map((item) => (item.id === art.id ? updated : item));
      });
      return read(id);
    });
  }
  function applyResident(id: string, raw: unknown) {
    return ports.writes.serialize(id, async () => {
      const current = await draft(id),
        input = asRecord(raw);
      if (current.revision !== Number(input.revision))
        throw conflict("Sprite setup changed. Reopen it before applying.");
      const prepared = buildManager(current);
      await ports.mutateVillageState((village) => {
        const person = village.villagers.find((person) => person.characterId === id);
        if (!person) throw conflict("The resident changed. Reopen sprite setup.");
        const existing = person.spriteManager;
        if (residentToken(person) !== input.residentToken)
          throw conflict("The resident’s sprites changed. Reopen sprite setup.");
        if (!existing?.artwork.length) person.spriteManager = prepared;
        else {
          // The character library may have copied the same source after setup was prepared.
          prepared.artwork = prepared.artwork.map((art) => {
            const owned = existing.artwork.find(
              (saved) =>
                art.origin === "engine" &&
                saved.origin === "engine" &&
                saved.engineSource.characterId === art.engineSource.characterId &&
                saved.engineSource.filename === art.engineSource.filename,
            );
            if (!owned || owned.id === art.id) return art;
            for (const assignment of prepared.assignments)
              if (assignment.artworkId === art.id) assignment.artworkId = owned.id;
            return owned;
          });
          const owned = new Set(existing.artwork.map((art) => art.id));
          existing.artwork.push(...prepared.artwork.filter((art) => !owned.has(art.id)));
          const fresh = prepared.assignments.filter(
            (item) => !existing.assignments.some((saved) => saved.artworkId === item.artworkId),
          );
          const freshArt = new Set(fresh.map((item) => item.artworkId));
          existing.artwork = existing.artwork.map((art) =>
            freshArt.has(art.id) ? prepared.artwork.find((item) => item.id === art.id)! : art,
          );
          let defaultId = prepared.defaultExpressionId;
          for (const expression of prepared.expressions) {
            const additions = fresh.filter((item) => item.expressionId === expression.id);
            if (!additions.length) continue;
            const matches = existing.expressions.filter(
              (item) => item.name.toLocaleLowerCase() === expression.name.toLocaleLowerCase(),
            );
            const unique =
              prepared.expressions.filter(
                (item) => item.name.toLocaleLowerCase() === expression.name.toLocaleLowerCase(),
              ).length === 1;
            const match = unique && matches.length === 1 ? matches[0] : undefined;
            if (match) {
              if (
                additions.some((item) =>
                  existing.assignments.some((saved) => saved.expressionId === match.id && saved.view === item.view),
                )
              )
                throw conflict(
                  `“${expression.name}” already has artwork for that facing. Rename or unassign the imported sprite.`,
                );
              for (const item of additions) item.expressionId = match.id;
              if (defaultId === expression.id) defaultId = match.id;
            } else if (!existing.expressions.some((item) => item.id === expression.id))
              existing.expressions.push(expression);
          }
          existing.assignments.push(...fresh);
          existing.defaultExpressionId ??= existing.assignments.some((item) => item.expressionId === defaultId)
            ? defaultId
            : existing.assignments[0]?.expressionId;
        }
      });
      return { applied: true };
    });
  }
  const settled = (id: string) => ports.writes.serialize("setup:" + id, () => read(id));
  return { read, settled, prepare, save, frame, preparedManager, applyResident };
}
