import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { VillageSnapshot, BuildProject } from "../../../shared/contracts/village.js";
import type { UndertakingPlan } from "../../../shared/contracts/projects.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import { StorybookHeading } from "../../shared/StorybookHeading.js";
import { useDeskLeaveGuard } from "../../shared/DeskWorkspace.js";
import { useConfirmation } from "../../shared/confirmation.js";
import { ProjectDrawing } from "./ProjectDesign.js";
import { projectStyles } from "./project-styles.js";
import { projectFinished, physicalProjectNext } from "./project-guidance.js";
import type { ProjectsController } from "./useProjectsController.js";

type Props = {
  snapshot: VillageSnapshot;
  controller: ProjectsController;
  onVenue(id: string): void;
  onPeople(): void;
  beforeLeave?: { current: (() => Promise<boolean>) | null };
};
const label = (p: BuildProject) =>
  p.status === "cancelled"
    ? "Set aside"
    : p.status === "complete"
      ? projectFinished(p)
        ? "Complete"
        : "Ready to open"
      : p.status === "working"
        ? p.kind === "undertaking"
          ? "Together"
          : "Building"
        : p.status === "paused"
          ? "Paused"
          : "Planning";
export function UndertakingPanel(props: Props) {
  const { snapshot, controller: c } = props;
  const [history, setHistory] = useState(false),
    leave = useRef<(() => Promise<boolean>) | null>(null);
  const selected = c.project?.kind === "undertaking" ? c.project : undefined;
  const projects = snapshot.projects
    .filter((p) => !snapshot.projects.some((parent) => parent.undertaking?.plan.constructionId === p.id))
    .filter((p) => projectFinished(p) === history);
  const back = async () => {
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
            {selected || c.draftType ? (
              <button className="vp-subtle" onClick={back}>
                ‹ All Projects
              </button>
            ) : (
              <>
                <button aria-pressed={history} onClick={() => setHistory(!history)}>
                  {history ? "Current Projects" : "History"}
                </button>
                <button onClick={() => c.beginIdea()}>New Project</button>
              </>
            )}
          </div>
        </header>
        {selected ? (
          <GatheringProject key={selected.id} {...props} project={selected} beforeLeave={leave} />
        ) : c.draftType ? (
          <NewIdea key={c.idea} {...props} beforeLeave={leave} />
        ) : (
          <nav aria-label="Projects">
            <div className="vp-project-list">
              {projects.map((project) => {
                const next =
                  project.kind === "undertaking"
                    ? !project.venueId
                      ? "Choose a place"
                      : !project.undertaking?.plan.roles.length
                        ? "Invite someone"
                        : project.undertaking.plan.milestones[project.undertaking.completed.length]?.title
                    : physicalProjectNext(project).title;
                return (
                  <section className="vp-panel" key={project.id}>
                    <div className="vp-project-heading">
                      <h2>{project.title}</h2>
                      <span>{label(project)}</span>
                    </div>
                    <p>
                      {project.undertaking?.plan.goal ??
                        project.venueDraft?.description ??
                        project.lifecycle?.change?.detail}
                    </p>
                    {!history && next ? <p className="vp-note">Next · {next}</p> : null}
                    <button aria-label={project.title} onClick={() => c.setSelectedId(project.id)}>
                      Open Project
                    </button>
                  </section>
                );
              })}
            </div>
            {!projects.length ? <p>{history ? "No finished Projects." : "No Projects yet."}</p> : null}
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

function usePlanLeave(dirty: boolean, busy: boolean, beforeLeave: Props["beforeLeave"]) {
  const confirm = useConfirmation("project-idea");
  const check = useCallback(
    async () => !busy && (!dirty || (await confirm("Leave with an unsaved plan?"))),
    [busy, dirty, confirm],
  );
  useDeskLeaveGuard(check, busy);
  useLayoutEffect(() => {
    if (!beforeLeave) return;
    beforeLeave.current = check;
    return () => {
      if (beforeLeave.current === check) beforeLeave.current = null;
    };
  }, [beforeLeave, check]);
}
function NewIdea({ snapshot, controller: c, beforeLeave }: Props) {
  const [kind, setKind] = useState<"new-venue" | "renovation" | "undertaking" | "">(
    c.draftType === "renovation" || c.draftType === "new-venue" ? c.draftType : "",
  );
  const [name, setName] = useState(""),
    [description, setDescription] = useState(c.idea),
    [placeId, setPlace] = useState(c.venueId);
  const [dirty, setDirty] = useState(!!c.idea);
  const busy = c.workspace.draft.busy;
  usePlanLeave(dirty, busy, beforeLeave);
  return (
    <form
      autoComplete="off"
      onChange={() => setDirty(true)}
      onSubmit={(e) => {
        e.preventDefault();
        if (kind) void c.createIdea(kind, name, description, placeId);
      }}
    >
      <section className="vp-panel">
        <h2>New Project</h2>
        <fieldset disabled={busy} aria-label="Project kind">
          <div className="vp-actions">
            {(
              [
                ["new-venue", "Build a place"],
                ["renovation", "Improve a place"],
                ["undertaking", "Plan a gathering"],
              ] as const
            ).map(([value, title]) => (
              <button
                type="button"
                key={value}
                aria-pressed={kind === value}
                onClick={() => {
                  setKind(value);
                  setDirty(true);
                }}
              >
                {title}
              </button>
            ))}
          </div>
          {kind ? (
            <>
              {kind === "renovation" ? (
                <label>
                  Place
                  <select aria-label="Place" required value={placeId} onChange={(e) => setPlace(e.target.value)}>
                    <option value="">Choose a place</option>
                    {snapshot.settings.venues
                      .filter((v) => v.constructionStatus !== "worksite")
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                  </select>
                </label>
              ) : null}
              <label>
                Name
                <input
                  autoComplete="off"
                  required
                  value={name}
                  maxLength={100}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label>
                Idea · optional
                <textarea
                  autoComplete="off"
                  aria-label="Idea"
                  value={description}
                  maxLength={2000}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
              <button type="submit">Save idea</button>
            </>
          ) : null}
        </fieldset>
      </section>
    </form>
  );
}

function GatheringProject({
  snapshot,
  controller: c,
  project,
  onVenue,
  onPeople,
  beforeLeave,
}: Props & { project: BuildProject }) {
  const { plan, completed } = project.undertaking!;
  const [mode, setMode] = useState<"place" | "people" | "time" | "idea" | "">("");
  const [title, setTitle] = useState(project.title),
    [goal, setGoal] = useState(plan.goal),
    [venueId, setVenue] = useState(project.venueId),
    [zoneId, setZone] = useState(plan.zoneId),
    [roles, setRoles] = useState(plan.roles);
  const [scheduled, setScheduled] = useState(!!plan.schedule),
    [date, setDate] = useState(plan.schedule?.firstDate ?? ""),
    [time, setTime] = useState(
      plan.schedule
        ? `${String(Math.floor(plan.schedule.startMinute / 60)).padStart(2, "0")}:${String(plan.schedule.startMinute % 60).padStart(2, "0")}`
        : "19:00",
    ),
    [duration, setDuration] = useState(plan.schedule ? plan.schedule.endMinute - plan.schedule.startMinute : 60),
    [weekly, setWeekly] = useState(plan.schedule?.weekly ?? false);
  const [dirty, setDirty] = useState(false),
    basis = useRef(project.lifecycle?.revision),
    busy = c.workspace.draft.busy;
  usePlanLeave(dirty, busy, beforeLeave);
  const name = (id: string) =>
    snapshot.villagers.find((p) => p.characterId === id)?.name ?? project.actorNames?.[id] ?? id;
  const venue = snapshot.settings.venues.find((v) => v.id === project.venueId),
    editingVenue = snapshot.settings.venues.find((v) => v.id === venueId);
  const missing =
    project.lifecycle?.affectedIds.filter((id) => !project.lifecycle?.approvals.some((a) => a.residentId === id)) ?? [];
  const editable = project.status === "planning";
  const step = plan.milestones[completed.length];
  const next = !project.venueId
    ? "Choose a place"
    : !plan.roles.length
      ? "Invite someone"
      : missing.length
        ? "Ask " + missing.map(name).join(", ") + " to join"
        : project.status === "paused"
          ? "Resume the gathering"
          : project.status === "planning"
            ? "Ready to get together"
            : (step?.title ?? "Complete");
  const nextAction = () => {
    if (!project.venueId) setMode("place");
    else if (!plan.roles.length) setMode("people");
    else if (missing.length) onPeople();
    else if (project.status === "planning" || project.status === "paused")
      void c.action(project.status === "paused" ? "resume" : "start");
    else onVenue(project.venueId);
  };
  const save = async () => {
    const startMinute = Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
    const { schedule: _schedule, constructionId, ...rest } = plan;
    const nextPlan: UndertakingPlan = {
      ...rest,
      goal: goal.trim() || title,
      zoneId,
      roles,
      ...(venueId === project.venueId && constructionId ? { constructionId } : {}),
      ...(scheduled ? { schedule: { firstDate: date, startMinute, endMinute: startMinute + duration, weekly } } : {}),
    };
    const result = await c.action("undertaking-plan", {
      title,
      venueId,
      plan: nextPlan,
      expectedRevision: basis.current,
    });
    if (result) {
      basis.current = result.projects.find((p) => p.id === project.id)?.lifecycle?.revision;
      setDirty(false);
      setMode("");
    }
  };
  const work = snapshot.projects.find((p) => p.id === plan.constructionId);
  return (
    <article>
      <div className="vp-project-heading">
        <h2>{project.title}</h2>
        <span>{label(project)}</span>
      </div>
      <p>{plan.goal}</p>
      {!projectFinished(project) ? (
        <section className="vp-panel">
          <h3>Next · {next}</h3>
          {project.lifecycle?.blockedReason ? <p role="status">{project.lifecycle.blockedReason}</p> : null}
          <button disabled={busy || dirty} onClick={nextAction}>
            {!project.venueId
              ? "Choose a place"
              : !plan.roles.length
                ? "Invite someone"
                : missing.length
                  ? "Find people"
                  : project.status === "planning"
                    ? "Begin together"
                    : project.status === "paused"
                      ? "Resume"
                      : "Visit " + (venue?.name ?? "the place")}
          </button>
        </section>
      ) : null}
      <div className="vp-columns">
        <ProjectDrawing image={venue?.presentation.image} caption={venue?.name ?? "Place undecided"} />
        <section className="vp-panel">
          <h3>People</h3>
          {plan.roles.length ? (
            <ul>
              {plan.roles.map((role) => (
                <li key={role.actorId}>
                  {name(role.actorId)} · {missing.includes(role.actorId) ? "To ask" : "Agreed"}
                </li>
              ))}
            </ul>
          ) : (
            <p>No one invited yet.</p>
          )}
          {missing
            .filter((id) => !plan.roles.some((role) => role.actorId === id))
            .map((id) => (
              <p key={id}>{name(id)} · Place agreement needed</p>
            ))}
          {!missing.length ? <button onClick={onPeople}>Find people</button> : null}
          {plan.schedule ? (
            <p>
              {plan.schedule.firstDate} · {String(Math.floor(plan.schedule.startMinute / 60)).padStart(2, "0")}:
              {String(plan.schedule.startMinute % 60).padStart(2, "0")}
              {plan.schedule.weekly ? " · Weekly" : ""}
            </p>
          ) : null}
          {venue ? <button onClick={() => onVenue(venue.id)}>View place</button> : null}
        </section>
      </div>
      {editable ? (
        <>
          <div className="vp-actions">
            {(
              [
                ["place", "Place"],
                ["people", "People to ask"],
                ["time", "Arrange a time"],
                ["idea", "Edit idea"],
              ] as const
            ).map(([value, text]) => (
              <button key={value} aria-pressed={mode === value} onClick={() => setMode(value)}>
                {text}
              </button>
            ))}
          </div>
          <form
            autoComplete="off"
            hidden={!mode}
            onChange={() => setDirty(true)}
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <section className="vp-panel">
              <fieldset disabled={busy}>
                {mode === "idea" ? (
                  <>
                    <label>
                      Name
                      <input
                        autoComplete="off"
                        required
                        value={title}
                        maxLength={100}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </label>
                    <label>
                      Idea
                      <textarea
                        autoComplete="off"
                        aria-label="Idea"
                        maxLength={2000}
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                      />
                    </label>
                  </>
                ) : null}
                {mode === "place" ? (
                  <>
                    <label>
                      Place
                      <select
                        aria-label="Place"
                        required
                        value={venueId}
                        onChange={(e) => {
                          setVenue(e.target.value);
                          const first = snapshot.settings.venues
                            .find((v) => v.id === e.target.value)
                            ?.zones?.find((z) => z.kind !== "exterior" && z.seen);
                          setZone(first?.id ?? "");
                        }}
                      >
                        <option value="">Choose a place</option>
                        {snapshot.settings.venues
                          .filter((v) => v.constructionStatus !== "worksite")
                          .map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name}
                            </option>
                          ))}
                      </select>
                    </label>
                    <label>
                      Space
                      <select aria-label="Space" required value={zoneId} onChange={(e) => setZone(e.target.value)}>
                        <option value="">Choose a space</option>
                        {editingVenue?.zones
                          ?.filter((z) => z.kind !== "exterior" && z.seen)
                          .map((z) => (
                            <option key={z.id} value={z.id}>
                              {z.name}
                            </option>
                          ))}
                      </select>
                    </label>
                  </>
                ) : null}
                {mode === "people" ? (
                  <>
                    <legend>People to ask</legend>
                    {snapshot.villagers.map((person) => {
                      const chosen = roles.find((r) => r.actorId === person.characterId);
                      return (
                        <label key={person.characterId}>
                          <input
                            autoComplete="off"
                            type="checkbox"
                            checked={!!chosen}
                            disabled={!chosen && roles.length >= 3}
                            onChange={(e) =>
                              setRoles(
                                e.target.checked
                                  ? [...roles, { actorId: person.characterId, role: "Taking part" }]
                                  : roles.filter((r) => r.actorId !== person.characterId),
                              )
                            }
                          />
                          {person.name}
                        </label>
                      );
                    })}
                  </>
                ) : null}
                {mode === "time" ? (
                  <>
                    <label>
                      <input
                        autoComplete="off"
                        type="checkbox"
                        checked={scheduled}
                        onChange={(e) => setScheduled(e.target.checked)}
                      />
                      Arrange a time
                    </label>
                    {scheduled ? (
                      <>
                        <label>
                          Date
                          <input
                            autoComplete="off"
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                          />
                        </label>
                        <label>
                          Time
                          <input
                            autoComplete="off"
                            type="time"
                            required
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                          />
                        </label>
                        <label>
                          Minutes
                          <input
                            autoComplete="off"
                            type="number"
                            min={15}
                            max={180}
                            required
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                          />
                        </label>
                        <label>
                          <input
                            autoComplete="off"
                            type="checkbox"
                            checked={weekly}
                            onChange={(e) => setWeekly(e.target.checked)}
                          />
                          Repeat weekly
                        </label>
                      </>
                    ) : null}
                  </>
                ) : null}
                <button type="submit" disabled={!dirty}>
                  Save changes
                </button>
              </fieldset>
            </section>
          </form>
        </>
      ) : null}
      {work ? (
        <section className="vp-panel">
          <h3>Prepare {venue?.name ?? "the place"}</h3>
          <p>
            {work.title} · {label(work)}
          </p>
          <button
            onClick={async () => {
              if (!beforeLeave?.current || (await beforeLeave.current())) c.setSelectedId(work.id);
            }}
          >
            Review the design
          </button>
        </section>
      ) : null}
      {completed.length ? (
        <section className="vp-panel">
          <h3>What happened</h3>
          <ul>
            {completed.map((entry) => (
              <li key={entry.milestoneId}>{plan.milestones.find((s) => s.id === entry.milestoneId)?.title}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {project.status !== "complete" && project.status !== "cancelled" ? (
        <button disabled={busy || dirty} onClick={() => void c.action("cancel")}>
          Set aside
        </button>
      ) : null}
    </article>
  );
}
