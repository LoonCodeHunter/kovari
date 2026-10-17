export class FakeModelProvider {
    answer;
    requests = [];
    constructor(answer = "Ready") {
        this.answer = answer;
    }
    async complete(r) { this.requests.push(r); return { text: this.answer, model: "fake", usage: { input: 0, output: 0 } }; }
}
//# sourceMappingURL=testing.js.map