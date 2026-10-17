export class MemoryLogger {
    records = [];
    write(level, message, data) { this.records.push(Object.freeze({ level, message, at: Date.now(), data })); }
    clear() { this.records.length = 0; }
}
//# sourceMappingURL=logging.js.map