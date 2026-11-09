import { type ReactNode, useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from "react";
import type { ResidentSignature, ResidentSignatureImage } from "../../../shared/helpers/resident-signature.js";
import { useFocusRevision, useVillageActivity } from "../../shared/activity.js";
import { invalidatesRead, VILLAGE_ACCESS_DENIED } from "../../shared/api.js";
import { RetainedView } from "../../shared/RetainedView.js";
import { VenuePolaroid } from "../exploration/villages-venue-polaroid.js";
import { PeopleBook } from "./PeopleBook.js";
import { type RelationshipView, VillagesRelationships } from "./villages-relationships.js";
import { VillagerSignature } from "./villages-signature.js";
import { VillagerWishJournal } from "./villages-wish-journal.js";

export type DossierSection = "overview" | "relationships" | "wishes" | "memories" | "agenda" | "venues";
export type DossierNavigation = {
  actorId: string;
  wishId?: string;
  section?: DossierSection;
  returnTo: "home" | "room" | "menu";
};
type Request = <T>(path: string, options?: RequestInit) => Promise<T>;
const P = "marinara-capability-villages";
const sections: DossierSection[] = ["overview", "relationships", "wishes", "memories", "agenda", "venues"];
const titles: Record<DossierSection, string> = {
  overview: "Overview",
  relationships: "Relationships",
  wishes: "Wishes",
  memories: "Memories",
  agenda: "Agenda",
  venues: "Venues",
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
  const paths = {
    overview: (
      <>
        <path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-8h6v8" />
      </>
    ),
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
    venues: (
      <>
        <path d="M19 9c0 5-7 13-7 13S5 14 5 9a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="9" r="2" />
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
  onBack,
  onClose,
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
  };
  portrait: ReactNode;
  request: Request;
  venues: DossierVenue[];
  links: DossierLink[];
  controls: ReactNode;
  spriteManager?: ReactNode;
  inspectors: Partial<Record<DossierSection, ReactNode>>;
  onInspectSection: (section: DossierSection | null) => void;
  onBack: () => void;
  onClose?: () => void;
  onVenue: (id: string) => void;
  error?: string;
}) {
  const { visible, backgroundRevision, viewing } = useVillageActivity();
  const focusRevision = useFocusRevision(visible);
  const showingSprites = !!spriteManager;
  const [section, setSection] = useState<DossierSection>(
    navigation.section ?? (navigation.wishId ? "wishes" : "overview"),
  );
  const [inspect, setInspect] = useState(false);
  const [visited, setVisited] = useState<DossierSection[]>([section]);
  const [manageOpen, setManageOpen] = useState(false);
  const [inspected, setInspected] = useState<DossierSection[]>([]);
  const [relationships, setRelationships] = useState<RelationshipView | null>(null);
  const relationshipEpoch = useRef(0);
  const [readError, setReadError] = useState("");
  const [revision, setRevision] = useState(0);
  const content = useRef<HTMLDivElement>(null);
  const positions = useRef<Partial<Record<DossierSection, number>>>({});
  const [turn, setTurn] = useState({ id: 0, backwards: false });
  const profile = relationships?.profiles?.find((person) => person.characterId === navigation.actorId);
  const name = villager?.name ?? "Former villager";
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
    onInspectSection(inspect && viewing !== false ? section : null);
    return () => onInspectSection(null);
  }, [inspect, section, onInspectSection, viewing]);
  useEffect(() => {
    if (viewing === false) setInspect(false);
  }, [viewing]);
  useEffect(() => {
    if (!inspect) setInspected([]);
    else setInspected((current) => (current.includes(section) ? current : [...current, section]));
  }, [inspect, section]);
  useLayoutEffect(() => {
    const reading = window.matchMedia("(max-width:700px)").matches
      ? content.current?.closest<HTMLElement>(`.${P}-dossier-book`)
      : content.current;
    if (reading) reading.scrollTop = positions.current[section] ?? 0;
  }, [section]);
  const inspectedSection = (tab: DossierSection) => inspect && (section === tab || inspected.includes(tab));
  const choose = (next: DossierSection, inspection = inspect) => {
    setVisited((current) => (current.includes(next) ? current : [...current, next]));
    const reading = window.matchMedia("(max-width:700px)").matches
      ? content.current?.closest<HTMLElement>(`.${P}-dossier-book`)
      : content.current;
    if (reading) positions.current[section] = reading.scrollTop;
    if (next !== section) {
      const order = sections;
      setTurn((current) => ({ id: current.id + 1, backwards: order.indexOf(next) < order.indexOf(section) }));
    }
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
  const personalMail = links.find((link) => link.id === "personal-mail");
  const relatedLinks = links.filter((link) => link.id !== "personal-mail" && (inspect || link.playerVisible === true));
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
          <PeopleBook
            label={`${name} profile`}
            overview={section === "overview" && !!villager}
            section={section}
            inspect={inspect}
            toolbar={
              <>
                <button type="button" className={`${P}-dossier-back`} aria-label="← Back to Villagers" onClick={onBack}>
                  ← People
                </button>
                {section !== "overview" || !villager ? <h1>{name}</h1> : null}
                <div className={`${P}-dossier-actions`} role="group" aria-label="Profile actions">
                  <button
                    type="button"
                    className={`${P}-dossier-inspect`}
                    aria-pressed={inspect}
                    onClick={() => setInspect(!inspect)}
                  >
                    <DossierIcon name="inspect" />
                    {inspect ? "Leave Inspect" : "Inspect"}
                  </button>
                  {villager ? (
                    <details className={`${P}-dossier-management`} open={manageOpen}>
                      <summary
                        onClick={(event) => {
                          event.preventDefault();
                          setManageOpen((open) => !open);
                        }}
                      >
                        Character tools
                      </summary>
                      <div className={`${P}-dossier-controls`} role="group" aria-label="Character tools">
                        {controls}
                      </div>
                    </details>
                  ) : null}
                  {onClose ? (
                    <button type="button" className={`${P}-notebook-close`} onClick={onClose}>
                      Close ×
                    </button>
                  ) : null}
                </div>
              </>
            }
          >
            <div className={`${P}-dossier-identity`}>
              <article className={`${P}-dossier-journal`} aria-label={`${name} journal`}>
                <div className={`${P}-dossier-journal-content`}>
                  <div className={`${P}-dossier-portrait`}>{portrait}</div>
                  <h1>{name}</h1>
                  <div className={`${P}-dossier-biography`}>
                    {villager?.summary ? <p>{villager.summary}</p> : null}
                    {villager?.missing ? (
                      <p className={`${P}-dossier-warning`}>Card missing · saved character remains available.</p>
                    ) : null}
                  </div>
                  {personalMail ? (
                    <button type="button" onClick={personalMail.onOpen}>
                      Message
                    </button>
                  ) : null}
                </div>
                {villager ? (
                  <VillagerSignature
                    key={navigation.actorId}
                    actorId={navigation.actorId}
                    name={name}
                    signature={villager.signatureFallback}
                    saved={villager.signature}
                    request={request}
                  />
                ) : null}
              </article>
            </div>
            <main className={`${P}-dossier-workspace`}>
              <h2 className={`${P}-dossier-section-title`}>{titles[section]}</h2>
              <label className={`${P}-dossier-section-picker`}>
                Section
                <select value={section} onChange={(event) => choose(event.target.value as DossierSection)}>
                  {sections.map((tab) => (
                    <option key={tab} value={tab}>
                      {titles[tab]}
                    </option>
                  ))}
                </select>
              </label>
              <nav className={`${P}-dossier-tabs`} aria-label="Villager profile sections">
                <div>
                  {sections.map((tab) => (
                    <button type="button" key={tab} aria-pressed={section === tab} onClick={() => choose(tab)}>
                      {titles[tab]}
                    </button>
                  ))}
                </div>
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
                            <>
                              <Sheet title="Relationships" icon="relationships">
                                <p>{profile?.summary || "No relationship shared yet."}</p>
                                {profile?.learned
                                  ?.filter(
                                    (entry) =>
                                      entry.kind !== "routine" &&
                                      entry.kind !== "preference" &&
                                      entry.kind !== "home" &&
                                      entry.kind !== "work" &&
                                      entry.text !== profile.summary,
                                  )
                                  .map((entry, index) => (
                                    <p key={index}>{entry.text}</p>
                                  ))}
                              </Sheet>
                              <Sheet title="Wishes" icon="wishes">
                                {profile?.knownWishes?.length ? (
                                  <ul>
                                    {profile?.knownWishes?.map((wish) => (
                                      <li key={wish.wishId}>
                                        {wish.text}
                                        {wish.status ? ` · ${wish.status}` : ""}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p>None shared yet.</p>
                                )}
                              </Sheet>
                              <Sheet title="Routine" icon="agenda">
                                {profile?.routine?.length ? (
                                  <ul>
                                    {profile.routine.map((line, index) => (
                                      <li key={index}>{line}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p>No routine shared yet.</p>
                                )}
                              </Sheet>
                            </>
                          )}
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
                          onView={setRelationships}
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
                            wishes={relationships ? (profile?.knownWishes ?? []) : null}
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
                          <Sheet title="Known routine" icon="agenda">
                            {profile?.routine?.length ? (
                              <>
                                <p>Last shared information · {new Date(profile.knownAt).toLocaleString()}</p>
                                <ul>
                                  {profile.routine?.map((line, index) => (
                                    <li key={index}>{line}</li>
                                  ))}
                                </ul>
                                <p>{profile.interests || "No interests shared yet."}</p>
                              </>
                            ) : (
                              <p>Their routine has not been shared yet.</p>
                            )}
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
            {turn.id > 0 ? (
              <div key={turn.id} className={`${P}-dossier-turn`} data-backwards={turn.backwards} aria-hidden="true" />
            ) : null}
          </PeopleBook>
        </div>
      </RetainedView>
    </>
  );
}
