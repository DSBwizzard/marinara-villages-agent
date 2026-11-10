import type { VillageState } from "../models/world.js";
import type { NarrationReadset } from "../models/narration-model.js";
import type { ContinuityEvidence } from "../models/continuity-model.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import type { NarrationSourceContext } from "./narration-sources.js";
import { narrationPositions, narrationWitnesses, narrationCommunication } from "./narration-sources.js";
import { assertNarrationDecision } from "./narration-access.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";

export function assertNarrationPlayerIntent(context: NarrationSourceContext, sources: ContinuityEvidence[]) {
  memoryRequire(
    sources.length > 0 &&
      sources.every(
        (source) =>
          source.seed === context.seed &&
          source.episodeId === context.episodeId &&
          source.unitId === "input" &&
          source.actorId === "player" &&
          ["speech", "observation"].includes(source.kind) &&
          source.fingerprint === memoryHash(context.input) &&
          source.range &&
          context.input.slice(source.range.start, source.range.end) === source.excerpt &&
          source.moment &&
          memoryHash(source.positions) === memoryHash(narrationPositions(context, source.moment)),
      ),
    "native action needs the Player's actual spoken or visible intent",
  );
}

export function applyNarrationScene(
  state: VillageState,
  command: { type: "contact.end"; who: string } | { type: "scene.end" },
  readset: NarrationReadset,
  context: NarrationSourceContext,
  sources: ContinuityEvidence[],
  receiptId: string,
  segment: number,
) {
  const by = command.type === "scene.end" ? "player" : command.who;
  if (by === "player") assertNarrationPlayerIntent(context, sources);
  else assertNarrationDecision(state, by, narrationCommunication(context), sources);
  let contactEndedIds: string[] = [],
    closed: true | undefined;
  if (command.type === "contact.end") {
    const contacts = context.scene.doorwayContacts ?? [];
    memoryRequire(
      contacts.length && (by === "player" || contacts.some((row) => row.characterId === by)),
      "that doorway contact was not admitted",
    );
    contactEndedIds = by === "player" ? contacts.map((row) => row.characterId) : [by];
  } else {
    memoryRequire(segment === context.lines.length - 1, "Scene closure must follow all accepted local actions");
    closed = true;
    const opening = state.opening;
    if (
      opening?.version === 3 &&
      opening.stage === "gathering" &&
      opening.gatheringSceneId === context.scene.id &&
      opening.id === readset.source.scene.openingGatheringId
    )
      opening.stage = "complete";
  }
  const observedBy = narrationWitnesses(sources, ["sight"]);
  const receipt: AcceptedEpisode["commandReceipts"][number] = {
    id: receiptId,
    kind: closed ? "scene" : "contact",
    targetId: closed ? context.scene.id : by,
    revision: readset.sceneRevision,
    text: closed ? "The Player ended the Scene." : "Doorway contact ended.",
    witnesses: narrationWitnesses(sources),
    ...(observedBy.length ? { observedBy } : {}),
    ...(!closed ? { endedContacts: contactEndedIds } : {}),
  };
  return { receipt, sources, sceneEffect: { contactEndedIds, ...(closed ? { closed } : {}) } };
}
