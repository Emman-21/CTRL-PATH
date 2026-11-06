# CTRL+PATH — Academic Guidance Platform

A magical, game-like academic guidance platform for first-year BSIT students at **Batangas State University – Alangilan**. Students explore three IT tracks, take a self-assessment quiz, compare curricula, and collect achievement gemstones as they go.

Everything runs in the browser: there is no backend, no account, and no API key required.

## What it does

| Capability | Description |
|---|---|
| **Dashboard** (`/`) | Journey progress, recent gemstones, next suggested activity, and track cards |
| **Track Explorer** (`/tracks`) | Curriculum, core skills, careers, and learning modules for each track |
| **CTRL Quiz** (`/quiz`) | Five-chapter assessment across all three tracks, with resume, review, and submit |
| **Smart Results** (`/results`) | Per-track score breakdown, answer review, attempt history, and attempt comparison |
| **Path Compare** (`/compare`) | Side-by-side comparison of two or three tracks, saved views, and a reflection card |
| **Achievement Vault** (`/achievements`) | All 20 gemstones with filters, sorting, detail dialogs, and celebration animations |
| **Luni** | Sprite-based helper character with scripted tips, praise, and celebrations |
| **Control Center** (`/control-center`) | Student profile, preferences (reduced motion, contrast, text size), reflections, and data export/reset |
| **Community** (`/alumni`, `/announcements`) | Consent-verified alumni stories and approved notices — currently empty by design |

**Tracks:** Networking Technology (`NT`), Business Analytics (`BA`), Service Management (`SM`).

## Tech stack

- **React 19** + **TypeScript** (`tsc --noEmit` as the type check)
- **Vite 8** (dev server and production build)
- **Tailwind CSS 4** via `@tailwindcss/vite`
- **react-router-dom 7** (`createBrowserRouter`, lazy-loaded secondary pages)
- **motion** for animation, **lucide-react** for icons
- Tests run on Node's built-in `node:test` through **tsx**, plus optional **Playwright** browser suites

## Getting started

**Prerequisites:** Node.js 20 or newer (verified on Node 26) and npm.

```bash
# 1. Install dependencies from the lockfile
npm ci

# 2. Start the dev server (http://localhost:3000)
npm run dev
```

The dev server binds to `0.0.0.0` on port **3000** with hot reload.

No environment variables are needed to run the app. `.env.example` is leftover scaffolding from the original AI Studio template and is not read by any code in this repository.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server on port 3000 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run lint` | TypeScript type check (`tsc --noEmit`), no emit |
| `npm run clean` | Remove `dist/` and the legacy `server.js` artifact |
| `npm run test:achievements` | Achievement, migration, and vault logic suite (15 tests) |
| `npm run test:stage8` | Community, profile, module, and data-control suite (15 tests) |
| `npm run test:achievements:browser` | Playwright suite for the Achievement Vault |
| `npm run test:stage8:browser` | Playwright suite for community and control-center flows |

## Project structure

```
src/
  App.tsx              routes and providers
  main.tsx             React root
  index.css            Tailwind entry, theme tokens, component styles
  assets/manifest.ts   canonical achievement metadata and artwork paths
  components/
    achievements/      vault cards, dialogs, attempt comparison
    community/         alumni and announcement cards
    compare/           path comparison UI
    control/           profile, preferences, privacy, reflections
    dashboard/         dashboard sections
    layout/            app shell, sidebar, topbar, mobile nav
    luni/              sprite character, panel, dialogues
    quiz/              quiz flow and per-question-type renderers
    results/           scorecards, answer review, attempt history
    shared/            buttons, cards, badges, error boundary, celebration
    tracks/            track cards, detail tabs, reflection panel
  context/             StudentContext, CommunityContext
  data/                track content, quiz bank and levels, Luni dialogue
  pages/               one component per route
  types/               shared TypeScript models
  utils/               achievement rules, storage, quiz engine, selectors
public/assets/aistudio/ image sprites, backgrounds, and achievement art
tests/                 node:test suites and Playwright browser suites
```

Path alias: `@/*` maps to the project root (configured in both `tsconfig.json` and `vite.config.ts`).

## Data and persistence

All student state lives in `localStorage`; nothing leaves the device.

| Key | Contents |
|---|---|
| `ctrl_path_student_data_v1` | Profile, preferences, exploration, module completions, quiz attempts, reflections, comparisons, and the achievement ledger |
| `ctrl_path_quiz_session_v1` | In-progress quiz session (answers and position) |

- The student payload carries `profileSchemaVersion: 1` and `achievementSchemaVersion: 2`.
- Legacy numeric gemstone IDs are migrated and deduplicated into the canonical `achievementRecords` ledger; the original payload is backed up before any migration or repair.
- Malformed or unreadable payloads are backed up and never silently overwritten. If a backup cannot be written, the original data is preserved and a visible storage warning is shown.
- Missing data starts a genuinely empty profile rather than demo content.
- `Control Center → Privacy & Data` can export or clear student data and backups.

## Achievements

20 canonical gemstones: four per track (three activities plus one track epic), plus four special ones (First Spark, Crystal Collector, Fusion Theory, Beyond the Surface) and Your Own Universe as the completion milestone. Artwork and requirements are defined once in `src/assets/manifest.ts`; the evaluator in `src/utils/achievementRules.ts` is pure, so it can be reused behind a future server-side verifier.

Nine track activities (networking fundamentals, troubleshooting, security, pattern recognition, data interpretation, business problem solving, customer support, workflow optimization, IT service management) have no completion implementation yet, so their gemstones stay locked with an "Awaiting activity availability" state.

## Community content

`ALUMNI_STORIES` and `ANNOUNCEMENTS` in `src/data/communityData.ts` are intentionally empty: no consented alumni records or approved notices were supplied. Selectors only surface entries that are published, verified, and — for announcements — within a valid date window. Do not add placeholder stories or notices; the publishing workflow is documented in that file.

## Testing

Unit and logic suites use Node's test runner and need no browser:

```bash
npm run test:achievements
npm run test:stage8
npm run lint
npm run build
```

The browser suites need an installed Playwright with Chromium. Start the dev server first, then:

```bash
TEST_BASE_URL=http://localhost:3000 npm run test:achievements:browser
TEST_BASE_URL=http://localhost:3000 npm run test:stage8:browser
```

| Variable | Purpose |
|---|---|
| `TEST_BASE_URL` | Base URL of the running app (defaults to `http://localhost:3000`) |
| `PLAYWRIGHT_MODULE` | Path to a Playwright module when it is not installed locally |
| `PLAYWRIGHT_CHROMIUM` | Path to a Chromium executable |

Screenshots and `browser-results.json` are written to `.test-artifacts/` (git-ignored). Browser suites run in an isolated context, never against a real student profile.

## Build and deploy

```bash
npm run build   # static output in dist/
```

`dist/` is a static SPA. Serve it from any static host with a **history-fallback rewrite to `index.html`**, because routing is client-side (`/achievements`, `/control-center`, and other deep links must not 404). `npm run preview` works as a local sanity check.

## Known limitations

- Frontend-only persistence: no tamper-proof verification, no cross-device sync, and clearing browser storage loses progress.
- Nine track activities are not yet implemented (see [Achievements](#achievements)).
- Legacy awards from earlier builds are preserved rather than re-verified, so historically earned gemstones may predate the current rules.
- Browser verification covers Chromium only, not every browser or physical mobile devices.
- The main JS bundle is above Vite's 500 kB warning threshold; further code-splitting is possible but not yet done.

## Reference

`STAGE7_REPORT.md` documents the Achievement Vault work in detail — milestone rules, migration behavior, image mappings, and the validation that was run.
