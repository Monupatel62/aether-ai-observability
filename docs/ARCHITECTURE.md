# Architecture — aether-ai-observability

## Boundary
Expose small telemetry contracts that other components can implement or adapt. Domain services own business events; this repository owns shared signal conventions and safe collection rules.

## Flow
1. Create or accept a validated correlation/trace context at the service boundary.
2. Attach stable service/version/environment attributes.
3. Redact or omit sensitive values before export.
4. Apply sampling and retention rules.
5. Export through an adapter with bounded buffering and documented failure behavior.

## Failure behavior
Telemetry failure should not expose data or destabilize critical request paths by default. Security audit events must follow a separately approved durability policy; they must not be silently treated as ordinary debug logs.
