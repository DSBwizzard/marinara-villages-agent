import { ELEMENT_TAG } from "../../shared/constants.js";
import type { MenuIndexPagePorts } from "./page-contracts.js";

export function renderMenuIndexPage(ports: MenuIndexPagePorts) {
  const { backgroundPanel, busy, openMenu, snapshot } = ports;
  return (
    <section className={`${ELEMENT_TAG}-panel ${ELEMENT_TAG}-menu-content ${ELEMENT_TAG}-menu-welcome`} role="main">
      {backgroundPanel}
      <h2 className={`${ELEMENT_TAG}-venue-kicker`}>Village menu</h2>
      <div className={`${ELEMENT_TAG}-menu-quick-links`}>
        <button
          type="button"
          className={ELEMENT_TAG + "-button"}
          disabled={!snapshot || busy}
          onClick={() => openMenu("events")}
        >
          Events
        </button>
        <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => openMenu("villagers")}>
          Village Management
        </button>
        <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => openMenu("general")}>
          General Settings
        </button>
        <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => openMenu("chatlogs")}>
          DEBUG Settings
        </button>
      </div>
    </section>
  );
}
