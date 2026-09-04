import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const env = {
  ...process.env,
  ...readEnvFile(".env"),
  NODE_ENV: "development",
  PORT: "3001"
};

const commands = [
  {
    name: "converter",
    command: converterCommand(),
    args: converterArgs(),
    env: { ...env, PORT: undefined }
  },
  {
    name: "next",
    command: bin("next"),
    args: ["dev"],
    env: { ...env, PORT: undefined }
  }
];

let shuttingDown = false;
let children = [];

children = commands.map((item) => {
  const child = spawn(item.command, item.args, {
    env: cleanEnv(item.env),
    stdio: "inherit"
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    for (const other of children) {
      if (other !== child && !other.killed) other.kill("SIGTERM");
    }
    process.exit(code ?? (signal ? 1 : 0));
  });

  return child;
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    shuttingDown = true;
    for (const child of children) child.kill("SIGTERM");
    process.exit(0);
  });
}

function readEnvFile(path) {
  if (!existsSync(path)) return {};
  const values = {};

  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    values[trimmed.slice(0, index)] = trimmed.slice(index + 1);
  }

  return values;
}

function bin(name) {
  return join("node_modules", ".bin", process.platform === "win32" ? `${name}.cmd` : name);
}

function cleanEnv(values) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined));
}

function converterCommand() {
  // Prefer venv uvicorn, fall back to system uvicorn
  const venvUvicorn = join("converter-api", ".venv", "bin", "uvicorn");
  if (existsSync(venvUvicorn)) return venvUvicorn;
  return "uvicorn";
}

function converterArgs() {
  return [
    "app.main:app",
    "--host", "127.0.0.1",
    "--port", "3001",
    "--reload",
    "--app-dir", "converter-api"
  ];
}
