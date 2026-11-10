import { createRoot } from "react-dom/client";
import { Mailbox } from "../../packages/villages/src/client/features/residents/Mailbox.js";
import { syncVillagesStyles } from "../../packages/villages/src/client/entry/styles.js";
import type { VillageSnapshot } from "../../packages/villages/src/shared/contracts/village.js";
import type { PortraitMap } from "../../packages/villages/src/client/shared/types.js";

syncVillagesStyles();
const root = createRoot(document.querySelector("marinara-capability-villages")!);
let key = 0;
Object.assign(window, {
  showMailbox(snapshot: VillageSnapshot, portraits: PortraitMap) {
    root.render(
      <Mailbox key={++key} open snapshot={snapshot} portraits={portraits} onClose={() => root.render(null)} />,
    );
  },
});
