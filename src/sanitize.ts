import type { TelemetryErrorCategory, TelemetryEvent, TelemetryEventInput, TelemetryOutcome } from "./types.js";

const OUTCOMES = new Set<TelemetryOutcome>(["success", "failure", "timeout", "cancelled"]);
const ERROR_CATEGORIES = new Set<TelemetryErrorCategory>(["validation", "authorization", "rate_limit", "timeout", "dependency", "internal", "unknown"]);
const SAFE_LABEL = /^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,127}$/;
const CORRELATION_ID = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/;
const TRACE_ID = /^(?!0{32}$)[0-9a-f]{32}$/i;

function safeLabel(value: unknown, field: string): string {
  if (typeof value !== "string" || !SAFE_LABEL.test(value)) throw new TypeError(`Invalid telemetry field: ${field}`);
  return value;
}

/**
 * Construct an event by copying only explicitly allowed metadata fields.
 * Unknown fields are discarded; callers must never pass raw request/provider payloads.
 */
export function createTelemetryEvent(input: TelemetryEventInput, now: () => Date = () => new Date()): TelemetryEvent {
  const timestamp = input.timestamp ?? now().toISOString();
  if (typeof timestamp !== "string" || !Number.isFinite(Date.parse(timestamp))) {
    throw new TypeError("Invalid telemetry field: timestamp");
  }
  const service = safeLabel(input.service, "service");
  const environment = safeLabel(input.environment, "environment");
  const version = safeLabel(input.version, "version");
  const operation = safeLabel(input.operation, "operation");
  if (!OUTCOMES.has(input.outcome)) throw new TypeError("Invalid telemetry field: outcome");
  if (!Number.isFinite(input.durationMs) || input.durationMs < 0 || input.durationMs > 24 * 60 * 60 * 1000) {
    throw new TypeError("Invalid telemetry field: durationMs");
  }

  const event: TelemetryEvent = {
    timestamp: new Date(timestamp).toISOString(),
    service,
    environment,
    version,
    operation,
    outcome: input.outcome,
    durationMs: input.durationMs,
    ...(input.correlationId === undefined ? {} : { correlationId: validateCorrelationId(input.correlationId) }),
    ...(input.traceId === undefined ? {} : { traceId: validateTraceId(input.traceId) }),
    ...(input.errorCategory === undefined ? {} : { errorCategory: validateErrorCategory(input.errorCategory) })
  };
  return Object.freeze(event);
}

function validateCorrelationId(value: string): string {
  if (!CORRELATION_ID.test(value)) throw new TypeError("Invalid telemetry field: correlationId");
  return value;
}

function validateTraceId(value: string): string {
  if (!TRACE_ID.test(value)) throw new TypeError("Invalid telemetry field: traceId");
  return value.toLowerCase();
}

function validateErrorCategory(value: TelemetryErrorCategory): TelemetryErrorCategory {
  if (!ERROR_CATEGORIES.has(value)) throw new TypeError("Invalid telemetry field: errorCategory");
  return value;
}

/** Runtime guard for untrusted objects; drops every property outside the allowlist. */
export function sanitizeTelemetryEvent(input: unknown): TelemetryEvent {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Telemetry event must be an object.");
  }
  const raw = input as Record<string, unknown>;
  const allowed: TelemetryEventInput = {
    service: raw.service as string,
    environment: raw.environment as string,
    version: raw.version as string,
    operation: raw.operation as string,
    outcome: raw.outcome as TelemetryOutcome,
    durationMs: raw.durationMs as number,
    ...(typeof raw.timestamp === "string" ? { timestamp: raw.timestamp } : {}),
    ...(typeof raw.correlationId === "string" ? { correlationId: raw.correlationId } : {}),
    ...(typeof raw.traceId === "string" ? { traceId: raw.traceId } : {}),
    ...(typeof raw.errorCategory === "string" ? { errorCategory: raw.errorCategory as TelemetryErrorCategory } : {})
  };
  return createTelemetryEvent(allowed);
}
