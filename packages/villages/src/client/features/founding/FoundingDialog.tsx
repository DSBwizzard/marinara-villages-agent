import { useLayoutEffect, useRef, useState, type ComponentProps } from "react";
import { createPortal } from "react-dom";
import { ModalDialog } from "../../shared/ModalDialog.js";

export function FoundingDialog({
  withinChapter,
  ...props
}: Omit<ComponentProps<typeof ModalDialog>, "scope"> & { withinChapter?: boolean }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const [scope, setScope] = useState<HTMLElement | null>();
  useLayoutEffect(() => {
    setScope(
      anchor.current?.closest<HTMLElement>(
        withinChapter ? ".villages-chapter-map, .villages-forging-v2" : ".villages-forging-v2",
      ) ?? null,
    );
  }, [withinChapter]);
  return (
    <>
      <span ref={anchor} hidden />
      {scope === undefined ? null : scope ? (
        createPortal(
          <ModalDialog {...props} dismissible={false} showCloseButton={false} focusHeaderOnMobile scope={scope} />,
          scope,
        )
      ) : (
        <ModalDialog {...props} />
      )}
    </>
  );
}
