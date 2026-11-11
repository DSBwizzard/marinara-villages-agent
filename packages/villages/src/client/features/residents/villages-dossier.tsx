import { VillageIcon } from "../../shared/VillageIcon.js";
import { type ReactNode, useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from "react";
import type { ResidentSignature, ResidentSignatureImage } from "../../../shared/helpers/resident-signature.js";
import { useFocusRevision, useVillageActivity } from "../../shared/activity.js";
import { invalidatesRead, VILLAGE_ACCESS_DENIED } from "../../shared/api.js";
import { RetainedView } from "../../shared/RetainedView.js";
import { VenuePolaroid } from "../exploration/villages-venue-polaroid.js";
import { PeopleBook } from "./PeopleBook.js";
import { type RelationshipView, VillagesRelationships, RelationshipEntries } from "./villages-relationships.js";
import { VillagerSignature } from "./villages-signature.js";
import { VillagerWishJournal } from "./villages-wish-journal.js";
import type { ResidentSprite } from "../../../shared/contracts/village.js";
import { ResidentArtwork } from "./ResidentArtwork.js";

export type DossierSection = "overview" | "relationships" | "wishes" | "memories" | "agenda" | "venues";
type ProfileSection = DossierSection | "tools";
export type DossierNavigation = {
  actorId: string;
  wishId?: string;
  section?: DossierSection;
  returnTo: "home" | "room" | "menu";
};
type Request = <T>(path: string, options?: RequestInit) => Promise<T>;
const P = "marinara-capability-villages";
function readingArea(content: HTMLElement | null) {
  const root = content?.closest<HTMLElement>(`.${P}-dossier-root`);
  const book = content?.closest<HTMLElement>(`.${P}-dossier-book`);
  return root && getComputedStyle(root).overflowY === "auto"
    ? root
    : book && getComputedStyle(book).overflowY === "auto"
      ? book
      : content;
}
const sections: DossierSection[] = ["overview", "relationships", "wishes", "memories"];
const titles: Record<ProfileSection, string> = {
  overview: "Overview",
  relationships: "Relationships",
  wishes: "Wishes",
  memories: "Memories",
  agenda: "Agenda",
  venues: "Venues",
  tools: "Character Tools",
};
export type DossierVenue = {
  id: string;
  name: string;
  image?: string;
  connections: string[];
  publicConnections: string[];
};
export type DossierLink = { id: string; title: string; detail: string; onOpen: () => void; playerVisible?: boolean };

export function DossierIcon({ name }: { name: DossierSection | "inspect" }) {
  if (name === "venues" || name === "overview") return <VillageIcon name="places" />;
  const paths = {
    relationships: (
      <>
        <path d="M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-4 4 1 9 8 15 7-6 12-11 8-15Z" />
      </>
    ),
    wishes: <path d="m12 2 3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1Z" />,
    memories: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="1" />
        <circle cx="8" cy="9" r="1" />
        <path d="m3 17 6-6 5 5 3-3 4 4" />
      </>
    ),
    agenda: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="1" />
        <path d="M7 2v6M17 2v6M3 10h18M7 14h2M15 14h2M7 18h2M15 18h2" />
      </>
    ),
    inspect: (
      <>
        <circle cx="10" cy="10" r="7" />
        <path d="m15 15 7 7" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Sheet({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon?: DossierSection;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${P}-dossier-sheet ${className}`}>
      <h2>
        {icon ? <DossierIcon name={icon} /> : null}
        {title}
      </h2>
      {children}
    </section>
  );
}

/** One shared profile; private records are mounted only after deliberate inspection. */
export function VillagerDossier({
  navigation,
  villager,
  portrait,
  request,
  venues,
  links,
  controls,
  spriteManager,
  inspectors,
  onInspectSection,
  onVenue,
  error,
}: {
  navigation: DossierNavigation;
  villager?: {
    characterId: string;
    name: string;
    summary: string;
    missing: boolean;
    signatureFallback?: ResidentSignature;
    signature?: ResidentSignatureImage;
    sprite?: ResidentSprite | null;
  };
  portrait: ReactNode;
  request: Request;
  venues: DossierVenue[];
  links: DossierLink[];
  controls: ReactNode;
  spriteManager?: ReactNode;
  inspectors: Partial<Record<DossierSection, ReactNode>>;
  onInspectSection: (section: DossierSection | null) => void;
  onVenue: (id: string) => void;
  error?: string;
}) {
  const { visible, backgroundRevision, viewing } = useVillageActivity();
  const focusRevision = useFocusRevision(visible);
  const showingSprites = !!spriteManager;
  const [section, setSection] = useState<ProfileSection>(
    navigation.section ?? (navigation.wishId ? "wishes" : "overview"),
  );
  const [inspect, setInspect] = useState(false);
  const [visited, setVisited] = useState<ProfileSection[]>([section]);
  const toolsOrigin = useRef<DossierSection>("overview");
  const [signatureTools, setSignatureTools] = useState<HTMLDivElement | null>(null);
  const [signatureSurface, setSignatureSurface] = useState<HTMLDivElement | null>(null);
  const [inspected, setInspected] = useState<DossierSection[]>([]);
  const [relationships, setRelationships] = useState<RelationshipView | null>(null);
  const relationshipEpoch = useRef(0);
  const [readError, setReadError] = useState("");
  const [revision, setRevision] = useState(0);
  const content = useRef<HTMLDivElement>(null);
  const positions = useRef<Partial<Record<ProfileSection, number>>>({});
  const profile = relationships?.profiles?.find((person) => person.characterId === navigation.actorId);
  const name = villager?.name ?? "Former villager";
  const images = villager?.sprite?.images ?? [];
  const neutral =
    images.find((image) => image.view === "front" && image.label.trim().toLocaleLowerCase() === "neutral") ??
    images.find((image) => image.label.trim().toLocaleLowerCase() === "neutral") ??
    images.find((image) => image.view === "front" && image.isDefault) ??
    images.find((image) => image.isDefault) ??
    images.find((image) => image.view === "front") ??
    images[0];
  useEffect(() => {
    if (!visible || showingSprites) return;
    const controller = new AbortController();
    const epoch = relationshipEpoch.current;
    const refresh = async () => {
      try {
        const view = await request<RelationshipView>("/relationships", { signal: controller.signal });
        if (!controller.signal.aborted && epoch === relationshipEpoch.current) {
          setRelationships(view);
          setReadError("");
        }
      } catch (cause) {
        if (!controller.signal.aborted && epoch === relationshipEpoch.current) {
          if (invalidatesRead(cause)) {
            setRelationships(null);
            setInspect(false);
          }
          setReadError(cause instanceof Error ? cause.message : "Profile information could not be read.");
        }
      }
    };
    void refresh();
    return () => {
      controller.abort();
    };
  }, [request, navigation.actorId, revision, visible, showingSprites, backgroundRevision, focusRevision]);
  useEffect(() => {
    const denied = (event: Event) => {
      relationshipEpoch.current++;
      setRelationships(null);
      setInspect(false);
      setReadError(event instanceof CustomEvent && typeof event.detail === "string" ? event.detail : "Access denied.");
    };
    window.addEventListener(VILLAGE_ACCESS_DENIED, denied);
    return () => window.removeEventListener(VILLAGE_ACCESS_DENIED, denied);
  }, []);
  useEffect(() => {
    onInspectSection(inspect && viewing !== false && section !== "tools" ? section : null);
    return () => onInspectSection(null);
  }, [inspect, section, onInspectSection, viewing]);
  useEffect(() => {
    if (viewing === false) setInspect(false);
  }, [viewing]);
  useEffect(() => {
    if (!inspect) setInspected([]);
    else if (section !== "tools")
      setInspected((current) => (current.includes(section) ? current : [...current, section]));
  }, [inspect, section]);
  useLayoutEffect(() => {
    const reading = readingArea(content.current);
    if (reading) reading.scrollTop = positions.current[section] ?? 0;
  }, [section]);
  const inspectedSection = (tab: DossierSection) => inspect && (section === tab || inspected.includes(tab));
  const choose = (next: ProfileSection, inspection = inspect) => {
    if (next === "tools" && section !== "tools") toolsOrigin.current = section;
    setVisited((current) => (current.includes(next) ? current : [...current, next]));
    const reading = readingArea(content.current);
    if (reading) positions.current[section] = reading.scrollTop;
    setSection(next);
    setInspect(inspection);
  };
  const followNavigation = useEffectEvent(() => {
    const target = navigation.section ?? (navigation.wishId ? "wishes" : null);
    if (target) choose(target, false);
  });
  useEffect(() => {
    followNavigation();
  }, [navigation]);
  const visibleVenues = venues
    .map((venue) => {
      const grants = profile?.access?.filter((grant) => grant.venueId === venue.id) ?? [];
      return {
        ...venue,
        connections: [
          ...(inspect ? venue.connections : venue.publicConnections),
          ...grants.map((grant) => `${grant.name} · ${grant.active ? "Standing access" : "Access suspended"}`),
        ],
      };
    })
    .filter((venue) => venue.connections.length);
  const venueCards = () =>
    visibleVenues.length ? (
      <div className={`${P}-dossier-venues`}>
        {visibleVenues.map((venue) => (
          <article key={venue.id}>
            <VenuePolaroid image={venue.image} name={venue.name} className={`${P}-dossier-polaroid`} />
            <div>
              <h3>{venue.name}</h3>
              <p>{venue.connections.join(" · ")}</p>
              <button type="button" onClick={() => onVenue(venue.id)}>
                View Venue
              </button>
            </div>
          </article>
        ))}
      </div>
    ) : (
      <p>No known Venues.</p>
    );
  const relatedLinks = links.filter((link) => inspect || link.playerVisible === true);
  const related = (
    <div className={`${P}-dossier-links`}>
      {relatedLinks.length ? (
        relatedLinks.map((link) => (
          <button key={link.id} type="button" onClick={link.onOpen}>
            <strong>{link.title}</strong>
            <small>{link.detail}</small>
            <span aria-hidden="true">›</span>
          </button>
        ))
      ) : (
        <p>No related Projects or Venue Requests.</p>
      )}
    </div>
  );
  return (
    <>
      {spriteManager ? <div className={`${P}-root ${P}-sprite-manager-root`}>{spriteManager}</div> : null}
      <RetainedView active={!showingSprites}>
        <div className={`${P}-root ${P}-dossier-root`}>
          <PeopleBook label={`${name} profile`}>
            <div className={`${P}-dossier-identity`}>
              <article className={`${P}-dossier-journal`} aria-label={`${name} journal`}>
                <div className={`${P}-dossier-journal-content`}>
                  <h1>{name}</h1>
                  <div className={`${P}-dossier-biography`}>
                    {villager?.summary ? <p>{villager.summary}</p> : null}
                    {villager?.missing ? (
                      <p className={`${P}-dossier-warning`}>Card missing · saved character remains available.</p>
                    ) : null}
                  </div>
                </div>
              </article>
            </div>
            <main className={`${P}-dossier-workspace`}>
              <nav className={`${P}-dossier-tabs`} aria-label="Villager profile sections">
                <div>
                  {sections.map((tab) => (
                    <button type="button" key={tab} aria-pressed={section === tab} onClick={() => choose(tab)}>
                      {titles[tab]}
                    </button>
                  ))}
                </div>
                <label className={`${P}-dossier-section-picker`}>
                  <span className={`${P}-sr-only`}>Section</span>
                  <select value={section} onChange={(event) => choose(event.target.value as ProfileSection)}>
                    {section === "tools" || !sections.includes(section) ? (
                      <option value={section}>{titles[section]}</option>
                    ) : null}
                    {sections.map((tab) => (
                      <option key={tab} value={tab}>
                        {titles[tab]}
                      </option>
                    ))}
                  </select>
                </label>
                {villager ? (
                  <button
                    type="button"
                    className={`${P}-dossier-tools-toggle`}
                    aria-label={titles.tools}
                    title={titles.tools}
                    aria-pressed={section === "tools"}
                    onClick={() => choose("tools")}
                  >
                    <VillageIcon name="settings" />
                  </button>
                ) : null}
              </nav>
              <div
                ref={content}
                className={`${P}-dossier-content`}
                tabIndex={0}
                aria-label={`${titles[section]} reading area`}
              >
                {error ? (
                  <p role="alert" className={`${P}-dossier-warning`}>
                    {error}
                  </p>
                ) : null}
                {readError ? (
                  <p role="alert">
                    {readError}{" "}
                    <button type="button" onClick={() => setRevision(revision + 1)}>
                      Retry profile
                    </button>
                  </p>
                ) : null}
                {!villager ? (
                  <Sheet title="This villager has moved out">
                    <p>Saved history retained.</p>
                  </Sheet>
                ) : (
                  <>
                    <section className={`${P}-dossier-sheet`} aria-label={titles.tools} hidden={section !== "tools"}>
                      <h2>{titles.tools}</h2>
                      <div className={`${P}-dossier-controls`}>
                        <div role="group" aria-label="Profile actions">
                          <button
                            type="button"
                            className={`${P}-dossier-inspect`}
                            aria-pressed={inspect}
                            onClick={() => choose(toolsOrigin.current, !inspect)}
                          >
                            <DossierIcon name="inspect" />
                            {inspect ? "Leave Inspect" : "Inspect"}
                          </button>
                        </div>
                        <button type="button" onClick={() => choose("agenda")}>
                          Agenda records
                        </button>
                        <button type="button" onClick={() => choose("venues")}>
                          Venue connections
                        </button>
                        {controls}
                        <div className={`${P}-dossier-signature-tools`} ref={setSignatureTools} />
                      </div>
                    </section>
                    {visited.includes("overview") ? (
                      <RetainedView active={section === "overview"} label="Overview content">
                        <div className={`${P}-dossier-overview`}>
                          {!relationships ? (
                            <p role="status">Reading profile…</p>
                          ) : !profile ? (
                            <p role="status">
                              {relationships.starting?.pending
                                ? "Profile information is still being prepared."
                                : "Profile information is unavailable."}
                            </p>
                          ) : (
                            <Sheet title="Agenda" icon="agenda">
                              <RelationshipEntries
                                entries={profile.entries.filter((entry) => entry.kind === "information")}
                              />
                            </Sheet>
                          )}
                          <div ref={setSignatureSurface} />
                          <Sheet title="Home and work" icon="venues">
                            {venues.some((venue) => venue.publicConnections.length) ? (
                              <ul>
                                {venues.flatMap((venue) =>
                                  venue.publicConnections.map((role) => (
                                    <li key={`${venue.id}:${role}`}>
                                      {role} · {venue.name}
                                    </li>
                                  )),
                                )}
                              </ul>
                            ) : (
                              <p>No home or workplace assigned.</p>
                            )}
                          </Sheet>
                          {inspectedSection("overview") ? inspectors.overview : null}
                        </div>
                      </RetainedView>
                    ) : null}
                    {visited.includes("relationships") ? (
                      <RetainedView active={section === "relationships"} label="Relationships content">
                        <VillagesRelationships
                          key={inspectedSection("relationships") ? "inspect" : "public"}
                          request={request}
                          prefix={P}
                          onVenue={onVenue}
                          characterId={navigation.actorId}
                          inspect={inspectedSection("relationships")}
                          view={relationships}
                        />
                      </RetainedView>
                    ) : null}
                    {visited.includes("wishes") ? (
                      <RetainedView active={section === "wishes"} label="Wishes content">
                        {inspectedSection("wishes") ? (
                          <RetainedView active={inspect}>{inspectors.wishes}</RetainedView>
                        ) : null}
                        <RetainedView active={!inspect}>
                          <VillagerWishJournal
                            inspect={false}
                            request={request}
                            characterId={navigation.actorId}
                            prefix={P}
                            focusWishId={navigation.wishId}
                            onWishes={(knownWishes) => {
                              relationshipEpoch.current++;
                              setRelationships((current) =>
                                current
                                  ? {
                                      ...current,
                                      profiles: current.profiles.map((entry) =>
                                        entry.characterId === navigation.actorId ? { ...entry, knownWishes } : entry,
                                      ),
                                    }
                                  : current,
                              );
                            }}
                            onFollowing={() => {
                              relationshipEpoch.current++;
                            }}
                          />
                        </RetainedView>
                      </RetainedView>
                    ) : null}
                    {visited.includes("memories") ? (
                      <RetainedView active={section === "memories"} label="Memories content">
                        {inspectedSection("memories") ? inspectors.memories : null}
                        {!inspect ? (
                          <Sheet title="Memories" icon="memories">
                            <button type="button" onClick={() => setInspect(true)}>
                              Inspect memories
                            </button>
                          </Sheet>
                        ) : null}
                      </RetainedView>
                    ) : null}
                    {visited.includes("agenda") ? (
                      <RetainedView active={section === "agenda"} label="Agenda content">
                        {inspectedSection("agenda") ? inspectors.agenda : null}
                        {!inspect ? (
                          <Sheet title="Known information" icon="agenda">
                            <RelationshipEntries
                              entries={(profile?.entries ?? []).filter((entry) =>
                                ["information", "motivation", "commitment"].includes(entry.kind),
                              )}
                            />
                          </Sheet>
                        ) : null}
                      </RetainedView>
                    ) : null}
                    {visited.includes("venues") ? (
                      <RetainedView active={section === "venues"} label="Venues content">
                        <>
                          <Sheet title="Relevant Venues" icon="venues">
                            {venueCards()}
                          </Sheet>
                          <Sheet title="Projects and Venue Requests">{related}</Sheet>
                        </>
                      </RetainedView>
                    ) : null}
                  </>
                )}
              </div>
            </main>
          </PeopleBook>

          <aside className={`${P}-dossier-character`} aria-label={`${name} artwork`} data-sprite={!!neutral}>
            {neutral ? (
              <ResidentArtwork
                key={neutral.url}
                url={neutral.url}
                name={name}
                fallback={<div className={`${P}-dossier-portrait`}>{portrait}</div>}
              />
            ) : (
              <div className={`${P}-dossier-portrait`}>{portrait}</div>
            )}
          </aside>

          {villager ? (
            <VillagerSignature
              key={navigation.actorId}
              actorId={navigation.actorId}
              name={name}
              signature={villager.signatureFallback}
              saved={villager.signature}
              request={request}
              toolsContainer={signatureTools}
              artContainer={signatureSurface}
            />
          ) : null}
        </div>
      </RetainedView>
    </>
  );
}
