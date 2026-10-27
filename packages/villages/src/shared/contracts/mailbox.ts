export type PersonalMailThread = {
  id: string;
  residentId: string;
  residentName: string;
  letterFontId?: string;
  revision: number;
  messages: {
    id: string;
    fromId: string;
    text: string;
    at: string;
    status: "pending" | "applying" | "delivered" | "cancelled" | "undeliverable";
    read: boolean;
    replyPending: boolean;
    error?: string;
    retryAvailable: boolean;
  }[];
};
export type MailboxView = {
  threads: PersonalMailThread[];
  recovery?: {
    threadId: string;
    messageId: string;
    label: string;
    reinterpretRequired: boolean;
  }[];
};
