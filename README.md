<div align="center">

# 🗝️ Kimu
**A Next-Generation Secret Manager & CLI Wrapper for the AI Era.**

[![Tauri](https://img.shields.io/badge/Tauri-v2-24C8DB?logo=tauri&style=for-the-badge)](https://tauri.app/)
[![Rust](https://img.shields.io/badge/Rust-black?logo=rust&style=for-the-badge)](https://www.rust-lang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB&style=for-the-badge)](https://reactjs.org/)

</div>

<br />

> **Stop hardcoding secrets in your `.env` files.**
> Kimu keeps your API keys and database passwords out of your codebase, protecting you from accidental leaks—especially when sharing code with AI assistants like Claude, ChatGPT, or GitHub Copilot.

---

## 🚀 The Magic of Kimu

With Kimu, you no longer write real passwords in your local files. Instead, you use **Placeholders**.

### ❌ Before (Dangerous)
```env
# .env.local
DATABASE_URL=postgres://user:SuperSecretPassword@localhost/db
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
```

### ✨ After with Kimu (100% Safe)
```env
# .env.local
DATABASE_URL=SECRET{{DB_PASSWORD}}
OPENAI_API_KEY=SECRET{{OPENAI_KEY}}
```

When you run your project using Kimu's CLI wrapper:
```bash
kimu run -- npm run dev
```
Kimu automatically **intercepts** the command, fetches the real values securely from your OS native keychain, and **injects** them directly into memory. Your code and `.env` files remain perfectly clean!

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| 🛡️ **OS-Level Security** | Secrets are stored natively in macOS Keychain, Windows Credential Manager, or Linux Secret Service. |
| ⚡ **Zero Code Changes** | Your app doesn't need to know about Kimu. It just reads standard `process.env`. |
| 🧠 **Smart `.env` Discovery** | Auto-detects `.env.local`, `.env.development`, and `.env` respecting standard priority rules. |
| 🎭 **Hybrid Architecture** | Run `kimu` for a beautiful Desktop UI, or `kimu run --` for a headless CLI wrapper. |
| 🏷️ **Tags & Favorites** | Organize your secrets smoothly with custom tags and quick-access favorites. |

---

## 📦 Installation

### Option 1: Pre-built Installers (Recommended)
1. Go to the [Releases](../../releases) page.
2. Download the installer for your OS (`.dmg` for macOS, `.exe` for Windows).
3. Install the application.
4. Add the installed binary to your system `$PATH` to use the `kimu` command globally.

### Option 2: Build from Source
Ensure you have **Node.js** and **Rust** installed on your machine.
```bash
# Clone the repository
git clone [https://github.com/EriTech404/Kimu.git](https://github.com/EriTech404/Kimu.git)
cd Kimu

# Install dependencies and build
npm install
npm run tauri build
```
Once built, add the executable located at `src-tauri/target/release/kimu` to your `$PATH` (e.g., `~/.zshrc`).

---

## 💻 Usage Guide

### 1. Register Secrets (GUI Mode)
Simply type `kimu` without arguments to launch the beautiful Desktop UI.
```bash
kimu
```
Click **"Add Secret"**, define a Key name (e.g., `DB_PASSWORD`), enter your actual secret value, and assign tags.

### 2. Run Your App (CLI Mode)
Prefix your daily development commands with `kimu run -- `. Kimu works with any language or framework.
```bash
# Node.js / Next.js / Vite
kimu run -- npm run dev

# Python
kimu run -- python main.py

# Go
kimu run -- go run main.go

# Docker
kimu run -- docker-compose up
```
