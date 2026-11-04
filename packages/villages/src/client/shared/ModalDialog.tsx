import { useEffect, useId, useRef, type ReactNode } from "react";

/** Scoped dialogs leave the host usable; other callers retain native modality. */
export function ModalDialog({
  title,
  onClose,
  children,
  compact = false,
  scrollBody = false,
  dismissible = true,
  showCloseButton = true,
  headerContent,
  headerless = false,
  className = "",
  scope,
}: {
  title: string;
  onClose(): void;
  children: ReactNode;
  compact?: boolean;
  scrollBody?: boolean;
  dismissible?: boolean;
  showCloseButton?: boolean;
  headerContent?: ReactNode;
  headerless?: boolean;
  className?: string;
  scope?: HTMLElement;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const opener = document.activeElement;
    const node = dialog.current;
    const background = new Map<HTMLElement, boolean>();
    if (scope && node) {
      for (const child of scope.children) {
        if (!(child instanceof HTMLElement) || child.contains(node)) continue;
        background.set(child, child.inert);
        child.inert = true;
      }
      node.show();
    } else node?.showModal();
    return () => {
      const restoreFocus = !scope || node?.contains(document.activeElement) || document.activeElement === document.body;
      node?.close();
      for (const [child, inert] of background) child.inert = inert;
      if (restoreFocus && opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, [scope]);
  const content = (
    <dialog
      ref={dialog}
      className={`villages-founding-dialog ${className}`.trim()}
      data-compact={compact || undefined}
      data-scroll-body={scrollBody || undefined}
      data-header-input={headerContent ? true : undefined}
      data-headerless={headerless || undefined}
      aria-labelledby={headerContent || headerless ? undefined : titleId}
      aria-label={headerContent || headerless ? title : undefined}
      onKeyDown={(event) => {
        if (!scope || event.key !== "Escape" || event.defaultPrevented) return;
        event.preventDefault();
        event.stopPropagation();
        if (dismissible) onClose();
      }}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(event) => {
        if (!dismissible || event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose();
      }}
    >
      {headerless ? null : (
        <header>
          {headerContent ?? <h3 id={titleId}>{title}</h3>}
          {showCloseButton ? (
            <button type="button" aria-label={"Close " + title} onClick={onClose}>
              ×
            </button>
          ) : null}
        </header>
      )}
      {children}
    </dialog>
  );
  return scope ? (
    <div
      className="villages-founding-overlay"
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose();
      }}
    >
      {content}
    </div>
  ) : (
    content
  );
}
