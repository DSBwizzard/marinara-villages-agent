import { useState, useLayoutEffect } from "react";
import { VenuePeoplePicker, type VenuePerson } from "./VenueManage.js";
import { VenueZoneRow } from "../../shared/VenueNavigation.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import { messageFrom } from "../../shared/api.js";

export function VenueRunnersRow({
  ids,
  nameOf,
  disabled,
  onOpen,
}: {
  ids: readonly string[];
  nameOf(id: string): string;
  disabled?: boolean;
  onOpen(): void;
}) {
  return (
    <nav className={`${P}-venue-zone-picker villages-arrangement-summary villages-venue-runners-row`}>
      <VenueZoneRow
        name="Runs this Venue"
        accessLabel={ids.length === 0 ? "Nobody" : ids.length === 1 ? nameOf(ids[0]!) : String(ids.length)}
        disabled={disabled}
        onOpen={onOpen}
      />
    </nav>
  );
}

export function VenueRunners({
  ids,
  people,
  disabled,
  onSave,
  onBack,
  onBusyChange,
}: {
  ids: readonly string[];
  people: readonly VenuePerson[];
  disabled?: boolean;
  onSave(ids: string[]): Promise<boolean> | boolean;
  onBack(): void;
  onBusyChange?(busy: boolean): void;
}) {
  const [selected, setSelected] = useState([...ids]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useLayoutEffect(() => {
    onBusyChange?.(busy);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);
  return (
    <section className="villages-manage" aria-label="Runs this Venue">
      <fieldset disabled={disabled || busy}>
        <button
          type="button"
          aria-pressed={!selected.length}
          className="villages-runners-nobody"
          onClick={() => setSelected([])}
        >
          Nobody
        </button>
        <VenuePeoplePicker
          title="Runs this Venue"
          people={people}
          selectedIds={selected}
          onSelect={(id) =>
            setSelected(selected.includes(id) ? selected.filter((row) => row !== id) : [...selected, id])
          }
          disabled={disabled || busy}
        />
        {error && <p role="alert">{error}</p>}
        <div className="villages-manage-actions">
          <button type="button" onClick={onBack}>
            Cancel
          </button>
          <button
            type="button"
            className="villages-manage-primary"
            onClick={async () => {
              if (busy) return;
              setBusy(true);
              setError("");
              try {
                if (await onSave(selected)) onBack();
              } catch (cause) {
                setError(messageFrom(cause, "Could not save who runs this Venue."));
              } finally {
                setBusy(false);
              }
            }}
          >
            Save
          </button>
        </div>
      </fieldset>
    </section>
  );
}
