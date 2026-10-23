export const TELEMETRY_CONTRACT_VERSION = "1.0";
const MAX_STRING_LENGTH = 512;
const MAX_ATTRIBUTES = 40;
const SECRET_KEY = /(authorization|cookie|password|passwd|secret|token|api[-_]?key|credential|prompt|completion|message|content|query|email|phone|address|ssn|personal|payload|body)/i;
const ALLOWED_LEVELS = new Set(["debug", "info", "warn", "error"]);

function cleanText(value, max = MAX_STRING_LENGTH) {
  if (typeof value !== "string") return undefined;
  const compact = value.replace(/[\r\n\t]+/g, " ").trim();
  return compact.length > max ? compact.slice(0, max) : compact;
}

/** Hash-free, metadata-only telemetry. Arbitrary payloads are never copied. */
export function createTelemetryEvent(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new TypeError("telemetry input must be an object");
  const level = ALLOWED_LEVELS.has(input.level) ? input.level : "info";
  const eventName = cleanText(input.eventName, 120);
  if (!eventName) throw new TypeError("eventName is required");
  const attributes = {};
  const rawAttributes = input.attributes && typeof input.attributes === "object" && !Array.isArray(input.attributes)
    ? Object.entries(input.attributes).slice(0, MAX_ATTRIBUTES)
    : [];
  for (const [rawKey, rawValue] of rawAttributes) {
    const key = cleanText(rawKey, 80);
    if (!key || SECRET_KEY.test(key)) continue;
    if (typeof rawValue === "string") attributes[key] = cleanText(rawValue);
    else if (typeof rawValue === "number" && Number.isFinite(rawValue)) attributes[key] = rawValue;
    else if (typeof rawValue === "boolean") attributes[key] = rawValue;
  }
  const event = {
    contractVersion: TELEMETRY_CONTRACT_VERSION,
    timestamp: new Date().toISOString(),
    level,
    eventName,
    ...(cleanText(input.correlationId, 200) ? { correlationId: cleanText(input.correlationId, 200) } : {}),
    ...(cleanText(input.component, 100) ? { component: cleanText(input.component, 100) } : {}),
    attributes,
  };
  return Object.freeze(event);
}

/** Redact sensitive keys recursively before any explicitly enabled payload capture. */
export function redactSensitive(value, { maxDepth = 8, maxArrayItems = 50, maxStringLength = MAX_STRING_LENGTH } = {}) {
  const seen = new WeakSet();
  function visit(item, depth, key = "") {
    if (SECRET_KEY.test(key)) return "[REDACTED]";
    if (item === null || typeof item === "boolean" || typeof item === "number") return item;
    if (typeof item === "string") return cleanText(item, maxStringLength);
    if (typeof item !== "object") return "[UNSUPPORTED]";
    if (depth >= maxDepth) return "[MAX_DEPTH]";
    if (seen.has(item)) return "[CIRCULAR]";
    seen.add(item);
    if (Array.isArray(item)) return item.slice(0, maxArrayItems).map(child => visit(child, depth + 1));
    const result = {};
    for (const [childKey, childValue] of Object.entries(item).slice(0, MAX_ATTRIBUTES)) {
      const safeKey = cleanText(childKey, 80);
      if (safeKey) result[safeKey] = visit(childValue, depth + 1, safeKey);
    }
    return result;
  }
  return visit(value, 0);
}

export function validateRetentionDays(days, { maxDays = 365 } = {}) {
  if (!Number.isInteger(days) || days < 1 || days > maxDays) {
    throw new RangeError(`retention days must be an integer between 1 and ${maxDays}`);
  }
  return days;
}
