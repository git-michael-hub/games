import React, { useEffect, useRef, useState } from 'react';
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
`;

const GameCanvas = styled.canvas`
  border: 2px solid #333;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  background-color: #f0f0f0;
  margin-bottom: 20px;
`;

const GameControls = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
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
`;

const Score = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const Instructions = styled.div`
  background-color: rgba(0, 0, 0, 0.1);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  max-width: 600px;
  text-align: center;
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
`;

const Snake: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [showWallCollision, setShowWallCollision] = useState(false);
  
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

  return (
    <GameContainer>
      <h1>Snake Game</h1>
      
      <Instructions>
        <p>Use arrow keys or WASD to control the snake.</p>
        <p>Eat the food to grow and earn points.</p>
        <p>Avoid hitting the walls or your own tail!</p>
      </Instructions>
      
      <Score>Score: {score}</Score>
      
      <div style={{ position: 'relative' }}>
        <GameCanvas 
          ref={canvasRef} 
          width={400} 
          height={400} 
        />
        
        {showWallCollision && (
          <WallCollisionMessage>
            BOUNDARY VIOLATION DETECTED!
          </WallCollisionMessage>
        )}
      </div>
      
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