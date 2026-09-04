import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const compose = readFileSync("docker-compose.yml", "utf8");
const dockerfile = readFileSync("Dockerfile", "utf8");
const nginx = readFileSync("nginx.conf", "utf8");
const envTemplate = readFileSync(".env.template", "utf8");

describe("converter deployment wiring", () => {
  it("adds converter-api without publishing public ports", () => {
    expect(compose).toContain("converter-api:");
    expect(compose).not.toMatch(/converter-api:[\s\S]*\n\s+ports:/);
  });

  it("proxies conversion requests through Nginx with an internal token", () => {
    expect(nginx).toContain("location /api/convert/");
    expect(nginx).toContain("proxy_pass http://converter-api:3001/api/convert/");
    expect(nginx).toContain("X-Internal-Proxy-Token");
    expect(dockerfile).toContain("/etc/nginx/templates/default.conf.template");
  });

  it("documents local and production converter env vars", () => {
    expect(envTemplate).toContain("CONVERTER_MAX_FILE_SIZE_MB=20");
    expect(envTemplate).toContain("CONVERTER_INTERNAL_PROXY_TOKEN=");
    expect(envTemplate).toContain("TURNSTILE_SECRET_KEY=");
    expect(envTemplate).toContain("NEXT_PUBLIC_TURNSTILE_SITE_KEY=");
  });
});
