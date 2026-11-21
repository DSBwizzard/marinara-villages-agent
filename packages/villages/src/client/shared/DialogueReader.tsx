import type { ComponentProps, ReactNode } from "react";

export function ReaderBook() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1Zm0 0v15" />
    </svg>
  );
}

/** Reading presentation only; each experience owns its navigation and actions. */
export function DialogueReader({
  speaker,
  icon,
  actions,
  footer,
  contentClassName = "",
  className = "",
  children,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  speaker: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <div {...props} className={`villages-dialogue-reader ${className}`}>
      <div className={`villages-reader-content ${contentClassName}`}>
        <header className="villages-reader-heading">
          {icon ? <span className="villages-reader-icon">{icon}</span> : null}
          <div className="villages-reader-speaker">{speaker}</div>
          {actions ? <div className="villages-reader-actions">{actions}</div> : null}
        </header>
        {children}
      </div>
      {footer ? <div className="villages-reader-footer">{footer}</div> : null}
    </div>
  );
}
