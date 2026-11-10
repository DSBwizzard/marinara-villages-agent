import { useState } from "react";
import { MAX_IDENTITY_DESCRIPTION_LENGTH } from "../../../shared/contracts/resident-description.js";
import type { VillageSnapshot, VillageVillagerView } from "../../../shared/contracts/village.js";
import { request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { useConfirmation } from "../../shared/confirmation.js";
import { useDeskLeaveGuard } from "../../shared/DeskWorkspace.js";

export function IdentityDescriptionEditor({
  villager,
  onSave,
}: {
  villager: VillageVillagerView;
  onSave(snapshot: VillageSnapshot): void;
}) {
  const [draft, setDraft] = useState<{ text: string; revision: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const confirm = useConfirmation(villager.characterId);
  useDeskLeaveGuard(async () => {
    if (busy) return false;
    if (!draft || draft.text === (villager.identityDescription?.text ?? "")) return true;
    if (!(await confirm("Discard unsaved description?"))) return false;
    setDraft(null);
    setError("");
    return true;
  }, busy);
  async function save() {
    if (!draft || busy) return;
    setBusy(true);
    setError("");
    try {
      const snapshot = await request<VillageSnapshot>(
        `/villagers/${encodeURIComponent(villager.characterId)}/description`,
        { method: "PATCH", body: JSON.stringify(draft) },
      );
      onSave(snapshot);
      setDraft(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Description could not be saved.");
    } finally {
      setBusy(false);
    }
  }
  return draft ? (
    <form
      autoComplete="off"
      className={`${ELEMENT_TAG}-field ${ELEMENT_TAG}-description-editor`}
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <label>
        Description
        <textarea
          autoComplete="off"
          aria-label="Description"
          maxLength={MAX_IDENTITY_DESCRIPTION_LENGTH}
          rows={3}
          value={draft.text}
          disabled={busy}
          onChange={(event) => setDraft({ ...draft, text: event.target.value })}
        />
      </label>
      {error ? <p role="alert">{error}</p> : null}
      <div className={`${ELEMENT_TAG}-row`}>
        <button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setDraft(null);
            setError("");
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  ) : (
    <button
      type="button"
      onClick={() => {
        setError("");
        setDraft({
          text: villager.identityDescription?.text ?? "",
          revision: villager.identityDescription?.revision ?? "",
        });
      }}
    >
      Edit description
    </button>
  );
}
