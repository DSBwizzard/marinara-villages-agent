import type { ReactNode } from "react";

const P = "marinara-capability-villages";

/** The directory and every profile share the same page geometry. */
export function PeopleBook({
  toolbar,
  children,
  label,
  overview,
  section,
  inspect,
}: {
  toolbar: ReactNode;
  children: ReactNode;
  label: string;
  overview?: boolean;
  section?: string;
  inspect?: boolean;
}) {
  return (
    <section
      className={`${P}-dossier-desk`}
      aria-label={label}
      data-overview={overview}
      data-section={section}
      data-inspect={inspect}
    >
      <header className={`${P}-dossier-toolbar`}>{toolbar}</header>
      <div className={`${P}-dossier-book`}>
        <div className={`${P}-dossier-rings`} aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
        {children}
      </div>
    </section>
  );
}
