import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Reel from './Reel';
import Controls from './Controls';

// Slot machine symbols
export const symbols = [
  '🍒', '🍋', '🍇', '🍊', '🍉', '7️⃣', '💎', '🔔', '⭐'
];

const SlotMachineContainer = styled.div`
  background: linear-gradient(45deg, #571845 0%, #900C3F 100%);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(255, 215, 0, 0.5);
  border: 5px solid gold;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
`;

const ReelsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 20px;
  background: #000;
  padding: 20px;
  border-radius: 10px;
  border: 2px solid gold;
`;

const WinningMessage = styled(motion.div)`
  color: gold;
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin: 20px 0;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
  min-height: 60px;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.5);
  padding: 15px;
  border-radius: 10px;
  border: 2px solid rgba(255, 215, 0, 0.5);
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

// Add a Demo Mode toggle
const DemoModeToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  color: #ccc;
  font-size: 0.9rem;
  
  label {
    margin-left: 5px;
    cursor: pointer;
  }
  
  input {
    cursor: pointer;
  }
`;

// Settings container
const SettingsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 215, 0, 0.3);
`;

// Sound toggle
const SoundToggle = styled.div`
  display: flex;
  align-items: center;
  color: #ccc;
  font-size: 0.9rem;
  
  label {
    margin-left: 5px;
    cursor: pointer;
  }
  
  input {
    cursor: pointer;
  }
`;

// Create audio data
const createSpinSound = () => {
  const audio = new Audio();
  audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-slot-machine-random-wheel-1930.mp3';
  audio.loop = true;
  return audio;
};

const createWinSound = () => {
  const audio = new Audio();
  audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3';
  return audio;
};

const SlotMachine: React.FC = () => {
  const [reels, setReels] = useState<number[][]>([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ]);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [credits, setCredits] = useState<number>(100);
  const [bet, setBet] = useState<number>(1);
  const [winnings, setWinnings] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Refs for audio
  const spinSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio on component mount
  useEffect(() => {
    spinSoundRef.current = createSpinSound();
    winSoundRef.current = createWinSound();
    
    // Cleanup on unmount
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
  
  // Handle sound effects when spinning
  useEffect(() => {
    if (spinning && soundEnabled && spinSoundRef.current) {
      spinSoundRef.current.play().catch(e => console.error("Error playing spin sound:", e));
    } else if (!spinning && spinSoundRef.current) {
      spinSoundRef.current.pause();
      spinSoundRef.current.currentTime = 0;
    }
  }, [spinning, soundEnabled]);
  
  // Handle spin action
  const handleSpin = () => {
    if (spinning && !demoMode) return;
    if (credits < bet && !demoMode) {
      setMessage('Not enough credits!');
      return;
    }
    
    // Deduct bet from credits (only if not in demo mode)
    if (!demoMode) {
      setCredits(prev => prev - bet);
    }
    
    // Don't reset winnings at the start of a spin
    // Only clear the message
    setMessage('');
    setSpinning(true);
    
    // Spin each reel with different durations
    const newReels = reels.map(reel => 
      reel.map(() => Math.floor(Math.random() * symbols.length))
    );
    
    setReels(newReels);
    
    // Check for wins after spinning stops (with longer duration for visual effect)
    if (!demoMode) {
      setTimeout(() => {
        const winAmount = checkWinnings(newReels);
        
        // Play win sound if there's a win and sound is enabled
        if (winAmount > 0 && soundEnabled && winSoundRef.current) {
          winSoundRef.current.play().catch(e => console.error("Error playing win sound:", e));
        }
        
        setSpinning(false);
      }, 3000);
    }
  };
  
  // Handle demo mode toggle
  const handleDemoModeToggle = () => {
    const newDemoMode = !demoMode;
    setDemoMode(newDemoMode);
    
    if (newDemoMode) {
      setSpinning(true);
    } else {
      setSpinning(false);
    }
  };
  
  // Handle sound toggle
  const handleSoundToggle = () => {
    setSoundEnabled(!soundEnabled);
  };
  
  // Check for winning combinations
  const checkWinnings = (newReels: number[][]): number => {
    let totalWin = 0;
    
    // Check middle row
    const middleRow = [newReels[0][1], newReels[1][1], newReels[2][1]];
    if (middleRow[0] === middleRow[1] && middleRow[1] === middleRow[2]) {
      // Special multipliers for certain symbols
      let multiplier = middleRow[0] === 5 ? 10 : // 7 symbol
                        middleRow[0] === 6 ? 15 : // Diamond symbol
                        5; // Other symbols
      totalWin += bet * multiplier;
      setMessage(`Winner! 3 ${symbols[middleRow[0]]} in a row!`);
    }
    
    // Check top row
    const topRow = [newReels[0][0], newReels[1][0], newReels[2][0]];
    if (topRow[0] === topRow[1] && topRow[1] === topRow[2]) {
      let multiplier = topRow[0] === 5 ? 10 : 
                       topRow[0] === 6 ? 15 : 
                       5;
      totalWin += bet * multiplier;
      setMessage(prev => prev ? `${prev} And top row!` : `Winner! 3 ${symbols[topRow[0]]} on top!`);
    }
    
    // Check bottom row
    const bottomRow = [newReels[0][2], newReels[1][2], newReels[2][2]];
    if (bottomRow[0] === bottomRow[1] && bottomRow[1] === bottomRow[2]) {
      let multiplier = bottomRow[0] === 5 ? 10 : 
                        bottomRow[0] === 6 ? 15 : 
                        5;
      totalWin += bet * multiplier;
      setMessage(prev => prev ? `${prev} And bottom row!` : `Winner! 3 ${symbols[bottomRow[0]]} on bottom!`);
    }
    
    // Update credits and winnings if there's a win
    if (totalWin > 0) {
      setWinnings(prev => prev + totalWin);
      setCredits(prev => prev + totalWin);
    } else {
      setMessage(bet > 5 ? 'Almost! Try again!' : 'No win. Spin again!');
    }
    
    return totalWin;
  };
  
  // Handle bet changes
  const handleBetChange = (amount: number) => {
    if (!spinning || demoMode) {
      const newBet = Math.max(1, Math.min(10, bet + amount));
      setBet(newBet);
    }
  };
  
  return (
    <SlotMachineContainer>
      <StatsContainer>
        <Stat>
          <span>CREDITS</span>
          <span>{credits}</span>
        </Stat>
        <Stat>
          <span>BET</span>
          <span>{bet}</span>
        </Stat>
        <Stat>
          <span>WIN</span>
          <span>{winnings}</span>
        </Stat>
      </StatsContainer>
      
      <ReelsContainer>
        {reels.map((reel, i) => (
          <Reel 
            key={i} 
            symbols={reel.map(index => symbols[index])} 
            spinning={spinning} 
            delay={i * 0.2} 
          />
        ))}
      </ReelsContainer>
      
      <WinningMessage
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: message ? 1 : 0,
          scale: message ? [1, 1.1, 1] : 1
        }}
        transition={{ duration: 0.5 }}
      >
        {message}
      </WinningMessage>
      
      <Controls 
        onSpin={handleSpin} 
        onBetChange={handleBetChange}
        spinning={spinning && !demoMode}
        bet={bet}
      />
      
      <SettingsContainer>
        <DemoModeToggle>
          <input 
            type="checkbox" 
            id="demoMode" 
            checked={demoMode} 
            onChange={handleDemoModeToggle} 
          />
          <label htmlFor="demoMode">Demo Mode (Continuous Spinning)</label>
        </DemoModeToggle>
        
        <SoundToggle>
          <input 
            type="checkbox" 
            id="soundToggle" 
            checked={soundEnabled} 
            onChange={handleSoundToggle} 
          />
          <label htmlFor="soundToggle">Sound Effects</label>
        </SoundToggle>
      </SettingsContainer>
    </SlotMachineContainer>
  );
};

export default SlotMachine; 