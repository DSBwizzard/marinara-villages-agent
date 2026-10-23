import type {
  BuildProject,
  VenueClass,
  VillageSnapshot,
  VillageVenue,
  VillageVenueImage,
} from "../../../shared/contracts/village.js";
import { useLayoutEffect, useRef, useState } from "react";

export type ProjectRevisionDraft = {
  sourceKey: string;
  editing: boolean;
  title: string;
  change: NonNullable<NonNullable<BuildProject["lifecycle"]>["change"]>;
};

type ProjectDraft = {
  venueSeeded?: boolean;
  form: string;
  openingVenueType: string;
  openingSpaces: NonNullable<VillageVenue["spaces"]>;
  exterior: string;
  interior: string;
  exteriorImage: VillageVenueImage | null;
  interiorImage: VillageVenueImage | null;
  zoneImages: Record<string, VillageVenueImage>;
  imagePreview: { area: "exterior" | "interior"; image: VillageVenueImage; key: string } | null;
  finishingVisit: boolean;
  openingLayout: VillageVenue["layout"];
  openingCommonClass: VenueClass | undefined;
  openingPrivateSpaces: NonNullable<VillageVenue["privateSpaces"]>;
  openingPersonality: boolean;
  openingLore: boolean;
  busy: boolean;
  error: string;
  revision: ProjectRevisionDraft | null;
};

function emptyDraft(snapshot: VillageSnapshot | null): ProjectDraft {
  return {
    form: "",
    openingVenueType: "",
    openingSpaces: [],
    exterior: "",
    interior: "",
    exteriorImage: null,
    interiorImage: null,
    zoneImages: {},
    imagePreview: null,
    finishingVisit: false,
    openingLayout: undefined,
    openingCommonClass: undefined,
    openingPrivateSpaces: [],
    openingPersonality: snapshot?.settings.personalizeVenueImagesByDefault !== false,
    openingLore: snapshot?.settings.useVisualLoreByDefault !== false,
    busy: false,
    error: "",
    revision: null,
  };
}

/** Seed existing physical places once without replacing later player edits or pending operations. */
function seedEstablishedDraft(draft: ProjectDraft, key: string, snapshot: VillageSnapshot | null): ProjectDraft {
  const project = snapshot?.projects.find((entry) => `project:${entry.id}` === key);
  const venue =
    (project?.plan || project?.opening?.established) &&
    snapshot?.settings.venues.find((entry) => entry.id === project.venueId);
  if (!venue || draft.venueSeeded) return draft;
  const plan = project?.plan;
  const spaces = structuredClone(plan?.spaces ?? venue.spaces ?? []);
  const privateSpaces = structuredClone(plan?.privateSpaces ?? venue.privateSpaces ?? []).map((zone) => ({
    ...zone,
    ownerId: zone.ownerId ?? "",
  }));
  return {
    ...draft,
    venueSeeded: true,
    form: draft.form || plan?.form || venue.form || "",
    openingVenueType: draft.openingVenueType || plan?.venueType || venue.venueType || "",
    exterior: draft.exterior || plan?.exteriorDescription || venue.description,
    interior: draft.interior || spaces[0]?.description || "",
    openingLayout:
      draft.openingLayout ??
      plan?.layout ??
      venue.layout ??
      (spaces.length ? (privateSpaces.length ? "both" : "common") : privateSpaces.length ? "private" : "exterior"),
    openingCommonClass: draft.openingCommonClass ?? spaces[0]?.venueClass,
    openingSpaces: draft.openingSpaces.length ? draft.openingSpaces : spaces,
    openingPrivateSpaces: draft.openingPrivateSpaces.length ? draft.openingPrivateSpaces : privateSpaces,
    exteriorImage: draft.exteriorImage ?? plan?.exteriorImage ?? venue.presentation.image,
    interiorImage: draft.interiorImage ?? spaces[0]?.image ?? null,
  };
}

/** One application owns every Project workspace, including work on a hidden Project. */
export function useProjectWorkspaces(key: string, snapshot: VillageSnapshot | null) {
  const [drafts, setDrafts] = useState<Record<string, ProjectDraft>>({});
  const claims = useRef(new Map<string, object>());
  const imageKeys = useRef(new Map<string, string>());
  const lifetime = useRef({ current: true });
  const epoch = useRef(0);
  const previousFounded = useRef<boolean>(undefined);
  const generation = epoch.current;
  useLayoutEffect(() => {
    if (snapshot?.isFounded === false && previousFounded.current === true) {
      epoch.current += 1;
      claims.current.clear();
      imageKeys.current.clear();
      setDrafts({});
    }
    if (snapshot) previousFounded.current = snapshot.isFounded;
  }, [snapshot?.isFounded]);
  useLayoutEffect(() => {
    const owner = lifetime.current;
    owner.current = true;
    return () => {
      owner.current = false;
    };
  }, []);
  const draft = seedEstablishedDraft(drafts[key] ?? emptyDraft(snapshot), key, snapshot);
  function field<K extends keyof ProjectDraft>(name: K) {
    return (value: React.SetStateAction<ProjectDraft[K]>) => {
      if (!lifetime.current.current || epoch.current !== generation) return;
      setDrafts((current) => {
        const previous = seedEstablishedDraft(current[key] ?? emptyDraft(snapshot), key, snapshot);
        const next =
          typeof value === "function" ? (value as (old: ProjectDraft[K]) => ProjectDraft[K])(previous[name]) : value;
        return { ...current, [key]: { ...previous, [name]: next } };
      });
    };
  }
  function begin() {
    if (!lifetime.current.current || epoch.current !== generation || claims.current.has(key)) return null;
    const token = {};
    claims.current.set(key, token);
    field("busy")(true);
    field("error")("");
    return {
      current: () => lifetime.current.current && claims.current.get(key) === token,
      finish: () => {
        if (claims.current.get(key) !== token) return;
        claims.current.delete(key);
        field("busy")(false);
      },
    };
  }
  return { draft, field, begin, imageKeys, key };
}

/** Commit the visible workspace's input identity without replacing hidden workspaces' identities. */
export function useProjectImageKey(
  imageKeys: React.RefObject<Map<string, string>>,
  key: string,
  value: string,
  contextKey: string,
) {
  const currentContext = useRef(contextKey);
  useLayoutEffect(() => {
    imageKeys.current.set(key, value);
    currentContext.current = contextKey;
  }, [imageKeys, key, value, contextKey]);
  return () => imageKeys.current.get(key) === value && currentContext.current === contextKey;
}
