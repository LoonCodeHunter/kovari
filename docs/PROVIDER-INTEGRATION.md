# Model Provider Integration

Kovari defines a small `ModelProvider` contract so the runtime does not have to hard-code a vendor SDK or store credentials. Implement the interface with the provider library you select and keep secrets in the host's secret store.

## Contract

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

## Minimal adapter with an injected client

The client here is a placeholder for your own vendor SDK; it is deliberately not an HTTP endpoint or vendor-specific API.

```ts
import type { ModelProvider, ModelRequest, ModelResponse } from "kovari/models";

type TextClient = {
  complete(input: { prompt: string; system?: string; signal?: AbortSignal }): Promise<{ text: string; model?: string }>;
};

export class ClientAdapter implements ModelProvider {
  constructor(private readonly client: TextClient) {}

  async complete(request: ModelRequest): Promise<ModelResponse> {
    const response = await this.client.complete({
      prompt: request.prompt,
      ...(request.system ? { system: request.system } : {}),
      ...(request.signal ? { signal: request.signal } : {}),
    });
    return { text: response.text, ...(response.model ? { model: response.model } : {}) };
  }
}
```

Validate provider output, handle provider-specific rate limits in the adapter, and propagate cancellation. Do not log prompts or model responses by default because they may contain source code or user secrets.

## Run an agent and observe events

```ts
import { Agent } from "kovari/agent";
import type { ModelProvider } from "kovari/models";

const model: ModelProvider = {
  async complete(request) {
    request.signal?.throwIfAborted();
    return { text: `Received ${request.prompt.length} characters`, model: "local-test" };
  },
};

const agent = new Agent(model);
const unsubscribe = agent.events.on("agent.completed", (event) => {
  console.log("Completed run id:", event.correlationId);
});
try {
  const result = await agent.run({ prompt: "Summarize the selected files" }, AbortSignal.timeout(30_000));
  console.log(result.status, result.output);
} finally {
  unsubscribe();
}
```

A production host should use a user-visible cancellation control, limit concurrent calls, expose progress states and implement retries according to provider semantics rather than blindly retrying every error.

## Provider adapter checklist

- Read credentials from a secret store or environment supplied by the host; never commit secrets.
- Propagate `AbortSignal` to network operations.
- Validate response shape and cap response size before returning it.
- Distinguish network, rate-limit, cancellation and model-output errors.
- Avoid collecting prompt/response content in telemetry unless the user opts in.
- Test with deterministic stub responses in CI; keep real provider tests opt-in.
