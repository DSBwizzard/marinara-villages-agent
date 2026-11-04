import { useState } from "react";
import type { LoreUse } from "../../shared/contracts/lore.js";
import { mergeLoreUse } from "../../shared/helpers/lore.js";
import { ModalDialog } from "./ModalDialog.js";
import { ELEMENT_TAG } from "./constants.js";

export function LoreChip({ entries, label }: { entries?: readonly LoreUse[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const lore = mergeLoreUse(entries);
  if (!lore.length) return null;
  return (
    <>
      <button
        type="button"
        className={`${ELEMENT_TAG}-lore-use-chip`}
        aria-label={`${lore.length} Lorebook entries${label ? ` · ${label}` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 7v14m0-14C9 4 5 4 2 5v15c3-1 7-1 10 1m0-14c3-3 7-3 10-2v15c-3-1-7-1-10 1" />
        </svg>
        Lore · {lore.length}
      </button>
      {open ? (
        <ModalDialog
          title="Lorebooks"
          onClose={() => setOpen(false)}
          compact
          scrollBody
          className={`${ELEMENT_TAG}-lore-dialog`}
        >
          {label ? <p className={`${ELEMENT_TAG}-lore-label`}>{label}</p> : null}
          <ul>
            {lore.map((entry) => (
              <li key={JSON.stringify([entry.bookId, entry.id])}>
                <strong>{entry.name}</strong>
                <span className={`${ELEMENT_TAG}-lore-book`}>{entry.bookName || entry.bookId}</span>
                <div className={`${ELEMENT_TAG}-lore-targets`}>
                  {entry.targets.map((target) => (
                    <span key={target}>{target}</span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </ModalDialog>
      ) : null}
    </>
  );
}

export function FoundingLore({ records }: { records?: { label: string; entries: LoreUse[] }[] }) {
  const rows = records?.filter((row) => row.entries.length) ?? [];
  if (!rows.length) return null;
  return (
    <details className={`${ELEMENT_TAG}-founding-lore`}>
      <summary>Founding Lorebooks</summary>
      {rows.map((row, index) => (
        <div key={index} className={`${ELEMENT_TAG}-lore-task`}>
          <span>{row.label}</span>
          <LoreChip entries={row.entries} label={row.label} />
        </div>
      ))}
    </details>
  );
}
