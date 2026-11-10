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
  footer,
}: {
  toolbar: ReactNode;
  children: ReactNode;
  label: string;
  overview?: boolean;
  section?: string;
  inspect?: boolean;
  footer?: ReactNode;
}) {
  return (
    <section
      className={`${P}-dossier-desk`}
      aria-label={label}
      data-overview={overview}
      data-section={section}
      data-inspect={inspect}
    >
      <div className={`${P}-dossier-book`}>
        {toolbar ? <header className={`${P}-dossier-toolbar`}>{toolbar}</header> : null}
        {children}
      </div>
      {footer}
    </section>
  );
}
