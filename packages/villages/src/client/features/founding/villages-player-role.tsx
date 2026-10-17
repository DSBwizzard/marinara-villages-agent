import { useEffect, useState } from "react";
import { FoundingField } from "./FoundingField.js";
import type { PlayerRole } from "../../../shared/contracts/player-role.js";

export const DEFAULT_PLAYER_ROLE: Readonly<PlayerRole> = {
  enabled: true,
  title: "",
  explanation: "",
};
const ORDINARY_RESIDENT =
  "You participate as an ordinary resident. You can still receive proposals and organize Projects through cooperation, without an assumed position of authority. You still manage Project lifecycles.";

export function playerRoleProblem(role: PlayerRole | null): string {
  if (!role) return "Choose your place in the village.";
  if (!role.enabled) return "In Villages, you are the one who coordinates construction projects.";
  if (role.title.length > 80 || role.explanation.length > 1_000)
    return "Use a role title of at most 80 characters and an explanation of at most 1,000 characters.";
  if (role.enabled && !role.title.trim()) return "Give your village role a title.";
  return "";
}

const ROLE_EXAMPLES = ["Mayor", "Project Coordinator", "Captain", "King"];
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
    </section>
  );
}

export function PlayerRoleFields({
  role,
  onChange,
  disabled,
  compact = false,
  problem = "",
}: {
  role: PlayerRole;
  onChange: (role: PlayerRole) => void;
  disabled: boolean;
  compact?: boolean;
  problem?: string;
}) {
  const [example, setExample] = useState(0);
  useEffect(() => {
    if (role.title || disabled) return;
    const timer = setInterval(() => setExample((index) => (index + 1) % ROLE_EXAMPLES.length), 4000);
    return () => clearInterval(timer);
  }, [role.title, disabled]);
  return (
    <fieldset className={`${PREFIX}-field`} aria-label={compact ? "Your role" : undefined}>
      {!compact ? <legend className={`${PREFIX}-label`}>Role</legend> : null}
      <div className={`${PREFIX}-founding-role-fields`}>
        <FoundingField
          title="Role Title"
          help="In Villages, you oversee major changes, improvements, and developments."
          error={problem && (!role.title.trim() || role.title.length > 80) ? problem : ""}
        >
          <input
            autoComplete="off"
            id={`${PREFIX}-role-title`}
            className={`${PREFIX}-search`}
            type="text"
            aria-label="Role Title"
            value={role.title}
            placeholder={ROLE_EXAMPLES[example]}
            maxLength={80}
            required
            disabled={disabled}
            onChange={(event) => onChange({ ...role, title: event.target.value })}
          />
        </FoundingField>
      </div>
      {problem && role.title.trim() && role.title.length <= 80 && role.explanation.length <= 1000 ? (
        <p role="alert" data-founding-problem tabIndex={-1}>
          {problem}
        </p>
      ) : null}
    </fieldset>
  );
}
