import { invoke } from '@tauri-apps/api/core';

// Thin wrappers over the Rust commands in src-tauri/src/lib.rs. Only call these
// when isTauri() is true.

export async function applyBlock(domains: string[]): Promise<number> {
  return invoke<number>('block_apply', { domains });
}

export async function clearBlock(): Promise<void> {
  await invoke('block_clear');
}

export async function blockStatus(): Promise<string[]> {
  return invoke<string[]>('block_status');
}
