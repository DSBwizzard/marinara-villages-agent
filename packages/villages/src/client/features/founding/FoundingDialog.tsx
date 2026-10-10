import { useEffect, useId, useRef, type ReactNode } from "react";

/** Native modality keeps the editor out of page flow and restores its opener. */
export function FoundingDialog({
  title,
  onClose,
  children,
  compact = false,
  dismissible = true,
}: {
  title: string;
  onClose(): void;
  children: ReactNode;
  compact?: boolean;
  dismissible?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const opener = document.activeElement;
    const node = dialog.current;
    node?.showModal();
    return () => {
      node?.close();
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="villages-founding-dialog"
      data-compact={compact || undefined}
      aria-labelledby={titleId}
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
      <header>
        <h3 id={titleId}>{title}</h3>
        <button type="button" aria-label={"Close " + title} onClick={onClose}>
          ×
        </button>
      </header>
      {children}
    </dialog>
  );
}
