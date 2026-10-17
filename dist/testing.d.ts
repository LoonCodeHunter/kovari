import type { ModelRequest } from "./models.js";
export declare class FakeModelProvider {
    private answer;
    readonly requests: ModelRequest[];
    constructor(answer?: string);
    complete(r: ModelRequest): Promise<{
        text: string;
        model: string;
        usage: {
            input: number;
            output: number;
        };
    }>;
}
//# sourceMappingURL=testing.d.ts.map