/**
 * Brazil national team configuration — "MVP"
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO ADD A NEW COUNTRY
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Run the scraper:
 *      cd backend && python scrape_brazil.py
 *    (Duplicate and adapt scrape_brazil.py for the new country.)
 *    Output: frontend/src/data/<country>_players.json
 *
 * 2. Copy this file to src/config/<country>.ts
 *
 * 3. Update every value below:
 *    - id:          unique string key, e.g. 'argentina'
 *    - title:       game name for that country, e.g. 'El Crack!'
 *    - flag:        flag emoji, e.g. '🇦🇷'
 *    - locale:      default language override ('pt' | 'en'), or remove the
 *                   field to rely purely on browser language detection
 *    - datasetPath: point to the new JSON file
 *    - colors:      use the national team's official kit colors
 *
 * 4. In App.tsx, import and use the new config:
 *      import argentina from './src/config/argentina';
 *      <GameScreen config={argentina} />
 *
 * That's it — no other code changes needed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { TeamConfig } from './types';

const brazil: TeamConfig = {
  id: 'brazil',
  title: 'MVP',
  flag: '🇧🇷',
  locale: 'pt', // Portuguese for Brazilian users; falls back to browser language
  datasetPath: require('../data/brazil_players.json'),
  colors: {
    // Based on the Brazilian national team kit (CBF official colors)
    primary:    '#009C3B', // flag green
    secondary:  '#FFF700', // jersey yellow (bright CBF yellow)
    accent:     '#002776', // flag blue
    background: '#0a1528', // dark navy
    surface:    '#0d2255', // deep blue — cards, panels, inputs
    text:       '#FFFFFF',
    textMuted:  '#8ca0c8', // blue-tinted muted text

    // Guess cell result colors
    correct: '#009C3B', // green  — exact attribute match
    close:   '#C8C200', // dark yellow — within close range (±10 caps / ±5 goals / ±5 years)
    wrong:   '#1a3060', // dark blue — outside close range
  },
};

export default brazil;
