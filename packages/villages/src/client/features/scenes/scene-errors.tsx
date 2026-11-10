import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { sceneErrorMessage } from "./scene-error-message.js";
import { sceneErrorReport, type SceneErrorDiagnostic, type SceneErrorReportItem } from "./scene-error-report.js";
import { ELEMENT_TAG as tag } from "../../shared/constants.js";

export type SceneErrorItem = SceneErrorReportItem & {
  actions?: ReactNode;
};

/** Presentation only. Opening details never starts recovery, replay or generation. */
export function SceneErrorChip({ items, open, onOpen, loadDetails }: SceneChipProps) {
  const label = "Scene errors";
  const id = useId();
  const anchor = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied" | "failed">("idle");
  const copyOwner = useRef(0);
  const errorKey = items.map((item) => `${item.id}:${item.diagnosticId ?? ""}:${item.message}`).join("\n");
  useEffect(() => {
    copyOwner.current++;
    setCopyState("idle");
  }, [errorKey]);
  useEffect(() => {
    if (!items.length) {
      if (open) onOpen(false);
      return;
    }
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!anchor.current?.contains(event.target as Node)) onOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open, onOpen, items.length]);
  if (!items.length) return null;
  return (
    <div
      ref={anchor}
      className={`${tag}-scene-errors`}
      onKeyDown={(event) => {
        if (open && event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          onOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        className={`${tag}-scene-error-trigger`}
        aria-label={`${items.length} Scene ${items.length === 1 ? "error" : "errors"}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => onOpen(!open)}
      >
        <span className={`${tag}-scene-error-icon`} aria-hidden="true">
          !
        </span>
        <span aria-hidden="true">{items.length}</span>
      </button>
      <span className={`${tag}-visually-hidden`} role="status">
        {`${items.length} Scene ${items.length === 1 ? "error" : "errors"}. Open the error chip for details.`}
      </span>
      {open ? (
        <section id={id} className={`${tag}-scene-error-panel`} aria-label={label}>
          <div className={`${tag}-scene-error-head`}>
            <h2>
              {label} · {items.length}
            </h2>
            <button
              type="button"
              aria-label={`Close ${label}`}
              onClick={() => {
                onOpen(false);
                trigger.current?.focus();
              }}
            >
              ×
            </button>
          </div>
          {items.map((item) => (
            <div key={item.id} className={`${tag}-scene-error-item`} role="group" aria-label={item.title}>
              <div className={`${tag}-scene-error-message`}>
                <span className={`${tag}-scene-error-icon`} aria-hidden="true">
                  !
                </span>
                <span>{sceneErrorMessage(item.message, item.domain)}</span>
              </div>
              {item.actions ? (
                <div className={`${tag}-scene-error-detail ${tag}-scene-error-actions`}>{item.actions}</div>
              ) : null}
            </div>
          ))}
          <div className={`${tag}-scene-error-detail`}>
            <button
              type="button"
              disabled={copyState === "copying"}
              onClick={() => {
                setCopyState("copying");
                const captured = items;
                const owner = ++copyOwner.current;
                const report = (async () => {
                  let diagnostics: SceneErrorDiagnostic[] = [],
                    unavailable = "",
                    omittedErrors = 0;
                  if (loadDetails && captured.some((item) => item.diagnosticId)) {
                    try {
                      const details = await loadDetails();
                      diagnostics = details.errors;
                      omittedErrors = details.omittedErrors ?? 0;
                    } catch (cause) {
                      unavailable = cause instanceof Error ? cause.message : String(cause);
                    }
                  }
                  return (
                    sceneErrorReport(captured, diagnostics, unavailable) +
                    (omittedErrors
                      ? `\nSaved diagnostic limit: ${omittedErrors} additional update errors exist beyond the 50-error window.`
                      : "")
                  );
                })();
                try {
                  const clipboard = navigator.clipboard;
                  if (!clipboard) throw new Error("Clipboard unavailable");
                  // Safari requires the clipboard call itself to stay inside the click gesture.
                  const copied =
                    clipboard.write && typeof ClipboardItem !== "undefined"
                      ? clipboard.write([
                          new ClipboardItem({
                            "text/plain": report.then((text) => new Blob([text], { type: "text/plain" })),
                          }),
                        ])
                      : report.then((text) => clipboard.writeText(text));
                  void copied
                    .then(() => {
                      if (copyOwner.current === owner) setCopyState("copied");
                    })
                    .catch(() => {
                      if (copyOwner.current === owner) setCopyState("failed");
                    });
                } catch {
                  if (copyOwner.current === owner) setCopyState("failed");
                }
              }}
            >
              {copyState === "copying" ? "Copying…" : copyState === "copied" ? "Copied" : "Copy details"}
            </button>
            {copyState === "failed" ? <p role="status">The browser couldn’t copy the details.</p> : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}

type SceneChipProps = {
  items: SceneErrorItem[];
  open: boolean;
  onOpen: (open: boolean) => void;
  loadDetails?: () => Promise<{ errors: SceneErrorDiagnostic[]; omittedErrors?: number }>;
};
