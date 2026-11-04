export type MailboxFolder = "inbox" | "sent";
export type MailboxQuery = { scope?: string; folder?: MailboxFolder; cursor?: string; recoveryCursor?: string };
export type PersonalMailThread = {
  id: string;
  residentId: string;
  residentName: string;
  letterFontId?: string;
  revision: number;
};
export type PersonalMailSummary = {
  token: string;
  id: string;
  fromId: string;
  preview: string;
  at: string;
  status: "pending" | "applying" | "delivered" | "cancelled" | "undeliverable";
  read: boolean;
  replyPending: boolean;
  error?: string;
  retryAvailable: boolean;
};
export type PersonalLetterSummary = { thread: PersonalMailThread; message: PersonalMailSummary };
export type PersonalLetter = {
  scope: string;
  thread: PersonalMailThread;
  message: PersonalMailSummary & { text: string };
};
export type MailboxMutation = { scope: string; threadId: string; messageId: string; token: string };
export type MailboxView = {
  scope: string;
  folder: MailboxFolder;
  letters: PersonalLetterSummary[];
  total: number;
  nextCursor?: string;
  recovery: {
    token: string;
    threadId: string;
    messageId: string;
    label: string;
    reinterpretRequired: boolean;
  }[];
  recoveryTotal: number;
  recoveryNextCursor?: string;
};
