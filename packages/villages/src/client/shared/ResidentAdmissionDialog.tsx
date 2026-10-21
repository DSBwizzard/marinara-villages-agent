import { useState } from "react";
import { ModalDialog } from "./ModalDialog.js";
import { ResidentAdmissionFields } from "./ResidentAdmissionFields.js";
import { messageFrom } from "./api.js";
import { readResidentAdmission, type ResidentAdmission } from "../../shared/helpers/resident-admission.js";
export function ResidentAdmissionDialog({
  name,
  value,
  onChange,
  onContinue,
  onCancel,
  disabled = false,
}: {
  name: string;
  value: ResidentAdmission;
  onChange(value: ResidentAdmission): void;
  onContinue(value: ResidentAdmission): void | Promise<void>;
  onCancel(): void;
  disabled?: boolean;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <ModalDialog title={name + " in your Village"} onClose={onCancel} compact>
      <ResidentAdmissionFields name={name} value={value} onChange={onChange} disabled={disabled || busy} />
      {error ? <p role="alert">{error}</p> : null}
      <footer>
        <button type="button" disabled={busy} onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          disabled={disabled || busy}
          onClick={async () => {
            const admission = readResidentAdmission(value);
            if (!admission) {
              setError("Keep the homeworld within 120 characters and starting note within 1,200 characters.");
              return;
            }
            setBusy(true);
            try {
              await onContinue(admission);
            } catch (cause) {
              setError(messageFrom(cause, "Could not continue."));
            } finally {
              setBusy(false);
            }
          }}
        >
          Continue
        </button>
      </footer>
    </ModalDialog>
  );
}
