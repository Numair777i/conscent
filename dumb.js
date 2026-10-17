const fs = require("fs");
const path = require("path");

const outputFile = path.join(__dirname, "project_code.txt");
const allowedExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".css",
  ".mjs",
]);
const excludedFiles = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "dump.js",
  "project_code.txt",
]);

let combinedContent = "";

function scan(targetPath) {
  if (!fs.existsSync(targetPath)) return;
  const stat = fs.statSync(targetPath);

  if (stat.isDirectory()) {
    // Hard block any node_modules, build caches, or git folders
    const baseName = path.basename(targetPath);
    if (
      [
        "node_modules",
        ".next",
        ".git",
        ".vscode",
        "public",
        "dist",
        "build",
        "coverage",
      ].includes(baseName)
    ) {
      return;
    }
    const entries = fs.readdirSync(targetPath);
    for (const entry of entries) {
      scan(path.join(targetPath, entry));
    }
  } else if (stat.isFile()) {
    const ext = path.extname(targetPath);
    const fileName = path.basename(targetPath);

    if (allowedExtensions.has(ext) && !excludedFiles.has(fileName)) {
      const relPath = path.relative(__dirname, targetPath);
      const content = fs.readFileSync(targetPath, "utf-8");
      combinedContent += `\n==============================================================\nFILE: ${relPath}\n==============================================================\n\n${content}\n\n`;
    }
  }
}

// 1. Only scan the src folder
scan(path.join(__dirname, "src"));

// 2. Only grab explicit root configs
const rootConfigs = [
  "package.json",
  "next.config.mjs",
  "next.config.js",
  "tailwind.config.ts",
  "tailwind.config.js",
  "tsconfig.json",
];

for (const config of rootConfigs) {
  const fullConfigPath = path.join(__dirname, config);
  if (fs.existsSync(fullConfigPath)) {
    const content = fs.readFileSync(fullConfigPath, "utf-8");
    combinedContent += `\n==============================================================\nFILE: ${config}\n==============================================================\n\n${content}\n\n`;
  }
}

fs.writeFileSync(outputFile, combinedContent, "utf-8");
const stats = fs.statSync(outputFile);
console.log(
  `Done! File size: ${(stats.size / 1024).toFixed(2)} KB -> ${outputFile}`,
);
