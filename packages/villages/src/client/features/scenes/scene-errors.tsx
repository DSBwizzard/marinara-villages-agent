import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { heldSceneErrorMessage, sceneErrorMessage } from "./scene-error-message.js";
import { anonymousSceneErrorReport, type SceneErrorReportItem } from "./scene-error-report.js";
import { ELEMENT_TAG as tag } from "../../shared/constants.js";

export type SceneErrorItem = SceneErrorReportItem & {
  actions?: ReactNode;
  onClick?: () => void;
};

/** Presentation only. Opening details never starts recovery, replay or generation. */
export function SceneErrorChip({ items, open, onOpen, context }: SceneChipProps) {
  const label = "Scene errors";
  const id = useId();
  const anchor = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [shareState, setShareState] = useState<"idle" | "copied" | "manual">("idle");
  const copyOwner = useRef(0);
  const errorKey = items
    .map(
      (item) =>
        `${item.id}:${item.message}:${JSON.stringify(item.diagnostic ?? item.operation?.diagnostic ?? item.trace?.failure?.diagnostic)}`,
    )
    .join("\n");
  useEffect(() => {
    copyOwner.current++;
    setShareState("idle");
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
              {item.onClick ? (
                <button type="button" className={`${tag}-scene-error-message`} onClick={item.onClick}>
                  <span>{sceneErrorMessage(item.message)}</span>
                  <span>Manage AI connections</span>
                </button>
              ) : (
                <div className={`${tag}-scene-error-message`}>
                  <span>
                    {item.held && item.diagnostic
                      ? heldSceneErrorMessage(item.diagnostic)
                      : sceneErrorMessage(item.message)}
                  </span>
                </div>
              )}
              {item.actions ? (
                <div className={`${tag}-scene-error-detail ${tag}-scene-error-actions`}>{item.actions}</div>
              ) : null}
            </div>
          ))}
          <div className={`${tag}-scene-error-detail`}>
            <button
              type="button"
              onClick={() => {
                const owner = copyOwner.current;
                const text = anonymousSceneErrorReport(items, context);
                const update = (state: "copied" | "manual") => {
                  if (copyOwner.current === owner) setShareState(state);
                };
                try {
                  void navigator.clipboard.writeText(text).then(
                    () => update("copied"),
                    () => update("manual"),
                  );
                } catch {
                  update("manual");
                }
              }}
            >
              Copy Discord report
            </button>
            {shareState === "copied" ? <p role="status">Anonymous report copied.</p> : null}
            {shareState === "manual" ? (
              <textarea
                autoComplete="off"
                aria-label="Anonymous Discord report"
                readOnly
                value={anonymousSceneErrorReport(items, context)}
                onFocus={(event) => event.currentTarget.select()}
              />
            ) : null}
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
  context?: Parameters<typeof anonymousSceneErrorReport>[1];
};
