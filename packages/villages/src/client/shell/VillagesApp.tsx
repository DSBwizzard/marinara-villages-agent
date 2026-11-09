import { ConfirmationProvider } from "../shared/confirmation.js";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
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
import { DeskWorkspace, DeskLeaveGuard, type DeskDestination, type DeskLeaveCheck } from "../shared/DeskWorkspace.js";
import { RetainedView } from "../shared/RetainedView.js";
import type { DossierNavigation } from "../features/residents/villages-dossier.js";
import type { MenuPage } from "../shared/types.js";
import { menuCategory } from "./navigation.js";
import { MenuScreen } from "./MenuScreen.js";
import type { useVillageController as ControllerFactory } from "./useVillageController.js";
import { useVillageController } from "./useVillageController.js";
import { VillagesFrame } from "./VillagesFrame.js";
import { prepareDeskArtwork } from "../shared/desk-art.js";

export function VillagesView({ element }: { element: HTMLElement }) {
  return (
    <ConfirmationProvider>
      <VillagesContent element={element} />
    </ConfirmationProvider>
  );
}

function VillagesContent({ element }: { element: HTMLElement }) {
  const controller = useVillageController({ element });
  const documentRef = useRef<HTMLDivElement>(null);
  const leaveGuard = useRef<DeskLeaveCheck | null>(null);
  const [navigationDisabled, setNavigationDisabled] = useState(false);
  const guardRegistration = useMemo(() => ({ guard: leaveGuard, setDisabled: setNavigationDisabled }), []);
  const moving = useRef(false);
  const lifetime = useRef({ epoch: 0 });
  const outgoing = useRef<Animation | null>(null);
  const incoming = useRef<Animation | null>(null);
  const readingPosition = useRef(0);
  const returnFocus = useRef<HTMLElement | null>(null);
  const placesView = useRef<"atlas" | "venue">("atlas");
  const peopleOrigin = useRef<{ screen: Controller["screen"]; menuPage: MenuPage; focus: HTMLElement | null } | null>(
    null,
  );
  const [mailRecipient, setMailRecipient] = useState("");
  const [phase, setPhase] = useState<"open" | "preparing" | "opening" | "closing">("open");
  const [artworkError, setArtworkError] = useState("");
  const bookVisible =
    controller.screen === "person" || (controller.screen === "menu" && controller.menuPage === "villagers");
  const destination = (screen: Controller["screen"], page = controller.menuPage): DeskDestination | null => {
    if (screen === "person" || (screen === "menu" && page === "villagers")) return "people";
    if (screen === "menu") return page === "projects" ? "projects" : "settings";
    if (screen === "venue" || (screen === "home" && controller.exploreSheet?.tab === "places")) return "places";
    return null;
  };
  const active = controller.mailboxOpen ? "mailbox" : destination(controller.screen);
  const currentDestination = useRef(active);
  currentDestination.current = active;
  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useLayoutEffect(() => {
    const owner = lifetime.current;
    moving.current = false;
    peopleOrigin.current = null;
    returnFocus.current = null;
    readingPosition.current = 0;
    placesView.current = "atlas";
    setMailRecipient("");
    setArtworkError("");
    return () => {
      owner.epoch++;
      outgoing.current?.cancel();
      incoming.current?.cancel();
    };
  }, [controller.snapshot?.worldScope]);
  useLayoutEffect(() => {
    if (controller.screen === "home" || controller.screen === "room") peopleOrigin.current = null;
    if (controller.screen === "venue") placesView.current = "venue";
    else if (controller.screen === "home" && controller.exploreSheet?.tab === "places") placesView.current = "atlas";
  }, [controller.screen, controller.exploreSheet?.tab]);
  useLayoutEffect(() => {
    if (!active || !documentRef.current) {
      moving.current = false;
      setPhase("open");
      return;
    }
    setPhase("opening");
    moving.current = false;
    const ticket = lifetime.current.epoch;
    const animation = documentRef.current.animate(
      [{ transform: "translateY(calc(100% + 120px))" }, { transform: "translateY(0)" }],
      { duration: reducedMotion() ? 0 : 280, easing: "cubic-bezier(.18,.7,.25,1)" },
    );
    incoming.current = animation;
    void animation.finished
      .then(() => {
        if (ticket !== lifetime.current.epoch) return;
        moving.current = false;
        setPhase("open");
        const focus = element.shadowRoot?.activeElement ?? document.activeElement;
        if (!focus || focus === document.body || !focus.checkVisibility())
          documentRef.current
            ?.querySelector<HTMLElement>("button,input,select,textarea")
            ?.focus({ preventScroll: true });
      })
      .catch(() => {});
    return () => animation.cancel();
  }, [active, element, controller.snapshot?.worldScope]);
  useLayoutEffect(() => {
    if (phase !== "open" || !returnFocus.current) return;
    const origin = returnFocus.current;
    const tab = origin.dataset.exploreTab;
    const focus = origin.isConnected
      ? origin
      : tab
        ? [
            ...(element.shadowRoot ?? element).querySelectorAll<HTMLElement>(`[data-explore-tab="${CSS.escape(tab)}"]`),
          ].find((node) => node.checkVisibility())
        : null;
    if (focus?.checkVisibility() && !focus.closest("[inert]")) {
      returnFocus.current = null;
      focus.focus({ preventScroll: true });
    }
  }, [phase, active, controller.screen, element]);
  const move = async <T,>(next: DeskDestination | null, action: () => T | Promise<T>): Promise<T | undefined> => {
    if (moving.current) return;
    if (next === active) return action();
    moving.current = true;
    const ticket = ++lifetime.current.epoch;
    setArtworkError("");
    if (next) {
      setPhase("preparing");
      try {
        await prepareDeskArtwork(next);
      } catch {
        if (ticket === lifetime.current.epoch) {
          moving.current = false;
          setPhase("open");
          setArtworkError("Menu artwork could not load. Try again.");
        }
        return;
      }
      if (ticket !== lifetime.current.epoch) return;
    }
    let exit: Animation | null = null;
    if (active && documentRef.current && !reducedMotion()) {
      setPhase("closing");
      const from = getComputedStyle(documentRef.current).transform;
      incoming.current?.cancel();
      exit = documentRef.current.animate([{ transform: from }, { transform: "translateY(calc(100% + 120px))" }], {
        duration: 260,
        easing: "cubic-bezier(.55,0,.85,.35)",
        fill: "forwards",
      });
      outgoing.current = exit;
      await exit.finished.catch(() => {});
    }
    if (ticket !== lifetime.current.epoch) return;
    try {
      return await action();
    } finally {
      exit?.cancel();
      if (outgoing.current === exit) outgoing.current = null;
      requestAnimationFrame(() => {
        if (ticket === lifetime.current.epoch && currentDestination.current === active) {
          moving.current = false;
          setPhase("open");
        }
      });
    }
  };
  const rememberPeopleOrigin = () => {
    if (bookVisible || peopleOrigin.current) return;
    const focus =
      controller.screen === "home" && controller.explorationReturnTab.current === "people"
        ? (controller.explorationOrigin.current ?? element.shadowRoot?.activeElement ?? document.activeElement)
        : (element.shadowRoot?.activeElement ?? document.activeElement);
    peopleOrigin.current = {
      screen: controller.screen,
      menuPage: controller.menuPage,
      focus: focus instanceof HTMLElement ? focus : null,
    };
  };
  const navigation: Controller = {
    ...controller,
    setExploreSheet: (value) => {
      const sheet = typeof value === "function" ? value(controller.exploreSheet) : value;
      if (sheet?.tab === "places" && active !== "places") void move("places", () => controller.setExploreSheet(sheet));
      else controller.setExploreSheet(sheet);
    },
    openMenu: (page) => {
      if (page === "villagers") rememberPeopleOrigin();
      return move(destination("menu", page), () => {
        controller.setMailboxOpen(false);
        controller.openMenu(page);
      });
    },
    openPerson: async (person) => {
      rememberPeopleOrigin();
      return (
        (await move("people", () => {
          controller.setMailboxOpen(false);
          return controller.openPerson(person);
        })) ?? false
      );
    },
    openPlace: (place) => {
      void move("places", () => {
        controller.setMailboxOpen(false);
        controller.openPlace(place);
      });
    },
    openVenue: (place) => {
      void move("places", () => {
        controller.setMailboxOpen(false);
        controller.openVenue(place);
      });
    },
    openVenueRequests: (id) => {
      void move("settings", () => controller.openVenueRequests(id));
    },
    openVenueProject: (id) => {
      void move("projects", () => controller.openVenueProject(id));
    },
    planVenueRenovation: (place) => {
      void move("projects", () => controller.planVenueRenovation(place));
    },
    returnToScene: () => {
      void move(null, controller.returnToScene);
    },
    closeExploration: () => {
      returnFocus.current = controller.explorationOrigin.current;
      void move(null, controller.closeExploration);
    },
    openRoom: async (place, zone) => {
      await move(null, () => controller.openRoom(place, zone));
    },
    goHome: async () => {
      await move(null, () => {
        controller.setMailboxOpen(false);
        return controller.goHome();
      });
    },
    setScreen: (value) => {
      const screen = typeof value === "function" ? value(controller.screen) : value;
      void move(destination(screen), () => {
        controller.setMailboxOpen(false);
        controller.setScreen(screen);
      });
    },
    setMailboxOpen: (open) => {
      if (open) setMailRecipient(controller.screen === "person" ? (controller.personProfile?.actorId ?? "") : "");
      void move(open ? "mailbox" : destination(controller.screen), () => controller.setMailboxOpen(open));
    },
  };
  const canLeave = async () =>
    !moving.current &&
    (!leaveGuard.current || (await leaveGuard.current())) &&
    (!controller.spriteLeaveGuard.current || (await controller.spriteLeaveGuard.current()));
  // The desk has already checked its document and sprite drafts before moving.
  const showMap = () => {
    controller.setSpriteManagerId(null);
    controller.setExploreSheet(null);
    controller.setPickerOpen(false);
    controller.setSettingsError("");
    controller.setOpenPlaceId(null);
    controller.setScreen("home");
  };
  const goTo = async (target: DeskDestination) => {
    if (target === active || !(await canLeave())) return;
    if (target === "people") navigation.openMenu("villagers");
    else if (target === "projects") navigation.openMenu("projects");
    else if (target === "settings") navigation.openMenu("index");
    else if (target === "mailbox") {
      setMailRecipient("");
      await move("mailbox", () => controller.setMailboxOpen(true));
    } else {
      const place =
        placesView.current === "venue"
          ? controller.snapshot?.settings.venues.find((entry) => entry.id === controller.venueId)
          : undefined;
      if (place) {
        navigation.openPlace(place);
        return;
      }
      await move("places", () => {
        controller.setMailboxOpen(false);
        showMap();
        controller.setExploreSheet({ tab: "places" });
      });
    }
  };
  const returnToVillage = async () => {
    if (!(await canLeave())) return;
    peopleOrigin.current = null;
    await move(null, () => {
      controller.setMailboxOpen(false);
      showMap();
    });
  };
  const closePeople = async () => {
    if (!(await canLeave())) return;
    const origin = peopleOrigin.current;
    peopleOrigin.current = null;
    if (!origin) {
      if (controller.room && controller.room.status !== "closed") navigation.setScreen("room");
      else await move(null, showMap);
      return;
    }
    returnFocus.current = origin.focus;
    await move(destination(origin.screen, origin.menuPage), () => {
      controller.setPersonProfile(null);
      controller.setProfileInspection(null);
      controller.setSpriteManagerId(null);
      controller.setMenuPage(origin.menuPage);
      controller.setScreen(origin.screen);
    });
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
        documentRef.current
          ?.querySelector<HTMLElement>(`[aria-label="${CSS.escape(`Open ${name} profile`)}"]`)
          ?.focus({ preventScroll: true });
    });
  };
  return (
    <VillagesFrame controller={navigation}>
      <DeskLeaveGuard value={guardRegistration}>
        <DeskWorkspace
          active={active}
          venue={active === "places" && controller.screen === "venue"}
          phase={phase}
          disabled={navigationDisabled}
          artworkError={artworkError}
          documentRef={documentRef}
          onNavigate={goTo}
          onReturn={returnToVillage}
          onScene={
            controller.room && controller.room.status !== "closed"
              ? async () => {
                  if (await canLeave()) navigation.setScreen("room");
                }
              : undefined
          }
          onKeyDown={(event) => {
            if (active === "people" && event.key === "Tab") {
              const controls = [
                ...event.currentTarget.querySelectorAll<HTMLElement>(
                  'button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex="0"]',
                ),
              ].filter((node) => node.checkVisibility() && !node.closest("[inert],[hidden]"));
              const focus = element.shadowRoot?.activeElement ?? document.activeElement;
              if (event.shiftKey && focus === controls[0]) {
                event.preventDefault();
                controls.at(-1)?.focus();
              } else if (!event.shiftKey && focus === controls.at(-1)) {
                event.preventDefault();
                controls[0]?.focus();
              }
            }
            if (!active || event.key !== "Escape" || event.defaultPrevented) return;
            const dialogs = documentRef.current?.querySelectorAll('[role="dialog"],dialog[open]');
            if (dialogs?.length) return;
            const details = documentRef.current?.querySelector<HTMLDetailsElement>("details[open]");
            if (details) {
              details.querySelector<HTMLElement>("summary")?.click();
              event.stopPropagation();
              return;
            }
            event.stopPropagation();
            if (active === "people") void closePeople();
            else void returnToVillage();
          }}
        >
          <Mailbox
            open={controller.mailboxOpen}
            snapshot={controller.snapshot}
            portraits={controller.portraits}
            initialResidentId={mailRecipient}
            onClose={() => {
              navigation.setMailboxOpen(false);
              void controller.loadSnapshot({ quiet: true });
            }}
          />
          <RetainedView active={!controller.mailboxOpen}>
            <VillageScreen
              controller={navigation}
              people={
                <div hidden={!bookVisible} inert={!bookVisible} className={`${ELEMENT_TAG}-people-session`}>
                  <PeoplePages
                    controller={navigation}
                    onDirectory={directory}
                    onClose={closePeople}
                    readingPosition={readingPosition}
                    active={bookVisible && !controller.mailboxOpen}
                  />
                </div>
              }
            />
          </RetainedView>
        </DeskWorkspace>
      </DeskLeaveGuard>
    </VillagesFrame>
  );
}

type Controller = ReturnType<typeof ControllerFactory>;

function VillageScreen({ controller, people }: { controller: Controller; people: import("react").ReactNode }) {
  const { room, sceneRestoration } = controller;

  if (!room && sceneRestoration.status !== "ready")
    return (
      <div className={ELEMENT_TAG + "-root"}>
        <section className={ELEMENT_TAG + "-panel"} role={sceneRestoration.status === "error" ? "alert" : "status"}>
          <p>{sceneRestoration.status === "error" ? "Could not check your Scene." : "Checking Scene…"}</p>
          {sceneRestoration.status === "error" ? (
            <>
              <p className={ELEMENT_TAG + "-error"} style={{ overflowWrap: "anywhere" }}>
                {sceneRestoration.error}
              </p>
              <button type="button" className={ELEMENT_TAG + "-button"} onClick={sceneRestoration.retry}>
                Retry Scene check
              </button>
            </>
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
