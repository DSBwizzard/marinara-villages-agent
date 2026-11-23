import { useState, type ReactNode, type Ref } from "react";
import { AvatarFace } from "../residents/ResidentPanels.js";
import type { Portrait } from "../../shared/types.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import { VenueZoneRow } from "../../shared/VenueNavigation.js";

export function VenueManageHeading({
  title,
  back = "Manage",
  onBack,
  disabled = false,
  backRef,
  children,
}: {
  title: string;
  back?: string;
  onBack(): void;
  disabled?: boolean;
  backRef?: Ref<HTMLButtonElement>;
  children?: ReactNode;
}) {
  return (
    <div className={`${P}-venue-zone-toolbar villages-manage-heading`}>
      <button ref={backRef} type="button" className={`${P}-venue-back`} disabled={disabled} onClick={onBack}>
        ← {back}
      </button>
      <div className="villages-manage-title-row">
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export type VenuePerson = { id: string; name: string; portrait?: Portrait };

export function VenuePeoplePicker({
  title,
  heading,
  back,
  onBack,
  people,
  onSelect,
  onAdd,
  addLabel,
  disabled = false,
  children,
}: {
  title: string;
  heading?: string;
  back?: string;
  onBack?(): void;
  people: readonly VenuePerson[];
  onSelect(id: string): void;
  onAdd?: () => void;
  addLabel?: string;
  disabled?: boolean;
  children?: ReactNode;
}) {
  const [page, setPage] = useState(0);
  const count = Math.max(1, Math.ceil(people.length / 4));
  const current = Math.min(page, count - 1);
  return (
    <section className={`${P}-directory-root villages-manage-people`} aria-label={title}>
      {heading && onBack ? (
        <VenueManageHeading title={heading} back={back} onBack={onBack} disabled={disabled}>
          {onAdd && (
            <button type="button" disabled={disabled} onClick={onAdd}>
              {addLabel}
            </button>
          )}
        </VenueManageHeading>
      ) : onAdd ? (
        <div className="villages-people-actions">
          <button type="button" disabled={disabled} onClick={onAdd}>
            {addLabel}
          </button>
        </div>
      ) : null}
      {children}
      {people.length ? (
        <div className={`${P}-directory-grid`}>
          {people.slice(current * 4, current * 4 + 4).map((person) => (
            <button
              type="button"
              key={person.id}
              className={`${P}-directory-card`}
              disabled={disabled}
              onClick={() => onSelect(person.id)}
            >
              <span aria-hidden="true">
                <AvatarFace name={person.name} portrait={person.portrait} className={`${P}-avatar`} />
              </span>
              <span className={`${P}-directory-text`}>
                <strong>{person.name}</strong>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="villages-manage-empty">None yet.</p>
      )}
      {count > 1 && (
        <nav className={`${P}-directory-pagination`} aria-label={`${title} pages`}>
          <button
            type="button"
            aria-label={`Previous ${title.toLowerCase()} page`}
            disabled={disabled || current === 0}
            onClick={() => setPage(current - 1)}
          >
            ←
          </button>
          <span role="status">
            {current + 1} / {count}
          </span>
          <button
            type="button"
            aria-label={`Next ${title.toLowerCase()} page`}
            disabled={disabled || current + 1 === count}
            onClick={() => setPage(current + 1)}
          >
            →
          </button>
        </nav>
      )}
    </section>
  );
}

export type VenueArrangement = "home" | "work" | "management";
const arrangements = ["home", "work", "management"] as const;
export function VenuePeopleFlow({
  people,
  assignedIds,
  roles,
  renderEditor,
  disabled = false,
  overview,
}: {
  overview?: ReactNode;
  people: readonly VenuePerson[];
  assignedIds: readonly string[];
  roles(id: string): readonly VenueArrangement[];
  renderEditor(
    person: VenuePerson,
    arrangement: VenueArrangement,
    onBack: () => void,
    onBusyChange: (busy: boolean) => void,
  ): ReactNode;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [personId, setPersonId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addingArrangement, setAddingArrangement] = useState(false);
  const [arrangement, setArrangement] = useState<VenueArrangement | null>(null);
  const person = people.find((row) => row.id === personId);
  const back = () => {
    setArrangement(null);
    setAddingArrangement(false);
  };
  if (person && arrangement)
    return (
      <>
        <VenueManageHeading
          title={arrangement[0]!.toUpperCase() + arrangement.slice(1)}
          back={person.name}
          onBack={back}
          disabled={disabled || busy}
        />
        {renderEditor(person, arrangement, back, setBusy)}
      </>
    );
  if (person)
    return (
      <>
        <button
          type="button"
          className={P + "-venue-back"}
          disabled={disabled}
          onClick={() => {
            setPersonId(null);
            setAdding(false);
            back();
          }}
        >
          ← People
        </button>
        <div className="villages-person-heading">
          <AvatarFace name={person.name} portrait={person.portrait} className={P + "-avatar"} />
          <h2>{person.name}</h2>
          <button
            type="button"
            disabled={disabled || arrangements.every((role) => roles(person.id).includes(role))}
            onClick={() => setAddingArrangement(true)}
          >
            Add arrangement
          </button>
        </div>
        <nav className={P + "-venue-zone-picker"} aria-label={addingArrangement ? "Add arrangement" : "Arrangements"}>
          {arrangements
            .filter((role) => (addingArrangement ? !roles(person.id).includes(role) : roles(person.id).includes(role)))
            .map((role) => (
              <VenueZoneRow
                key={role}
                name={role[0]!.toUpperCase() + role.slice(1)}
                disabled={disabled || (person.id === "player" && role === "work")}
                onOpen={() => setArrangement(role)}
              />
            ))}
        </nav>
      </>
    );
  return (
    <>
      {!adding && overview}
      <VenuePeoplePicker
        key={String(adding)}
        title={adding ? "Add person" : "People"}
        heading={adding ? "Add person" : undefined}
        back="People"
        onBack={adding ? () => setAdding(false) : undefined}
        people={people.filter((row) => adding !== assignedIds.includes(row.id))}
        onSelect={(id) => {
          setPersonId(id);
          setAddingArrangement(false);
        }}
        onAdd={!adding ? () => setAdding(true) : undefined}
        addLabel="Add person"
        disabled={disabled}
      />
    </>
  );
}
