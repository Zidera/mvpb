/**
 * storage.ts
 *
 * All persistence for MVP is local-first using AsyncStorage.
 * No backend or account is required.
 *
 * Storage keys are namespaced by teamId so multiple country variants can
 * coexist on the same device without collision (e.g. 'brazil:stats',
 * 'argentina:stats').
 *
 * Future: when user accounts are added, these local values can be
 * migrated / synced to a backend on first sign-in.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GuessResult } from './evaluateGuess';
import { getGameDateString } from './dailyPlayer';

// ── Types ─────────────────────────────────────────────────────────────────────

/** The state persisted for the current game day. Cleared on the next day. */
export interface DailyState {
  /** Game date (YYYY-MM-DD, GMT-3) when this state was saved. */
  date: string;
  /**
   * Name of the target player when this state was saved.
   * Guards against midnight edge cases where the date is still valid but
   * the daily player has already changed to the next one.
   */
  targetName: string;
  /** All guesses submitted so far today. */
  guesses: GuessResult[];
  status: 'playing' | 'won' | 'lost';
}

/** Lifetime statistics for a given team variant. */
export interface StatsData {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  /** Number of wins per guess count (1–6). */
  distribution: Record<1 | 2 | 3 | 4 | 5 | 6, number>;
}

const defaultStats: StatsData = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
};

// ── Keys ──────────────────────────────────────────────────────────────────────

/**
 * Namespaced AsyncStorage keys.
 * Using teamId as prefix allows multiple country variants to coexist.
 */
const KEYS = {
  dailyState: (teamId: string) => `${teamId}:daily_state`,
  stats:      (teamId: string) => `${teamId}:stats`,
};

// ── Daily state ───────────────────────────────────────────────────────────────

/**
 * Loads today's game state. Returns a fresh state if:
 *   - No state is saved yet
 *   - The saved date doesn't match today (new day)
 *   - The saved target player doesn't match today's player (midnight edge case)
 */
export async function loadDailyState(
  teamId: string,
  targetName: string
): Promise<DailyState> {
  const today = getGameDateString();
  try {
    const raw = await AsyncStorage.getItem(KEYS.dailyState(teamId));
    if (raw) {
      const parsed: DailyState = JSON.parse(raw);
      if (parsed.date === today && parsed.targetName === targetName) {
        return parsed;
      }
    }
  } catch (_) {}
  return { date: today, targetName, guesses: [], status: 'playing' };
}

/** Persists the current game state. Called after every guess. */
export async function saveDailyState(
  teamId: string,
  state: DailyState
): Promise<void> {
  await AsyncStorage.setItem(KEYS.dailyState(teamId), JSON.stringify(state));
}

// ── Stats ─────────────────────────────────────────────────────────────────────

/** Loads lifetime stats. Returns defaults if none saved yet. */
export async function loadStats(teamId: string): Promise<StatsData> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.stats(teamId));
    if (raw) return { ...defaultStats, ...JSON.parse(raw) };
  } catch (_) {}
  return { ...defaultStats };
}

/**
 * Records the result of a completed game (win or loss) and persists
 * updated stats. Returns the updated StatsData for immediate UI use.
 */
export async function recordResult(
  teamId: string,
  won: boolean,
  guessCount: number
): Promise<StatsData> {
  const stats = await loadStats(teamId);
  stats.played += 1;

  if (won) {
    stats.wins += 1;
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.maxStreak) {
      stats.maxStreak = stats.currentStreak;
    }
    const key = Math.min(guessCount, 6) as 1 | 2 | 3 | 4 | 5 | 6;
    stats.distribution[key] = (stats.distribution[key] ?? 0) + 1;
  } else {
    stats.currentStreak = 0;
  }

  await AsyncStorage.setItem(KEYS.stats(teamId), JSON.stringify(stats));
  return stats;
}
