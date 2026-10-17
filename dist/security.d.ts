export type Effect = "model" | "tool" | "read" | "write" | "process" | "network";
export type Decision = {
    allow: true;
    reason?: string;
} | {
    allow: false;
    reason: string;
};
export type Policy = (r: {
    effect: Effect;
    resource?: string;
}) => Decision | Promise<Decision>;
export declare class PolicyEngine {
    private p;
    constructor(p?: readonly Policy[]);
    authorize(r: {
        effect: Effect;
        resource?: string;
    }): Promise<{
        readonly allow: true;
    }>;
}
//# sourceMappingURL=security.d.ts.map