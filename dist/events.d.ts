export interface Event<T = unknown> {
    id: string;
    type: string;
    at: number;
    correlationId?: string;
    data: T;
}
export type Handler = (event: Event) => void | Promise<void>;
export declare class EventBus {
    #private;
    on(type: string, h: Handler): () => boolean;
    once(type: string, h: Handler): () => boolean;
    emit<T>(type: string, data: T, correlationId?: string): Promise<{
        correlationId?: string;
        id: string;
        type: string;
        at: number;
        data: T;
    }>;
    clear(): void;
}
//# sourceMappingURL=events.d.ts.map