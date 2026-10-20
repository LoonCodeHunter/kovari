# Workspace Safety and Lifecycle

Kovari's `Workspace` is a path-aware helper for an application-defined root. It is useful for IDE automation, but it is not an operating-system sandbox.

## API distinctions

- `workspace.path(relativePath)` performs lexical root-containment validation and returns the resolved path.
- `workspace.safePath(relativePath)` also rejects existing symlink components under the root.
- `workspace.read(path)` only reads regular files that fit within `maxBytes`.
- `workspace.write(path, contents)` validates a path and performs a write.
- `workspace.files(directory?)` lists regular files and does not traverse symlink entries.

## Use a narrow root and check every result

```ts
import { Workspace } from "kovari/workspace";

const workspace = new Workspace("./approved-project", 1_000_000);
const files = await workspace.files("src");
for (const relativePath of files) {
  // Keep the relative paths returned by Workspace; do not concatenate
  // arbitrary model-supplied absolute paths into filesystem calls.
  const source = await workspace.read(relativePath);
  console.log(relativePath, source.length);
}
```

Treat workspace paths as untrusted when they originate from prompts, model output, an extension manifest or a repository. Re-check the safe path at the effect boundary and keep workspaces on a local directory that the app controls.

## Security limits

- Path validation cannot eliminate every time-of-check/time-of-use race if another process can modify the filesystem concurrently.
- Symlink rejection is not a substitute for OS permissions, containers or a dedicated process sandbox.
- A workspace root should be selected and canonicalised by the host; do not permit an untrusted extension to select its own unrestricted root.
- Use a temporary worktree for risky code generation and review diffs before applying changes to valuable user files.
- Bound file size, result count, subprocess output and total runtime at their corresponding layers.

## Troubleshooting

- `Workspace escape`: use a relative path under the configured root; do not use `..` traversal or absolute paths.
- `Workspace symlinks are not allowed`: replace or remove the symlink, or copy the intended file into the workspace.
- `File too large`: increase the configured limit only for trusted workloads and with an explicit memory/latency budget.
