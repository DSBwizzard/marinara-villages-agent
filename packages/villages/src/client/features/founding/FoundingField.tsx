import { cloneElement, type ReactElement, type ReactNode, useId, useRef, useState, useEffect } from "react";

/** Field help stays beside its label; it never becomes part of an input's accessible name. */
export function FoundingHelp({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId(),
    button = useRef<HTMLButtonElement>(null);
  return (
    <span
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
  error,
  children,
}: {
  title: ReactNode;
  help?: ReactNode;
  error?: string;
  children: ReactElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean }>;
}) {
  const id = useId(),
    errorId = id + "-error";
  return (
    <div className="villages-founding-field">
      <div className="villages-founding-field-heading">
        <label htmlFor={id}>{title}</label>
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
  return <textarea {...props} placeholder={examples[example % examples.length]} />;
}
