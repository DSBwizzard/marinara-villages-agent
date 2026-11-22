import type { ComponentProps } from "react";
import { AvatarFace } from "../residents/ResidentPanels.js";

export function NpcSprite({ className }: { className?: string }) {
  return (
    <img
      src="/api/capability-packages/villages/assets/npc-silhouette.webp"
      alt=""
      className={className}
      data-npc-sprite=""
    />
  );
}

export function SceneFace({ actorId, ...face }: ComponentProps<typeof AvatarFace> & { actorId?: string }) {
  return actorId?.startsWith("npc:") ? <NpcSprite className={face.className} /> : <AvatarFace {...face} />;
}
