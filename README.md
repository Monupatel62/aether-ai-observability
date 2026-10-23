# aether-ai-observability

**Status:** Documentation-only on the inspected `main` branch. No application implementation is present in the audited tree.

## Purpose

Shared observability contracts for structured logs, metrics, traces, correlation IDs, redaction, and retention controls.

## Dependencies

Provide dependency-light telemetry interfaces; avoid importing domain services or capturing sensitive payloads by default.

## Documentation

- [Repository specification](docs/REPOSITORY_SPECIFICATION.md)
- [Master repository catalog](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/REPOSITORY_CATALOG.md)
- [Master architecture](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/MASTER_ARCHITECTURE.md)

## Project rules

- No implementation starts until the documentation and cross-repository contracts are reviewed.
- Keep telemetry metadata-first; sensitive prompts, completions, credentials, and personal data are excluded by default.
- Document retention, redaction, access control, and operational failure behavior before enabling production telemetry.

## Repository documents

- [Project specification](docs/PROJECT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Dependencies and contracts](docs/DEPENDENCIES_AND_CONTRACTS.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Research and licenses](docs/RESEARCH_AND_LICENSES.md)
- [Technical design](docs/TECHNICAL_DESIGN.md)
- [Security review](docs/SECURITY_REVIEW.md)
- [Engineering standard](docs/ENGINEERING_STANDARD.md)
- [Work log](docs/WORKLOG.md)
