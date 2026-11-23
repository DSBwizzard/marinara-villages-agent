import type { ReactNode } from "react";

export function FoundingReview({
  section,
  children,
  actions,
}: {
  section: "people" | "setting";
  children: ReactNode;
  actions: ReactNode;
}) {
  const title = section === "people" ? "People" : "Setting";
  return (
    <section className="villages-founding-review" aria-label={title + " review"} data-page={section}>
      <h2>{title}</h2>
      <div className="villages-review-fields">{children}</div>
      <footer className="villages-review-actions">{actions}</footer>
    </section>
  );
}
