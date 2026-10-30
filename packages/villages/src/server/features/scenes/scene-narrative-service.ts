import { settleSceneNarrative, type SceneNarrativeSource } from "../../domain/rules/scene-narrative-effects.js";
import type { VillageState } from "../../domain/models/world.js";
import type { VenueScene } from "../../domain/models/scene-model.js";
import type { NarrativeAdmission } from "../../domain/models/narrative-model.js";
import { offerSceneNarrative, reserveSceneNarrative } from "../../domain/rules/scene-narrative.js";

export function createSceneNarrative(ports: {
  read: () => Promise<VillageState>;
  mutate: (work: (state: VillageState) => void | Promise<void>) => Promise<void>;
  relationships: (seed: string) => Promise<NonNullable<VillageState["relationshipContext"]>>;
  now: () => Date;
}) {
  return {
    async offer(scene: VenueScene, sourceId: string) {
      let snapshot: VillageState;
      try {
        snapshot = await ports.read();
      } catch {
        return null;
      }
      const abandoned = (state: VillageState) =>
        scene.villageSeed === state.seed && scene.operation
          ? (state.narrative?.claims?.filter(
              (row) =>
                row.sceneId === scene.id &&
                row.submissionId !== scene.operation!.id &&
                !scene.submissions.some((turn) => turn.id === row.submissionId),
            ) ?? [])
          : [];
      // Edited Send has already fenced the abandoned request in the existing coordinator.
      if (abandoned(snapshot).length) {
        await ports.mutate((state) => {
          for (const claim of abandoned(state)) {
            state.narrative!.receipts.push({
              id: claim.id,
              sourceId: claim.id,
              source: "scene",
              at: ports.now().toISOString(),
              rejected: true,
              occurrence: "Introduction source abandoned by an explicit replacement request.",
              after: { situations: [], conditions: [] },
              physical: [],
            });
            state.narrative!.claims = state.narrative!.claims!.filter((row) => row.id !== claim.id);
          }
        });
        snapshot = await ports.read();
      }
      try {
        return offerSceneNarrative(snapshot, scene, sourceId, ports.now());
      } catch {
        return null;
      }
    },
    async reserve(scene: VenueScene, grant: NarrativeAdmission) {
      let admitted = false;
      let proof: NonNullable<NonNullable<VillageState["narrative"]>["claims"]>[number] | null = null;
      await ports.mutate(async (state) => {
        if (state.narrative?.claims?.some((row) => row.id === grant.id)) {
          admitted = reserveSceneNarrative(state, scene, grant, ports.now());
          if (admitted) proof = structuredClone(state.narrative!.claims!.find((row) => row.id === grant.id)!);
          return;
        }
        // Recheck accepted arrangements inside the same reservation transaction.
        let relationships: VillageState["relationshipContext"];
        try {
          relationships = await ports.relationships(state.seed);
        } catch {
          return;
        }
        const candidate = { ...state, relationshipContext: relationships };
        admitted = reserveSceneNarrative(candidate, scene, grant, ports.now());
        if (admitted) {
          state.eventAttempts = candidate.eventAttempts;
          state.narrative = candidate.narrative;
          proof = structuredClone(state.narrative!.claims!.find((row) => row.id === grant.id)!);
        }
      });
      return proof;
    },
    async settle(scene: VenueScene, source: SceneNarrativeSource | undefined) {
      if (source) await ports.mutate((state) => settleSceneNarrative(state, scene, source));
    },
    async retire(scene: VenueScene, grant: NarrativeAdmission | undefined | null) {
      if (grant) await ports.mutate((state) => settleSceneNarrative(state, scene, { grant, development: null }, true));
    },
    async discard(scene: VenueScene) {
      // The existing coordinator must fence/cancel the Scene before this explicit discard.
      await ports.mutate((state) => {
        if (state.seed !== scene.villageSeed || !state.narrative) return;
        const claims = state.narrative.claims?.filter((row) => row.sceneId === scene.id) ?? [];
        for (const claim of claims) {
          if (!state.narrative.receipts.some((row) => row.id === claim.id))
            state.narrative.receipts.push({
              id: claim.id,
              sourceId: claim.id,
              source: "scene",
              at: ports.now().toISOString(),
              rejected: true,
              occurrence: "Uncommitted introduction discarded with its Scene.",
              after: { situations: [], conditions: [] },
              physical: [],
            });
        }
        state.narrative.claims = state.narrative.claims?.filter((row) => row.sceneId !== scene.id);
      });
    },
  };
}
export type SceneNarrative = ReturnType<typeof createSceneNarrative>;
