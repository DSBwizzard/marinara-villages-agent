import type { VenueScene } from "../../packages/villages/src/server/domain/models/scene-model.js";
import { readNarrationSubmission } from "../../packages/villages/src/server/domain/decoding/narration-submission.js";
import { defaultVillageState } from "../../packages/villages/src/server/domain/decoding/village-codec.js";
import { memoryHash } from "../../packages/villages/src/server/domain/rules/memory-integrity.js";
import { captureSceneLayout } from "../../packages/villages/src/server/domain/rules/scene-layout.js";
import { zoneEventScene } from "../../packages/villages/src/server/domain/rules/zone-events.js";
import {
  fittedNarrationReadset,
  narrationContinuityContext,
} from "../../packages/villages/src/server/domain/rules/narration-context.js";
import { venueFixture } from "./venues.fixture.js";

export function pendingSceneSubmission(scene: VenueScene, id: string, message: string, replyLineId: string) {
  const at = scene.startedAt;
  const venue = venueFixture({ id: scene.placeId || "fixture-place", name: "Hall" });
  const world = { ...defaultVillageState(), seed: scene.villageSeed!, setupAt: at, foundedAt: at, venues: [venue] };
  const frame = zoneEventScene(
    {
      ...scene,
      placeId: venue.id,
      zoneId: "exterior",
      participants: [],
      activeIds: [],
      lines: [],
      submissions: [],
      sceneAttendance: { capturedAt: at, layout: captureSceneLayout(venue), occupants: [] },
    },
    venue,
  );
  const capture = narrationContinuityContext(world, frame, venue, id, message, at);
  const readset = fittedNarrationReadset(
    world,
    capture,
    capture.parts.map((part) => part.block.evidenceId!),
  );
  const text = scene.lines.find((line) => line.id === replyLineId)?.content ?? "A quiet reply.";
  const raw = { segments: [{ id: "reply", kind: "narration", text }] };
  return readNarrationSubmission({
    id,
    message,
    mode: "chat",
    targetId: "",
    at,
    requestFingerprint: memoryHash(["chat", "", null, message]),
    acceptance: { status: "pending", rejected: [] },
    narration: { raw, readset, responseDigest: memoryHash(raw) },
    replyLineIds: [replyLineId],
  });
}
