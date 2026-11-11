import type { VenueScene } from "../../domain/models/scene-model.js";
import type { VillageState } from "../../domain/models/world.js";
import { badRequest, conflict, notFound } from "../../domain/rules/errors.js";
import { scenePresenceNotices, sceneProcessingSummary, sceneTurnNotices } from "../../domain/rules/scene-public.js";
import { visibleSceneNotices } from "../../domain/rules/narration-notices.js";
import { sceneChangeDiagnosticId, sceneErrorDetails } from "./error-details.js";

export interface SceneChangesPorts {
  withSceneWork?<T>(id: string, work: () => Promise<T>): Promise<T>;
  readSession(id: string): Promise<VenueScene>;
  readVillageState(options?: { memories: true }): Promise<VillageState>;
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  processSavedExchange(sessionId: string, submissionId: string): Promise<void>;
  readTerminal?(id: string): Promise<import("../../domain/models/scene-terminal-model.js").SceneTerminal | null>;
}
/** Saved results and explicit provider-free replay; reads never execute gameplay or model work. */
export function createSceneChanges({
  withSceneWork,
  readSession,
  readVillageState,
  mutateVillageState,
  processSavedExchange,
  readTerminal,
}: SceneChangesPorts) {
  async function current(id: string) {
    const [scene, village] = await Promise.all([readSession(id), readVillageState()]);
    if (scene.villageSeed !== village.seed) throw conflict("This Scene belongs to a different Village.");
    return { scene, village };
  }
  async function readSceneErrorDetails(id: string) {
    return sceneErrorDetails((await current(id)).scene);
  }
  async function readSceneChanges(id: string, cursor = "", limit = 20, shownWishes = "") {
    const { scene, village } = await current(id);
    const after = cursor ? Number(cursor) : 0;
    if (!Number.isSafeInteger(after) || after < 0) throw badRequest("Invalid changes cursor.");
    if (typeof shownWishes !== "string" || shownWishes.length > 50 * 72 - 1)
      throw badRequest("Invalid Wish notice list.");
    const checked = new Set(shownWishes ? shownWishes.split(",") : []);
    if (checked.size > 50 || [...checked].some((notice) => !/^notice:[a-f0-9]{64}$/u.test(notice)))
      throw badRequest("Invalid Wish notice list.");
    const size = Math.max(1, Math.min(50, Math.floor(Number(limit) || 20)));
    const rows = scene.submissions
      .map((turn, index) => ({ turn, sequence: turn.changeSequence ?? index + 1 }))
      .filter((row) => row.sequence > after)
      .toSorted((a, b) => a.sequence - b.sequence);
    const page = rows.slice(0, size);
    const events = [...scenePresenceNotices(scene), ...page.flatMap(({ turn }) => sceneTurnNotices(turn))];
    const watched = checked.size
      ? scene.submissions.flatMap(sceneTurnNotices).filter((event) => event.kind === "wish" && checked.has(event.id))
      : [];
    const noticeAuthority =
      events.some((event) => event.kind === "wish") || watched.length
        ? await readVillageState({ memories: true })
        : village;
    if (noticeAuthority.seed !== scene.villageSeed || noticeAuthority.setupAt !== village.setupAt)
      throw conflict("This Scene belongs to a different Village.");
    const visible = new Set(visibleSceneNotices(noticeAuthority, [...new Set([...events, ...watched])]));
    const stillVisible = new Set(watched.filter((event) => visible.has(event)).map((event) => event.id));
    return {
      sceneId: id,
      changes: page.map(({ turn }) => ({
        submissionId: turn.id,
        at: turn.at,
        notices: sceneTurnNotices(turn).filter((event) => visible.has(event)),
      })),
      notices: events.filter((event) => visible.has(event)),
      hiddenWishNoticeIds: [...checked].filter((notice) => !stillVisible.has(notice)),
      dismissedNoticeIds: noticeAuthority.dismissedNoticeIds,
      unresolved: scene.submissions
        .filter((turn) => turn.acceptance.status === "pending" || turn.acceptance.status === "held")
        .map((turn) => ({
          submissionId: turn.id,
          diagnosticId: sceneChangeDiagnosticId(turn),
          status: turn.acceptance.status,
          at: turn.at,
          reason: turn.acceptance.status === "held" ? "The saved reply needs review." : "Applying the saved reply.",
        })),
      processingSummary: sceneProcessingSummary(scene),
      activeRequest: { status: scene.operation?.status },
      nextCursor: String(page.at(-1)?.sequence ?? after),
      hasMore: rows.length > page.length,
    };
  }
  async function dismissSceneNotice(id: string, noticeId: string) {
    const [village, scene] = await Promise.all([
      readVillageState(),
      readSession(id).catch(async (error: unknown) => {
        if ((error as { statusCode?: number })?.statusCode !== 404 || !readTerminal) throw error;
        const terminal = await readTerminal(id);
        if (!terminal) throw error;
        return terminal;
      }),
    ]);
    if (scene.villageSeed !== village.seed) throw conflict("Village identity changed.");
    const known =
      "recordEvents" in scene
        ? scene.recordEvents.find((event) => event.id === noticeId)
        : [...scenePresenceNotices(scene), ...scene.submissions.flatMap(sceneTurnNotices)].find(
            (event) => event.id === noticeId,
          );
    if (!known) throw notFound("That saved notice is unavailable.");
    await mutateVillageState((state) => {
      if (state.seed !== village.seed) throw conflict("Village identity changed.");
      if (
        known.kind === "wish" &&
        !state.dismissedNoticeIds.includes(noticeId) &&
        !visibleSceneNotices(state, [known]).length
      )
        throw notFound("That saved notice is unavailable.");
      if (!state.dismissedNoticeIds.includes(noticeId)) state.dismissedNoticeIds.push(noticeId);
    });
    return { dismissed: true };
  }
  async function replaySceneChanges(id: string) {
    const replay = async () => {
      const { scene } = await current(id);
      for (const turn of scene.submissions.filter(
        (turn) => turn.acceptance.status === "pending" || turn.acceptance.status === "held",
      ))
        await processSavedExchange(id, turn.id);
      return readSceneChanges(id);
    };
    return withSceneWork ? withSceneWork(id, replay) : replay();
  }
  return { readSceneErrorDetails, readSceneChanges, dismissSceneNotice, replaySceneChanges };
}
export type SceneChanges = ReturnType<typeof createSceneChanges>;
