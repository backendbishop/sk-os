# SK OS

A browser-based operating system, built from scratch — kernel, filesystem, process manager, event bus, services, and a terminal shell, all running client-side. My portfolio content lives inside it as files and processes instead of sitting on a normal webpage.

It's not a themed UI on top of a portfolio. The architecture is the point.

## Why

Most developer portfolios answer "what have you built?" SK OS is an attempt to answer "how do I think?" — every directory, command, and failure message is meant to demonstrate actual backend/systems judgment, not just list projects.

## Running it locally

```bash
git clone https://github.com/backendbishop/sk-os.git
cd sk-os
npm install
npm run dev -- --webpack
```

Open `http://localhost:3000`. (Turbopack is not yet supported on all platforms — `--webpack` is the safe default.)

## Architecture

```
kernel
 ├─ event bus ─────────┬─ filesystem
 ├─ process manager    ├─ services (registry + lifecycle)
 └─ terminal (shell)   └─ logger
```

Everything routes through the event bus. Commands act on the filesystem and process manager; the logger and services observe and react. Nothing is purely decorative — if a command prints a result, something real (within the simulation) produced it.

- `src/kernel/` — orchestrator, core types
- `src/events/` — pub/sub event bus
- `src/filesystem/` — virtual filesystem (nodes, tree, operations)
- `src/terminal/` — shell parser and React terminal component
- `src/commands/` — one implementation per command, wired through a registry
- `src/processes/` — process lifecycle tracking
- `src/applications/` — application window shell for `open`
- `src/services/definitions/` — background services exposed to the OS
- `src/logs/` — structured logging through the event bus
- `src/store/` — global state
- `src/ui/` — boot sequence, desktop, window manager, status bar

## Using it

Boot it, then type `help`. A few starting points:

| Command | What it does |
|---|---|
| `ls`, `cd`, `pwd`, `cat` | Navigate and read the virtual filesystem |
| `open <name>` | Launch an application (see `works/`) |
| `processes`, `kill <pid>` | Inspect and manage running processes — system processes are protected |
| `services` | List registered background services |
| `logs` | View the session log — every command execution is recorded |
| `search` | Search across the filesystem |
| `whoami`, `neofetch` | System/identity info |

Real projects live under `works/` — currently [Vaultkey](https://github.com/backendbishop/vaultkey) (JWT auth: token lifecycle, refresh rotation, revocation) and [Throttlr](https://github.com/backendbishop/throttlr) (rate-limiting middleware comparing fixed-window vs. sliding-window algorithms). `cat works/<name>` for the engineering writeup; `decisions/` holds architecture decision records explaining real tradeoffs from production fintech work.

## Status

Actively being built. The kernel, filesystem, terminal, and core command set work end to end. Newer subsystems (scheduler, network simulation, persistence, richer introspection) are in progress — `ls system/`, `services`, and `logs` always reflect what's actually wired up, not what's planned.

## Find me

[skimeu.pages.dev](https://skimeu.pages.dev) · [@backendbishop](https://github.com/backendbishop) · mekakimeu@yahoo.com

## License

MIT — see [LICENSE](LICENSE).

