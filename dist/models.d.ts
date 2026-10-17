export interface ModelRequest {
    prompt: string;
    system?: string;
    signal?: AbortSignal;
    metadata?: Readonly<Record<string, unknown>>;
}
export interface ModelResponse {
    text: string;
    model?: string;
    usage?: {
        input: number;
        output: number;
    };
}
export interface ModelProvider {
    complete(r: ModelRequest): Promise<ModelResponse>;
}
export declare class ModelRegistry {
    #private;
    register(n: string, p: ModelProvider): this;
    get(n: string): ModelProvider;
    fallback(names: readonly string[], r: ModelRequest): Promise<ModelResponse>;
}
//# sourceMappingURL=models.d.ts.map