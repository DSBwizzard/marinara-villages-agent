import { useRef, type ReactNode, type Ref } from "react";
import { DialogueReader } from "../../shared/DialogueReader.js";
import { drawVillagesNodes } from "../../shared/presentation.js";
import { useReadingPages } from "../../shared/useReadingPages.js";

export function FoundingReader({
  text,
  lineRef,
  children,
  hidden,
}: {
  text: string;
  lineRef?: Ref<HTMLParagraphElement>;
  children?: ReactNode;
  hidden?: boolean;
}) {
  const readingRef = useRef<HTMLDivElement>(null);
  const pages = useReadingPages(text, text, readingRef);
  return (
    <DialogueReader
      className="villages-setting-dialogue"
      hidden={hidden}
      data-reader-page={pages.index > 0 || undefined}
      data-reader-next-page={pages.index < pages.count - 1 || undefined}
      speaker="Professor Mari"
      footer={
        pages.index > 0 || pages.index < pages.count - 1 || children ? (
          <>
            {pages.index > 0 ? (
              <button className="villages-reader-page-back" type="button" data-reader-direction="back">
                Back
              </button>
            ) : null}
            {pages.index < pages.count - 1 ? (
              <button
                className="villages-reader-page-next villages-forging-primary"
                type="button"
                data-reader-direction="next"
              >
                Next
              </button>
            ) : null}
            {children}
          </>
        ) : undefined
      }
      onClickCapture={(event) => {
        const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-reader-direction]");
        if (button && pages.move(button.dataset.readerDirection === "back" ? -1 : 1)) {
          event.preventDefault();
          event.stopPropagation();
          requestAnimationFrame(() => readingRef.current?.focus({ preventScroll: true }));
        }
      }}
    >
      <div ref={readingRef} className="marinara-capability-villages-chat-vn-reading" tabIndex={-1}>
        <p aria-live="polite" tabIndex={-1} ref={lineRef}>
          {drawVillagesNodes(pages.nodes, "founding-reader-")}
        </p>
      </div>
    </DialogueReader>
  );
}
