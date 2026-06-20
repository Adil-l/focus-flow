import { useCallback, useEffect, useState } from 'react';

// Minimal typing for the Document Picture-in-Picture API (Chromium 116+).
interface DocumentPiP {
  requestWindow(opts?: { width?: number; height?: number }): Promise<Window>;
  window: Window | null;
}
function getDocumentPiP(): DocumentPiP | null {
  if (typeof window === 'undefined') return null;
  const dpip = (window as unknown as { documentPictureInPicture?: DocumentPiP }).documentPictureInPicture;
  return dpip ?? null;
}

/**
 * Document Picture-in-Picture: pops a small always-on-top OS window we can
 * render React into via a portal. Chromium-only — `supported` is false on
 * Firefox/Safari so the caller can hide the button. Stylesheets from the main
 * document are cloned into the PiP window so Tailwind classes apply.
 */
export function usePiP() {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const supported = getDocumentPiP() !== null;

  const open = useCallback(async () => {
    const dpip = getDocumentPiP();
    if (!dpip) return;
    const win = await dpip.requestWindow({ width: 340, height: 200 });

    // Clone styles so Tailwind/custom CSS render inside the PiP document.
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
      win.document.head.appendChild(node.cloneNode(true));
    });
    win.document.body.style.margin = '0';
    win.document.body.style.background = '#0b0710';

    win.addEventListener('pagehide', () => setPipWindow(null));
    setPipWindow(win);
  }, []);

  const close = useCallback(() => {
    pipWindow?.close();
    setPipWindow(null);
  }, [pipWindow]);

  // Close the PiP window if the component using this hook unmounts.
  useEffect(() => () => { try { pipWindow?.close(); } catch { /* already closed */ } }, [pipWindow]);

  return { supported, pipWindow, open, close };
}
