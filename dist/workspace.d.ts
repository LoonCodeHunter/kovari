export declare class Workspace {
    readonly maxBytes: number;
    readonly root: string;
    constructor(root: string, maxBytes?: number);
    path(x: string): string;
    read(x: string): Promise<string>;
    write(x: string, t: string): Promise<void>;
    files(d?: string): Promise<string[]>;
}
//# sourceMappingURL=workspace.d.ts.map