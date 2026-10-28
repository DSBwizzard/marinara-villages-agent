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
        {busy ? "Generating Venues…" : pending ? "Check Quick Start" : "Quick Start"}
      </button>
      {confirming ? (
        <FoundingDialog title="Quick Start" compact showCloseButton={false} onClose={() => setConfirming(false)}>
          <p>Quick Start will overwrite any changes you’ve made to the Venues.</p>
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
