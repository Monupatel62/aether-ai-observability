# Technical Design — aether-ai-observability

## Signal model
Common fields: timestamp, service, environment, version, operation, outcome, duration, correlation_id, trace_id, and bounded error category. Optional dimensions require a cardinality/privacy review.

## Redaction
Apply allowlisted fields rather than attempting to remove every sensitive value after collection. Scrub authorization headers, cookies, API keys, prompts, completions, retrieved documents, file content, and provider error bodies.

## Reliability
Bound queue/buffer size and flush time. Document dropped telemetry counters. Do not block critical work indefinitely waiting for an exporter. Audit/security events require a separate durability decision.

## Open decisions
Telemetry backend, retention periods, region, sampling policy, and audit-event storage require ADRs.
