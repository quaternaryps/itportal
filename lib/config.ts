import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { AppConfig } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const CONFIG_PATH = path.join(DATA_DIR, "config.json");

const DEFAULT_NODE_IDS = [
  "laptop",
  "pc",
  "apps",
  "wifi",
  "switch",
  "firewall",
  "nas",
  "server",
  "vm",
  "vpn",
  "cloud",
  "m365",
  "auth",
  "secrets",
];

function defaultConfig(): AppConfig {
  const nodes: AppConfig["nodes"] = {};
  for (const id of DEFAULT_NODE_IDS) {
    nodes[id] = { url: "" };
  }
  return { nodes };
}

export async function readConfig(): Promise<AppConfig> {
  try {
    const raw = await readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(raw) as AppConfig;
  } catch {
    // File missing or corrupt — create default
    const config = defaultConfig();
    await writeConfig(config);
    return config;
  }
}

export async function writeConfig(config: AppConfig): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}
