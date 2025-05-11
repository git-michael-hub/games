import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Wheel from './Wheel';
import Controls from './Controls';

// Types
type GameState = 'idle' | 'spinning' | 'result';
type Prize = {
  id: number;
  value: number;
  label: string;
  color: string;
};

// Styled components
const GameContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
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

const StatsContainer = styled.div`
  display: flex;
  gap: 20px;
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  span:first-child {
    font-size: 0.9rem;
    color: #ccc;
  }
  
  span:last-child {
    font-size: 1.5rem;
    color: gold;
    text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
  }
`;

const WheelContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  height: 500px;
  margin: 20px auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const WheelIndicator = styled.div`
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  background: gold;
  clip-path: polygon(50% 100%, 0 0, 100% 0);
  z-index: 10;
  filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.8));
`;

const ResultMessage = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 20px 40px;
  border-radius: 10px;
  color: gold;
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  z-index: 100;
  border: 2px solid gold;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
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

// Define wheel segments - MUST BE 12 SEGMENTS
const WHEEL_SEGMENTS: Prize[] = [
  { id: 0, value: 100, label: '$100', color: '#ff4d4d' },
  { id: 1, value: 200, label: '$200', color: '#4e54c8' },
  { id: 2, value: 50, label: '$50', color: '#4ecdc4' },
  { id: 3, value: 500, label: '$500', color: '#ffba08' },
  { id: 4, value: 0, label: 'LOSE', color: '#595959' },
  { id: 5, value: 75, label: '$75', color: '#ff9f43' },
  { id: 6, value: 250, label: '$250', color: '#f900bf' },
  { id: 7, value: 25, label: '$25', color: '#6c63ff' },
  { id: 8, value: 1000, label: '$1000', color: '#ff00ff' },
  { id: 9, value: 150, label: '$150', color: '#00bd56' },
  { id: 10, value: 10, label: '$10', color: '#ff6b6b' },
  { id: 11, value: 300, label: '$300', color: '#2ecc71' }
];

// Sound creation
const createSpinSound = () => {
  const audio = new Audio();
  audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-slot-machine-wheel-1932.mp3';
  audio.loop = true;
  return audio;
};

const createWinSound = () => {
  const audio = new Audio();
  audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-melodic-bonus-collect-1938.mp3';
  return audio;
};

const WheelOfFortune: React.FC = () => {
  // Game state
  const [gameState, setGameState] = useState<GameState>('idle');
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState<Prize | null>(null);
  const [score, setScore] = useState(0);
  
  // Audio refs
  const spinSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio
  useEffect(() => {
    spinSoundRef.current = createSpinSound();
    winSoundRef.current = createWinSound();
    
    return () => {
      if (spinSoundRef.current) {
        spinSoundRef.current.pause();
        spinSoundRef.current = null;
      }
      if (winSoundRef.current) {
        winSoundRef.current.pause();
        winSoundRef.current = null;
      }
    };
  }, []);
  
  // Handle spin button click
  const handleSpin = () => {
    // Set game state to spinning
    setGameState('spinning');
    
    // Play spinning sound
    if (spinSoundRef.current) {
      spinSoundRef.current.currentTime = 0;
      spinSoundRef.current.play().catch(e => console.error("Error playing spin sound:", e));
    }
    
    // Randomly select a segment (0-11)
    const selectedIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const segment = WHEEL_SEGMENTS[selectedIndex];
    
    // Store the selected segment
    setSelectedSegment(segment);
    
    // Calculate rotation
    // Each segment is 30 degrees (360 / 12)
    // We want the selected segment to stop at the top (indicator position)
    // Adding 5 full rotations (1800 degrees) for effect
    const rotationAmount = 1800 + (360 - (selectedIndex * 30) - 15);
    
    // Set the rotation
    setRotationDegrees(rotationAmount);
    
    // Set a timeout to show the result
    setTimeout(() => {
      // Stop the spinning sound
      if (spinSoundRef.current) {
        spinSoundRef.current.pause();
        spinSoundRef.current.currentTime = 0;
      }
      
      // Set game state to result
      setGameState('result');
      
      // Check if player won
      if (segment.value > 0) {
        // Play win sound
        if (winSoundRef.current) {
          winSoundRef.current.play().catch(e => console.error("Error playing win sound:", e));
        }
        
        // Add to score
        setScore(prevScore => prevScore + segment.value);
      }
    }, 6000); // 6 seconds
  };
  
  // Handle play again button click
  const handlePlayAgain = () => {
    setGameState('idle');
  };
  
  return (
    <GameContainer>
      <GameHeader>
        <GameTitle>Wheel of Fortune</GameTitle>
        <StatsContainer>
          <Stat>
            <span>SCORE</span>
            <span>{score}</span>
          </Stat>
        </StatsContainer>
      </GameHeader>
      
      <WheelContainer>
        <WheelIndicator />
        <Wheel 
          segments={WHEEL_SEGMENTS}
          rotation={rotationDegrees}
          isSpinning={gameState === 'spinning'}
        />
        
        {/* Result message overlay */}
        <AnimatePresence>
          {gameState === 'result' && selectedSegment && (
            <ResultMessage
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: 1,
                scale: [1, 1.1, 1],
                boxShadow: [
                  selectedSegment.value > 0 
                    ? '0 0 20px rgba(255, 215, 0, 0.7)' 
                    : '0 0 20px rgba(255, 0, 0, 0.7)',
                  selectedSegment.value > 0 
                    ? '0 0 10px rgba(255, 215, 0, 0.3)' 
                    : '0 0 10px rgba(255, 0, 0, 0.3)',
                  selectedSegment.value > 0 
                    ? '0 0 20px rgba(255, 215, 0, 0.7)' 
                    : '0 0 20px rgba(255, 0, 0, 0.7)'
                ]
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{
                duration: 0.5,
                boxShadow: { repeat: Infinity, duration: 1.5 }
              }}
              style={{
                color: selectedSegment.value > 0 ? 'gold' : '#ff4d4d',
                borderColor: selectedSegment.value > 0 ? 'gold' : '#ff4d4d'
              }}
            >
              {selectedSegment.value > 0 
                ? `You Win ${selectedSegment.value} Points!` 
                : 'You Lose!'}
            </ResultMessage>
          )}
        </AnimatePresence>
      </WheelContainer>
      
      <Controls 
        onSpin={handleSpin}
        onPlayAgain={handlePlayAgain}
        gameState={gameState}
      />
      
      {/* Vegas neon sign */}
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
        Jackpot!
      </NeonSign>
    </GameContainer>
  );
};

export default WheelOfFortune;