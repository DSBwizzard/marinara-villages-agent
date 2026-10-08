
export type SpatialSnapshotSource = "bootstrap" | "owner_turn" | "assistant_swipe" | "definition_repair" | "branch_copy";

export interface SpatialContextSnapshot {
    id: string;
    chatId: string;
    messageId: string;
    swipeIndex: number;
    currentLocationId: string | null;
    definitionRevision: number;
    source: SpatialSnapshotSource;
    transitionCommandId: string | null;
    transitionPayloadHash: string | null;
    createdAt: string;
}
