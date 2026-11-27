export function QuickStartButton({
  busy,
  disabled,
  pending,
  onGenerate,
}: {
  busy: boolean;
  disabled?: boolean;
  pending: boolean;
  onGenerate(): void;
}) {
  return (
    <button type="button" disabled={busy || disabled || pending} onClick={onGenerate}>
      {busy ? "Drafting…" : pending ? "Recovering…" : "Draft All Venues"}
    </button>
  );
}
