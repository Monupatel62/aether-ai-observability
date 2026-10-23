# Dependencies and Contracts — aether-ai-observability

## Dependency boundary
Provide dependency-light telemetry interfaces; avoid importing domain services or capturing sensitive payloads by default.

## Contracts
- Stable service, environment, operation, outcome, and correlation attributes.
- No raw prompts, completions, credentials, file contents, or personal data by default.
- Bounded label cardinality; tenant/user IDs must not become unrestricted metric labels.
- Explicit sampling, retention, access control, and export semantics.
- Health/readiness output must not reveal internal dependency topology publicly.

## Compatibility
Version telemetry schema changes and document dashboards/alerts affected by renamed fields or metrics.
