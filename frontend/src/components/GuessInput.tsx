/**
 * GuessInput.tsx
 *
 * Autocomplete text input for submitting player guesses.
 * Suggestions appear after 2 characters and filter by substring match.
 * Already-guessed players are excluded from suggestions.
 * Selecting a suggestion submits the guess immediately and clears the input.
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Player } from '../config/types';
import { TeamColors } from '../config/types';
import strings from '../i18n';

interface Props {
  players: Player[];
  usedNames: Set<string>;
  colors: TeamColors;
  disabled: boolean;
  onGuess: (player: Player) => void;
}

const MAX_SUGGESTIONS = 6;

export default function GuessInput({ players, usedNames, colors, disabled, onGuess }: Props) {
  const [query, setQuery] = useState('');

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return players
      .filter(
        (p) =>
          !usedNames.has(p.name) &&
          p.name.toLowerCase().includes(q)
      )
      .slice(0, MAX_SUGGESTIONS);
  }, [query, players, usedNames]);

  function handleSelect(player: Player) {
    setQuery('');
    onGuess(player);
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: disabled ? colors.wrong : colors.primary,
          },
        ]}
        placeholder={strings.inputPlaceholder}
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
        editable={!disabled}
        autoCorrect={false}
        autoCapitalize="words"
      />
      {suggestions.length > 0 && (
        <View
          style={[
            styles.dropdown,
            { backgroundColor: colors.surface, borderColor: colors.primary },
          ]}
        >
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.name}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.suggestion, { borderBottomColor: colors.wrong }]}
                onPress={() => handleSelect(item)}
              >
                <Text style={[styles.suggestionText, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.suggestionMeta, { color: colors.textMuted }]}>
                  {item.position}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 2,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  dropdown: {
    position: Platform.OS === 'web' ? ('absolute' as any) : 'absolute',
    top: 52,
    left: 0,
    right: 0,
    borderRadius: 10,
    borderWidth: 1,
    maxHeight: 260,
    overflow: 'hidden',
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  suggestion: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  suggestionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  suggestionMeta: {
    fontSize: 12,
    marginTop: 1,
  },
});
