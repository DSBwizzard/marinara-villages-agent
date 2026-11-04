import { useLayoutEffect, useRef, useState, type ComponentProps } from "react";
import { createPortal } from "react-dom";
import { ModalDialog } from "../../shared/ModalDialog.js";

export function FoundingDialog(props: Omit<ComponentProps<typeof ModalDialog>, "scope">) {
  const anchor = useRef<HTMLSpanElement>(null);
  const [scope, setScope] = useState<HTMLElement | null>();
  useLayoutEffect(() => {
    setScope(anchor.current?.closest<HTMLElement>(".villages-forging-v2") ?? null);
  }, []);
  return (
    <>
      <span ref={anchor} hidden />
      {scope === undefined ? null : scope ? (
        createPortal(<ModalDialog {...props} scope={scope} />, scope)
      ) : (
        <ModalDialog {...props} />
      )}
    </>
  );
}
