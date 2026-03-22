# MVP — Task Breakdown

## Phase 1 — Scraper
- [ ] Identify Wikipedia page(s) for Brazil all-time national team players
- [ ] Write Python script to scrape player list
- [ ] Parse and normalize: name, position (GK/DEF/MID/FWD), caps, goals, first year, last year
- [ ] Filter out players with fewer than 10 caps
- [ ] Add `fun_fact` field as empty string (to be filled later)
- [ ] Output to `src/data/brazil_players.json`
- [ ] Test script and validate data quality

## Phase 2 — Game Logic
- [ ] `dailyPlayer.ts` — seed daily player by date, track used pool in storage, reshuffle on exhaustion
- [ ] `evaluateGuess.ts` — return `correct / close / far` + `up / down` direction per attribute
- [ ] `storage.ts` — save/load: today's guesses, game state (won/lost), stats (streak, win %, distribution)
- [ ] Handle edge case: user returns mid-day with existing guesses

## Phase 3 — UI
- [ ] `GuessInput.tsx` — text input with autocomplete dropdown filtered by dataset; prevent duplicate guesses
- [ ] `GuessRow.tsx` — row of 5 attribute cells with animated sequential reveal (correct/close/far colors + arrows)
- [ ] `GameScreen.tsx` — main screen: input, guess rows (6 max), countdown timer (next player, midnight GMT-3)
- [ ] `EndScreen.tsx` — player name, attribute summary, lorem ipsum fun fact, share button (emoji grid to clipboard)
- [ ] `StatsModal.tsx` — win %, current streak, max streak, guess distribution bar chart
- [ ] i18n — `en.ts` and `pt.ts` string files, auto-detect browser/device language on load

## Phase 4 — Config System
- [ ] Define `TeamConfig` TypeScript interface (colors, title, flag emoji, datasetPath, locale fallback)
- [ ] Create `src/config/brazil.ts` implementing the interface
- [ ] Ensure all components consume config via context/props — no hardcoded team values anywhere
- [ ] Verify a second config file could swap the whole theme with zero code changes

## Phase 5 — Deploy
- [ ] Init Expo project, confirm web build works (`expo build:web`)
- [ ] Set up GitHub repository
- [ ] Configure GitHub Pages to serve from build output
- [ ] Add deploy script to `package.json`
- [ ] Smoke test on desktop browser and mobile browser
