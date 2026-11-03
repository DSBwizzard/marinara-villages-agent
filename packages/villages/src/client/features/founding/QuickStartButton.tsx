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
  onGenerate(draftEntranceImage?: boolean): void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [draftEntranceImage, setDraftEntranceImage] = useState(false);
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
            <>
              <p>
                Draft this Venue’s name, form, Zones, descriptions and connections. Keep its household, existing Zone
                ownership and map position.
              </p>
              <label>
                <input
                  autoComplete="off"
                  type="checkbox"
                  checked={draftEntranceImage}
                  onChange={(event) => setDraftEntranceImage(event.target.checked)}
                />
                Draft entrance image
              </label>
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
                onGenerate(draftEntranceImage);
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
