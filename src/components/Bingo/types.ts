// Cell in a Bingo card
export interface BingoCell {
  number: number | null;
  marked: boolean;
  isWinning: boolean;
  isFreeSpace?: boolean;
}

// Bingo card with 5x5 grid
export interface BingoCard {
  cells: BingoCell[][];
  hasWon: boolean;
  winningPattern?: number[][];
}

// Called number with animation state
export interface CalledNumber {
  value: number;
  column: 'B' | 'I' | 'N' | 'G' | 'O';
  timestamp: number;
  isNew: boolean;
}

// Game state definition
export enum GameStatus {
  IDLE = 'idle',
  PLAYING = 'playing',
  WON = 'won',
  LOST = 'lost',
}

// Winning pattern
export type WinningPatternType = 
  | 'row'
  | 'column' 
  | 'diagonal'
  | 'corners'
  | 'blackout';

export interface WinningPattern {
  type: WinningPatternType;
  index?: number; // For row/column patterns
  direction?: 'topleft' | 'topright'; // For diagonal patterns
  positions: [number, number][]; // Row, column coordinates
  multiplier: number;
}

export interface GameResult {
  hasWon: boolean;
  winAmount: number;
  patterns: WinningPattern[];
}

export type WinningLine = {
  indexes: number[];
  name: string;
  payout: number;
};

export type GameState = 'idle' | 'playing' | 'paused' | 'won';

export interface BingoGameState {
  card: BingoCard;
  calledNumbers: number[];
  currentNumber: number | null;
  gameState: GameState;
  credits: number;
  betAmount: number;
  autoMarkingEnabled: boolean;
  winningPatterns: WinningPattern[];
  activePatterns: WinningPattern[];
}

// Define the winning patterns (rows, columns, diagonals)
export const WINNING_PATTERNS = [
  // Rows
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  
  // Columns
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  
  // Diagonals
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
  
  // Special patterns
  // Four corners
  [0, 4, 20, 24],
  // X pattern
  [0, 4, 6, 8, 12, 16, 18, 20, 24],
  // Postage stamp (top-left 2x2)
  [0, 1, 5, 6],
  // Postage stamp (top-right 2x2)
  [3, 4, 8, 9],
  // Postage stamp (bottom-left 2x2)
  [15, 16, 20, 21],
  // Postage stamp (bottom-right 2x2)
  [18, 19, 23, 24]
];

// Range of possible numbers for each column in a standard Bingo card
export const COLUMN_RANGES = [
  { min: 1, max: 15 },   // B: 1-15
  { min: 16, max: 30 },  // I: 16-30
  { min: 31, max: 45 },  // N: 31-45
  { min: 46, max: 60 },  // G: 46-60
  { min: 61, max: 75 }   // O: 61-75
]; 