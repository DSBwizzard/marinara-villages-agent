export type PlayerRole = { enabled: boolean; title: string; explanation: string };
export const DEFAULT_PLAYER_ROLE: Readonly<PlayerRole> = {
  enabled: true,
  title: "Project Coordinator",
  explanation:
    "People here recognize you as the coordinator for shared Projects. You help consider proposals, find willing builders, and see agreed plans through.",
};
const ORDINARY_RESIDENT =
  "You participate as an ordinary resident. You can still receive proposals and organize Projects through cooperation, without an assumed position of authority. You still manage Project lifecycles.";

export function playerRoleProblem(role: PlayerRole | null): string {
  if (!role) return "Choose your place in the village.";
  if (role.title.length > 80 || role.explanation.length > 1_000)
    return "Use a role title of at most 80 characters and an explanation of at most 1,000 characters.";
  if (role.enabled && (!role.title.trim() || !role.explanation.trim()))
    return "Give your village role a title and explain why villagers turn to you.";
  return "";
}

const PREFIX = "marinara-capability-villages";
export function PlayerRoleSummary({ role }: { role: PlayerRole | null | undefined }) {
  return (
    <section className={`${PREFIX}-field`} aria-label="Your place in the village" style={{ overflowWrap: "anywhere" }}>
      <h3>Your place in the village</h3>
      <p className={`${PREFIX}-hint`}>
        <strong>{role ? (role.enabled ? role.title : "Ordinary resident") : "No founding role recorded"}</strong>
      </p>
      <p className={`${PREFIX}-hint`}>
        {role
          ? role.enabled
            ? role.explanation
            : ORDINARY_RESIDENT
          : "This village keeps its existing narrative framing."}
      </p>
      <p className={`${PREFIX}-hint`}>Your village role is fixed when founding completes.</p>
    </section>
  );
}

export function PlayerRoleFields({
  role,
  onChange,
  disabled,
}: {
  role: PlayerRole;
  onChange: (role: PlayerRole) => void;
  disabled: boolean;
}) {
  return (
    <fieldset className={`${PREFIX}-field`}>
      <legend className={`${PREFIX}-label`}>Your place in the village</legend>
      <label className={`${PREFIX}-hint`}>
        <input
          type="checkbox"
          checked={role.enabled}
          disabled={disabled}
          onChange={(event) => onChange({ ...role, enabled: event.target.checked })}
        />{" "}
        Recognized village role
      </label>
      {role.enabled ? (
        <>
          <label className={`${PREFIX}-label`} htmlFor={`${PREFIX}-role-title`}>
            Role title
          </label>
          <input
            id={`${PREFIX}-role-title`}
            className={`${PREFIX}-search`}
            type="text"
            value={role.title}
            maxLength={80}
            required
            disabled={disabled}
            onChange={(event) => onChange({ ...role, title: event.target.value })}
          />
          <label className={`${PREFIX}-label`} htmlFor={`${PREFIX}-role-explanation`}>
            Why villagers turn to you
          </label>
          <textarea
            id={`${PREFIX}-role-explanation`}
            className={`${PREFIX}-textarea`}
            value={role.explanation}
            maxLength={1000}
            rows={6}
            required
            disabled={disabled}
            onChange={(event) => onChange({ ...role, explanation: event.target.value })}
          />
          <p className={`${PREFIX}-hint`}>
            Make this role your own. Residents can disagree or refuse; their homes and lives remain theirs. Your choice
            becomes fixed at founding. You manage Project lifecycles with either role choice.
          </p>
        </>
      ) : (
        <p className={`${PREFIX}-hint`}>{ORDINARY_RESIDENT}</p>
      )}
    </fieldset>
  );
}
