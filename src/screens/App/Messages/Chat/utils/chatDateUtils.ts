const MONTH_DAY_YEAR_TIME =
  /^(\d{1,2})\s+(\w+)\s+(\d{4})\s+(\d{1,2}:\d{2}\s*(?:AM|PM))$/i;

const ISO_LIKE_DATE_TIME =
  /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,3}))?/;

export const parseChatReceivedDate = (value: string): Date | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const monthNameMatch = trimmed.match(MONTH_DAY_YEAR_TIME);
  if (monthNameMatch) {
    const [, day, month, year, time] = monthNameMatch;
    const parsed = new Date(`${month} ${day}, ${year} ${time}`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  const isoMatch = trimmed.match(ISO_LIKE_DATE_TIME);
  if (isoMatch) {
    const [, year, month, day, hour, minute, second = "0", millis = "0"] =
      isoMatch;
    const parsed = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
      Number(millis.padEnd(3, "0").slice(0, 3)),
    );
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  const fallback = new Date(trimmed);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

export const formatChatMessageTime = (value: string): string => {
  const date = parseChatReceivedDate(value);
  if (!date) {
    return value;
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatChatDateLabel = (value: string): string => {
  const date = parseChatReceivedDate(value);
  if (!date) {
    return value;
  }

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return "Today";
  }

  if (isYesterday) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const getChatReceivedTimestamp = (value: string): number =>
  parseChatReceivedDate(value)?.getTime() ?? 0;
