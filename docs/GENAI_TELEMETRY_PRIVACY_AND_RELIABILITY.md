# GenAI Telemetry Privacy and Reliability Contract

**Status:** proposed contract and acceptance criteria only. No runtime redaction, exporter, or retention control is claimed implemented.

## Scope and ownership

This repository defines shared telemetry conventions and safe collection/export behavior. Domain services own business events and their authorization decisions. Security audit events require a separately approved durability and access policy; they must not be silently downgraded to debug telemetry. This document does not select a telemetry backend, region, retention period, or compliance posture.

## Default collection policy

Collect metadata needed for reliability and incident correlation by default: timestamp, service name/version, environment, operation, outcome, duration, correlation/trace ID, and a bounded error category.

Do not collect raw prompts, completions, system instructions, retrieved passages, uploaded file contents, provider request/response bodies, authorization headers, cookies, API keys, session tokens, or personal data by default. If a product requirement proposes sensitive-content capture, require explicit documented purpose, authorized opt-in, field-level allowlist, access restrictions, retention/deletion rules, and privacy/security review before enabling it. A generic debug flag must not silently override this policy.

## Redaction and schema discipline

- Prefer allowlisted telemetry fields at source over broad payload capture followed by best-effort scrubbing.
- Redact known secret-bearing fields before local logging and again at the export boundary as defense in depth.
- Do not put tenant, user, conversation, file, or resource IDs into unrestricted metric labels. Use bounded classifications; place identifiers in access-controlled traces/logs only where justified.
- Normalize error categories and cap lengths of externally supplied strings. Escape or reject control characters to prevent log injection.
- Never return exporter credentials, internal endpoints, topology, or raw provider errors in public health/readiness responses.
- Keep security decisions and audit events distinguishable from performance/debug telemetry, with explicit access and durability semantics.

## Reliability and failure modes

Export queues/buffers must have explicit bounds, flush deadlines, retry/backoff limits, and overflow behavior. Exporter outage must not indefinitely block critical request paths or cause unbounded memory growth. Expose counters for dropped/sampled signals without including sensitive content. Define which signals may be dropped and which require durable delivery before implementation.

Sampling rules must not create an unreviewed blind spot for security-relevant outcomes. Do not sample away the only record of a privileged action, authorization denial, or policy/revocation event if the approved audit policy requires it to be retained.

## Retention, access, and deletion

Retention duration, region, storage backend, query access, and deletion behavior remain open decisions. Before production, document retention by signal class, access roles, query audit, backup/deletion behavior, and how tenant deletion or account closure affects stored telemetry. Do not claim legal compliance until the actual deployment and operational evidence are reviewed.

## Proposed acceptance matrix

These are future acceptance tests, not tests already run.

| Area | Acceptance case |
|---|---|
| Secret redaction | Synthetic canary secrets in headers, provider errors, and structured fields never appear in exported telemetry |
| Payload privacy | Prompts, completions, file contents, and retrieved passages are absent in default collection |
| Opt-in capture | Sensitive capture remains disabled unless the documented authorization/configuration gate is satisfied |
| Cardinality | Tenant/user/resource identifiers cannot create unrestricted metric label values |
| Injection | Newlines/control characters in external fields cannot forge additional log records |
| Health output | Public health/readiness responses do not disclose secrets or internal topology |
| Correlation | Correlation and trace IDs connect events across boundaries without requiring payload capture |
| Sampling | Required security/audit signals follow their separately approved durability policy |
| Export outage | Buffer remains bounded, request path remains bounded, and loss is measurable |
| Retention | Expired synthetic records are no longer queryable after the configured retention process completes |
| Access | Unauthorized telemetry queries are denied and access attempts are auditable |
| Deletion | Approved deletion workflow covers telemetry and documents backup limitations |
| Schema evolution | Consumer/dashboard impact is identified for renamed or removed attributes |

## Release evidence required

Record the exact telemetry SDK/exporter versions, enabled fields, redaction rules, sampling behavior, buffer limits, retention/access policy, failure-mode tests, and known gaps. Test with synthetic canary values, not real user prompts or production secrets. A redaction unit test alone does not prove every export path is safe.

## Related documents

- [Security review checklist](SECURITY_REVIEW.md)
- [Architecture](ARCHITECTURE.md)
- [Dependencies and contracts](DEPENDENCIES_AND_CONTRACTS.md)
- [Platform retention, deletion, export and telemetry policy](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/DATA_RETENTION_DELETION_EXPORT_TELEMETRY_POLICY.md)
- [Platform architecture audit](https://github.com/Monupatel62/aether-ai-platform/blob/main/docs/ARCHITECTURE_AUDIT.md)

## Open decisions

Telemetry backend, retention periods, residency, sampling defaults, audit durability, sensitive-capture approval workflow, and numeric reliability targets require explicit ADRs and deployment evidence.
