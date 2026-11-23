import { useLayoutEffect, useRef, useState } from "react";
import type { VillageSnapshot, BuildProject } from "../../../shared/contracts/village.js";
import type { UndertakingPlan } from "../../../shared/contracts/projects.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import { StorybookHeading } from "../../shared/StorybookHeading.js";
import { useDeskLeaveGuard } from "../../shared/DeskWorkspace.js";
import { useConfirmation } from "../../shared/confirmation.js";
import { ProjectDrawing } from "./ProjectDesign.js";
import { projectStyles } from "./project-styles.js";
import type { ProjectsController } from "./useProjectsController.js";

type Props = {
  snapshot: VillageSnapshot;
  controller: ProjectsController;
  onVenue(id: string): void;
  onPeople(): void;
  beforeLeave?: { current: (() => Promise<boolean>) | null };
};
const statusName = {
  planning: "Planning",
  working: "Together",
  paused: "Paused",
  complete: "Complete",
  cancelled: "Set aside",
};
export function UndertakingPanel(props: Props) {
  const { snapshot, controller: c } = props;
  const selected = c.project?.kind === "undertaking" ? c.project : undefined;
  const [history, setHistory] = useState(false);
  const leave = useRef<(() => Promise<boolean>) | null>(null);
  const all = snapshot.projects.filter((project) => project.kind === "undertaking");
  const projects = all.filter((project) =>
    history ? ["complete", "cancelled"].includes(project.status) : !["complete", "cancelled"].includes(project.status),
  );
  const name = (id: string) =>
    snapshot.villagers.find((person) => person.characterId === id)?.name ?? selected?.actorNames?.[id] ?? id;
  const reset = async () => {
    if (leave.current && !(await leave.current())) return;
    c.setSelectedId("");
    c.setDraftType("");
  };
  return (
    <div className={`${P}-project-desk`}>
      <style>{projectStyles}</style>
      <main className={`${P}-project-board`} aria-label="Projects">
        <header className="vp-header">
          <StorybookHeading>Projects</StorybookHeading>
          <div className="vp-actions">
            {selected || c.draftType === "undertaking" ? (
              <button className="vp-subtle" onClick={reset}>
                ‹ All Projects
              </button>
            ) : (
              <>
                <button aria-pressed={history} onClick={() => setHistory(!history)}>
                  {history ? "Current Projects" : "History"}
                </button>
                <button onClick={() => c.setDraftType("undertaking")}>New Project</button>
              </>
            )}
          </div>
        </header>
        {selected ? (
          <UndertakingDetails key={selected.id} {...props} beforeLeave={leave} project={selected} name={name} />
        ) : c.draftType === "undertaking" ? (
          <UndertakingForm key="new" {...props} beforeLeave={leave} />
        ) : (
          <nav aria-label="Projects">
            <div className="vp-project-list">
              {projects.map((project) => {
                const next = project.undertaking?.plan.milestones[project.undertaking.completed.length];
                return (
                  <section className="vp-panel" key={project.id}>
                    <div className="vp-project-heading">
                      <h2>{project.title}</h2>
                      <span>{statusName[project.status]}</span>
                    </div>
                    <p>{project.undertaking?.plan.goal}</p>
                    {next ? <p className="vp-note">Next · {next.title}</p> : null}
                    <div className="vp-actions">
                      <button onClick={() => c.setSelectedId(project.id)}>Open Project</button>
                      <button onClick={() => props.onVenue(project.venueId)}>View Venue</button>
                    </div>
                  </section>
                );
              })}
            </div>
            {!projects.length ? <p>{history ? "No finished Projects." : "No shared plans yet."}</p> : null}
            <details open={all.length === 0} style={{ marginTop: "1rem" }}>
              <summary>Physical work</summary>
              <div className="vp-actions" style={{ marginBlock: ".75rem" }}>
                <button onClick={() => c.setDraftType("new-venue")}>New Venue</button>
                <button onClick={() => c.setDraftType("renovation")}>Renovation</button>
              </div>
              <div className="vp-project-list">
                {snapshot.projects
                  .filter(
                    (project) =>
                      project.kind !== "undertaking" &&
                      !all.some(
                        (parent) =>
                          parent.status !== "cancelled" && parent.undertaking?.plan.constructionId === project.id,
                      ),
                  )
                  .map((project) => (
                    <button key={project.id} aria-label={project.title} onClick={() => c.setSelectedId(project.id)}>
                      {project.title} · {statusName[project.status]}
                    </button>
                  ))}
              </div>
            </details>
          </nav>
        )}
        {c.workspace.draft.error ? (
          <p role="alert" className="vp-error">
            {c.workspace.draft.error}
          </p>
        ) : null}
      </main>
    </div>
  );
}

function UndertakingDetails({
  snapshot,
  controller: c,
  project,
  name,
  onVenue,
  onPeople,
  beforeLeave,
}: Props & { project: BuildProject; name(id: string): string }) {
  const [tab, setTab] = useState("Overview & Progress");
  const { plan, completed } = project.undertaking!;
  const venue = snapshot.settings.venues.find((entry) => entry.id === project.venueId);
  const next = plan.milestones[completed.length];
  const missing =
    project.lifecycle?.affectedIds.filter(
      (id) => !project.lifecycle?.approvals.some((approval) => approval.residentId === id),
    ) ?? [];
  const physical = snapshot.projects.find((entry) => entry.id === plan.constructionId);
  const busy = c.workspace.draft.busy;
  return (
    <article>
      <div className="vp-project-heading">
        <h2>{project.title}</h2>
        <span>{statusName[project.status]}</span>
      </div>
      <div className="vp-tabs" role="tablist" aria-label="Project sections">
        {["Overview & Progress", "Plan", "People", "Location"].map((label) => (
          <button key={label} role="tab" aria-selected={tab === label} onClick={() => setTab(label)}>
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {project.status === "planning" ? (
          <div hidden={tab !== "Plan"}>
            <UndertakingForm
              key={project.id}
              snapshot={snapshot}
              controller={c}
              project={project}
              onVenue={onVenue}
              onPeople={onPeople}
              beforeLeave={beforeLeave}
            />
          </div>
        ) : null}
        {tab === "Overview & Progress" || (tab === "Plan" && project.status !== "planning") ? (
          <div className="vp-columns">
            <ProjectDrawing image={venue?.presentation.image} caption={venue?.name ?? project.title} />
            <section className="vp-panel">
              <h3>What we're making</h3>
              <p>{plan.goal}</p>
              <ol>
                {plan.milestones.map((step) => (
                  <li key={step.id}>
                    {completed.some((entry) => entry.milestoneId === step.id) ? "✓ " : ""}
                    {step.title}
                  </li>
                ))}
              </ol>
              {next ? (
                <>
                  <span className="vp-label">Next together</span>
                  <p>{next.title}</p>
                </>
              ) : null}
              {plan.schedule ? (
                <p>
                  {plan.schedule.firstDate} · {String(Math.floor(plan.schedule.startMinute / 60)).padStart(2, "0")}:
                  {String(plan.schedule.startMinute % 60).padStart(2, "0")}
                  {plan.schedule.weekly ? " · Weekly" : ""}
                </p>
              ) : null}
              {missing.length ? <p>Agreement needed · {missing.map(name).join(", ")}</p> : null}
              {project.lifecycle?.blockedReason ? <p role="status">{project.lifecycle.blockedReason}</p> : null}
              {project.status === "complete" && plan.schedule?.weekly ? (
                <p>{missing.length ? "Weekly arrangement paused." : "Weekly arrangement agreed."}</p>
              ) : null}
              <div className="vp-actions">
                <button onClick={() => onVenue(project.venueId)}>View Venue</button>
                <button onClick={onPeople}>People</button>
              </div>
            </section>
          </div>
        ) : null}
        {tab === "People" ? (
          <section className="vp-panel">
            <h3>People and agreements</h3>
            <dl className="vp-facts">
              {plan.roles.map((role) => (
                <div key={role.actorId}>
                  <dt>{name(role.actorId)}</dt>
                  <dd>
                    {role.role} · {missing.includes(role.actorId) ? "Ask them" : "Agreed"}
                  </dd>
                </div>
              ))}
            </dl>
            {missing
              .filter((id) => !plan.roles.some((role) => role.actorId === id))
              .map((id) => (
                <p key={id}>
                  {name(id)} · Zone use {missing.includes(id) ? "needs agreement" : "agreed"}
                </p>
              ))}
            <button onClick={onPeople}>People</button>
          </section>
        ) : null}
        {tab === "Location" ? (
          <section className="vp-panel">
            <h3>{venue?.name}</h3>
            <p>{venue?.zones?.find((zone) => zone.id === plan.zoneId)?.name}</p>
            <button onClick={() => onVenue(project.venueId)}>View Venue</button>
          </section>
        ) : null}
        {physical ? (
          <section className="vp-panel" style={{ marginTop: "1rem" }}>
            <h3>Physical work</h3>
            <p>
              {physical.title} · {statusName[physical.status]}
            </p>
            <button
              onClick={async () => {
                if (!beforeLeave?.current || (await beforeLeave.current())) c.setSelectedId(physical.id);
              }}
            >
              Open work plan
            </button>
          </section>
        ) : null}
      </div>
      {["planning", "paused", "working"].includes(project.status) ? (
        <footer className="vp-footer">
          <div className="vp-actions">
            {project.status === "planning" || project.status === "paused" ? (
              <button
                disabled={busy || missing.length > 0}
                onClick={async () => {
                  if (!beforeLeave?.current || (await beforeLeave.current()))
                    await c.action(project.status === "paused" ? "resume" : "start");
                }}
              >
                {project.status === "paused" ? "Resume" : "Begin together"}
              </button>
            ) : null}
            <button
              disabled={busy}
              onClick={async () => {
                if (!beforeLeave?.current || (await beforeLeave.current())) await c.action("cancel");
              }}
            >
              Set aside
            </button>
          </div>
        </footer>
      ) : null}
    </article>
  );
}

function UndertakingForm({ snapshot, controller: c, project, beforeLeave }: Props & { project?: BuildProject }) {
  const original = project?.undertaking?.plan;
  const [title, setTitle] = useState(project?.title ?? "");
  const [goal, setGoal] = useState(original?.goal ?? "");
  const [venueId, setVenueId] = useState(project?.venueId ?? c.venueId ?? "");
  const [zoneId, setZoneId] = useState(original?.zoneId ?? "");
  const [roles, setRoles] = useState<UndertakingPlan["roles"]>(original?.roles ?? []);
  const [milestones, setMilestones] = useState(
    original?.milestones.map((step) => step.title).join("\n") ?? "Prepare together\nEnjoy the first use together",
  );
  const [scheduled, setScheduled] = useState(!!original?.schedule);
  const [firstDate, setFirstDate] = useState(original?.schedule?.firstDate ?? "");
  const [time, setTime] = useState(
    original?.schedule
      ? `${String(Math.floor(original.schedule.startMinute / 60)).padStart(2, "0")}:${String(original.schedule.startMinute % 60).padStart(2, "0")}`
      : "19:00",
  );
  const [duration, setDuration] = useState(
    original?.schedule ? original.schedule.endMinute - original.schedule.startMinute : 60,
  );
  const [weekly, setWeekly] = useState(original?.schedule?.weekly ?? false);
  const [constructionId, setConstructionId] = useState(original?.constructionId ?? "");
  const [dirty, setDirty] = useState(false);
  const basis = useRef(project?.lifecycle?.revision);
  const confirm = useConfirmation("shared-project-plan");
  const busy = c.workspace.draft.busy;
  useDeskLeaveGuard(async () => !dirty || (await confirm("Leave with an unsaved plan?")), busy);
  useLayoutEffect(() => {
    if (!beforeLeave) return;
    const check = async () => !busy && (!dirty || (await confirm("Leave with an unsaved plan?")));
    beforeLeave.current = check;
    return () => {
      if (beforeLeave.current === check) beforeLeave.current = null;
    };
  }, [beforeLeave, busy, dirty, confirm]);
  const venue = snapshot.settings.venues.find((entry) => entry.id === venueId);
  const save = async () => {
    const steps = milestones
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const startMinute = Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
    const plan: UndertakingPlan = {
      goal,
      zoneId,
      roles,
      milestones: steps.map((step, index) => ({
        id: original?.milestones[index]?.id ?? "step-" + (index + 1),
        title: step,
        kind: index === steps.length - 1 ? "first-use" : "preparation",
      })),
      ...(scheduled ? { schedule: { firstDate, startMinute, endMinute: startMinute + duration, weekly } } : {}),
      ...(constructionId ? { constructionId } : {}),
    };
    const value = { title, venueId, plan };
    const next = project
      ? await c.action("undertaking-plan", { ...value, expectedRevision: basis.current })
      : await c.createUndertaking(value);
    if (next) {
      basis.current = next.projects.find((entry) => entry.id === project?.id)?.lifecycle?.revision;
      setDirty(false);
    }
  };
  return (
    <form
      autoComplete="off"
      onChange={() => setDirty(true)}
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <section className="vp-panel">
        <h3>{project ? "Shared plan" : "New Project"}</h3>
        <fieldset disabled={busy}>
          <label>
            Name
            <input
              autoComplete="off"
              value={title}
              maxLength={100}
              required
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label>
            What we're making
            <textarea
              autoComplete="off"
              aria-label="What we're making"
              value={goal}
              maxLength={2000}
              required
              onChange={(event) => setGoal(event.target.value)}
            />
          </label>
          <label>
            Venue
            <select
              aria-label="Venue"
              value={venueId}
              required
              onChange={(event) => {
                setVenueId(event.target.value);
                setZoneId("");
                setConstructionId("");
              }}
            >
              <option value="">Choose a Venue</option>
              {snapshot.settings.venues
                .filter((entry) => entry.constructionStatus !== "worksite")
                .map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Zone
            <select aria-label="Zone" value={zoneId} required onChange={(event) => setZoneId(event.target.value)}>
              <option value="">Choose a Zone</option>
              {venue?.zones
                ?.filter((zone) => zone.kind !== "exterior" && zone.seen)
                .map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
            </select>
          </label>
          <span className="vp-label">People · up to three</span>
          {snapshot.villagers.map((person) => {
            const role = roles.find((entry) => entry.actorId === person.characterId);
            return (
              <div key={person.characterId}>
                <label>
                  <input
                    autoComplete="off"
                    type="checkbox"
                    checked={!!role}
                    disabled={!role && roles.length >= 3}
                    onChange={(event) =>
                      setRoles(
                        event.target.checked
                          ? [...roles, { actorId: person.characterId, role: "Taking part" }]
                          : roles.filter((entry) => entry.actorId !== person.characterId),
                      )
                    }
                  />
                  {person.name}
                </label>
                {role ? (
                  <label>
                    Role
                    <input
                      autoComplete="off"
                      value={role.role}
                      maxLength={240}
                      required
                      onChange={(event) =>
                        setRoles(
                          roles.map((entry) =>
                            entry.actorId === person.characterId ? { ...entry, role: event.target.value } : entry,
                          ),
                        )
                      }
                    />
                  </label>
                ) : null}
              </div>
            );
          })}
          <label>
            Milestones · last is first use
            <textarea
              autoComplete="off"
              value={milestones}
              required
              onChange={(event) => setMilestones(event.target.value)}
            />
          </label>
          <label>
            <input
              autoComplete="off"
              type="checkbox"
              checked={scheduled}
              onChange={(event) => setScheduled(event.target.checked)}
            />
            Arrange shared time
          </label>
          {scheduled ? (
            <>
              <label>
                First date
                <input
                  autoComplete="off"
                  type="date"
                  value={firstDate}
                  required
                  onChange={(event) => setFirstDate(event.target.value)}
                />
              </label>
              <label>
                Time
                <input
                  autoComplete="off"
                  type="time"
                  value={time}
                  required
                  onChange={(event) => setTime(event.target.value)}
                />
              </label>
              <label>
                Minutes
                <input
                  autoComplete="off"
                  type="number"
                  min={15}
                  max={180}
                  value={duration}
                  required
                  onChange={(event) => setDuration(Number(event.target.value))}
                />
              </label>
              <label>
                <input
                  autoComplete="off"
                  type="checkbox"
                  checked={weekly}
                  onChange={(event) => setWeekly(event.target.checked)}
                />
                Continue weekly
              </label>
            </>
          ) : null}
          <label>
            Physical work
            <select value={constructionId} onChange={(event) => setConstructionId(event.target.value)}>
              <option value="">None needed</option>
              {snapshot.projects
                .filter(
                  (entry) => entry.kind !== "undertaking" && entry.venueId === venueId && entry.status !== "cancelled",
                )
                .map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.title}
                  </option>
                ))}
            </select>
          </label>
          <button type="submit" disabled={!roles.length || !zoneId}>
            {project ? "Save plan" : "Keep this plan"}
          </button>
        </fieldset>
      </section>
    </form>
  );
}
