/** Explicit creator diagnostics; never part of a public Scene or Village snapshot. */
export type LoreTrigger = {
  constant: boolean;
  match: "current" | "recent" | "setting" | "constant";
  key?: string;
  caseSensitive: boolean;
  matchWholeWords: boolean;
  context?: { text: string; start: number; end: number; source: string };
  secondaryMatches?: { key: string; text: string; source: string }[];
  secondary?: { logic: "and_any" | "and_all" | "not_any" | "not_all"; matched: number; total: number };
};
export type LoreInspection = {
  inspectionId?: string;
  scope?: string;
  at?: string;
  requestContext?: string;
  purpose: string;
  stage: "selection" | "prompt";
  budget: number;
  entries: {
    id: string;
    bookId: string;
    name: string;
    bookName?: string;
    match: "current" | "recent" | "setting" | "constant" | "none";
    trigger?: LoreTrigger;
    status:
      | "included"
      | "no-match"
      | "conditions"
      | "disabled"
      | "folder-disabled"
      | "unsupported"
      | "budget"
      | "entry-limit"
      | "context-limit";
  }[];
  omittedDiagnostics: number;
};
export type LoreDiagnostic = LoreInspection & { at: string; operationId?: string };

export type LoreActivity = {
  id: string;
  at: string;
  purpose: string;
  revision: number;
  entries: LoreUse[];
};
export type LoreActivityList = { scope: string; revision: number; records: LoreActivity[] };
export type LoreTriggerDetail = {
  trigger: LoreTrigger | null;
  at?: string;
  capturedAt?: string;
  purpose?: string;
  requestContext?: string;
};

/** Prompt provenance and opaque inspection references; never bodies, keys, or matching text. */
export type LoreUse = {
  id: string;
  bookId: string;
  name: string;
  bookName?: string;
  targets: string[];
  inspections?: { target: string; id: string }[];
};
