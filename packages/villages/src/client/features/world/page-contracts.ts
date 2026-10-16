import type { VillageSnapshot } from "../../../shared/contracts/village.js";

/** Inputs consumed by renderNoticeboardPage; assembled by the shell. */
export type NoticeboardPagePorts = {
  readonly addNotice: () => Promise<void>;
  readonly busy: boolean;
  readonly noticeDraft: string;
  readonly removeNotice: (index: number) => Promise<void>;
  readonly setNoticeDraft: React.Dispatch<React.SetStateAction<string>>;
  readonly snapshot: VillageSnapshot;
};
