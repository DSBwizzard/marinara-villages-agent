import type { AgendaWeek } from "./agenda.js";

export const REPAIR_NO_CHANGES = "repair-no-changes";

export type RepairAgendaDay = Omit<AgendaWeek["days"][number], "blocks"> & {
  residentId: string;
  today?: boolean;
  venues?: { value: string; label: string; zones: { value: string; label: string }[] }[];
  blocks: (AgendaWeek["days"][number]["blocks"][number] & {
    repairIndex?: number;
    repairRecordId?: string;
    note?: string;
  })[];
};
export type RepairTopic = "memories" | "people" | "places" | "world" | "progress" | "restore";
export type RepairValue = string | number | boolean;
export type RepairPerson = { id: string; name: string; hasAgenda?: boolean; visitor?: true; npc?: true };
export type RepairPersonSection = "relationships" | "memories" | "wishes" | "home" | "agenda" | "details";
export type RepairWorldSection = "setting" | "circumstances" | "conditions" | "weather" | "scenes" | "snapshots";
export type RepairBrowseIcon = "places" | "venue" | "zone" | "details" | "access" | "people";
export type RepairBrowseItem = {
  id: string;
  title: string;
  icon: RepairBrowseIcon;
  summary?: string;
  mapId?: string;
  mapName?: string;
  image?: string;
  personId?: string;
  children?: RepairBrowseItem[];
};
export type RepairField = {
  key: string;
  label: string;
  value: RepairValue;
  type: "text" | "number" | "choice" | "boolean" | "clock" | "date" | "datetime" | "days";
  options?: { value: string; label: string; parent?: string }[];
  dependsOn?: string;
  multiline?: boolean;
  group?: string;
  readOnly?: boolean;
  min?: number;
  max?: number;
};
export type RepairRecord = {
  artwork?: { locationId: string; zoneId: string; imageUrl?: string; canGenerate: boolean };
  id: string;
  topic: RepairTopic;
  title: string;
  summary: string;
  fields: RepairField[];
  source: string[];
  actions: { id: string; label: string }[];
  people?: {
    id: string;
    name: string;
    text?: string;
    forgotten?: boolean;
    memoryClass?: string;
    current?: boolean;
    status?: string;
    subjects?: string[];
  }[];
  related: { id: string; title: string }[];
  revision?: number;
  token?: string;
  creating?: boolean;
  template?: boolean;
  agendaDay?: string;
  agenda?: RepairAgendaDay;
  subjects?: string[];
  recipients?: { id: string; name: string }[];
  account?: { personId: string; versionId: string };
  target?: import("./village.js").MemoryInspection["target"];
};
export type RepairRequest = {
  operationId: string;
  recordId: string;
  action: string;
  values: Record<string, RepairValue>;
  knowers: string[];
  expectedRecord: string;
  personId?: string;
};
export type RepairChange = { label: string; before: string; after: string };
export type RepairReview = {
  kind: "repair" | "undo" | "restore";
  id: string;
  token: string;
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
  action?: string;
  recordId?: string;
  personId?: string;
};
export type RepairCheckpoint = {
  id: string;
  title: string;
  at: string;
  records: number;
  token: string;
  mode: "automatic" | "manual" | "scheduled";
  villageAt?: string;
};
export type RepairIndex = {
  seed: string;
  identity: string;
  villageName?: string;
  records: RepairRecord[];
  history: RepairHistoryEntry[];
  historyOffset: number;
  historyTotal: number;
  checkpoints: RepairCheckpoint[];
  checkpointOffset: number;
  checkpointTotal: number;
  sceneOpen: boolean;
  people: RepairPerson[];
};
export type RepairRecordPage = {
  records: RepairRecord[];
  total: number;
  next: number | null;
  creation?: RepairRecord;
  directory?: RepairBrowseItem[];
};
