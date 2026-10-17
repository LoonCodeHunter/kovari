export class PolicyEngine {
    p;
    constructor(p = []) {
        this.p = p;
    }
    async authorize(r) { for (const p of this.p) {
        const d = await p(r);
        if (!d.allow)
            throw Error(`Policy denied ${r.effect}: ${d.reason}`);
    } return { allow: true }; }
}
//# sourceMappingURL=security.js.map