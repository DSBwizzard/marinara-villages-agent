/** Explicit creator diagnostics; never part of a public Scene or Village snapshot. */
export type LoreTrigger = {
  constant: boolean;
  match: "current" | "recent" | "setting" | "constant";
  key?: string;
  caseSensitive: boolean;
  matchWholeWords: boolean;
  secondary?: { logic: "and_any" | "and_all" | "not_any" | "not_all"; matched: number; total: number };
};
export type LoreInspection = {
  inspectionId?: string;
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

/** Prompt provenance and opaque inspection references; never bodies, keys, or matching text. */
export type LoreUse = {
  id: string;
  bookId: string;
  name: string;
  bookName?: string;
  targets: string[];
  inspections?: { target: string; id: string }[];
};
