import type { ReactNode } from "react";
export const VILLAGE_DESTINATIONS = ["people", "projects", "places", "mailbox", "settings"] as const;
export type VillageDestination = (typeof VILLAGE_DESTINATIONS)[number];
export type VillageIconName =
  | VillageDestination
  | "memory"
  | "world"
  | "venue"
  | "zone"
  | "details"
  | "access"
  | "calendar"
  | "compass"
  | "artwork";
// Curved silhouettes follow the reference without tracing its raster pixel edges.
const glyphs: Record<VillageIconName, ReactNode> = {
  people: (
    <>
      <circle cx="16" cy="8" r="4.2" />
      <circle cx="6.5" cy="11" r="3.1" />
      <circle cx="25.5" cy="11" r="3.1" />
      <path d="M9 28v-6.5a7 7 0 0 1 14 0V28ZM1 28v-6a5.5 5.5 0 0 1 6.8-5.3A10 10 0 0 0 6 22v6Zm25 0v-6a10 10 0 0 0-1.8-5.3A5.5 5.5 0 0 1 31 22v6Z" />
    </>
  ),
  artwork: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <rect x="4" y="4" width="24" height="24" rx="3" />
      <circle cx="11" cy="11" r="2" />
      <path d="m5 25 8-8 5 5 4-6 5 8" />
    </g>
  ),
  projects: (
    <g transform="rotate(42 16 16)">
      <path d="M13 11h5v18.5c0 .8-.5 1.5-1.3 1.5h-2.4c-.8 0-1.3-.7-1.3-1.5Z" />
      <path d="M3 8C7 2 14 2 19 5l3 2h6v8h-6v-4h-8c-4 0-7 1.5-10 4L2 13c2-3 4-5 7-6-2-.3-4 0-6 1Z" />
    </g>
  ),
  places: <path d="M1.5 15 15 3c.6-.5 1.4-.5 2 0l13.5 12-2.5 2.5-3-2.6V29h-7v-9h-4v9H7V14.9l-3 2.6Z" />,
  compass: (
    <>
      <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="m23 9-4 10-10 4 4-10Zm-9 5 4 4 2-6Z" fillRule="evenodd" />
    </>
  ),
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
  memory: (
    <path
      fillRule="evenodd"
      d="M5 4h22a2 2 0 0 1 2 2v17a2 2 0 0 1-2 2h-9l-7 5v-5H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm3 7v2h16v-2Zm0 6v2h11v-2Z"
    />
  ),
  world: (
    <path
      fillRule="evenodd"
      d="M16 2a14 14 0 1 1 0 28 14 14 0 0 1 0-28Zm-5 15H4a12 12 0 0 0 3 7h5a27 27 0 0 1-1-7Zm0-2H4a12 12 0 0 1 3-7h5a27 27 0 0 0-1 7Zm2 0h6a25 25 0 0 0-1-7h-4a25 25 0 0 0-1 7Zm0 2a25 25 0 0 0 1 7h4a25 25 0 0 0 1-7Zm8 0h7a12 12 0 0 1-3 7h-5a27 27 0 0 0 1-7Zm0-2h7a12 12 0 0 0-3-7h-5a27 27 0 0 1 1 7Z"
    />
  ),
  venue: (
    <path fillRule="evenodd" d="M2 28h28v2H2Zm3-2V5h22v21h-8v-6h-6v6ZM9 9v3h5V9Zm9 0v3h5V9Zm-9 6v3h5v-3Zm9 0v3h5v-3Z" />
  ),
  zone: <path fillRule="evenodd" d="M4 4h24v24H4Zm3 3v18h18V7H7Zm3 3h5v5h-5Zm7 0h5v5h-5Zm-7 7h5v5h-5Zm7 0h5v5h-5Z" />,
  details: <path fillRule="evenodd" d="M6 3h14l6 6v20H6Zm13 2v6h5ZM10 14v2h12v-2Zm0 5v2h12v-2Zm0 5v2h8v-2Z" />,
  calendar: (
    <path fillRule="evenodd" d="M4 5h5V2h3v3h8V2h3v3h5v24H4Zm3 8v13h18V13Zm3 4h4v3h-4Zm8 0h4v3h-4Zm-8 5h4v2h-4Z" />
  ),
  access: (
    <path
      fillRule="evenodd"
      d="M13 2a8 8 0 0 1 7.4 11l8.6 8.6V28h-6v-4h-4v-4l-3-3A8 8 0 1 1 13 2Zm-2 5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"
    />
  ),
};
export function VillageIcon({ name }: { name: VillageIconName }) {
  return (
    <svg
      className="mari-rgb-static-icon"
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
