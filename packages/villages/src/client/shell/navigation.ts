import type { MenuPage } from "../shared/types.js";

export function menuCategory(page: MenuPage): "index" | "general" | "village" | "debug" {
  if (page === "index" || page === "general") return page;
  if (["chatlogs", "progress"].includes(page)) return "debug";
  return "village";
}

export const MENU_PAGE_TITLES: Record<MenuPage, string> = {
  index: "Menu",
  repair: "REPAIR",
  villagers: "Villagers",
  venueRequests: "Venue Requests",
  projects: "Projects",
  village: "Village Settings",
  general: "General Settings",
  chatlogs: "Scenes",
  progress: "Progress",
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
