type DateTimeParts = {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
};

const parseDateTimeParts = (dateString: string): DateTimeParts | null => {
  const match = dateString.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/,
  );

  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hours: Number(match[4]),
    minutes: Number(match[5]),
  };
};

const toLocalDate = (parts: DateTimeParts) =>
  new Date(parts.year, parts.month - 1, parts.day);

const getDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const formatDate = (dateString: string): string => {
  const parts = parseDateTimeParts(dateString);
  const date = parts ? toLocalDate(parts) : new Date(dateString);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatSectionDate = (dateString: string): string => {
  const parts = parseDateTimeParts(dateString);
  const date = parts ? toLocalDate(parts) : new Date(dateString);

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const formatTime = (dateString: string): string => {
  const parts = parseDateTimeParts(dateString);

  if (!parts) {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  const { hours, minutes } = parts;
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
};

export const formatDateTime = (dateString: string): string =>
  `${formatDate(dateString)} at ${formatTime(dateString)}`;

export const formatConversationTimestamp = (dateString: string): string => {
  const parts = parseDateTimeParts(dateString);

  if (!parts) {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return formatTime(dateString);
    if (isYesterday) return "Yesterday";

    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    }

    return formatDate(dateString);
  }

  const date = toLocalDate(parts);
  const now = new Date();
  const todayKey = getDateKey(now);
  const dateKey = `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getDateKey(yesterday);

  if (dateKey === todayKey) return formatTime(dateString);
  if (dateKey === yesterdayKey) return "Yesterday";

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetStart = new Date(parts.year, parts.month - 1, parts.day);
  const diffDays = Math.floor(
    (todayStart.getTime() - targetStart.getTime()) / 86400000,
  );

  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }

  return formatDate(dateString);
};

export const formatApiDateOnly = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatApiDateTime = (date: Date): string =>
  `${formatApiDateOnly(date)}T00:00:00`;

export const parseApiDateTime = (dateString?: string | null): Date | null => {
  if (!dateString) {
    return null;
  }

  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatRelativeTime = (dateString: string): string => {
  const parts = parseDateTimeParts(dateString);
  const date = parts
    ? new Date(parts.year, parts.month - 1, parts.day, parts.hours, parts.minutes)
    : new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};
