import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
export class Workspace {
    maxBytes;
    root;
    constructor(root, maxBytes = 2_000_000) {
        this.maxBytes = maxBytes;
        this.root = resolve(root);
    }
    path(x) { const p = resolve(this.root, x), rel = relative(this.root, p); if (rel === ".." || rel.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) || isAbsolute(rel))
        throw Error("Workspace escape"); return p; }
    async read(x) { const p = this.path(x), s = await stat(p); if (s.size > this.maxBytes)
        throw RangeError("File too large"); return readFile(p, "utf8"); }
    async write(x, t) { const p = this.path(x); await mkdir(dirname(p), { recursive: true }); await writeFile(p, t, "utf8"); }
    async files(d = ".") { const b = this.path(d), o = []; for (const e of await readdir(b, { withFileTypes: true })) {
        const rel = relative(this.root, join(b, e.name));
        e.isDirectory() ? o.push(...await this.files(rel)) : e.isFile() && o.push(rel);
    } return o.sort(); }
}
//# sourceMappingURL=workspace.js.map