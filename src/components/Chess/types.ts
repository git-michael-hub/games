export interface Piece {
  id: string;
  type: 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
  color: 'white' | 'black';
  symbol: string;
  row: number;
  col: number;
  hasMoved?: boolean;
  captured?: boolean;
}

export interface Move {
  piece: Piece;
  from: [number, number];
  to: [number, number];
  isCapture: boolean;
  capturedPiece?: Piece;
  isCheck?: boolean;
  isCheckmate?: boolean;
  notation: string;
}

export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate';

export interface GameState {
  currentPlayer: 'white' | 'black';
  status: GameStatus;
  capturedPieces: {
    white: Piece[];
    black: Piece[];
  };
  moveHistory: Move[];
} 