/** Explicit creator diagnostics; never part of a public Scene or Village snapshot. */
export type LoreInspection = {
  purpose: string;
  stage: "selection" | "prompt";
  budget: number;
  entries: {
    id: string;
    bookId: string;
    name: string;
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
