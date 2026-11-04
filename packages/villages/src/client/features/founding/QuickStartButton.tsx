import { useState } from "react";
import { FoundingDialog } from "./FoundingDialog.js";

export function QuickStartButton({
  busy,
  disabled,
  pending,
  failed,
  onGenerate,
}: {
  busy: boolean;
  disabled?: boolean;
  pending: boolean;
  failed?: boolean;
  onGenerate(): void;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <button type="button" disabled={busy || disabled || pending} onClick={() => setConfirming(true)}>
        {busy ? "Preparing…" : pending ? "Recovering…" : failed ? "Retry" : "Suggest"}
      </button>
      {confirming ? (
        <FoundingDialog
          title={failed ? "Retry" : "Suggest"}
          compact
          showCloseButton={false}
          onClose={() => setConfirming(false)}
        >
          {!pending ? (
            <>
              <p>
                Replace all starting Venue names, descriptions, Zones and artwork with AI-written Residences and a
                Community Venue. Images can be added in each Zone afterwards.
              </p>
            </>
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
              Replace and suggest
            </button>
          </footer>
        </FoundingDialog>
      ) : null}
    </>
  );
}
