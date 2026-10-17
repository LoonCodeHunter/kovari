export class ModelRegistry {
    #p = new Map();
    register(n, p) { if (this.#p.has(n))
        throw Error(`Provider exists: ${n}`); this.#p.set(n, p); return this; }
    get(n) { const p = this.#p.get(n); if (!p)
        throw Error(`Unknown provider: ${n}`); return p; }
    async fallback(names, r) { const e = []; for (const n of names)
        try {
            return await this.get(n).complete(r);
        }
        catch (x) {
            e.push(x);
        } throw new AggregateError(e, "All providers failed"); }
}
//# sourceMappingURL=models.js.map