# MVP — Project Guide

## Concept
Daily football player guessing game (Wordle-style), starting with Brazil. Designed to be repurposed for any national team by swapping config + dataset.

## Tech Stack
- **Framework**: Expo (React Native) — single codebase for web, iOS, Android
- **Web hosting**: GitHub Pages
- **Storage**: AsyncStorage (local-first; user accounts planned for future)
- **i18n**: Browser language detection — Portuguese for PT speakers, English for everyone else
- **Scraper**: Python script, run manually to update dataset

## Game Rules
- 6 guesses per day
- 1 player per day, resets at midnight GMT-3
- Daily player: randomly seeded by date, full pool, reshuffles when exhausted
- Shareable result (emoji grid)

## Player Attributes & Feedback
| Attribute | Type | ✅ Correct | 🟡 Close | ❌ Far |
|---|---|---|---|---|
| Position | GK/DEF/MID/FWD | exact match | — | wrong (no arrow) |
| Caps | number | exact | ±10 | arrow ↑↓ |
| Goals | number | exact | ±5 | arrow ↑↓ |
| First year | number | exact | ±5 | arrow ↑↓ |
| Last year | number | exact | ±5 | arrow ↑↓ |

## Player Pool
- Source: Wikipedia (scraped manually)
- Filter: 10+ caps, all-time
- Stats are frozen at scrape time; update by re-running scraper

## Project Structure
```
craque/
├── scraper/
│   └── scrape_brazil.py
├── src/
│   ├── config/brazil.ts          # Colors, title, flag, dataset path
│   ├── data/brazil_players.json
│   ├── i18n/en.ts, pt.ts
│   ├── components/
│   │   ├── GuessRow.tsx          # Animated attribute reveal
│   │   ├── GuessInput.tsx        # Autocomplete
│   │   ├── EndScreen.tsx         # Player name, summary, fun fact, share
│   │   └── StatsModal.tsx        # Win %, streak, guess distribution
│   ├── utils/
│   │   ├── dailyPlayer.ts        # Seeded daily selection
│   │   ├── evaluateGuess.ts      # correct / close / far logic
│   │   └── storage.ts
│   └── screens/GameScreen.tsx
```

## Config System
All team-specific values live in one file (e.g. `src/config/brazil.ts`): colors, title, flag, dataset path, locale. Adding a new country = new config + new dataset, no code changes.

## Build Phases
1. **Scraper** — Python script → `brazil_players.json`
2. **Game logic** — daily selection, guess evaluator, local storage
3. **UI** — autocomplete input, animated reveals, end screen, stats modal, countdown
4. **Config system** — enforce team-agnostic architecture
5. **Deploy** — Expo web → GitHub Pages

## Future (not now)
- User accounts + backend
- App Store / Play Store
- Real fun facts source
- More national teams
