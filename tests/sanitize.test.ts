import { describe, expect, it } from "vitest";
import { createTelemetryEvent, sanitizeTelemetryEvent } from "../src/index.js";

describe("metadata-only telemetry", () => {
  it("builds a bounded allowlisted event", () => {
    const event = createTelemetryEvent({
      service: "api",
      environment: "test",
      version: "0.1.0",
      operation: "chat.complete",
      outcome: "success",
      durationMs: 42,
      correlationId: "corr-123",
      traceId: "0123456789abcdef0123456789abcdef"
    }, () => new Date("2026-01-01T00:00:00.000Z"));
    expect(event.timestamp).toBe("2026-01-01T00:00:00.000Z");
    expect(event.traceId).toBe("0123456789abcdef0123456789abcdef");
    expect(Object.keys(event).sort()).toEqual(["correlationId", "durationMs", "environment", "operation", "outcome", "service", "timestamp", "traceId", "version"]);
  });

  it("drops unknown sensitive payload fields instead of serializing them", () => {
    const event = sanitizeTelemetryEvent({
      service: "gateway",
      environment: "test",
      version: "0.1",
      operation: "model.call",
      outcome: "failure",
      durationMs: 10,
      prompt: "do not log me",
      completion: "do not log me either",
      authorization: "synthetic-secret",
      providerErrorBody: "private"
    });
    expect(JSON.stringify(event)).not.toContain("do not log me");
    expect(JSON.stringify(event)).not.toContain("synthetic-secret");
    expect(JSON.stringify(event)).not.toContain("providerErrorBody");
  });

  it("rejects unbounded labels, invalid trace IDs, and invalid durations", () => {
    expect(() => createTelemetryEvent({ service: "contains spaces", environment: "test", version: "1", operation: "op", outcome: "success", durationMs: 1 })).toThrow();
    expect(() => createTelemetryEvent({ service: "api", environment: "test", version: "1", operation: "op", outcome: "success", durationMs: -1 })).toThrow();
    expect(() => createTelemetryEvent({ service: "api", environment: "test", version: "1", operation: "op", outcome: "success", durationMs: 1, traceId: "0".repeat(32) })).toThrow();
  });

  it("does not include raw error messages in the event contract", () => {
    const event = sanitizeTelemetryEvent({
      service: "api", environment: "test", version: "1", operation: "auth.check",
      outcome: "failure", durationMs: 3, errorCategory: "authorization",
      errorMessage: "secret provider response"
    });
    expect(event.errorCategory).toBe("authorization");
    expect("errorMessage" in event).toBe(false);
  });
});
