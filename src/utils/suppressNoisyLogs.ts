const SUPPRESSED_LOG_PATTERNS = [
  /\[TelnyxRTC\]/,
  /\[Connection\]/,
  /\[LoginHandler\]/,
  /\[Login\]/,
  /\[KeepAliveHandler\]/,
  /\[Call\]/,
  /SessionManager:/,
  /CallStateController:/,
  /TelnyxVoipClient:/,
  /🔧 SessionManager/,
  /🔧 TelnyxRTC/,
  /🔧 TelnyxVoipClient/,
  /Sending message to gateway/,
  /Received message:/,
  /Telnyx client ready/,
  /RELEASE DEBUG/,
];

const SUPPRESSED_WARN_PATTERNS = [
  /React Native Firebase namespaced API/,
  /migrating-to-v22/,
];

const toMessage = (args: unknown[]) =>
  args
    .map((arg) => {
      if (typeof arg === "string") {
        return arg;
      }

      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    })
    .join(" ");

const matchesAny = (args: unknown[], patterns: RegExp[]) =>
  patterns.some((pattern) => pattern.test(toMessage(args)));

const wrapConsoleMethod = (
  method: "log" | "debug" | "info" | "warn",
  patterns: RegExp[],
) => {
  const original = console[method].bind(console);

  console[method] = (...args: unknown[]) => {
    if (matchesAny(args, patterns)) {
      return;
    }

    original(...args);
  };
};

export const installNoisyLogSuppression = () => {
  wrapConsoleMethod("log", SUPPRESSED_LOG_PATTERNS);
  wrapConsoleMethod("debug", SUPPRESSED_LOG_PATTERNS);
  wrapConsoleMethod("info", SUPPRESSED_LOG_PATTERNS);
  wrapConsoleMethod("warn", SUPPRESSED_WARN_PATTERNS);
};
