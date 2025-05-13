import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import styled from 'styled-components';
import { initGame, stopGame, restartGame } from './gameEngine';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  padding: 0 15px;
  
  @media (max-width: 768px) {
    padding: 0 10px;
  }
`;

const GameTitle = styled.h1`
  margin-bottom: 15px;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const GameCanvas = styled.canvas`
  border: 2px solid #333;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  background-color: #f0f0f0;
  margin-bottom: 20px;
  touch-action: none;
  max-width: 100%;
  max-height: 80vh;
`;

const GameControls = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    margin-bottom: 15px;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  background: linear-gradient(45deg, #ff4d4d, #f9cb28);
  color: white;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0px);
  }
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 14px;
  }
`;

const Score = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 15px;
  }
`;

const Instructions = styled.div`
  background-color: rgba(0, 0, 0, 0.1);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  max-width: 600px;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 10px;
    margin-bottom: 15px;
    font-size: 14px;
    
    p {
      margin: 5px 0;
    }
  }
`;

const WallCollisionMessage = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ff0000;
  color: white;
  padding: 10px;
  font-weight: bold;
  text-align: center;
  font-size: 18px;
  border-radius: 0 0 8px 8px;
  animation: flash 1s infinite;
  z-index: 10;

  @keyframes flash {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
  
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 8px;
  }
`;

const MobileInstructions = styled.div`
  display: none;
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  text-align: center;
  
  @media (max-width: 768px) {
    display: block;
    font-size: 14px;
    padding: 8px;
    margin-bottom: 15px;
  }
`;

const CanvasContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Snake: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [showWallCollision, setShowWallCollision] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });
  
  // Touch handling
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  // Calculate canvas size based on container width
  useLayoutEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const size = Math.min(containerWidth, 400); // Max 400px
        setCanvasSize({ width: size, height: size });
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  useEffect(() => {
    // Set up a message listener to receive game events
    const handleGameEvent = (event: Event) => {
      if (event instanceof CustomEvent) {
        if (event.detail.type === 'wallCollision') {
          setShowWallCollision(true);
        } else if (event.detail.type === 'restart') {
          setShowWallCollision(false);
        }
      }
    };
    
    window.addEventListener('snake-game-event', handleGameEvent);
    
    return () => {
      // Cleanup when component unmounts
      stopGame();
      window.removeEventListener('snake-game-event', handleGameEvent);
    };
  }, []);
  
  const startGame = () => {
    if (canvasRef.current) {
      setGameStarted(true);
      setShowWallCollision(false);
      initGame(canvasRef.current, updateScore);
    }
  };
  
  const resetGame = () => {
    // Stop the game first to clear all event listeners
    stopGame();
    
    // Set state in React component
    setScore(0);
    setShowWallCollision(false);
    
    // Need to reset the canvas and restart the game
    if (canvasRef.current) {
      initGame(canvasRef.current, updateScore);
    }
  };
  
  const updateScore = (newScore: number) => {
    setScore(newScore);
  };

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    const touchPos = e.touches[0];
    setTouchStart({ x: touchPos.clientX, y: touchPos.clientY });
  };

  // Handle touch end - determine swipe direction
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0];
    const deltaX = touchEnd.clientX - touchStart.x;
    const deltaY = touchEnd.clientY - touchStart.y;
    const minSwipeDistance = 30;
    
    // Determine swipe direction based on the largest delta
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      // Horizontal swipe
      if (deltaX > 0) {
        // Right swipe - simulate right arrow key
        simulateKeyPress('ArrowRight');
      } else {
        // Left swipe - simulate left arrow key
        simulateKeyPress('ArrowLeft');
      }
    } else if (Math.abs(deltaY) > minSwipeDistance) {
      // Vertical swipe
      if (deltaY > 0) {
        // Down swipe - simulate down arrow key
        simulateKeyPress('ArrowDown');
      } else {
        // Up swipe - simulate up arrow key
        simulateKeyPress('ArrowUp');
      }
    }
    
    setTouchStart(null);
  };

  // Handle touch move to prevent scrolling
  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameStarted) {
      e.preventDefault();
    }
  };

  // Function to simulate a keyboard event
  const simulateKeyPress = (key: string) => {
    const event = new KeyboardEvent('keydown', {
      key: key,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(event);
  };

  return (
    <GameContainer>
      <GameTitle>Snake Game</GameTitle>
      
      <Instructions>
        <p>Use arrow keys or WASD to control the snake.</p>
        <p>Eat the food to grow and earn points.</p>
        <p>Avoid hitting the walls or your own tail!</p>
      </Instructions>
      
      <MobileInstructions>
        <p>Swipe up, down, left, or right to change direction.</p>
      </MobileInstructions>
      
      <Score>Score: {score}</Score>
      
      <CanvasContainer ref={containerRef}>
        <GameCanvas 
          ref={canvasRef} 
          width={canvasSize.width} 
          height={canvasSize.height} 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        
        {showWallCollision && (
          <WallCollisionMessage>
            BOUNDARY VIOLATION DETECTED!
          </WallCollisionMessage>
        )}
      </CanvasContainer>
      
      <GameControls>
        {!gameStarted ? (
          <Button onClick={startGame}>Start Game</Button>
        ) : (
          <Button onClick={resetGame}>Restart Game</Button>
        )}
      </GameControls>
    </GameContainer>
  );
};

export default Snake; 