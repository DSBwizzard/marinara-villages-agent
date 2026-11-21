import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { DialogueReader, ReaderBook } from "../../shared/DialogueReader.js";
import { drawVillagesNodes } from "../../shared/presentation.js";
import { useReadingPages } from "../../shared/useReadingPages.js";
import { FoundingDialog } from "./FoundingDialog.js";

const Transcript = createContext<{
  lines: string[];
  remember(text: string): void;
} | null>(null);

export function FoundingTranscript({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<string[]>([]);
  const remember = useCallback(
    (text: string) => setLines((lines) => (lines.includes(text) ? lines : [...lines, text])),
    [],
  );
  return <Transcript.Provider value={{ lines, remember }}>{children}</Transcript.Provider>;
}

export function FoundingReader({
  text,
  lineRef,
  children,
  hidden,
  active = true,
  counter,
}: {
  text: string;
  lineRef?: Ref<HTMLParagraphElement>;
  children?: ReactNode;
  hidden?: boolean;
  active?: boolean;
  counter?: string;
}) {
  const readingRef = useRef<HTMLDivElement>(null);
  const pages = useReadingPages(text, text, readingRef);
  const transcript = useContext(Transcript);
  const remember = transcript?.remember;
  const [historyOpen, setHistoryOpen] = useState(false);
  useEffect(() => {
    if (active && !hidden && text) remember?.(text);
  }, [active, hidden, text, remember]);
  return (
    <>
      <DialogueReader
        className="villages-setting-dialogue"
        hidden={hidden}
        data-reader-page={pages.index > 0 || undefined}
        data-reader-next-page={pages.index < pages.count - 1 || undefined}
        speaker="Professor Mari"
        icon={<ReaderBook />}
        actions={
          <button type="button" onClick={() => setHistoryOpen(true)}>
            Transcript
          </button>
        }
        footer={
          <>
            <span className="villages-reader-counter" aria-label={`Page ${pages.index + 1} of ${pages.count}`}>
              {pages.count > 1 ? `${pages.index + 1} / ${pages.count}` : (counter ?? "1 / 1")}
            </span>
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
      {historyOpen ? (
        <FoundingDialog title="Transcript" scrollBody onClose={() => setHistoryOpen(false)}>
          <div className="villages-founding-transcript">
            {(transcript?.lines ?? [text]).map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <footer>
            <button type="button" onClick={() => setHistoryOpen(false)}>
              Back
            </button>
          </footer>
        </FoundingDialog>
      ) : null}
    </>
  );
}
