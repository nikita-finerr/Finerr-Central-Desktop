export type MessageTextPart = {
  type: "text" | "link";
  text: string;
  url?: string;
  boldLink?: boolean;
};

const NON_BREAKING_SPACE = "\u00A0";

const ANCHOR_REGEX = /<a\s+href=["']?([^"'>\s]+)["']?[^>]*>([\s\S]*?)<\/a>/gi;

const URL_REGEX = /(https?:\/\/[^\s<]+)/gi;

const RX_NUMBER_REGEX = /(Rx#)\s*([\d,]+)/gi;

const trimTextContent = (value: string): string =>
  value
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n+$/g, "")
    .trimEnd();

const normalizeMessage = (value: string): string => {
  if (!value) {
    return "";
  }

  return trimTextContent(
    value
      .replace(/&nbsp;/gi, " ")
      .replace(/\r\n?/g, "\n")
      .replace(RX_NUMBER_REGEX, `$1${NON_BREAKING_SPACE}$2`),
  );
};

const stripHtmlTags = (value: string): string =>
  value?.replace(/<[^>]*>/g, "").trim();

const parsePlainTextAndUrls = (value: string): MessageTextPart[] => {
  const cleaned = value?.replace(/<[^>]+>/g, "");
  const parts: MessageTextPart[] = [];
  let lastIndex = 0;

  for (const match of cleaned?.matchAll?.(URL_REGEX) ?? []) {
    const matchedText = match[0];
    const matchIndex = match?.index ?? 0;

    if (matchIndex > lastIndex) {
      parts.push({
        type: "text",
        text: cleaned?.slice(lastIndex, matchIndex),
      });
    }

    parts.push({
      type: "link",
      text: matchedText,
      url: matchedText,
      boldLink: false,
    });
    lastIndex = matchIndex + matchedText.length;
  }

  if (lastIndex < cleaned?.length) {
    parts.push({
      type: "text",
      text: cleaned?.slice(lastIndex),
    });
  }

  return parts.length > 0 ? parts : [{ type: "text", text: cleaned }];
};

export const parseMessageText = (raw: string): MessageTextPart[] => {
  const normalized = normalizeMessage(raw);
  const parts: MessageTextPart[] = [];
  let lastIndex = 0;

  for (const match of normalized?.matchAll?.(ANCHOR_REGEX) ?? []) {
    const matchedText = match[0];
    const matchIndex = match?.index ?? 0;
    const href = match[1]?.trim();
    const label = stripHtmlTags(match[2] ?? "") || "Click here";

    if (!href) {
      continue;
    }

    if (matchIndex > lastIndex) {
      parts?.push(
        ...parsePlainTextAndUrls(normalized?.slice(lastIndex, matchIndex)),
      );
    }

    parts?.push({
      type: "link",
      text: label,
      url: href,
      boldLink: true,
    });
    lastIndex = matchIndex + matchedText?.length;
  }

  if (lastIndex < normalized?.length) {
    parts?.push(...parsePlainTextAndUrls(normalized?.slice(lastIndex)));
  }

  return parts?.length > 0 ? parts : parsePlainTextAndUrls(normalized);
};
