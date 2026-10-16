import type { ResidentsState } from "../features/residents/useResidentsState.js";
import type { ExplorationState } from "../features/exploration/useExplorationState.js";
import type { SettingsState } from "../features/settings/useSettingsState.js";
import type { DossierNavigation } from "../features/residents/villages-dossier.js";
import { ELEMENT_TAG } from "../shared/constants.js";
import { useCallback } from "react";

export function useNavigationOpenPerson(ports: {
  readonly element: HTMLElement;
  readonly profileOrigin: ResidentsState["profileOrigin"];
  readonly setError: React.Dispatch<React.SetStateAction<string>>;
  readonly setPersonProfile: ResidentsState["setPersonProfile"];
  readonly setProfileInspection: ResidentsState["setProfileInspection"];
  readonly setScreen: React.Dispatch<
    React.SetStateAction<"menu" | "home" | "setup" | "resume" | "preparing" | "venue" | "room" | "person">
  >;
  readonly setSpriteManagerId: ResidentsState["setSpriteManagerId"];
  readonly spriteLeaveGuard: ResidentsState["spriteLeaveGuard"];
}) {
  return useCallback(
    (navigation: DossierNavigation) => {
      const {
        element,
        profileOrigin,
        setError,
        setPersonProfile,
        setProfileInspection,
        setScreen,
        setSpriteManagerId,
        spriteLeaveGuard,
      } = ports;

      if (spriteLeaveGuard.current && !spriteLeaveGuard.current()) return;
      const button = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const key = button?.getAttribute("data-exploration-row");
      const label = button?.getAttribute("aria-label");
      const selector = key
        ? `[data-exploration-row="${CSS.escape(key)}"]`
        : label
          ? `[aria-label="${CSS.escape(label)}"]`
          : "";
      const scroll = [
        ...element.querySelectorAll<HTMLElement>(`.${ELEMENT_TAG}-root, .${ELEMENT_TAG}-explore-list`),
      ].map((current) => ({
        selector: current.classList.contains(`${ELEMENT_TAG}-explore-list`)
          ? `.${ELEMENT_TAG}-explore-list`
          : `.${ELEMENT_TAG}-root`,
        top: current.scrollTop,
      }));
      profileOrigin.current = { selector, scroll };
      setError("");
      setProfileInspection(null);
      setSpriteManagerId(null);
      setPersonProfile(navigation);
      setScreen("person");
    },
    [ports.element],
  );
}

export function useNavigationGoHome(ports: {
  readonly setExploreSheet: ExplorationState["setExploreSheet"];
  readonly setOpenPlaceId: ExplorationState["setOpenPlaceId"];
  readonly setPickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setScreen: React.Dispatch<
    React.SetStateAction<"menu" | "home" | "setup" | "resume" | "preparing" | "venue" | "room" | "person">
  >;
  readonly setSettingsError: SettingsState["setSettingsError"];
  readonly setSpriteManagerId: ResidentsState["setSpriteManagerId"];
  readonly spriteLeaveGuard: ResidentsState["spriteLeaveGuard"];
}) {
  return useCallback(() => {
    const {
      setExploreSheet,
      setOpenPlaceId,
      setPickerOpen,
      setScreen,
      setSettingsError,
      setSpriteManagerId,
      spriteLeaveGuard,
    } = ports;

    if (spriteLeaveGuard.current && !spriteLeaveGuard.current()) return;
    setSpriteManagerId(null);
    setExploreSheet(null);
    setPickerOpen(false);
    setSettingsError("");
    setOpenPlaceId(null);
    setScreen("home");
  }, []);
}
