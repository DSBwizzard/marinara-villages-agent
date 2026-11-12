import type { ReactNode, Ref } from "react";
import { ELEMENT_TAG as P } from "./constants.js";

export function StorybookHeading({
  as: Heading = "h1",
  children,
  ref,
  tabIndex,
}: {
  as?: "h1" | "h2";
  children: ReactNode;
  ref?: Ref<HTMLHeadingElement>;
  tabIndex?: number;
}) {
  return (
    <Heading className={`${P}-storybook-heading`} ref={ref} tabIndex={tabIndex}>
      {children}
      <svg
        className={`${P}-directory-flourish`}
        viewBox="0 0 64 36"
        width="56"
        height="35"
        fill="#969b7e"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M4 32C20 30 36 16 60 4" fill="none" stroke="#969b7e" strokeWidth="1.5" />
        <path d="M16 27C10 20 18 8 29 4c0 12-4 20-13 23ZM32 20C33 10 46 5 62 2c-5 12-15 18-30 18Z" stroke="none" />
      </svg>
    </Heading>
  );
}

export function StorybookSearchIcon() {
  return (
    <svg className={`${P}-storybook-search-icon`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="7" />
      <path d="m15 15 6 6" />
    </svg>
  );
}
