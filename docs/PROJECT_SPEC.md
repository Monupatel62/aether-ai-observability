# Project Specification — aether-ai-observability

## Purpose
Shared observability contracts for structured logs, metrics, traces, correlation IDs, redaction, retention, dashboards, and alert/runbook conventions.

## Scope
- Signal taxonomy, correlation propagation, redaction rules, sampling, retention, dashboards, health/readiness semantics, and alert runbooks.
- Define common telemetry interfaces and safe defaults for all services.
- Make operational signals useful without making sensitive payload capture the default.

## Out of scope
Owning domain behavior, authorization decisions, or persistence tables belonging to product services.

## Acceptance criteria
- Correlation IDs can be propagated across API, orchestration, tools, queues, and providers.
- Sensitive payloads and secrets are excluded/redacted by default.
- Retention, access control, sampling, and outage behavior are documented.

## Status
Documentation only; no telemetry source, package manifest, tests, or CI workflow was found in the inspected default-branch tree.
