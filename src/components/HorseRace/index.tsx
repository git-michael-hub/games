import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, useAnimation } from 'framer-motion';
import Horse from './Horse';
import RaceControls from './RaceControls';

// Horse data with names, colors and base speeds
const HORSES = [
  { id: 1, name: 'Thunder Bolt', color: '#C50F0F', baseSpeed: 0.95, odds: 3.5 },
  { id: 2, name: 'Silver Arrow', color: '#A9A9A9', baseSpeed: 0.9, odds: 5.0 },
  { id: 3, name: 'Golden Star', color: '#FFD700', baseSpeed: 0.93, odds: 4.0 },
  { id: 4, name: 'Midnight Run', color: '#000080', baseSpeed: 0.88, odds: 6.0 },
  { id: 5, name: 'Lucky Charm', color: '#006400', baseSpeed: 0.86, odds: 8.0 },
  { id: 6, name: 'Royal Flush', color: '#800080', baseSpeed: 0.85, odds: 10.0 },
];

const RaceContainer = styled.div`
  background: linear-gradient(45deg, #571845 0%, #900C3F 100%);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(255, 215, 0, 0.5);
  border: 5px solid gold;
  max-width: 900px;
  width: 100%;
  position: relative;
  overflow: hidden;
`;

const RaceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: gold;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
  margin: 0;
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

const TrackContainer = styled.div`
  background: #2c3e50;
  border-radius: 10px;
  border: 2px solid #34495e;
  padding: 10px;
  margin-bottom: 20px;
  overflow: hidden;
  position: relative;
`;

const Track = styled.div`
  background: #3a4a5d;
  width: 100%;
  padding: 10px 0;
  position: relative;
  min-height: 400px;
`;

const FinishLine = styled.div`
  position: absolute;
  right: 5%;
  top: 0;
  bottom: 0;
  width: 10px;
  background: repeating-linear-gradient(
    to bottom,
    black,
    black 20px,
    white 20px,
    white 40px
  );
  z-index: 2;
`;

const StartLine = styled.div`
  position: absolute;
  left: 5%;
  top: 0;
  bottom: 0;
  width: 5px;
  background: white;
  z-index: 2;
`;

const LaneMarker = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
  z-index: 1;
`;

const RaceStatus = styled(motion.div)`
  color: gold;
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin: 20px 0;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
  min-height: 60px;
`;

// Create audio data
const createRaceSound = () => {
  const audio = new Audio();
  audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-cartoon-cowbell-and-crickets-922.mp3';
  audio.loop = true;
  return audio;
};

const createWinSound = () => {
  const audio = new Audio();
  audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3';
  return audio;
};

const createStartSound = () => {
  const audio = new Audio();
  audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-stadium-horn-triple-blow-378.mp3';
  return audio;
};

const HorseRace: React.FC = () => {
  const [credits, setCredits] = useState<number>(100);
  const [betAmount, setBetAmount] = useState<number>(5);
  const [selectedHorse, setSelectedHorse] = useState<number | null>(null);
  const [raceStatus, setRaceStatus] = useState<string>('');
  const [winnings, setWinnings] = useState<number>(0);
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [raceFinished, setRaceFinished] = useState<boolean>(false);
  const [raceResults, setRaceResults] = useState<number[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Refs for audio
  const raceSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Animation controls for each horse
  const horse1Control = useAnimation();
  const horse2Control = useAnimation();
  const horse3Control = useAnimation();
  const horse4Control = useAnimation();
  const horse5Control = useAnimation();
  const horse6Control = useAnimation();
  
  // Create array from the individual controls
  const horseAnimControls = [
    horse1Control,
    horse2Control,
    horse3Control,
    horse4Control,
    horse5Control,
    horse6Control
  ];
  
  // Initialize audio on component mount
  useEffect(() => {
    raceSoundRef.current = createRaceSound();
    winSoundRef.current = createWinSound();
    startSoundRef.current = createStartSound();
    
    // Cleanup on unmount
    return () => {
      if (raceSoundRef.current) {
        raceSoundRef.current.pause();
        raceSoundRef.current = null;
      }
      if (winSoundRef.current) {
        winSoundRef.current.pause();
        winSoundRef.current = null;
      }
      if (startSoundRef.current) {
        startSoundRef.current.pause();
        startSoundRef.current = null;
      }
    };
  }, []);
  
  // Handle sound effects when racing
  useEffect(() => {
    if (isRacing && soundEnabled && raceSoundRef.current) {
      raceSoundRef.current.play().catch(e => console.error("Error playing race sound:", e));
    } else if (!isRacing && raceSoundRef.current) {
      raceSoundRef.current.pause();
      raceSoundRef.current.currentTime = 0;
    }
  }, [isRacing, soundEnabled]);
  
  // Function to calculate random variations to make the race less predictable
  const calculateRaceVariation = (): number[] => {
    return HORSES.map(horse => {
      // Random variation between 0.7 and 1.2
      const variation = 0.7 + Math.random() * 0.5;
      return horse.baseSpeed * variation;
    });
  };
  
  // Start the race
  const startRace = () => {
    if (isRacing) return;
    if (!selectedHorse) {
      setRaceStatus('Select a horse first!');
      return;
    }
    if (credits < betAmount) {
      setRaceStatus('Not enough credits!');
      return;
    }
    
    // Deduct bet from credits
    setCredits(prev => prev - betAmount);
    setRaceStatus('And they\'re off!');
    setIsRacing(true);
    setRaceFinished(false);
    setRaceResults([]);
    
    // Play start sound
    if (soundEnabled && startSoundRef.current) {
      startSoundRef.current.play().catch(e => console.error("Error playing start sound:", e));
    }
    
    // Calculate speed variations for each horse
    const speedVariations = calculateRaceVariation();
    
    // Prepare finish order based on calculated speeds
    const finishTimes = speedVariations.map((speed, index) => ({
      id: HORSES[index].id,
      time: 4 + (1 - speed) * 6
    }));
    
    // Sort by fastest time
    const sortedResults = [...finishTimes].sort((a, b) => a.time - b.time);
    const resultIds = sortedResults.map(result => result.id);
    
    // Animate each horse
    HORSES.forEach((horse, index) => {
      const speedMultiplier = speedVariations[index];
      const totalTime = finishTimes[index].time;
      
      // Find the horse's position in the results
      const finishPosition = resultIds.indexOf(horse.id);
      
      // Add some "personality" and race dynamics based on finish position
      const raceStyle = finishPosition < 2 ? 
        // Leading horses: Strong start, potential sprint finish
        { startSpeed: 0.7 + Math.random() * 0.2, midSpeed: 0.5 + Math.random() * 0.2, endSprint: true } :
        finishPosition < 4 ?
        // Middle pack: Average pace, may challenge
        { startSpeed: 0.5 + Math.random() * 0.3, midSpeed: 0.6 + Math.random() * 0.3, endSprint: Math.random() > 0.5 } :
        // Trailing horses: Slower, inconsistent
        { startSpeed: 0.4 + Math.random() * 0.2, midSpeed: 0.4 + Math.random() * 0.4, endSprint: false };
        
      // Create keyframes for more dynamic race path
      // The x progress is carefully calculated to represent the actual race positions
      const xProgress = [
        '0%',                                 // Starting position
        `${10 + raceStyle.startSpeed * 15}%`, // Initial burst
        `${30 + raceStyle.midSpeed * 25}%`,   // Mid-race position
        `${65 - (finishPosition * 3)}%`,      // Approaching final stretch (position affecting)
        '80%'                                 // Final push to finish line
      ];
      
      // Generate more natural, dynamic y-movement
      // More erratic for trailing horses, smoother for leaders
      const yVariation = (finishPosition < 2) ? 4 : (finishPosition < 4) ? 6 : 8;
      const yValues = [
        0,
        Math.random() * yVariation - yVariation/2,
        Math.random() * yVariation - yVariation/2,
        Math.random() * yVariation - yVariation/2,
        0
      ];
      
      // Create a timing distribution that represents racing dynamics
      // Leaders accelerate more consistently, trailers have more varied pacing
      const timingDistribution = [
        0,
        0.2 + (finishPosition * 0.02),                 // Adjusted start timing
        0.5 + (Math.random() * 0.1 - 0.05),            // Mid-race with slight variation
        0.8 - (raceStyle.endSprint ? 0.05 : 0),        // Approaching finish
        1                                               // Finish line
      ];
      
      // Enhanced animation with more natural movement and race dynamics
      horseAnimControls[index].start({
        x: xProgress,
        y: yValues,
        transition: {
          duration: totalTime,
          times: timingDistribution,
          ease: raceStyle.endSprint ? 
            [0.35, 0.03, 0.15, 0.85] :  // Horses with end sprint have a sharper finish
            [0.43, 0.13, 0.23, 0.96],   // Regular horses have more consistent pace
          
          // Add some additional nuance to horizontal movement
          x: {
            duration: totalTime,
            times: timingDistribution,
            ease: finishPosition < 2 ? 
              [0.25, 0.1, 0.25, 1] :     // Leaders: more controlled
              [0.42, 0.0, 0.58, 1]       // Others: less consistent
          },
          
          // Make vertical movement repeating for a gallop effect with varied frequency
          y: {
            repeat: 8 + Math.floor(Math.random() * 3), // Variable bounce frequency
            repeatType: "mirror",
            duration: totalTime / (7 + Math.random()),
            ease: "easeInOut"
          }
        }
      });
    });
    
    // Wait for the race to finish
    const maxTime = Math.max(...finishTimes.map(t => t.time)) + 0.5;
    
    setTimeout(() => {
      setRaceFinished(true);
      setRaceResults(resultIds);
      
      // Check if selected horse has won
      const winnerHorse = resultIds[0];
      const selectedHorsePosition = resultIds.indexOf(selectedHorse);
      
      if (selectedHorse === winnerHorse) {
        const odds = HORSES.find(h => h.id === selectedHorse)?.odds || 2;
        const winAmount = Math.round(betAmount * odds);
        setWinnings(prev => prev + winAmount);
        setCredits(prev => prev + winAmount);
        setRaceStatus(`Your horse won! You won ${winAmount} credits!`);
        
        // Play win sound
        if (soundEnabled && winSoundRef.current) {
          winSoundRef.current.play().catch(e => console.error("Error playing win sound:", e));
        }
      } else if (selectedHorsePosition === 1) {
        // Second place returns half the bet
        const winAmount = Math.ceil(betAmount / 2);
        setWinnings(prev => prev + winAmount);
        setCredits(prev => prev + winAmount);
        setRaceStatus(`Your horse finished 2nd! You won ${winAmount} credits.`);
      } else {
        setRaceStatus(`Your horse finished ${selectedHorsePosition + 1}${getOrdinalSuffix(selectedHorsePosition + 1)}. Better luck next time!`);
      }
      
      setIsRacing(false);
    }, maxTime * 1000);
  };
  
  // Helper to get ordinal suffix for numbers
  const getOrdinalSuffix = (i: number): string => {
    const j = i % 10;
    const k = i % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };
  
  // Handle bet amount changes
  const handleBetChange = (amount: number) => {
    if (!isRacing) {
      const newBet = Math.max(1, Math.min(50, betAmount + amount));
      setBetAmount(newBet);
    }
  };
  
  // Handle horse selection
  const handleHorseSelection = (horseId: number) => {
    if (!isRacing) {
      setSelectedHorse(horseId);
    }
  };
  
  // Handle sound toggle
  const handleSoundToggle = () => {
    setSoundEnabled(!soundEnabled);
  };
  
  return (
    <RaceContainer>
      <RaceHeader>
        <Title>Vegas Horse Racing</Title>
        <StatsContainer>
          <Stat>
            <span>CREDITS</span>
            <span>{credits}</span>
          </Stat>
          <Stat>
            <span>BET</span>
            <span>{betAmount}</span>
          </Stat>
          <Stat>
            <span>WIN</span>
            <span>{winnings}</span>
          </Stat>
        </StatsContainer>
      </RaceHeader>
      
      <TrackContainer>
        <Track>
          <StartLine />
          <FinishLine />
          
          {/* Lane markers */}
          {HORSES.map((_, index) => (
            <LaneMarker key={`lane-${index}`} style={{ top: `${(index + 1) * (100 / (HORSES.length + 1))}%` }} />
          ))}
          
          {/* Horses */}
          {HORSES.map((horse, index) => (
            <Horse
              key={horse.id}
              horse={horse}
              position={index}
              selected={horse.id === selectedHorse}
              onSelect={() => handleHorseSelection(horse.id)}
              animate={horseAnimControls[index]}
              isRacing={isRacing}
              finished={raceFinished}
              finishPosition={raceResults.indexOf(horse.id) + 1}
              totalHorses={HORSES.length}
            />
          ))}
        </Track>
      </TrackContainer>
      
      <RaceStatus
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: raceStatus ? 1 : 0,
          scale: raceStatus ? [1, 1.1, 1] : 1
        }}
        transition={{ duration: 0.5 }}
      >
        {raceStatus}
      </RaceStatus>
      
      <RaceControls
        onStart={startRace}
        onBetChange={handleBetChange}
        betAmount={betAmount}
        isRacing={isRacing}
        selectedHorse={selectedHorse}
        soundEnabled={soundEnabled}
        onSoundToggle={handleSoundToggle}
      />
    </RaceContainer>
  );
};

export default HorseRace; 