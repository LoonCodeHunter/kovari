export interface Tool<I = unknown, O = unknown> {
    name: string;
    description: string;
    execute(input: I, c: {
        runId: string;
        signal?: AbortSignal;
    }): Promise<O>;
}
export declare class ToolRegistry {
    #private;
    register(t: Tool): this;
    list(): readonly {
        name: string;
        description: string;
    }[];
    execute<I, O>(n: string, i: I, c: {
        runId: string;
        signal?: AbortSignal;
    }): Promise<O>;
}
//# sourceMappingURL=tools.d.ts.map