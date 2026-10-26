import { ELEMENT_TAG } from "../../shared/constants.js";
import type { MenuIndexPagePorts } from "./page-contracts.js";

export function renderMenuIndexPage(ports: MenuIndexPagePorts) {
  const { backgroundPanel, openMenu } = ports;
  return (
    <section className={`${ELEMENT_TAG}-panel ${ELEMENT_TAG}-menu-content ${ELEMENT_TAG}-menu-welcome`} role="main">
      {backgroundPanel}
      <h2 className={`${ELEMENT_TAG}-venue-kicker`}>Village</h2>
      <div className={`${ELEMENT_TAG}-menu-quick-links`}>
        <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => openMenu("repair")}>
          REPAIR
        </button>
        <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => openMenu("villagers")}>
          Villagers
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
