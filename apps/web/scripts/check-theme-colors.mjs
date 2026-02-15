import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const WEB_ROOT = path.resolve(import.meta.dirname, "..");

const TARGETS = [
  "src/features/sso-management",
  "src/features/employee-profile",
  "src/pages/EmployeeProfilesPage.tsx",
  "src/pages/MyProfilePage.tsx"
];

const FILE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);

const RULES = [
  {
    id: "tailwind-hardcoded-color",
    message:
      "Hard-coded Tailwind rengi bulundu. `var(--color-*)` tema değişkeni kullanın.",
    regex:
      /\b(?:text|bg|border|from|to|via|ring|stroke|fill)-(?:red|green|blue|yellow|amber|orange|purple|pink|indigo|teal|cyan|lime|emerald|rose|fuchsia|sky|violet|slate|gray|zinc|neutral|stone)-\d{2,3}\b/g
  },
  {
    id: "hardcoded-hex-rgb",
    message:
      "Hard-coded renk bulundu (`#hex`, `rgb`, `rgba`). `var(--color-*)` tema değişkeni kullanın.",
    regex: /#(?:[0-9a-fA-F]{3,8})\b|rgba?\(/g
  },
  {
    id: "mui-palette-token",
    message:
      "MUI palette token kullanımı bulundu (`primary.*`, `action.*`, `divider`, `grey.*`). `var(--color-*)` kullanın.",
    regex: /["'`](?:primary\.(?:main|light|dark|contrastText)|action\.(?:hover|selected)|divider|grey\.\d+)["'`]/g
  }
];

async function walk(targetPath) {
  const absolutePath = path.resolve(WEB_ROOT, targetPath);
  const targetStat = await stat(absolutePath);

  if (targetStat.isFile()) return [absolutePath];

  const files = [];
  const entries = await readdir(absolutePath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(absolutePath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(path.relative(WEB_ROOT, entryPath))));
      continue;
    }

    if (FILE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

function getLineInfo(content, index) {
  const line = content.slice(0, index).split("\n").length;
  return line;
}

async function run() {
  const allFiles = (await Promise.all(TARGETS.map((t) => walk(t)))).flat();
  const uniqueFiles = Array.from(new Set(allFiles));
  const violations = [];

  for (const filePath of uniqueFiles) {
    const raw = await readFile(filePath, "utf8");

    for (const rule of RULES) {
      for (const match of raw.matchAll(rule.regex)) {
        const index = match.index ?? 0;
        const line = getLineInfo(raw, index);
        violations.push({
          file: path.relative(WEB_ROOT, filePath),
          line,
          ruleId: rule.id,
          message: rule.message,
          value: match[0]
        });
      }
    }
  }

  if (violations.length === 0) {
    console.log("Tema renk kontrolu basarili. Ihlal bulunmadi.");
    return;
  }

  console.error(`Tema renk kontrolu basarisiz. Toplam ${violations.length} ihlal bulundu:\n`);
  for (const violation of violations) {
    console.error(
      `- ${violation.file}:${violation.line} [${violation.ruleId}] ${violation.message} -> ${violation.value}`
    );
  }

  process.exitCode = 1;
}

run().catch((error) => {
  console.error("Tema renk kontrolu calisamadi:", error);
  process.exitCode = 1;
});
