import { FoundingField } from "./FoundingField.js";
export const DEFAULT_PLAYER_BACKGROUND = "";
export function playerBackgroundProblem(value: string | null): string {
  return value && value.length > 1200 ? "Use at most 1,200 characters for your backstory." : "";
}
export function PlayerBackgroundSummary({ background }: { background: string | null | undefined }) {
  return (
    <section aria-label="Your life here">
      <h3>Your life here</h3>
      {background ? <p>{background}</p> : null}
    </section>
  );
}
export function PlayerBackgroundFields({
  background,
  onChange,
  disabled,
  problem = "",
}: {
  background: string;
  onChange: (value: string) => void;
  disabled: boolean;
  problem?: string;
  compact?: boolean;
}) {
  return (
    <FoundingField
      title="Your backstory"
      help="In Villages, you (the player) coordinate with Villagers on major changes, improvements, and developments. Describe why you are here and your connection to this place. This is your starting situation - it can change through play."
      error={problem}
    >
      <textarea
        autoComplete="off"
        aria-label="Your backstory"
        value={background}
        maxLength={1200}
        rows={3}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </FoundingField>
  );
}
