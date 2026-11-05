/** Explicit creator diagnostics; never part of a public Scene or Village snapshot. */
export type LoreInspection = {
  purpose: string;
  stage: "selection" | "prompt";
  budget: number;
  entries: {
    id: string;
    bookId: string;
    name: string;
    bookName?: string;
    images?: { path: string; caption: string }[];
    match: "current" | "recent" | "setting" | "constant" | "none";
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

/** Prompt provenance only; never entry bodies, matching text, or character knowledge. */
export type LoreUse = { id: string; bookId: string; name: string; bookName?: string; targets: string[] };
