/**
 * EndScreen.tsx
 *
 * Shown when the game ends (win or lose).
 * Displays: result message, the daily player's name and stats summary,
 * an optional fun fact, and buttons for sharing and viewing statistics.
 *
 * The share button builds an emoji grid from all guesses and copies/shares it.
 * Fun facts are currently empty strings — populate fun_fact in the dataset
 * when a reliable source is available.
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Share,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Player } from '../config/types';
import { TeamColors } from '../config/types';
import { GuessResult, guessResultToEmoji } from '../utils/evaluateGuess';
import strings from '../i18n';

interface Props {
  target: Player;
  guesses: GuessResult[];
  won: boolean;
  colors: TeamColors;
  title: string;
  onShowStats: () => void;
}

export default function EndScreen({ target, guesses, won, colors, title, onShowStats }: Props) {
  const slideAnim = useRef(new Animated.Value(80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  function buildShareText(): string {
    const emojiGrid = guesses.map(guessResultToEmoji).join('\n');
    const result = won ? `✅ ${guesses.length}/6` : '❌ X/6';
    return `${title} ${result}\n\n${emojiGrid}`;
  }

  async function handleShare() {
    const text = buildShareText();
    if (Platform.OS === 'web') {
      try {
        await navigator.share?.({ text });
      } catch {
        await Clipboard.setStringAsync(text);
      }
    } else {
      await Share.share({ message: text });
    }
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.primary,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {/* Result header */}
      <Text style={[styles.resultTitle, { color: won ? colors.correct : colors.secondary }]}>
        {won ? strings.win : strings.lose}
      </Text>

      {/* Player reveal */}
      <Text style={[styles.label, { color: colors.textMuted }]}>
        {strings.thePlayerWas}
      </Text>
      <Text style={[styles.playerName, { color: colors.text }]}>{target.name}</Text>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <Stat label={strings.position} value={target.position} colors={colors} />
        <Stat label={strings.caps} value={String(target.caps)} colors={colors} />
        <Stat label={strings.goals} value={String(target.goals)} colors={colors} />
        <Stat label={strings.firstYear} value={String(target.first_year)} colors={colors} />
        <Stat label={strings.lastYear} value={String(target.last_year)} colors={colors} />
      </View>

      {/* Fun fact */}
      {target.fun_fact ? (
        <View style={[styles.funFactBox, { backgroundColor: colors.background }]}>
          <Text style={[styles.funFactLabel, { color: colors.textMuted }]}>
            {strings.funFact}
          </Text>
          <Text style={[styles.funFactText, { color: colors.text }]}>
            {target.fun_fact}
          </Text>
        </View>
      ) : null}

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.btn, styles.btnOutline, { borderColor: colors.primary }]}
          onPress={onShowStats}
        >
          <Text style={[styles.btnText, { color: colors.primary }]}>{strings.stats}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={handleShare}
        >
          <Text style={[styles.btnText, { color: '#fff' }]}>{strings.share}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

function Stat({ label, value, colors }: { label: string; value: string; colors: TeamColors }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginTop: 16,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  playerName: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    marginTop: 2,
    textAlign: 'center',
  },
  funFactBox: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  funFactLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  funFactText: {
    fontSize: 13,
    lineHeight: 18,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutline: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
