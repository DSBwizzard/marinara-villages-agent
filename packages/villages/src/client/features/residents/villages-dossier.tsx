import { useFocusRevision, useVillageActivity } from "../../shared/activity.js";
import { PeopleBook } from "./PeopleBook.js";
import { PursuitsPanel } from "./PursuitsPanel.js";
import type { ResidentSignature, ResidentSignatureImage } from "../../../shared/helpers/resident-signature.js";
import { VenuePolaroid } from "../exploration/villages-venue-polaroid.js";
import { type RelationshipView, VillagesRelationships } from "./villages-relationships.js";
import { VillagerSignature } from "./villages-signature.js";
import { VillagerWishJournal } from "./villages-wish-journal.js";
import { type ReactNode, useEffect, useRef, useState } from "react";

export type DossierSection = "overview" | "relationships" | "wishes" | "memories" | "agenda" | "venues" | "pursuits";
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
  pursuits: "Pursuits",
};
export type DossierVenue = {
  id: string;
  name: string;
  image?: string;
  connections: string[];
  inspectOnly?: boolean;
};
export type DossierLink = { id: string; title: string; detail: string; onOpen: () => void; playerVisible?: boolean };

export function DossierIcon({ name }: { name: DossierSection | "inspect" }) {
  const paths = {
    pursuits: (
      <>
        <path d="M5 21V3m0 0h13l-3 5 3 5H5" />
      </>
    ),
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
  const { visible, backgroundRevision } = useVillageActivity();
  const focusRevision = useFocusRevision(visible);
  const showingSprites = !!spriteManager;
  const [section, setSection] = useState<DossierSection>(
    navigation.section ?? (navigation.wishId ? "wishes" : "overview"),
  );
  const [inspect, setInspect] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [relationships, setRelationships] = useState<RelationshipView | null>(null);
  const [readError, setReadError] = useState("");
  const [revision, setRevision] = useState(0);
  const content = useRef<HTMLDivElement>(null);
  const [turn, setTurn] = useState({ id: 0, backwards: false });
  const profile = relationships?.profiles?.find((person) => person.characterId === navigation.actorId);
  const name = villager?.name ?? "Former villager";
  useEffect(() => {
    if (!visible || showingSprites) return;
    const controller = new AbortController();
    const refresh = async () => {
      setRelationships(null);
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
    return () => {
      controller.abort();
    };
  }, [request, navigation.actorId, revision, visible, showingSprites, backgroundRevision, focusRevision]);
  useEffect(() => {
    onInspectSection(inspect ? section : null);
    return () => onInspectSection(null);
  }, [inspect, section, onInspectSection]);
  const choose = (next: DossierSection, inspection = inspect) => {
    if (next !== section) {
      const order = [...sections, "pursuits"];
      setTurn((current) => ({ id: current.id + 1, backwards: order.indexOf(next) < order.indexOf(section) }));
    }
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
          ...(inspect ? venue.connections : []),
          ...grants.map((grant) => `${grant.name} · ${grant.active ? "Standing access" : "Access suspended"}`),
        ],
        inspectOnly: venue.inspectOnly && !grants.length,
      };
    })
    .filter((venue) => venue.connections.length && (inspect || !venue.inspectOnly));
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
  // The artwork workspace uses the available screen; the dossier stays mounted for a seamless return.
  if (spriteManager) return <div className={`${P}-root ${P}-sprite-manager-root`}>{spriteManager}</div>;
  return (
    <div className={`${P}-root ${P}-dossier-root`}>
      <PeopleBook
        label={`${name} profile`}
        overview={section === "overview" && !!villager}
        section={section}
        inspect={inspect}
        toolbar={
          <>
            <button type="button" className={`${P}-dossier-back`} onClick={onBack}>
              ← Back to Villagers
            </button>
            {section !== "overview" || !villager ? <h1>{name}</h1> : null}
            <div className={`${P}-dossier-actions`} role="group" aria-label="Profile actions">
              {villager ? (
                <button type="button" aria-pressed={section === "pursuits"} onClick={() => choose("pursuits")}>
                  Pursuits
                </button>
              ) : null}
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
              {personalMail ? (
                <button type="button" onClick={personalMail.onOpen}>
                  Message
                </button>
              ) : null}
              <div className={`${P}-dossier-biography`}>
                {villager?.summary ? <p>{villager.summary}</p> : null}
                {villager?.missing ? (
                  <p className={`${P}-dossier-warning`}>Card missing · saved character remains available.</p>
                ) : null}
              </div>
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
          <nav className={`${P}-dossier-tabs`} aria-label="Villager profile sections">
            <div>
              {sections.map((tab) => (
                <button type="button" key={tab} aria-pressed={section === tab} onClick={() => choose(tab)}>
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
          <div
            ref={content}
            className={`${P}-dossier-content`}
            role="region"
            tabIndex={section === "overview" ? -1 : 0}
            aria-label={`${titles[section]} content`}
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
                {section === "overview" ? (
                  <div className={`${P}-dossier-overview`}>
                    {readError ? null : !relationships ? (
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
                        <Sheet title="Wishes and Pursuits" icon="wishes">
                          {profile?.knownWishes?.length || profile?.knownDevelopment?.length ? (
                            <ul>
                              {profile?.knownWishes?.map((wish) => (
                                <li key={wish.wishId}>
                                  {wish.text}
                                  {wish.status ? ` · ${wish.status}` : ""}
                                </li>
                              ))}
                              {profile?.knownDevelopment?.map((pursuit) => (
                                <li key={pursuit.id}>
                                  {pursuit.title || pursuit.text}
                                  {pursuit.status ? ` · ${pursuit.status}` : ""}
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
                        <Sheet title="Home and work" icon="venues">
                          {profile.knownPlaces?.length ? (
                            <ul>
                              {profile.knownPlaces.map((place, index) => (
                                <li key={index}>
                                  {place.kind === "home" ? "Home" : "Work"} · Shared{" "}
                                  {new Date(place.at).toLocaleDateString()} · {place.text}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>No known home or work location.</p>
                          )}
                        </Sheet>
                      </>
                    )}
                    {inspect ? inspectors.overview : null}
                  </div>
                ) : section === "pursuits" ? (
                  <PursuitsPanel
                    characterId={navigation.actorId}
                    known={relationships ? (profile?.knownDevelopment ?? []) : null}
                    inspect={inspect}
                    request={request}
                  />
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
                  )
                ) : (
                  <>
                    <Sheet title="Relevant Venues" icon="venues">
                      {venueCards()}
                    </Sheet>
                    <Sheet title="Projects and Venue Requests">{related}</Sheet>
                  </>
                )}
              </>
            )}
          </div>
        </main>
        {turn.id > 0 ? (
          <div key={turn.id} className={`${P}-dossier-turn`} data-backwards={turn.backwards} aria-hidden="true" />
        ) : null}
      </PeopleBook>
    </div>
  );
}
