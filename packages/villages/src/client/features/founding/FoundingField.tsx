import { cloneElement, type ReactElement, type ReactNode, useId, useRef, useState, useEffect } from "react";

/** Field help stays beside its label; it never changes the input's accessible name. */
export function FoundingHelp({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId(),
    button = useRef<HTMLButtonElement>(null),
    help = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = help.current;
    if (!open || !node) return;
    const document = node.ownerDocument;
    const dismissOutside = (event: MouseEvent) => {
      if (!event.composedPath().includes(node)) setOpen(false);
    };
    // Some Chromium touch gestures complete without a compatibility click.
    // Track a completed stationary touch, while cancelled/drifting scrolls keep help open.
    let touch: { id: number; x: number; y: number } | null = null;
    const down = (event: PointerEvent) => {
      touch =
        event.pointerType === "touch" && event.isPrimary
          ? { id: event.pointerId, x: event.clientX, y: event.clientY }
          : null;
    };
    const move = (event: PointerEvent) => {
      if (touch?.id === event.pointerId && Math.hypot(event.clientX - touch.x, event.clientY - touch.y) > 10)
        touch = null;
    };
    const cancel = () => {
      touch = null;
    };
    const up = (event: PointerEvent) => {
      if (
        touch?.id === event.pointerId &&
        Math.hypot(event.clientX - touch.x, event.clientY - touch.y) <= 10 &&
        !event.composedPath().includes(node)
      )
        setOpen(false);
      touch = null;
    };
    document.addEventListener("click", dismissOutside, true);
    document.addEventListener("pointerdown", down, true);
    document.addEventListener("pointermove", move, true);
    document.addEventListener("pointercancel", cancel, true);
    document.addEventListener("pointerup", up, true);
    return () => {
      document.removeEventListener("click", dismissOutside, true);
      document.removeEventListener("pointerdown", down, true);
      document.removeEventListener("pointermove", move, true);
      document.removeEventListener("pointercancel", cancel, true);
      document.removeEventListener("pointerup", up, true);
    };
  }, [open]);
  return (
    <span
      ref={help}
      className="villages-founding-help"
      onKeyDown={(event) => {
        if (open && event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          button.current?.focus();
        }
      }}
    >
      <button
        ref={button}
        type="button"
        aria-label={"Help: " + label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        <span aria-hidden="true">?</span>
      </button>
      {open ? (
        <span id={id} role="note" className="villages-founding-help-text">
          {children}
        </span>
      ) : null}
    </span>
  );
}

export function FoundingField({
  title,
  help,
  optional = false,
  error,
  children,
}: {
  title: ReactNode;
  help?: ReactNode;
  optional?: boolean;
  error?: string;
  children: ReactElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean }>;
}) {
  const id = useId(),
    errorId = id + "-error";
  return (
    <div className="villages-founding-field">
      <div className="villages-founding-field-heading">
        <label htmlFor={id}>
          {title}
          {optional ? <small>Optional</small> : null}
        </label>
        {help ? <FoundingHelp label={typeof title === "string" ? title : "field"}>{help}</FoundingHelp> : null}
      </div>
      {cloneElement(children, {
        id,
        ...(error
          ? {
              "aria-invalid": true,
              "aria-describedby": [children.props["aria-describedby"], errorId].filter(Boolean).join(" "),
            }
          : {}),
      })}
      {error ? (
        <p id={errorId} role="alert" data-founding-problem tabIndex={-1}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function CircumstanceInput({ examples, ...props }: { examples: string[] } & React.ComponentProps<"textarea">) {
  const [example, setExample] = useState(0);
  useEffect(() => {
    if (String(props.value ?? "").length || !examples.length) return;
    const timer = setInterval(() => setExample((index) => (index + 1) % examples.length), 4000);
    return () => clearInterval(timer);
  }, [props.value, examples]);
  return <textarea autoComplete="off" {...props} placeholder={examples[example % examples.length]} />;
}
