import { invoke } from '@tauri-apps/api/core';

// Thin wrappers over the Rust commands in src-tauri/src/lib.rs. Only call these
// when isTauri() is true.

export async function applyBlock(domains: string[]): Promise<number> {
  return invoke<number>('block_apply', { domains });
}

export interface FeedResult {
  applied: boolean;     // false = nothing changed, so no admin prompt was shown
  total: number;        // unique hosts in the resulting block
  fetched: number;      // feeds downloaded successfully
  errors: string[];     // per-feed failures (offline, 404, …)
}

// Deep mode: curated list + maintained feeds, merged into the one /etc/hosts
// block by the Rust side (it downloads the feeds and only re-applies on change).
export async function applyBlockWithFeeds(curated: string[], feeds: string[]): Promise<FeedResult> {
  return invoke<FeedResult>('block_apply_feeds', { curated, feeds });
}

export async function clearBlock(): Promise<void> {
  await invoke('block_clear');
}

export async function blockStatus(): Promise<string[]> {
  return invoke<string[]>('block_status');
}

// Browser lock: the app force-installs the companion extension into every
// installed Chromium browser (Chrome/Brave/Edge) via a macOS managed policy +
// self-healing watchdog — so the user never installs an extension by hand.
export async function browserLockStatus(): Promise<boolean> {
  return invoke<boolean>('browser_lock_status');
}

export async function browserLockInstall(): Promise<void> {
  await invoke('browser_lock_install');
}

export async function browserLockUninstall(): Promise<void> {
  await invoke('browser_lock_uninstall');
}
