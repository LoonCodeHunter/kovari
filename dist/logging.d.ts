export interface LogRecord {
    level: "debug" | "info" | "warn" | "error";
    message: string;
    at: number;
    data?: unknown;
}
export declare class MemoryLogger {
    readonly records: LogRecord[];
    write(level: LogRecord["level"], message: string, data?: unknown): void;
    clear(): void;
}
//# sourceMappingURL=logging.d.ts.map