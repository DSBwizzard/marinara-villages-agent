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
        {busy ? "Suggesting…" : pending ? "Check suggestions" : "Suggest details"}
      </button>
      {confirming ? (
        <FoundingDialog
          title={pending ? "Check suggestions" : "Suggest details"}
          compact
          showCloseButton={false}
          onClose={() => setConfirming(false)}
        >
          {!pending ? (
            <p>Suggest this Venue’s name, form and Entrance description. Keep its Zones, residents and map position.</p>
          ) : null}
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
