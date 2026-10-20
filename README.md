<div align="center">
  <img src="https://raw.githubusercontent.com/LoonCodeHunter/kovari/main/assets/icon.png" width="160" alt="Kovari runtime icon" />
  <h1>Kovari</h1>
  <p><strong>A typed, policy-aware runtime for AI agents, tools, events and workspace workflows.</strong></p>
  <p>
    <a href="https://www.npmjs.com/package/kovari"><img src="https://img.shields.io/badge/version-v0.1.12-6757ff?style=flat" alt="Version v0.1.12" /></a>
    <a href="https://www.npmjs.com/package/kovari"><img src="https://img.shields.io/npm/dt/kovari?style=flat&amp;logo=npm&amp;logoColor=white&amp;label=downloads" alt="Downloads" /></a>
    <a href="https://github.com/LoonCodeHunter/kovari/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/LoonCodeHunter/kovari/ci.yml?branch=main&amp;style=flat&amp;label=CI" alt="CI status" /></a>
    <a href="https://github.com/LoonCodeHunter/kovari/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-238636?style=flat&amp;logo=opensourceinitiative&amp;logoColor=white" alt="MIT licence" /></a>
    <img src="https://img.shields.io/badge/Node.js-%3E%3D20-339933?style=flat&amp;logo=nodedotjs&amp;logoColor=white" alt="Node.js 20 or newer" />
    <a href="https://github.com/LoonCodeHunter/kovari"><img src="https://img.shields.io/badge/ESM-first-444444?style=flat" alt="ESM-first" /></a>
  </p>
</div>

> **Version policy:** the `version-v0.1.12` badge follows this repository's `package.json`. It does not report the npm `latest` tag. Check the npm package page for publication status.

## Overview

`kovari` is the shared runtime layer for Kovari Code IDE. It provides the contracts and reusable building blocks that higher-level products can compose: model-provider interfaces, agent execution, validated runtime configuration, event delivery, policy decisions, concurrency helpers, tools, MCP client primitives, logging, test doubles and workspace operations.

The package is deliberately **not a hosted AI model** and does not include API credentials or automatically choose a provider. Your application supplies a `ModelProvider` implementation and decides which effects its policies allow.

### Who is it for?

- **IDE and desktop developers** building the service layer behind prompts, agent runs, model adapters, tool dispatch and progress events.
- **Web developers** who need typed orchestration contracts on a server-side Node.js service. Browser applications should call a controlled backend rather than expose model secrets.
- **Tool and plugin authors** who want to share model, event, policy and workspace interfaces instead of implementing a separate runtime for every integration.
- **Test authors** who need deterministic model stubs and predictable event handling without making live model requests.

## What Kovari does—and does not do

| Kovari provides | Your host application still owns |
|---|---|
| Agent task orchestration and provider contracts | The model vendor, credentials, billing and network connection |
| Event and policy abstractions | Product-specific consent UI and policy decisions |
| Typed configuration and concurrency utilities | Persistent settings storage and user preferences |
| Workspace reads/writes with lexical containment and symlink checks | Process isolation, OS sandboxing and race-free filesystem mediation |
| MCP request primitives and tool contracts | Transport setup, server selection, trust prompts and tool-specific security |
| Testing helpers and release checks | Real-provider integration tests and production monitoring |

## Compatibility

| Requirement | Supported configuration |
|---|---|
| Package version | `0.1.12` |
| Node.js | `>=20` |
| npm | `>=10` |
| Module format | ESM (`"type": "module"`) |
| Language | TypeScript source with emitted JavaScript and declarations |
| Runtime dependencies | None declared by this package |
| Licence | MIT |

The root and selected subpaths are explicit in the package `exports` map. Use the public paths documented below; do not import private files from `dist/`.

## Installation

```bash
npm install kovari
```

For a reproducible local development install from this repository:

```bash
npm ci
```

Kovari is ESM-first. Use `import` from an ESM application or use `await import("kovari")` from a CommonJS boundary. The package does not bundle a particular AI provider.

## Quick start

The example uses a tiny fake provider so the first run is deterministic and does not need an API key.

```js
import { createKovari } from "kovari";

const model = {
  async complete({ prompt }) {
    return { text: `Kovari received: ${prompt}`, model: "example-stub" };
  },
};

const app = createKovari({
  model,
  config: {
    workspaceRoot: process.cwd(),
    limits: {
      timeoutMs: 30_000,
      maxBytes: 2_000_000,
      concurrency: 4,
      maxResults: 100,
    },
  },
});

const run = await app.agent.run({ prompt: "Summarise the purpose of this project." });
console.log(run.status, run.output);
```

`createKovari()` returns a frozen application object containing the resolved config, a `Workspace`, and an `Agent`. A production provider should implement cancellation and safe error handling, avoid logging secrets, and apply its own request and cost limits.

## Core concepts

### Model providers

A provider implements the public `ModelProvider` interface:

```ts
export interface ModelRequest {
  prompt: string;
  system?: string;
  signal?: AbortSignal;
  metadata?: Readonly<Record<string, unknown>>;
}

export interface ModelResponse {
  text: string;
  model?: string;
  usage?: { input: number; output: number };
}

export interface ModelProvider {
  complete(request: ModelRequest): Promise<ModelResponse>;
}
```

Keep the provider adapter separate from agent logic. Validate output at your integration boundary, treat model output as untrusted content, and propagate abort signals when the upstream provider supports cancellation.

### Agent runs

`Agent.run({ prompt, system? }, signal?)` checks cancellation, authorizes a model effect through its policy engine, emits lifecycle events and returns a completed run record. Provider exceptions are rethrown after the failure event is emitted.

```js
const unsubscribe = app.agent.events?.on?.("agent.completed", (event) => {
  console.log("Completed run", event.data.runId);
});

try {
  const result = await app.agent.run({ prompt: "Explain the entry point." });
  console.log(result.output);
} finally {
  unsubscribe?.();
}
```

For API certainty, prefer subscribing to the `EventBus` instance you explicitly pass to an `Agent` when you need lifecycle events across components. Avoid depending on non-public implementation details of the SDK object.

### Configuration

`defineConfig()` validates the small runtime config and applies defaults:

| Field | Default | Description |
|---|---:|---|
| `workspaceRoot` | `"."` | Root used by the Workspace abstraction |
| `limits.timeoutMs` | `120000` | Default work timeout in milliseconds |
| `limits.maxBytes` | `2000000` | Maximum bytes a workspace `read()` accepts |
| `limits.concurrency` | `4` | Default concurrency passed to higher-level helpers |
| `limits.maxResults` | `200` | Default result ceiling for consuming tools |

All limits must be positive integers. These values are library configuration, not a substitute for a host-level resource quota. The config is frozen after construction.

```ts
import { defineConfig } from "kovari/config";

const config = defineConfig({
  workspaceRoot: "./workspace",
  limits: { timeoutMs: 45_000, maxBytes: 1_000_000, concurrency: 2, maxResults: 50 },
});
```

### Policies and effects

The `PolicyEngine` evaluates registered policy functions for effects such as `model`, `tool`, `read`, `write`, `process` and `network`. Any policy returning `allow: false` causes authorization to fail. Define explicit rules around sensitive effects, especially writes, process execution and network access.

```ts
import { PolicyEngine } from "kovari/security";

const policy = new PolicyEngine([
  ({ effect, resource }) => {
    if (effect === "model" || effect === "read") return { allow: true };
    if (effect === "process" && resource === "git") return { allow: true, reason: "Git allow-list" };
    return { allow: false, reason: `Needs explicit approval: ${effect}` };
  },
]);
```

**Important:** a `PolicyEngine` constructed with an empty policy list has no deny rule and therefore falls through to allow in this version. Do not use an empty engine as a security boundary; register an explicit deny-by-default policy when effects are sensitive. `@kovari/code@0.2.0` provides a conservative `createCodePolicy()` helper for its command/edit features.

### Events

The `EventBus` supports named handlers, wildcard handlers, one-time subscriptions, awaited delivery and clearing subscriptions. Use the cleanup function returned by `on()` or `once()` when a UI panel unmounts or an operation finishes.

```js
import { EventBus } from "kovari/events";

const events = new EventBus();
const unsubscribe = events.on("agent.completed", (event) => {
  console.log(event.type, event.data);
});

await events.emit("agent.completed", { status: "completed" }, "run-123");
unsubscribe();
```

Handlers are awaited as a group by `emit()`. Keep event handlers short, handle rejected handlers at the call site, and avoid including API tokens, prompts that contain secrets, or private source text in diagnostic event payloads.

### Workspace access

The `Workspace` abstraction resolves requested paths beneath a configured root and applies file-size limits. Version `0.1.12` adds `safePath()` checks that reject symlink components below the root for `read`, `write` and recursive enumeration, and ignores symlinks when listing directory entries.

```js
import { Workspace } from "kovari/workspace";

const workspace = new Workspace("./project", 1_000_000);
const files = await workspace.files();
const source = await workspace.read("src/index.ts");
await workspace.write(".kovari/summary.txt", `Files found: ${files.length}\n${source.length} source characters\n`);
```

The symlink checks are a defence-in-depth guard against static project symlinks. They are **not a complete operating-system sandbox** and cannot provide race-free isolation against a hostile process that can mutate the filesystem concurrently. Do not run untrusted extension code with unrestricted process or filesystem permissions.

## Public module map

| Import path | Intended content |
|---|---|
| `kovari` | Main exports, SDK factory and primary contracts |
| `kovari/config` | `Config`, `defineConfig()` and runtime limits |
| `kovari/core` | Core identifier/JSON utilities |
| `kovari/events` | Event records and `EventBus` |
| `kovari/runtime` | Runtime orchestration helpers |
| `kovari/security` | Effect types, policy decisions and `PolicyEngine` |
| `kovari/logging` | Logging interfaces/helpers |
| `kovari/models` | `ModelProvider`, `ModelRequest`, `ModelResponse`, registry |
| `kovari/tools` | Tool definitions and execution contracts |
| `kovari/mcp` | MCP client/transport contracts |
| `kovari/workspace` | Workspace file access |
| `kovari/agent` | Agent run API |
| `kovari/testing` | Deterministic fake model provider and test helpers |
| `kovari/sdk` | `createKovari()` factory |

The package's `package.json` `exports` map is authoritative if a future release adds, removes or renames a path.

## How it fits into Kovari Code IDE

- **Desktop app:** own the application lifecycle, secure storage, explicit permission prompts and model-provider credentials. Use Kovari for agent orchestration and progress events, and `@kovari/code` for repository tools after setting policy rules.
- **IDE extension host:** keep long-running model operations cancellable and surface agent events as status updates. Do not block the extension host on expensive synchronous work.
- **Website / web API:** keep model credentials and file-system access on the server. The future Kovari Code website can use a backend service built around these same contracts; browser code should not import Node-only workspace or filesystem operations.
- **KCBF extensions:** `@kovari/kciep` handles archive packaging and verification. KCBF installation and execution policy still belongs to a trusted host that consumes the format.

These packages are building blocks, not an automatic hosted service. Your application supplies UI, model providers, storage, authentication, billing and infrastructure.

## Development and test commands

Use Node.js `>=20` and npm `>=10`.

```bash
npm install
npm ci
npm run typecheck
npm run build
npm run build:verify
npm run test:unit
npm run test:integration
npm run test:all
npm run validate
npm run check
npm run pack:verify
npm run pack:dry
npm run publish:dry
npm run release:check
npm run security
```

| Command | Purpose |
|---|---|
| `npm run typecheck` | Type-check without emitting files |
| `npm run build` | Clean and emit JS plus declarations/maps |
| `npm run test:all` | Run unit and integration test groups |
| `npm run validate` | Check source files, package exports/assets, lockfile and publish metadata |
| `npm run release:check` | Run all release validations and pack/publish dry-runs |
| `npm run security` | Run `npm audit --audit-level=high`; needs registry connectivity |

`npm pack --dry-run` and `npm publish --dry-run` prove local packaging metadata is coherent; neither proves that your npm account owns a package name or has publish permission.

## Security practices

1. Use explicit policy functions for `write`, `process`, `tool` and `network` effects.
2. Keep prompts and repository contents as untrusted input; model output can contain malformed or malicious instructions.
3. Give the model only the tools needed for the current task.
4. Apply host-level limits and cancellation, including timeouts, output-size caps and request budgets.
5. Do not expose secrets in logs or events.
6. Treat extension signatures as identity/integrity evidence, not proof that the code is safe to execute.
7. Keep dependencies locked and review `npm audit` output as a separate security gate.

See [SECURITY.md](./SECURITY.md) and [ARCHITECTURE.md](./ARCHITECTURE.md) for additional design notes.

## Troubleshooting

### `ERR_PACKAGE_PATH_NOT_EXPORTED`

Use a documented root/subpath import shown in the module map. Avoid importing `kovari/dist/...` directly.

### Workspace throws `Workspace escape`

The requested path normalizes outside `workspaceRoot`. Pass a project-relative path, and do not use `..` to reach siblings.

### Workspace throws `Workspace symlinks are not allowed`

The path contains a symlink under the root. Move the relevant file into the workspace as a regular file or implement a host-specific symlink policy outside the default Workspace boundary.

### Agent or provider call fails

Check the provider implementation, cancellation signal, response shape and policy authorization. A local stub is a good way to distinguish runtime behaviour from vendor/API issues.

### `npm ci` fails

Confirm the lockfile matches `package.json`, the selected Node/npm versions meet `engines`, and the npm registry is reachable. Do not delete the lockfile to silence a mismatch; regenerate it intentionally and commit it.

## Release checklist

- [ ] Update `package.json`, `package-lock.json`, `src/core.ts`, the MCP client version string and `CHANGELOG.md` together.
- [ ] Run `npm ci` from a clean checkout.
- [ ] Run `npm run release:check` on the supported Node matrix.
- [ ] Check exports and verify the resulting tarball with `npm pack --dry-run`.
- [ ] Review security policy defaults and workspace regression tests.
- [ ] Publish only a version that is not already present on npm.
- [ ] Tag the matching source commit and monitor CI after release.

## Production integration guides

- [Model provider adapters](./docs/PROVIDER-INTEGRATION.md) — implement the `ModelProvider` contract without coupling the runtime to a specific vendor.
- [Workspace safety](./docs/WORKSPACE-SAFETY.md) — path validation, symlinks, resource bounds and remaining OS-level limits.
- [API reference](./API.md) · [Architecture](./ARCHITECTURE.md) · [Security notes](./SECURITY.md) · [Development guide](./DEVELOPMENT.md)

### Use in Kovari Code IDE

Kovari is the orchestration layer behind model calls, agent runs, structured events, policies and workspace-aware operations. The desktop app supplies actual provider credentials, user consent, tool implementations, settings persistence, process isolation and the UI. Keep browser clients on a trusted backend; never ship model secrets in front-end code.

## Licence

MIT. See [LICENSE](./LICENSE).

> **Automated publishing:** the GitHub Release workflow needs an Actions repository secret named `NPM_TOKEN` with publish permission, unless you deliberately configure npm trusted publishing and adapt the workflow to it. Never commit the token.


---

*Kovari Code IDE ecosystem: `www.kovaricode.com` is planned; the website link will be activated after the domain and site are live.*
