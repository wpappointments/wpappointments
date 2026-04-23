# WP Appointments Monorepo

## Local Development

Prerequisites: [Docker](https://www.docker.com/), [Node.js](https://nodejs.org/), [pnpm](https://pnpm.io/)

```bash
# First-time setup (installs deps, starts WordPress, runs composer, builds assets)
pnpm run initialize

# Start dev server with hot reload
pnpm run dev
```

The dev site runs at http://localhost:8888 (admin: `admin` / `password`).

## Internal Developer Setup

The repository includes private git submodules for premium add-ons and the Claude Code workspace. These are **not required** for building or contributing to the open-source plugin — they are only for team members with access to the private repos.

```bash
# Initialize all private submodules
git submodule update --init --recursive
```

| Submodule | Path | Repo | Purpose |
|-----------|------|------|---------|
| Premium Add-ons | `premium/` | `wpappointments/wpappointments-premium` | Premium plugin extensions |
| Claude Code Workspace | `.claude/` | `wpappointments/claude` | Plans, tasks, and AI-assisted dev workflow |

### Keeping submodules up to date

Submodules pin to a specific commit. After pulling the main repo, update them to match:

```bash
git submodule update
```

To pull the latest from the submodule remotes (ahead of what the main repo points to):

```bash
git submodule update --remote
```

### Pushing submodule changes

Changes inside a submodule need to be pushed separately, then the pointer updated in the main repo:

```bash
# 1. Push the submodule
cd .claude  # or premium/
git add -A && git commit -m "Your message" && git push origin main

# 2. Update the pointer in the main repo
cd ..
git add .claude  # or premium/
git commit -m "Update .claude submodule"
```
