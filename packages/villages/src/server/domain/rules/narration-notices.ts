import { episodeSourceGraph } from "../decoding/episode-codec.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import type { VenueRecordEvent } from "../models/scene-model.js";
import type { VillageState } from "../models/world.js";
import { continuityActor } from "./continuity-actors.js";
import { continuityProtectionUnits, continuitySourceUnit, continuityVersionId, continuityViews } from "./continuity.js";
import { activeLodging } from "./lodging-presence.js";
import { memoryHash } from "./memory-integrity.js";

const nativeNotices: Partial<
  Record<AcceptedEpisode["commandReceipts"][number]["kind"], Pick<VenueRecordEvent, "kind" | "text">>
> = {
  project: { kind: "project", text: "Project updated" },
  establishment: { kind: "project", text: "Establishment updated" },
  "venue-request": { kind: "request", text: "Venue request updated" },
  appointment: { kind: "memory", text: "Appointment recorded" },
  discovery: { kind: "venue", text: "Place discovered" },
};

const wishNoticeId = (versionId: string) => "notice:" + memoryHash(["wish", versionId]);

function eligibleWish(
  state: VillageState,
  { id, owner, repaired, version }: ReturnType<typeof continuityViews>[number],
) {
  return (
    !repaired &&
    !version.parentId &&
    version.class === "desire" &&
    owner &&
    owner.id !== "player" &&
    continuityActor(state, owner.id)?.incarnation === owner.incarnation &&
    state.wishFollowing?.[owner.id + ":" + id] !== false
  );
}

export function visibleSceneNotices(state: VillageState, events: VenueRecordEvent[]): VenueRecordEvent[] {
  const dismissed = new Set(state.dismissedNoticeIds);
  const visible = events.filter(
    (event) =>
      !dismissed.has(event.id) &&
      !(event.kind === "venue" && ["Stay agreed", "Access updated"].includes(event.text)) &&
      !(event.kind === "request" && event.text === "Residence updated"),
  );
  if (!visible.some((event) => event.kind === "wish")) return visible;
  const player = continuityActor(state, "player")!;
  const blocked = continuityProtectionUnits(
    state.continuity,
    player,
    episodeSourceGraph(state.episodes.records, player),
  );
  const eligible = new Map(
    continuityViews(state.continuity, player, state.setupAt, blocked)
      .filter((view) => eligibleWish(state, view))
      .map((view) => [wishNoticeId(view.version.id), view]),
  );
  return visible.filter((event) => {
    if (event.kind !== "wish") return true;
    const wish = eligible.get(event.id);
    return wish && wish.id === event.wishUpdate?.wishId && wish.owner?.id === event.wishUpdate?.actorId;
  });
}

/** Project from the current Player view. Fixed labels keep notice history free of saved source text. */
export function narrationSceneNotices(state: VillageState, episode: AcceptedEpisode): VenueRecordEvent[] {
  const player = continuityActor(state, "player")!;
  if (
    state.seed !== episode.seed ||
    !episode.actors.some((actor) => actor.id === player.id && actor.incarnation === player.incarnation)
  )
    return [];

  const blocked = continuityProtectionUnits(
    state.continuity,
    player,
    episodeSourceGraph(state.episodes.records, player),
  );
  const notices = new Map<string, VenueRecordEvent>();
  if (episode.playerAccessChanges?.length) {
    const id = "notice:" + memoryHash([episode.id, "player-access"]);
    notices.set(id, {
      id,
      kind: "access",
      text: "Access updated",
      accessAt: episode.acceptedAt,
      accessChanges: episode.playerAccessChanges,
    });
  }
  const notifiedReceipts = new Set<string>();
  for (const receipt of episode.commandReceipts) {
    const label = nativeNotices[receipt.kind];
    if ((!label && receipt.kind !== "access") || !receipt.witnesses.includes(player.id)) continue;
    const proof = episode.grounding.find(
      (source) => source.kind === "native" && source.committedReceiptId === receipt.id,
    );
    if (!proof || blocked.has(continuitySourceUnit(proof))) continue;
    notifiedReceipts.add(receipt.id);
    if (label) {
      const id = "notice:" + memoryHash([episode.id, "receipt", receipt.id]);
      notices.set(id, { id, ...label });
    }
  }
  if (!episode.continuityVersionIds.length) return [...notices.values()];

  const accepted = new Set(episode.continuityVersionIds);
  const lodgingRoots = new Set(
    state.continuity.versions.filter((version) => version.lodging).map((version) => version.rootId),
  );
  const lodgingSources = new Set(
    episode.playerAccessChanges?.some(({ entry }) => entry.kind === "stay")
      ? activeLodging(state, "player", new Date(episode.acceptedAt))?.permission.sourceLineIds
      : [],
  );
  const views = continuityViews(state.continuity, player, episode.acceptedAt, blocked);
  for (const view of views) {
    const { version } = view;
    if (
      view.repaired ||
      lodgingRoots.has(view.id) ||
      version.sources.some((source) => lodgingSources.has(source.id)) ||
      !accepted.has(version.id) ||
      version.id !== continuityVersionId(state.seed, version.operationId, player)
    )
      continue;
    if (version.class === "desire" && !version.parentId && view.owner) {
      if (!eligibleWish(state, view)) continue;
      const id = wishNoticeId(version.id);
      const status =
        version.closed?.reason === "fulfilled" ? "fulfilled" : view.headRevision === 1 ? "revealed" : "progress";
      notices.set(id, {
        id,
        kind: "wish",
        text: status === "fulfilled" ? "Wish fulfilled" : status === "revealed" ? "Wish shared" : "Wish updated",
        wishUpdate: { actorId: view.owner.id, wishId: view.id, state: status },
      });
    } else if (
      !version.parentId &&
      !version.sources.some((source) => source.committedReceiptId && notifiedReceipts.has(source.committedReceiptId))
    ) {
      const id = "notice:" + memoryHash([episode.id, "memory", version.id]);
      notices.set(id, { id, kind: "memory", text: "Memory saved" });
    }
  }
  return [...notices.values()];
}
