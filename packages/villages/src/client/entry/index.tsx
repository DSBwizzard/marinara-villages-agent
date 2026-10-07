import { VillagesUsageMeter } from "../features/settings/villages-usage-meter.js";
import { request } from "../shared/api.js";
import { ELEMENT_TAG } from "../shared/constants.js";
import { syncVillagesStyles } from "../shared/styles.js";
import { VillagesView } from "../shell/VillagesApp.js";
import { Component, type ReactNode, useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";

type VillagesCapabilityElement = HTMLElement & {
  capabilityProps?: Record<string, unknown>;
  capabilityRuntimeError?: string | null;
  __root?: Root | null;
};

class VillagesClientErrorBoundary extends Component<
  { element: VillagesCapabilityElement; children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    const message = error.message || "Villages could not open.";
    this.props.element.capabilityRuntimeError = message;
    this.props.element.dispatchEvent(
      new CustomEvent("marinara-capability-runtime-error", {
        detail: { message },
        bubbles: true,
      }),
    );
    console.error("Villages client capability stopped", error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className={`${ELEMENT_TAG}-root`} role="alert">
        <section className={`${ELEMENT_TAG}-panel`}>
          <h1 className={`${ELEMENT_TAG}-panel-title`}>Villages could not open</h1>
          <p className={`${ELEMENT_TAG}-error`}>{this.state.error.message || "An unexpected client error occurred."}</p>
          <button
            type="button"
            className={`${ELEMENT_TAG}-button`}
            onClick={() => {
              this.props.element.capabilityRuntimeError = null;
              this.setState({ error: null });
            }}
          >
            Try again
          </button>
        </section>
      </div>
    );
  }
}

class MarinaraVillagesElement extends HTMLElement {
  declare __root: VillagesCapabilityElement["__root"];

  connectedCallback() {
    syncVillagesStyles();
    this.__root ??= createRoot(this);
    this.__root.render(
      <VillagesClientErrorBoundary element={this}>
        <CapabilityRoot element={this} />
      </VillagesClientErrorBoundary>,
    );
  }

  disconnectedCallback() {
    queueMicrotask(() => {
      if (!this.isConnected && this.__root) {
        this.__root.unmount();
        this.__root = null;
      }
      syncVillagesStyles();
    });
  }
}

/** Keep the home surface current when the host republishes capability props. */
function CapabilityRoot({ element }: { element: VillagesCapabilityElement }) {
  const [, redraw] = useState(0);
  useEffect(() => {
    const update = () => redraw((value) => value + 1);
    element.addEventListener("marinara-capability-props", update);
    return () => element.removeEventListener("marinara-capability-props", update);
  }, [element]);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, minWidth: 0 }}>
      <VillagesUsageMeter request={request} element={element} />
      <div style={{ flex: "1 1 auto", minHeight: 0, minWidth: 0, overflow: "hidden" }}>
        <VillagesView element={element} />
      </div>
    </div>
  );
}

if (!customElements.get(ELEMENT_TAG)) customElements.define(ELEMENT_TAG, MarinaraVillagesElement);
