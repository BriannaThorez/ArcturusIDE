import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import fs from "fs";

function secretSafeGuardPlugin() {
  const secretPatterns = [
    /\bAIza[0-9A-Za-z_-]{35}\b/, // Google API key pattern
    /\bya29\.[0-9A-Za-z._-]+\b/, // Google OAuth access token style
    /\bsk-[0-9A-Za-z]{20,}\b/, // Common secret key style
    /\bghp_[0-9A-Za-z]{30,}\b/, // GitHub personal access token
    /\bgithub_pat_[0-9A-Za-z_]{20,}\b/, // GitHub fine-grained PAT
    /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/, // AWS access key id
    /\b(?:xoxb|xoxp|xoxa|xoxr)-[0-9A-Za-z-]{10,}\b/, // Slack tokens
    /\b-----BEGIN [A-Z ]+PRIVATE KEY-----/, // Private key material
  ];

  function scanFile(filePath: string): string[] {
    const matches: string[] = [];
    const content = fs.readFileSync(filePath, "utf8");
    for (const pattern of secretPatterns) {
      if (pattern.test(content)) {
        matches.push(pattern.source);
      }
    }
    return matches;
  }

  function walk(dir: string): string[] {
    if (!fs.existsSync(dir)) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...walk(fullPath));
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }

    return files;
  }

  return {
    name: "secret-safe-guard",
    apply: "build",
    closeBundle() {
      const distPath = path.resolve(__dirname, "dist");
      const files = walk(distPath);

      const offenders: string[] = [];
      for (const file of files) {
        try {
          const matches = scanFile(file);
          if (matches.length > 0) {
            offenders.push(
              `${path.relative(__dirname, file)} => ${matches.join(", ")}`,
            );
          }
        } catch {
          // Ignore unreadable files; build output should be text-based for this check.
        }
      }

      if (offenders.length > 0) {
        throw new Error(
          [
            "Secret safety check failed: production output contains real secret-like patterns.",
            "Offending files:",
            ...offenders,
          ].join("\n"),
        );
      }
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), secretSafeGuardPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  server: {
    hmr: true,
  },
  build: {
    sourcemap: false,
  },
});
