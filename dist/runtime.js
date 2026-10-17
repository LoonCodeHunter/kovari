export async function retry(fn, o = {}) { let err; for (let a = 1; a <= (o.attempts ?? 3); a++) {
    o.signal?.throwIfAborted();
    try {
        return await fn(a);
    }
    catch (e) {
        err = e;
        if (a < (o.attempts ?? 3) && o.delayMs)
            await new Promise(r => setTimeout(r, o.delayMs));
    }
} throw err; }
export class Semaphore {
    limit;
    #active = 0;
    #wait = [];
    constructor(limit = 4) {
        this.limit = limit;
        if (!Number.isInteger(limit) || limit < 1)
            throw RangeError("limit");
    }
    async run(fn) { if (this.#active >= this.limit)
        await new Promise(r => this.#wait.push(r)); this.#active++; try {
        return await fn();
    }
    finally {
        this.#active--;
        this.#wait.shift()?.();
    } }
}
//# sourceMappingURL=runtime.js.map