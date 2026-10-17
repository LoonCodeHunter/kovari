# Kovari Architecture

The architecture uses a compact layered model. Core configuration and event primitives sit below policy and runtime controls. The product-specific layer provides auditable AI agent runtime. The SDK composes the layers without global mutable state.

## Kovari product integration
The future Kovari IDE should call the public SDK through a narrow host adapter. Desktop filesystem and process privileges should remain in the privileged host process. Renderer and web surfaces should exchange serialisable requests and results rather than receiving raw operating-system capabilities.
