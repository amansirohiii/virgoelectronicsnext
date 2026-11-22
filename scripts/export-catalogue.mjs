#!/usr/bin/env node
/**
 * Writes scripts/.cache/catalogue.json from the site's own content files, so the
 * Python image and PDF builders read exactly what the website shows.
 *
 * The TypeScript sources are transpiled in memory with the `typescript` package
 * that Next already installs, then evaluated as CommonJS. `@/` resolves to src/.
 * Type-only imports disappear in transpilation, so no type file is ever loaded.
 *
 * Usage: node scripts/export-catalogue.mjs
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compileFunction } from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src");
const nodeRequire = createRequire(join(root, "package.json"));
const ts = nodeRequire("typescript");

const cache = new Map();

function resolveFile(spec, fromDir) {
  const base = spec.startsWith("@/") ? join(src, spec.slice(2)) : resolve(fromDir, spec);
  const found = [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts")].find(
    (candidate) => existsSync(candidate) && statSync(candidate).isFile(),
  );
  if (found) return found;
  throw new Error(`Cannot resolve "${spec}" from ${fromDir}`);
}

function load(file) {
  const cached = cache.get(file);
  if (cached) return cached.exports;
  const module = { exports: {} };
  cache.set(file, module);
  const { outputText } = ts.transpileModule(readFileSync(file, "utf8"), {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      verbatimModuleSyntax: false,
    },
  });
  const localRequire = (spec) =>
    spec.startsWith("@/") || spec.startsWith(".") ? load(resolveFile(spec, dirname(file))) : nodeRequire(spec);
  // Only the repo's own source files are evaluated here.
  compileFunction(outputText, ["exports", "require", "module"], { filename: file })(
    module.exports,
    localRequire,
    module,
  );
  return module.exports;
}

const { site } = load(join(src, "content/site.ts"));
const { scenes } = load(join(src, "content/scenes.ts"));
const catalogue = load(join(src, "lib/catalogue.ts"));

const products = catalogue.getProducts().map((p) => ({ ...p, path: catalogue.productPath(p) }));

const categories = catalogue
  .getCategories()
  .map((c) => ({
    ...c,
    path: catalogue.categoryPath(c.slug),
    range: catalogue.categoryRange(c.slug) ?? null,
    count: products.filter((p) => p.category === c.slug).length,
  }))
  .filter((c) => c.count > 0);

const missing = [...products.flatMap((p) => p.images.map((i) => i.src)), ...Object.values(scenes).map((s) => s.src)].filter(
  (s) => !existsSync(join(root, "public", s)),
);
if (missing.length) console.warn(`Missing image files:\n  ${missing.join("\n  ")}`);

const out = join(root, "scripts/.cache/catalogue.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(
  out,
  `${JSON.stringify({ site, categories, products, scenes: Object.values(scenes) }, null, 2)}\n`,
);
console.log(
  `Wrote ${out.slice(root.length + 1)}: ${categories.length} categories, ${products.length} products, ${Object.keys(scenes).length} scenes`,
);
