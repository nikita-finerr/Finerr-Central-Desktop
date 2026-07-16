import type { CallHistorySeed } from "./types";

export const CALL_HISTORY_SEEDS: CallHistorySeed[] = [
  {
    id: "ch-1-1",
    conversationId: "1",
    direction: "inbound",
    timestamp: "Today, 11:20 AM",
    sortKey: 411,
    durationSeconds: 443,
  },
  {
    id: "ch-1-2",
    conversationId: "1",
    direction: "outbound",
    timestamp: "Today, 2:45 PM",
    sortKey: 410,
    durationSeconds: 190,
  },
  {
    id: "ch-1-3",
    conversationId: "1",
    direction: "inbound",
    timestamp: "Yesterday, 10:05 AM",
    sortKey: 309,
    durationSeconds: 765,
  },
  {
    id: "ch-1-4",
    conversationId: "1",
    direction: "inbound",
    timestamp: "Yesterday, 8:30 AM",
    sortKey: 308,
    durationSeconds: 0,
    isMissed: true,
  },
  {
    id: "ch-1-5",
    conversationId: "1",
    direction: "outbound",
    timestamp: "June 11, 2026, 4:15 PM",
    sortKey: 207,
    durationSeconds: 302,
  },
  {
    id: "ch-1-6",
    conversationId: "1",
    direction: "inbound",
    timestamp: "June 11, 2026, 9:00 AM",
    sortKey: 206,
    durationSeconds: 138,
  },
];
