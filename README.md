# @aether-ai/observability

Metadata-only telemetry event contracts and allowlisted sanitization for Aether AI.

## Status

Initial contract foundation in review. No exporter, telemetry backend, queue, retention policy, or security-audit storage is implemented. Backend, region, retention, sampling, and audit durability remain open decisions.

## Safety defaults

- Events accept only timestamp, service, environment, version, operation, outcome, duration, correlation ID, trace ID, and bounded error category.
- Unknown properties—including prompts, completions, documents, credentials, headers, and raw provider errors—are discarded by the runtime sanitizer.
- Label fields are bounded and reject spaces/free-form text to reduce accidental payload capture and cardinality.
- Raw error messages are not part of the event type.
- This contract does not replace access control, retention enforcement, or durable security audit logging.

## Example

```ts
import { createTelemetryEvent } from "@aether-ai/observability";

const event = createTelemetryEvent({
  service: "api",
  environment: "test",
  version: "0.1.0",
  operation: "chat.complete",
  outcome: "success",
  durationMs: 42
});
```

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

CI is configured for Node.js 20 and 22. Exporters, bounded queues, flush/shutdown, sampling, dashboards, retention, and security audit separation remain future work.
