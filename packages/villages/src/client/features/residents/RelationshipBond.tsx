import { useState, type ReactNode } from "react";
import type { RelationshipProfile } from "../../../shared/contracts/relationships.js";
import { AvatarFace } from "./ResidentPanels.js";

export function RelationshipBond({
  person,
  portrait,
  onVenue,
}: {
  person: RelationshipProfile;
  portrait?: ReactNode;
  onVenue: (id: string) => void;
}) {
  const [history, setHistory] = useState(false);
  const label = person.bond ? person.bond.connection || "Connection not expressed" : person.summary || "Not yet known";
  const condition = person.bond?.condition;
  const tone = person.bond?.tone || (person.summary ? "known" : "unknown");
  return (
    <article className="villages-relationship-bond">
      <header>
        <h3>{person.name}</h3>
        <button type="button" onClick={() => setHistory(!history)}>
          {history ? "Relationship" : "History"}
        </button>
      </header>
      {history ? (
        <section className="villages-relationship-history" aria-label={`${person.name} relationship history`}>
          <h4>What you've learned</h4>
          {person.learned.length ? (
            <ol>
              {[...person.learned].reverse().map((entry, index) => (
                <li key={index}>
                  <p>{entry.text}</p>
                  <small>
                    {entry.aboutName}
                    <time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time>
                  </small>
                </li>
              ))}
            </ol>
          ) : (
            <p>No relationship history learned yet.</p>
          )}
        </section>
      ) : (
        <>
          <p className="villages-relationship-caption">Last expressed to you</p>
          <div className="villages-relationship-visual" data-tone={tone}>
            <div className="villages-relationship-person">
              {portrait || (
                <AvatarFace portrait={undefined} name={person.name} className="villages-relationship-face" />
              )}
              <span>{person.name}</span>
            </div>
            <div className="villages-relationship-connection">
              <p className="villages-relationship-label">{label}</p>
              <div className="villages-relationship-thread" aria-hidden="true">
                <span />
                {tone === "strained" ? <b>!</b> : null}
              </div>
              {condition ? <p className="villages-relationship-condition">{condition}</p> : null}
            </div>
            <div className="villages-relationship-person">
              <AvatarFace portrait={undefined} name="You" glyph="person" className="villages-relationship-face" />
              <span>You</span>
            </div>
          </div>
          {!person.summary ? (
            <p className="villages-relationship-unknown">
              You haven't learned how {person.name} sees your relationship.
            </p>
          ) : null}
        </>
      )}
      {person.access.length ? (
        <nav className="villages-relationship-access" aria-label="Standing invitations">
          {person.access.map((access) => (
            <button key={access.venueId + access.zoneId} type="button" onClick={() => onVenue(access.venueId)}>
              {access.name}
              <small>{access.active ? "Standing invitation" : "Unavailable"}</small>
            </button>
          ))}
        </nav>
      ) : null}
    </article>
  );
}
