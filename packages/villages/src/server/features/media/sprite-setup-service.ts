import { createHash, randomUUID } from "node:crypto";
import type {
  SpriteSetupAssignment,
  SpriteSetupDraft,
  SpriteSetupState,
  SpriteManagerState,
} from "../../../shared/contracts/sprites.js";
import type { mutateDocument } from "../../adapters/storage/document-store.js";
import type { villagesDocuments } from "../../adapters/engine/runtime-host.js";
import type { villageEngineJson } from "../../adapters/engine/engine-transport.js";
import type { SpriteManager } from "./sprite-manager-service.js";
import type { SpriteWrites } from "./sprite-writes.js";
import type { VillageState } from "../../domain/models/world.js";
import { emptySpriteManager } from "../../domain/rules/sprite-manager-model.js";
import { asRecord, asString } from "../../domain/rules/coerce.js";
import { badRequest, conflict } from "../../domain/rules/errors.js";
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
    const response = await ports.villageEngineJson<unknown>(`/api/sprites/${encodeURIComponent(id)}`);
    return (Array.isArray(response) ? response : []).map(asRecord).flatMap((file) => {
      const filename = asString(file.filename);
      return isEngineSpriteFilename(filename) && /^full_/i.test(filename)
        ? [
            {
              filename,
              label: asString(file.label).trim() || filename,
              url: `/api/sprites/${encodeURIComponent(id)}/file/${encodeURIComponent(filename)}`,
            },
          ]
        : [];
    });
  }
  async function read(id: string): Promise<SpriteSetupState> {
    const person = (await ports.readVillageState()).villagers.find((person) => person.characterId === id);
    let library: Awaited<ReturnType<typeof files>> = [],
      libraryError = "";
    try {
      library = await files(id);
    } catch {
      libraryError = "Character sprites are unavailable. Retry import or add without using sprites.";
    }
    return {
      ...(await draft(id)),
      files: library,
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
  function prepare(id: string, signal?: AbortSignal) {
    return ports.writes.serialize("setup:" + id, async () => {
      const current = await draft(id);
      const library = await files(id);
      const manager = structuredClone(current.manager);
      const errors = { ...current.errors };
      const missing = library
        .filter((file) => !manager.artwork.some((art) => art.engineSource?.filename === file.filename))
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
                  name: (library.find((file) => file.filename === art.engineSource?.filename)?.label ?? art.name)
                    .replace(/\.(png|jpe?g|webp)$/i, "")
                    .replace(/^full_/i, "")
                    .slice(0, 100),
                  view: "front",
                  included: true,
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
          const owned = new Set(existing.artwork.map((art) => art.id));
          existing.artwork.push(...prepared.artwork.filter((art) => !owned.has(art.id)));
          const fresh = prepared.assignments.filter(
            (item) => !existing.assignments.some((saved) => saved.artworkId === item.artworkId),
          );
          const freshArt = new Set(fresh.map((item) => item.artworkId));
          existing.artwork = existing.artwork.map((art) =>
            freshArt.has(art.id) ? prepared.artwork.find((item) => item.id === art.id)! : art,
          );
          existing.assignments.push(...fresh);
          existing.expressions.push(
            ...prepared.expressions.filter((item) => fresh.some((assignment) => assignment.expressionId === item.id)),
          );
          existing.defaultExpressionId ??= prepared.defaultExpressionId;
        }
      });
      return { applied: true };
    });
  }
  const settled = (id: string) => ports.writes.serialize("setup:" + id, () => read(id));
  return { read, settled, prepare, save, frame, preparedManager, applyResident };
}
