import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const baseline = join(root, "compatibility", "api-v1");
const update = process.argv.includes("--update");

const declarationFiles = (directory, base = directory) =>
  readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory()
        ? declarationFiles(path, base)
        : entry.isFile() && entry.name.endsWith(".d.ts")
          ? [relative(base, path).replaceAll("\\", "/")]
          : [];
    })
    .sort();

if (!existsSync(dist)) {
  throw new Error("dist is missing; run npm run build first.");
}

if (update) {
  if (existsSync(baseline)) {
    for (const file of declarationFiles(baseline)) {
      rmSync(join(baseline, file));
    }
  }
  mkdirSync(baseline, { recursive: true });
  for (const file of declarationFiles(dist)) {
    const destination = join(baseline, file);
    mkdirSync(dirname(destination), { recursive: true });
    cpSync(join(dist, file), destination);
  }
  console.log(`Updated API baseline with ${declarationFiles(dist).length} declarations.`);
  process.exit(0);
}

if (!existsSync(baseline)) {
  throw new Error("API baseline is missing; run npm run api:update intentionally.");
}

const generatedFiles = declarationFiles(dist);
const baselineFiles = declarationFiles(baseline);
const differences = [];
for (const file of new Set([...generatedFiles, ...baselineFiles])) {
  if (!generatedFiles.includes(file)) {
    differences.push(`removed declaration: ${file}`);
  } else if (!baselineFiles.includes(file)) {
    differences.push(`added declaration: ${file}`);
  } else if (
    readFileSync(join(dist, file), "utf8") !==
    readFileSync(join(baseline, file), "utf8")
  ) {
    differences.push(`changed declaration: ${file}`);
  }
}

if (differences.length > 0) {
  console.error("Public API compatibility check failed:");
  for (const difference of differences) console.error(`- ${difference}`);
  console.error("Review changes, then run npm run api:update only if intentional.");
  process.exit(1);
}

console.log(`API compatibility baseline matches ${generatedFiles.length} declarations.`);
