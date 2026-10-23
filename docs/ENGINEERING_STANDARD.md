# Engineering Standard — aether-ai-observability

- Use structured, typed telemetry fields and stable naming conventions.
- Prefer allowlisted attributes and metadata-only logs.
- Never place secrets, prompts, completions, or raw file contents in default logs.
- Keep high-cardinality identifiers out of metric labels.
- Make exporter buffers bounded and shutdown behavior explicit.
- Test redaction and failure modes with synthetic canary values.
- Document dashboards and alert ownership with each operational signal change.
- Do not claim telemetry retention/security compliance without configuration and test evidence.
