import { MAX_PHYSICAL_DESIGN_LENGTH } from "../../../shared/helpers/project-design.js";
import { useId, useState } from "react";
import { OpeningProjects } from "./OpeningProjects.js";
import { ProjectZones } from "./ProjectZones.js";
import { ArtworkUpload, ClassChoices, ProjectDrawing, titleCase } from "./ProjectDesign.js";
import { projectStyles } from "./project-styles.js";
import { SpaceConnections } from "../../shared/SpaceConnections.js";
import type { VillageSnapshot, VillageVenue, SceneView } from "../../../shared/contracts/village.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import type { ProjectsController } from "./useProjectsController.js";
import { request, messageFrom } from "../../shared/api.js";
import { readFileAsDataUrl } from "../../shared/presentation.js";

const tabs = ["Overview", "Design", "Zones", "People", "Site", "Progress"] as const;
type Tab = (typeof tabs)[number];
const statuses = ["All", "Planning", "Working", "Paused", "Complete", "Cancelled"] as const;
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
  const [filter, setFilter] = useState<(typeof statuses)[number]>("All");
  const tab = selectedTabs[workspace.key] ?? "Overview";
  const selectTab = (next: Tab) => setTabs((current) => ({ ...current, [workspace.key]: next }));
  const tabId = useId();
  const people = snapshot.villagers.map((person) => ({ id: person.characterId, name: person.name }));
  const person = (id: string) => people.find((person) => person.id === id)?.name ?? id;
  const editable = project?.status === "planning",
    resumable = project?.status === "paused";
  const missing =
    flow?.affectedIds.filter((id) => !flow.approvals.some((approval) => approval.residentId === id)) ?? [];
  const stale = draft.dirty && (!editable || draft.revision !== flow?.revision);
  const otherActive = snapshot.projects.filter((entry) => entry.id !== project?.id && active(entry.status));
  const unavailable = draft.dirty
    ? "Save design before Start."
    : project?.kind === "new-venue" && !project.plan
      ? "Save the design."
      : project?.kind === "new-venue" && project.venueDraft?.position?.x == null
        ? "Choose a map position in Site."
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
    if (next) selectTab("Progress");
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
  const count =
    project?.kind === "new-venue"
      ? (venue?.spaces?.length ?? 0) + (venue?.privateSpaces?.length ?? 0)
      : draft.zones.length;
  return (
    <div className={P + "-project-desk"}>
      <style>{projectStyles}</style>
      <main className={P + "-project-board"} aria-label="Project portfolio">
        <header className="vp-header">
          <div>
            <span className="vp-eyebrow">Villages / Projects</span>
            <h1>{project ? "02 / Project Portfolio" : "01 / Project Portfolio"}</h1>
          </div>
          <div className="vp-actions">
            {project || c.draftType ? (
              <button type="button" className="vp-subtle" onClick={allProjects}>
                ‹ All Projects
              </button>
            ) : null}
            <button type="button" className="vp-subtle" onClick={onMap}>
              Map
            </button>
            <button type="button" className="vp-subtle" onClick={onClose}>
              Close ×
            </button>
          </div>
        </header>
        {!project && !c.draftType ? (
          <>
            <div className="vp-panel-heading">
              <h2>Your Projects</h2>
              <span className="vp-note">
                {snapshot.projects.filter((entry) => active(entry.status)).length} / 2 active
              </span>
            </div>
            <div className="vp-actions">
              <button type="button" className="vp-primary" onClick={() => c.setDraftType("new-venue")}>
                New Venue
              </button>
              <button type="button" onClick={() => c.setDraftType("renovation")}>
                Renovation
              </button>
            </div>
            <nav className="vp-filters" aria-label="Project status">
              {statuses.map((status) => (
                <button type="button" key={status} aria-pressed={filter === status} onClick={() => setFilter(status)}>
                  {status}
                </button>
              ))}
            </nav>
            <nav className="vp-project-list" aria-label="Projects">
              {snapshot.projects
                .filter((entry) => filter === "All" || entry.status === filter.toLowerCase())
                .map((entry, index) => (
                  <button
                    type="button"
                    className="vp-project-row"
                    key={entry.id}
                    onClick={() => c.setSelectedId(entry.id)}
                  >
                    <span className="vp-number">{String(index + 1).padStart(2, "0")}</span>
                    <span>
                      <strong>{entry.title}</strong>
                      <small>
                        {kindName(entry.kind)} · {titleCase(entry.status)}
                      </small>
                      <small>
                        {entry.lifecycle?.builderId
                          ? "Lead · " + person(entry.lifecycle.builderId)
                          : "No lead selected"}
                        {entry.status === "working" && entry.lifecycle?.workOrder
                          ? " · Due " + new Date(entry.lifecycle.workOrder.completesAt).toLocaleString()
                          : ""}
                      </small>
                    </span>
                    <span aria-hidden="true">›</span>
                  </button>
                ))}
            </nav>
            {!snapshot.projects.some((entry) => filter === "All" || entry.status === filter.toLowerCase()) ? (
              <p className="vp-note">No {filter === "All" ? "" : filter.toLowerCase() + " "}Projects.</p>
            ) : null}
            {snapshot.opening && !["complete", "ended"].includes(snapshot.opening.stage) ? (
              <OpeningProjects snapshot={snapshot} busy={draft.busy} decide={c.openingAction} onPeople={onPeople} />
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
              <ProjectDrawing
                caption={c.draftType === "new-venue" ? "A place to begin" : "A new design for an existing place"}
              />
              <section className="vp-panel">
                <h3>{c.draftType === "new-venue" ? "New Venue" : "Renovation"} specification</h3>
                <fieldset disabled={draft.busy}>
                  {c.draftType === "renovation" ? (
                    <>
                      <span className="vp-label">Venue</span>
                      <div className="vp-choices" role="group" aria-label="Venue">
                        {snapshot.settings.venues
                          .filter((venue) => venue.constructionStatus !== "worksite")
                          .map((venue) => (
                            <button
                              type="button"
                              key={venue.id}
                              aria-pressed={c.venueId === venue.id}
                              onClick={() => c.setVenueId(venue.id)}
                            >
                              {venue.name}
                            </button>
                          ))}
                      </div>
                    </>
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
              <h2>{project.title}</h2>
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
                  {name}
                </button>
              ))}
            </div>
            <div role="tabpanel" id={tabId + "panel"} aria-labelledby={tabId + tab}>
              {tab === "Overview" ? (
                <div className="vp-columns">
                  <ProjectDrawing image={venue?.presentation.image} caption={project.title} />
                  <section className="vp-panel">
                    <h3>Project overview</h3>
                    <span className="vp-label">Physical design</span>
                    <p>{intended}</p>
                    <Facts
                      rows={[
                        ["Status", titleCase(project.status)],
                        ["Lead", flow.builderId ? person(flow.builderId) : "Not selected"],
                        ["Design", count + " / 6 Zones"],
                        ["Agreements", missing.length ? missing.map(person).join(", ") : "Ready"],
                      ]}
                    />
                    {flow.blockedReason ? <p role="status">{flow.blockedReason}</p> : null}
                  </section>
                </div>
              ) : null}
              {tab === "Design" && venue ? (
                <div className="vp-columns">
                  <ProjectDrawing image={venue.presentation.image} caption={project.title} />
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
                        ) : (
                          <Facts rows={[["Residence capacity", "Not applicable"]]} />
                        )}
                        {project.kind === "new-venue" ? (
                          <>
                            <label>
                              Entrance
                              <textarea
                                aria-label="Entrance"
                                autoComplete="off"
                                rows={2}
                                maxLength={1000}
                                value={venue.description}
                                onChange={(event) => patchVenue({ ...venue, description: event.target.value })}
                              />
                            </label>
                            <ArtworkUpload busy={draft.busy} onUpload={(file) => void upload(file)} />
                          </>
                        ) : null}
                      </fieldset>
                    ) : (
                      <Facts
                        rows={[
                          ["Classes", (venue.classes ?? []).map(titleCase).join(" · ")],
                          ["Physical design", intended],
                          [
                            "Residence capacity",
                            venue.classes?.includes("residence") ? String(draft.capacity) : "Not applicable",
                          ],
                          ["Entrance", venue.description],
                        ]}
                      />
                    )}
                  </section>
                </div>
              ) : null}
              {tab === "Zones" && venue ? (
                <ProjectZones
                  key={project.id}
                  venue={venue}
                  people={people}
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
              {tab === "People" ? (
                <div className="vp-columns">
                  <section className="vp-panel">
                    <h3>Resident lead</h3>
                    <div className="vp-people" role="group" aria-label="Willing leads">
                      {flow.candidates.map((candidate) => (
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
                    {!flow.candidates.length ? (
                      <>
                        <p className="vp-note">No willing lead yet.</p>
                        <button type="button" onClick={onPeople}>
                          Talk to residents
                        </button>
                      </>
                    ) : null}
                  </section>
                  <section className="vp-panel">
                    <h3>Agreements</h3>
                    {flow.affectedIds.length ? (
                      <ul className="vp-agreements">
                        {flow.affectedIds.map((id) => (
                          <li key={id}>
                            <span>{person(id)}</span>
                            <span>{missing.includes(id) ? "Needed" : "Agreed"}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No additional agreements needed.</p>
                    )}
                    {missing.length && (editable || resumable) ? (
                      <button
                        type="button"
                        disabled={draft.busy || draft.dirty}
                        onClick={() => void c.action("request-approval")}
                      >
                        Request agreement
                      </button>
                    ) : null}
                  </section>
                </div>
              ) : null}
              {tab === "Site" ? (
                <div className="vp-columns">
                  <ProjectDrawing
                    image={project.kind === "renovation" ? c.target?.presentation.image : null}
                    caption={project.kind === "renovation" ? (c.target?.name ?? project.title) : "Map location"}
                  />
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
                          disabled={draft.busy || draft.dirty}
                          onClick={() => onPlaceOnMap(project.id)}
                        >
                          {project.venueDraft?.position?.x == null ? "Choose map position" : "Change map position"}
                        </button>
                      </div>
                    ) : null}
                    {venue ? (
                      <fieldset disabled={!editable || draft.busy}>
                        <SpaceConnections
                          spaces={connections}
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
                      </fieldset>
                    ) : null}
                  </section>
                </div>
              ) : null}
              {tab === "Progress" ? (
                <div className="vp-columns">
                  <section className="vp-panel">
                    <h3>{titleCase(project.status)}</h3>
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
                    {flow.blockedReason ? <p role="status">{flow.blockedReason}</p> : null}
                    <Facts
                      rows={[
                        ["Lead", flow.builderId ? person(flow.builderId) : "Not selected"],
                        ["Result", intended],
                      ]}
                    />
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
                <p role="status">{unavailable || "Lead · " + person(flow.builderId)}</p>
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
