import type { StagingPresentation } from "../helpers/scene-staging.js";
import type { RoomLine, RoomParticipant } from "./village.js";

export type ScenePlaybackMoment = {
  id: string;
  index: number;
  paragraphStart: number;
  paragraphs: number;
  lineIds: string[];
  anchorCursor: string;
  start: StagingPresentation;
  end: StagingPresentation;
};
export type ScenePlaybackWindow = {
  sceneId: string;
  scope: string;
  version: string;
  total: number;
  totalParagraphs: number;
  lines: RoomLine[];
  participants: RoomParticipant[];
  moments: ScenePlaybackMoment[];
  olderCursor?: string;
  newerCursor?: string;
};
