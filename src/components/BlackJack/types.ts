// Card type
export interface CardType {
  id: string;
  suit: string;
  value: string;
  faceUp: boolean;
}

// Player type
export interface Player {
  cards: CardType[];
  score: number;
}

// Game state
export type GameState = 'betting' | 'dealing' | 'playerTurn' | 'dealerTurn' | 'evaluating' | 'gameOver'; 