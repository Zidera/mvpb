/**
 * GuessRow.tsx
 *
 * Renders a single submitted guess as a player name + 5 attribute cells.
 * Each cell shows the guessed value and a color indicating correct / close / wrong.
 *
 * Animation: when `animate` is true (latest guess only), cells pop in one by
 * one with a spring scale + fade, each delayed by REVEAL_DELAY ms.
 * Restored guesses (on page reload) skip animation to appear instantly.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { GuessResult, ResultStatus } from '../utils/evaluateGuess';
import { TeamColors } from '../config/types';
import strings from '../i18n';

interface Props {
  result: GuessResult;
  colors: TeamColors;
  /** If true, cells animate in one by one. False = instant render (for restored state). */
  animate?: boolean;
}

const ATTRIBUTES: Array<{
  key: keyof Omit<GuessResult, 'player' | 'isCorrect'>;
  label: string;
}> = [
  { key: 'position', label: strings.position },
  { key: 'caps',     label: strings.caps },
  { key: 'goals',    label: strings.goals },
  { key: 'first_year', label: strings.firstYear },
  { key: 'last_year',  label: strings.lastYear },
];

const REVEAL_DELAY = 350; // ms between each cell reveal

function statusToArrow(status: ResultStatus): string {
  if (status === 'low') return ' ↑';
  if (status === 'high') return ' ↓';
  return '';
}

interface CellProps {
  label: string;
  value: string | number;
  status: ResultStatus;
  colors: TeamColors;
  delay: number;
  animate: boolean;
}

function Cell({ label, value, status, colors, delay, animate }: CellProps) {
  const scaleAnim = useRef(new Animated.Value(animate ? 0 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(animate ? 0 : 1)).current;

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const bgColor =
    status === 'correct' ? colors.correct :
    status === 'close'   ? colors.close :
    colors.wrong;

  const arrow = statusToArrow(status);

  return (
    <Animated.View
      style={[
        styles.cell,
        { backgroundColor: bgColor, transform: [{ scale: scaleAnim }], opacity: opacityAnim },
      ]}
    >
      <Text style={[styles.cellLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.cellValue, { color: colors.text }]}>
        {String(value)}{arrow}
      </Text>
    </Animated.View>
  );
}

export default function GuessRow({ result, colors, animate = true }: Props) {
  return (
    <View style={styles.row}>
      <Text style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
        {result.player.name}
      </Text>
      <View style={styles.cells}>
        {ATTRIBUTES.map((attr, i) => {
          const attrResult = result[attr.key];
          return (
            <Cell
              key={attr.key}
              label={attr.label}
              value={attrResult.value}
              status={attrResult.status}
              colors={colors}
              delay={i * REVEAL_DELAY}
              animate={animate}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 8,
  },
  playerName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  cells: {
    flexDirection: 'row',
    gap: 4,
  },
  cell: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  cellLabel: {
    fontSize: 9,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cellValue: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});
