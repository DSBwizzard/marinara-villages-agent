import type { ReactNode } from "react";
export function CapabilityFrame({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, minWidth: 0 }}>
      <div style={{ flex: "1 1 auto", minHeight: 0, minWidth: 0, overflow: "hidden" }}>{children}</div>
    </div>
  );
}
