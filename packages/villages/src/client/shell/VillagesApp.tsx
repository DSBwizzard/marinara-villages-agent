import { ConfirmationProvider } from "../shared/confirmation.js";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ExplorationScreen } from "../features/exploration/ExplorationScreen.js";
import { FoundingScreen } from "../features/founding/FoundingScreen.js";
import { PreparationScreen } from "../features/founding/PreparationScreen.js";
import { ResumeScreen } from "../features/founding/ResumeScreen.js";
import { Mailbox } from "../features/residents/Mailbox.js";
import { ResidentsScreen } from "../features/residents/ResidentsScreen.js";
import { RosterScreen } from "../features/residents/RosterScreen.js";
import { SceneScreen } from "../features/scenes/SceneScreen.js";
import { VenueScreen } from "../features/venues/VenueScreen.js";
import { ELEMENT_TAG } from "../shared/constants.js";
import { RetainedView } from "../shared/RetainedView.js";
import type { DossierNavigation } from "../features/residents/villages-dossier.js";
import type { MenuPage } from "../shared/types.js";
import { menuCategory } from "./navigation.js";
import { MenuScreen } from "./MenuScreen.js";
import type { useVillageController as ControllerFactory } from "./useVillageController.js";
import { useVillageController } from "./useVillageController.js";
import { VillagesFrame } from "./VillagesFrame.js";

export function VillagesView({ element }: { element: HTMLElement }) {
  return (
    <ConfirmationProvider>
      <VillagesContent element={element} />
    </ConfirmationProvider>
  );
}

function VillagesContent({ element }: { element: HTMLElement }) {
  const controller = useVillageController({ element });
  type Origin = { screen: typeof controller.screen; menuPage: typeof controller.menuPage; focus: HTMLElement | null };
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [phase, setPhase] = useState("opening");
  const readingPosition = useRef(0);
  const notebook = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (origin || !returnFocus.current) return;
    const target = returnFocus.current;
    returnFocus.current = null;
    const tab = target.dataset.exploreTab;
    const restored = target.isConnected
      ? target
      : tab
        ? (element.shadowRoot ?? element).querySelector<HTMLElement>(`[data-explore-tab="${CSS.escape(tab)}"]`)
        : null;
    restored?.focus({ preventScroll: true });
  }, [origin, element]);
  const bookVisible =
    controller.screen === "person" || (controller.screen === "menu" && controller.menuPage === "villagers");
  const begin = (trigger?: HTMLElement | null) => {
    if (origin) return;
    readingPosition.current = 0;
    const active = trigger ?? element.shadowRoot?.activeElement ?? document.activeElement;
    setOrigin({
      screen: controller.screen,
      menuPage: controller.menuPage,
      focus: active instanceof HTMLElement ? active : null,
    });
    setPhase("opening");
  };
  const navigation = {
    ...controller,
    openMenu: (tab: Parameters<typeof controller.openMenu>[0]) => {
      if (tab === "villagers")
        begin(
          controller.screen === "home" && controller.explorationReturnTab.current === "people"
            ? controller.explorationOrigin.current
            : undefined,
        );
      controller.openMenu(tab);
    },
    openPerson: async (person: Parameters<typeof controller.openPerson>[0]) => {
      const opened = await controller.openPerson(person);
      if (opened) begin();
      return opened;
    },
  };
  const openingWishId = controller.personProfile?.wishId;
  useEffect(() => {
    if (!origin) return;
    if (!bookVisible && (controller.screen === "home" || controller.screen === "room")) {
      returnFocus.current = origin.focus;
      setOrigin(null);
      return;
    }
    if (phase !== "opening") return;
    const timer = window.setTimeout(
      () => {
        setPhase("open");
        requestAnimationFrame(() => {
          const target = openingWishId
            ? notebook.current?.querySelector<HTMLElement>(`[data-wish-id="${CSS.escape(openingWishId)}"]`)
            : null;
          const active = element.shadowRoot?.activeElement ?? document.activeElement;
          if (target) target.focus({ preventScroll: true });
          else if (!openingWishId && !notebook.current?.contains(active))
            notebook.current?.querySelector<HTMLElement>("input,button")?.focus({ preventScroll: true });
        });
      },
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 350,
    );
    return () => window.clearTimeout(timer);
  }, [origin, bookVisible, phase, controller.screen, openingWishId, element]);
  const { setPersonProfile, setProfileInspection, setSpriteManagerId, setMenuPage, setScreen } = controller;
  useEffect(() => {
    if (!origin || phase !== "closing") return;
    const timer = window.setTimeout(
      () => {
        setPersonProfile(null);
        setProfileInspection(null);
        setSpriteManagerId(null);
        setMenuPage(origin.menuPage);
        setScreen(origin.screen);
        returnFocus.current = origin.focus;
        setOrigin(null);
      },
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 350,
    );
    return () => window.clearTimeout(timer);
  }, [origin, phase, setMenuPage, setScreen, setPersonProfile, setProfileInspection, setSpriteManagerId]);
  const close = async () => {
    if (controller.spriteLeaveGuard.current && !(await controller.spriteLeaveGuard.current())) return;
    setPhase("closing");
  };
  const directory = async () => {
    if (controller.spriteLeaveGuard.current && !(await controller.spriteLeaveGuard.current())) return;
    const actor = controller.personProfile?.actorId;
    controller.setSpriteManagerId(null);
    controller.setProfileInspection(null);
    controller.setPersonProfile(null);
    controller.openMenu("villagers");
    requestAnimationFrame(() => {
      const name = controller.snapshot?.villagers.find((person) => person.characterId === actor)?.name;
      if (name)
        notebook.current
          ?.querySelector<HTMLElement>(`[aria-label="${CSS.escape(`Open ${name} profile`)}"]`)
          ?.focus({ preventScroll: true });
    });
  };
  const showing = !!origin && (bookVisible || (controller.screen !== "home" && controller.screen !== "room"));
  return (
    <VillagesFrame controller={navigation}>
      <Mailbox
        open={controller.mailboxOpen}
        snapshot={controller.snapshot}
        onClose={() => {
          controller.setMailboxOpen(false);
          void controller.loadSnapshot({ quiet: true });
        }}
        portraits={controller.portraits}
        initialResidentId={controller.screen === "person" ? controller.personProfile?.actorId : ""}
      />
      <VillageScreen
        controller={navigation}
        people={
          <div
            ref={notebook}
            hidden={!showing || !bookVisible}
            inert={!showing || !bookVisible}
            className={`${ELEMENT_TAG}-notebook-session`}
            data-phase={phase}
            role={bookVisible ? "dialog" : undefined}
            aria-modal={bookVisible ? true : undefined}
            aria-label={bookVisible ? "People" : undefined}
            onKeyDown={(event) => {
              if (!bookVisible) return;
              if (event.key === "Tab") {
                const controls = [
                  ...(notebook.current?.querySelectorAll<HTMLElement>(
                    'button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex="0"]',
                  ) ?? []),
                ].filter((node) => node.checkVisibility());
                const first = controls[0],
                  last = controls.at(-1);
                const active = element.shadowRoot?.activeElement ?? document.activeElement;
                if (event.shiftKey && active === first) {
                  event.preventDefault();
                  last?.focus();
                } else if (!event.shiftKey && active === last) {
                  event.preventDefault();
                  first?.focus();
                }
              }
              if (event.key !== "Escape" || event.defaultPrevented) return;
              if (notebook.current?.querySelector('[role="dialog"],dialog[open]')) return;
              const details = notebook.current?.querySelector<HTMLDetailsElement>("details[open]");
              if (details) {
                details.querySelector<HTMLElement>("summary")?.click();
                event.stopPropagation();
                return;
              }
              event.stopPropagation();
              close();
            }}
          >
            <div className={`${ELEMENT_TAG}-notebook-motion`} inert={phase === "closing"}>
              <PeoplePages
                controller={navigation}
                onDirectory={directory}
                onClose={close}
                readingPosition={readingPosition}
                active={showing && bookVisible}
              />
            </div>
          </div>
        }
      />
    </VillagesFrame>
  );
}

type Controller = ReturnType<typeof ControllerFactory>;

function VillageScreen({ controller, people }: { controller: Controller; people: import("react").ReactNode }) {
  const { room, sceneRestoration } = controller;

  if (!room && sceneRestoration.status !== "ready")
    return (
      <div className={ELEMENT_TAG + "-root"}>
        <section className={ELEMENT_TAG + "-panel"} role="status">
          <p>{sceneRestoration.status === "error" ? "Could not load your Scene." : "Loading Scene…"}</p>
          {sceneRestoration.status === "error" ? (
            <button type="button" className={ELEMENT_TAG + "-button"} onClick={sceneRestoration.retry}>
              Retry Scene check
            </button>
          ) : null}
        </section>
      </div>
    );

  return <VillageDestinations controller={controller} people={people} />;
}

function PeoplePages({
  controller,
  onDirectory,
  onClose,
  readingPosition,
  active,
}: {
  controller: Controller;
  onDirectory: () => void;
  onClose: () => void;
  readingPosition: { current: number };
  active: boolean;
}) {
  const [person, setPerson] = useState<DossierNavigation | null>(null);
  if (active && controller.personProfile && controller.personProfile !== person) setPerson(controller.personProfile);
  return (
    <>
      <RetainedView active={active && controller.screen !== "person"}>
        <RosterScreen
          controller={{ ...controller, screen: "menu", menuPage: "villagers" }}
          onClose={onClose}
          readingPosition={readingPosition}
        />
      </RetainedView>
      {person ? (
        <RetainedView key={person.actorId} active={active && controller.screen === "person"}>
          <ResidentsScreen
            controller={{ ...controller, screen: "person", personProfile: person }}
            onDirectory={onDirectory}
            onClose={onClose}
          />
        </RetainedView>
      ) : null}
    </>
  );
}

/** One map, one Venue, and the fixed menu pages; never a history of resident/world data. */
function VillageDestinations({ controller, people }: { controller: Controller; people: import("react").ReactNode }) {
  const { screen, menuPage, room, venueId } = controller;
  const [home, setHome] = useState(false);
  const [venue, setVenue] = useState<string | null>(null);
  const [menus, setMenus] = useState<MenuPage[]>([]);
  const page = menuPage === "index" ? "general" : menuPage;
  if (screen === "home" && !home) setHome(true);
  if (screen === "venue" && venueId && venue !== venueId) setVenue(venueId);
  if (screen === "menu" && page !== "villagers" && !menus.includes(page)) setMenus([...menus, page]);
  return (
    <>
      {home ? (
        <RetainedView active={screen === "home"}>
          <ExplorationScreen controller={controller} />
        </RetainedView>
      ) : null}
      {room ? (
        <RetainedView key={room.id} active={screen === "room"}>
          <SceneScreen controller={controller} />
        </RetainedView>
      ) : null}
      {venue ? (
        <RetainedView key={venue} active={screen === "venue"}>
          <VenueScreen controller={{ ...controller, screen: "venue", venueId: venue }} />
        </RetainedView>
      ) : null}
      {menus.map((entry) => (
        <RetainedView key={entry} active={screen === "menu" && page === entry}>
          <MenuScreen
            controller={{ ...controller, screen: "menu", menuPage: entry, menuSection: menuCategory(entry) }}
          />
        </RetainedView>
      ))}
      {people}
      {screen === "preparing" ? <PreparationScreen controller={controller} /> : null}
      {screen === "resume" ? <ResumeScreen controller={controller} /> : null}
      {screen === "setup" ? <FoundingScreen controller={controller} /> : null}
    </>
  );
}
