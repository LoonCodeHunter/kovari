import { Agent } from "./agent.js";
import { type Config } from "./config.js";
import type { ModelProvider } from "./models.js";
import { Workspace } from "./workspace.js";
export declare function createKovari(o: {
    model: ModelProvider;
    config?: Partial<Config>;
}): Readonly<{
    config: Readonly<Config>;
    workspace: Workspace;
    agent: Agent;
}>;
export default createKovari;
//# sourceMappingURL=sdk.d.ts.map