# AI Game Director — v1 prototype (Phase 0)

The dashboard lives at **`/director`**. Type one sentence about a game. The director writes the full plan (gameplay, UI, UX, controls, camera, look, characters, tuning) and builds a playable game. You can edit any part of the plan, play the game, write test notes, and the director re-directs it. Every build is saved in the vault.

## Run it

```bash
pnpm install
pnpm dev          # open http://localhost:3000/director
```

With no API key, the **built-in director** handles everything, offline and for free. To have Claude direct the games, copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY`.

## How it maps to the business plan

| Plan decision | Where it lives |
|---|---|
| Dashboard like a chatbot | `components/director/dashboard.tsx` |
| The plan (UI, UX, gameplay, controls, characters) | `lib/director/spec.ts` holds the `GameSpec`, the one contract every model must fill in |
| **One connection** between the director and the models | `lib/director/connection.ts`. Add a provider here to plug in your own model later. Nothing customers see changes |
| Rented model #1: Claude through the API | `lib/director/claude-director.ts` (structured outputs, server-side refusal fallback) |
| Built-in director (no key, always works) | `lib/director/local-director.ts` |
| Builds the game | `lib/game/engine.ts`: collector, dodger, platformer and shooter, driven only by the plan, so no model-written code ever runs |
| Test, then fix | Test notes in the chat go to `redirect`, which produces a new plan version and lessons |
| The vault (our own system, not Obsidian) | `lib/director/vault.ts`. Each entry stores the idea, every plan version, the thread, test notes, fixes and lessons. Lessons are read before every new plan, so builds stop being random |

## What Phase 2 (contract developer) replaces

- Vault storage: browser `localStorage` moves to a server database (same `VaultEntry` shape). Export/Import JSON already works for moving data.
- Accounts, payments, credits.
- Engine connections (Roblox / Unreal export) take the same `GameSpec` as input.
- MCP door (Phase 4): expose `plan` / `redirect` from `connection.ts` as MCP tools.
