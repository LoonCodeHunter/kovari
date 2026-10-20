export class McpClient {
    t;
    #ready = false;
    constructor(t) {
        this.t = t;
    }
    async initialise(s) { const x = await this.t.request("initialize", { clientInfo: { name: "kovari", version: "0.1.12" } }, s); this.#ready = true; return x; }
    async listTools(s) { if (!this.#ready)
        await this.initialise(s); return this.t.request("tools/list", {}, s); }
    async callTool(name, args, s) { if (!this.#ready)
        await this.initialise(s); return this.t.request("tools/call", { name, arguments: args }, s); }
}
//# sourceMappingURL=mcp.js.map