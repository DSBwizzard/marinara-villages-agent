import type { RoomLine } from "./village.js";

export type SceneHistoryVisit = { id: string; name: string; at: string };

export type SceneHistoryPage = {
  sceneId: string;
  scope: string;
  version: string;
  lines: RoomLine[];
  visits?: (SceneHistoryVisit & { lineIds: string[] })[];
  olderCursor?: string;
  newerCursor?: string;
};
