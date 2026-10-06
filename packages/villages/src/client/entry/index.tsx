import { VillagesUsageMeter } from "../features/settings/villages-usage-meter.js";
import { SpinOffPanel, SpinOffToolbar } from "../features/spinoff/SpinOffSurface.js";
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

/**
 * Which of the package's two surfaces this element is.
 *
 * The tab and the toolbar are the same tag mounted in different slots, and the
 * host says which by the `view` attribute — `CapabilityElement` writes it on the
 * element it creates and never touches it again. Props arrive separately, in
 * `capabilityProps`, and they arrive AFTER this element is already in the
 * document: the host assigns them in a layout effect and republishes them as a
 * `marinara-capability-props` event rather than re-rendering anything. So the
 * subscription below is not an optimisation, it is the only way the toolbar ever
 * hears the chat it is standing in — and a first paint that read the props once,
 * on connect, would draw a button for no chat at all and never correct itself.
 *
 * The tab is what an unrecognised view gets, because the tab is what the package
 * had before there was a second surface, and because its own slot names itself
 * `browser`: a view this file has never heard of is still the village, and
 * drawing nothing would be a screenshot of an empty tab.
 */
function CapabilityRoot({ element }: { element: VillagesCapabilityElement }) {
  const [, redraw] = useState(0);
  useEffect(() => {
    const update = () => redraw((value) => value + 1);
    element.addEventListener("marinara-capability-props", update);
    return () => element.removeEventListener("marinara-capability-props", update);
  }, [element]);
  const view = element.getAttribute("view");
  // The two in-chat surfaces. Both are told which chat they are standing in and
  // both ask the village where it came from, because neither can see the tab and
  // the tab cannot see the chat. Neither of them does anything else: on a one-way
  // lane, knowing where a chat came from is the whole of what a chat can be told.
  if (view === "tracker") {
    return <SpinOffPanel props={element.capabilityProps ?? {}} />;
  }
  if (view === "toolbar") {
    return <SpinOffToolbar props={element.capabilityProps ?? {}} />;
  }
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
