import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';
import Rules from './Rules';
import { 
  BingoGameState, 
  BingoCell, 
  CalledNumber, 
  COLUMN_RANGES,
  GameStatus,
  WinningPattern,
  GameState,
  WinningPatternType
} from './types';
import { useSound } from 'use-sound';

// Sound effects would be added in actual implementation
// const SOUNDS = {
//   numberCalled: '/sounds/bingo-number-called.mp3',
//   winSound: '/sounds/bingo-win.mp3',
//   markCell: '/sounds/bingo-mark.mp3',
// };

interface BoardProps {
  credits: number;
  onCreditChange: (newCredits: number) => void;
}

const BoardContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: linear-gradient(145deg, #1f2b3e, #0f141f);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  color: #FFD700;
  font-size: 2.5rem;
  margin: 0;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
`;

const Credits = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  color: white;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 16px;
  border-radius: 30px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const CreditAmount = styled.span`
  color: #4CAF50;
  font-weight: bold;
  margin-left: 8px;
`;

const GameControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 20px 0;
`;

const BetControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const BetLabel = styled.div`
  color: white;
  font-size: 1.2rem;
`;

const BetAmount = styled.div`
  color: #FFD700;
  font-size: 1.5rem;
  font-weight: bold;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  min-width: 80px;
  text-align: center;
`;

const BetButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px 10px;
  transition: all 0.2s;
  
  &:hover {
    color: #FFD700;
    transform: scale(1.1);
  }
  
  &:disabled {
    color: #555;
    cursor: not-allowed;
    transform: none;
  }
`;

const ActionButton = styled(motion.button)<{ $primary?: boolean }>`
  background: ${({ $primary }) => $primary ? '#4CAF50' : '#3f51b5'};
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 12px 24px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:disabled {
    background: #555;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const NumberBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 10px;
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
`;

const ColumnHeader = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #FFD700;
  text-align: center;
  margin-bottom: 10px;
`;

const NumberColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const NumberCell = styled.div<{ $called: boolean }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: ${({ $called }) => $called ? 'bold' : 'normal'};
  background-color: ${({ $called }) => $called ? '#4a5d8c' : 'rgba(255, 255, 255, 0.1)'};
  color: ${({ $called }) => $called ? 'white' : '#ccc'};
  font-size: 1rem;
  transition: all 0.3s;
  margin: 0 auto;
`;

const GameArea = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CalledNumberDisplay = styled(motion.div)`
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, #4a5d8c, #2a3f5f);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  color: white;
  box-shadow: 0 0 20px rgba(74, 93, 140, 0.7);
  margin: 20px 0;
  position: relative;
`;

const CalledNumberColumn = styled.div`
  position: absolute;
  top: -15px;
  font-size: 1.2rem;
  background-color: #FFD700;
  color: black;
  padding: 2px 8px;
  border-radius: 10px;
`;

const ToggleSwitch = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 20px;
`;

const ToggleLabel = styled.label`
  color: white;
  font-size: 1rem;
`;

const ToggleInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

const ToggleSlider = styled.span<{ $checked: boolean }>`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  background-color: ${({ $checked }) => $checked ? '#4CAF50' : '#ccc'};
  border-radius: 34px;
  transition: .4s;
  cursor: pointer;
  
  &:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    border-radius: 50%;
    transition: .4s;
    transform: ${({ $checked }) => $checked ? 'translateX(26px)' : 'translateX(0)'};
  }
`;

const RulesButton = styled(motion.button)`
  background: #3f51b5;
  color: white;
  font-size: 1rem;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: absolute;
  top: 20px;
  right: 20px;
  
  &:hover {
    background: #303f9f;
  }
`;

const WinMessage = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: black;
  font-size: 2.5rem;
  font-weight: bold;
  padding: 20px 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  z-index: 10;
  text-align: center;
`;

const WinAmount = styled.div`
  font-size: 1.8rem;
  margin-top: 10px;
  color: #4a0707;
`;

const WinActions = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
`;

// Initialize an empty Bingo card
const initializeCard = (): BingoCell[][] => {
  const card: BingoCell[][] = [];
  
  // Generate numbers for each column
  for (let col = 0; col < 5; col++) {
    const { min, max } = COLUMN_RANGES[col];
    const numbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);
    
    // Shuffle numbers for this column
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    
    // Take the first 5 numbers
    const columnNumbers = numbers.slice(0, 5);
    
    // Add numbers to card structure
    for (let row = 0; row < 5; row++) {
      if (!card[row]) {
        card[row] = [];
      }
      
      // Set free space in the middle
      if (col === 2 && row === 2) {
        card[row][col] = {
          number: null,
          marked: true,
          isWinning: false,
          isFreeSpace: true
        };
      } else {
        card[row][col] = {
          number: columnNumbers[row],
          marked: false,
          isWinning: false
        };
      }
    }
  }
  
  return card;
};

const Board: React.FC<BoardProps> = ({ credits, onCreditChange }) => {
  // Game state
  const [gameState, setGameState] = useState<GameState>('idle');
  const [card, setCard] = useState(() => initializeCard());
  const [calledNumbers, setCalledNumbers] = useState<CalledNumber[]>([]);
  const [currentNumber, setCurrentNumber] = useState<CalledNumber | null>(null);
  const [betAmount, setBetAmount] = useState(5);
  const [autoMarkEnabled, setAutoMarkEnabled] = useState(true);
  const [winPatterns, setWinPatterns] = useState<WinningPattern[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [showWinMessage, setShowWinMessage] = useState(false);
  
  // Sound effects (commented out for now)
  // const [playNumberCalled] = useSound(SOUNDS.numberCalled);
  // const [playWin] = useSound(SOUNDS.winSound);
  // const [playMark] = useSound(SOUNDS.markCell);
  
  // Generate a new card
  const generateNewCard = () => {
    setCard(initializeCard());
    setCalledNumbers([]);
    setCurrentNumber(null);
    setWinPatterns([]);
    setShowWinMessage(false);
    setWinAmount(0);
    setGameState('idle');
  };
  
  // Handle betting controls
  const increaseBet = () => {
    if (betAmount < 50 && betAmount < credits) {
      setBetAmount(prev => prev + 5);
    }
  };
  
  const decreaseBet = () => {
    if (betAmount > 5) {
      setBetAmount(prev => prev - 5);
    }
  };
  
  // Define winning patterns
  const bingoPatterns: WinningPattern[] = [
    // Horizontal rows
    { type: 'row' as WinningPatternType, positions: [[0,0], [0,1], [0,2], [0,3], [0,4]], multiplier: 3, index: 0 },
    { type: 'row' as WinningPatternType, positions: [[1,0], [1,1], [1,2], [1,3], [1,4]], multiplier: 3, index: 1 },
    { type: 'row' as WinningPatternType, positions: [[2,0], [2,1], [2,2], [2,3], [2,4]], multiplier: 3, index: 2 },
    { type: 'row' as WinningPatternType, positions: [[3,0], [3,1], [3,2], [3,3], [3,4]], multiplier: 3, index: 3 },
    { type: 'row' as WinningPatternType, positions: [[4,0], [4,1], [4,2], [4,3], [4,4]], multiplier: 3, index: 4 },
    
    // Vertical columns
    { type: 'column' as WinningPatternType, positions: [[0,0], [1,0], [2,0], [3,0], [4,0]], multiplier: 3, index: 0 },
    { type: 'column' as WinningPatternType, positions: [[0,1], [1,1], [2,1], [3,1], [4,1]], multiplier: 3, index: 1 },
    { type: 'column' as WinningPatternType, positions: [[0,2], [1,2], [2,2], [3,2], [4,2]], multiplier: 3, index: 2 },
    { type: 'column' as WinningPatternType, positions: [[0,3], [1,3], [2,3], [3,3], [4,3]], multiplier: 3, index: 3 },
    { type: 'column' as WinningPatternType, positions: [[0,4], [1,4], [2,4], [3,4], [4,4]], multiplier: 3, index: 4 },
    
    // Diagonals
    { type: 'diagonal' as WinningPatternType, positions: [[0,0], [1,1], [2,2], [3,3], [4,4]], multiplier: 5, direction: 'topleft' as const },
    { type: 'diagonal' as WinningPatternType, positions: [[0,4], [1,3], [2,2], [3,1], [4,0]], multiplier: 5, direction: 'topright' as const },
    
    // Four corners
    { type: 'corners' as WinningPatternType, positions: [[0,0], [0,4], [4,0], [4,4]], multiplier: 7 },
  ];
  
  // Handle cell clicking
  const handleCellClick = (row: number, col: number) => {
    if (gameState !== 'playing') return;
    
    const cellNumber = card[row][col].number;
    if (!cellNumber || card[row][col].marked) return;
    
    // Check if the number has been called
    const isCalled = calledNumbers.some(num => num.value === cellNumber);
    
    if (isCalled) {
      // playMark();
      
      // Mark the cell
      const newCard = [...card];
      newCard[row][col].marked = true;
      setCard(newCard);
      
      // Check for wins
      checkForWins();
    }
  };
  
  // Check for wins
  const checkForWins = () => {
    const foundPatterns = [];
    let totalWinnings = 0;
    
    // Check each pattern
    for (const pattern of bingoPatterns) {
      const isComplete = pattern.positions.every(([row, col]) => card[row][col].marked);
      
      if (isComplete) {
        foundPatterns.push(pattern);
        totalWinnings += betAmount * pattern.multiplier;
        
        // Mark winning cells
        const newCard = [...card];
        pattern.positions.forEach(([row, col]) => {
          newCard[row][col].isWinning = true;
        });
        setCard(newCard);
      }
    }
    
    if (foundPatterns.length > 0) {
      // playWin();
      setWinAmount(totalWinnings);
      setShowWinMessage(true);
      setGameState('won');
      setWinPatterns(foundPatterns);
      
      // Give the player their winnings
      onCreditChange(credits + totalWinnings);
    }
    
    return foundPatterns.length > 0;
  };
  
  // Play the game
  const startGame = () => {
    if (credits < betAmount) return;
    
    // Deduct credits
    onCreditChange(credits - betAmount);
    
    // Reset game state
    setCalledNumbers([]);
    setCurrentNumber(null);
    setWinPatterns([]);
    setShowWinMessage(false);
    setWinAmount(0);
    
    // Reset winning cells
    const newCard = [...card];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (newCard[row][col].isWinning) {
          newCard[row][col].isWinning = false;
        }
      }
    }
    setCard(newCard);
    
    setGameState('playing');
    
    // Start calling numbers
    callNextNumber();
  };
  
  // Call the next number
  const callNextNumber = () => {
    // Simple implementation for now - would be more complex in the full game
    // with timing, animations, etc.
    
    // Generate a random number that hasn't been called yet
    const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    const calledValues = calledNumbers.map(n => n.value);
    const availableNumbers = allNumbers.filter(n => !calledValues.includes(n));
    
    if (availableNumbers.length === 0) {
      // End game if all numbers have been called
      setGameState('paused');
      return;
    }
    
    const nextNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
    
    // Determine which column the number belongs to
    let column: 'B' | 'I' | 'N' | 'G' | 'O' = 'B';
    if (nextNumber <= 15) column = 'B';
    else if (nextNumber <= 30) column = 'I';
    else if (nextNumber <= 45) column = 'N';
    else if (nextNumber <= 60) column = 'G';
    else column = 'O';
    
    const newCalledNumber: CalledNumber = {
      value: nextNumber,
      column,
      timestamp: Date.now(),
      isNew: true
    };
    
    // playNumberCalled();
    
    // Update state - clear any previous currentNumber and set the new one
    setCurrentNumber(newCalledNumber);
    setCalledNumbers(prev => [...prev, newCalledNumber]);
    
    // Auto-mark cells if enabled
    if (autoMarkEnabled) {
      autoMarkCells(nextNumber);
    }
    
    // In a full implementation, would add timing between calls
    // and eventually check for wins
  };
  
  // Auto-mark cells when a number is called
  const autoMarkCells = (number: number) => {
    const newCard = [...card];
    let isMarked = false;
    
    // Find and mark the cell that matches this number
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (newCard[row][col].number === number) {
          newCard[row][col].marked = true;
          isMarked = true;
          break;
        }
      }
      if (isMarked) break;
    }
    
    if (isMarked) {
      // playMark();
      setCard(newCard);
      
      // Check for wins
      checkForWins();
    }
  };
  
  const playAgain = () => {
    setShowWinMessage(false);
    generateNewCard();
  };

  return (
    <BoardContainer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GameHeader>
        <Title>BINGO</Title>
        <Credits>
          Credits: <CreditAmount>{credits}</CreditAmount>
        </Credits>
      </GameHeader>
      
      <RulesButton
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowRules(true)}
      >
        How to Play
      </RulesButton>
      
      <AnimatePresence>
        {showRules && <Rules isOpen={showRules} onClose={() => setShowRules(false)} />}
      </AnimatePresence>
      
      <GameControls>
        <BetControls>
          <BetLabel>Bet:</BetLabel>
          <BetButton 
            onClick={decreaseBet}
            disabled={gameState !== 'idle' || betAmount <= 5}
          >-</BetButton>
          <BetAmount>{betAmount}</BetAmount>
          <BetButton 
            onClick={increaseBet}
            disabled={gameState !== 'idle' || betAmount >= 50 || betAmount >= credits}
          >+</BetButton>
          
          <ToggleSwitch>
            <ToggleLabel>Auto-mark:</ToggleLabel>
            <ToggleInput 
              type="checkbox" 
              checked={autoMarkEnabled}
              onChange={() => setAutoMarkEnabled(prev => !prev)}
            />
            <ToggleSlider $checked={autoMarkEnabled} onClick={() => setAutoMarkEnabled(prev => !prev)} />
          </ToggleSwitch>
        </BetControls>
        
        {gameState === 'idle' ? (
          <ActionButton
            $primary
            disabled={credits < betAmount}
            onClick={startGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Play
          </ActionButton>
        ) : (
          <ActionButton
            $primary
            onClick={callNextNumber}
            disabled={gameState === 'won'}
            whileHover={{ scale: gameState === 'won' ? 1 : 1.05 }}
            whileTap={{ scale: gameState === 'won' ? 1 : 0.95 }}
          >
            Call Next Number
          </ActionButton>
        )}
        
        <ActionButton
          disabled={gameState !== 'idle'}
          onClick={generateNewCard}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          New Card
        </ActionButton>
      </GameControls>
      
      <AnimatePresence mode="wait">
        {currentNumber && (
          <CalledNumberDisplay
            key={currentNumber.timestamp}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <CalledNumberColumn>{currentNumber.column}</CalledNumberColumn>
            {currentNumber.value}
          </CalledNumberDisplay>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showWinMessage && (
          <WinMessage
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            BINGO!
            <WinAmount>You won ${winAmount}!</WinAmount>
            <WinActions>
              <ActionButton 
                onClick={playAgain}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Play Again
              </ActionButton>
            </WinActions>
          </WinMessage>
        )}
      </AnimatePresence>
      
      <GameArea>
        <Card 
          card={{ cells: card, hasWon: showWinMessage }} 
          onCellClick={handleCellClick}
          autoMarkEnabled={autoMarkEnabled}
        />
        
        <NumberBoard>
          <ColumnHeader>B</ColumnHeader>
          <ColumnHeader>I</ColumnHeader>
          <ColumnHeader>N</ColumnHeader>
          <ColumnHeader>G</ColumnHeader>
          <ColumnHeader>O</ColumnHeader>
          
          {COLUMN_RANGES.map((range, colIndex) => (
            <NumberColumn key={`col-${colIndex}`}>
              {Array.from({ length: 15 }, (_, i) => i + range.min).map(num => (
                <NumberCell 
                  key={num} 
                  $called={calledNumbers.some(n => n.value === num)}
                >
                  {num}
                </NumberCell>
              ))}
            </NumberColumn>
          ))}
        </NumberBoard>
      </GameArea>
    </BoardContainer>
  );
};

export default Board; 