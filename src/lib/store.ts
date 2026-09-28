import { promises as fs } from 'node:fs';
import path from 'node:path';

import { DEFAULT_CONFIG, mergeConfig } from './defaults';
import { getServerSupabase } from './supabase';
import type { PublicConfig, SiteConfig } from './types';

const TABLE = 'site_config';
const ROW_ID = 1;
const FILE_PATH = path.join(process.cwd(), '.data', 'config.json');

export type StoreBackend = 'supabase' | 'file' | 'memory';

/** Last resort: survives for the lifetime of one server instance. */
let memoryConfig: SiteConfig | null = null;

function isReadOnlyFsError(error: unknown): boolean {
  const code = (error as NodeJS.ErrnoException)?.code;
  return code === 'EROFS' || code === 'EACCES' || code === 'EPERM';
}

async function readFromFile(): Promise<SiteConfig | null> {
  try {
    const raw = await fs.readFile(FILE_PATH, 'utf8');
    return mergeConfig(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function writeToFile(config: SiteConfig): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
    await fs.writeFile(FILE_PATH, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    if (!isReadOnlyFsError(error)) console.error('[store] could not write file', error);
    return false;
  }
}

/** Reads the full config (password included — server use only). */
export async function readConfig(): Promise<{ config: SiteConfig; backend: StoreBackend }> {
  const supabase = getServerSupabase();

  if (supabase) {
    const { data, error } = await supabase.from(TABLE).select('data').eq('id', ROW_ID).maybeSingle();
    if (!error && data?.data) return { config: mergeConfig(data.data), backend: 'supabase' };
    if (error) console.warn('[store] Supabase unavailable, falling back locally:', error.message);
    else return { config: DEFAULT_CONFIG, backend: 'supabase' };
  }

  const fromFile = await readFromFile();
  if (fromFile) return { config: fromFile, backend: 'file' };
  if (memoryConfig) return { config: memoryConfig, backend: 'memory' };
  return { config: DEFAULT_CONFIG, backend: supabase ? 'supabase' : 'file' };
}

/** Saves the config and reports which backend actually took it. */
export async function writeConfig(next: SiteConfig): Promise<{ config: SiteConfig; backend: StoreBackend }> {
  const config: SiteConfig = { ...next, updatedAt: new Date().toISOString() };
  const supabase = getServerSupabase();

  if (supabase) {
    const { error } = await supabase
      .from(TABLE)
      .upsert({ id: ROW_ID, data: config, updated_at: config.updatedAt }, { onConflict: 'id' });
    if (!error) return { config, backend: 'supabase' };
    console.warn('[store] Supabase write refused, falling back locally:', error.message);
  }

  if (await writeToFile(config)) return { config, backend: 'file' };

  memoryConfig = config;
  return { config, backend: 'memory' };
}

/** Strips the password before anything is sent to the browser. */
export function toPublicConfig(config: SiteConfig): PublicConfig {
  const { password: _password, ...rest } = config;
  return rest;
}
