import test from "node:test";
import assert from "node:assert/strict";
import { createTelemetryEvent, redactSensitive, validateRetentionDays } from "../src/index.js";

test("emits metadata-only telemetry and drops sensitive attribute keys", () => {
  const event = createTelemetryEvent({
    level: "info",
    eventName: "request.completed",
    correlationId: "corr-test",
    component: "aether-api",
    attributes: { status: 200, durationMs: 12, authorization: "Bearer fake", prompt: "synthetic prompt", safeFlag: true },
    payload: { prompt: "must never be copied" },
  });
  assert.equal(event.attributes.status, 200);
  assert.equal(event.attributes.durationMs, 12);
  assert.equal(event.attributes.safeFlag, true);
  assert.equal("authorization" in event.attributes, false);
  assert.equal("prompt" in event.attributes, false);
  assert.equal("payload" in event, false);
});

test("rejects missing event names and normalizes invalid levels", () => {
  assert.throws(() => createTelemetryEvent({}), /eventName/);
  assert.equal(createTelemetryEvent({ eventName: "job.finished", level: "TRACE" }).level, "info");
});

test("redacts nested secrets and sensitive content fields", () => {
  const result = redactSensitive({
    authorization: "Bearer canary-secret",
    nested: { apiKey: "canary-key", message: "private message", status: "ok" },
  });
  assert.equal(result.authorization, "[REDACTED]");
  assert.equal(result.nested.apiKey, "[REDACTED]");
  assert.equal(result.nested.message, "[REDACTED]");
  assert.equal(result.nested.status, "ok");
  assert.equal(JSON.stringify(result).includes("canary-secret"), false);
});

test("handles circular objects and bounds recursion", () => {
  const value = { name: "synthetic" };
  value.self = value;
  assert.equal(redactSensitive(value).self, "[CIRCULAR]");
  assert.equal(redactSensitive({ a: { b: { c: 1 } } }, { maxDepth: 1 }).a, "[MAX_DEPTH]");
});

test("enforces bounded retention periods", () => {
  assert.equal(validateRetentionDays(30), 30);
  assert.throws(() => validateRetentionDays(0), /between/);
  assert.throws(() => validateRetentionDays(366), /between/);
});
