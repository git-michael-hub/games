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
`;

const GameCanvas = styled.canvas`
  border: 2px solid #333;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  background-color: #222;
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

const Stats = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 640px;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
`;

const StatItem = styled.div`
  background-color: rgba(0, 0, 0, 0.3);
  padding: 10px 15px;
  border-radius: 4px;
  min-width: 120px;
  text-align: center;
`;

const Instructions = styled.div`
  background-color: rgba(0, 0, 0, 0.1);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  max-width: 600px;
  text-align: center;
`;

const GameOverMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  font-size: 24px;
  z-index: 10;
`;

interface GameStats {
  time: number;
  speed: number;
  distance: number;
}

const Car: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [stats, setStats] = useState<GameStats>({ time: 0, speed: 0, distance: 0 });
  
  useEffect(() => {
    // Set up event listener for game over
    const handleGameEvent = (event: Event) => {
      if (event instanceof CustomEvent) {
        if (event.detail.type === 'gameOver') {
          setGameOver(true);
        } else if (event.detail.type === 'updateStats') {
          setStats(event.detail.stats);
        }
      }
    };
    
    window.addEventListener('car-game-event', handleGameEvent);
    
    return () => {
      // Cleanup when component unmounts
      stopGame();
      window.removeEventListener('car-game-event', handleGameEvent);
    };
  }, []);
  
  const startGame = () => {
    if (canvasRef.current) {
      setGameStarted(true);
      setGameOver(false);
      setStats({ time: 0, speed: 0, distance: 0 });
      initGame(canvasRef.current);
    }
  };
  
  const resetGame = () => {
    stopGame();
    setGameOver(false);
    setStats({ time: 0, speed: 0, distance: 0 });
    
    if (canvasRef.current) {
      initGame(canvasRef.current);
    }
  };
  
  // Format time as MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <GameContainer>
      <h1>Driving Game</h1>
      
      <Instructions>
        <p>Use arrow keys or WASD to control the car.</p>
        <p>↑/W = Accelerate, ↓/S = Brake, ←/→ or A/D = Steer</p>
        <p>Stay on the track and drive as far as you can!</p>
      </Instructions>
      
      <Stats>
        <StatItem>Time: {formatTime(stats.time)}</StatItem>
        <StatItem>Speed: {stats.speed.toFixed(0)} mph</StatItem>
        <StatItem>Distance: {stats.distance.toFixed(1)} mi</StatItem>
      </Stats>
      
      <div style={{ position: 'relative' }}>
        <GameCanvas 
          ref={canvasRef} 
          width={640} 
          height={480} 
        />
        
        {gameOver && (
          <GameOverMessage>
            <h2>Game Over!</h2>
            <p>You drove {stats.distance.toFixed(1)} miles in {formatTime(stats.time)}.</p>
          </GameOverMessage>
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

export default Car; 