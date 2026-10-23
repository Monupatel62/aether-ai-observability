# Security Review — aether-ai-observability

Status: review checklist; no implementation or test evidence is present.

## Threats
leakage of prompts/completions/credentials, tenant identifiers in high-cardinality labels, telemetry access abuse, over-retention, and silent loss of critical signals.

## Required controls
- [ ] Metadata-only collection by default; explicit opt-in for any sensitive capture.
- [ ] Redaction at source and before export.
- [ ] Least-privilege access, query audit, and retention limits.
- [ ] Cardinality caps and protection against log injection.
- [ ] Safe exporter outage and buffer overflow behavior.
- [ ] Secrets, dependency, and configuration scans before release.

## Required tests
Test secret canary redaction, trace correlation across boundaries, retention expiry, sampling, tenant-safe dimensions, telemetry backend outage, and health/readiness response redaction. Use synthetic canary values only.
