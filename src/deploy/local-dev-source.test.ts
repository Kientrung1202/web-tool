import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as { scripts: Record<string, string> };
const nextConfig = readFileSync("next.config.mjs", "utf8");
const envTemplate = readFileSync(".env.template", "utf8");
const localEnv = readFileSync(".env", "utf8");
const compose = readFileSync("docker-compose.yml", "utf8");
const gitignore = readFileSync(".gitignore", "utf8");

describe("local dev converter workflow", () => {
  it("runs frontend and converter through npm run dev", () => {
    expect(packageJson.scripts.dev).toBe("node scripts/dev.mjs");
  });

  it("proxies conversion API calls from Next dev to the local converter", () => {
    expect(nextConfig).toContain("rewrites");
    expect(nextConfig).toContain("http://127.0.0.1:3001/api/convert/:path*");
  });

  it("keeps local temp files in the project and out of git", () => {
    expect(localEnv).toContain("CONVERTER_TEMP_DIR=.converter-tmp/jobs");
    expect(envTemplate).toContain("CONVERTER_TEMP_DIR=.converter-tmp/jobs");
    expect(gitignore).toContain(".converter-tmp/");
  });

  it("binds production converter temp files to the current project folder", () => {
    expect(compose).toContain("./.converter-tmp:/var/tmp/converter/jobs");
  });
});
