import { Agent } from "./agent.js";
import { defineConfig } from "./config.js";
import { Workspace } from "./workspace.js";
export function createKovari(o) { const config = defineConfig(o.config); return Object.freeze({ config, workspace: new Workspace(config.workspaceRoot, config.limits.maxBytes), agent: new Agent(o.model) }); }
export default createKovari;
//# sourceMappingURL=sdk.js.map