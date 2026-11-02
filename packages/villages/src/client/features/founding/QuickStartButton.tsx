import { useState } from "react";
import { FoundingDialog } from "./FoundingDialog.js";

export function QuickStartButton({
  busy,
  disabled,
  pending,
  onGenerate,
}: {
  busy: boolean;
  disabled?: boolean;
  pending: boolean;
  onGenerate(): void;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <button type="button" disabled={busy || disabled} onClick={() => setConfirming(true)}>
        {busy ? "Suggesting Venues…" : pending ? "Check suggestions" : "Suggest Venues"}
      </button>
      {confirming ? (
        <FoundingDialog title="Suggest Venues" compact showCloseButton={false} onClose={() => setConfirming(false)}>
          <p>Suggestions will replace Venue details and arrange the map.</p>
          <footer>
            <button type="button" onClick={() => setConfirming(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="villages-forging-primary"
              disabled={busy || disabled}
              onClick={() => {
                setConfirming(false);
                onGenerate();
              }}
            >
              Confirm
            </button>
          </footer>
        </FoundingDialog>
      ) : null}
    </>
  );
}
