import { createHash, randomUUID } from "node:crypto";
import type {
  SpriteAppearance,
  SpriteAssignment,
  SpriteLibraryFolder,
  SpriteManagerState,
  SpriteSetupDraft,
} from "../../../shared/contracts/sprites.js";
import type { mutateDocument } from "../../adapters/storage/document-store.js";
import type { villagesDocuments } from "../../adapters/engine/runtime-host.js";
import type { villageEngineJson } from "../../adapters/engine/engine-transport.js";
import type { SpriteWrites } from "./sprite-writes.js";
import type { VillageState } from "../../domain/models/world.js";
import {
  coerceSpriteManager,
  emptySpriteManager,
  isEngineSpriteFilename,
  isEngineSpriteVersion,
} from "../../domain/rules/sprite-manager-model.js";
import { engineSpriteName, engineSpriteUrl } from "../../../shared/helpers/sprite-variants.js";
import { asRecord, asString } from "../../domain/rules/coerce.js";
import { badRequest, conflict, badGateway, notFound, VillagesRequestError } from "../../domain/rules/errors.js";
import { villageWorldScope } from "../../domain/rules/village-identity.js";

export interface SpriteSetupPorts {
  villagesDocuments: typeof villagesDocuments;
  mutateDocument: typeof mutateDocument;
  villageEngineJson: typeof villageEngineJson;
  writes: SpriteWrites;
  readVillageState(): Promise<VillageState>;
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
}

const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const documentId = (id: string) => "villages-sprite-setup-" + createHash("sha256").update(id).digest("hex");
const views = ["front", "side"] as const;
const writeKey = (id: string, resident: boolean) => (resident ? "resident:" : "setup:") + id;
const empty = () => ({ revision: 0, manager: { ...emptySpriteManager(), useSprites: false } });
type Draft = { revision: number; manager: SpriteManagerState };

function readDraft(value: unknown): Draft {
  const raw = asRecord(value);
  if (!raw.revision) return empty();
  const draft = structuredClone(value) as SpriteSetupDraft;
  const manager = draft.manager;
  if (Array.isArray(draft.assignments)) {
    // Pre-Appearance drafts stored each facing separately. Only approved choices enter Scenes.
    for (const row of draft.assignments) {
      if (!row.approved || !row.included || !row.name.trim()) continue;
      let expression = manager.expressions.find(
        (item) =>
          item.name.toLowerCase() === row.name.toLowerCase() &&
          !manager.assignments.some((slot) => slot.expressionId === item.id && slot.view === row.view),
      );
      if (!expression) {
        expression = { id: "e-" + row.artworkId.slice(2), name: row.name };
        manager.expressions.push(expression);
      }
      manager.assignments.push({ expressionId: expression.id, view: row.view, artworkId: row.artworkId });
      if (row.artworkId === draft.defaultArtworkId) manager.defaultExpressionId = expression.id;
    }
    manager.defaultExpressionId ??= manager.assignments[0]?.expressionId;
    if (!draft.useSprites) manager.useSprites = false;
  }
  return { revision: draft.revision, manager };
}

export function createSpriteSetup(ports: SpriteSetupPorts) {
  const slot = {
    kind: "sprite-setup",
    name: "Appearance",
    description: "Resident artwork and Scene assignments.",
    label: () => "Appearance",
    coerce: readDraft,
  };

  async function draft(id: string) {
    return readDraft((await ports.villagesDocuments().getById("villages", documentId(id)))?.data);
  }

  function residentState(world: VillageState, id: string) {
    const person = world.villagers.find((item) => item.characterId === id);
    if (!person) throw notFound("That resident no longer lives here.");
    const manager = coerceSpriteManager(person.spriteManager) ?? emptySpriteManager();
    return { person, manager, token: hash([villageWorldScope(world), person.incarnation, manager]) };
  }

  async function appearanceState(id: string, resident: boolean) {
    const world = await ports.readVillageState();
    if (resident) {
      const { manager, token } = residentState(world, id);
      return { revision: 0, token, manager };
    }
    const current = await draft(id);
    return { ...current, token: hash([villageWorldScope(world), current]) };
  }

  async function files(id: string) {
    const key = encodeURIComponent(id);
    await ports.villageEngineJson("/api/characters/" + key);
    let response: unknown,
      folders: SpriteLibraryFolder[] = [];
    try {
      const catalog = asRecord(await ports.villageEngineJson("/api/sprites/" + key + "/catalog"));
      if (!Array.isArray(catalog.folders) || !Array.isArray(catalog.sprites))
        throw badGateway("The Engine returned invalid sprite folder information.");
      folders = catalog.folders
        .map(asRecord)
        .flatMap((folder) =>
          typeof folder.id === "string" &&
          typeof folder.name === "string" &&
          (folder.category === "expressions" || folder.category === "full-body")
            ? [{ id: folder.id, name: folder.name, category: folder.category }]
            : [],
        );
      response = catalog.sprites;
    } catch (error) {
      if (!(error instanceof VillagesRequestError) || !error.message.includes("(404)")) throw error;
      response = await ports.villageEngineJson("/api/sprites/" + key);
    }
    if (!Array.isArray(response)) throw badGateway("The Engine returned an invalid sprite list.");
    const items = response.map(asRecord).flatMap((file) => {
      const filename = asString(file.filename);
      if (!isEngineSpriteFilename(filename)) return [];
      const rawVersion = asString(file.url).match(/\?v=(\d+)$/)?.[1];
      const version = isEngineSpriteVersion(rawVersion) ? rawVersion : undefined;
      return [
        {
          filename,
          label: asString(file.label).trim() || filename,
          folderId: folders.some((folder) => folder.id === file.folderId) ? asString(file.folderId) : null,
          url: engineSpriteUrl(id, filename, version),
          version,
        },
      ];
    });
    return { files: items, folders };
  }

  async function read(id: string, resident = false): Promise<SpriteAppearance> {
    const state = await appearanceState(id, resident);
    try {
      return { ...state, ...(await files(id)) };
    } catch {
      return { ...state, files: [], folders: [], libraryError: "Engine sprites are unavailable." };
    }
  }

  function save(id: string, body: unknown, signal: AbortSignal) {
    const input = asRecord(body);
    const resident = input.resident === true;
    return ports.writes.serialize(writeKey(id, resident), async () => {
      const requestId = asString(input.requestId);
      if (
        !/^[a-z0-9-]{1,80}$/i.test(requestId) ||
        typeof input.useSprites !== "boolean" ||
        !Array.isArray(input.expressions) ||
        typeof input.defaultExpressionId !== "string"
      )
        throw badRequest("Check the appearance choices.");

      const world = await ports.readVillageState();
      const scope = villageWorldScope(world);
      const current = resident ? { revision: 0, ...residentState(world, id) } : await draft(id);
      const expected = "token" in current ? current.token : hash([scope, current]);
      const digest = hash([scope, input]);
      if (current.manager.lastSave?.id === requestId) {
        if (current.manager.lastSave.digest !== digest)
          throw conflict("That Appearance save changed. Reload to continue.");
        return { revision: current.revision, token: expected, manager: current.manager };
      }
      if (expected !== input.token) throw conflict("Appearance changed. Reload to continue.");

      const manager = structuredClone(current.manager);
      const existingExpressions = new Map(manager.expressions.map((row) => [row.id, row.name]));
      const existingSlots = new Map(manager.assignments.map((slot) => [slot.expressionId + ":" + slot.view, slot]));
      const ids = new Map<string, string>();
      const expressions: SpriteManagerState["expressions"] = [];
      const assignments: SpriteAssignment[] = [];
      const additions: { view: (typeof views)[number]; filename: string; version?: string; name: string }[] = [];
      if (input.expressions.length > manager.expressions.length + 200)
        throw badRequest("Choose up to 200 new sprites at a time.");

      for (const value of input.expressions) {
        const row = asRecord(value);
        const key = asString(row.id);
        const name = asString(row.name).trim();
        const existing = existingExpressions.has(key);
        if ((!existing && !/^new-[a-z0-9-]{1,80}$/i.test(key)) || ids.has(key) || !name || name.length > 100)
          throw badRequest("Check the expression labels.");
        if (!row.front && !row.side) throw badRequest("Choose artwork for each expression.");
        if (row.front && row.side && !existing) throw badRequest("Choose one facing for each new sprite.");
        const expressionId = existing ? key : "e-" + randomUUID();
        ids.set(key, expressionId);
        expressions.push({ id: expressionId, name });
        for (const view of views) {
          if (row[view] === undefined) continue;
          const choice = asRecord(row[view]);
          if (
            typeof choice.artworkId === "string" &&
            choice.filename === undefined &&
            manager.artwork.some((art) => art.id === choice.artworkId)
          ) {
            assignments.push({ expressionId, view, artworkId: choice.artworkId });
            continue;
          }
          const { filename } = choice;
          const version = isEngineSpriteVersion(choice.version) ? choice.version : undefined;
          if (choice.artworkId !== undefined || !isEngineSpriteFilename(filename) || choice.version !== version)
            throw badRequest("Choose an available sprite.");
          const prior = existingSlots.get(key + ":" + view);
          if (prior?.engineFilename !== filename || prior.version !== version || name !== existingExpressions.get(key))
            additions.push({ view, filename, version, name });
          assignments.push({ expressionId, view, engineFilename: filename, ...(version ? { version } : {}) });
        }
      }
      if (input.defaultExpressionId && !ids.has(input.defaultExpressionId))
        throw badRequest("Choose an available default.");
      if (additions.length > 200) throw badRequest("Choose up to 200 new sprites at a time.");
      if (additions.length) {
        const links = new Map<string, number>();
        for (const slot of assignments) {
          const filename =
            slot.engineFilename ?? manager.artwork.find((art) => art.id === slot.artworkId)?.engineSource?.filename;
          if (filename) {
            const key = slot.view + ":" + filename;
            links.set(key, (links.get(key) ?? 0) + 1);
          }
        }
        const byFilename = new Map((await files(id)).files.map((file) => [file.filename, file]));
        for (const { view, filename, version, name } of additions) {
          if (links.get(view + ":" + filename) !== 1) throw badRequest("Choose each sprite once per facing.");
          const file = byFilename.get(filename);
          if (!file || file.version !== version || engineSpriteName(file.label ?? "", filename) !== name)
            throw conflict("Engine sprites changed. Reopen the picker to choose the current images.");
        }
      }
      manager.expressions = expressions;
      manager.assignments = assignments;
      manager.defaultExpressionId =
        ids.get(input.defaultExpressionId) ??
        manager.expressions.find((row) => row.name.toLowerCase() === "neutral")?.id ??
        manager.expressions[0]?.id;
      if (input.useSprites && manager.assignments.length) delete manager.useSprites;
      else manager.useSprites = false;
      manager.lastSave = { id: requestId, digest };
      signal.throwIfAborted();

      if (resident) {
        const saved = coerceSpriteManager(manager)!;
        let token = "";
        await ports.mutateVillageState((state) => {
          const prior = residentState(state, id);
          if (prior.token !== expected) throw conflict("Appearance changed. Reload to continue.");
          prior.person.spriteManager = saved;
          token = residentState(state, id).token;
        });
        return { revision: 0, token, manager: saved };
      }

      if (villageWorldScope(await ports.readVillageState()) !== scope)
        throw conflict("The Village changed. Reopen Appearance.");
      const revision = current.revision + 1;
      await ports.mutateDocument(documentId(id), slot, (prior) => {
        if (hash([scope, prior]) !== expected) throw conflict("Appearance changed. Reload to continue.");
        Object.assign(prior, { revision, manager });
      });
      const saved = { revision, manager };
      return { ...saved, token: hash([scope, saved]) };
    });
  }

  async function preparedManager(id: string, revision?: number): Promise<SpriteManagerState | null> {
    if (revision === undefined) return null;
    const current = await draft(id);
    if (!Number.isSafeInteger(revision) || revision < 0 || current.revision !== revision)
      throw conflict("Appearance changed. Review this resident before continuing.");
    return current.revision ? current.manager : null;
  }

  const settled = (id: string, resident = false) =>
    ports.writes.serialize(writeKey(id, resident), () => read(id, resident));
  return { settled, save, preparedManager };
}
