import { ELEMENT_TAG } from "../../shared/constants.js";
import type { MenuScreenController } from "./screen-contracts.js";

export function renderMenuIndexPage(
  ports: Pick<MenuScreenController, "backgroundPanel" | "busy" | "openMenu" | "snapshot">,
) {
  const { backgroundPanel, busy, openMenu, snapshot } = ports;
  return (
    <section className={`${ELEMENT_TAG}-panel ${ELEMENT_TAG}-menu-content ${ELEMENT_TAG}-menu-welcome`} role="main">
      {backgroundPanel}
      <span className={`${ELEMENT_TAG}-venue-kicker`}>Village menu</span>
      <h2>Choose where to go</h2>
      <p>Manage the people and places in your village, adjust settings, or inspect its DEBUG records.</p>
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
