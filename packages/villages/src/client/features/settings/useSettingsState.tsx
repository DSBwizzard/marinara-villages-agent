import type { VenueRequest } from "../../../shared/contracts/village.js";
import { useRef, useState } from "react";

/** Always mounted by the application controller so navigation retains this feature state. */
export function useSettingsState() {
  const [requestEdits, setRequestEdits] = useState<Record<string, VenueRequest["venueDraft"]>>({});

  /** The village's world-knowledge prompt box as it is being edited. */
  const [knowledgeDraft, setKnowledgeDraft] = useState("");

  /**
   * Who the player is, as the picker has it.
   *
   * One draft, and there used to be three. The other two were a typed name and
   * a typed blurb for the player, which the village stopped storing when the
   * Persona took the question over — "who are you" has one answer now, and a
   * second box beside it was only ever a way for the two to disagree.
   *
   * They were not merely dead. They were seeded from `settings.playerName` and
   * `settings.playerDescription`, which the snapshot no longer carries, so both
   * drafts came back `undefined` the moment the village tab was opened — and
   * founding a village then died inside `playerNameDraft.trim()` with a
   * TypeError, because nothing in the build or the linter can see a field that
   * is missing from a hand-written mirror of the server's view.
   */
  const [personaDraft, setPersonaDraft] = useState("");

  const [settingDraft, setSettingDraft] = useState("");

  const [lorebookDraft, setLorebookDraft] = useState<string[]>([]);

  const [loreTokenBudgetDraft, setLoreTokenBudgetDraft] = useState(1600);

  const [noticeDraft, setNoticeDraft] = useState("");

  const [settingsError, setSettingsError] = useState("");

  // The prompt box, so a macro can be dropped at the caret of it and the caret
  // put back afterwards.
  //
  // There used to be two refs and a `boxFocusRef` saying which one the macro row
  // would write into. The row of tokens now serves exactly one box, and a target
  // that has only one possible value is not a thing to keep.
  const knowledgeRef = useRef<HTMLTextAreaElement | null>(null);
  return {
    requestEdits,
    setRequestEdits,
    knowledgeDraft,
    setKnowledgeDraft,
    personaDraft,
    setPersonaDraft,
    settingDraft,
    setSettingDraft,
    lorebookDraft,
    setLorebookDraft,
    loreTokenBudgetDraft,
    setLoreTokenBudgetDraft,
    noticeDraft,
    setNoticeDraft,
    settingsError,
    setSettingsError,
    knowledgeRef,
  };
}

export type SettingsState = ReturnType<typeof useSettingsState>;
