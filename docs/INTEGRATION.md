# Product integration

`kovari` is designed as a library boundary beneath the future Kovari IDE and related products. Product hosts should introduce adapters around the SDK for persistence, telemetry backends, user approvals and UI messaging. Keep privileged desktop effects out of browser-facing code and preserve cancellation and correlation identifiers across boundaries.
