import { ELEMENT_TAG } from "./constants.js";

export const DISCLOSURE_STYLES = `
details > summary.${ELEMENT_TAG}-disclosure-summary {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-self: start;
  width: fit-content;
  max-width: 100%;
  min-height: 44px;
  padding: 8px 13px;
  list-style: none;
  border: 1px solid var(--menu-control-border, var(--founding-line, var(--border)));
  border-radius: 6px;
  background: var(--menu-field, var(--founding-control, var(--popover)));
  color: inherit;
  font: inherit;
  font-weight: 600;
  line-height: 1.25;
  text-align: left;
  white-space: normal;
  overflow-wrap: anywhere;
  cursor: pointer;
}
.${ELEMENT_TAG}-disclosure-summary::-webkit-details-marker { display: none; }
.${ELEMENT_TAG}-disclosure-summary::marker { content: ""; }
.${ELEMENT_TAG}-disclosure-summary:focus-visible {
  outline: 3px solid var(--menu-focus, var(--founding-focus, var(--primary)));
  outline-offset: 3px;
}
details[open] > .${ELEMENT_TAG}-disclosure-summary { margin-bottom: 8px; }
.${ELEMENT_TAG}-disclosure-summary > [data-disclosure-label="hide"],
details[open] > .${ELEMENT_TAG}-disclosure-summary > [data-disclosure-label="show"] { display: none; }
details[open] > .${ELEMENT_TAG}-disclosure-summary > [data-disclosure-label="hide"] { display: inline; }
`;

export function DisclosureSummary({ show, hide, describedBy }: { show: string; hide: string; describedBy?: string }) {
  return (
    <summary className={ELEMENT_TAG + "-disclosure-summary"} aria-describedby={describedBy}>
      <span data-disclosure-label="show">{show}</span>
      <span data-disclosure-label="hide">{hide}</span>
    </summary>
  );
}
