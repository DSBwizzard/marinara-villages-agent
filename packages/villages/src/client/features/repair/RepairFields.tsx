import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { RepairField, RepairValue } from "../../../shared/contracts/repair.js";

export function useRepairSpace() {
  const ref = useRef<HTMLDivElement>(null);
  const [space, setSpace] = useState({ width: 900, height: 450, scale: 1 });
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const { width, height } = element.getBoundingClientRect();
      const scale = parseFloat(getComputedStyle(element).fontSize) / 16;
      setSpace((prior) =>
        prior.width === width && prior.height === height && prior.scale === scale ? prior : { width, height, scale },
      );
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, ...space };
}

// Page by rendered lines, retaining every character, including blank lines and whitespace.
function textPages(value: string, width: number, font: string, lines: number, root?: HTMLElement | null): string[] {
  if (!root || !value) return [value];
  const measure = document.createElement("div");
  Object.assign(measure.style, {
    position: "fixed",
    visibility: "hidden",
    pointerEvents: "none",
    left: "-10000px",
    top: "0",
    font,
    lineHeight: "1.5",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    width: Math.max(30, width) + "px",
    padding: "0",
    border: "0",
  });
  measure.setAttribute("aria-hidden", "true");
  root.append(measure);
  try {
    const lineHeight = parseFloat(getComputedStyle(measure).lineHeight);
    const boundaries = [0];
    for (const char of value) boundaries.push(boundaries.at(-1)! + char.length);
    const pages: string[] = [];
    let start = 0;
    while (start < boundaries.length - 1) {
      let low = start + 1,
        high = boundaries.length - 1,
        best = low;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        measure.textContent = value.slice(boundaries[start], boundaries[mid]) + "\u200b";
        if (measure.scrollHeight <= lines * lineHeight + 1) {
          best = mid;
          low = mid + 1;
        } else high = mid - 1;
      }
      pages.push(value.slice(boundaries[start], boundaries[best]));
      start = best;
    }
    return pages;
  } finally {
    measure.remove();
  }
}
function rawOffset(text: string, normalized: number) {
  let offset = 0,
    count = 0;
  while (offset < text.length && count < normalized) {
    if (text[offset] === "\r" && text[offset + 1] === "\n") offset++;
    offset++;
    count++;
  }
  return offset;
}
function editPage(previous: string, next: string) {
  const normalized = previous.replace(/\r\n?/gu, "\n");
  let prefix = 0,
    suffix = 0;
  while (prefix < Math.min(normalized.length, next.length) && normalized[prefix] === next[prefix]) prefix++;
  while (
    suffix < Math.min(normalized.length, next.length) - prefix &&
    normalized[normalized.length - 1 - suffix] === next[next.length - 1 - suffix]
  )
    suffix++;
  const ending = previous.includes("\r\n") ? "\r\n" : "\n";
  return (
    previous.slice(0, rawOffset(previous, prefix)) +
    next.slice(prefix, next.length - suffix).replace(/\n/gu, ending) +
    previous.slice(rawOffset(previous, normalized.length - suffix))
  );
}

export function PagedText({
  value,
  onChange,
  label,
  disabled,
  readOnly = false,
  rows = 4,
  id,
}: {
  value: string;
  onChange?(value: string): void;
  label: string;
  disabled?: boolean;
  readOnly?: boolean;
  rows?: number;
  id?: string;
}) {
  const control = useRef<HTMLTextAreaElement>(null);
  const [page, setPage] = useState(0);
  const caret = useRef<number | undefined>(undefined);
  const [layout, setLayout] = useState({ value, pages: [value] });
  const [metrics, setMetrics] = useState({ width: 400, font: "16px Segoe UI" });
  useLayoutEffect(() => {
    const element = control.current;
    if (!element) return;
    const update = () => {
      const css = getComputedStyle(element);
      const next = {
        width: element.clientWidth - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight) - 8,
        font: css.fontSize + " " + css.fontFamily,
      };
      setMetrics((prior) => (prior.width === next.width && prior.font === next.font ? prior : next));
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    update();
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    setLayout({
      value,
      pages: textPages(value, metrics.width, metrics.font, Math.max(1, rows), control.current?.parentElement),
    });
  }, [value, metrics, rows]);
  const pages = useMemo(() => (layout.value === value ? layout.pages : [value]), [layout, value]);
  const current = Math.min(page, pages.length - 1);
  const start = pages.slice(0, current).join("").length;
  useLayoutEffect(() => {
    if (caret.current === undefined || !control.current || layout.value !== value) return;
    let offset = 0,
      target = 0;
    while (target < pages.length - 1 && offset + pages[target]!.length < caret.current) {
      offset += pages[target]!.length;
      target++;
    }
    if (target !== current) {
      setPage(target);
      return;
    }
    control.current.focus();
    const local = value.slice(offset, caret.current).replace(/\r\n?/gu, "\n").length;
    control.current.setSelectionRange(local, local);
    caret.current = undefined;
  }, [pages, current, value, layout.value]);
  return (
    <div className="repair-prose">
      <textarea
        autoComplete="off"
        ref={control}
        id={id}
        aria-label={label}
        rows={rows}
        disabled={disabled}
        readOnly={readOnly}
        value={pages[current]}
        onChange={(event) => {
          const updated = editPage(pages[current]!, event.target.value);
          caret.current = start + rawOffset(updated, event.target.selectionStart);
          onChange?.(value.slice(0, start) + updated + value.slice(start + pages[current]!.length));
        }}
      />
      {pages.length > 1 ? (
        <nav className="repair-text-pages" aria-label={`${label} pages`}>
          <button
            type="button"
            aria-label={`Previous ${label} page`}
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            ←
          </button>
          <span>
            {current + 1} of {pages.length}
          </span>
          <button
            type="button"
            aria-label={`Next ${label} page`}
            disabled={current + 1 === pages.length}
            onClick={() => setPage(current + 1)}
          >
            →
          </button>
        </nav>
      ) : null}
    </div>
  );
}

export function RepairFieldControl({
  field,
  value,
  disabled,
  error,
  onChange,
  rows,
  hideLabel = false,
}: {
  field: RepairField;
  value: RepairValue;
  disabled: boolean;
  error?: string;
  onChange(value: RepairValue): void;
  rows: number;
  hideLabel?: boolean;
}) {
  const id = "repair-field-" + field.key;
  return (
    <div className="repair-field">
      <label htmlFor={id} className={hideLabel ? "repair-sr" : undefined}>
        {field.label}
      </label>
      {field.type === "days" ? (
        <div className="repair-weekdays" role="group" aria-label={field.label}>
          {field.options?.map((option) => (
            <label key={option.value}>
              <input
                autoComplete="off"
                type="checkbox"
                disabled={disabled}
                checked={String(value).split(",").includes(option.value)}
                onChange={(event) =>
                  onChange(
                    field
                      .options!.filter((candidate) =>
                        candidate.value === option.value
                          ? event.target.checked
                          : String(value).split(",").includes(candidate.value),
                      )
                      .map((candidate) => candidate.value)
                      .join(","),
                  )
                }
              />
              {option.label}
            </label>
          ))}
        </div>
      ) : field.type === "date" ? (
        <input
          autoComplete="off"
          id={id}
          type="date"
          value={String(value)}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : field.type === "choice" ? (
        <select
          id={id}
          disabled={disabled}
          aria-invalid={!!error}
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
        >
          {!field.options?.some((option) => option.value === String(value)) ? (
            <option value={String(value)} disabled>
              Choose an option
            </option>
          ) : null}
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === "boolean" ? (
        <input
          autoComplete="off"
          id={id}
          type="checkbox"
          checked={value === true}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />
      ) : field.type === "number" ? (
        <input
          autoComplete="off"
          id={id}
          type="number"
          min={field.min}
          max={field.max}
          step="any"
          value={String(value)}
          disabled={disabled}
          aria-invalid={!!error}
          onChange={(event) => onChange(event.target.value === "" ? "" : Number(event.target.value))}
        />
      ) : field.type === "clock" ? (
        <div className="repair-clock">
          <input
            autoComplete="off"
            id={id}
            type="time"
            value={value === "24:00" ? "" : String(value)}
            disabled={disabled || value === "24:00"}
            aria-invalid={!!error}
            onChange={(event) => onChange(event.target.value)}
          />
          {/^end(?::|$)/u.test(field.key) ? (
            <label>
              <input
                autoComplete="off"
                type="checkbox"
                checked={value === "24:00"}
                disabled={disabled}
                onChange={(event) => onChange(event.target.checked ? "24:00" : "")}
              />
              End of day
            </label>
          ) : null}
        </div>
      ) : field.multiline === false ? (
        <input
          autoComplete="off"
          id={id}
          type="text"
          value={String(value)}
          disabled={disabled}
          aria-invalid={!!error}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <PagedText
          key={field.key}
          id={id}
          label={field.label}
          value={String(value)}
          disabled={disabled}
          onChange={onChange}
          rows={rows}
        />
      )}
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}
