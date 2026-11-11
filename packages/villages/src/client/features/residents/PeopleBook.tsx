import type { ReactNode } from "react";

const P = "marinara-capability-villages";

/** The directory and every profile share the same page geometry. */
export function PeopleBook({ children, label }: { children: ReactNode; label: string }) {
  return (
    <section className={`${P}-dossier-desk`} aria-label={label}>
      <div className={`${P}-dossier-book`}>{children}</div>
    </section>
  );
}
