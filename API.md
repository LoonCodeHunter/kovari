# Kovari API Reference

The `exports` map in `package.json` defines the public compatibility boundary. The root import re-exports the primary runtime, while subpaths let applications depend on smaller capability groups without importing private `dist/` files.

## Main exported types and classes

| Export | Responsibility |
|---|---|
| `createKovari(options)` | Build the small SDK surface from a `ModelProvider` and optional runtime configuration |
| `Agent` | Run a prompt through a `ModelProvider`, emit lifecycle events and return a structured run result |
| `ModelProvider`, `ModelRequest`, `ModelResponse` | Provider adapter contract and response shape |
| `ModelRegistry` | Register named providers, resolve them, and attempt an ordered fallback list |
| `defineConfig()` | Apply runtime defaults and validate positive limits |
| `PolicyEngine` | Authorize declared effects using the configured policy functions |
| `EventBus` | Subscribe, emit, subscribe once, and clear handlers |
| `Workspace` | Perform path-contained reads/writes and sorted file enumeration under a configured root |
| `Semaphore` | Bound concurrent work |
| `createId()` and logging/testing helpers | Provide reusable IDs and deterministic test support |

## Provider contract

```ts
interface ModelRequest {
  prompt: string;
  system?: string;
  signal?: AbortSignal;
  metadata?: Readonly<Record<string, unknown>>;
}

interface ModelResponse {
  text: string;
  model?: string;
  usage?: { input: number; output: number };
}

interface ModelProvider {
  complete(request: ModelRequest): Promise<ModelResponse>;
}
```

Kovari does not contain API keys or automatically pick a model vendor. Implement the contract using the SDK/transport you select, propagate the abort signal, validate the result, and keep credentials in a host-owned secret store.

## Run an agent

```ts
import { Agent } from "kovari/agent";
import type { ModelProvider } from "kovari/models";

const model: ModelProvider = {
  async complete(request) {
    request.signal?.throwIfAborted();
    return { text: `Handled prompt (${request.prompt.length} chars)`, model: "test-adapter" };
  },
};

const agent = new Agent(model);
const stopListening = agent.events.on("agent.completed", (event) => {
  console.log("run id", event.correlationId);
});
try {
  const run = await agent.run({ prompt: "Summarize changed source files" }, AbortSignal.timeout(20_000));
  console.log(run.status, run.output);
} finally {
  stopListening();
}
```

An agent run authorizes the `model` effect before calling the provider. The provider is responsible for respecting cancellation during its own work. Use deterministic fake providers in unit tests rather than requiring a live model API for every CI run.

## Runtime configuration

`defineConfig()` returns a frozen configuration with `workspaceRoot` and positive integer limits for `timeoutMs`, `maxBytes`, `concurrency` and `maxResults`. The default workspace root is the current directory; production hosts should pass an explicit, narrow project root instead of relying on that default.

## Policies and effects

Kovari policies evaluate effects such as `model`, `tool`, `read`, `write`, `process` and `network`. A policy returns `{ allow: true, reason? }` or `{ allow: false, reason }`. The `PolicyEngine` rejects an effect if any configured policy denies it. Treat this as an explicit authorization boundary: do not let model-generated content alter policies without host approval.

## Event lifecycle

`EventBus.on(type, handler)` and `once(type, handler)` return unsubscribe functions. `emit(type, data, correlationId?)` awaits registered handlers, including wildcard `*` handlers. Unsubscribe when the owning view/session ends, and keep handlers fast: slow handler work contributes to the awaited emit duration.

## Workspace safety

`Workspace.path()` rejects lexical paths outside the root. `Workspace.safePath()` additionally rejects existing symlink components below the root, and is used by the workspace read/write/file enumeration APIs. These checks are defense in depth, not an OS sandbox; keep an untrusted workspace in a dedicated directory and use OS-level isolation for subprocesses/extensions.

## Subpaths

The package exposes focused module imports such as `kovari/agent`, `kovari/models`, `kovari/security`, `kovari/events`, `kovari/workspace`, `kovari/config`, `kovari/tools`, `kovari/mcp` and `kovari/testing`. See `package.json` for the exact export map shipped with the current version.

## Integration boundary

For Kovari Code IDE, this package supplies orchestration contracts and primitives. The desktop host supplies the prompt UI, provider credentials, settings persistence, consent dialogs, real tool implementations, process sandboxing, telemetry and user-facing error recovery. See [provider integration](./docs/PROVIDER-INTEGRATION.md), [workspace safety](./docs/WORKSPACE-SAFETY.md) and [the architecture guide](./ARCHITECTURE.md).
