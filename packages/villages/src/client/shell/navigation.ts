import type { MenuPage } from "../shared/types.js";

export function menuCategory(page: MenuPage): "index" | "general" | "village" | "debug" {
  if (page === "index" || page === "general" || page === "advanced") return page === "index" ? "index" : "general";
  if (page === "progress") return "debug";
  return "village";
}

export const MENU_PAGE_TITLES: Record<MenuPage, string> = {
  index: "General Preferences",
  repair: "REPAIR",
  villagers: "Villagers",
  venueRequests: "Venue Requests",
  projects: "Projects",
  village: "World Configuration",
  visual: "Visual Configuration",
  general: "General Preferences",
  advanced: "Advanced",
  chatlogs: "Scene History",
  progress: "Debug",
};

/** An unfinished Scene owns navigation, including opening/closing and failed entry. */
export function sceneNavigationScreen<T extends string>(
  requested: T,
  locked: boolean,
  placingProject = false,
): T | "room" {
  if (requested === "home" && placingProject) return requested;
  if (!locked || ["room", "menu", "venue", "person", "home"].includes(requested)) return requested;
  return "room";
}
