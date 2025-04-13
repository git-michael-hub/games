import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Piece, GameStatus } from './types';

// ChessBoard props interface
interface ChessBoardProps {
  onCapture: (piece: Piece) => void;
  onTurnChange: (player: 'white' | 'black') => void;
  onStatusChange: (status: GameStatus) => void;
  onMoveRecord: (piece: Piece, startCol: number, startRow: number, endCol: number, endRow: number, isCapture: boolean) => void;
}

// Chess square position
interface Position {
  row: number;
  col: number;
}

// Move record for highlighting last move
interface MoveRecord {
  from: Position;
  to: Position;
}

// Valid moves for a selected piece
interface ValidMoves {
  [key: string]: boolean;
}

const BoardContainer = styled.div.attrs({ className: 'board-container' })`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  width: 100%;
  aspect-ratio: 1 / 1;
  border: 4px solid #3a3a3a;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
  position: relative;
  border-radius: 4px;
  overflow: hidden;
`;

const Square = styled(motion.div).attrs<{ 
  $isBlack: boolean; 
  $isSelected: boolean; 
  $isValidMove: boolean; 
  $isCheck: boolean;
  $isLastMoveFrom: boolean;
  $isLastMoveTo: boolean;
  'data-position': string;
}>(props => ({
  className: `chess-square ${props.$isValidMove ? 'valid-move' : ''}`,
  'data-position': props['data-position']
}))<{ 
  $isBlack: boolean; 
  $isSelected: boolean; 
  $isValidMove: boolean; 
  $isCheck: boolean;
  $isLastMoveFrom: boolean;
  $isLastMoveTo: boolean;
  'data-position': string;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => {
    if (props.$isCheck) return 'rgba(255, 0, 0, 0.6)';
    if (props.$isSelected) return 'rgba(255, 215, 0, 0.6)';
    if (props.$isValidMove) return 'rgba(0, 255, 0, 0.4)';
    return props.$isBlack ? '#8B4513' : '#F5DEB3';
  }};
  border: ${props => {
    if (props.$isLastMoveFrom) return '3px solid rgba(70, 130, 180, 0.7)';
    if (props.$isLastMoveTo) return '3px solid rgba(70, 130, 180, 1)';
    return 'none';
  }};
  position: relative;
  transition: background-color 0.3s ease, border 0.3s ease;
  cursor: pointer;
  z-index: 5;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  box-shadow: ${props => props.$isSelected ? 'inset 0 0 20px rgba(255, 255, 0, 0.5)' : 'none'};
  box-sizing: border-box; /* Ensure border doesn't change square size */
  
  &:hover {
    filter: brightness(1.2);
  }

  /* Corner indicator for last move instead of just border */
  ${props => props.$isLastMoveFrom && `
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 20%;
      height: 20%;
      background-color: rgba(70, 130, 180, 0.7);
      border-radius: 0 0 100% 0;
    }
  `}

  ${props => props.$isLastMoveTo && `
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      right: 0;
      width: 20%;
      height: 20%;
      background-color: rgba(70, 130, 180, 1);
      border-radius: 100% 0 0 0;
    }
  `}
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: ${props => props.$isValidMove ? '40%' : '0'};
    height: ${props => props.$isValidMove ? '40%' : '0'};
    border-radius: 50%;
    background-color: rgba(0, 255, 0, 0.5);
    z-index: 1;
    transition: all 0.2s ease;
  }
  
  ${props => props.$isValidMove && `
    &:hover::before {
      width: 50%;
      height: 50%;
      background-color: rgba(0, 255, 0, 0.7);
    }
  `}
`;

const Coordinates = styled.div<{ $isBlack: boolean }>`
  position: absolute;
  font-size: 0.6rem;
  opacity: 0.6;
  color: ${props => props.$isBlack ? '#F5DEB3' : '#8B4513'};
  z-index: 1;
`;

const FileCoord = styled(Coordinates)`
  bottom: 2px;
  right: 3px;
`;

const RankCoord = styled(Coordinates)`
  top: 2px;
  left: 3px;
`;

const PieceContainer = styled(motion.div).attrs<{ $row: number; $col: number; 'data-piece-id': string }>(props => ({
  className: 'piece-container',
  'data-piece-id': props['data-piece-id']
}))<{ $row: number; $col: number; 'data-piece-id': string }>`
  position: absolute;
  top: ${props => (props.$row * 12.5)}%;
  left: ${props => (props.$col * 12.5)}%;
  width: 12.5%;
  height: 12.5%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.6rem;
  line-height: 1;
  z-index: 20; /* Ensure pieces are above square styling */
  user-select: none;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation; /* Improve touch behavior */
  
  &:hover {
    transform: scale(1.1);
    filter: brightness(1.2);
  }
  
  &:active {
    cursor: grabbing;
    transform: scale(0.95);
  }
`;

const PieceSymbol = styled.div<{ $color: string }>`
  color: ${props => props.$color === 'white' ? 'white' : '#333'};
  text-shadow: ${props => props.$color === 'white' 
    ? '0px 0px 3px rgba(0, 0, 0, 0.5)' 
    : '0px 0px 3px rgba(255, 255, 255, 0.5)'};
  transform-origin: center;
  pointer-events: none; /* Make sure clicks go through to the container */
`;

// Add captured pieces display components
const CapturedPiecesContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 8px;
  gap: 4px;
`;

const PlayerCapturesRow = styled.div<{ $player: 'white' | 'black' }>`
  display: flex;
  align-items: center;
  padding: 6px 10px;
  background-color: ${props => props.$player === 'white' ? 'rgba(50, 50, 50, 0.7)' : 'rgba(20, 20, 20, 0.8)'};
  border-radius: 4px;
  min-height: 42px;
  
  &::before {
    content: '${props => props.$player === 'white' ? 'White' : 'Black'} captures:';
    margin-right: 12px;
    color: ${props => props.$player === 'white' ? 'white' : '#aaa'};
    font-size: 0.9rem;
  }
`;

const CapturedPiece = styled.span<{ $color: string }>`
  font-size: 1.5rem;
  color: ${props => props.$color === 'white' ? 'white' : '#222'};
  text-shadow: ${props => props.$color === 'white' 
    ? '0px 0px 2px rgba(0, 0, 0, 0.7)' 
    : '0px 0px 2px rgba(255, 255, 255, 0.7)'};
  margin: 0 4px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 26px;
  height: 26px;
  background-color: ${props => props.$color === 'white' ? 'rgba(60, 60, 60, 0.6)' : 'rgba(220, 220, 220, 0.6)'};
  border-radius: 50%;
  opacity: 0;
  animation: fadeIn 0.5s forwards;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.5); }
    to { opacity: 1; transform: scale(1); }
  }
`;

// Create initial pieces with unique IDs
const createInitialPieces = (): Piece[] => {
  const pieces: Piece[] = [];
  
  // Add black pieces
  pieces.push({ id: 'br1', type: 'rook', color: 'black', symbol: '♜', row: 0, col: 0 });
  pieces.push({ id: 'bn1', type: 'knight', color: 'black', symbol: '♞', row: 0, col: 1 });
  pieces.push({ id: 'bb1', type: 'bishop', color: 'black', symbol: '♝', row: 0, col: 2 });
  pieces.push({ id: 'bq', type: 'queen', color: 'black', symbol: '♛', row: 0, col: 3 });
  pieces.push({ id: 'bk', type: 'king', color: 'black', symbol: '♚', row: 0, col: 4 });
  pieces.push({ id: 'bb2', type: 'bishop', color: 'black', symbol: '♝', row: 0, col: 5 });
  pieces.push({ id: 'bn2', type: 'knight', color: 'black', symbol: '♞', row: 0, col: 6 });
  pieces.push({ id: 'br2', type: 'rook', color: 'black', symbol: '♜', row: 0, col: 7 });
  
  // Add black pawns
  for (let i = 0; i < 8; i++) {
    pieces.push({ id: `bp${i+1}`, type: 'pawn', color: 'black', symbol: '♟', row: 1, col: i });
  }
  
  // Add white pawns
  for (let i = 0; i < 8; i++) {
    pieces.push({ id: `wp${i+1}`, type: 'pawn', color: 'white', symbol: '♙', row: 6, col: i });
  }
  
  // Add white pieces
  pieces.push({ id: 'wr1', type: 'rook', color: 'white', symbol: '♖', row: 7, col: 0 });
  pieces.push({ id: 'wn1', type: 'knight', color: 'white', symbol: '♘', row: 7, col: 1 });
  pieces.push({ id: 'wb1', type: 'bishop', color: 'white', symbol: '♗', row: 7, col: 2 });
  pieces.push({ id: 'wq', type: 'queen', color: 'white', symbol: '♕', row: 7, col: 3 });
  pieces.push({ id: 'wk', type: 'king', color: 'white', symbol: '♔', row: 7, col: 4 });
  pieces.push({ id: 'wb2', type: 'bishop', color: 'white', symbol: '♗', row: 7, col: 5 });
  pieces.push({ id: 'wn2', type: 'knight', color: 'white', symbol: '♘', row: 7, col: 6 });
  pieces.push({ id: 'wr2', type: 'rook', color: 'white', symbol: '♖', row: 7, col: 7 });
  
  return pieces;
};

// Animation variants
const pieceVariants = {
  initial: { 
    scale: 0.8, 
    opacity: 0,
    rotateY: 90
  },
  animate: { 
    scale: 1, 
    opacity: 1,
    rotateY: 0,
    transition: { 
      duration: 0.4,
      ease: "easeOut"
    } 
  },
  hover: { 
    scale: 1.15, 
    y: -5,
    transition: { 
      duration: 0.2 
    } 
  },
  move: {
    scale: [1, 1.1, 1],
    y: [0, -8, 0],
    transition: { 
      duration: 0.5,
      ease: "easeInOut"
    }
  },
  captured: {
    scale: [1, 1.2, 0],
    opacity: [1, 1, 0],
    rotate: [0, 20, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
};

// Add this helper function to convert numeric coordinates to chess notation
const toChessNotation = (col: number, row: number): string => {
  const files = 'abcdefgh';
  const ranks = '87654321';
  return files[col] + ranks[row];
};

const ChessBoard: React.FC<ChessBoardProps> = ({
  onCapture,
  onTurnChange,
  onStatusChange,
  onMoveRecord
}) => {
  // State to track all pieces
  const [pieces, setPieces] = useState<Piece[]>(() => createInitialPieces());
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<ValidMoves>({});
  const [lastMovedPieceId, setLastMovedPieceId] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<MoveRecord | null>(null);
  const [kingPositions, setKingPositions] = useState({
    white: { row: 7, col: 4 },
    black: { row: 0, col: 4 }
  });
  const [checkPosition, setCheckPosition] = useState<Position | null>(null);
  const [isInCheck, setIsInCheck] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  
  // Use a ref to track if we're currently processing a selection
  const isProcessingRef = useRef(false);

  // Get a piece at a specific position - memoized to avoid dependency issues
  const getPieceAt = useCallback((row: number, col: number) => {
    return pieces.find(p => !p.captured && p.row === row && p.col === col);
  }, [pieces]);

  // Add a function to calculate valid moves without duplicating code
  const calculateValidMoves = useCallback((piece: Piece): ValidMoves => {
    const moves: ValidMoves = {};
    
    // Handle different piece types
    switch (piece.type) {
      case 'pawn': {
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        
        // Move forward one space if not blocked
        const oneForward = piece.row + direction;
        if (oneForward >= 0 && oneForward < 8 && !getPieceAt(oneForward, piece.col)) {
          moves[`${oneForward},${piece.col}`] = true;
          
          // Move forward two spaces from starting position if not blocked
          const twoForward = piece.row + (2 * direction);
          if (piece.row === startRow && twoForward >= 0 && twoForward < 8 && 
              !getPieceAt(twoForward, piece.col)) {
            moves[`${twoForward},${piece.col}`] = true;
          }
        }
        
        // Capture diagonally
        const captureOffsets = [-1, 1];
        for (const offset of captureOffsets) {
          const captureCol = piece.col + offset;
          const captureRow = piece.row + direction;
          
          if (captureCol >= 0 && captureCol < 8 && captureRow >= 0 && captureRow < 8) {
            const targetPiece = getPieceAt(captureRow, captureCol);
            if (targetPiece && targetPiece.color !== piece.color) {
              moves[`${captureRow},${captureCol}`] = true;
            }
          }
        }
        break;
      }
      
      case 'rook': {
        // Horizontal and vertical moves
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        for (const [dx, dy] of directions) {
          let newRow = piece.row + dx;
          let newCol = piece.col + dy;
          
          while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = getPieceAt(newRow, newCol);
            
            if (!targetPiece) {
              moves[`${newRow},${newCol}`] = true;
            } else {
              if (targetPiece.color !== piece.color) {
                moves[`${newRow},${newCol}`] = true;
              }
              break;
            }
            
            newRow += dx;
            newCol += dy;
          }
        }
        break;
      }
      
      case 'bishop': {
        // Diagonal moves
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        
        for (const [dx, dy] of directions) {
          let newRow = piece.row + dx;
          let newCol = piece.col + dy;
          
          while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = getPieceAt(newRow, newCol);
            
            if (!targetPiece) {
              moves[`${newRow},${newCol}`] = true;
            } else {
              if (targetPiece.color !== piece.color) {
                moves[`${newRow},${newCol}`] = true;
              }
              break;
            }
            
            newRow += dx;
            newCol += dy;
          }
        }
        break;
      }
      
      case 'queen': {
        // Combine rook and bishop movements (horizontal, vertical, and diagonal)
        const directions = [
          // Horizontal and vertical (rook-like)
          [-1, 0], [1, 0], [0, -1], [0, 1],
          // Diagonal (bishop-like)
          [-1, -1], [-1, 1], [1, -1], [1, 1]
        ];
        
        for (const [dx, dy] of directions) {
          let newRow = piece.row + dx;
          let newCol = piece.col + dy;
          
          while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = getPieceAt(newRow, newCol);
            
            if (!targetPiece) {
              moves[`${newRow},${newCol}`] = true;
            } else {
              if (targetPiece.color !== piece.color) {
                moves[`${newRow},${newCol}`] = true;
              }
              break;
            }
            
            newRow += dx;
            newCol += dy;
          }
        }
        break;
      }
      
      case 'knight': {
        const knightMoves = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        for (const [dx, dy] of knightMoves) {
          const newRow = piece.row + dx;
          const newCol = piece.col + dy;
          
          if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = getPieceAt(newRow, newCol);
            
            if (!targetPiece || targetPiece.color !== piece.color) {
              moves[`${newRow},${newCol}`] = true;
            }
          }
        }
        break;
      }
      
      case 'king': {
        const kingMoves = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1], [0, 1],
          [1, -1], [1, 0], [1, 1]
        ];
        
        for (const [dx, dy] of kingMoves) {
          const newRow = piece.row + dx;
          const newCol = piece.col + dy;
          
          if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = getPieceAt(newRow, newCol);
            
            if (!targetPiece || targetPiece.color !== piece.color) {
              moves[`${newRow},${newCol}`] = true;
            }
          }
        }
        
        // Castling
        if (!piece.hasMoved && !isInCheck) {
          // Kingside
          const kingsideRook = getPieceAt(piece.row, 7);
          if (kingsideRook && kingsideRook.type === 'rook' && !kingsideRook.hasMoved) {
            // Check if squares between king and rook are empty
            if (!getPieceAt(piece.row, 5) && !getPieceAt(piece.row, 6)) {
              moves[`${piece.row},6`] = true;
            }
          }
          
          // Queenside
          const queensideRook = getPieceAt(piece.row, 0);
          if (queensideRook && queensideRook.type === 'rook' && !queensideRook.hasMoved) {
            // Check if squares between king and rook are empty
            if (!getPieceAt(piece.row, 1) && !getPieceAt(piece.row, 2) && !getPieceAt(piece.row, 3)) {
              moves[`${piece.row},2`] = true;
            }
          }
        }
        break;
      }
    }
    
    return moves;
  }, [getPieceAt, isInCheck]);

  // Fix the checkForCheck function - remove the unreachable code and structure correctly
  const checkForCheck = useCallback((pieces: Piece[], kingColor: 'white' | 'black') => {
    const king = pieces.find(p => p.type === 'king' && p.color === kingColor && !p.captured);
    if (!king) return false;
    
    // Check each opponent piece to see if it can attack the king
    for (const piece of pieces) {
      if (piece.color === kingColor || piece.captured) continue;
      
      // Check if pawn can attack king
      if (piece.type === 'pawn') {
        const direction = piece.color === 'white' ? -1 : 1;
        if (Math.abs(piece.col - king.col) === 1 && piece.row + direction === king.row) {
          return true;
        }
      }
      // Check if knight can attack king
      else if (piece.type === 'knight') {
        if ((Math.abs(piece.row - king.row) === 2 && Math.abs(piece.col - king.col) === 1) ||
            (Math.abs(piece.row - king.row) === 1 && Math.abs(piece.col - king.col) === 2)) {
          return true;
        }
      }
      // Check if bishop or queen can attack king diagonally
      else if ((piece.type === 'bishop' || piece.type === 'queen') && 
               Math.abs(piece.row - king.row) === Math.abs(piece.col - king.col)) {
        const rowStep = piece.row < king.row ? 1 : -1;
        const colStep = piece.col < king.col ? 1 : -1;
        
        let blocked = false;
        let r = piece.row + rowStep;
        let c = piece.col + colStep;
        
        // Check all squares along the diagonal
        while (r !== king.row && c !== king.col) {
          if (getPieceAt(r, c)) {
            blocked = true;
            break;
          }
          r += rowStep;
          c += colStep;
        }
        
        if (!blocked) return true;
      }
      // Check if rook or queen can attack king horizontally or vertically
      else if ((piece.type === 'rook' || piece.type === 'queen') &&
               (piece.row === king.row || piece.col === king.col)) {
        let blocked = false;
        
        // Check horizontal path
        if (piece.row === king.row) {
          const step = piece.col < king.col ? 1 : -1;
          for (let c = piece.col + step; c !== king.col; c += step) {
            if (getPieceAt(piece.row, c)) {
              blocked = true;
              break;
            }
          }
        } 
        // Check vertical path
        else if (piece.col === king.col) {
          const step = piece.row < king.row ? 1 : -1;
          for (let r = piece.row + step; r !== king.row; r += step) {
            if (getPieceAt(r, piece.col)) {
              blocked = true;
              break;
            }
          }
        }
        
        if (!blocked) return true;
      }
    }
    
    return false;
  }, [getPieceAt]);

  // Add a function to check if the player has any valid moves
  const hasValidMoves = useCallback((playerColor: 'white' | 'black') => {
    // Check each piece of the current player
    for (const piece of pieces.filter(p => p.color === playerColor && !p.captured)) {
      // For pawns
      if (piece.type === 'pawn') {
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        
        // Check forward moves
        if (piece.row + direction >= 0 && piece.row + direction < 8) {
          // Single step forward
          if (!getPieceAt(piece.row + direction, piece.col)) {
            return true;
          }
          
          // Double step from starting position
          if (piece.row === startRow && !getPieceAt(piece.row + direction, piece.col) && 
              !getPieceAt(piece.row + 2 * direction, piece.col)) {
            return true;
          }
        }
        
        // Check captures
        for (const offset of [-1, 1]) {
          if (piece.col + offset >= 0 && piece.col + offset < 8 && 
              piece.row + direction >= 0 && piece.row + direction < 8) {
            const targetPiece = getPieceAt(piece.row + direction, piece.col + offset);
            if (targetPiece && targetPiece.color !== piece.color) {
              return true;
            }
          }
        }
      }
      
      // For rooks and queens
      if (piece.type === 'rook' || piece.type === 'queen') {
        // Check in all four directions
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        for (const [dx, dy] of directions) {
          let newRow = piece.row + dx;
          let newCol = piece.col + dy;
          
          while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = getPieceAt(newRow, newCol);
            
            if (!targetPiece) {
              return true; // Can move to an empty square
            } else if (targetPiece.color !== piece.color) {
              return true; // Can capture an opponent's piece
            } else {
              break; // Blocked by own piece
            }
            
            newRow += dx;
            newCol += dy;
          }
        }
      }
      
      // For bishops and queens
      if (piece.type === 'bishop' || piece.type === 'queen') {
        // Check in all four diagonal directions
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        
        for (const [dx, dy] of directions) {
          let newRow = piece.row + dx;
          let newCol = piece.col + dy;
          
          while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = getPieceAt(newRow, newCol);
            
            if (!targetPiece) {
              return true; // Can move to an empty square
            } else if (targetPiece.color !== piece.color) {
              return true; // Can capture an opponent's piece
            } else {
              break; // Blocked by own piece
            }
            
            newRow += dx;
            newCol += dy;
          }
        }
      }
      
      // For knights
      if (piece.type === 'knight') {
        const knightMoves = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        for (const [dx, dy] of knightMoves) {
          const newRow = piece.row + dx;
          const newCol = piece.col + dy;
          
          if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = getPieceAt(newRow, newCol);
            
            if (!targetPiece || targetPiece.color !== piece.color) {
              return true; // Can move to an empty square or capture
            }
          }
        }
      }
      
      // For king
      if (piece.type === 'king') {
        const kingMoves = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1], [0, 1],
          [1, -1], [1, 0], [1, 1]
        ];
        
        for (const [dx, dy] of kingMoves) {
          const newRow = piece.row + dx;
          const newCol = piece.col + dy;
          
          if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = getPieceAt(newRow, newCol);
            
            if (!targetPiece || targetPiece.color !== piece.color) {
              return true; // Can move to an empty square or capture
            }
          }
        }
        
        // Also check castling
        if (!piece.hasMoved && !isInCheck) {
          // Kingside
          if (!getPieceAt(piece.row, 5) && !getPieceAt(piece.row, 6)) {
            const kingsideRook = getPieceAt(piece.row, 7);
            if (kingsideRook && kingsideRook.type === 'rook' && !kingsideRook.hasMoved) {
              return true;
            }
          }
          
          // Queenside
          if (!getPieceAt(piece.row, 1) && !getPieceAt(piece.row, 2) && !getPieceAt(piece.row, 3)) {
            const queensideRook = getPieceAt(piece.row, 0);
            if (queensideRook && queensideRook.type === 'rook' && !queensideRook.hasMoved) {
              return true;
            }
          }
        }
      }
    }
    
    // If we get here, no valid moves were found
    return false;
  }, [getPieceAt, pieces, isInCheck]);

  // Enhance the movePiece function to ensure pieces move correctly
  const movePiece = useCallback((piece: Piece, toRow: number, toCol: number) => {
    // Only allow the current player to move their pieces
    if (piece.color !== currentPlayer) {
      console.log("Can't move opponent's piece");
      return;
    }
    
    console.log(`Moving ${piece.color} ${piece.type} from ${piece.row},${piece.col} to ${toRow},${toCol}`);
    
    // Store original position for move history
    const fromRow = piece.row;
    const fromCol = piece.col;
    
    // Check for capture
    const targetPiece = getPieceAt(toRow, toCol);
    if (targetPiece) {
      console.log(`Capturing ${targetPiece.color} ${targetPiece.type}`);
    }
    
    // Handle special moves like castling
    let specialMove = false;
    const newPieces = [...pieces];
    
    // Check for castling (king moving 2 squares)
    if (piece.type === 'king' && Math.abs(piece.col - toCol) === 2) {
      console.log("Castling detected");
      specialMove = true;
      const isKingside = toCol > piece.col;
      const rookCol = isKingside ? 7 : 0;
      const newRookCol = isKingside ? 5 : 3;
      
      // Find the rook and move it
      const rookIndex = newPieces.findIndex(
        p => p.type === 'rook' && p.color === piece.color && p.row === piece.row && p.col === rookCol && !p.captured
      );
      
      if (rookIndex >= 0) {
        newPieces[rookIndex] = {
          ...newPieces[rookIndex],
          col: newRookCol,
          hasMoved: true
        };
        console.log(`Moving rook from ${piece.row},${rookCol} to ${piece.row},${newRookCol}`);
      }
    }
    
    // Apply the move - use a separate function to ensure state is updated correctly
    setPieces(prevPieces => {
      // Create new array to ensure state update
      const updatedPieces = prevPieces.map(p => {
        // If this is the piece we're moving
        if (p.id === piece.id) {
          // Update position and mark as moved
          return { ...p, row: toRow, col: toCol, hasMoved: true };
        }
        // If this is a piece being captured
        else if (targetPiece && p.id === targetPiece.id) {
          // Mark as captured
          return { ...p, captured: true };
        }
        // If we're castling, the rook is already updated
        else if (specialMove && p.type === 'rook' && p.color === piece.color) {
          const rookPiece = newPieces.find(np => np.id === p.id);
          if (rookPiece) {
            return rookPiece;
          }
        }
        // Otherwise return unchanged
        return p;
      });
      
      console.log("Updated pieces:", updatedPieces.map(p => ({
        id: p.id, position: `${p.row},${p.col}`, captured: p.captured
      })));
      
      return updatedPieces;
    });

    // Record the last move for highlighting
    setLastMove({
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol }
    });

    // If a piece was captured, notify
    if (targetPiece) {
      onCapture(targetPiece);
    }
    
    // If king was moved, update king positions
    if (piece.type === 'king') {
      setKingPositions(prev => ({
        ...prev,
        [piece.color]: { row: toRow, col: toCol }
      }));
    }

    // Generate proper chess notation for the move
    const fromNotation = toChessNotation(fromCol, fromRow);
    const toNotation = toChessNotation(toCol, toRow);
    
    // Pass piece and position information with proper notation
    onMoveRecord(
      piece, 
      fromCol, 
      fromRow, 
      toCol, 
      toRow, 
      targetPiece !== null
    );
    
    // Mark this piece as last moved
    setLastMovedPieceId(piece.id);
    
    // Clear selection and valid moves
    setSelectedPiece(null);
    setValidMoves({});
    
    // Switch turns
    setCurrentPlayer(prevPlayer => {
      const nextPlayer = prevPlayer === 'white' ? 'black' : 'white';
      console.log(`Turn changed from ${prevPlayer} to ${nextPlayer}`);
      onTurnChange(nextPlayer);
      return nextPlayer;
    });
  }, [pieces, getPieceAt, currentPlayer, onCapture, onTurnChange, onMoveRecord]);

  // Update the selectSquare function to use calculateValidMoves
  const selectSquare = useCallback((row: number, col: number) => {
    // Prevent multiple rapid clicks from causing issues
    if (isProcessingRef.current) {
      console.log("Selection already in progress, ignoring");
      return;
    }
    
    isProcessingRef.current = true;
    
    // Log selection attempts to debug
    console.log(`Attempting to select square at ${row},${col}`);
    
    const piece = getPieceAt(row, col);
    console.log('Piece found:', piece);
    
    // If selecting an own piece
    if (piece && piece.color === currentPlayer) {
      console.log(`Selected ${piece.color} ${piece.type} at ${row},${col}`);
      setSelectedPiece(piece.id);
      
      // Calculate valid moves using the shared function
      const moves = calculateValidMoves(piece);
      console.log("Valid moves:", Object.keys(moves));
      setValidMoves(moves);
    } else if (selectedPiece) {
      // If a piece is already selected and clicking on a valid move position
      const moveKey = `${row},${col}`;
      console.log("Attempting move to", moveKey, "Valid moves:", Object.keys(validMoves));
      if (validMoves[moveKey]) {
        const pieceToMove = pieces.find(p => p.id === selectedPiece);
        if (pieceToMove) {
          console.log("Moving piece", pieceToMove.id, "to", row, col);
          movePiece(pieceToMove, row, col);
        }
      } else {
        // Clear selection if clicking elsewhere
        console.log("Clearing selection");
        setSelectedPiece(null);
        setValidMoves({});
      }
    }
    
    // Reset processing flag after a short delay
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 100);
  }, [getPieceAt, currentPlayer, pieces, selectedPiece, validMoves, movePiece, calculateValidMoves]);
  
  // Check if a square is a valid move
  const isValidMove = useCallback((row: number, col: number) => {
    return validMoves[`${row},${col}`] || false;
  }, [validMoves]);
  
  // Fix the useEffect for check detection
  useEffect(() => {
    // Check if king is in check after every move
    const inCheck = checkForCheck(pieces, currentPlayer);
    setIsInCheck(inCheck);
    
    if (inCheck) {
      console.log(`${currentPlayer} is in check!`);
      setCheckPosition(kingPositions[currentPlayer]);
      
      // Check if it's a checkmate (in check and no valid moves)
      if (!hasValidMoves(currentPlayer)) {
        setGameStatus('checkmate');
        onStatusChange('checkmate');
      } else {
        setGameStatus('check');
        onStatusChange('check');
      }
    } else {
      // If not in check, check for stalemate (no valid moves)
      if (!hasValidMoves(currentPlayer)) {
        setGameStatus('stalemate');
        onStatusChange('stalemate');
      } else {
        setCheckPosition(null);
        setGameStatus('playing');
        onStatusChange('playing');
      }
    }
  }, [pieces, currentPlayer, kingPositions, onStatusChange, checkForCheck, hasValidMoves]);
  
  // Update the useEffect for initializing board state
  useEffect(() => {
    // Force a re-render to ensure correct initial state display
    console.log("Initial board setup");
    
    // Log the initial turn
    console.log(`Initial turn: ${currentPlayer}`);
    
    // Make sure the initial state is correctly set
    setGameStatus('playing');
    onStatusChange('playing');
  }, [onStatusChange, currentPlayer]); // Add currentPlayer to the dependency array

  // Render the chess board
  return (
    <div>
      <BoardContainer>
        {/* Render squares */}
        {Array.from({ length: 8 }, (_, rowIndex) => 
          Array.from({ length: 8 }, (_, colIndex) => {
            const isBlack = (rowIndex + colIndex) % 2 !== 0;
            const isPieceSelected = selectedPiece !== null && pieces.some(p => p.id === selectedPiece && p.row === rowIndex && p.col === colIndex);
            const isValidMoveSquare = isValidMove(rowIndex, colIndex);
            const isCheck = checkPosition?.row === rowIndex && checkPosition?.col === colIndex;
            const isLastMoveFrom = lastMove?.from.row === rowIndex && lastMove?.from.col === colIndex;
            const isLastMoveTo = lastMove?.to.row === rowIndex && lastMove?.to.col === colIndex;
            const files = 'abcdefgh';
            const ranks = '87654321';
            
            return (
              <Square
                key={`square-${rowIndex}-${colIndex}`}
                $isBlack={isBlack}
                $isSelected={isPieceSelected}
                $isValidMove={isValidMoveSquare}
                $isCheck={isCheck}
                $isLastMoveFrom={isLastMoveFrom}
                $isLastMoveTo={isLastMoveTo}
                data-position={`${rowIndex}-${colIndex}`}
                onClick={() => selectSquare(rowIndex, colIndex)}
                whileHover={{ scale: 1.02 }}
              >
                {/* Display coordinates for the edge squares */}
                {colIndex === 0 && <RankCoord $isBlack={isBlack}>{ranks[rowIndex]}</RankCoord>}
                {rowIndex === 7 && <FileCoord $isBlack={isBlack}>{files[colIndex]}</FileCoord>}
                
                {/* Display game status for debugging */}
                {rowIndex === 0 && colIndex === 0 && (
                  <div style={{ position: 'absolute', top: '-30px', left: '0', color: '#fff', fontSize: '12px' }}>
                    Status: {gameStatus}, Turn: {currentPlayer}
                  </div>
                )}
              </Square>
            );
          })
        ).flat()}
        
        {/* Render pieces as absolute positioned elements */}
        {pieces.filter(piece => !piece.captured).map(piece => (
          <PieceContainer
            key={piece.id}
            $row={piece.row}
            $col={piece.col}
            data-piece-id={piece.id}
            initial="initial"
            animate={lastMovedPieceId === piece.id ? "move" : "animate"}
            variants={pieceVariants}
            whileHover={piece.color === currentPlayer ? "hover" : undefined}
            onClick={(e) => {
              // Prevent the click from reaching the square underneath
              e.stopPropagation(); 
              e.preventDefault();
              
              // Log detailed information for debugging
              console.log(`Piece clicked: ${piece.id} (${piece.color} ${piece.type})`);
              console.log(`Current turn: ${currentPlayer}`);
              console.log(`Piece position: ${piece.row},${piece.col}`);
              
              // Call selectSquare with the piece's position
              selectSquare(piece.row, piece.col);
            }}
          >
            <PieceSymbol $color={piece.color}>
              {piece.symbol}
            </PieceSymbol>
          </PieceContainer>
        ))}
      </BoardContainer>
      
      {/* Captured pieces display */}
      <CapturedPiecesContainer>
        {/* White player's captures (black pieces) */}
        <PlayerCapturesRow $player="white">
          {pieces.filter(piece => piece.captured && piece.color === 'black').map(piece => (
            <CapturedPiece key={piece.id} $color={piece.color}>
              {piece.symbol}
            </CapturedPiece>
          ))}
        </PlayerCapturesRow>
        
        {/* Black player's captures (white pieces) */}
        <PlayerCapturesRow $player="black">
          {pieces.filter(piece => piece.captured && piece.color === 'white').map(piece => (
            <CapturedPiece key={piece.id} $color={piece.color}>
              {piece.symbol}
            </CapturedPiece>
          ))}
        </PlayerCapturesRow>
      </CapturedPiecesContainer>
    </div>
  );
};

export default ChessBoard; 