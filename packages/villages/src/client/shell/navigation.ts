import type { MenuPage } from "../shared/types.js";

export function menuCategory(page: MenuPage): "index" | "general" | "village" | "debug" {
  if (page === "index" || page === "general") return page;
  if (["chatlogs", "progress"].includes(page)) return "debug";
  return "village";
}

export const MENU_PAGE_TITLES: Record<MenuPage, string> = {
  index: "Menu",
  events: "Events",
  villagers: "Villagers",
  noticeboard: "Noticeboard",
  venueRequests: "Venue Requests",
  projects: "Projects",
  village: "Village Settings",
  general: "General Settings",
  chatlogs: "Scenes",
  progress: "Progress",
};

export const FORCE_VILLAGE_UPDATE_NOTICE =
  "Testing action: runs normal time catch-up, then bypasses Background events and wishes for one visual Events update. It can spend a model call, but its prose cannot change memories, wishes, notices, venues, or resident behavior.";

/** An unfinished Scene owns navigation, including opening/closing and failed entry. */
export function sceneNavigationScreen<T extends string>(
  requested: T,
  locked: boolean,
  placingProject = false,
): T | "room" {
  if (requested === "home" && placingProject) return requested;
  if (!locked || ["room", "menu", "venue", "person"].includes(requested)) return requested;
  return "room";
}
