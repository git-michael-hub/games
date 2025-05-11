import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { initGame, stopGame } from './gameEngine';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const GameCanvas = styled.canvas`
  border: 2px solid #333;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  background-color: #f7f7f7;
  margin-bottom: 20px;
  image-rendering: pixelated;
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

const Instructions = styled.div`
  background-color: rgba(0, 0, 0, 0.1);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  max-width: 600px;
  text-align: center;
`;

const AngryBird: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      stopGame();
    };
  }, []);
  
  const startGame = () => {
    if (canvasRef.current) {
      setGameStarted(true);
      initGame(canvasRef.current);
    }
  };
  
  const resetGame = () => {
    stopGame();
    startGame();
  };

  return (
    <GameContainer>
      <h1>Angry Bird Game</h1>
      
      <Instructions>
        <p>Click or press Spacebar to make the bird fly and avoid obstacles.</p>
        <p>Try to go as far as possible without hitting pipes or the ground!</p>
      </Instructions>
      
      <GameCanvas 
        ref={canvasRef} 
        width={320} 
        height={480} 
      />
      
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

export default AngryBird; 