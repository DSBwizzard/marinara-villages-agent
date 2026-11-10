import type { ReactNode } from "react";
export const VILLAGE_DESTINATIONS = ["people", "projects", "places", "mailbox", "settings"] as const;
export type VillageDestination = (typeof VILLAGE_DESTINATIONS)[number];
// Curved silhouettes follow the reference without tracing its raster pixel edges.
const glyphs: Record<VillageDestination, ReactNode> = {
  people: (
    <>
      <circle cx="16" cy="8" r="4.2" />
      <circle cx="6.5" cy="11" r="3.1" />
      <circle cx="25.5" cy="11" r="3.1" />
      <path d="M9 28v-6.5a7 7 0 0 1 14 0V28ZM1 28v-6a5.5 5.5 0 0 1 6.8-5.3A10 10 0 0 0 6 22v6Zm25 0v-6a10 10 0 0 0-1.8-5.3A5.5 5.5 0 0 1 31 22v6Z" />
    </>
  ),
  projects: (
    <g transform="rotate(42 16 16)">
      <path d="M13 11h5v18.5c0 .8-.5 1.5-1.3 1.5h-2.4c-.8 0-1.3-.7-1.3-1.5Z" />
      <path d="M3 8C7 2 14 2 19 5l3 2h6v8h-6v-4h-8c-4 0-7 1.5-10 4L2 13c2-3 4-5 7-6-2-.3-4 0-6 1Z" />
    </g>
  ),
  places: <path d="M1.5 15 15 3c.6-.5 1.4-.5 2 0l13.5 12-2.5 2.5-3-2.6V29h-7v-9h-4v9H7V14.9l-3 2.6Z" />,
  mailbox: (
    <path
      fillRule="evenodd"
      d="M4 6h24a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2ZM2 8l14 10L30 8v3L16 21 2 11Z"
    />
  ),
  settings: (
    <>
      <path fillRule="evenodd" d="M27 16a11 11 0 1 0-22 0 11 11 0 0 0 22 0ZM22 16a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <rect key={angle} x="13" y="1" width="6" height="7" rx=".7" transform={"rotate(" + angle + " 16 16)"} />
      ))}
    </>
  ),
};
export function VillageIcon({ name }: { name: VillageDestination }) {
  return (
    <svg
      viewBox="0 0 32 32"
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
