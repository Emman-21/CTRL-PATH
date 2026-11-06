# Stage 7 implementation report - Achievement Vault

Implemented inside the existing React + Vite application. Stages 1-6 and the quiz scoring engine remain in place. No Stage 8 work was started.

## Features

- Exactly 20 canonical achievements, with the original Phase 1 Kit PNGs, Crystal Garden background, and existing Luni sprites.
- Responsive collection page with all/category/status filters, name/rarity/recent sorting, empty states, collection statistics, descriptions, requirements, earned dates, and measured dependency progress.
- Locked, in-progress, unlocked, and newly earned presentation. Original artwork retains its transparency and track colors; unavailable activities are clearly identified.
- Accessible detail and celebration dialogs with initial focus, explicit Tab/Shift+Tab wrapping, Escape, focus restoration, scroll containment, and 44px close controls.
- One shared celebration queue, short finite particles/entrance animation, scripted Luni praise, screen-reader announcement, and persistent acknowledgement when shown. Old migrated unlocks never replay.
- System and Control Center reduced-motion preferences disable motion. Mobile cards use one readable column; tablet uses two; desktop uses four, with five on wider screens.
- Dashboard recent gems and counts use the same record-derived selectors as the Vault. No independent achievement count or demo unlock control remains.

## Rules and earlier-stage integrations

| Milestone | Checked evidence and award |
|---|---|
| Track Explorer | Marking NT, BA, or SM explored persists the track state and awards only its introductory gemstone. Repeated actions are idempotent. |
| CTRL Quiz | Submission persists a stable session reference. The engine validates all designated question answer shapes against the existing question bank before awarding First Spark. Starting/opening a quiz or submitting incomplete answers grants no gem. Quiz scoring and the existing ability to submit with omissions are unchanged. |
| Path Compare | Students select two or three distinct tracks, review curriculum/skills/careers, acknowledge that review, then save. A saved review timestamp and valid distinct tracks are required for Fusion Theory. Opening the page grants nothing. |
| Attempt comparison | Smart Results offers two completed attempts, score differences, a review acknowledgement, and an explicit completion button. Beyond the Surface requires different completed attempts and a later eligible retake (attempt 2 or 3). Viewing history or submitting a retake alone grants nothing. |
| Track epic gems | Four prerequisites in a category unlock Techno-Gem, Crystal Vision, or Perfect Coordination. |
| Crystal Collector | Ten distinct other canonical achievements; the collector does not count itself. |
| Your Own Universe | All fifteen track achievements, including the three epics. Dependencies are evaluated in order and never duplicate records. |

## Persistence and migration

The existing `ctrl_path_student_data_v1` storage key is retained. The payload now contains `achievementSchemaVersion: 2`, a canonical `achievementRecords` ledger, and completed attempt comparisons. Each new record stores its string ID, ISO timestamp, completion reference, and celebration acknowledgement.

`unlockedGemstones` remains a read-only numeric compatibility projection in memory for older UI components. It is excluded from new persisted payloads, so there is one source of truth.

Legacy numeric IDs and canonical records are deduplicated. Recognized prior unlocks are preserved, including records whose provenance cannot be reconstructed. Unknown IDs are excluded from counts; the original payload is retained in a timestamped backup before migration or repair. Missing legacy timestamps display "Earned previously - date unavailable." Migration can reconcile derived prerequisites without inventing historical unlock dates or replaying celebrations.

Missing data starts a genuinely empty student profile. Valid saved profile fields, quiz history, reflections, preferences, track exploration, and progress survive migration. Malformed payloads are backed up. If backup fails, the original is not overwritten and a visible session-only warning is shown. Storage write failures also show a visible warning. No live student data was cleared during development or testing.

## Files created

- `src/types/achievements.ts`
- `src/utils/achievementRules.ts`
- `src/utils/achievementStorage.ts`
- `src/components/achievements/AchievementCard.tsx`
- `src/components/achievements/AchievementDialog.tsx`
- `src/components/achievements/AchievementDetailModal.tsx`
- `src/components/achievements/AttemptComparisonPanel.tsx`
- `tests/achievements.test.ts`
- `tests/achievements.browser.mjs`
- `STAGE7_REPORT.md`

## Files modified

- `src/assets/manifest.ts` - canonical IDs, requirements, rarities; original artwork paths retained.
- `src/types/index.ts` - ledger, comparison and submission metadata.
- `src/context/StudentContext.tsx` - migration, empty defaults, checked completion transitions, acknowledgement, shared compatibility projection.
- `src/pages/AchievementsPage.tsx` - rebuilt interactive Vault.
- `src/components/shared/AchievementUnlockCelebration.tsx` - shared queued celebration.
- `src/components/layout/AppShell.tsx` - celebration host, storage feedback, reduced motion.
- `src/pages/TrackExplorerPage.tsx` - central exploration award; removed local celebration duplication.
- `src/pages/CtrlQuizPage.tsx` - stable submission reference; removed direct award and duplicate toast.
- `src/pages/PathComparePage.tsx` - explicit review requirement; removed separate reward overlay.
- `src/pages/SmartResultsPage.tsx` - removed page-load award; added genuine attempt comparison.
- `src/pages/DashboardPage.tsx` - shared totals and recent records, empty collection message.
- `src/data/luniDialogues.ts` - truthful scripted Vault introduction.
- `src/index.css` - responsive Vault, rarity styling, dialogs, finite effects, motion preferences.
- `package.json` - repeatable regression/browser test scripts.
- `.gitignore` - generated test evidence excluded.

## All 20 image mappings

These paths are served from `public`. The existing manifest is the canonical metadata/asset source; `achievementAssetMap` derives a string-ID lookup from it.

| Canonical achievement ID | Original image |
|---|---|
| `nt-peridots-protocol` | `/assets/aistudio/01_peridots_protocol_f55976cf.png` |
| `nt-packet-pathfinder` | `/assets/aistudio/02_packet_pathfinder_01c5c33b.png` |
| `nt-signal-keeper` | `/assets/aistudio/03_signal_keeper_30d58945.png` |
| `nt-guardian-of-the-grid` | `/assets/aistudio/04_guardian_of_the_grid_d23f2dd5.png` |
| `nt-techno-gem` | `/assets/aistudio/05_techno_gem_6f2d6183.png` |
| `ba-garnets-foresight` | `/assets/aistudio/06_garnets_foresight_de542d8b.png` |
| `ba-pattern-seeker` | `/assets/aistudio/07_pattern_seeker_d68a7bbb.png` |
| `ba-data-detective` | `/assets/aistudio/08_data_detective_a158b94f.png` |
| `ba-oracle-of-numbers` | `/assets/aistudio/09_oracle_of_numbers_0648650f.png` |
| `ba-crystal-vision` | `/assets/aistudio/10_crystal_vision_a4213e39.png` |
| `sm-pearls-precision` | `/assets/aistudio/11_pearls_precision_8d450275.png` |
| `sm-customer-champion` | `/assets/aistudio/12_customer_champion_85e15dc6.png` |
| `sm-workflow-weaver` | `/assets/aistudio/13_workflow_weaver_1b55f146.png` |
| `sm-keeper-of-standards` | `/assets/aistudio/14_keeper_of_standards_3e9fd767.png` |
| `sm-perfect-coordination` | `/assets/aistudio/15_perfect_coordination_3632e49f.png` |
| `special-first-spark` | `/assets/aistudio/16_first_spark_2f17682e.png` |
| `special-crystal-collector` | `/assets/aistudio/17_crystal_collector_d35904e3.png` |
| `special-fusion-theory` | `/assets/aistudio/18_fusion_theory_b3ac2ea4.png` |
| `special-beyond-the-surface` | `/assets/aistudio/19_beyond_the_surface_3b4446dd.png` |
| `special-your-own-universe` | `/assets/aistudio/20_your_own_universe_bf6e0e20.png` |

## Validation

- `npm run test:achievements`: 15 tests passed, covering canonical IDs/rarities/assets, empty profiles, all three intro events, idempotence, quiz answer validation, meaningful comparison evidence, retake comparison eligibility, all epic dependencies, collector threshold, universe cascade, statistics/filters/sorting, unavailable activities, legacy migration, backups, corrupt data, duplicate records, and acknowledgement persistence.
- `npm run test:achievements:browser`: 13 verification groups passed in isolated Chromium, with zero browser errors or failed local requests. This exercised actual exploration and comparison controls, quiz submissions, eligible retake comparison, persistence/acknowledgements, shared Dashboard counts, all 20 decoded images, 360/768/1440 layouts, filters/sorting, keyboard focus, Escape, both reduced-motion preferences, mobile touch emulation, and existing routes.
- `npm run lint`: TypeScript passed after the final product changes.
- `npm run build`: production build succeeded after the final product changes (1,717 modules; main JS 549.18 kB, 154.43 kB gzip). Vite reports the existing configuration's `__dirname` forward-compatibility warning and a bundle over 500 kB.
- Browser fixtures run in an isolated Chromium context, never the student's existing profile. Quiz integration tests seed complete answer fixtures and then use the actual saved-session resume - Review - Submit flow; they do not claim manual completion of every quiz question.
- Generated screenshots and machine-readable browser results are saved under `.test-artifacts/`.

## Missing activities and limitations

The designated networking fundamentals, troubleshooting, security, pattern recognition, data interpretation, business problem solving, customer support, workflow optimization, and IT service management activities do not yet have verified completion implementations. Their nine achievements stay locked for new students, with "Awaiting activity availability." Existing generic module reading and quiz scores cannot award them. New students therefore cannot yet earn the three track epics, collector, or universe through ordinary activity completion.

Existing legacy gems are preserved because older records cannot reliably distinguish genuine completion from the former demo awards. Unknown historical timestamps and event provenance are not fabricated. Legacy summary-only quiz attempts without complete answer evidence cannot qualify for new retake-comparison rewards.

This is frontend-only persistence, not tamper-proof verification or cross-device synchronization. The pure milestone evaluator is a boundary for future server/Firebase verification; no Firebase service was introduced. Browser validation covers Chromium, not every browser or a physical touch device.

## Re-running checks

Run `npm run test:achievements`, `npm run lint`, and `npm run build` from the project directory. The optional browser suite uses an installed Playwright/Chromium runtime. Set `TEST_BASE_URL` to the running development server; `PLAYWRIGHT_MODULE` and `PLAYWRIGHT_CHROMIUM` can point to a shared installation. This run used `http://localhost:3001`. The suite writes screenshots and `browser-results.json` under `.test-artifacts/`.
