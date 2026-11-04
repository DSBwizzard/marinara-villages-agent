import { Children, isValidElement, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { FoundingPagination } from "./FoundingPagination.js";

export function FoundingVenuePages({ children, selectedId }: { children: ReactNode; selectedId: string | null }) {
  const viewport = useRef<HTMLDivElement>(null);
  const rows = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState([{ start: 0, end: Infinity, top: 0 }]);
  const items = Children.toArray(children);
  const keys = items.map((item, index) => (isValidElement(item) ? item.key : index)).join("|");
  useLayoutEffect(() => {
    const view = viewport.current!,
      list = rows.current!;
    const children = [...list.children] as HTMLElement[];
    const measure = () => {
      const controls = view.nextElementSibling as HTMLElement;
      const fullHeight =
        view.clientHeight +
        (controls.offsetHeight ? controls.offsetHeight + parseFloat(getComputedStyle(view.parentElement!).rowGap) : 0);
      const last = children.at(-1);
      // Pagination must release its own space when every row fits without it.
      const height = last && last.offsetTop + last.offsetHeight <= fullHeight + 1 ? fullHeight : view.clientHeight;
      if (!height) return;
      list.style.setProperty("--venue-page-height", `${height}px`);
      const next = [{ start: 0, end: 0, top: 0 }];
      children.forEach((row, index) => {
        let current = next[next.length - 1]!;
        if (index > current.start && row.offsetTop + row.offsetHeight - current.top > height + 1) {
          current = { start: index, end: index, top: row.offsetTop };
          next.push(current);
        }
        current.end = index + 1;
      });
      setPages((prior) => (JSON.stringify(prior) === JSON.stringify(next) ? prior : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(view);
    children.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [keys]);
  useLayoutEffect(() => {
    const index = [...rows.current!.children].findIndex(
      (row) => row.firstElementChild?.getAttribute("data-venue-id") === selectedId,
    );
    const selectedPage = pages.findIndex((group) => index >= group.start && index < group.end);
    setPage((prior) => (selectedPage >= 0 ? selectedPage : Math.min(prior, pages.length - 1)));
  }, [selectedId, pages, keys]);
  const currentPage = Math.min(page, pages.length - 1),
    current = pages[currentPage]!;
  return (
    <div className="villages-quick-pages">
      <div className="villages-quick-page-viewport" ref={viewport}>
        <div className="villages-quick-page-rows" ref={rows} style={{ transform: `translateY(${-current.top}px)` }}>
          {items.map((item, index) => {
            const visible = index >= current.start && index < current.end;
            return (
              <div
                key={isValidElement(item) ? item.key : index}
                inert={!visible}
                aria-hidden={!visible || undefined}
                style={{ visibility: visible ? undefined : "hidden" }}
              >
                {item}
              </div>
            );
          })}
        </div>
      </div>
      <div className="villages-quick-page-controls">
        <FoundingPagination page={currentPage} count={pages.length} onPage={setPage} label="Venues" />
      </div>
    </div>
  );
}
