import { Strings } from './en';

const pt: Strings = {
  // Game
  title: 'MVP',
  subtitle: 'Adivinhe a lenda do futebol brasileiro',
  inputPlaceholder: 'Digite o nome do jogador…',
  guessesLeft: (n: number) => `${n} tentativa${n === 1 ? '' : 's'} restante${n === 1 ? '' : 's'}`,

  // Attributes
  position: 'Posição',
  caps: 'Jogos',
  goals: 'Gols',
  firstYear: 'Primeira convocação',
  lastYear: 'Última convocação',

  // Result labels
  correct: 'Correto!',
  close: 'Quase',
  tooHigh: 'Muito alto ↓',
  tooLow: 'Muito baixo ↑',

  // End screen
  win: 'Acertou!',
  lose: 'Boa sorte amanhã!',
  thePlayerWas: 'O jogador era',
  funFact: 'Curiosidade',
  share: 'Compartilhar resultado',
  shareText: (title: string, guesses: number, won: boolean) =>
    `${title} ${won ? `✅ ${guesses}/6` : '❌ X/6'}\n`,

  // Stats modal
  stats: 'Estatísticas',
  played: 'Jogadas',
  winPct: '% vitórias',
  currentStreak: 'Sequência atual',
  maxStreak: 'Maior sequência',
  guessDistribution: 'Distribuição de palpites',

  // Countdown
  nextPlayer: 'Próximo jogador em',

  // Misc
  close_btn: 'Fechar',
};

export default pt;
