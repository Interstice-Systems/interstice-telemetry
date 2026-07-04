import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const temporary = mkdtempSync(join(tmpdir(), "interstice-packed-consumer-"));
const packageDirectory = join(
  temporary,
  "consumer",
  "node_modules",
  "interstice-telemetry",
);

const run = (command, args, cwd = root) =>
  execFileSync(command, args, { cwd, encoding: "utf8", stdio: "pipe" });

try {
  const packResult = JSON.parse(
    run("npm", ["pack", "--json", "--pack-destination", temporary]),
  );
  const tarball = join(temporary, packResult[0].filename);
  const consumer = join(temporary, "consumer");
  mkdirSync(consumer, { recursive: true });
  writeFileSync(
    join(consumer, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  run("npm", [
    "install",
    "--ignore-scripts",
    "--no-audit",
    "--no-fund",
    "--prefix",
    consumer,
    tarball,
  ]);

  writeFileSync(
    join(consumer, "consumer.mjs"),
    [
      'import { EVIDENCE_MANIFEST_VERSION, createEvidenceManifest } from "interstice-telemetry";',
      'import { createRobotState } from "interstice-telemetry/digital-twin";',
      'if (EVIDENCE_MANIFEST_VERSION !== "1.0.0") throw new Error("root export failed");',
      'if (createEvidenceManifest({ experimentId: "packed" }).experimentId !== "packed") throw new Error("manifest failed");',
      'if (typeof createRobotState !== "function") throw new Error("browser export failed");',
    ].join("\n"),
  );
  run("node", ["consumer.mjs"], consumer);

  writeFileSync(
    join(consumer, "consumer.ts"),
    [
      'import { createEvidenceManifest, type EvidenceManifest } from "interstice-telemetry";',
      'import { type RobotState } from "interstice-telemetry/digital-twin";',
      'const manifest: EvidenceManifest = createEvidenceManifest({ experimentId: "typed" });',
      "const state: RobotState | undefined = undefined;",
      "void manifest; void state;",
    ].join("\n"),
  );
  writeFileSync(
    join(consumer, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        module: "NodeNext",
        moduleResolution: "NodeNext",
        target: "ES2022",
        strict: true,
        noEmit: true,
        skipLibCheck: true,
      },
      include: ["consumer.ts"],
    }),
  );
  run(join(root, "node_modules", ".bin", "tsc"), ["-p", "tsconfig.json"], consumer);

  for (const path of [
    "dist/digitalTwin/schemas/robot-state.schema.json",
    "fixtures/compatibility/replay-log.v1.json",
  ]) {
    if (!existsSync(join(packageDirectory, path))) {
      throw new Error(`packed package is missing ${path}`);
    }
  }

  const visited = new Set();
  const inspectBrowserModule = (path) => {
    if (visited.has(path)) return;
    visited.add(path);
    const source = readFileSync(path, "utf8");
    if (/from ["']node:|import\(["']node:/.test(source)) {
      throw new Error(`browser entry reaches Node built-in import: ${path}`);
    }
    for (const match of source.matchAll(
      /(?:from|import)\s*\(?\s*["'](\.[^"']+)["']/g,
    )) {
      const target = resolve(dirname(path), match[1]);
      if (existsSync(target)) inspectBrowserModule(target);
    }
  };
  inspectBrowserModule(
    join(packageDirectory, "dist", "digitalTwin", "browser.js"),
  );

  console.log(
    `Packed Node ESM, TypeScript, and browser-safe consumers passed (${visited.size} browser modules).`,
  );
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
