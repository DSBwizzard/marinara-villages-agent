import type { SettingsState } from "./useSettingsState.js";
import { useEffect } from "react";

export function useKnowledgeCaret(ports: {
  readonly knowledgeDraft: SettingsState["knowledgeDraft"];
  readonly knowledgeRef: SettingsState["knowledgeRef"];
  readonly pendingCaretRef: React.RefObject<number>;
}) {
  useEffect(() => {
    const { knowledgeRef, pendingCaretRef } = ports;

    const caret = pendingCaretRef.current;
    const node = knowledgeRef.current;
    if (caret === null || !node) return;
    pendingCaretRef.current = null;
    node.focus();
    node.setSelectionRange(caret, caret);
  }, [ports.knowledgeDraft]);
}
