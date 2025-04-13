import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ChessBoard from './ChessBoard';
import Controls from './Controls';
import { Piece, GameStatus } from './types';

// Chess game container
const ChessContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 1rem;
  background: rgba(0, 0, 0, 0.5);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  color: white;
  margin-bottom: 1.5rem;
  font-size: 2.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  text-align: center;
  font-weight: bold;
  letter-spacing: 2px;
`;

const GameSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1.5rem;
  
  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const BoardContainer = styled.div`
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  
  @media (min-width: 1024px) {
    flex: 1;
  }
`;

const SidePanel = styled.div`
  width: 100%;
  
  @media (min-width: 1024px) {
    width: 280px;
  }
`;

const PlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 0.5rem;
`;

const PlayerName = styled.div<{ $active: boolean }>`
  font-size: 1.1rem;
  font-weight: bold;
  color: ${props => props.$active ? 'white' : '#999'};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CapturedPieces = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.5rem;
`;

const CapturedPiece = styled.div`
  font-size: 1.2rem;
  opacity: 0.8;
`;

// Get symbol for captured piece
const getPieceSymbol = (piece: Piece) => {
  const symbols: Record<string, string> = {
    'wp': '♙', 'wb': '♗', 'wn': '♘', 'wr': '♖', 'wq': '♕', 'wk': '♔',
    'bp': '♟', 'bb': '♝', 'bn': '♞', 'br': '♜', 'bq': '♛', 'bk': '♚',
  };
  return symbols[`${piece.color.charAt(0)}${piece.type.charAt(0)}`] || '';
};

// Convert position to algebraic notation
const toAlgebraic = (col: number, row: number): string => {
  const files = 'abcdefgh';
  const ranks = '87654321';
  return `${files[col]}${ranks[row]}`;
};

// Format move to algebraic notation
const formatMove = (piece: Piece, startCol: number, startRow: number, endCol: number, endRow: number, isCapture: boolean): string => {
  const pieceSymbols: Record<string, string> = {
    'pawn': '', 'bishop': 'B', 'knight': 'N', 'rook': 'R', 'queen': 'Q', 'king': 'K'
  };
  const files = 'abcdefgh';
  const ranks = '87654321';
  
  // Special case for castling
  if (piece.type === 'king' && Math.abs(startCol - endCol) === 2) {
    return endCol > startCol ? 'O-O' : 'O-O-O';
  }
  
  // Get the piece type symbol
  const pieceSymbol = pieceSymbols[piece.type];
  
  // For pawns capturing, include the origin file
  if (piece.type === 'pawn' && isCapture) {
    return `${files[startCol]}x${files[endCol]}${ranks[endRow]}`;
  }
  
  // Default move notation
  return `${pieceSymbol}${isCapture ? 'x' : ''}${files[endCol]}${ranks[endRow]}`;
};

const Chess: React.FC = () => {
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [capturedPieces, setCapturedPieces] = useState<Piece[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [resetKey, setResetKey] = useState(0);
  
  // Handle piece capture
  const handleCapture = useCallback((piece: Piece) => {
    console.log('Piece captured:', piece);
    setCapturedPieces(prev => [...prev, piece]);
  }, []);
  
  // Handle player turn change
  const handleTurnChange = useCallback((player: 'white' | 'black') => {
    setCurrentPlayer(player);
  }, []);
  
  // Handle game status change
  const handleStatusChange = useCallback((status: GameStatus) => {
    setGameStatus(status);
  }, []);
  
  // Handle move recording
  const handleMoveRecord = useCallback((piece: Piece, startCol: number, startRow: number, endCol: number, endRow: number, isCapture: boolean) => {
    const moveNotation = formatMove(piece, startCol, startRow, endCol, endRow, isCapture);
    setMoveHistory(prev => [...prev, moveNotation]);
  }, []);
  
  // Reset the game
  const handleReset = useCallback(() => {
    setCapturedPieces([]);
    setMoveHistory([]);
    setCurrentPlayer('white');
    setGameStatus('playing');
    setResetKey(prev => prev + 1);
  }, []);
  
  // Get captured pieces for a specific color
  const getCapturedPiecesByColor = (color: 'white' | 'black') => {
    return capturedPieces.filter(piece => piece.color === color);
  };
  
  return (
    <ChessContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Title>Chess</Title>
      
      <GameSection>
        <BoardContainer>
          <ChessBoard
            key={resetKey}
            onCapture={handleCapture}
            onTurnChange={handleTurnChange}
            onStatusChange={handleStatusChange}
            onMoveRecord={handleMoveRecord}
          />
        </BoardContainer>
        
        <SidePanel>
          <PlayerInfo>
            <PlayerName $active={currentPlayer === 'white'}>
              <span>White Player</span>
              {getCapturedPiecesByColor('black').length > 0 && (
                <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
                  +{getCapturedPiecesByColor('black').length}
                </span>
              )}
            </PlayerName>
            {getCapturedPiecesByColor('black').length > 0 && (
              <CapturedPieces>
                {getCapturedPiecesByColor('black').map((piece, index) => (
                  <CapturedPiece key={index}>
                    {getPieceSymbol(piece)}
                  </CapturedPiece>
                ))}
              </CapturedPieces>
            )}
          </PlayerInfo>
          
          <PlayerInfo>
            <PlayerName $active={currentPlayer === 'black'}>
              <span>Black Player</span>
              {getCapturedPiecesByColor('white').length > 0 && (
                <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
                  +{getCapturedPiecesByColor('white').length}
                </span>
              )}
            </PlayerName>
            {getCapturedPiecesByColor('white').length > 0 && (
              <CapturedPieces>
                {getCapturedPiecesByColor('white').map((piece, index) => (
                  <CapturedPiece key={index}>
                    {getPieceSymbol(piece)}
                  </CapturedPiece>
                ))}
              </CapturedPieces>
            )}
          </PlayerInfo>
          
          <Controls
            gameStatus={gameStatus}
            currentPlayer={currentPlayer}
            moveHistory={moveHistory}
            onReset={handleReset}
          />
        </SidePanel>
      </GameSection>
    </ChessContainer>
  );
};

export default Chess; 