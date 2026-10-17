import { createId } from "./core.js";
import { EventBus } from "./events.js";
import { PolicyEngine } from "./security.js";
export class Agent {
    model;
    events;
    policy;
    constructor(model, events = new EventBus(), policy = new PolicyEngine()) {
        this.model = model;
        this.events = events;
        this.policy = policy;
    }
    async run(task, signal) { signal?.throwIfAborted(); const runId = createId("run"), startedAt = Date.now(); await this.policy.authorize({ effect: "model" }); await this.events.emit("agent.started", task, runId); try {
        const x = await this.model.complete({ prompt: task.prompt, ...(task.system ? { system: task.system } : {}), ...(signal ? { signal } : {}) }), r = Object.freeze({ runId, status: "completed", output: x.text, startedAt, completedAt: Date.now() });
        await this.events.emit("agent.completed", r, runId);
        return r;
    }
    catch (error) {
        await this.events.emit("agent.failed", { error }, runId);
        throw error;
    } }
}
//# sourceMappingURL=agent.js.map