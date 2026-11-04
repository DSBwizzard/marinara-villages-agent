export type LocalDraftStatus = { dirty: boolean; busy: boolean } | null;
export type ReportLocalDraftStatus = (key: "world" | "map", status: LocalDraftStatus) => void;
