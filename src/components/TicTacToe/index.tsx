import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// Types
type Player = 'X' | 'O';
type CellValue = Player | null;
type GameState = 'betting' | 'playing' | 'finished';
type WinnerType = Player | 'draw' | null;

// Styled Components
const GameContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  position: relative;
  min-height: 700px;
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const GameTitle = styled.h2`
  font-size: 2.5rem;
  margin: 0;
  background: linear-gradient(to right, #ff4d4d, #f9cb28);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(255, 77, 77, 0.3);
`;

const PlayerInfo = styled.div<{ $active: boolean }>`
  padding: 10px 15px;
  background: ${props => props.$active
    ? 'linear-gradient(45deg, #ff4d4d, #f9cb28)'
    : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 10px;
  color: white;
  font-weight: bold;
  transition: all 0.3s ease;
`;

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 8px;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1/1;
  margin: 0 auto 20px;
  background: #333;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
`;

const Cell = styled.div<{ $marked?: boolean }>`
  background: ${props => props.$marked ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.3);
  }
`;

const Mark = styled(motion.div)<{ $player: Player }>`
  color: ${props => props.$player === 'X' 
    ? '#ff4d4d' 
    : '#4e54c8'};
  font-size: 4rem;
  font-weight: bold;
  text-shadow: 
    0 0 10px ${props => props.$player === 'X' 
      ? 'rgba(255, 77, 77, 0.7)' 
      : 'rgba(78, 84, 200, 0.7)'};
`;

const WinLine = styled(motion.div)<{ $orientation: string; $position: number }>`
  position: absolute;
  background: linear-gradient(to right, gold, #ffeb3b);
  box-shadow: 0 0 10px gold, 0 0 20px gold;
  border-radius: 5px;
  z-index: 10;
  
  ${props => props.$orientation === 'horizontal' && `
    height: 10px;
    width: calc(100% - 40px);
    left: 20px;
    top: ${props.$position * 33.33 + 16.5}%;
  `}
  
  ${props => props.$orientation === 'vertical' && `
    width: 10px;
    height: calc(100% - 40px);
    top: 20px;
    left: ${props.$position * 33.33 + 16.5}%;
  `}
  
  ${props => props.$orientation === 'diagonal-1' && `
    height: 10px;
    width: calc(141% - 40px);
    left: 20px;
    top: 50%;
    transform: rotate(45deg);
    transform-origin: center center;
  `}
  
  ${props => props.$orientation === 'diagonal-2' && `
    height: 10px;
    width: calc(141% - 40px);
    left: 20px;
    top: 50%;
    transform: rotate(-45deg);
    transform-origin: center center;
  `}
`;

const GameStatus = styled(motion.div)`
  font-size: 1.5rem;
  color: white;
  margin: 20px 0;
  text-align: center;
  height: 40px;
`;

const GameOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const GameMessage = styled(motion.h2)`
  font-size: 3rem;
  color: gold;
  margin-bottom: 20px;
  text-shadow: 
    0 0 10px gold,
    0 0 20px gold;
`;

const ActionButton = styled(motion.button)`
  padding: 15px 30px;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  background: linear-gradient(45deg, #ff4d4d, #f9cb28);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  margin-top: 20px;
  box-shadow: 0 5px 15px rgba(255, 77, 77, 0.5);
`;

const BettingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
`;

const BettingSlider = styled.input`
  width: 80%;
  margin: 10px 0;
  -webkit-appearance: none;
  height: 10px;
  border-radius: 5px;
  background: linear-gradient(to right, #4e54c8, #ff4d4d);
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: gold;
    cursor: pointer;
    box-shadow: 0 0 10px gold;
  }
`;

const ChipContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 10px 0;
`;

const Chip = styled(motion.div)<{ $value: number }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
  background: ${props => {
    switch(props.$value) {
      case 5: return '#ff4d4d';
      case 10: return '#4e54c8';
      case 25: return '#4caf50';
      case 50: return '#ff9800';
      case 100: return '#9c27b0';
      default: return '#777';
    }
  }};
  border: 4px dashed rgba(255, 255, 255, 0.5);
  color: white;
  font-size: 1.2rem;
  
  &:before {
    content: "";
    position: absolute;
    width: 90%;
    height: 90%;
    border-radius: 50%;
    border: 2px dashed rgba(255, 255, 255, 0.3);
  }
`;

const BetAmount = styled.div`
  font-size: 2rem;
  color: gold;
  margin: 10px 0;
  text-shadow: 0 0 10px gold;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const NeonSign = styled(motion.div)`
  position: absolute;
  top: 15px;
  right: 15px;
  color: #ff00ff;
  font-size: 1.2rem;
  font-style: italic;
  font-weight: bold;
  text-shadow: 
    0 0 5px #ff00ff,
    0 0 10px #ff00ff,
    0 0 15px #ff00ff,
    0 0 20px #ff00ff;
  z-index: 5;
`;

const CoinStack = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
`;

const Coin = styled(motion.div)`
  width: 25px;
  height: 25px;
  background: gold;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.8rem;
  font-weight: bold;
  color: #333;
  box-shadow: 0 0 5px gold;
`;

const PlayerBalance = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0 20px;
`;

const Balance = styled.div<{ $player: Player }>`
  color: ${props => props.$player === 'X' ? '#ff4d4d' : '#4e54c8'};
  font-size: 1.2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
`;

// Main Component
const TicTacToe: React.FC = () => {
  // State
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<WinnerType>(null);
  const [winLine, setWinLine] = useState<{orientation: string; position: number} | null>(null);
  const [gameState, setGameState] = useState<GameState>('betting');
  const [betAmount, setBetAmount] = useState<number>(0);
  const [playerXBalance, setPlayerXBalance] = useState<number>(1000);
  const [playerOBalance, setPlayerOBalance] = useState<number>(1000);
  const [playerXBet, setPlayerXBet] = useState<number>(0);
  const [playerOBet, setPlayerOBet] = useState<number>(0);
  
  // Chip values
  const chipValues = [5, 10, 25, 50, 100];
  
  // Add useEffect to log state changes
  useEffect(() => {
    console.log("Game state changed:", gameState);
    console.log("Current player:", currentPlayer);
    console.log("Board:", board);
  }, [gameState, currentPlayer, board]);
  
  // Handle cell click
  const handleCellClick = (index: number) => {
    // If cell is already marked or game is over or not in playing state, do nothing
    if (board[index] !== null || gameState !== 'playing') {
      console.log("Cell click ignored: ", { 
        cellValue: board[index], 
        gameState, 
        index 
      });
      return;
    }
    
    console.log("Cell clicked: ", index, "Current player:", currentPlayer);
    
    // Create new board with the cell marked
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    
    // Check for winner
    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      console.log("Winner found:", gameWinner);
      setWinner(gameWinner.winner);
      setWinLine(gameWinner.line);
      setGameState('finished');
      handleGameEnd(gameWinner.winner);
      return;
    }
    
    // Check for draw
    if (!newBoard.includes(null)) {
      console.log("Game ended in draw");
      setWinner('draw');
      setGameState('finished');
      handleGameEnd('draw');
      return;
    }
    
    // Switch player
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };
  
  // Check for winner
  const checkWinner = (board: CellValue[]) => {
    const lines = [
      // Horizontal
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      // Vertical
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      // Diagonal
      [0, 4, 8], [2, 4, 6]
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        let orientation = '';
        let position = 0;
        
        if (i < 3) {
          orientation = 'horizontal';
          position = i;
        } else if (i < 6) {
          orientation = 'vertical';
          position = i - 3;
        } else if (i === 6) {
          orientation = 'diagonal-1';
        } else {
          orientation = 'diagonal-2';
        }
        
        return { 
          winner: board[a] as Player,
          line: { orientation, position }
        };
      }
    }
    
    return null;
  };
  
  // Handle game end and distribute bets
  const handleGameEnd = (result: WinnerType) => {
    if (result === 'X') {
      // X wins, gets both bets
      setPlayerXBalance(prevBalance => prevBalance + playerXBet + playerOBet);
    } else if (result === 'O') {
      // O wins, gets both bets
      setPlayerOBalance(prevBalance => prevBalance + playerXBet + playerOBet);
    } else {
      // Draw, return bets
      setPlayerXBalance(prevBalance => prevBalance + playerXBet);
      setPlayerOBalance(prevBalance => prevBalance + playerOBet);
    }
  };
  
  // Start a new game
  const startNewGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinLine(null);
    setGameState('betting');
    setPlayerXBet(0);
    setPlayerOBet(0);
    setBetAmount(0);
  };
  
  // Place a bet
  const placeBet = () => {
    if (betAmount <= 0) return; // Don't allow zero or negative bets
    
    if (currentPlayer === 'X') {
      if (betAmount > playerXBalance) return;
      setPlayerXBalance(prevBalance => prevBalance - betAmount);
      setPlayerXBet(betAmount);
      setCurrentPlayer('O');
    } else {
      if (betAmount > playerOBalance) return;
      setPlayerOBalance(prevBalance => prevBalance - betAmount);
      setPlayerOBet(betAmount);
      setGameState('playing');
      setCurrentPlayer('X'); // X always starts the game
    }
    
    // Reset bet amount for the next player
    setBetAmount(0);
  };
  
  // Handle chip selection with better visual feedback
  const addChip = (value: number) => {
    console.log(`Adding chip value: ${value}`);
    const maxBet = currentPlayer === 'X' 
      ? Math.min(playerXBalance, 500) 
      : Math.min(playerOBalance, 500);
      
    setBetAmount(prev => {
      const newValue = Math.min(prev + value, maxBet);
      console.log(`Bet amount updated: ${prev} -> ${newValue}`);
      return newValue;
    });
  };
  
  // Handle bet slider change
  const handleBetSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setBetAmount(value);
  };
  
  return (
    <GameContainer>
      <GameHeader>
        <GameTitle>Tic Tac Toe</GameTitle>
        <div style={{ display: 'flex', gap: '10px' }}>
          <PlayerInfo $active={currentPlayer === 'X' && gameState === 'playing'}>
            Player X
          </PlayerInfo>
          <PlayerInfo $active={currentPlayer === 'O' && gameState === 'playing'}>
            Player O
          </PlayerInfo>
        </div>
      </GameHeader>
      
      <PlayerBalance>
        <Balance $player="X">
          <Coin>X</Coin>
          {playerXBalance}
        </Balance>
        <Balance $player="O">
          <Coin>O</Coin>
          {playerOBalance}
        </Balance>
      </PlayerBalance>
      
      {gameState === 'betting' && (
        <BettingContainer>
          <h3>
            Player {currentPlayer} Place Your Bet
          </h3>
          <BetAmount>
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ${betAmount}
            </motion.span>
          </BetAmount>
          
          <ChipContainer>
            {chipValues.map(value => (
              <Chip 
                key={value} 
                $value={value}
                onClick={() => {
                  console.log(`Clicking chip: $${value}`);
                  addChip(value);
                }}
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
              >
                ${value}
              </Chip>
            ))}
          </ChipContainer>
          
          <BettingSlider 
            type="range" 
            min="0" 
            max={currentPlayer === 'X' ? playerXBalance : playerOBalance} 
            value={betAmount}
            onChange={handleBetSliderChange}
          />
          
          <ActionButton
            onClick={() => {
              console.log("Place bet button clicked");
              placeBet();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              y: [0, -5, 0],
              boxShadow: [
                '0 5px 15px rgba(255, 77, 77, 0.5)',
                '0 8px 20px rgba(255, 77, 77, 0.7)',
                '0 5px 15px rgba(255, 77, 77, 0.5)'
              ]
            }}
            transition={{ 
              y: { repeat: Infinity, duration: 1.5 },
              boxShadow: { repeat: Infinity, duration: 1.5 }
            }}
          >
            Place Bet
          </ActionButton>
        </BettingContainer>
      )}
      
      <Board>
        {board.map((cell, index) => (
          <Cell 
            key={index} 
            onClick={() => {
              console.log(`Clicking cell ${index}, game state: ${gameState}, current player: ${currentPlayer}`);
              if (gameState === 'playing' && cell === null) {
                handleCellClick(index);
              }
            }}
            $marked={cell !== null}
            style={{ 
              cursor: gameState === 'playing' && cell === null ? 'pointer' : 'default',
            }}
          >
            {cell && (
              <Mark 
                $player={cell}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10 }}
              >
                {cell}
              </Mark>
            )}
          </Cell>
        ))}
        
        {winLine && (
          <WinLine 
            $orientation={winLine.orientation} 
            $position={winLine.position}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              boxShadow: [
                '0 0 10px gold, 0 0 20px gold',
                '0 0 5px gold, 0 0 10px gold',
                '0 0 10px gold, 0 0 20px gold'
              ]
            }}
            transition={{ 
              duration: 0.5,
              boxShadow: { repeat: Infinity, duration: 1 }
            }}
          />
        )}
      </Board>
      
      <GameStatus
        animate={{ 
          opacity: gameState === 'playing' ? 1 : 0.7,
          y: gameState === 'playing' ? [0, -3, 0] : 0
        }}
        transition={{ y: { repeat: Infinity, duration: 2 } }}
      >
        {gameState === 'playing' && !winner && `Current Turn: Player ${currentPlayer}`}
        {gameState === 'betting' && `Place your bets!`}
        {winner === 'draw' && 'Game ended in a Draw!'}
        {winner && winner !== 'draw' && `Player ${winner} Wins!`}
      </GameStatus>
      
      {/* Vegas Neon Sign */}
      <NeonSign
        animate={{ 
          opacity: [1, 0.7, 1],
          textShadow: [
            '0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 15px #ff00ff, 0 0 20px #ff00ff',
            '0 0 2px #ff00ff, 0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 15px #ff00ff',
            '0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 15px #ff00ff, 0 0 20px #ff00ff'
          ]
        }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      >
        Vegas Jackpot!
      </NeonSign>
      
      {/* Game Finished Overlay */}
      <AnimatePresence>
        {gameState === 'finished' && (
          <GameOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameMessage
              animate={{ 
                scale: [1, 1.05, 1],
                color: winner === 'draw' 
                  ? ['gold', '#ffaa00', 'gold'] 
                  : winner === 'X' 
                    ? ['#ff4d4d', '#ff7777', '#ff4d4d'] 
                    : ['#4e54c8', '#7377d6', '#4e54c8'],
                textShadow: winner === 'draw'
                  ? [
                      '0 0 10px gold, 0 0 20px gold',
                      '0 0 5px gold, 0 0 10px gold',
                      '0 0 10px gold, 0 0 20px gold'
                    ]
                  : winner === 'X'
                    ? [
                        '0 0 10px #ff4d4d, 0 0 20px #ff4d4d',
                        '0 0 5px #ff4d4d, 0 0 10px #ff4d4d',
                        '0 0 10px #ff4d4d, 0 0 20px #ff4d4d'
                      ]
                    : [
                        '0 0 10px #4e54c8, 0 0 20px #4e54c8',
                        '0 0 5px #4e54c8, 0 0 10px #4e54c8',
                        '0 0 10px #4e54c8, 0 0 20px #4e54c8'
                      ]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            >
              {winner === 'draw' ? 'Draw!' : `Player ${winner} Wins!`}
            </GameMessage>
            
            {winner !== 'draw' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <CoinStack>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Coin
                      key={i}
                      initial={{ y: -50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                    >
                      $
                    </Coin>
                  ))}
                </CoinStack>
              </motion.div>
            )}
            
            <ActionButton
              onClick={startNewGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Play Again
            </ActionButton>
          </GameOverlay>
        )}
      </AnimatePresence>
    </GameContainer>
  );
};

export default TicTacToe; 