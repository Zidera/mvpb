/**
 * StatsModal.tsx
 *
 * Full-screen modal showing lifetime game statistics:
 *   - Games played, win percentage, current streak, max streak
 *   - Guess distribution bar chart (1–6 guesses)
 *
 * Stats are stored locally per team via storage.ts and persist across sessions.
 * Each country variant (brazil, argentina, etc.) has its own separate stats.
 */
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { StatsData } from '../utils/storage';
import { TeamColors } from '../config/types';
import strings from '../i18n';

interface Props {
  visible: boolean;
  stats: StatsData;
  colors: TeamColors;
  onClose: () => void;
}

export default function StatsModal({ visible, stats, colors, onClose }: Props) {
  const winPct = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  const maxDist = Math.max(...Object.values(stats.distribution), 1);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{strings.stats}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={[styles.closeBtn, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Summary row */}
          <View style={styles.summaryRow}>
            <StatBox value={String(stats.played)} label={strings.played} colors={colors} />
            <StatBox value={`${winPct}%`} label={strings.winPct} colors={colors} />
            <StatBox value={String(stats.currentStreak)} label={strings.currentStreak} colors={colors} />
            <StatBox value={String(stats.maxStreak)} label={strings.maxStreak} colors={colors} />
          </View>

          {/* Distribution */}
          <Text style={[styles.distTitle, { color: colors.text }]}>
            {strings.guessDistribution}
          </Text>
          <ScrollView>
            {([1, 2, 3, 4, 5, 6] as const).map((n) => {
              const count = stats.distribution[n] ?? 0;
              const pct = (count / maxDist) * 100;
              return (
                <View key={n} style={styles.barRow}>
                  <Text style={[styles.barLabel, { color: colors.text }]}>{n}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${Math.max(pct, count > 0 ? 8 : 0)}%`,
                          backgroundColor: colors.correct,
                        },
                      ]}
                    >
                      <Text style={styles.barCount}>{count}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function StatBox({ value, label, colors }: { value: string; label: string; colors: TeamColors }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  closeBtn: {
    fontSize: 18,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 2,
    maxWidth: 60,
  },
  distTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  barLabel: {
    width: 16,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  barTrack: {
    flex: 1,
    height: 28,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 6,
    minWidth: 28,
  },
  barCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
