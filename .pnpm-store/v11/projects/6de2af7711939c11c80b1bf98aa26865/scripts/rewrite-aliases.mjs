import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");

async function findJavaScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return findJavaScriptFiles(entryPath);
      return entry.isFile() && entry.name.endsWith(".js") ? [entryPath] : [];
    }),
  );
  return files.flat();
}

for (const file of await findJavaScriptFiles(distDir)) {
  const contents = await readFile(file, "utf8");
  const rewritten = contents.replaceAll(/@\/([^"']+)/g, (_match, target) => {
    let relativeTarget = path.relative(path.dirname(file), path.join(distDir, target));
    if (!relativeTarget.startsWith(".")) relativeTarget = `./${relativeTarget}`;
    return relativeTarget.split(path.sep).join("/");
  });

  if (rewritten !== contents) await writeFile(file, rewritten);
}
