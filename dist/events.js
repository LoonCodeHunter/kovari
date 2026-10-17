import { createId } from "./core.js";
export class EventBus {
    #m = new Map();
    on(type, h) { const s = this.#m.get(type) ?? new Set(); s.add(h); this.#m.set(type, s); return () => s.delete(h); }
    once(type, h) { const off = this.on(type, async (e) => { off(); await h(e); }); return off; }
    async emit(type, data, correlationId) { const e = { id: createId("evt"), type, at: Date.now(), data, ...(correlationId ? { correlationId } : {}) }; await Promise.all([...(this.#m.get(type) ?? []), ...(this.#m.get("*") ?? [])].map(h => h(e))); return e; }
    clear() { this.#m.clear(); }
}
//# sourceMappingURL=events.js.map