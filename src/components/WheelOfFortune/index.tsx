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
  probability: number;
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

// Define wheel segments
const PRIZES: Prize[] = [
  { id: 1, value: 100, label: '$100', color: '#ff4d4d', probability: 5 },
  { id: 2, value: 200, label: '$200', color: '#4e54c8', probability: 5 },
  { id: 3, value: 50, label: '$50', color: '#4ecdc4', probability: 10 },
  { id: 4, value: 500, label: '$500', color: '#ffba08', probability: 2 },
  { id: 5, value: -1, label: 'LOSE', color: '#595959', probability: 15 },
  { id: 6, value: 75, label: '$75', color: '#ff9f43', probability: 10 },
  { id: 7, value: 250, label: '$250', color: '#f900bf', probability: 5 },
  { id: 8, value: 25, label: '$25', color: '#6c63ff', probability: 15 },
  { id: 9, value: 1000, label: '$1000', color: '#ff00ff', probability: 1 },
  { id: 10, value: 150, label: '$150', color: '#00bd56', probability: 5 },
  { id: 11, value: 10, label: '$10', color: '#ff6b6b', probability: 20 },
  { id: 12, value: 300, label: '$300', color: '#2ecc71', probability: 3 }
];

// Calculate segments
const calculateSegmentDegree = () => {
  return 360 / PRIZES.length;
};

// Create a weighted random function to select a prize
const selectWeightedPrize = () => {
  const totalProbability = PRIZES.reduce((sum, prize) => sum + prize.probability, 0);
  let random = Math.floor(Math.random() * totalProbability);
  
  for (const prize of PRIZES) {
    random -= prize.probability;
    if (random < 0) {
      return prize;
    }
  }
  
  // Fallback
  return PRIZES[0];
};

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
  const [prize, setPrize] = useState<Prize | null>(null);
  const [balance, setBalance] = useState(1000);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [betAmount, setBetAmount] = useState(50);
  const [isFirstSpin, setIsFirstSpin] = useState(true);
  
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
  
  // Handle spinning animation
  const spinWheel = () => {
    // Check if player has enough balance
    if (balance < betAmount) {
      alert('Not enough credits to place bet!');
      return;
    }
    
    // Deduct bet from balance
    setBalance(prev => prev - betAmount);
    
    // Set to spinning state
    setGameState('spinning');
    
    // Play spin sound
    if (spinSoundRef.current) {
      spinSoundRef.current.currentTime = 0;
      spinSoundRef.current.play().catch(e => console.error("Error playing spin sound:", e));
    }
    
    // Determine the winning prize
    const selectedPrize = selectWeightedPrize();
    setPrize(selectedPrize);
    
    // Calculate the stopping position
    const segmentDegree = calculateSegmentDegree();
    const prizeIndex = PRIZES.findIndex(p => p.id === selectedPrize.id);
    
    // Make sure the LOSE segment is properly identified
    console.log('Selected prize index:', prizeIndex, 'Prize:', selectedPrize.label, 'Value:', selectedPrize.value);
    
    const baseRotation = 1800; // 5 full rotations 
    
    // Add a random offset so it doesn't always point to the exact middle
    const randomOffset = Math.random() * (segmentDegree * 0.7) - (segmentDegree * 0.35);
    const targetRotation = baseRotation + (360 - ((prizeIndex * segmentDegree) + randomOffset));
    
    // Animate the wheel
    setRotationDegrees(targetRotation);
    
    // Determine spin duration based on whether it's the first spin
    const spinDuration = isFirstSpin ? 8000 : 3000;
    
    // Show result after spinning
    setTimeout(() => {
      setGameState('result');
      
      // Play win sound if it's a win (value > 0)
      if (selectedPrize.value > 0 && winSoundRef.current) {
        winSoundRef.current.play().catch(e => console.error("Error playing win sound:", e));
      }
      
      // If it's a win, add to balance
      if (selectedPrize.value > 0) {
        const winnings = selectedPrize.value * (betAmount / 50); // Scale winnings based on bet
        setBalance(prev => prev + winnings);
        setTotalWinnings(prev => prev + winnings);
      }
      
      // Stop spin sound
      if (spinSoundRef.current) {
        spinSoundRef.current.pause();
        spinSoundRef.current.currentTime = 0;
      }
      
      // Set isFirstSpin to false after the first spin
      if (isFirstSpin) {
        setIsFirstSpin(false);
      }
    }, spinDuration);
  };
  
  // Reset for new game
  const resetGame = () => {
    setGameState('idle');
    setPrize(null);
  };
  
  // Handle bet amount changes
  const handleBetChange = (amount: number) => {
    if (gameState !== 'idle') return;
    
    const newBet = Math.max(10, Math.min(500, betAmount + amount));
    setBetAmount(newBet);
  };
  
  return (
    <GameContainer>
      <GameHeader>
        <GameTitle>Wheel of Fortune</GameTitle>
        <StatsContainer>
          <Stat>
            <span>CREDITS</span>
            <span>{balance}</span>
          </Stat>
          <Stat>
            <span>BET</span>
            <span>{betAmount}</span>
          </Stat>
          <Stat>
            <span>WINNINGS</span>
            <span>{totalWinnings}</span>
          </Stat>
        </StatsContainer>
      </GameHeader>
      
      <WheelContainer>
        <WheelIndicator />
        <Wheel 
          segments={PRIZES}
          rotation={rotationDegrees}
          isSpinning={gameState === 'spinning'}
          isFirstSpin={isFirstSpin}
        />
        
        {/* Result message overlay */}
        <AnimatePresence>
          {gameState === 'result' && prize && (
            <ResultMessage
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: 1,
                scale: [1, 1.1, 1],
                boxShadow: [
                  prize.value > 0 ? '0 0 20px rgba(255, 215, 0, 0.7)' : '0 0 20px rgba(255, 0, 0, 0.7)',
                  prize.value > 0 ? '0 0 10px rgba(255, 215, 0, 0.3)' : '0 0 10px rgba(255, 0, 0, 0.3)',
                  prize.value > 0 ? '0 0 20px rgba(255, 215, 0, 0.7)' : '0 0 20px rgba(255, 0, 0, 0.7)'
                ]
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{
                duration: 0.5,
                boxShadow: { repeat: Infinity, duration: 1.5 }
              }}
              style={{
                color: prize.value > 0 ? 'gold' : '#ff4d4d', // Red color for lose message
                borderColor: prize.value > 0 ? 'gold' : '#ff4d4d' // Red border for lose message
              }}
            >
              {prize.value > 0 ? `You Win ${prize.label}!` : 'You Lose!'}
            </ResultMessage>
          )}
        </AnimatePresence>
      </WheelContainer>
      
      <Controls 
        onSpin={spinWheel}
        onPlayAgain={resetGame}
        onChangeBet={handleBetChange}
        gameState={gameState}
        betAmount={betAmount}
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