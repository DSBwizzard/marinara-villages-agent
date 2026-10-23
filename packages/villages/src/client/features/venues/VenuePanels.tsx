import { useState } from "react";
import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import { messageFrom } from "../../shared/api.js";
export function MailboxImprovementEditor({
  entry,
  onDecide,
}: {
  entry: VillageSnapshot["venueMail"][number];
  onDecide(approved: boolean, value: { title: string; description: string }): Promise<void>;
}) {
  const [title, setTitle] = useState(entry.title),
    [description, setDescription] = useState(entry.detail),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const decide = async (approved: boolean) => {
    setBusy(true);
    setError("");
    try {
      await onDecide(approved, { title, description });
    } catch (error) {
      setError(messageFrom(error, "The request could not be decided."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <fieldset disabled={busy}>
      <legend>Renovation proposal</legend>
      <label>
        Name
        <input autoComplete="off" value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label>
        Physical result
        <textarea autoComplete="off" value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
      <button disabled={!title.trim() || !description.trim()} onClick={() => void decide(true)}>
        Create Project draft
      </button>
      <button onClick={() => void decide(false)}>Decline</button>
      {error ? <p role="alert">{error}</p> : null}
    </fieldset>
  );
}
