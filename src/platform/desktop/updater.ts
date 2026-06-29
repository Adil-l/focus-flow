// Desktop auto-update (Tauri updater). Checks the GitHub Releases endpoint for a
// newer signed build; if found, offers a one-tap install via a toast and relaunches.
// No-op on web/mobile. Fails silently when offline or no release is published yet.
import { toast } from 'sonner';
import { isTauri } from '@/platform';

const pt = () => {
  try { return localStorage.getItem('pomo:language') === 'pt'; } catch { return false; }
};

export async function checkForUpdates(): Promise<void> {
  if (!isTauri()) return;
  try {
    const { check } = await import('@tauri-apps/plugin-updater');
    const update = await check();
    if (!update) return;

    const isPt = pt();
    toast(
      isPt ? `Nova versão ${update.version} disponível` : `Update ${update.version} available`,
      {
        description: isPt ? 'Atualizar agora? A app reinicia.' : 'Install now? The app will restart.',
        duration: Infinity,
        action: {
          label: isPt ? 'Atualizar' : 'Update',
          onClick: async () => {
            const id = 'kipto-update';
            try {
              toast.loading(isPt ? 'A descarregar…' : 'Downloading…', { id });
              await update.downloadAndInstall();
              const { relaunch } = await import('@tauri-apps/plugin-process');
              await relaunch();
            } catch {
              toast.error(isPt ? 'Falha ao atualizar.' : 'Update failed.', { id });
            }
          },
        },
      },
    );
  } catch {
    // No endpoint/release yet, offline, or signature mismatch — stay quiet.
  }
}
