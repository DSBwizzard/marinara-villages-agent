import { useLayoutEffect, useRef, useState, type ComponentProps } from "react";
import { createPortal } from "react-dom";
import type { ZoneAccessMode, ZoneAccessPolicy, ZoneVisitorHours } from "../../shared/helpers/venue-access.js";
import { messageFrom } from "./api.js";
import { HoursEditor } from "./HoursEditor.js";
import { ModalDialog } from "./ModalDialog.js";
import { ELEMENT_TAG as P } from "./constants.js";

type Schedule = Exclude<ZoneVisitorHours, "inherit">;

function SchedulePopup(props: ComponentProps<typeof ModalDialog>) {
  const anchor = useRef<HTMLSpanElement>(null);
  const [scope, setScope] = useState<HTMLElement | null>();
  useLayoutEffect(() => {
    setScope(anchor.current?.closest<HTMLElement>(`.villages-forging-v2,.${P}-desk-workspace`) ?? null);
  }, []);
  const popup = <ModalDialog {...props} scope={scope ?? undefined} focusHeaderOnMobile />;
  return (
    <>
      <span ref={anchor} hidden />
      {scope === undefined ? null : scope ? createPortal(popup, scope) : popup}
    </>
  );
}

export function ZoneVisitors({
  policy,
  mode,
  hours,
  disabled,
  onSave,
  onBusyChange,
}: {
  policy?: ZoneAccessPolicy;
  mode: ZoneAccessMode;
  hours?: Schedule;
  disabled?: boolean;
  onSave(policy: ZoneAccessPolicy): Promise<boolean> | boolean;
  onBusyChange?(busy: boolean): void;
}) {
  const [entry, setEntry] = useState(mode);
  const [open, setOpen] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [periods, setPeriods] = useState<Exclude<Schedule, "always">>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  useLayoutEffect(() => {
    onBusyChange?.(busy);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);
  const save = async (next: ZoneAccessPolicy) => {
    if (pending.current || disabled) return false;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const saved = await onSave(next);
      if (!saved) setError("Could not save visitor rules.");
      return saved;
    } catch (cause) {
      setError(messageFrom(cause, "Could not save visitor rules."));
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  return (
    <section className="villages-manage villages-zone-visitors" aria-label="Visitors">
      <h3>Visitors</h3>
      <div className="villages-zone-visitor-controls">
        <label>
          Entry
          <select
            autoComplete="off"
            aria-label="Entry"
            value={entry}
            disabled={disabled || busy || !policy}
            onChange={async (event) => {
              if (!policy) return;
              const next = event.target.value as ZoneAccessMode;
              setEntry(next);
              if (!(await save({ ...policy, mode: next, visitorHours: hours ?? "always" }))) setEntry(mode);
            }}
          >
            <option value="public">Open to everyone</option>
            <option value="permission-required">Invitation only</option>
          </select>
        </label>
        <button
          type="button"
          disabled={disabled || busy || hours === undefined}
          onClick={() => {
            setScheduled(Array.isArray(hours));
            setPeriods(Array.isArray(hours) ? structuredClone(hours) : []);
            setError("");
            setOpen(true);
          }}
        >
          Schedule
        </button>
      </div>
      {!open && error && <p role="alert">{error}</p>}
      {open && (
        <SchedulePopup
          title="Schedule"
          className="villages-schedule-dialog villages-manage"
          dismissible={!busy}
          onClose={() => {
            if (!busy) setOpen(false);
          }}
        >
          <div className="villages-schedule-body">
            <fieldset disabled={disabled || busy || !policy}>
              <div className="villages-schedule-mode">
                <label className="villages-manage-check">
                  <input
                    autoComplete="off"
                    type="radio"
                    name="schedule-mode"
                    checked={!scheduled}
                    onChange={() => setScheduled(false)}
                  />
                  Any time
                </label>
                <label className="villages-manage-check">
                  <input
                    autoComplete="off"
                    type="radio"
                    name="schedule-mode"
                    checked={scheduled}
                    onChange={() => {
                      setScheduled(true);
                      if (!periods.length)
                        setPeriods([
                          {
                            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                            start: "09:00",
                            end: "17:00",
                          },
                        ]);
                    }}
                  />
                  Set times
                </label>
              </div>
              {scheduled && <HoursEditor hours={periods} change={setPeriods} />}
            </fieldset>
          </div>
          {error && <p role="alert">{error}</p>}
          <footer>
            <button type="button" disabled={busy} onClick={() => setOpen(false)}>
              {policy ? "Cancel" : "Close"}
            </button>
            {policy && (
              <button
                type="button"
                className="villages-manage-primary"
                disabled={
                  disabled ||
                  busy ||
                  (scheduled &&
                    (!periods.length || periods.some((period) => !period.days.length || !period.start || !period.end)))
                }
                onClick={async () => {
                  if (await save({ ...policy, mode: entry, visitorHours: scheduled ? periods : "always" }))
                    setOpen(false);
                }}
              >
                Save schedule
              </button>
            )}
          </footer>
        </SchedulePopup>
      )}
    </section>
  );
}
