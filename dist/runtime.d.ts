export declare function retry<T>(fn: (attempt: number) => Promise<T>, o?: {
    attempts?: number;
    delayMs?: number;
    signal?: AbortSignal;
}): Promise<T>;
export declare class Semaphore {
    #private;
    readonly limit: number;
    constructor(limit?: number);
    run<T>(fn: () => Promise<T>): Promise<T>;
}
//# sourceMappingURL=runtime.d.ts.map