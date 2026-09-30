// Responsive audit: cheap static regression net for narrow viewports.
// Fails the run on padding/gutter patterns that only fit a desktop width and on
// dialog widths that would clobber the ui default `max-w-[calc(100%-2rem)]`.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("../src", import.meta.url));

const BREAKPOINTS = [
  "max-2xl",
  "max-xl",
  "max-lg",
  "max-md",
  "max-sm",
  "min-2xl",
  "min-xl",
  "min-lg",
  "min-md",
  "min-sm",
  "2xl",
  "xl",
  "lg",
  "md",
  "sm",
];

const PAD_TOKEN = /(?<![-\w])px-(?:8|16)(?![-\w])/g;

type Problem = { file: string; line: number; rule: string; excerpt: string };

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith(".tsx") || entry.endsWith(".ts")) out.push(full);
  }
  return out;
}

function auditPadding(file: string, source: string, problems: Problem[]) {
  for (const match of source.matchAll(PAD_TOKEN)) {
    const at = match.index ?? -1;
    const before = source.slice(Math.max(0, at - 12), at);
    if (BREAKPOINTS.some((bp) => before.endsWith(`${bp}:`))) continue;
    problems.push({
      file,
      line: source.slice(0, at).split("\n").length,
      rule: "unqualified px-8/px-16",
      excerpt: match[0],
    });
  }
}

function auditDialogContent(file: string, source: string, problems: Problem[]) {
  const open = /<DialogContent\b/g;
  for (const match of source.matchAll(open)) {
    const at = match.index ?? -1;
    const body = source.slice(at, source.indexOf(">", at) + 1);
    for (const attr of body.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
      const classes = attr[1] ?? attr[2] ?? "";
      for (const token of classes.split(/\s+/)) {
        if (!token.startsWith("max-w-")) continue;
        if (BREAKPOINTS.some((bp) => token.startsWith(`${bp}:`))) continue;
        problems.push({
          file,
          line: source.slice(0, at).split("\n").length,
          rule: "unqualified max-w- on DialogContent",
          excerpt: token,
        });
      }
    }
  }
}

const problems: Problem[] = [];

for (const file of walk(join(SRC, "features"))) {
  const source = readFileSync(file, "utf8");
  const id = relative(SRC, file);
  auditPadding(id, source, problems);
  if (source.includes("<DialogContent")) auditDialogContent(id, source, problems);
}

for (const file of walk(join(SRC, "engine"))) {
  const source = readFileSync(file, "utf8");
  const id = relative(SRC, file);
  auditPadding(id, source, problems);
  if (source.includes("<DialogContent")) auditDialogContent(id, source, problems);
}

if (problems.length > 0) {
  for (const p of problems) {
    console.error(`${p.file}:${p.line}  ${p.rule}  (${p.excerpt})`);
  }
  console.error(`\nresponsive-audit: ${problems.length} problem(s).`);
  process.exit(1);
}

console.log("responsive-audit: clean.");
