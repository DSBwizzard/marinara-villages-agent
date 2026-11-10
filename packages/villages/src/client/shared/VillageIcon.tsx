import type { ReactNode } from "react";

export const VILLAGE_DESTINATIONS = ["people", "projects", "places", "mailbox", "settings"] as const;
export type VillageDestination = (typeof VILLAGE_DESTINATIONS)[number];

const glyphs: Record<VillageDestination, ReactNode> = {
  people: (
    <>
      <circle cx="12" cy="6" r="3.4" />
      <circle cx="4.5" cy="8" r="2.5" />
      <circle cx="19.5" cy="8" r="2.5" />
      <path d="M6 22v-5a6 6 0 0 1 12 0v5ZM0 22v-5a4.5 4.5 0 0 1 5.4-4.4A8 8 0 0 0 4 17v5ZM20 22v-5a8 8 0 0 0-1.4-4.4A4.5 4.5 0 0 1 24 17v5Z" />
    </>
  ),
  projects: (
    <>
      <path d="m10 9 5 5L5.2 23.5a1.3 1.3 0 0 1-1.8 0L.5 20.6a1.3 1.3 0 0 1 0-1.8Z" />
      <path d="m7 6 3-3c3-3 6-2 9 1l4 4-4 4-3-3 1-1-3-3-2 3Z" />
    </>
  ),
  places: <path d="m0 11 12-10 12 10-2 2-2-1.7V23h-6v-8h-4v8H4V11.3L2 13Z" />,
  mailbox: (
    <path
      fillRule="evenodd"
      d="M3 4h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm-2 2 11 8L23 6v2L12 16 1 8Z"
    />
  ),
  settings: (
    <path
      fillRule="evenodd"
      d="M23.78 9.71L23.78 14.29L20.54 13.66L19.21 16.86L21.95 18.71L18.71 21.95L16.86 19.21L13.66 20.54L14.29 23.78L9.71 23.78L10.34 20.54L7.14 19.21L5.29 21.95L2.05 18.71L4.79 16.86L3.46 13.66L0.22 14.29L0.22 9.71L3.46 10.34L4.79 7.14L2.05 5.29L5.29 2.05L7.14 4.79L10.34 3.46L9.71 0.22L14.29 0.22L13.66 3.46L16.86 4.79L18.71 2.05L21.95 5.29L19.21 7.14L20.54 10.34Z M16.3 12a4.3 4.3 0 1 0-8.6 0a4.3 4.3 0 1 0 8.6 0Z"
    />
  ),
};

export function VillageIcon({ name }: { name: VillageDestination }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      style={{ fill: "currentColor", stroke: "none" }}
      aria-hidden="true"
      focusable="false"
      data-village-icon={name}
    >
      {glyphs[name]}
    </svg>
  );
}
