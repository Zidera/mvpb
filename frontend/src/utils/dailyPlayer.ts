/**
 * dailyPlayer.ts
 *
 * Determines which player is shown for any given day, with no backend needed.
 *
 * Algorithm:
 *   - The full player pool is shuffled using a seeded RNG (mulberry32).
 *   - One player is shown per day, advancing by index from the shuffled pool.
 *   - When all players have been used (one full cycle), the pool reshuffles
 *     with a new seed and the cycle repeats — no player repeats within a cycle.
 *   - The seed is derived from EPOCH + cycle number, so it's deterministic:
 *     any device on any given day will always get the same player.
 *
 * Day boundary: midnight GMT-3 (Brazil Standard Time, UTC-3).
 * To change the timezone for another country, update getGameDateString().
 */

import { Player } from '../config/types';

// ── Time helpers ──────────────────────────────────────────────────────────────

/**
 * Returns today's game date string (YYYY-MM-DD) in GMT-3.
 * All daily logic is relative to this value — both save and load use it
 * to ensure consistency across timezone edge cases near midnight.
 */
export function getGameDateString(): string {
  const now = new Date();
  const gmt3 = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return gmt3.toISOString().slice(0, 10);
}

/** Milliseconds until next midnight GMT-3 — used by the countdown timer. */
export function msUntilNextDay(): number {
  const now = new Date();
  const gmt3Now = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const nextMidnight = new Date(gmt3Now);
  nextMidnight.setUTCHours(24, 0, 0, 0);
  return nextMidnight.getTime() - gmt3Now.getTime();
}

// ── Seeded RNG ────────────────────────────────────────────────────────────────

/**
 * Mulberry32 — fast, seedable pseudo-random number generator.
 * Returns a function that yields floats in [0, 1).
 * Used so the shuffle is reproducible across all clients.
 */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle using the seeded RNG. */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const arr = [...array];
  const rand = mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Converts a YYYY-MM-DD string to a numeric seed. */
function dateToSeed(dateStr: string): number {
  return parseInt(dateStr.replace(/-/g, ''), 10);
}

// ── Daily player selection ────────────────────────────────────────────────────

/**
 * Returns the player for today given the full player list.
 *
 * EPOCH is day 0 of cycle 1 — the starting point for index counting.
 * Changing EPOCH would shift all future daily players; don't change it
 * once the game is live unless you want to reset the sequence.
 */
export function getDailyPlayer(players: Player[]): Player {
  const EPOCH = '2025-01-01'; // Day 0 — do not change after launch

  const today = getGameDateString();
  const epochDate = new Date(EPOCH + 'T00:00:00Z');
  const todayDate = new Date(today + 'T00:00:00Z');
  const daysSinceEpoch = Math.floor(
    (todayDate.getTime() - epochDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const poolSize = players.length;
  const cycle = Math.floor(daysSinceEpoch / poolSize);
  const indexInCycle = daysSinceEpoch % poolSize;

  // Each cycle uses a different seed so consecutive cycles don't repeat order
  const seed = dateToSeed(EPOCH) + cycle * 999983;
  const shuffled = seededShuffle(players, seed);

  return shuffled[indexInCycle];
}
