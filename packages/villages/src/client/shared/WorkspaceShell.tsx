import type { ReactNode } from "react";
import { useDeskLeaveGuard, type DeskLeaveCheck } from "./DeskWorkspace.js";
import { ELEMENT_TAG as P } from "./constants.js";

export function WorkspaceShell({
  sidebar,
  children,
  beforeLeave,
  disabled = false,
}: {
  sidebar?: ReactNode;
  children: ReactNode;
  beforeLeave: DeskLeaveCheck;
  disabled?: boolean;
}) {
  useDeskLeaveGuard(beforeLeave, disabled);
  return (
    <div className={`${P}-workspace-body`}>
      {sidebar ? <aside className={`${P}-workspace-sidebar`}>{sidebar}</aside> : null}
      <div className={`${P}-workspace-content`}>{children}</div>
    </div>
  );
}
