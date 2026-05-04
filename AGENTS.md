# AGENTS.md

## Project Overview

Excalidraw is an open-source, collaborative virtual whiteboard for sketching hand-drawn-like diagrams. Built with React and TypeScript, it uses a custom Canvas 2D rendering engine and custom state management via `actionManager`.

## Tech Stack

- **Language**: TypeScript (strict mode)
- **UI**: React 19 (functional components, hooks only)
- **Build**: Vite
- **Testing**: Vitest + React Testing Library
- **Package Manager**: Yarn 1.x with workspaces
- **Linting**: ESLint + Prettier

## Project Structure

```
excalidraw-monorepo/
├── excalidraw-app/        # Vite-based web application
├── packages/
│   ├── excalidraw/        # Core library (@excalidraw/excalidraw)
│   │   ├── components/    # React UI components
│   │   ├── actions/       # State actions (actionManager)
│   │   ├── renderer/      # Canvas rendering pipeline
│   │   ├── scene/         # Scene management
│   │   └── types.ts       # Core type definitions (AppState)
│   ├── math/              # Math utilities (points, angles, vectors)
│   ├── element/           # Element types and operations
│   ├── common/            # Shared utilities
│   └── utils/             # General utilities
├── examples/              # Usage examples (Next.js, browser script)
└── dev-docs/              # Developer documentation
```

## Key Commands

- `yarn` — install dependencies
- `yarn start` — start dev server (excalidraw-app)
- `yarn build` — build the app
- `yarn test:app` — run Vitest tests
- `yarn test:typecheck` — TypeScript type checking
- `yarn test:code` — ESLint
- `yarn test:other` — Prettier check
- `yarn test:all` — run all checks
- `yarn fix` — auto-fix linting and formatting

## Architecture

- **State Management**: custom `actionManager` (NOT Redux/Zustand/MobX). State updates via `actionManager.dispatch()` only. State type: `AppState` in `packages/excalidraw/types.ts`.
- **Rendering**: Canvas 2D rendering via custom engine (NOT React DOM for drawing). Pipeline: Scene -> `renderScene()` -> canvas 2D context.
- **Monorepo**: Yarn workspaces with `@excalidraw/*` package aliases defined in `tsconfig.json`.

## Conventions

- Functional components with hooks only (no class components)
- Named exports only (no default exports)
- Props type: `{ComponentName}Props`
- Colocated tests: `ComponentName.test.tsx`
- TypeScript strict mode — no `any`, no `@ts-ignore`
- SCSS modules or CSS custom properties for styling
- kebab-case for utility files, PascalCase for components

## Skills

Available skills in this project (carried over from Day 3):

- **creating-excalidraw-components** (`.agents/skills/`) — Create React components following Excalidraw's patterns and conventions
- **reviewing-excalidraw-changes** (`.agents/skills/`) — Review PRs and diffs for correctness, architecture, conventions, tests, and bundle/import hygiene
- **excalidraw-architecture** (`.agents/skills/`) — Architecture deep-dive with state management and rendering pipeline references
- **analyzing-bundle-size** (`.agents/skills/`) — Bundle size and forbidden-import checks via scripts

## MCPs

This project uses MCP servers configured in `.cursor/mcp.json`. The committed file is `.cursor/mcp.json.example` — copy it to `.cursor/mcp.json` (gitignored) and fill in any secrets via environment variables.

Connected public MCPs (pinned versions):

- **filesystem** (public, `@modelcontextprotocol/server-filesystem@2025.10.20`) — local filesystem access restricted to `./excalidraw-app` and `./examples`; touches only files in those roots; no secrets.
- **context7** (public, `@upstash/context7-mcp@2.1.8`) — fetches external library/framework docs for coding assistance; touches query terms + remote docs snippets; no secrets in current config.
- **github** (public, `@modelcontextprotocol/server-github@2025.4.8`, disabled by default) — GitHub repo/issue/PR operations; touches GitHub API data for authorized repos; uses `${env:GH_PAT}` as token.

Built custom MCPs:

- **excalidraw-scenes-ts** (custom, `mcp-examples/excalidraw-scenes-ts`) — TypeScript MCP for `.excalidraw` scene workflows with tools `list_scenes`, `read_scene`, `extract_text` and resource `excalidraw://docs/dev-docs-readme`; touches local scene files and `dev-docs/README.md`; no secrets.
- **excalidraw-scenes-py** (custom, `mcp-examples/excalidraw-scenes-py`, disabled by default) — Python FastMCP variant exposing similar scene-focused tools/resources; touches local scene files and local docs resource content; no secrets.

See `docs/mcp/SECURITY.md` for the per-MCP threat model and `docs/mcp-testing/` for A/B test results.

## Development Workflow

- Start by reproducing the task in the smallest scope possible.
- Prefer package-level changes in `packages/*` before app-level changes in `excalidraw-app/`.
- Keep changes focused and atomic to simplify review.
- Run typecheck and relevant tests before opening a PR.
- Update docs when behavior, architecture, or MCP setup changes.

## Testing and Validation

- Minimum validation for non-trivial changes: `yarn test:typecheck`.
- For app-facing behavior changes, run `yarn test:app`.
- For repository hygiene, run `yarn test:all` before merge.
- If snapshots are intentionally changed, run `yarn test:update`.
- MCP-related changes should be validated by startup checks and A/B notes in `docs/mcp-testing/`.

## PR and Review Guidelines

- Keep PR description concise and task-focused.
- Include a short test plan with exact commands executed.
- Call out risks, migration notes, or compatibility constraints.
- Prefer follow-up PRs over mixing unrelated refactors.
- Ensure secrets remain local (`.cursor/mcp.json`) and never committed.
