import { useEffect, useRef, useState, type ReactNode } from "react";
import { VillagesRelationships, type RelationshipView } from "./villages-relationships.js";
import { VillagerWishJournal } from "./villages-wish-journal.js";
import { VenuePolaroid } from "./villages-venue-polaroid.js";

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
  inspectOnly?: boolean;
};
export type DossierLink = { id: string; title: string; detail: string; onOpen: () => void };

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
  onVenue,
  error,
}: {
  navigation: DossierNavigation;
  villager?: { characterId: string; name: string; summary: string; tags: string[]; missing: boolean };
  portrait: ReactNode;
  request: Request;
  venues: DossierVenue[];
  links: DossierLink[];
  controls: ReactNode;
  spriteManager?: ReactNode;
  inspectors: Partial<Record<DossierSection, ReactNode>>;
  onInspectSection: (section: DossierSection | null) => void;
  onBack: () => void;
  onVenue: (id: string) => void;
  error?: string;
}) {
  const [section, setSection] = useState<DossierSection>(
    navigation.section ?? (navigation.wishId ? "wishes" : "overview"),
  );
  const [inspect, setInspect] = useState(false);
  const [relationships, setRelationships] = useState<RelationshipView | null>(null);
  const [readError, setReadError] = useState("");
  const [revision, setRevision] = useState(0);
  const content = useRef<HTMLDivElement>(null);
  const profile = relationships?.profiles?.find((person) => person.characterId === navigation.actorId);
  const name = villager?.name ?? "Former villager";
  useEffect(() => {
    const controller = new AbortController();
    const refresh = async () => {
      try {
        const view = await request<RelationshipView>("/relationships", { signal: controller.signal });
        if (!controller.signal.aborted) {
          setRelationships(view);
          setReadError("");
        }
      } catch (cause) {
        if (!controller.signal.aborted)
          setReadError(cause instanceof Error ? cause.message : "Profile information could not be read.");
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30_000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [request, navigation.actorId, revision]);
  useEffect(() => {
    onInspectSection(inspect ? section : null);
    return () => onInspectSection(null);
  }, [inspect, section, onInspectSection]);
  const choose = (next: DossierSection, inspection = inspect) => {
    setSection(next);
    setInspect(inspection);
    if (content.current) content.current.scrollTop = 0;
  };
  const visibleVenues = venues
    .map((venue) => {
      const grants = profile?.access?.filter((grant) => grant.venueId === venue.id) ?? [];
      return {
        ...venue,
        connections: [
          ...venue.connections,
          ...grants.map((grant) => `${grant.name} · ${grant.active ? "Standing access" : "Access suspended"}`),
        ],
        inspectOnly: venue.inspectOnly && !grants.length,
      };
    })
    .filter((venue) => venue.connections.length && (inspect || !venue.inspectOnly));
  const venueCards = (compact = false) =>
    visibleVenues.length ? (
      <div className={`${P}-dossier-venues`}>
        {(compact ? visibleVenues.slice(0, 2) : visibleVenues).map((venue) => (
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
      <p>No relevant Venues recorded.</p>
    );
  const summary = (target: DossierSection, text: string, detail: string, inspection = false) => (
    <button type="button" className={`${P}-dossier-summary`} onClick={() => choose(target, inspection)}>
      <span className={`${P}-dossier-summary-title`}>
        <DossierIcon name={target} />
        {titles[target]}
        <span aria-hidden="true">›</span>
      </span>
      <strong>{text}</strong>
      <small>{detail}</small>
    </button>
  );
  const related = (
    <div className={`${P}-dossier-links`}>
      {links.length ? (
        links.map((link) => (
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
  // The artwork workspace uses the available screen; the dossier stays mounted for a seamless return.
  if (spriteManager) return <div className={`${P}-root ${P}-sprite-manager-root`}>{spriteManager}</div>;
  return (
    <div className={`${P}-root ${P}-dossier-root`}>
      <section
        className={`${P}-dossier-desk`}
        aria-label={`${name} profile`}
        data-inspect={inspect}
        data-overview={section === "overview" && !!villager}
      >
        <div className={`${P}-dossier-identity`}>
          <article className={`${P}-dossier-journal`} aria-label={`${name} journal`}>
            <span className={`${P}-dossier-binding`} aria-hidden="true" />
            <h1>{name}</h1>
            <div className={`${P}-dossier-journal-content`}>
              <div className={`${P}-dossier-portrait`}>{portrait}</div>
              <div className={`${P}-dossier-biography`}>
                <p>{villager?.summary || "No character summary recorded."}</p>
                {villager?.missing ? (
                  <p className={`${P}-dossier-warning`}>Card missing · saved character remains available.</p>
                ) : null}
              </div>
            </div>
            <div className={`${P}-dossier-tags`}>
              {villager?.tags?.map((tag, index) => (
                <span key={`${tag}-${index}`}>{tag}</span>
              ))}
            </div>
            <span className={`${P}-dossier-journal-rule`} aria-hidden="true" />
          </article>
          <button type="button" className={`${P}-dossier-back`} onClick={onBack}>
            {navigation.returnTo === "room"
              ? "Back to Scene"
              : navigation.returnTo === "home"
                ? "Back to People"
                : "← Back to Villagers"}
          </button>
        </div>
        <main className={`${P}-dossier-workspace`}>
          <nav className={`${P}-dossier-tabs`} aria-label="Villager profile sections">
            <div>
              {sections.map((tab) => (
                <button type="button" key={tab} aria-pressed={section === tab} onClick={() => choose(tab)}>
                  <DossierIcon name={tab} />
                  {titles[tab]}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={`${P}-dossier-inspect`}
              aria-pressed={inspect}
              onClick={() => setInspect(!inspect)}
            >
              <DossierIcon name="inspect" />
              {inspect ? "Leave Inspect" : "Inspect"}
            </button>
          </nav>
          {villager ? (
            <div className={`${P}-dossier-controls`} role="group" aria-label="Villager management">
              {controls}
            </div>
          ) : null}
          <div ref={content} className={`${P}-dossier-content`}>
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
                <p>
                  The character and saved history have not been deleted. Return to the directory to select another
                  villager.
                </p>
              </Sheet>
            ) : (
              <>
                {inspect ? (
                  <p className={`${P}-dossier-inspect-notice`} role="status">
                    Inspect · private records and management controls. Viewing these does not teach your player
                    character.
                  </p>
                ) : null}
                {section === "overview" ? (
                  <>
                    <Sheet title="Village life" icon="overview" className={`${P}-dossier-primary-sheet`}>
                      {venueCards(true)}
                    </Sheet>
                    <div className={`${P}-dossier-summary-grid`}>
                      {summary(
                        "relationships",
                        profile
                          ? profile.familiarity
                            ? "Getting acquainted"
                            : "No established familiarity"
                          : relationships
                            ? "No relationship recorded"
                            : "Reading relationships…",
                        profile
                          ? `${profile.warmthLabel || "Warmth"} · ${profile.trustLabel || "Trust"}`
                          : "Your relationship with this villager.",
                      )}
                      {summary(
                        "wishes",
                        profile?.knownWishes?.length
                          ? `${profile.knownWishes.length} shared ${profile.knownWishes.length === 1 ? "wish" : "wishes"}`
                          : "No wishes shared yet",
                        "What you have learned about their hopes.",
                      )}
                      {summary("memories", "Inspect memories", "Private recollections and lasting experiences.", true)}
                      <Sheet title="Related projects" icon="venues">
                        {related}
                      </Sheet>
                    </div>
                    {inspect ? inspectors.overview : null}
                  </>
                ) : section === "relationships" ? (
                  <VillagesRelationships
                    request={request}
                    prefix={P}
                    onVenue={onVenue}
                    characterId={navigation.actorId}
                    inspect={inspect}
                    view={relationships}
                    onView={setRelationships}
                  />
                ) : section === "wishes" ? (
                  inspect ? (
                    inspectors.wishes
                  ) : (
                    <Sheet title="Shared wishes" icon="wishes">
                      <VillagerWishJournal
                        request={request}
                        characterId={navigation.actorId}
                        prefix={P}
                        focusWishId={navigation.wishId}
                        wishes={relationships ? (profile?.knownWishes ?? []) : null}
                        onWishes={(knownWishes) =>
                          setRelationships((current) =>
                            current
                              ? {
                                  ...current,
                                  profiles: current.profiles.map((entry) =>
                                    entry.characterId === navigation.actorId ? { ...entry, knownWishes } : entry,
                                  ),
                                }
                              : current,
                          )
                        }
                      />
                    </Sheet>
                  )
                ) : section === "memories" ? (
                  inspect ? (
                    inspectors.memories
                  ) : (
                    <Sheet title="Memories" icon="memories">
                      <p>
                        Villager memories can include private experiences. Open Inspect to browse this villager’s
                        passing recollections, durable memories, and their recorded evidence.
                      </p>
                      <button type="button" onClick={() => setInspect(true)}>
                        Inspect memories
                      </button>
                    </Sheet>
                  )
                ) : section === "agenda" ? (
                  inspect ? (
                    inspectors.agenda
                  ) : (
                    <Sheet title="Known routine" icon="agenda">
                      {profile?.knownAt ? (
                        <>
                          <p>
                            {profile.friend ? "Current shared information" : "Last known information"} ·{" "}
                            {new Date(profile.knownAt).toLocaleString()}
                          </p>
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
                  )
                ) : (
                  <>
                    <Sheet title="Relevant Venues" icon="venues">
                      {venueCards()}
                    </Sheet>
                    <Sheet title="Related Projects and Venue Requests">{related}</Sheet>
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </section>
    </div>
  );
}
