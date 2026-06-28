# `src/platform/` — Desktop vs Mobile separation

Kipto is **one codebase, two shapes**. This folder is where the two shapes
are kept apart. Everything **outside** `src/platform/` is shared core (timer,
stores, UI, i18n, data …) and runs identically on both.

```
src/platform/
  index.ts            Platform detection + capability flags (isTauri, isDesktop,
                      isMobile, webOrigin, capabilities). Import from "@/platform".
  notify.ts           Cross-platform adapter: native OS notifications on desktop,
                      web Notification API otherwise.
  openExternal.ts     Cross-platform adapter: open a URL in the system browser.
  desktop/            macOS / Tauri-only native features (see below).
    index.ts          Barrel — import from "@/platform/desktop".
    blocker.ts        System-wide website blocker (/etc/hosts via Rust helper).
    kiosk.ts          Full-Mac break "kiosk" lock.
    domains.ts        Blocklist domain/category helpers.
    unblockEscalation.ts  Friction/escalation before disabling blocking.
  mobile/             Web / phone-only surface.
    index.ts          Barrel — import from "@/platform/mobile".
    mobile.css        Responsive adaptation, scoped to @media (max-width: 767px).
```

## The two builds

| | Desktop (macOS) | Mobile / web |
|---|---|---|
| Shell | Tauri (`src-tauri/`) → `.app` / `.dmg` | plain web build (a phone browser) |
| `isTauri()` | `true` | `false` |
| System blocker (`/etc/hosts`) | ✅ | ❌ (no Tauri command) |
| Break kiosk lock | ✅ | ❌ |
| Native notifications | ✅ | falls back to web Notification API |
| Responsive `mobile.css` | inert (wide window) | active < 768px |

## Rules that keep them separate

1. **Core code never sniffs the environment ad-hoc.** Ask `isTauri()` /
   `capabilities.*` from `@/platform`.
2. **`desktop/` may use `@tauri-apps/*`.** Always guard calls with a capability
   check so the web build no-ops instead of throwing.
3. **`mobile/` must NOT import from `desktop/` or `@tauri-apps/*`.** That import
   boundary is what keeps native desktop code out of the mobile build.
4. **Desktop-only UI** (e.g. `DesktopProtectionCard`) renders only when
   `capabilities.systemBlocker` / `isTauri()` is true.

> The native macOS app is built from `src-tauri/` and bundles the same web app.
> There is no separate mobile native project; "app do mobile" is the web build.
> If a native iOS/Android app is added later (Tauri mobile), it slots in beside
> `src-tauri/` and reuses everything outside `src/platform/desktop/`.
