import { useState, type ReactNode, type Ref } from "react";
import { AvatarFace } from "../residents/ResidentPanels.js";
import type { Portrait } from "../../shared/types.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";

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
