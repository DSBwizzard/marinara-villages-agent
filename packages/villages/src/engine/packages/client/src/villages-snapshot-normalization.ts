type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): boolean {
  return value === null || typeof value === "string";
}

function isNullableFiniteNumber(value: unknown): boolean {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function isStringArray(value: unknown): boolean {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isVenueImage(value: unknown): boolean {
  if (value === null) return true;
  if (!isRecord(value)) return false;
  return typeof value.ref === "string" && typeof value.url === "string" && typeof value.id === "string";
}

function isVillageVenue(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (
    typeof value.id !== "string" ||
    value.id.trim().length === 0 ||
    typeof value.name !== "string" ||
    typeof value.purpose !== "string" ||
    typeof value.category !== "string" ||
    !isStringArray(value.capabilities) ||
    !isRecord(value.presentation) ||
    !isRecord(value.occupancy) ||
    !isRecord(value.state)
  ) {
    return false;
  }

  const { presentation, occupancy, state } = value;
  return (
    isVenueImage(presentation.image) &&
    isNullableFiniteNumber(presentation.x) &&
    isNullableFiniteNumber(presentation.y) &&
    typeof occupancy.playerHome === "boolean" &&
    isNullableString(occupancy.residentCharacterId) &&
    isNullableString(occupancy.homeKind) &&
    typeof state.condition === "string" &&
    isStringArray(state.upgrades) &&
    isStringArray(state.furniture) &&
    isStringArray(state.publicFacts) &&
    typeof state.updatedAt === "string"
  );
}

/**
 * Drops malformed venue and request records from API snapshots before render
 * code can read their required nested objects. Valid records are retained.
 */
export function normalizeVillageSnapshot<T>(snapshot: T): T {
  if (!isRecord(snapshot) || !isRecord(snapshot.settings) || !Array.isArray(snapshot.settings.venues)) return snapshot;

  const venues = snapshot.settings.venues;
  const normalizedVenues = venues.filter(isVillageVenue);
  const requests = Array.isArray(snapshot.venueRequests) ? snapshot.venueRequests : [];
  const normalizedRequests = requests.filter(
    (entry) =>
      isRecord(entry) &&
      typeof entry.id === "string" &&
      isRecord(entry.venueDraft) &&
      typeof entry.venueDraft.name === "string" &&
      typeof entry.venueDraft.purpose === "string" &&
      typeof entry.venueDraft.category === "string",
  );
  if (
    normalizedVenues.length === venues.length &&
    normalizedRequests.length === requests.length &&
    requests === snapshot.venueRequests
  )
    return snapshot;

  return {
    ...snapshot,
    venueRequests: normalizedRequests,
    settings: {
      ...snapshot.settings,
      venues: normalizedVenues,
    },
  } as T;
}
