import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// Game Constants
const BOARD_SIZE = 10; // 10x10 grid
const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;

// Types
type GameState = 'start' | 'playing' | 'finished';
type PlayerTurn = 'player1' | 'player2';

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

const GameBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(${BOARD_SIZE}, 1fr);
  grid-template-rows: repeat(${BOARD_SIZE}, 1fr);
  gap: 2px;
  width: 100%;
  aspect-ratio: 1/1;
  background-color: #333;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  margin-bottom: 20px;
`;

const Cell = styled.div<{ $number: number; $even: boolean }>`
  background-color: ${props => props.$even ? '#4a4a6a' : '#2a2a4a'};
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.8);
  position: relative;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
`;

const CellNumber = styled.span`
  font-size: 0.9rem;
  position: absolute;
  top: 5px;
  left: 5px;
  opacity: 0.7;
`;

const Snake = styled.div<{ $start: number; $end: number }>`
  position: absolute;
  z-index: 4;
  transform-origin: top left;
  background: linear-gradient(to right, #ff4d4d, #ff6b6b);
  height: 10px;
  border-radius: 5px;
  &:before {
    content: "";
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #ff4d4d;
    right: -6px;
    top: -1px;
  }
`;

const Ladder = styled.div<{ $start: number; $end: number }>`
  position: absolute;
  z-index: 4;
  background: linear-gradient(to right, #4caf50, #8bc34a);
  height: 10px;
  border-radius: 5px;
  &:before, &:after {
    content: "";
    position: absolute;
    width: 4px;
    height: 10px;
    background-color: #2e7d32;
    border-radius: 2px;
  }
  &:before {
    left: 0;
  }
  &:after {
    right: 0;
  }
`;

const PlayerToken = styled(motion.div)<{ $player: 'player1' | 'player2' }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  position: absolute;
  z-index: 10;
  background: ${props => props.$player === 'player1' 
    ? 'linear-gradient(45deg, #ff4d4d, #ff9f43)' 
    : 'linear-gradient(45deg, #4e54c8, #8f94fb)'};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  font-size: 0.8rem;
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
`;

const DiceContainer = styled(motion.div)`
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  margin: 0 auto;
  position: relative;
  overflow: hidden;
`;

const DiceOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: inset 0 0 10px gold;
`;

const RollButton = styled(motion.button)`
  padding: 15px 30px;
  font-size: 1.2rem;
  font-weight: bold;
  background: linear-gradient(45deg, #ff4d4d, #f9cb28);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
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

const StartScreen = styled(GameOverlay)`
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(26, 26, 46, 0.8));
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

const InstructionText = styled.p`
  color: white;
  margin-bottom: 30px;
  font-size: 1.2rem;
  text-align: center;
  max-width: 80%;
`;

// Vegas-style neon sign
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

// Define snakes and ladders with clearer positions
const snakes = [
  { start: 24, end: 5 },
  { start: 33, end: 15 },
  { start: 53, end: 34 },
  { start: 64, end: 25 },
  { start: 72, end: 52 },
  { start: 91, end: 73 },
  { start: 95, end: 66 }
];

const ladders = [
  { start: 3, end: 21 },
  { start: 12, end: 31 },
  { start: 29, end: 50 },
  { start: 38, end: 59 },
  { start: 47, end: 67 },
  { start: 62, end: 82 },
  { start: 70, end: 90 }
];

const SnakeLadder: React.FC = () => {
  // Game state
  const [gameState, setGameState] = useState<GameState>('start');
  const [currentTurn, setCurrentTurn] = useState<PlayerTurn>('player1');
  const [player1Position, setPlayer1Position] = useState(1);
  const [player2Position, setPlayer2Position] = useState(1);
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [winner, setWinner] = useState<PlayerTurn | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  // Refs
  const boardRef = useRef<HTMLDivElement>(null);
  const moveAudioRef = useRef<HTMLAudioElement | null>(null);
  const snakeAudioRef = useRef<HTMLAudioElement | null>(null);
  const ladderAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);

  // Add debug mode for testing
  const [debugMode, setDebugMode] = useState(false);
  const [testPosition, setTestPosition] = useState(0);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Initialize sounds
  useEffect(() => {
    moveAudioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-quick-jump-arcade-game-239.mp3');
    snakeAudioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-falling-game-over-1940.mp3');
    ladderAudioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-extra-bonus-in-a-video-game-2045.mp3');
    winAudioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');

    return () => {
      if (moveAudioRef.current) moveAudioRef.current = null;
      if (snakeAudioRef.current) snakeAudioRef.current = null;
      if (ladderAudioRef.current) ladderAudioRef.current = null;
      if (winAudioRef.current) winAudioRef.current = null;
    };
  }, []);

  // Start game
  const startGame = () => {
    setGameState('playing');
    setCurrentTurn('player1');
    setPlayer1Position(1);
    setPlayer2Position(1);
    setDiceValue(1);
    setIsRolling(false);
    setWinner(null);
  };

  // Render cells with position 100 at top-left and 1 at bottom-right (completely inverted)
  const renderCells = () => {
    const cells = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        // Calculate position with 100 at top-left, zigzagging to 1 at bottom-right
        let position;
        
        if (row % 2 === 0) {
          // Even rows: left to right (decreasing by 10s)
          position = TOTAL_CELLS - (row * BOARD_SIZE) - col;
        } else {
          // Odd rows: right to left (decreasing by 10s)
          position = TOTAL_CELLS - (row * BOARD_SIZE) - BOARD_SIZE + 1 + col;
        }
        
        const isEven = (row + col) % 2 === 0;
        
        cells.push(
          <Cell key={position} $number={position} $even={isEven}>
            <CellNumber>{position}</CellNumber>
          </Cell>
        );
      }
    }
    
    return cells;
  };

  // Update getCellCoordinates to match the new inverted board numbering
  const getCellCoordinates = (position: number) => {
    if (position <= 0) return { x: 0, y: 0 };
    if (position > TOTAL_CELLS) return { x: 0, y: 0 };

    // For inverted board: position 100 at top-left, position 1 at bottom-right
    const invertedPosition = TOTAL_CELLS - position + 1;
    
    // Calculate row and column (zero-based) for the inverted position
    const row = Math.floor((invertedPosition - 1) / BOARD_SIZE);
    let col;

    if (row % 2 === 0) {
      // Even rows: left to right
      col = (invertedPosition - 1) % BOARD_SIZE;
    } else {
      // Odd rows: right to left
      col = BOARD_SIZE - 1 - ((invertedPosition - 1) % BOARD_SIZE);
    }

    const cellSize = boardRef.current ? boardRef.current.clientWidth / BOARD_SIZE : 0;

    // Return the center of the cell
    return {
      x: col * cellSize + cellSize / 2,
      y: row * cellSize + cellSize / 2
    };
  };

  // Roll dice and move player
  const rollDice = () => {
    if (isRolling || isMoving || gameState !== 'playing') return;

    setIsRolling(true);
    
    // Animate dice rolling
    let rolls = 0;
    const maxRolls = 10;
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      
      if (rolls >= maxRolls) {
        clearInterval(rollInterval);
        
        // Final dice value
        const finalDiceValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalDiceValue);
        
        // Show the final dice value for a moment before moving
        setIsRolling(false);
        
        // Add a longer delay before moving the player
        setTimeout(() => {
          movePlayer(finalDiceValue);
        }, 1200); // Increased from 500ms to 1200ms
      }
    }, 100);
  };

  // Complete redesign of movePlayer to handle the entire movement flow
  const movePlayer = (steps: number) => {
    setIsMoving(true);
    const currentPlayer = currentTurn;
    const currentPosition = currentPlayer === 'player1' ? player1Position : player2Position;
    let newPosition = currentPosition + steps;

    console.log(`🎲 ${currentPlayer} rolled ${steps}, moving from ${currentPosition} to ${newPosition}`);

    // 1. Handle winning condition first
    if (newPosition >= TOTAL_CELLS) {
      newPosition = TOTAL_CELLS;
      console.log(`🏆 ${currentPlayer} reached the end and wins!`);
      
      // Update player position
      updatePlayerPosition(currentPlayer, newPosition);
      
      // Set game state as finished after a delay
      setTimeout(() => {
        setWinner(currentPlayer);
        setGameState('finished');
        setIsMoving(false);
        
        if (winAudioRef.current) {
          winAudioRef.current.play().catch(e => console.error("Error playing sound:", e));
        }
      }, 500);
      
      return;
    }

    // 2. Update initial position
    updatePlayerPosition(currentPlayer, newPosition);
    
    // Play move sound
    if (moveAudioRef.current) {
      moveAudioRef.current.currentTime = 0;
      moveAudioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }

    // 3. After a delay, check for snakes or ladders
    setTimeout(() => {
      // We check for snakes or ladders on the new position directly, not from state
      handleSnakesAndLadders(currentPlayer, newPosition);
    }, 800);
  };

  // Function to update player position - centralizes the state update
  const updatePlayerPosition = (player: PlayerTurn, position: number) => {
    console.log(`📍 Updating ${player} position to ${position}`);
    if (player === 'player1') {
      setPlayer1Position(position);
    } else {
      setPlayer2Position(position);
    }
  };

  // New function to handle snake and ladder logic
  const handleSnakesAndLadders = (player: PlayerTurn, position: number) => {
    console.log(`🔍 Checking position ${position} for ${player} for snakes and ladders`);
    console.log(`🪜 Ladder positions: ${ladders.map(l => `${l.start}→${l.end}`).join(', ')}`);

    // Check for snake first
    const snake = snakes.find(s => s.start === position);
    if (snake) {
      console.log(`🐍 Found snake at position ${position}, moving to ${snake.end}`);
      
      // Play snake sound
      if (snakeAudioRef.current) {
        snakeAudioRef.current.play().catch(e => console.error("Error playing sound:", e));
      }
      
      // Move player down the snake
      setTimeout(() => {
        updatePlayerPosition(player, snake.end);
        
        // After another delay, switch turns
        setTimeout(() => {
          console.log(`👉 Switching turn from ${player} to ${player === 'player1' ? 'player2' : 'player1'}`);
          setCurrentTurn(player === 'player1' ? 'player2' : 'player1');
          setIsMoving(false);
        }, 500);
      }, 400);
      
      return;
    }
    
    // Explicitly convert ladder positions to numbers for comparison
    // Check for ladder - do explicit number equality check to ensure proper comparison
    const ladder = ladders.find(l => Number(l.start) === Number(position));
    if (ladder) {
      console.log(`🪜 Found ladder at position ${position}, moving to ${ladder.end}`);
      
      // Play ladder sound
      if (ladderAudioRef.current) {
        ladderAudioRef.current.play().catch(e => console.error("Error playing sound:", e));
      }
      
      // Move player up the ladder
      setTimeout(() => {
        updatePlayerPosition(player, ladder.end);
        
        if (debugMode) {
          setTestResult(`Player moved from ${position} to ${ladder.end} via ladder`);
        }
        
        // Check if player won after climbing ladder
        if (ladder.end === TOTAL_CELLS) {
          setTimeout(() => {
            setWinner(player);
            setGameState('finished');
            setIsMoving(false);
            
            if (winAudioRef.current) {
              winAudioRef.current.play().catch(e => console.error("Error playing sound:", e));
            }
          }, 500);
          return;
        }
        
        // After another delay, switch turns
        setTimeout(() => {
          console.log(`👉 Switching turn from ${player} to ${player === 'player1' ? 'player2' : 'player1'}`);
          setCurrentTurn(player === 'player1' ? 'player2' : 'player1');
          setIsMoving(false);
        }, 500);
      }, 400);
      
      return;
    }
    
    console.log(`➡️ No snake or ladder at position ${position}, switching turns`);
    
    // No snake or ladder, just switch turns
    setTimeout(() => {
      console.log(`👉 Switching turn from ${player} to ${player === 'player1' ? 'player2' : 'player1'}`);
      setCurrentTurn(player === 'player1' ? 'player2' : 'player1');
      setIsMoving(false);
      
      if (debugMode) {
        setTestResult(`Player stayed at position ${position} (no ladder or snake)`);
      }
    }, 300);
  };

  // Test function for debugging
  const testLadderImplementation = (startPosition: number) => {
    setDebugMode(true);
    setTestResult(null);
    
    let targetPosition = startPosition;
    
    if (startPosition === 0) {
      // Find the first ladder position
      const firstLadder = ladders[0];
      targetPosition = firstLadder.start;
      console.log(`Testing ladder at position ${targetPosition}`);
    } else {
      targetPosition = startPosition;
    }
    
    // Set the test position for UI display
    setTestPosition(targetPosition);
    
    // Update the player position
    updatePlayerPosition(currentTurn, targetPosition);
    
    // Check for ladder at this position
    setTimeout(() => {
      handleSnakesAndLadders(currentTurn, targetPosition);
    }, 500);
  };

  // Render snakes with improved positioning
  const renderSnakes = () => {
    if (!boardRef.current) return null;
    
    return snakes.map((snake, index) => {
      // Get cell coordinates
      const startCoords = getCellCoordinates(snake.start);
      const endCoords = getCellCoordinates(snake.end);
      
      if (!startCoords || !endCoords) return null;
      
      // Calculate distance and angle
      const dx = endCoords.x - startCoords.x;
      const dy = endCoords.y - startCoords.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      
      // Return snake with improved design
      return (
        <div
          key={`snake-${index}`}
          style={{
            position: 'absolute',
            width: `${length}px`,
            height: '10px',
            left: `${startCoords.x}px`,
            top: `${startCoords.y}px`,
            transform: `rotate(${angle}deg)`,
            transformOrigin: '0 0',
            zIndex: 4,
            background: 'linear-gradient(to right, #ff4d4d, #ff6b6b)',
            borderRadius: '5px'
          }}
        >
          {/* Snake head */}
          <div
            style={{
              position: 'absolute',
              right: '-6px',
              top: '-1px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#ff4d4d',
              zIndex: 6
            }}
          />
          {/* Start marker */}
          <div
            style={{
              position: 'absolute',
              left: '0',
              top: '0',
              width: '10px',
              height: '10px',
              background: '#ffeb3b',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 5px #ffeb3b, 0 0 10px #ffeb3b',
              zIndex: 7
            }}
          />
        </div>
      );
    });
  };

  // Render ladders with improved positioning and better steps
  const renderLadders = () => {
    if (!boardRef.current) return null;
    
    return ladders.map((ladder, index) => {
      // Get cell coordinates - ensure we're getting the center of each cell
      const startCoords = getCellCoordinates(ladder.start);
      const endCoords = getCellCoordinates(ladder.end);
      
      if (!startCoords || !endCoords) return null;
      
      // Calculate distance and angle
      const dx = endCoords.x - startCoords.x;
      const dy = endCoords.y - startCoords.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      
      // Adjust length to prevent overflow
      const boardWidth = boardRef.current?.clientWidth || 0;
      const cellSize = boardWidth / BOARD_SIZE;
      
      // Calculate ladder width based on cell size
      const ladderWidth = cellSize * 0.3;
      
      // Create the two side rails with improved positioning
      const sideRails = [
        <div 
          key={`rail-left-${index}`}
          style={{
            position: 'absolute',
            width: '100%',
            height: '4px',
            background: 'linear-gradient(to right, #4caf50, #8bc34a)',
            top: `-${ladderWidth / 4}px`,
            borderRadius: '2px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}
        />,
        <div 
          key={`rail-right-${index}`}
          style={{
            position: 'absolute',
            width: '100%',
            height: '4px',
            background: 'linear-gradient(to right, #4caf50, #8bc34a)',
            top: `${ladderWidth / 4}px`,
            borderRadius: '2px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}
        />
      ];
      
      // Create rungs for the ladder with better spacing and appearance
      const numberOfRungs = Math.max(4, Math.floor(length / (cellSize * 0.2)));
      const rungs = [];
      
      for (let i = 0; i < numberOfRungs; i++) {
        // Distribute rungs evenly between rails
        const position = (i + 0.5) / numberOfRungs;
        
        rungs.push(
          <div 
            key={`rung-${index}-${i}`}
            style={{
              position: 'absolute',
              left: `${position * 100}%`,
              width: '8px',
              height: `${ladderWidth / 2 + 2}px`,
              background: '#2e7d32',
              borderRadius: '2px',
              transform: 'translateX(-4px)',
              backgroundImage: 'linear-gradient(to bottom, #4caf50, #2e7d32)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
              zIndex: 5,
              top: `-${ladderWidth / 4 - 1}px`
            }}
          />
        );
      }
      
      // Return ladder with improved design and positioning
      return (
        <div
          key={`ladder-${index}`}
          style={{
            position: 'absolute',
            width: `${length}px`,
            height: `${ladderWidth}px`,
            left: `${startCoords.x}px`,
            top: `${startCoords.y}px`,
            transform: `rotate(${angle}deg)`,
            transformOrigin: '0 0',
            zIndex: 4
          }}
        >
          {sideRails}
          {rungs}
          {/* Start endpoint marker */}
          <div
            style={{
              position: 'absolute',
              left: '0',
              top: '0',
              width: '12px',
              height: '12px',
              background: '#ffeb3b',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 5px #ffeb3b, 0 0 10px #ffeb3b',
              zIndex: 7
            }}
          />
          {/* End endpoint marker */}
          <div
            style={{
              position: 'absolute',
              right: '0',
              top: '0',
              width: '12px',
              height: '12px', 
              background: '#ffeb3b',
              borderRadius: '50%',
              transform: 'translate(50%, -50%)',
              boxShadow: '0 0 5px #ffeb3b, 0 0 10px #ffeb3b',
              zIndex: 7
            }}
          />
        </div>
      );
    });
  };

  return (
    <GameContainer>
      <GameHeader>
        <GameTitle>Snake & Ladder</GameTitle>
        <div style={{ display: 'flex', gap: '10px' }}>
          <PlayerInfo $active={currentTurn === 'player1' && gameState === 'playing'}>
            Player 1
          </PlayerInfo>
          <PlayerInfo $active={currentTurn === 'player2' && gameState === 'playing'}>
            Player 2
          </PlayerInfo>
        </div>
      </GameHeader>
      
      <GameBoard ref={boardRef}>
        {renderCells()}
        {renderLadders()}
        {renderSnakes()}
        
        <PlayerToken
          $player="player1"
          animate={{
            x: getCellCoordinates(player1Position).x - 15,
            y: getCellCoordinates(player1Position).y - 15
          }}
          transition={{ 
            type: 'spring',
            stiffness: 300,
            damping: 20
          }}
        >
          P1
        </PlayerToken>
        
        <PlayerToken
          $player="player2"
          animate={{
            x: getCellCoordinates(player2Position).x - 15,
            y: getCellCoordinates(player2Position).y - 15
          }}
          transition={{ 
            type: 'spring',
            stiffness: 300,
            damping: 20
          }}
        >
          P2
        </PlayerToken>
        
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
      </GameBoard>
      
      <DiceContainer
        animate={{ 
          rotate: isRolling ? [0, 360, 720, 1080] : 0,
          scale: isRolling ? [1, 1.1, 0.9, 1] : 1,
          boxShadow: isRolling ? 
            ['0 5px 15px rgba(0, 0, 0, 0.3)', '0 0 20px gold', '0 5px 15px rgba(0, 0, 0, 0.3)'] : 
            '0 5px 15px rgba(0, 0, 0, 0.3)'
        }}
        transition={{ 
          duration: isRolling ? 1 : 0.3 
        }}
      >
        {diceValue}
        {isRolling && <DiceOverlay />}
      </DiceContainer>
      
      <Controls>
        <RollButton
          onClick={rollDice}
          disabled={isRolling || isMoving || gameState !== 'playing'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            opacity: gameState !== 'playing' || isRolling || isMoving ? 0.5 : 1,
            y: gameState !== 'playing' || isRolling || isMoving ? 0 : [0, -5, 0]
          }}
          transition={{ 
            y: { 
              repeat: Infinity, 
              duration: 1.5,
              repeatType: 'reverse'
            } 
          }}
        >
          Roll Dice
        </RollButton>
      </Controls>
      
      {/* Game State Overlays */}
      <AnimatePresence>
        {gameState === 'start' && (
          <StartScreen
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameMessage
              animate={{ 
                scale: [1, 1.05, 1],
                textShadow: [
                  '0 0 10px gold, 0 0 20px gold',
                  '0 0 5px gold, 0 0 10px gold',
                  '0 0 10px gold, 0 0 20px gold'
                ]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            >
              Snake & Ladder
            </GameMessage>
            
            <InstructionText>
              Climb the ladders to advance quickly, but beware of the snakes!
              Take turns rolling the dice and reach the top to win.
            </InstructionText>
            
            <ActionButton
              onClick={startGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Game
            </ActionButton>
          </StartScreen>
        )}
        
        {gameState === 'finished' && (
          <GameOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameMessage
              animate={{ 
                scale: [1, 1.05, 1],
                color: ['gold', '#ffaa00', 'gold']
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            >
              {winner === 'player1' ? 'Player 1 Wins!' : 'Player 2 Wins!'}
            </GameMessage>
            
            <ActionButton
              onClick={startGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Play Again
            </ActionButton>
          </GameOverlay>
        )}
      </AnimatePresence>

      {/* Add test controls for debugging */}
      {debugMode && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: 'rgba(0,0,0,0.7)', 
          borderRadius: '10px',
          color: 'white' 
        }}>
          <h3>Test Controls</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button 
              onClick={() => testLadderImplementation(0)}
              style={{
                padding: '8px 15px',
                background: '#4caf50',
                border: 'none',
                borderRadius: '5px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Test First Ladder
            </button>
            {ladders.map((ladder, index) => (
              <button
                key={`test-ladder-${index}`}
                onClick={() => testLadderImplementation(ladder.start)}
                style={{
                  padding: '8px 15px',
                  background: '#4caf50',
                  border: 'none',
                  borderRadius: '5px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Test Ladder {ladder.start}→{ladder.end}
              </button>
            ))}
          </div>
          <div style={{ marginTop: '10px' }}>
            <p>Test Position: {testPosition}</p>
            <p>Result: {testResult || 'No test run yet'}</p>
            <button
              onClick={() => setDebugMode(false)}
              style={{
                padding: '8px 15px',
                background: '#f44336',
                border: 'none',
                borderRadius: '5px',
                color: 'white',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Exit Debug Mode
            </button>
          </div>
        </div>
      )}

      {/* Add debug toggle button */}
      <button
        onClick={() => setDebugMode(!debugMode)}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          padding: '5px 10px',
          background: debugMode ? '#f44336' : '#2196f3',
          border: 'none',
          borderRadius: '5px',
          color: 'white',
          fontSize: '0.8rem',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        {debugMode ? 'Disable' : 'Enable'} Testing
      </button>
    </GameContainer>
  );
};

export default SnakeLadder; 