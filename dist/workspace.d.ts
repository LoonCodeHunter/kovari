/**
 * Workspace-bound file access for Kovari consumers.
 *
 * `path()` performs lexical containment checks. `safePath()` additionally
 * rejects existing symlink components below the workspace root. This strict
 * default avoids following project-provided symlinks into unrelated paths.
 */
export declare class Workspace {
    readonly maxBytes: number;
    readonly root: string;
    constructor(root: string, maxBytes?: number);
    /** Resolve a path and reject lexical traversal outside the configured root. */
    path(input: string): string;
    /**
     * Validate existing path components and return the contained lexical path.
     * Missing components are allowed so callers can safely create new files.
     * Symlinks below the root are rejected, including links that point back into
     * the workspace, to keep behaviour deterministic across platforms.
     */
    safePath(input: string): Promise<string>;
    read(input: string): Promise<string>;
    write(input: string, content: string): Promise<void>;
    files(directory?: string): Promise<string[]>;
}
//# sourceMappingURL=workspace.d.ts.map