/** Private ownership recorded alongside the accepted Episode's Village commit. */
export type SceneRetryCapture = {
  sceneId: string;
  submissionId: string;
  episodeId: string;
  sceneRevision: number;
  originalOperationId: string;
  request: { id: string; digest: string };
  replaces?: string;
};
