export type TelemetryOutcome = "success" | "failure" | "timeout" | "cancelled";
export type TelemetryErrorCategory = "validation" | "authorization" | "rate_limit" | "timeout" | "dependency" | "internal" | "unknown";

export interface TelemetryEventInput {
  readonly timestamp?: string;
  readonly service: string;
  readonly environment: string;
  readonly version: string;
  readonly operation: string;
  readonly outcome: TelemetryOutcome;
  readonly durationMs: number;
  readonly correlationId?: string;
  readonly traceId?: string;
  readonly errorCategory?: TelemetryErrorCategory;
}

/** Explicit allowlisted metadata only; no payload, prompt, completion, document, header, or raw error fields. */
export interface TelemetryEvent {
  readonly timestamp: string;
  readonly service: string;
  readonly environment: string;
  readonly version: string;
  readonly operation: string;
  readonly outcome: TelemetryOutcome;
  readonly durationMs: number;
  readonly correlationId?: string;
  readonly traceId?: string;
  readonly errorCategory?: TelemetryErrorCategory;
}
