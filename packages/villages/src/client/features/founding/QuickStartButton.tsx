export function QuickStartButton({
  busy,
  disabled,
  pending,
  failed,
  onGenerate,
}: {
  busy: boolean;
  disabled?: boolean;
  pending: boolean;
  failed?: boolean;
  onGenerate(): void;
}) {
  return (
    <button type="button" disabled={busy || disabled || pending} onClick={onGenerate}>
      {busy ? "Drafting…" : pending ? "Recovering…" : failed ? "Retry draft" : "Draft Venues"}
    </button>
  );
}
