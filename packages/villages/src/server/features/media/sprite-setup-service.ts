import { createHash, randomUUID } from "node:crypto";
import type {
  AppearanceExpression,
  SpriteAppearance,
  SpriteArtwork,
  SpriteLibraryFolder,
  SpriteManagerState,
  SpriteSetupDraft,
} from "../../../shared/contracts/sprites.js";
import type { mutateDocument } from "../../adapters/storage/document-store.js";
import type { villagesDocuments } from "../../adapters/engine/runtime-host.js";
import type { villageEngineJson } from "../../adapters/engine/engine-transport.js";
import type { SpriteManager } from "./sprite-manager-service.js";
import type { SpriteWrites } from "./sprite-writes.js";
import type { VillageState } from "../../domain/models/world.js";
import {
  coerceSpriteManager,
  emptySpriteManager,
  isEngineSpriteFilename,
  readSpriteExclusions,
  readSpriteFolders,
} from "../../domain/rules/sprite-manager-model.js";
import { spriteLabel } from "../../../shared/helpers/sprite-variants.js";
import { asRecord, asString } from "../../domain/rules/coerce.js";
import { badRequest, conflict, badGateway, notFound, VillagesRequestError } from "../../domain/rules/errors.js";
import { villageWorldScope } from "../../domain/rules/village-identity.js";

export interface SpriteSetupPorts {
  villagesDocuments: typeof villagesDocuments;
  mutateDocument: typeof mutateDocument;
  villageEngineJson: typeof villageEngineJson;
  manager: Pick<SpriteManager, "prepareArtwork" | "readImage">;
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
      return { revision: 0, token, manager: await withPreparedArtwork(id, manager) };
    }
    const current = await draft(id);
    return { ...current, token: hash([villageWorldScope(world), current]) };
  }

  async function withPreparedArtwork(id: string, saved: SpriteManagerState) {
    const artwork = [...saved.artwork];
    for (const art of (await draft(id)).manager.artwork) {
      if (
        artwork.some(
          (item) =>
            item.id === art.id ||
            (item.engineSource &&
              art.engineSource &&
              item.engineSource.characterId === art.engineSource.characterId &&
              item.engineSource.filename === art.engineSource.filename &&
              item.source.sha256 === art.source.sha256),
        )
      )
        continue;
      artwork.push(art);
    }
    return { ...saved, artwork };
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
      const version = asString(file.url).match(/\?v=(\d+)$/)?.[1];
      return [
        {
          filename,
          label: asString(file.label).trim() || filename,
          folderId: folders.some((folder) => folder.id === file.folderId) ? asString(file.folderId) : null,
          url: "/api/sprites/" + key + "/file/" + encodeURIComponent(filename) + (version ? "?v=" + version : ""),
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
      const folders = readSpriteFolders(input.folders);
      const excluded = readSpriteExclusions(input.excluded);
      if (
        !/^[a-z0-9-]{1,80}$/i.test(requestId) ||
        typeof input.useSprites !== "boolean" ||
        !Array.isArray(input.expressions) ||
        typeof input.defaultExpressionId !== "string" ||
        (input.folders !== undefined && !folders) ||
        (input.excluded !== undefined && !excluded)
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

      const manager = structuredClone(resident ? await withPreparedArtwork(id, current.manager) : current.manager);
      if (manager.folders && !folders) throw conflict("Reload Appearance to choose sprite folders.");
      const existingExpressions = new Set(manager.expressions.map((row) => row.id));
      const ids = new Map<string, string>();
      const copies = new Map<string, SpriteArtwork>();
      const rows: AppearanceExpression[] = [];
      const filenames = new Map<string, string>();
      const folderFiles = new Set<string>();
      const excludedFiles = excluded ?? manager.excluded;
      const blocked = { front: new Set(excludedFiles?.front), side: new Set(excludedFiles?.side) };
      const rowLimit = folders && !folders.front && !folders.side ? 400 : 200;
      if (input.expressions.length > manager.expressions.length + rowLimit)
        throw badRequest("Choose up to 200 new sprites at a time.");

      for (const value of input.expressions) {
        const row = asRecord(value);
        const key = asString(row.id);
        const name = asString(row.name).trim();
        if (
          (!existingExpressions.has(key) && !/^new-[a-z0-9-]{1,80}$/i.test(key)) ||
          ids.has(key) ||
          !name ||
          name.length > 100
        )
          throw badRequest("Check the expression names.");
        ids.set(key, existingExpressions.has(key) ? key : "e-" + randomUUID());
        const next: AppearanceExpression = { id: key, name };
        for (const view of views) {
          if (row[view] === undefined) continue;
          const choice = asRecord(row[view]);
          const artworkId = asString(choice.artworkId);
          const file = choice.filename ?? manager.artwork.find((art) => art.id === artworkId)?.engineSource?.filename;
          if (typeof file === "string" && blocked[view].has(file))
            throw badRequest("Remove excluded sprites before saving.");
          if (artworkId && choice.filename === undefined && manager.artwork.some((art) => art.id === artworkId)) {
            if (
              folders &&
              (folders[view] !== manager.folders?.[view] ||
                !manager.expressions.some((prior) => prior.id === key && prior.name === name) ||
                !manager.assignments.some(
                  (prior) => prior.expressionId === key && prior.view === view && prior.artworkId === artworkId,
                ))
            )
              throw conflict("Refresh the sprite folders and review again.");
            next[view] = { artworkId };
          } else if (choice.artworkId === undefined && isEngineSpriteFilename(choice.filename)) {
            const version = asString(choice.version);
            const facingFile = view + ":" + choice.filename;
            if (
              (version && !/^\d{1,20}$/.test(version)) ||
              (filenames.has(choice.filename) && filenames.get(choice.filename) !== version) ||
              (folders && folderFiles.has(facingFile))
            )
              throw badRequest("Reopen the picker to choose the current sprite.");
            folderFiles.add(facingFile);
            next[view] = { filename: choice.filename };
            filenames.set(choice.filename, version);
          } else throw badRequest("Choose an available sprite.");
        }
        if (!next.front && !next.side) throw badRequest("Choose artwork for each expression.");
        if (folders && next.front && next.side) throw badRequest("Choose one facing for each folder sprite.");
        rows.push(next);
      }
      if (input.defaultExpressionId && !ids.has(input.defaultExpressionId))
        throw badRequest("Choose an available default.");
      if (filenames.size > 200) throw badRequest("Choose up to 200 new sprites at a time.");
      if (filenames.size) {
        const library = await files(id);
        const byFilename = new Map(library.files.map((file) => [file.filename, file]));
        if (folders) {
          for (const row of rows) {
            for (const view of views) {
              const filename = row[view]?.filename;
              if (!filename) continue;
              const file = byFilename.get(filename);
              const label =
                file &&
                (spriteLabel(file.label || file.filename)
                  .slice(0, 100)
                  .trim() ||
                  "Sprite");
              if (!file || (file.folderId ?? "") !== folders[view] || row.name !== label)
                throw conflict("Engine folders or labels changed. Refresh the sprite folders and review again.");
            }
          }
        }
        for (const [filename, version] of filenames) {
          const file = byFilename.get(filename);
          if (!file || (file.version ?? "") !== version)
            throw badRequest("Engine sprites changed. Reopen the picker and choose the current image.");
          signal.throwIfAborted();
          const artwork = await ports.writes.serialize("import", async () => {
            signal.throwIfAborted();
            const image = await ports.manager.readImage(file.url);
            const sha256 = createHash("sha256")
              .update(Buffer.from(image.split(",")[1]!, "base64"))
              .digest("hex");
            const prior = manager.artwork.find(
              (art) =>
                art.engineSource?.characterId === id &&
                art.engineSource.filename === filename &&
                art.source.sha256 === sha256,
            );
            return prior ?? ports.manager.prepareArtwork(filename, image, { characterId: id, filename });
          });
          if (!manager.artwork.some((art) => art.id === artwork.id)) manager.artwork.push(artwork);
          copies.set(filename, artwork);
        }
      }
      manager.expressions = rows.map((row) => ({ id: ids.get(row.id)!, name: row.name }));
      const replaced = new Set(
        current.manager.assignments
          .filter((old) => {
            const next = rows.find((row) => row.id === old.expressionId)?.[old.view];
            return next && (next.artworkId ?? copies.get(next.filename!)?.id) !== old.artworkId;
          })
          .map((old) => old.artworkId),
      );
      manager.assignments = rows.flatMap((row) =>
        views.flatMap((view) => {
          const choice = row[view];
          return choice
            ? [
                {
                  expressionId: ids.get(row.id)!,
                  view,
                  artworkId: choice.artworkId ?? copies.get(choice.filename!)!.id,
                },
              ]
            : [];
        }),
      );
      manager.artwork = manager.artwork.filter(
        (art) => !replaced.has(art.id) || manager.assignments.some((row) => row.artworkId === art.id),
      );
      manager.defaultExpressionId =
        ids.get(input.defaultExpressionId) ??
        manager.expressions.find((row) => row.name.toLowerCase() === "neutral")?.id ??
        manager.expressions[0]?.id;
      if (input.useSprites && manager.assignments.length) delete manager.useSprites;
      else manager.useSprites = false;
      if (folders) manager.folders = folders;
      if (excluded) {
        if (excluded.front.length || excluded.side.length) manager.excluded = excluded;
        else delete manager.excluded;
      }
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
