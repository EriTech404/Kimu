# Kimu — Current State Specification

> **Generated:** 2026-04-01
> **Purpose:** Baseline analysis of the existing codebase before implementation of secure OS-level secret management and CLI wrapper functionality.

---

## 1. Project Structure Overview

```
kimu/
├── index.html                          # Vite SPA entry point
├── package.json                        # Frontend dependencies & scripts
├── tsconfig.json                       # TypeScript config (ES2020, strict)
├── tsconfig.node.json                  # Vite-specific TS config
├── vite.config.ts                      # Vite dev server (port 1420)
├── public/
│   ├── tauri.svg
│   └── vite.svg
├── src/
│   ├── main.tsx                        # React root mount
│   ├── App.tsx                         # Main app component (key viewer)
│   ├── App.css                         # Global styles (Night Owl theme)
│   ├── Favorites.tsx                   # Empty placeholder
│   ├── KeyTags.tsx                     # Incomplete / broken references
│   ├── Settings.tsx                    # Empty file
│   ├── vite-env.d.ts
│   ├── assets/
│   │   └── react.svg
│   └── Commponets/                     # ⚠️ Typo in folder name
│       ├── SideBar.tsx                 # Collapsible sidebar navigation
│       ├── KeyCard.tsx                 # Secret display card (mask/reveal)
│       └── AddKeyModal.tsx             # Modal form for adding keys
└── src-tauri/
    ├── Cargo.toml                      # Rust dependencies
    ├── Cargo.lock
    ├── build.rs                        # Standard tauri_build
    ├── tauri.conf.json                 # Tauri app configuration
    ├── capabilities/
    │   └── default.json                # Window permissions
    ├── icons/                          # App icons (all platforms)
    └── src/
        ├── main.rs                     # Binary entry → kimu_lib::run()
        ├── lib.rs                      # Tauri builder + greet command
        ├── cli.rs                      # EMPTY — placeholder
        └── manager.rs                  # EMPTY — placeholder
```

### Key Entry Points

| Layer | Entry Point | Role |
|-------|------------|------|
| **Frontend** | `src/main.tsx` | Mounts `<App />` into `#root` |
| **Rust Backend** | `src-tauri/src/main.rs` | Calls `kimu_lib::run()` |
| **Rust Library** | `src-tauri/src/lib.rs` | Builds Tauri app, registers commands |

> **Important:** This is a **Vite + React + TypeScript** frontend, not Next.js. There is no SSR, no `app/` directory routing, and no API routes.

---

## 2. Dependencies & Configuration

### 2.1 Rust Backend (`src-tauri/Cargo.toml`)

| Crate | Version | Purpose |
|-------|---------|---------|
| `tauri` | 2.x (resolved 2.10.3) | Core framework |
| `tauri-plugin-opener` | 2.x | Open external links/files |
| `serde` | 1.x (with `derive`) | Serialization/deserialization |
| `serde_json` | 1.x | JSON handling |
| `tauri-build` | 2.x (build-dep) | Compile-time code generation |

**Library config:**
```toml
[lib]
name = "kimu_lib"
crate-type = ["staticlib", "cdylib", "rlib"]
```

### 2.2 Frontend (`package.json`)

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.3.1 | UI framework |
| `react-dom` | ^18.3.1 | DOM rendering |
| `@tauri-apps/api` | ^2 | Tauri IPC from frontend |
| `@tauri-apps/plugin-opener` | ^2 | Opener plugin JS bindings |
| `react-pro-sidebar` | ^1.1.0 | Sidebar navigation (root pkg) |

**Dev dependencies:** TypeScript 5.6.2, Vite 6.0.3, `@vitejs/plugin-react`, `@tauri-apps/cli` v2.

**Scripts:**
- `dev` → `vite` (dev server on port 1420)
- `build` → `tsc && vite build`
- `tauri` → `tauri` CLI

### 2.3 Tauri Configuration (`tauri.conf.json`)

| Setting | Value | Notes |
|---------|-------|-------|
| Product name | `kimu` | |
| Version | `0.1.0` | |
| Identifier | `kimu.app` | |
| Window size | 800 × 600 | Single window |
| Dev URL | `http://localhost:1420` | |
| Frontend dist | `../dist` | Vite output |
| CSP | `null` | **Security concern** — allows all content |
| Bundle targets | `all` | macOS, Windows, Linux |

### 2.4 Capabilities (`capabilities/default.json`)

```json
{
  "identifier": "default",
  "windows": ["main"],
  "permissions": ["core:default", "opener:default"]
}
```

Only minimal permissions granted. No filesystem, shell, clipboard, or notification permissions.

---

## 3. Current Rust Backend Status

### 3.1 Tauri Commands

**One command exists:**

```rust
// src-tauri/src/lib.rs
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
```

Registered via:
```rust
.invoke_handler(tauri::generate_handler![greet])
```

This is the default Tauri scaffold command — no application logic.

### 3.2 OS-Level Storage

**Status: Not implemented.**

- No `keyring` crate in `Cargo.toml`
- No OS credential/keychain API usage anywhere
- `manager.rs` exists but is empty (0 bytes)

### 3.3 CLI Argument Parsing

**Status: Not implemented.**

- No `clap` or similar CLI parsing crate in `Cargo.toml`
- `cli.rs` exists but is empty (0 bytes)
- No Tauri CLI plugin configured

### 3.4 Plugins

Only `tauri_plugin_opener` is loaded:
```rust
.plugin(tauri_plugin_opener::init())
```

---

## 4. Current Frontend Status

### 4.1 Components

| Component | File | Status | Description |
|-----------|------|--------|-------------|
| `App` | `src/App.tsx` | **Functional** | Main layout: sidebar + key grid + add modal |
| `SideBar` | `src/Commponets/SideBar.tsx` | **Functional** | Collapsible nav with 4 menu items (Key Viewer, Key Tags, Favorites, Settings) |
| `KeyCard` | `src/Commponets/KeyCard.tsx` | **Functional** | Displays a secret with mask/reveal toggle, copy, tag badge, memo |
| `AddKeyModal` | `src/Commponets/AddKeyModal.tsx` | **Functional** | Form modal: name, value, tag, memo fields |
| `Favorites` | `src/Favorites.tsx` | **Empty** | Placeholder shell |
| `KeyTags` | `src/KeyTags.tsx` | **Broken** | References undefined `isCollapsed` variable |
| `Settings` | `src/Settings.tsx` | **Empty** | No content |

### 4.2 Data Model (In-Memory)

```typescript
interface Key {
  id: string;
  name: string;
  value: string;
  tag?: string;
  memo?: string;
}
```

Keys are stored in React `useState` with hardcoded sample data. No persistence.

### 4.3 Routing

**No routing library installed.** Sidebar menu items log to console but do not navigate. All page components exist as separate files but are not wired into a view switcher.

### 4.4 Tauri Backend Communication

**Status: None.**

- `@tauri-apps/api` is listed as a dependency but **never imported** in any component
- No `invoke()` calls
- No event listeners (`listen`/`emit`)
- All data is local React state

### 4.5 Security Concerns in Current UI

- `KeyCard` uses hardcoded password `"password"` for reveal protection
- Secret values are stored in plaintext React state
- Copy-to-clipboard uses `navigator.clipboard` without permission handling

### 4.6 Styling

Fully implemented Night Owl dark theme via CSS custom properties:
- Background: `#011627` / Surface: `#0b2942`
- Accent colors: blue (`#82aaff`), cyan (`#7fdbca`), purple (`#c792ea`)
- Smooth animations (sidebar collapse, card hover, modal backdrop blur)
- Responsive key grid (`auto-fill, minmax(300px, 1fr)`)

---

## 5. Gap Analysis

### Goal Recap
Build an application that:
1. **Securely stores secrets at the OS level** (macOS Keychain, Windows Credential Manager, Linux Secret Service)
2. **Provides a CLI wrapper** that dynamically injects secrets into `.env` variables at runtime
3. **Prevents raw secrets from being exposed** in local files

### 5.1 What Exists

| Area | Status |
|------|--------|
| Tauri v2 project scaffold | Done |
| UI shell with dark theme | Done |
| Key viewer grid layout | Done |
| KeyCard with mask/reveal/copy | Done |
| AddKeyModal form | Done |
| Sidebar navigation skeleton | Done |

### 5.2 What Is Missing

#### Rust Backend — Critical

| Gap | Description | Priority |
|-----|-------------|----------|
| **OS keyring integration** | Add `keyring` crate (or equivalent) to store/retrieve/delete secrets via OS credential manager | **P0** |
| **CRUD Tauri commands** | `set_secret`, `get_secret`, `delete_secret`, `list_secrets` commands exposed to frontend | **P0** |
| **Secret metadata storage** | Persistent storage for tags, memos, groupings (keyring stores key/value only — metadata needs a local DB or JSON file) | **P1** |
| **CLI argument parsing** | Implement `cli.rs` with `clap` to accept commands like `kimu run -- <command>` | **P0** |
| **CLI env injection** | Read secrets from OS keyring and inject as environment variables into a child process | **P0** |
| **Error handling** | Structured error types for keyring failures, permission denied, not found, etc. | **P1** |
| **Encryption at rest** | Consider additional encryption layer beyond OS keyring for metadata | **P2** |

#### Frontend — Critical

| Gap | Description | Priority |
|-----|-------------|----------|
| **Tauri invoke integration** | Replace in-memory state with `invoke()` calls to Rust backend | **P0** |
| **View routing** | Implement view switching (state-based or React Router) for Key Viewer / Tags / Favorites / Settings | **P1** |
| **Real authentication** | Replace hardcoded `"password"` reveal check with proper auth (OS biometrics, master password) | **P1** |
| **CRUD operations** | Wire Add/Edit/Delete through Tauri commands to OS keyring | **P0** |
| **Search & filter** | Search keys by name, filter by tag | **P2** |
| **Settings page** | Implement settings (default tag, auto-lock timeout, CLI path config) | **P2** |
| **Favorites page** | Implement favorites functionality with persistence | **P2** |
| **KeyTags page** | Fix broken component, implement tag management | **P2** |

#### Configuration & Security

| Gap | Description | Priority |
|-----|-------------|----------|
| **Tauri permissions** | Add `shell:default` (for CLI subprocess), potentially `fs` permissions for `.env` reading | **P0** |
| **CSP policy** | Set proper Content Security Policy (currently `null`) | **P1** |
| **Tauri CLI plugin** | Configure `tauri-plugin-cli` or custom CLI entrypoint in `tauri.conf.json` | **P0** |
| **Folder name typo** | Rename `Commponets/` → `Components/` | **P3** |

#### Testing & Quality

| Gap | Description | Priority |
|-----|-------------|----------|
| **No tests exist** | Zero test files for either frontend or backend | **P1** |
| **No linting config** | No ESLint or Clippy configuration | **P2** |
| **No CI/CD** | No GitHub Actions or equivalent pipeline | **P2** |

### 5.3 Implementation Order (Recommended)

```
Phase 1 — Core Backend (P0)
  1. Add keyring crate + implement OS secret CRUD in manager.rs
  2. Create Tauri commands: set_secret, get_secret, delete_secret, list_secrets
  3. Wire frontend to invoke Tauri commands (replace useState)

Phase 2 — CLI Wrapper (P0)
  4. Add clap crate + implement CLI parser in cli.rs
  5. Implement env injection: read secrets → spawn child process with env vars
  6. Configure Tauri CLI plugin or standalone binary entrypoint

Phase 3 — UI Completion (P1-P2)
  7. Add view routing (sidebar navigation)
  8. Implement real authentication for secret reveal
  9. Build out Settings, Favorites, KeyTags pages
  10. Add search/filter capabilities

Phase 4 — Hardening (P1-P2)
  11. Set CSP and security headers
  12. Add Tauri capability permissions
  13. Write tests (Rust unit tests + frontend component tests)
  14. Error handling and edge cases
```

---

## Appendix: File Inventory

| File | Lines | Status |
|------|-------|--------|
| `src-tauri/src/lib.rs` | 15 | Scaffold only |
| `src-tauri/src/main.rs` | 9 | Scaffold only |
| `src-tauri/src/cli.rs` | 0 | Empty |
| `src-tauri/src/manager.rs` | 0 | Empty |
| `src/main.tsx` | ~8 | Functional |
| `src/App.tsx` | ~80 | Functional, hardcoded data |
| `src/App.css` | ~400 | Complete theme |
| `src/Commponets/SideBar.tsx` | ~120 | Functional |
| `src/Commponets/KeyCard.tsx` | ~150 | Functional, security placeholder |
| `src/Commponets/AddKeyModal.tsx` | ~100 | Functional |
| `src/Favorites.tsx` | ~5 | Empty shell |
| `src/KeyTags.tsx` | ~20 | Broken |
| `src/Settings.tsx` | 0 | Empty |
