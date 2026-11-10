import type { VenueScene } from "../../domain/models/scene-model.js";
import type { VillageState } from "../../domain/models/world.js";
import { badRequest, conflict, notFound } from "../../domain/rules/errors.js";
import { scenePresenceNotices, sceneProcessingSummary } from "../../domain/rules/scene-public.js";
import { sceneChangeDiagnosticId, sceneErrorDetails } from "./error-details.js";

export interface SceneChangesPorts {
  withSceneWork?<T>(id: string, work: () => Promise<T>): Promise<T>;
  readSession(id: string): Promise<VenueScene>;
  readVillageState(): Promise<VillageState>;
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
  async function readSceneChanges(id: string, cursor = "", limit = 20) {
    const { scene, village } = await current(id);
    const after = cursor ? Number(cursor) : 0;
    if (!Number.isSafeInteger(after) || after < 0) throw badRequest("Invalid changes cursor.");
    const size = Math.max(1, Math.min(50, Math.floor(Number(limit) || 20)));
    const rows = scene.submissions
      .map((turn, index) => ({ turn, sequence: turn.changeSequence ?? index + 1 }))
      .filter((row) => row.sequence > after)
      .toSorted((a, b) => a.sequence - b.sequence);
    const page = rows.slice(0, size);
    const notices = [
      ...scenePresenceNotices(scene),
      ...page.flatMap(({ turn }) => (turn.acceptance.status === "applied" ? (turn.recordEvents ?? []) : [])),
    ].filter((event) => !village.dismissedNoticeIds.includes(event.id));
    return {
      sceneId: id,
      changes: page.map(({ turn }) => ({
        submissionId: turn.id,
        at: turn.at,
        notices:
          turn.acceptance.status === "applied"
            ? (turn.recordEvents ?? []).filter((event) => !village.dismissedNoticeIds.includes(event.id))
            : [],
      })),
      notices,
      dismissedNoticeIds: village.dismissedNoticeIds,
      unresolved: scene.submissions
        .filter((turn) => turn.acceptance.status !== "applied")
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
        ? scene.recordEvents.some((event) => event.id === noticeId)
        : scenePresenceNotices(scene).some((event) => event.id === noticeId) ||
          scene.submissions.some((turn) => turn.recordEvents?.some((event) => event.id === noticeId));
    if (!known) throw notFound("That saved notice is unavailable.");
    await mutateVillageState((state) => {
      if (state.seed !== village.seed) throw conflict("Village identity changed.");
      if (!state.dismissedNoticeIds.includes(noticeId)) state.dismissedNoticeIds.push(noticeId);
    });
    return { dismissed: true };
  }
  async function replaySceneChanges(id: string) {
    const replay = async () => {
      const { scene } = await current(id);
      for (const turn of scene.submissions.filter((turn) => turn.acceptance.status !== "applied"))
        await processSavedExchange(id, turn.id);
      return readSceneChanges(id);
    };
    return withSceneWork ? withSceneWork(id, replay) : replay();
  }
  return { readSceneErrorDetails, readSceneChanges, dismissSceneNotice, replaySceneChanges };
}
export type SceneChanges = ReturnType<typeof createSceneChanges>;
