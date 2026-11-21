import { VillageIcon } from "../../shared/VillageIcon.js";

export type SceneAction =
  | "dialogue"
  | "show-dialogue"
  | "retry"
  | "retry-unavailable"
  | "venue"
  | "mailbox"
  | "map"
  | "projects"
  | "proposals"
  | "settings"
  | "conclude"
  | "transcript"
  | "older"
  | "newer"
  | "close"
  | "move";

export function SceneActionIcon({ name }: { name: SceneAction }) {
  if (name === "venue" || name === "mailbox" || name === "projects" || name === "settings")
    return <VillageIcon name={name === "venue" ? "places" : name} />;
  return (
    <svg
      className="mari-rgb-static-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "dialogue" || name === "show-dialogue" ? (
        <>
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
          {name === "dialogue" ? <path d="m3 21 18-18" /> : null}
        </>
      ) : name === "retry" || name === "retry-unavailable" ? (
        <>
          <path d="M20 4v6h-6M20 10a8 8 0 1 0 0 5" />
          {name === "retry-unavailable" ? <path d="m4 20 16-16" /> : null}
        </>
      ) : name === "older" || name === "newer" ? (
        <path d={name === "older" ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"} />
      ) : name === "close" ? (
        <path d="m6 6 12 12M6 18 18 6" />
      ) : name === "map" ? (
        <path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16m6-14v16" />
      ) : name === "proposals" ? (
        <>
          <path d="M7 3h12v18H5V7M7 3v4H3V5a2 2 0 0 1 4 0M9 9h6m-6 4h6m-6 4h4" />
        </>
      ) : name === "conclude" ? (
        <>
          <path d="M5 21V3m0 1c5-4 9 4 14 0v10c-5 4-9-4-14 0" />
          <path d="m10 9 2 2 4-4" />
        </>
      ) : name === "move" ? (
        <>
          <ellipse cx="8" cy="6" rx="2.5" ry="4" transform="rotate(-20 8 6)" />
          <ellipse cx="16" cy="13" rx="2.5" ry="4" transform="rotate(20 16 13)" />
          <path d="m7 13 1 2m9 5-1 2" />
        </>
      ) : (
        <>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M8 8h8m-8 4h8m-8 4h6" />
        </>
      )}
    </svg>
  );
}
