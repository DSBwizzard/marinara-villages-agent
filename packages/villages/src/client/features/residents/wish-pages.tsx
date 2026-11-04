import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

/** Native text columns keep complete records readable within the available book page. */
export function WishPages({ children }: { children: ReactNode }) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(1);
  useLayoutEffect(() => {
    const host = viewport.current,
      content = track.current;
    if (!host || !content) return;
    const measure = () => {
      const width = host.clientWidth;
      if (!width || !host.clientHeight) return;
      content.style.setProperty("--wish-page-width", `${width}px`);
      const pages = Math.max(1, Math.ceil((content.scrollWidth + 24 - 1) / (width + 24)));
      setCount(pages);
      setPage((current) => Math.min(current, pages - 1));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    let active = true;
    void document.fonts.ready.then(() => {
      if (active) measure();
    });
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [children]);
  return (
    <div className="villages-wish-pages">
      <div className="villages-wish-page-window" ref={viewport}>
        <div
          className="villages-wish-page-track"
          ref={track}
          style={{ transform: `translateX(calc(-${page} * (var(--wish-page-width, 100%) + 24px)))` }}
        >
          {children}
        </div>
      </div>
      <nav className="villages-wish-pagination" aria-label="Wish detail pages">
        <button type="button" aria-label="Previous detail page" disabled={page === 0} onClick={() => setPage(page - 1)}>
          ←
        </button>
        <span role="status">
          {page + 1} / {count}
        </span>
        <button
          type="button"
          aria-label="Next detail page"
          disabled={page + 1 >= count}
          onClick={() => setPage(page + 1)}
        >
          →
        </button>
      </nav>
    </div>
  );
}
