import type { VillageSnapshot } from "./village.js";
export type PersonalMailThread = {
  id: string;
  residentId: string;
  residentName: string;
  revision: number;
  messages: {
    id: string;
    fromId: string;
    text: string;
    at: string;
    status: "pending" | "applying" | "delivered" | "cancelled";
    read: boolean;
    replyPending: boolean;
    error?: string;
  }[];
};
export type MailboxView = {
  threads: PersonalMailThread[];
  invitations: {
    id: string;
    threadId: string;
    messageId: string;
    proposerName: string;
    revision: number;
    terms: { title: string; detail: string; venueId: string; zoneId: string; dueAt?: string };
    status: "proposed" | "accepted" | "declined" | "cancelled" | "fulfilled";
  }[];
  venueMail: VillageSnapshot["venueMail"];
};
