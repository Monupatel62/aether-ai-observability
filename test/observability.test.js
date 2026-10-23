import test from "node:test";
import assert from "node:assert/strict";
import { createTelemetry, createTraceContext } from "../src/index.js";

test("parses a valid W3C traceparent", () => {
  assert.deepEqual(createTraceContext("00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"), {
    traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
    parentSpanId: "00f067aa0ba902b7",
    traceFlags: "01",
  });
});

test("replaces malformed and all-zero trace context", () => {
  const bad = createTraceContext("00-00000000000000000000000000000000-0000000000000000-01");
  assert.equal(bad.traceId.length, 32);
  assert.notEqual(bad.traceId, "00000000000000000000000000000000");
  assert.equal(createTraceContext("bad").parentSpanId, null);
});

test("emits only allowlisted metadata and drops prompt/secrets", () => {
  let emitted;
  const telemetry = createTelemetry({ sink: (event) => { emitted = event; }, clock: () => 123 });
  assert.equal(telemetry.emit({
    eventName: "model.request",
    requestId: "req-1",
    traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
    spanId: "00f067aa0ba902b7",
    durationMs: 12,
    outcome: "ok",
    prompt: "private prompt",
    authorization: "Bearer secret",
    attributes: { content: "private completion" },
  }), true);
  assert.equal(emitted.timestamp, 123);
  assert.equal(emitted.durationMs, 12);
  assert.equal("prompt" in emitted, false);
  assert.equal("authorization" in emitted, false);
  assert.equal("attributes" in emitted, false);
});

test("rejects invalid event names and isolates sink failures", () => {
  const telemetry = createTelemetry({ sink: () => { throw new Error("sink unavailable"); } });
  assert.equal(telemetry.emit({ eventName: "Bad Event", outcome: "ok" }), false);
  assert.equal(telemetry.emit({ eventName: "api.request", outcome: "ok" }), false);
});

test("clamps duration and creates request IDs", () => {
  let emitted;
  const telemetry = createTelemetry({ sink: (event) => { emitted = event; } });
  assert.equal(telemetry.newRequestId().length, 36);
  telemetry.emit({ eventName: "api.request", durationMs: 999999999, outcome: "mystery" });
  assert.equal(emitted.durationMs, 86_400_000);
  assert.equal(emitted.outcome, "error");
});
