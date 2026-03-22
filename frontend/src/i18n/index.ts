/**
 * i18n/index.ts
 *
 * Language detection and string resolution.
 *
 * Current supported languages: English (default), Portuguese.
 *
 * HOW TO ADD A NEW LANGUAGE
 * ─────────────────────────
 * 1. Copy en.ts → <lang>.ts (e.g. es.ts for Spanish)
 * 2. Translate all values. The `Strings` type from en.ts enforces completeness.
 * 3. Import it here and add a detection branch in resolveStrings().
 *
 * NOTE: Team-specific strings (title, subtitle, inputPlaceholder) are currently
 * hardcoded in each language file. When adding a new country, update those
 * values in the relevant language files, or make them part of TeamConfig.
 */

import { Platform, NativeModules } from 'react-native';
import en, { Strings } from './en';
import pt from './pt';

/** Returns the raw locale string from the browser or device OS. */
function getDeviceLocale(): string {
  if (Platform.OS === 'web') {
    return navigator.language || 'en';
  }
  // iOS: AppleLocale / AppleLanguages
  // Android: localeIdentifier
  const locale =
    NativeModules.SettingsManager?.settings?.AppleLocale ||
    NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
    NativeModules.I18nManager?.localeIdentifier ||
    'en';
  return locale;
}

/**
 * Maps device locale to a Strings object.
 * Falls back to English for any unrecognised locale.
 */
function resolveStrings(): Strings {
  const locale = getDeviceLocale().toLowerCase();
  if (locale.startsWith('pt')) return pt;
  // Add more languages here: if (locale.startsWith('es')) return es;
  return en;
}

const strings: Strings = resolveStrings();
export default strings;
