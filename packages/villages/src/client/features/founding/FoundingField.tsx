import {
  cloneElement,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useId,
  useRef,
  useState,
  useEffect,
} from "react";

function HelpPopup({
  label,
  children,
  opener,
  onClose,
  restoreFocus,
}: {
  label: string;
  children: ReactNode;
  opener: RefObject<HTMLButtonElement | null>;
  onClose(restore?: boolean): void;
  restoreFocus: RefObject<boolean>;
}) {
  const popup = useRef<HTMLDialogElement>(null),
    close = useRef(onClose);
  close.current = onClose;
  const titleId = useId();
  const [mobile] = useState(() => window.matchMedia("(max-width:700px)").matches);
  useEffect(() => {
    const node = popup.current,
      button = opener.current;
    if (!node || !button) return;
    const win = node.ownerDocument.defaultView!;
    const focus = restoreFocus;
    const surface = button.closest(".villages-forging-v2");
    const position = () => {
      if (mobile) return;
      const anchor = button.getBoundingClientRect();
      const panel = surface?.getBoundingClientRect();
      const left = Math.max(0, panel?.left ?? 0) + 16;
      const right = Math.min(win.innerWidth, panel?.right ?? win.innerWidth) - 16;
      const field = (button.closest(".villages-founding-field") ?? button.closest("section"))
        ?.querySelector("input,textarea,select")
        ?.getBoundingClientRect();
      const rightEdge = field?.right ?? anchor.right;
      const room = right - rightEdge - 8;
      const width = room >= 240 ? Math.min(448, room) : Math.min(360, right - left);
      node.style.width = width + "px";
      const height = node.getBoundingClientRect().height;
      node.style.left = Math.max(left, Math.min(room >= 240 ? rightEdge + 8 : anchor.right + 8, right - width)) + "px";
      node.style.top =
        Math.max(
          16,
          Math.min(anchor.top, room >= 240 ? win.innerHeight - height - 16 : (field?.top ?? anchor.top) - height - 8),
        ) + "px";
    };
    const toggle = (event: Event) => {
      if ((event as ToggleEvent).newState === "closed") close.current(false);
    };
    const resize = () => close.current(false);
    node.addEventListener("toggle", toggle);
    if (mobile) node.showModal();
    else node.showPopover();
    position();
    const observer = new ResizeObserver(position);
    if (surface) observer.observe(surface);
    win.addEventListener("resize", resize);
    win.addEventListener("scroll", position, true);
    return () => {
      node.removeEventListener("toggle", toggle);
      observer.disconnect();
      win.removeEventListener("resize", resize);
      win.removeEventListener("scroll", position, true);
      if (mobile) node.close();
      else if (node.matches(":popover-open")) node.hidePopover();
      if (focus.current && button.isConnected) button.focus({ preventScroll: true });
    };
  }, [mobile, opener, restoreFocus]);
  return (
    <dialog
      ref={popup}
      popover={mobile ? undefined : "auto"}
      className="villages-founding-help-popup"
      data-mobile={mobile || undefined}
      aria-modal={mobile || undefined}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose(true);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          onClose(true);
        }
      }}
      onClick={(event) => {
        if (mobile && event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            onClose(true);
        }
      }}
    >
      <header>
        <h3 id={titleId}>{label}</h3>
        <button type="button" aria-label={"Close " + label + " help"} onClick={() => onClose(true)}>
          ×
        </button>
      </header>
      <div role="note">{children}</div>
    </dialog>
  );
}

/** Help overlays never resize the form; mobile uses native modality and a dimmed backdrop. */
export function FoundingHelp({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false),
    button = useRef<HTMLButtonElement>(null),
    restoreFocus = useRef(false);
  return (
    <span className="villages-founding-help">
      <button
        ref={button}
        type="button"
        aria-label={"Help: " + label}
        aria-expanded={open}
        onClick={() => {
          restoreFocus.current = false;
          setOpen(!open);
        }}
      >
        <span aria-hidden="true">?</span>
      </button>
      {open ? (
        <HelpPopup
          label={label}
          opener={button}
          restoreFocus={restoreFocus}
          onClose={(restore) => {
            restoreFocus.current = !!restore;
            setOpen(false);
          }}
        >
          {children}
        </HelpPopup>
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
