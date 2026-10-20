import type { useVillageController as ControllerFactory } from "./useVillageController.js";
import { ELEMENT_TAG } from "../shared/constants.js";
import { ExplorationScreen } from "../features/exploration/ExplorationScreen.js";
import { FoundingScreen } from "../features/founding/FoundingScreen.js";
import { PreparationScreen } from "../features/founding/PreparationScreen.js";
import { ResumeScreen } from "../features/founding/ResumeScreen.js";
import { ResidentsScreen } from "../features/residents/ResidentsScreen.js";
import { RosterScreen } from "../features/residents/RosterScreen.js";
import { SceneScreen } from "../features/scenes/SceneScreen.js";
import { MenuScreen } from "./MenuScreen.js";
import { VenueScreen } from "../features/venues/VenueScreen.js";
import { useVillageController } from "./useVillageController.js";
import { VillagesFrame } from "./VillagesFrame.js";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export function VillagesView({ element }: { element: HTMLElement }) {
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
    openPerson: (person: Parameters<typeof controller.openPerson>[0]) => {
      const opened = controller.openPerson(person);
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
  const close = () => {
    if (controller.spriteLeaveGuard.current && !controller.spriteLeaveGuard.current()) return;
    setPhase("closing");
  };
  const directory = () => {
    if (controller.spriteLeaveGuard.current && !controller.spriteLeaveGuard.current()) return;
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
      <div hidden={showing} inert={showing} style={{ height: "100%" }}>
        <VillageScreen
          controller={showing ? { ...navigation, screen: origin.screen, menuPage: origin.menuPage } : navigation}
        />
      </div>
      {showing ? (
        <div
          ref={notebook}
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
            {!bookVisible ? (
              <>
                {controller.screen === "venue" ? (
                  <VenueScreen controller={navigation} />
                ) : (
                  <MenuScreen controller={navigation} />
                )}
              </>
            ) : controller.screen === "person" ? (
              <ResidentsScreen controller={navigation} onDirectory={directory} onClose={close} />
            ) : (
              <RosterScreen controller={navigation} onClose={close} readingPosition={readingPosition} />
            )}
          </div>
        </div>
      ) : null}
    </VillagesFrame>
  );
}

function VillageScreen({ controller }: { controller: ReturnType<typeof ControllerFactory> }) {
  const { screen, personProfile, menuPage, room, sceneRestoration } = controller;

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

  if (room && room.status !== "closed")
    return (
      <>
        <div key="retained-scene" hidden={screen !== "room"} style={{ height: "100%" }}>
          <SceneScreen controller={controller} />
        </div>
        {screen === "venue" ? (
          <VenueScreen controller={controller} />
        ) : screen === "menu" ? (
          menuPage === "villagers" ? (
            <RosterScreen controller={controller} />
          ) : (
            <MenuScreen controller={controller} />
          )
        ) : screen === "person" && personProfile ? (
          <ResidentsScreen controller={controller} />
        ) : null}
      </>
    );

  if (screen === "person" && personProfile)
    return (
      <>
        {personProfile.returnTo === "room" ? (
          <div key="retained-scene" hidden style={{ height: "100%" }}>
            <SceneScreen controller={controller} />
          </div>
        ) : null}
        <ResidentsScreen controller={controller} />
      </>
    );

  if (screen === "room") {
    return (
      <>
        <div key="retained-scene" style={{ height: "100%" }}>
          {<SceneScreen controller={controller} />}
        </div>
      </>
    );
  }

  if (screen === "venue") return <VenueScreen controller={controller} />;

  if (screen === "menu" && menuPage === "villagers") return <RosterScreen controller={controller} />;

  if (screen === "menu") return <MenuScreen controller={controller} />;

  if (screen === "preparing") return <PreparationScreen controller={controller} />;

  if (screen === "resume") return <ResumeScreen controller={controller} />;

  if (screen === "setup") return <FoundingScreen controller={controller} />;
  return <ExplorationScreen controller={controller} />;
}
