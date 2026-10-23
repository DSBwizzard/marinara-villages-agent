import { OpeningProjects, openingProjectsStyles } from "./OpeningProjects.js";
import { VenueLayoutFields, BaseZoneFields } from "../founding/villages-founding-editor.js";
import { FoundingZoneFields } from "../founding/villages-founding-zones.js";
import type { VillageSnapshot, VillageVenue, SceneView, VenueClass } from "../../../shared/contracts/village.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import type { ProjectsController } from "./useProjectsController.js";
import { request, messageFrom } from "../../shared/api.js";
import { readFileAsDataUrl } from "../../shared/presentation.js";

const classes: VenueClass[] = ["residence", "workplace", "community", "other"];
function ClassChoices({ value, onChange }: { value: VenueClass[]; onChange(value: VenueClass[]): void }) {
  return (
    <fieldset>
      <legend>Classes</legend>
      {classes.map((role) => (
        <label key={role}>
          <input
            autoComplete="off"
            type="checkbox"
            checked={value.includes(role)}
            disabled={!value.includes(role) && value.length >= 2}
            onChange={(event) =>
              onChange(event.target.checked ? [...value, role] : value.filter((item) => item !== role))
            }
          />
          {role}
        </label>
      ))}
    </fieldset>
  );
}
export function ProjectsPanel({
  snapshot,
  controller: c,
  onPlaceOnMap,
  onPeople,
  onVenue,
  onMap,
  debugEnabled = false,
}: {
  snapshot: VillageSnapshot;
  controller: ProjectsController;
  onPlaceOnMap(id: string): void;
  onPeople(): void;
  onVenue(id: string): void;
  onMap(): void;
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
  const people = snapshot.villagers.map((person) => ({ id: person.characterId, name: person.name }));
  const person = (id: string) => people.find((person) => person.id === id)?.name ?? id;
  const editable = project?.status === "planning";
  const missing =
    flow?.affectedIds.filter((id) => !flow.approvals.some((approval) => approval.residentId === id)) ?? [];
  const patchVenue = (venue: VillageVenue) => workspace.field("venue")(venue);
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
  const imageFields = (_area: string, image: VillageVenue["presentation"]["image"], zoneId?: string) => (
    <label>
      Image
      {image ? <img src={image.url} alt="" style={{ maxWidth: "100%", maxHeight: "12rem" }} /> : null}
      <input
        autoComplete="off"
        type="file"
        accept="image/*"
        disabled={draft.busy}
        onChange={(event) => void upload(event.target.files?.[0], zoneId)}
      />
    </label>
  );
  return (
    <section className={P + "-project-screen"}>
      <style>{projectStyles}</style>
      <header>
        <h2>Projects</h2>
        <button onClick={onMap}>Map</button>
      </header>
      {snapshot.opening && !["complete", "ended"].includes(snapshot.opening.stage) ? (
        <OpeningProjects snapshot={snapshot} busy={draft.busy} decide={c.openingAction} onPeople={onPeople} />
      ) : null}
      <div className={P + "-project-actions"}>
        <button
          onClick={() => {
            c.setSelectedId("");
            c.setDraftType("new-venue");
          }}
        >
          New Venue
        </button>
        <button
          onClick={() => {
            c.setSelectedId("");
            c.setDraftType("renovation");
          }}
        >
          Renovation
        </button>
      </div>
      <div className={P + "-projects-workspace"}>
        <nav aria-label="Projects">
          {snapshot.projects.map((entry) => (
            <button
              key={entry.id}
              aria-pressed={entry.id === project?.id}
              onClick={() => {
                c.setDraftType("");
                c.setSelectedId(entry.id);
              }}
            >
              <strong>{entry.title}</strong>
              <span>{entry.status[0].toUpperCase() + entry.status.slice(1)}</span>
            </button>
          ))}
        </nav>
        <main>
          {c.draftType ? (
            <form
              className={P + "-project-card"}
              autoComplete="off"
              onSubmit={(event) => {
                event.preventDefault();
                void c.create();
              }}
            >
              <h3>{c.draftType === "new-venue" ? "New Venue" : "Renovation"}</h3>
              {c.draftType === "renovation" ? (
                <label>
                  Venue
                  <select value={c.venueId} onChange={(event) => c.setVenueId(event.target.value)}>
                    <option value="">Choose Venue</option>
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
                Physical result
                <textarea
                  aria-label="Physical result"
                  autoComplete="off"
                  value={c.description}
                  required
                  maxLength={2000}
                  onChange={(event) => c.setDescription(event.target.value)}
                />
              </label>
              {c.draftType === "new-venue" ? <ClassChoices value={c.classes} onChange={c.setClasses} /> : null}
              <button disabled={draft.busy || (c.draftType === "renovation" && !c.venueId)}>Create draft</button>
            </form>
          ) : null}
          {project && flow ? (
            <article className={P + "-project-card"}>
              <h3>{project.title}</h3>
              <p>{project.status[0].toUpperCase() + project.status.slice(1)}</p>
              <p>{flow.change?.detail ?? project.venueDraft?.description}</p>
              {draft.dirty && editable ? <p role="status">Save design before Start.</p> : null}
              {flow.blockedReason ? <p role="status">{flow.blockedReason}</p> : null}
              {editable && venue ? (
                <fieldset disabled={draft.busy}>
                  <legend>Design</legend>
                  <ClassChoices
                    value={venue.classes ?? []}
                    onChange={(value) => patchVenue({ ...venue, classes: value })}
                  />
                  <label>
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
                  {project.kind === "new-venue" ? (
                    <>
                      <label>
                        Physical form
                        <input
                          autoComplete="off"
                          value={venue.form ?? ""}
                          onChange={(event) => patchVenue({ ...venue, form: event.target.value })}
                        />
                      </label>
                      <label>
                        Entrance
                        <textarea
                          autoComplete="off"
                          aria-label="Entrance"
                          value={venue.description}
                          onChange={(event) => patchVenue({ ...venue, description: event.target.value })}
                        />
                      </label>
                      {imageFields("exterior", venue.presentation.image)}
                      <VenueLayoutFields venue={venue} onChange={patchVenue} />
                      <FoundingZoneFields
                        venue={venue}
                        people={people}
                        busy={draft.busy}
                        onPatch={patchVenue}
                        editAccess={false}
                        imageFields={imageFields}
                      />
                    </>
                  ) : (
                    <>
                      <label>
                        Name
                        <input
                          autoComplete="off"
                          value={draft.title}
                          onChange={(event) => workspace.field("title")(event.target.value)}
                        />
                      </label>
                      <label>
                        Physical result
                        <textarea
                          autoComplete="off"
                          aria-label="Physical result"
                          value={draft.detail}
                          onChange={(event) => workspace.field("detail")(event.target.value)}
                        />
                      </label>
                      <BaseZoneFields
                        venue={venue}
                        people={people}
                        zones={draft.zones}
                        onChange={workspace.field("zones")}
                      />
                    </>
                  )}
                  <button type="button" onClick={() => void c.save()}>
                    Save design
                  </button>
                </fieldset>
              ) : null}
              {project.kind === "new-venue" && editable ? (
                <button disabled={draft.busy} onClick={() => onPlaceOnMap(project.id)}>
                  {project.venueDraft?.position?.x == null ? "Choose map position" : "Change map position"}
                </button>
              ) : null}
              <p>Lead · {flow.builderId ? person(flow.builderId) : "Choose a willing resident"}</p>
              {["planning", "paused"].includes(project.status) ? (
                <>
                  <label>
                    Willing leads
                    <select
                      value={flow.builderId}
                      disabled={draft.busy}
                      onChange={(event) => void c.action("builder", { residentId: event.target.value })}
                    >
                      <option value="">Choose lead</option>
                      {flow.candidates.map((candidate) => (
                        <option key={candidate.residentId} value={candidate.residentId}>
                          {person(candidate.residentId)}
                        </option>
                      ))}
                    </select>
                  </label>
                  {missing.length ? (
                    <>
                      <p>Agreement needed · {missing.map(person).join(", ")}</p>
                      <button disabled={draft.busy} onClick={() => void c.action("request-approval")}>
                        Request agreement
                      </button>
                    </>
                  ) : (
                    <p>Necessary agreements ready</p>
                  )}
                  {!flow.candidates.length ? <button onClick={onPeople}>Talk to residents</button> : null}
                  <button
                    disabled={
                      draft.busy ||
                      draft.dirty ||
                      !flow.builderId ||
                      !!missing.length ||
                      (project.kind === "new-venue" && (!project.plan || project.venueDraft?.position?.x == null))
                    }
                    onClick={() => void c.action(project.status === "paused" ? "resume" : "start")}
                  >
                    {project.status === "paused" ? "Resume" : "Start · 24 hours"}
                  </button>
                </>
              ) : null}
              {flow.workOrder && project.status === "working" ? (
                <p>
                  Completes{" "}
                  <time dateTime={flow.workOrder.completesAt}>
                    {new Date(flow.workOrder.completesAt).toLocaleString()}
                  </time>
                </p>
              ) : null}
              {project.status === "paused" && flow.workOrder ? (
                <p>{Math.ceil(flow.workOrder.remainingMs / 60_000)} minutes remaining</p>
              ) : null}
              {debugEnabled && project.status === "working" ? (
                <button disabled={draft.busy} onClick={() => void c.action("debug-complete")}>
                  Complete · Debug
                </button>
              ) : null}
              {project.status === "complete" ? (
                <button onClick={() => onVenue(project.venueId)}>Visit Venue</button>
              ) : null}
              {!["complete", "cancelled"].includes(project.status) ? (
                <button disabled={draft.busy} onClick={() => void c.action("cancel")}>
                  Cancel Project
                </button>
              ) : null}
            </article>
          ) : null}
          {draft.error ? <p role="alert">{draft.error}</p> : null}
        </main>
      </div>
    </section>
  );
}
const projectStyles =
  openingProjectsStyles +
  `
.${P}-project-screen{max-width:72rem;margin:auto;padding:1rem}
.${P}-project-screen header,.${P}-project-actions{display:flex;gap:.75rem;align-items:center;flex-wrap:wrap;margin-bottom:1rem}
.${P}-projects-workspace{display:grid;grid-template-columns:minmax(11rem,16rem) minmax(0,1fr);gap:1rem}
.${P}-projects-workspace nav{display:flex;flex-direction:column;gap:.5rem}
.${P}-projects-workspace nav button{display:flex;justify-content:space-between;gap:.75rem;text-align:left}
.${P}-projects-workspace main{min-width:0}
.${P}-project-screen label{display:flex;flex-direction:column;gap:.3rem;margin:.6rem 0}
.${P}-project-screen fieldset{min-width:0;margin:.75rem 0}
.${P}-project-screen input,.${P}-project-screen select,.${P}-project-screen textarea{max-width:100%;box-sizing:border-box}
.${P}-project-screen button{min-height:44px;overflow-wrap:anywhere}
@media(max-width:700px){.${P}-projects-workspace{grid-template-columns:minmax(0,1fr)}.${P}-projects-workspace nav{flex-direction:row;overflow-x:auto}.${P}-projects-workspace nav button{min-width:10rem}}
`;
