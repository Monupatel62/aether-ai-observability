# aether-ai-observability

**Status:** Initial metadata-only telemetry primitives implemented on a feature branch. No production exporter or telemetry backend is configured.

## Implemented

- [Telemetry source](src/index.js): W3C traceparent parsing with safe replacement, request IDs, allowlisted event fields, bounded duration, and sink-failure isolation.
- [Unit tests](test/observability.test.js): valid/malformed trace context, all-zero IDs, prompt/secret field dropping, invalid events, sink failures, and duration limits.
- Dependency-free Node.js package with Node 20/22 CI.

## Privacy boundary

Only explicit metadata fields are emitted. Arbitrary attributes, prompts, completions, authorization headers, and raw payloads are dropped. Production telemetry still requires a reviewed retention/redaction policy, access control, exporter configuration, and operational alerting. This package is not an OpenTelemetry SDK/exporter.

## Documentation

- [Repository specification](docs/REPOSITORY_SPECIFICATION.md)
- [Project specification](docs/PROJECT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Dependencies and contracts](docs/DEPENDENCIES_AND_CONTRACTS.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Security review](docs/SECURITY_REVIEW.md)
- [Master catalog](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/REPOSITORY_CATALOG.md)
