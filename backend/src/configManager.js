import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, '../../config/config.json');

const DEFAULT_CONFIG = {
  instagram: {
    accessToken: '',
    userId: '',
    username: '',
    connectedAt: null
  },
  automation: {
    enabled: true,
    rules: []
  },
  stats: {
    totalDmsSent: 0,
    sessionDmsSent: 0
  }
};

export function readConfig() {
  try {
    if (!existsSync(CONFIG_PATH)) {
      writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
      return DEFAULT_CONFIG;
    }
    const raw = readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading config:', e);
    return DEFAULT_CONFIG;
  }
}

export function writeConfig(config) {
  try {
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    return true;
  } catch (e) {
    console.error('Error writing config:', e);
    return false;
  }
}

export function updateConfig(partial) {
  const current = readConfig();
  const merged = deepMerge(current, partial);
  return writeConfig(merged);
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
