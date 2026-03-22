const en = {
  // Game
  title: 'MVP',
  subtitle: 'Guess the Brazilian football legend',
  inputPlaceholder: 'Type a player name…',
  guessesLeft: (n: number) => `${n} guess${n === 1 ? '' : 'es'} remaining`,

  // Attributes
  position: 'Position',
  caps: 'Caps',
  goals: 'Goals',
  firstYear: 'First cap',
  lastYear: 'Last cap',

  // Result labels
  correct: 'Correct!',
  close: 'Close',
  tooHigh: 'Too high ↓',
  tooLow: 'Too low ↑',

  // End screen
  win: 'You got it!',
  lose: 'Better luck tomorrow!',
  thePlayerWas: 'The player was',
  funFact: 'Fun fact',
  share: 'Share result',
  shareText: (title: string, guesses: number, won: boolean) =>
    `${title} ${won ? `✅ ${guesses}/6` : '❌ X/6'}\n`,

  // Stats modal
  stats: 'Statistics',
  played: 'Played',
  winPct: 'Win %',
  currentStreak: 'Current streak',
  maxStreak: 'Max streak',
  guessDistribution: 'Guess distribution',

  // Countdown
  nextPlayer: 'Next player in',

  // Misc
  close_btn: 'Close',
};

export type Strings = typeof en;
export default en;
