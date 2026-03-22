/**
 * evaluateGuess.ts
 *
 * Core game logic: compares a guessed player against the daily target and
 * returns a result for each attribute (correct / close / low / high).
 *
 * Close-range thresholds (agreed in planning):
 *   caps:       ±10  — e.g. guessing 50 caps when target is 55 → close
 *   goals:      ±5
 *   first_year: ±5
 *   last_year:  ±5
 *
 * For position (categorical): only exact match or wrong — no "close" concept.
 * Arrow direction:
 *   'low'  → guessed value is below target → show ↑ (player has MORE)
 *   'high' → guessed value is above target → show ↓ (player has LESS)
 */

import { Player } from '../config/types';

export type ResultStatus = 'correct' | 'close' | 'low' | 'high' | 'wrong';

export interface AttributeResult {
  status: ResultStatus;
  /** The guessed player's value for this attribute (displayed in the cell). */
  value: string | number;
}

export interface GuessResult {
  player: Player;
  position:   AttributeResult;
  caps:       AttributeResult;
  goals:      AttributeResult;
  first_year: AttributeResult;
  last_year:  AttributeResult;
  /** True only when the guessed player IS the daily target (name match). */
  isCorrect: boolean;
}

// ── Close-range thresholds ────────────────────────────────────────────────────

const CAPS_CLOSE  = 10;
const GOALS_CLOSE = 5;
const YEAR_CLOSE  = 5;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Evaluates a single numeric attribute.
 * Returns 'correct', 'close', 'low' (guess < target), or 'high' (guess > target).
 */
function evalNumber(
  guess: number,
  target: number,
  closeRange: number
): ResultStatus {
  if (guess === target) return 'correct';
  if (Math.abs(guess - target) <= closeRange) return 'close';
  return guess < target ? 'low' : 'high';
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Compares `guess` against `target` and returns a full GuessResult.
 * Called once per submitted guess in GameScreen.
 */
export function evaluateGuess(guess: Player, target: Player): GuessResult {
  return {
    player: guess,
    position: {
      status: guess.position === target.position ? 'correct' : 'wrong',
      value:  guess.position,
    },
    caps: {
      status: evalNumber(guess.caps, target.caps, CAPS_CLOSE),
      value:  guess.caps,
    },
    goals: {
      status: evalNumber(guess.goals, target.goals, GOALS_CLOSE),
      value:  guess.goals,
    },
    first_year: {
      status: evalNumber(guess.first_year, target.first_year, YEAR_CLOSE),
      value:  guess.first_year,
    },
    last_year: {
      status: evalNumber(guess.last_year, target.last_year, YEAR_CLOSE),
      value:  guess.last_year,
    },
    isCorrect: guess.name === target.name,
  };
}

/**
 * Converts a GuessResult into a one-line emoji string for the share feature.
 *
 * correct → 🟩   close → 🟨   wrong/low/high → ⬛
 *
 * Example: "🟩⬛🟨⬛🟩"
 */
export function guessResultToEmoji(result: GuessResult): string {
  const map: Record<ResultStatus, string> = {
    correct: '🟩',
    close:   '🟨',
    low:     '⬛',
    high:    '⬛',
    wrong:   '⬛',
  };
  return [
    map[result.position.status],
    map[result.caps.status],
    map[result.goals.status],
    map[result.first_year.status],
    map[result.last_year.status],
  ].join('');
}
