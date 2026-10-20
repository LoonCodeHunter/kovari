import { lstat, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
function isWithinRoot(root, target) {
    const rel = relative(root, target);
    return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}
/**
 * Workspace-bound file access for Kovari consumers.
 *
 * `path()` performs lexical containment checks. `safePath()` additionally
 * rejects existing symlink components below the workspace root. This strict
 * default avoids following project-provided symlinks into unrelated paths.
 */
export class Workspace {
    maxBytes;
    root;
    constructor(root, maxBytes = 2_000_000) {
        this.maxBytes = maxBytes;
        this.root = resolve(root);
        if (!Number.isInteger(maxBytes) || maxBytes <= 0) {
            throw new RangeError("maxBytes must be a positive integer");
        }
    }
    /** Resolve a path and reject lexical traversal outside the configured root. */
    path(input) {
        if (typeof input !== "string" || input.length === 0 || input.includes("\0")) {
            throw new TypeError("Workspace path must be a non-empty string without NUL bytes");
        }
        const target = resolve(this.root, input);
        if (!isWithinRoot(this.root, target))
            throw new Error("Workspace escape");
        return target;
    }
    /**
     * Validate existing path components and return the contained lexical path.
     * Missing components are allowed so callers can safely create new files.
     * Symlinks below the root are rejected, including links that point back into
     * the workspace, to keep behaviour deterministic across platforms.
     */
    async safePath(input) {
        const target = this.path(input);
        const rel = relative(this.root, target);
        if (!rel)
            return target;
        let cursor = this.root;
        for (const segment of rel.split(sep).filter(Boolean)) {
            cursor = join(cursor, segment);
            try {
                const info = await lstat(cursor);
                if (info.isSymbolicLink()) {
                    throw new Error(`Workspace symlinks are not allowed: ${relative(this.root, cursor)}`);
                }
            }
            catch (error) {
                if (error.code === "ENOENT")
                    break;
                throw error;
            }
        }
        return target;
    }
    async read(input) {
        const target = await this.safePath(input);
        const info = await stat(target);
        if (!info.isFile())
            throw new Error("Workspace read target must be a regular file");
        if (info.size > this.maxBytes)
            throw new RangeError("File too large");
        return readFile(target, "utf8");
    }
    async write(input, content) {
        const target = await this.safePath(input);
        await mkdir(dirname(target), { recursive: true });
        // Re-check after creating directories so a pre-existing symlink cannot be
        // introduced into the path between the first validation and the write.
        await this.safePath(input);
        await writeFile(target, content, "utf8");
    }
    async files(directory = ".") {
        const base = await this.safePath(directory);
        const output = [];
        for (const entry of await readdir(base, { withFileTypes: true })) {
            // Dirent.isDirectory()/isFile() are false for symlinks, so links are
            // never traversed or listed as normal files.
            const child = join(base, entry.name);
            const rel = relative(this.root, child);
            if (entry.isDirectory())
                output.push(...await this.files(rel));
            else if (entry.isFile())
                output.push(rel);
        }
        return output.sort();
    }
}
//# sourceMappingURL=workspace.js.map