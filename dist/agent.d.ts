import { EventBus } from "./events.js";
import type { ModelProvider } from "./models.js";
import { PolicyEngine } from "./security.js";
export declare class Agent {
    private model;
    readonly events: EventBus;
    readonly policy: PolicyEngine;
    constructor(model: ModelProvider, events?: EventBus, policy?: PolicyEngine);
    run(task: {
        prompt: string;
        system?: string;
    }, signal?: AbortSignal): Promise<Readonly<{
        runId: string;
        status: "completed";
        output: string;
        startedAt: number;
        completedAt: number;
    }>>;
}
//# sourceMappingURL=agent.d.ts.map