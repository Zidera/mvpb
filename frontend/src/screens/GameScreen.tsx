/**
 * GameScreen.tsx
 *
 * Main (and only) screen of the game. Owns all game state:
 *   - Daily player selection (determined by date, no backend)
 *   - Guess history and game status (playing / won / lost)
 *   - Persistence via AsyncStorage (restored on reload)
 *   - Countdown timer to next player
 *   - Stats recording and modal toggle
 *
 * Layout (top → bottom):
 *   Header (title + stats icon)
 *   └─ ScrollView
 *        Input + guesses-remaining label   ← always at top while playing
 *        Column labels
 *        Submitted guess rows (animated)
 *        Empty placeholder rows
 *        End screen + countdown            ← shown when game is over
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TeamConfig, Player } from '../config/types';
import { getDailyPlayer, msUntilNextDay, getGameDateString } from '../utils/dailyPlayer';
import { evaluateGuess, GuessResult } from '../utils/evaluateGuess';
import {
  loadDailyState,
  saveDailyState,
  loadStats,
  recordResult,
  StatsData,
  DailyState,
} from '../utils/storage';
import GuessRow from '../components/GuessRow';
import GuessInput from '../components/GuessInput';
import EndScreen from '../components/EndScreen';
import StatsModal from '../components/StatsModal';
import strings from '../i18n';

const MAX_GUESSES = 6;

interface Props {
  config: TeamConfig;
}

function formatCountdown(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

export default function GameScreen({ config }: Props) {
  const { colors, title, id } = config;
  const players: Player[] = config.datasetPath;

  const [dailyPlayer] = useState<Player>(() => getDailyPlayer(players));
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [isRestoredGuess, setIsRestoredGuess] = useState(false);

  // Load saved state on mount
  useEffect(() => {
    async function init() {
      const [state, savedStats] = await Promise.all([
        loadDailyState(id, dailyPlayer.name),
        loadStats(id),
      ]);
      setStats(savedStats);
      if (state.guesses.length > 0) {
        setIsRestoredGuess(true);
        setGuesses(state.guesses);
        setGameStatus(state.status);
      }
    }
    init();
  }, []);

  // Countdown timer
  useEffect(() => {
    function tick() {
      setCountdown(formatCountdown(msUntilNextDay()));
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const usedNames = new Set(guesses.map((g) => g.player.name));

  const handleGuess = useCallback(
    async (player: Player) => {
      if (gameStatus !== 'playing') return;

      const result = evaluateGuess(player, dailyPlayer);
      const newGuesses = [...guesses, result];
      const won = result.isCorrect;
      const lost = !won && newGuesses.length >= MAX_GUESSES;
      const newStatus = won ? 'won' : lost ? 'lost' : 'playing';

      setIsRestoredGuess(false);
      setGuesses(newGuesses);
      setGameStatus(newStatus);

      const newState: DailyState = {
        date: getGameDateString(),  // GMT-3, consistent with daily player selection
        targetName: dailyPlayer.name,
        guesses: newGuesses,
        status: newStatus,
      };
      await saveDailyState(id, newState);

      if (newStatus !== 'playing') {
        const updatedStats = await recordResult(id, won, newGuesses.length);
        setStats(updatedStats);
      }
    },
    [guesses, gameStatus, dailyPlayer, id]
  );

  const guessesLeft = MAX_GUESSES - guesses.length;
  const gameOver = gameStatus !== 'playing';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.surface }]}>
        <View style={styles.headerSide} />
        <Text style={[styles.headerTitle, { color: colors.secondary }]}>{title}</Text>
        <View style={styles.headerSide}>
          <TouchableOpacity onPress={() => setShowStats(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.statsIcon, { color: colors.text }]}>📊</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Input — at the top */}
        {!gameOver && (
          <View style={styles.inputSection}>
            <Text style={[styles.guessesLeft, { color: colors.textMuted }]}>
              {strings.guessesLeft(guessesLeft)}
            </Text>
            <GuessInput
              players={players}
              usedNames={usedNames}
              colors={colors}
              disabled={gameOver}
              onGuess={handleGuess}
            />
          </View>
        )}

        {/* Column labels — always visible */}
        <View style={styles.columnLabels}>
          {[strings.position, strings.caps, strings.goals, strings.firstYear, strings.lastYear].map((label) => (
            <Text key={label} style={[styles.columnLabel, { color: colors.textMuted }]} numberOfLines={1}>
              {label}
            </Text>
          ))}
        </View>

        {/* Guess rows */}
        {guesses.map((result, i) => (
          <GuessRow
            key={result.player.name}
            result={result}
            colors={colors}
            animate={!isRestoredGuess && i === guesses.length - 1}
          />
        ))}

        {/* Empty placeholder rows */}
        {!gameOver && Array.from({ length: guessesLeft }).map((_, i) => (
          <View key={`empty-${i}`} style={styles.emptyRow}>
            {[0,1,2,3,4].map((j) => (
              <View key={j} style={[styles.emptyCell, { backgroundColor: colors.surface }]} />
            ))}
          </View>
        ))}

        {/* End screen */}
        {gameOver && (
          <EndScreen
            target={dailyPlayer}
            guesses={guesses}
            won={gameStatus === 'won'}
            colors={colors}
            title={title}
            onShowStats={() => setShowStats(true)}
          />
        )}

        {/* Countdown */}
        {gameOver && (
          <View style={styles.countdownRow}>
            <Text style={[styles.nextLabel, { color: colors.textMuted }]}>
              {strings.nextPlayer}
            </Text>
            <Text style={[styles.countdown, { color: colors.secondary }]}>{countdown}</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Stats modal */}
      {stats && (
        <StatsModal
          visible={showStats}
          stats={stats}
          colors={colors}
          onClose={() => setShowStats(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerSide: {
    width: 44,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  statsIcon: {
    fontSize: 22,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  columnLabels: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 2,
    gap: 4,
  },
  columnLabel: {
    flex: 1,
    fontSize: 9,
    textTransform: 'uppercase',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  emptyRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  emptyCell: {
    flex: 1,
    borderRadius: 6,
    minHeight: 52,
    opacity: 0.4,
  },
  inputSection: {
    marginTop: 16,
    marginBottom: 67,
  },
  guessesLeft: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  countdownRow: {
    alignItems: 'center',
    gap: 4,
  },
  nextLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  countdown: {
    fontSize: 32,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});
