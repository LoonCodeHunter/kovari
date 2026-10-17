export interface McpTransport {
    request(method: string, params?: unknown, signal?: AbortSignal): Promise<unknown>;
    close?(): Promise<void>;
}
export declare class McpClient {
    #private;
    private t;
    constructor(t: McpTransport);
    initialise(s?: AbortSignal): Promise<unknown>;
    listTools(s?: AbortSignal): Promise<unknown>;
    callTool(name: string, args: unknown, s?: AbortSignal): Promise<unknown>;
}
//# sourceMappingURL=mcp.d.ts.map