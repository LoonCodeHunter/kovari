export interface Limits {
    timeoutMs: number;
    maxBytes: number;
    concurrency: number;
    maxResults: number;
}
export interface Config {
    workspaceRoot: string;
    limits: Limits;
}
export declare function defineConfig(i?: Partial<Config>): Readonly<Config>;
//# sourceMappingURL=config.d.ts.map