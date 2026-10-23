import { type ReactNode, useEffect, useId, useRef } from "react";
import { sceneErrorMessage } from "./scene-error-message.js";
import { ELEMENT_TAG as tag } from "../../shared/constants.js";

export type SceneErrorItem = {
  id: string;
  title: string;
  message: string;
  fields?: { label: string; value: string }[];
  actions?: ReactNode;
};

/** Presentation only. Opening details never starts recovery, replay or generation. */
function SceneMessageChip({
  items,
  open,
  onOpen,
  information = false,
}: {
  items: SceneErrorItem[];
  open: boolean;
  onOpen: (open: boolean) => void;
  information?: boolean;
}) {
  const label = information ? "Information" : "Scene errors";
  const id = useId();
  const anchor = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
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
      data-information={information || undefined}
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
        aria-label={
          information ? "Scene information" : `${items.length} Scene ${items.length === 1 ? "error" : "errors"}`
        }
        aria-expanded={open}
        aria-controls={id}
        onClick={() => onOpen(!open)}
      >
        <span className={`${tag}-scene-error-icon`} aria-hidden="true">
          {information ? "i" : "!"}
        </span>
        <span aria-hidden="true">{items.length}</span>
      </button>
      <span className={`${tag}-visually-hidden`} role="status">
        {information
          ? "Scene information available."
          : `${items.length} Scene ${items.length === 1 ? "error" : "errors"}. Open the error chip for details.`}
      </span>
      {open ? (
        <section id={id} className={`${tag}-scene-error-panel`} aria-label={label}>
          <div className={`${tag}-scene-error-head`}>
            <h2>{information ? label : `${label} · ${items.length}`}</h2>
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
          {information
            ? items.map((item) => (
                <div key={item.id} className={`${tag}-scene-error-detail`}>
                  <p>{item.message}</p>
                </div>
              ))
            : items.map((item) => (
                <details key={item.id} className={`${tag}-scene-error-item`}>
                  <summary>
                    <span className={`${tag}-scene-error-icon`} aria-hidden="true">
                      !
                    </span>
                    <span>{item.title}</span>
                  </summary>
                  <div className={`${tag}-scene-error-detail`}>
                    <p>{sceneErrorMessage(item.message)}</p>
                    {item.fields?.length ? (
                      <dl>
                        {item.fields.map((field) => (
                          <div key={field.label}>
                            <dt>{field.label}</dt>
                            <dd>{field.value}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                    {item.actions ? <div className={`${tag}-scene-error-actions`}>{item.actions}</div> : null}
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard
                          ?.writeText(
                            [
                              item.title,
                              sceneErrorMessage(item.message),
                              ...(sceneErrorMessage(item.message) !== item.message
                                ? [`Original error: ${item.message}`]
                                : []),
                              ...(item.fields ?? []).map((field) => `${field.label}: ${field.value}`),
                            ].join("\n"),
                          )
                          .catch(() => {});
                      }}
                    >
                      Copy details
                    </button>
                  </div>
                </details>
              ))}
        </section>
      ) : null}
    </div>
  );
}

type SceneChipProps = { items: SceneErrorItem[]; open: boolean; onOpen: (open: boolean) => void };
export function SceneErrorChip(props: SceneChipProps) {
  return <SceneMessageChip {...props} />;
}
export function SceneInformationChip(props: SceneChipProps) {
  return <SceneMessageChip {...props} information />;
}
