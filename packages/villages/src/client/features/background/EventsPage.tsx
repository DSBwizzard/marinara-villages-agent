import { ELEMENT_TAG } from "../../shared/constants.js";
import { VillageEvents } from "../../shared/presentation.js";
import type { EventsPagePorts } from "./page-contracts.js";

export function renderEventsPage(ports: EventsPagePorts) {
  const { mobile, snapshot } = ports;
  return (
    <section className={ELEMENT_TAG + "-menu-content " + ELEMENT_TAG + "-mobile-events-page"} role="main">
      <VillageEvents happenings={snapshot.happenings} recap={snapshot.recap} mobile={mobile} inline />
    </section>
  );
}
