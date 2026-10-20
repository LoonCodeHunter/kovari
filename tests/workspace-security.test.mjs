import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Workspace } from "../dist/index.js";

async function makeWorkspacePair() {
  const parent = await mkdtemp(join(tmpdir(), "kovari-workspace-security-"));
  const root = join(parent, "workspace");
  const outside = join(parent, "outside");
  await mkdir(root);
  await mkdir(outside);
  await writeFile(join(outside, "secret.txt"), "outside secret");
  return { parent, root, outside };
}

async function createDirectorySymlink(t, target, linkPath) {
  try {
    await symlink(target, linkPath, process.platform === "win32" ? "junction" : "dir");
  } catch (error) {
    if (process.platform === "win32" && ["EPERM", "EACCES", "UNKNOWN"].includes(error.code)) {
      t.skip("Windows symlink creation is unavailable for this account");
      return false;
    }
    throw error;
  }
  return true;
}

test("workspace blocks read through a symlink outside the workspace", async (t) => {
  const { parent, root, outside } = await makeWorkspacePair();
  try {
    if (!await createDirectorySymlink(t, outside, join(root, "outside-link"))) return;
    const workspace = new Workspace(root);
    await assert.rejects(workspace.read("outside-link/secret.txt"), /symlinks are not allowed/i);
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});

test("workspace blocks writes through a symlink outside the workspace", async (t) => {
  const { parent, root, outside } = await makeWorkspacePair();
  const outsideFile = join(outside, "created.txt");
  try {
    if (!await createDirectorySymlink(t, outside, join(root, "outside-link"))) return;
    const workspace = new Workspace(root);
    await assert.rejects(workspace.write("outside-link/created.txt", "should not write"), /symlinks are not allowed/i);
    await assert.rejects(readFile(outsideFile, "utf8"), { code: "ENOENT" });
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});

 test("workspace keeps ordinary in-root reads, writes and enumeration working", async () => {
  const { parent, root } = await makeWorkspacePair();
  try {
    const workspace = new Workspace(root);
    await workspace.write("src/example.ts", "export const ready = true;\n");
    assert.equal(await workspace.read("src/example.ts"), "export const ready = true;\n");
    // Normalize Windows and POSIX paths before comparing.
const listedFiles = (await workspace.files()).map(
  (file) => file.replace(/\\/g, "/")
);

assert.deepEqual(listedFiles, ["src/example.ts"]);
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});
