export class ToolRegistry {
    #t = new Map();
    register(t) { if (this.#t.has(t.name))
        throw Error(`Tool exists: ${t.name}`); this.#t.set(t.name, t); return this; }
    list() { return Object.freeze([...this.#t.values()].map(({ name, description }) => ({ name, description }))); }
    execute(n, i, c) { const t = this.#t.get(n); if (!t)
        throw Error(`Unknown tool: ${n}`); return t.execute(i, c); }
}
//# sourceMappingURL=tools.js.map