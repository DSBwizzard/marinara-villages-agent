import type { RoomLine } from "./village.js";

export type SceneHistoryPage = {
  sceneId: string;
  scope: string;
  version: string;
  lines: RoomLine[];
  olderCursor?: string;
  newerCursor?: string;
};
