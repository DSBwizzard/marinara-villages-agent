import { useRef } from "react";
import { createRoot } from "react-dom/client";
import { Mailbox } from "../../packages/villages/src/client/features/residents/Mailbox.js";
import { syncVillagesStyles } from "../../packages/villages/src/client/entry/styles.js";
import type { VillageSnapshot } from "../../packages/villages/src/shared/contracts/village.js";
import type { PortraitMap } from "../../packages/villages/src/client/shared/types.js";
import { DeskWorkspace } from "../../packages/villages/src/client/shared/DeskWorkspace.js";

syncVillagesStyles();
const root = createRoot(document.querySelector("marinara-capability-villages")!);
let key = 0;
const close = () => root.render(null);
function MailboxDesk({ snapshot, portraits }: { snapshot: VillageSnapshot; portraits: PortraitMap }) {
  const documentRef = useRef<HTMLDivElement>(null);
  return (
    <DeskWorkspace
      active="mailbox"
      venue={false}
      phase="open"
      disabled={false}
      artworkError=""
      documentRef={documentRef}
      onNavigate={close}
      onReturn={close}
      onKeyDown={() => {}}
    >
      <Mailbox open snapshot={snapshot} portraits={portraits} onClose={close} />
    </DeskWorkspace>
  );
}

Object.assign(window, {
  showMailbox(snapshot: VillageSnapshot, portraits: PortraitMap) {
    root.render(<MailboxDesk key={++key} snapshot={snapshot} portraits={portraits} />);
  },
});
