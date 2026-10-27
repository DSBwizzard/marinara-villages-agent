export type RepairTopic = "memories" | "people" | "places" | "world" | "progress" | "restore";
export type RepairValue = string | number | boolean;
export type RepairField = {
  key: string;
  label: string;
  value: RepairValue;
  type: "text" | "number" | "choice" | "boolean";
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
};
export type RepairRecord = {
  id: string;
  topic: RepairTopic;
  title: string;
  summary: string;
  fields: RepairField[];
  source: string[];
  actions: { id: string; label: string }[];
  people?: { id: string; name: string; text?: string; forgotten?: boolean }[];
  related: { id: string; title: string }[];
  private?: boolean;
  revision?: number;
  token?: string;
  creating?: boolean;
};
export type RepairRequest = {
  operationId: string;
  recordId: string;
  action: string;
  values: Record<string, RepairValue>;
  knowers: string[];
  inspection: boolean;
  expectedRecord: string;
};
export type RepairChange = { label: string; before: string; after: string };
export type RepairReview = {
  kind: "repair" | "undo" | "restore";
  id: string;
  title: string;
  changes: RepairChange[];
  affected: string[];
  related: RepairRecord["related"];
  checkpoint: boolean;
  undoAvailable: boolean;
  memory?: { creating: boolean; people: string[] };
};
export type RepairHistoryEntry = {
  id: string;
  title: string;
  at: string;
  changes: RepairChange[];
  affected: string[];
  undone: boolean;
  canUndo: boolean;
};
export type RepairCheckpoint = { id: string; title: string; at: string; records: number };
export type RepairIndex = {
  seed: string;
  identity: string;
  records: RepairRecord[];
  history: RepairHistoryEntry[];
  historyOffset: number;
  historyTotal: number;
  checkpoints: RepairCheckpoint[];
  sceneOpen: boolean;
};
