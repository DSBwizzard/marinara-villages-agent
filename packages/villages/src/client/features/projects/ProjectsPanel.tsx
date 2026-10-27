import { useEffect, useId, useRef, useState } from "react";
import type { SceneView, VillageSnapshot, VillageVenue } from "../../../shared/contracts/village.js";
import { MAX_PHYSICAL_DESIGN_LENGTH, MAX_PROJECT_DRAFTS } from "../../../shared/helpers/project-design.js";
import { SpaceConnections } from "../../shared/SpaceConnections.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import { readFileAsDataUrl } from "../../shared/presentation.js";
import { OpeningProjects } from "./OpeningProjects.js";
import { ArtworkUpload, ClassChoices, ProjectDrawing, titleCase } from "./ProjectDesign.js";
import { ProjectZones } from "./ProjectZones.js";
import { projectStyles } from "./project-styles.js";
import type { ProjectsController } from "./useProjectsController.js";

const tabs = ["Overview & Progress", "Design & Spaces", "People", "Location"] as const;
type Tab = (typeof tabs)[number];
const active = (status: string) => status === "working" || status === "paused";
const kindName = (kind: string) => (kind === "new-venue" ? "New Venue" : "Renovation");
function Facts({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="vp-facts">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
export function ProjectsPanel({
  snapshot,
  controller: c,
  onPlaceOnMap,
  onPeople,
  onVenue,
  onMap,
  onClose = onMap,
  room,
  onReturn,
  mobile,
  debugEnabled = false,
}: {
  snapshot: VillageSnapshot;
  controller: ProjectsController;
  onPlaceOnMap(id: string): void;
  onPeople(): void;
  onVenue(id: string): void;
  onMap(): void;
  onClose?(): void;
  debugEnabled?: boolean;
  room: SceneView | null;
  onReturn(): void;
  mobile: boolean;
  siteProjectId: string;
}) {
  const { project, workspace } = c,
    draft = workspace.draft,
    flow = project?.lifecycle,
    venue = draft.venue;
  const [selectedTabs, setTabs] = useState<Record<string, Tab>>({});
  const [selectedZones, setZones] = useState<Record<string, string>>({});
  const [detailPages, setDetailPages] = useState<Record<string, string>>({});
  const [indexView, setIndexView] = useState<"projects" | "history" | "opening">("projects");
  const [mobileSection, setMobileSection] = useState<"drafts" | "slot1" | "slot2">("drafts");
  const [draftPage, setDraftPage] = useState(0);
  const [historyPage, setHistoryPage] = useState(0);
  const [peopleSection, setPeopleSection] = useState<"lead" | "agreements">("lead");
  const [peoplePage, setPeoplePage] = useState(0);
  const boardRef = useRef<HTMLElement>(null);
  const [boardHeight, setBoardHeight] = useState(0);
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const root = board.closest<HTMLElement>("." + P + "-project-root") ?? board;
    const observer = new ResizeObserver(() => setBoardHeight(root.clientHeight));
    observer.observe(root);
    return () => observer.disconnect();
  }, []);
  const tab = selectedTabs[workspace.key] ?? "Overview & Progress";
  const detailKey = workspace.key + ":" + tab;
  const detailPage = detailPages[detailKey] ?? (tab === "Overview & Progress" ? "Overview" : "Design");
  const selectDetailPage = (page: string) => setDetailPages((current) => ({ ...current, [detailKey]: page }));
  const selectTab = (next: Tab) => setTabs((current) => ({ ...current, [workspace.key]: next }));
  const tabId = useId();
  const people = snapshot.villagers.map((person) => ({ id: person.characterId, name: person.name }));
  const person = (id: string) => people.find((person) => person.id === id)?.name ?? id;
  const editable = project?.status === "planning",
    resumable = project?.status === "paused";
  const sceneActive = !!room && room.status !== "closed";
  const placementBlocked = draft.dirty ? "Save design to choose a map position." : "";
  const missing =
    flow?.affectedIds.filter((id) => !flow.approvals.some((approval) => approval.residentId === id)) ?? [];
  const stale = draft.dirty && (!editable || draft.revision !== flow?.revision);
  const otherActive = snapshot.projects.filter((entry) => entry.id !== project?.id && active(entry.status));
  const unavailable = draft.dirty
    ? "Save design before Start."
    : project?.kind === "new-venue" && !project.plan
      ? "Save the design."
      : project?.kind === "new-venue" && project.venueDraft?.position?.x == null
        ? "Choose a map position in Location."
        : !flow?.builderId
          ? "Choose a willing lead in People."
          : missing.length
            ? "Agreement needed · " + missing.map(person).join(", ")
            : otherActive.length >= 2
              ? "Two Projects are already active."
              : otherActive.some((entry) => entry.lifecycle?.builderId === flow.builderId)
                ? "The lead is working on another Project."
                : project?.venueId && otherActive.some((entry) => entry.venueId === project.venueId)
                  ? "This Venue already has active work."
                  : "";
  const allProjects = () => {
    c.setSelectedId("");
    c.setDraftType("");
  };
  const patchVenue = (next: VillageVenue) => workspace.field("venue")(next);
  const upload = async (file: File | undefined, zoneId?: string) => {
    if (!file || !venue) return;
    const attempt = workspace.begin();
    if (!attempt) return;
    try {
      const image = await request<VillageVenue["presentation"]["image"]>("/setup/venue-image", {
        method: "PUT",
        body: JSON.stringify({ name: venue.name, image: await readFileAsDataUrl(file) }),
      });
      if (!attempt.current()) return;
      workspace.field("venue")((previous) =>
        !previous
          ? previous
          : zoneId
            ? {
                ...previous,
                spaces: previous.spaces?.map((zone) => (zone.id === zoneId ? { ...zone, image } : zone)),
                privateSpaces: previous.privateSpaces?.map((zone) => (zone.id === zoneId ? { ...zone, image } : zone)),
              }
            : { ...previous, presentation: { ...previous.presentation, image } },
      );
    } catch (error) {
      if (attempt.current()) workspace.field("error")(messageFrom(error, "The image could not be uploaded."));
    } finally {
      attempt.finish();
    }
  };
  const start = async () => {
    const next = await c.action(resumable ? "resume" : "start");
    if (next) {
      selectTab("Overview & Progress");
      setDetailPages((current) => ({ ...current, [workspace.key + ":Overview & Progress"]: "Progress" }));
    }
  };
  const connections: { id: string; name?: string; kind: string; connectedTo?: string[] }[] = venue
    ? project?.kind === "new-venue"
      ? [
          { id: "exterior", name: "Entrance", kind: "exterior", connectedTo: undefined as string[] | undefined },
          ...(venue.spaces ?? []).map((zone) => ({ ...zone, kind: "public" })),
          ...(venue.privateSpaces ?? []).map((zone) => ({ ...zone, kind: "restricted" })),
        ]
      : [{ id: "exterior", name: "Entrance", kind: "exterior", connectedTo: [] as string[] }, ...draft.zones]
    : [];
  const intended = project?.kind === "new-venue" ? (venue?.form ?? "") : draft.detail;
  const overviewLimit = mobile ? 45 : 300;
  const count =
    project?.kind === "new-venue"
      ? (venue?.spaces?.length ?? 0) + (venue?.privateSpaces?.length ?? 0)
      : draft.zones.length;
  const drafts = snapshot.projects.filter((entry) => entry.status === "planning");
  const activeProjects = snapshot.projects.filter((entry) => active(entry.status));
  const finished = snapshot.projects.filter((entry) => entry.status === "complete" || entry.status === "cancelled");
  const history = [...activeProjects.slice(2), ...finished];
  const pageSize =
    boardHeight && boardHeight < 490 ? 2 : boardHeight && boardHeight < 600 ? 3 : mobile ? 4 : MAX_PROJECT_DRAFTS;
  const detailPageSize = mobile ? (boardHeight && boardHeight < 650 ? 1 : 2) : 4;
  const pages = Math.max(1, Math.ceil(drafts.length / pageSize));
  const currentDraftPage = Math.min(draftPage, pages - 1);
  const historyPages = Math.max(1, Math.ceil(history.length / pageSize));
  const currentHistoryPage = Math.min(historyPage, historyPages - 1);
  const openingAvailable = snapshot.opening && !["complete", "ended"].includes(snapshot.opening.stage);
  return (
    <div className={P + "-project-desk"}>
      <style>{projectStyles}</style>
      <main ref={boardRef} className={P + "-project-board"} aria-label="Projects">
        <header className="vp-header">
          <div>
            <h1>Projects</h1>
          </div>
          <div className="vp-actions">
            {project || c.draftType ? (
              <button type="button" className="vp-subtle" onClick={allProjects}>
                ‹ All Projects
              </button>
            ) : null}
            <button type="button" className="vp-subtle" onClick={onClose}>
              Close ×
            </button>
          </div>
        </header>
        {!project && !c.draftType && indexView === "projects" ? (
          <>
            <div className="vp-index-tools">
              <div className="vp-actions">
                {openingAvailable ? (
                  <button type="button" onClick={() => setIndexView("opening")}>
                    Opening proposals
                  </button>
                ) : null}
                {history.length ? (
                  <button type="button" onClick={() => setIndexView("history")}>
                    History
                  </button>
                ) : null}
              </div>
              <span className="vp-note">{activeProjects.length} / 2 active</span>
            </div>
            <div className="vp-mobile-sections" role="group" aria-label="Project sections">
              {(
                [
                  ["drafts", "Drafts"],
                  ["slot1", "Slot 1"],
                  ["slot2", "Slot 2"],
                ] as const
              ).map(([id, label]) => (
                <button type="button" key={id} aria-pressed={mobileSection === id} onClick={() => setMobileSection(id)}>
                  {label}
                </button>
              ))}
            </div>
            <nav className="vp-workspace" aria-label="Projects" data-mobile-section={mobileSection}>
              <section className="vp-drafts" aria-label="Project drafts">
                <h2>Project Drafts</h2>
                <div className="vp-project-list">
                  {drafts.slice(currentDraftPage * pageSize, currentDraftPage * pageSize + pageSize).map((entry) => (
                    <button
                      type="button"
                      className="vp-project-row"
                      key={entry.id}
                      onClick={() => c.setSelectedId(entry.id)}
                    >
                      <span>{entry.title}</span>
                      <span aria-hidden="true">›</span>
                    </button>
                  ))}
                  {!drafts.length ? <p className="vp-note">No drafts.</p> : null}
                </div>
                <div className="vp-actions vp-draft-create" data-full={activeProjects.length >= 2}>
                  <button
                    type="button"
                    disabled={drafts.length >= MAX_PROJECT_DRAFTS}
                    onClick={() => c.setDraftType("new-venue")}
                  >
                    New Venue
                  </button>
                  <button
                    type="button"
                    disabled={drafts.length >= MAX_PROJECT_DRAFTS}
                    onClick={() => c.setDraftType("renovation")}
                  >
                    Renovation
                  </button>
                </div>
                {drafts.length >= MAX_PROJECT_DRAFTS ? <p className="vp-note">Six drafts maximum.</p> : null}
                {pages > 1 ? (
                  <div className="vp-actions">
                    <button
                      type="button"
                      disabled={currentDraftPage === 0}
                      onClick={() => setDraftPage(currentDraftPage - 1)}
                    >
                      Previous
                    </button>
                    <span>
                      {currentDraftPage + 1} / {pages}
                    </span>
                    <button
                      type="button"
                      disabled={currentDraftPage + 1 === pages}
                      onClick={() => setDraftPage(currentDraftPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </section>
              {[0, 1].map((index) => {
                const entry = activeProjects[index - Math.max(0, 2 - activeProjects.length)];
                const artwork =
                  entry?.kind === "renovation"
                    ? snapshot.settings.venues.find((item) => item.id === entry.venueId)?.presentation.image
                    : entry?.plan?.exteriorImage;
                return (
                  <section className="vp-active-slot" key={index} aria-label={`Project slot ${index + 1}`}>
                    {entry ? (
                      <button type="button" className="vp-active-project" onClick={() => c.setSelectedId(entry.id)}>
                        <strong>{kindName(entry.kind)}</strong>
                        {artwork ? <img src={artwork.url} alt="" /> : null}
                        <span>{entry.title}</span>
                        <small>{titleCase(entry.status)}</small>
                      </button>
                    ) : (
                      <div className="vp-empty-slot">
                        <span>Empty slot</span>
                        {index === 0 ? (
                          <div className="vp-new-types">
                            <button
                              type="button"
                              disabled={drafts.length >= MAX_PROJECT_DRAFTS}
                              onClick={() => c.setDraftType("new-venue")}
                            >
                              New Venue
                            </button>
                            <button
                              type="button"
                              disabled={drafts.length >= MAX_PROJECT_DRAFTS}
                              onClick={() => c.setDraftType("renovation")}
                            >
                              Renovation
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </section>
                );
              })}
            </nav>
          </>
        ) : null}
        {!project && !c.draftType && indexView !== "projects" ? (
          <>
            <button type="button" onClick={() => setIndexView("projects")}>
              ‹ Projects
            </button>
            {indexView === "opening" && openingAvailable ? (
              <OpeningProjects
                snapshot={snapshot}
                busy={draft.busy}
                decide={c.openingAction}
                onPeople={onPeople}
                pageSize={mobile ? 2 : 4}
              />
            ) : null}
            {indexView === "history" ? (
              <section className="vp-panel">
                <h2>History</h2>
                <nav aria-label="Project history" className="vp-project-list">
                  {history
                    .slice(currentHistoryPage * pageSize, currentHistoryPage * pageSize + pageSize)
                    .map((entry) => (
                      <button
                        className="vp-project-row"
                        type="button"
                        key={entry.id}
                        onClick={() => c.setSelectedId(entry.id)}
                      >
                        <span>
                          {entry.title} · {titleCase(entry.status)}
                        </span>
                        <span aria-hidden="true">›</span>
                      </button>
                    ))}
                </nav>
                {historyPages > 1 ? (
                  <div className="vp-actions">
                    <button
                      type="button"
                      disabled={currentHistoryPage === 0}
                      onClick={() => setHistoryPage(currentHistoryPage - 1)}
                    >
                      Previous
                    </button>
                    <span>
                      {currentHistoryPage + 1} / {historyPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentHistoryPage + 1 === historyPages}
                      onClick={() => setHistoryPage(currentHistoryPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </section>
            ) : null}
          </>
        ) : null}
        {c.draftType ? (
          <form
            autoComplete="off"
            onSubmit={(event) => {
              event.preventDefault();
              void c.create();
            }}
          >
            <div className="vp-project-heading">
              <h2>{kindName(c.draftType)}</h2>
              <span>Planning</span>
            </div>
            <div className="vp-columns">
              <section className="vp-panel">
                <h3>{c.draftType === "new-venue" ? "New Venue" : "Renovation"} specification</h3>
                <fieldset disabled={draft.busy}>
                  {c.draftType === "renovation" ? (
                    <label>
                      Venue
                      <select value={c.venueId} onChange={(event) => c.setVenueId(event.target.value)}>
                        <option value="">Choose a Venue</option>
                        {snapshot.settings.venues
                          .filter((venue) => venue.constructionStatus !== "worksite")
                          .map((venue) => (
                            <option key={venue.id} value={venue.id}>
                              {venue.name}
                            </option>
                          ))}
                      </select>
                    </label>
                  ) : null}
                  <label>
                    Name
                    <input
                      autoComplete="off"
                      value={c.name}
                      required
                      maxLength={100}
                      onChange={(event) => c.setName(event.target.value)}
                    />
                  </label>
                  <label>
                    Physical design
                    <textarea
                      aria-label="Physical design"
                      autoComplete="off"
                      value={c.description}
                      required
                      rows={3}
                      maxLength={MAX_PHYSICAL_DESIGN_LENGTH}
                      onChange={(event) => c.setDescription(event.target.value)}
                    />
                  </label>
                  {c.draftType === "new-venue" ? (
                    <>
                      <span className="vp-label">Classes · up to two</span>
                      <ClassChoices value={c.classes} onChange={c.setClasses} />
                    </>
                  ) : null}
                  <button className="vp-primary" disabled={draft.busy || (c.draftType === "renovation" && !c.venueId)}>
                    Create draft
                  </button>
                </fieldset>
              </section>
            </div>
          </form>
        ) : null}
        {project && flow ? (
          <article>
            <div className="vp-project-heading">
              <h2 title={project.title}>{project.title}</h2>
              <span>
                {kindName(project.kind)} · {titleCase(project.status)}
              </span>
            </div>
            {stale ? (
              <div className="vp-error" role="status">
                <p>This Project changed. Discard local edits to load the current design.</p>
                <button type="button" disabled={draft.busy} onClick={workspace.discard}>
                  Discard edits
                </button>
              </div>
            ) : null}
            <div className="vp-tabs" role="tablist" aria-label="Project sections">
              {tabs.map((name, index) => (
                <button
                  type="button"
                  role="tab"
                  key={name}
                  aria-label={name}
                  id={tabId + name}
                  aria-selected={tab === name}
                  aria-controls={tabId + "panel"}
                  tabIndex={tab === name ? 0 : -1}
                  onClick={() => selectTab(name)}
                  onKeyDown={(event) => {
                    const next =
                      event.key === "ArrowRight"
                        ? (index + 1) % tabs.length
                        : event.key === "ArrowLeft"
                          ? (index + tabs.length - 1) % tabs.length
                          : event.key === "Home"
                            ? 0
                            : event.key === "End"
                              ? tabs.length - 1
                              : -1;
                    if (next < 0) return;
                    event.preventDefault();
                    selectTab(tabs[next]);
                    document.getElementById(tabId + tabs[next])?.focus();
                  }}
                >
                  {mobile && name === "Overview & Progress"
                    ? "Overview"
                    : mobile && name === "Design & Spaces"
                      ? "Design"
                      : name}
                </button>
              ))}
            </div>
            <div role="tabpanel" id={tabId + "panel"} aria-labelledby={tabId + tab}>
              {tab === "Overview & Progress" || tab === "Design & Spaces" ? (
                <div className="vp-detail-pages" role="group" aria-label={tab + " pages"}>
                  {(tab === "Overview & Progress"
                    ? ["Overview", "Progress", ...(mobile && venue?.presentation.image ? ["Artwork"] : [])]
                    : ["Design", "Zones", "Connections"]
                  ).map((page) => (
                    <button
                      type="button"
                      key={page}
                      aria-pressed={detailPage === page}
                      onClick={() => selectDetailPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              ) : null}
              {tab === "Overview & Progress" && detailPage === "Overview" ? (
                <div className="vp-columns">
                  {!mobile ? <ProjectDrawing image={venue?.presentation.image} caption={project.title} /> : null}
                  <section className="vp-panel">
                    <h3>Project overview</h3>
                    <div className="vp-panel-heading">
                      <span className="vp-label">Physical design</span>
                      {intended.length > overviewLimit ? (
                        <button
                          type="button"
                          onClick={() => {
                            selectTab("Design & Spaces");
                            setDetailPages((current) => ({
                              ...current,
                              [workspace.key + ":Design & Spaces"]: "Design",
                            }));
                          }}
                        >
                          Full design
                        </button>
                      ) : null}
                    </div>
                    <p>
                      {intended.length > overviewLimit ? intended.slice(0, overviewLimit).trimEnd() + "…" : intended}
                    </p>
                    <Facts
                      rows={[
                        ["Lead", flow.builderId ? person(flow.builderId) : "Not selected"],
                        ["Design", count + " / 6 Zones"],
                        ["Agreements", missing.length ? missing.map(person).join(", ") : "Ready"],
                      ]}
                    />
                    {flow.blockedReason ? <p role="status">{flow.blockedReason}</p> : null}
                  </section>
                </div>
              ) : null}
              {tab === "Overview & Progress" && detailPage === "Artwork" && venue?.presentation.image ? (
                <ProjectDrawing image={venue.presentation.image} caption={project.title} />
              ) : null}
              {tab === "Design & Spaces" && detailPage === "Design" && venue ? (
                <div className="vp-columns">
                  {!mobile ? <ProjectDrawing image={venue.presentation.image} caption={project.title} /> : null}
                  <section className="vp-panel">
                    <h3>Design specification</h3>
                    {editable ? (
                      <fieldset disabled={draft.busy}>
                        {project.kind === "renovation" ? (
                          <>
                            <label>
                              Name
                              <input
                                autoComplete="off"
                                value={draft.title}
                                maxLength={100}
                                onChange={(event) => workspace.field("title")(event.target.value)}
                              />
                            </label>
                          </>
                        ) : null}
                        <span className="vp-label">Classes · up to two</span>
                        <ClassChoices
                          value={venue.classes ?? []}
                          onChange={(classes) => patchVenue({ ...venue, classes })}
                        />
                        <label>
                          Physical design
                          <textarea
                            autoComplete="off"
                            aria-label="Physical design"
                            rows={4}
                            maxLength={MAX_PHYSICAL_DESIGN_LENGTH}
                            value={intended}
                            onChange={(event) =>
                              project.kind === "new-venue"
                                ? patchVenue({ ...venue, form: event.target.value })
                                : workspace.field("detail")(event.target.value)
                            }
                          />
                        </label>
                        {venue.classes?.includes("residence") ? (
                          <label className="vp-capacity">
                            Residence capacity
                            <input
                              autoComplete="off"
                              type="number"
                              min={1}
                              max={4}
                              value={draft.capacity}
                              onChange={(event) => workspace.field("capacity")(Number(event.target.value))}
                            />
                          </label>
                        ) : null}
                        {project.kind === "new-venue" ? (
                          <ArtworkUpload busy={draft.busy} onUpload={(file) => void upload(file)} />
                        ) : null}
                      </fieldset>
                    ) : (
                      <>
                        <Facts rows={[["Classes", (venue.classes ?? []).map(titleCase).join(" · ")]]} />
                        <label>
                          Physical design
                          <textarea autoComplete="off" aria-label="Physical design" readOnly value={intended} />
                        </label>
                        {venue.classes?.includes("residence") ? (
                          <Facts rows={[["Residence capacity", String(draft.capacity)]]} />
                        ) : null}
                      </>
                    )}
                  </section>
                </div>
              ) : null}
              {tab === "Design & Spaces" && detailPage === "Zones" && venue ? (
                <ProjectZones
                  key={project.id}
                  venue={venue}
                  people={people}
                  mobile={mobile}
                  pageSize={detailPageSize}
                  selectedId={selectedZones[workspace.key] ?? "exterior"}
                  onSelect={(id) => setZones((current) => ({ ...current, [workspace.key]: id }))}
                  zones={draft.zones}
                  renovation={project.kind === "renovation"}
                  editable={editable}
                  busy={draft.busy}
                  onVenue={patchVenue}
                  onZones={workspace.field("zones")}
                  onUpload={(file, id) => void upload(file, id)}
                />
              ) : null}
              {tab === "Design & Spaces" && detailPage === "Connections" && venue ? (
                <section className="vp-panel">
                  <SpaceConnections
                    spaces={connections}
                    disabled={!editable || draft.busy}
                    pageSize={detailPageSize}
                    compact={mobile}
                    editableIds={project.kind === "renovation" ? draft.zones.map((zone) => zone.id) : undefined}
                    onChange={(rows) =>
                      project.kind === "renovation"
                        ? workspace.field("zones")(
                            draft.zones.map((zone) => ({
                              ...zone,
                              connectedTo: rows.find((row) => row.id === zone.id)?.connectedTo,
                            })),
                          )
                        : patchVenue({
                            ...venue,
                            spaces: venue.spaces?.map((zone) => ({
                              ...zone,
                              connectedTo: rows.find((row) => row.id === zone.id)?.connectedTo,
                            })),
                            privateSpaces: venue.privateSpaces?.map((zone) => ({
                              ...zone,
                              connectedTo: rows.find((row) => row.id === zone.id)?.connectedTo,
                            })),
                          })
                    }
                  />
                </section>
              ) : null}
              {tab === "People" ? (
                <>
                  <div className="vp-detail-pages" role="group" aria-label="People pages">
                    <button
                      type="button"
                      aria-pressed={peopleSection === "lead"}
                      onClick={() => {
                        setPeopleSection("lead");
                        setPeoplePage(0);
                      }}
                    >
                      Lead
                    </button>
                    <button
                      type="button"
                      aria-pressed={peopleSection === "agreements"}
                      onClick={() => {
                        setPeopleSection("agreements");
                        setPeoplePage(0);
                      }}
                    >
                      Agreements
                    </button>
                  </div>
                  <div className="vp-columns">
                    {peopleSection === "lead" ? (
                      <section className="vp-panel">
                        <h3>Resident lead</h3>
                        <div className="vp-people" role="group" aria-label="Willing leads">
                          {flow.candidates
                            .slice(peoplePage * detailPageSize, peoplePage * detailPageSize + detailPageSize)
                            .map((candidate) => (
                              <button
                                type="button"
                                className="vp-person"
                                key={candidate.residentId}
                                aria-pressed={flow.builderId === candidate.residentId}
                                disabled={draft.busy || !(editable || resumable)}
                                onClick={() => void c.action("builder", { residentId: candidate.residentId })}
                              >
                                <span className="vp-number">{person(candidate.residentId).charAt(0)}</span>
                                <span>
                                  <strong>{person(candidate.residentId)}</strong>
                                  <small>
                                    {flow.builderId === candidate.residentId ? "Selected lead" : "Willing to lead"}
                                  </small>
                                </span>
                                <span aria-hidden="true">{flow.builderId === candidate.residentId ? "✓" : "›"}</span>
                              </button>
                            ))}
                        </div>
                        {flow.candidates.length > detailPageSize ? (
                          <div className="vp-actions">
                            <button
                              type="button"
                              disabled={peoplePage === 0}
                              onClick={() => setPeoplePage(peoplePage - 1)}
                            >
                              Previous
                            </button>
                            <span>
                              {peoplePage + 1} / {Math.ceil(flow.candidates.length / detailPageSize)}
                            </span>
                            <button
                              type="button"
                              disabled={(peoplePage + 1) * detailPageSize >= flow.candidates.length}
                              onClick={() => setPeoplePage(peoplePage + 1)}
                            >
                              Next
                            </button>
                          </div>
                        ) : null}
                        {!flow.candidates.length ? (
                          <>
                            <p className="vp-note">No willing lead yet.</p>
                            <button type="button" onClick={onPeople}>
                              Talk to residents
                            </button>
                          </>
                        ) : null}
                      </section>
                    ) : null}
                    {peopleSection === "agreements" ? (
                      <section className="vp-panel">
                        <h3>Agreements</h3>
                        {flow.affectedIds.length ? (
                          <ul className="vp-agreements">
                            {flow.affectedIds
                              .slice(peoplePage * detailPageSize, peoplePage * detailPageSize + detailPageSize)
                              .map((id) => (
                                <li key={id}>
                                  <span>{person(id)}</span>
                                  <span>{missing.includes(id) ? "Needed" : "Agreed"}</span>
                                </li>
                              ))}
                          </ul>
                        ) : (
                          <p>No additional agreements needed.</p>
                        )}
                        {flow.affectedIds.length > detailPageSize ? (
                          <div className="vp-actions">
                            <button
                              type="button"
                              disabled={peoplePage === 0}
                              onClick={() => setPeoplePage(peoplePage - 1)}
                            >
                              Previous
                            </button>
                            <span>
                              {peoplePage + 1} / {Math.ceil(flow.affectedIds.length / detailPageSize)}
                            </span>
                            <button
                              type="button"
                              disabled={(peoplePage + 1) * detailPageSize >= flow.affectedIds.length}
                              onClick={() => setPeoplePage(peoplePage + 1)}
                            >
                              Next
                            </button>
                          </div>
                        ) : null}
                      </section>
                    ) : null}
                  </div>
                </>
              ) : null}
              {tab === "Location" ? (
                <div className="vp-columns">
                  {!mobile ? (
                    <ProjectDrawing
                      image={project.kind === "renovation" ? c.target?.presentation.image : null}
                      caption={project.kind === "renovation" ? (c.target?.name ?? project.title) : "Map location"}
                    />
                  ) : null}
                  <section className="vp-panel">
                    <h3>Project site</h3>
                    <Facts
                      rows={[
                        ["Venue", project.kind === "renovation" ? (c.target?.name ?? project.venueId) : project.title],
                        [
                          "Location",
                          project.kind === "renovation"
                            ? "Existing Venue"
                            : project.venueDraft?.position?.x == null
                              ? "Not placed"
                              : "Marked on the village map",
                        ],
                      ]}
                    />
                    {project.kind === "new-venue" && editable ? (
                      <div className="vp-actions">
                        <button
                          type="button"
                          disabled={draft.busy || !!placementBlocked}
                          aria-describedby={placementBlocked ? tabId + "-placement-blocked" : undefined}
                          onClick={() => onPlaceOnMap(project.id)}
                        >
                          {project.venueDraft?.position?.x == null ? "Choose map position" : "Change map position"}
                        </button>
                        {sceneActive ? (
                          <button type="button" onClick={onReturn}>
                            Return to Scene
                          </button>
                        ) : null}
                        {placementBlocked ? <p id={tabId + "-placement-blocked"}>{placementBlocked}</p> : null}
                      </div>
                    ) : null}
                  </section>
                </div>
              ) : null}
              {tab === "Overview & Progress" && detailPage === "Progress" ? (
                <div className="vp-columns">
                  <section className="vp-panel">
                    <h3>Progress</h3>
                    {project.status === "working" && flow.workOrder ? (
                      <>
                        <span className="vp-label">Completes</span>
                        <time className="vp-deadline" dateTime={flow.workOrder.completesAt}>
                          {new Date(flow.workOrder.completesAt).toLocaleString()}
                        </time>
                      </>
                    ) : null}
                    {resumable && flow.workOrder ? (
                      <p>{Math.ceil(flow.workOrder.remainingMs / 60_000)} minutes remaining</p>
                    ) : null}
                    {editable ? <p>24 hours from Start.</p> : null}
                  </section>
                  <section className="vp-panel">
                    <h3>Project actions</h3>
                    <div className="vp-actions">
                      {debugEnabled && project.status === "working" ? (
                        <button type="button" disabled={draft.busy} onClick={() => void c.action("debug-complete")}>
                          Complete · Debug
                        </button>
                      ) : null}
                      {project.status === "complete" ? (
                        <button type="button" className="vp-primary" onClick={() => onVenue(project.venueId)}>
                          Visit Venue
                        </button>
                      ) : null}
                      {!["complete", "cancelled"].includes(project.status) ? (
                        <button
                          type="button"
                          className="vp-subtle"
                          disabled={draft.busy}
                          onClick={() => void c.action("cancel")}
                        >
                          Cancel Project
                        </button>
                      ) : null}
                      {project.status === "cancelled" ? <p>No active work.</p> : null}
                    </div>
                  </section>
                </div>
              ) : null}
            </div>
            {editable || resumable ? (
              <footer className="vp-footer">
                {unavailable ? <p role="status">{unavailable}</p> : null}
                <div className="vp-actions">
                  {editable ? (
                    <button type="button" disabled={draft.busy || stale} onClick={() => void c.save()}>
                      Save design
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="vp-primary"
                    disabled={draft.busy || !!unavailable}
                    onClick={() => void start()}
                  >
                    {resumable ? "Resume" : "Start · 24 hours"}
                  </button>
                </div>
              </footer>
            ) : null}
          </article>
        ) : null}
        {draft.error ? (
          <p className="vp-error" role="alert">
            {draft.error}
          </p>
        ) : null}
      </main>
    </div>
  );
}
