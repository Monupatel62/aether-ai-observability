import { randomBytes, randomUUID } from "node:crypto";

const TRACEPARENT = /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/i;
const EVENT_NAME = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;
const SAFE_OUTCOMES = new Set(["ok", "error", "denied", "timeout", "cancelled"]);

function hex(bytes) { return bytes.toString("hex"); }
function nonZeroHex(value) { return !/^0+$/.test(value); }

export function createTraceContext(traceparent) {
  if (typeof traceparent === "string") {
    const match = TRACEPARENT.exec(traceparent.trim());
    if (match && nonZeroHex(match[1]) && nonZeroHex(match[2])) {
      return Object.freeze({ traceId: match[1].toLowerCase(), parentSpanId: match[2].toLowerCase(), traceFlags: match[3].toLowerCase() });
    }
  }
  return Object.freeze({ traceId: hex(randomBytes(16)), parentSpanId: null, traceFlags: "01" });
}

/**
 * Emits an allowlisted set of metadata only. Unknown fields (including prompt,
 * completion, token, headers, file content, and arbitrary attributes) are dropped.
 * Sink errors never change the application's business result.
 */
export function createTelemetry({ sink = () => {}, clock = () => Date.now() } = {}) {
  if (typeof sink !== "function" || typeof clock !== "function") throw new TypeError("sink and clock must be functions");
  return Object.freeze({
    newRequestId() { return randomUUID(); },
    emit(input) {
      if (input === null || typeof input !== "object" || Array.isArray(input)) return false;
      if (typeof input.eventName !== "string" || input.eventName.length > 128 || !EVENT_NAME.test(input.eventName)) return false;
      const event = {
        eventName: input.eventName,
        requestId: typeof input.requestId === "string" && /^[A-Za-z0-9._:-]{1,128}$/.test(input.requestId) ? input.requestId : null,
        traceId: typeof input.traceId === "string" && /^[0-9a-f]{32}$/i.test(input.traceId) && nonZeroHex(input.traceId) ? input.traceId.toLowerCase() : null,
        spanId: typeof input.spanId === "string" && /^[0-9a-f]{16}$/i.test(input.spanId) && nonZeroHex(input.spanId) ? input.spanId.toLowerCase() : null,
        durationMs: Number.isFinite(input.durationMs) && input.durationMs >= 0 ? Math.min(input.durationMs, 86_400_000) : null,
        outcome: SAFE_OUTCOMES.has(input.outcome) ? input.outcome : "error",
        errorCode: typeof input.errorCode === "string" && /^[a-z][a-z0-9_]{0,63}$/.test(input.errorCode) ? input.errorCode : null,
        timestamp: clock(),
      };
      try { sink(Object.freeze(event)); return true; }
      catch { return false; }
    },
  });
}
