import { createRoot } from "react-dom/client";
import type { ReactNode } from "react";
import { syncVillagesStyles } from "../../packages/villages/src/client/entry/styles.js";
import { CapabilityFrame } from "../../packages/villages/src/client/entry/CapabilityFrame.js";
import { VillagesFrame } from "../../packages/villages/src/client/shell/VillagesFrame.js";
import { useVillageController } from "../../packages/villages/src/client/shell/useVillageController.js";
export function installFeature(render: (controller: ReturnType<typeof useVillageController>) => ReactNode) {
  function App({ element }: { element: HTMLElement }) {
    const controller = useVillageController({ element });
    Object.assign(window, { featureController: controller });
    return (
      <CapabilityFrame>
        <VillagesFrame controller={controller}>{render(controller)}</VillagesFrame>
      </CapabilityFrame>
    );
  }
  customElements.define(
    "marinara-capability-villages",
    class extends HTMLElement {
      connectedCallback() {
        syncVillagesStyles();
        createRoot(this).render(<App element={this} />);
      }
    },
  );
}
