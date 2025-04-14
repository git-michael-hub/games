import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import LottoTicket from './LottoTicket';
import Controls from './Controls';
import BallDraw from './BallDraw';
import PrizeTiers from './PrizeTiers';

const LottoContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #09203f 0%, #537895 100%);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  color: white;
  font-family: 'Arial', sans-serif;
  position: relative;
  overflow: hidden;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin: 0;
  background: linear-gradient(to right, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #AAA;
  margin: 5px 0 20px 0;
`;

const GameArea = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LeftPanel = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
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
    color: #FFD700;
    text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
  }
`;

const WinMessage = styled(motion.div)`
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
  z-index: 10;
`;

const WinText = styled(motion.h2)`
  font-size: 4rem;
  color: #FFD700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
  margin: 0;
`;

const WinAmount = styled(motion.div)`
  font-size: 3rem;
  color: white;
  margin: 20px 0;
`;

const PlayAgainButton = styled(motion.button)`
  background: linear-gradient(45deg, #FFD700, #FFA500);
  color: #000;
  border: none;
  padding: 15px 30px;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  margin-top: 20px;
  box-shadow: 0 5px 15px rgba(255, 215, 0, 0.5);
`;

const Confetti = styled(motion.div)`
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.color || '#FFD700'};
`;

// Vegas-style neon sign effect
const NeonEffect = styled(motion.div)`
  position: absolute;
  top: 10px;
  right: 10px;
  color: #fff;
  text-shadow: 
    0 0 5px #fff,
    0 0 10px #fff,
    0 0 15px #0073e6,
    0 0 20px #0073e6,
    0 0 25px #0073e6,
    0 0 30px #0073e6,
    0 0 35px #0073e6;
  font-size: 1.5rem;
  font-style: italic;
`;

// Create confetti for win animation
const createConfetti = (count: number) => {
  const confetti = [];
  const colors = ['#FFD700', '#FFA500', '#FF4500', '#8A2BE2', '#00BFFF', '#32CD32'];
  
  for (let i = 0; i < count; i++) {
    confetti.push({
      id: i,
      x: Math.random() * 100,
      y: -10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 5,
      velocity: Math.random() * 3 + 1
    });
  }
  
  return confetti;
};

const Lotto: React.FC = () => {
  const [credits, setCredits] = useState<number>(100);
  const [ticketPrice, setTicketPrice] = useState<number>(5);
  const [tickets, setTickets] = useState<number[][]>([]);
  const [maxTickets, setMaxTickets] = useState<number>(5);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [gameState, setGameState] = useState<'idle' | 'selecting' | 'drawing' | 'complete'>('idle');
  const [winnings, setWinnings] = useState<number>(0);
  const [confetti, setConfetti] = useState<any[]>([]);
  const [showWinMessage, setShowWinMessage] = useState<boolean>(false);
  
  // Sound effects
  const drawSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio
  useEffect(() => {
    drawSoundRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-slot-machine-random-wheel-1930.mp3');
    winSoundRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
    
    return () => {
      if (drawSoundRef.current) drawSoundRef.current = null;
      if (winSoundRef.current) winSoundRef.current = null;
    };
  }, []);
  
  // Handle number selection
  const handleNumberSelection = (number: number) => {
    if (gameState !== 'selecting') return;
    
    if (selectedNumbers.includes(number)) {
      // Remove number if already selected
      setSelectedNumbers(prev => prev.filter(n => n !== number));
    } else if (selectedNumbers.length < 6) {
      // Add number if not at max selections
      setSelectedNumbers(prev => [...prev, number]);
    }
  };
  
  // Create a new ticket with selected numbers
  const createTicket = () => {
    if (selectedNumbers.length !== 6 || credits < ticketPrice) return;
    
    // Create a sorted ticket
    const newTicket = [...selectedNumbers].sort((a, b) => a - b);
    
    // Add to tickets
    setTickets(prev => [...prev, newTicket]);
    
    // Deduct credits
    setCredits(prev => prev - ticketPrice);
    
    // Reset selection
    setSelectedNumbers([]);
    
    // If at max tickets, transition to drawing state
    if (tickets.length + 1 >= maxTickets) {
      setGameState('drawing');
    }
  };
  
  // Start the game
  const startGame = () => {
    if (credits < ticketPrice) return;
    
    setGameState('selecting');
    setSelectedNumbers([]);
    setDrawnNumbers([]);
    setTickets([]);
    setWinnings(0);
    setShowWinMessage(false);
  };
  
  // Draw the winning numbers
  const drawNumbers = () => {
    if (tickets.length === 0) return;
    
    setIsDrawing(true);
    setGameState('drawing');
    
    // Play draw sound
    if (drawSoundRef.current) {
      drawSoundRef.current.play().catch(e => console.error('Error playing sound:', e));
    }
    
    // Clear any existing drawn numbers
    setDrawnNumbers([]);
    
    // Numbers 1-49
    const numbers = Array.from({ length: 49 }, (_, i) => i + 1);
    const winningNumbers: number[] = [];
    
    // Draw 6 random numbers
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const index = Math.floor(Math.random() * numbers.length);
        const drawnNumber = numbers[index];
        
        // Remove from pool of numbers
        numbers.splice(index, 1);
        
        // Add to drawn numbers
        setDrawnNumbers(prev => [...prev, drawnNumber]);
        
        // If last number, check for winners
        if (i === 5) {
          setTimeout(() => {
            setIsDrawing(false);
            checkWinners([...winningNumbers, drawnNumber]);
          }, 1000);
        }
        
        // Add to winning numbers array
        winningNumbers.push(drawnNumber);
      }, i * 2000); // Draw a new number every 2 seconds
    }
  };
  
  // Check for winning tickets
  const checkWinners = (winningNumbers: number[]) => {
    let totalWinnings = 0;
    
    // Check each ticket
    tickets.forEach(ticket => {
      // Count matching numbers
      const matches = ticket.filter(num => winningNumbers.includes(num)).length;
      
      // Calculate winnings based on matches
      let ticketWinnings = 0;
      switch (matches) {
        case 3:
          ticketWinnings = ticketPrice * 5;
          break;
        case 4:
          ticketWinnings = ticketPrice * 20;
          break;
        case 5:
          ticketWinnings = ticketPrice * 200;
          break;
        case 6:
          ticketWinnings = ticketPrice * 5000;
          break;
        default:
          ticketWinnings = 0;
      }
      
      totalWinnings += ticketWinnings;
    });
    
    setWinnings(totalWinnings);
    setCredits(prev => prev + totalWinnings);
    
    // If won anything, show win message and play sound
    if (totalWinnings > 0) {
      // Play win sound
      if (winSoundRef.current) {
        winSoundRef.current.play().catch(e => console.error('Error playing sound:', e));
      }
      
      // Show win message
      setShowWinMessage(true);
      
      // Create confetti animation
      setConfetti(createConfetti(100));
    }
    
    setGameState('complete');
  };
  
  // Play again
  const playAgain = () => {
    setShowWinMessage(false);
    setGameState('idle');
    setTickets([]);
    setSelectedNumbers([]);
    setDrawnNumbers([]);
  };
  
  // Quick pick (random selection)
  const quickPick = () => {
    if (gameState !== 'selecting' || credits < ticketPrice) return;
    
    const numbers = Array.from({ length: 49 }, (_, i) => i + 1);
    const picked: number[] = [];
    
    // Pick 6 random numbers
    for (let i = 0; i < 6; i++) {
      const index = Math.floor(Math.random() * numbers.length);
      picked.push(numbers[index]);
      numbers.splice(index, 1);
    }
    
    // Set as selected
    setSelectedNumbers(picked);
  };
  
  return (
    <LottoContainer>
      <NeonEffect
        animate={{ 
          opacity: [1, 0.8, 1], 
          textShadow: [
            '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0073e6, 0 0 20px #0073e6, 0 0 25px #0073e6, 0 0 30px #0073e6, 0 0 35px #0073e6',
            '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #FFA500, 0 0 20px #FFA500, 0 0 25px #FFA500, 0 0 30px #FFA500, 0 0 35px #FFA500',
            '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0073e6, 0 0 20px #0073e6, 0 0 25px #0073e6, 0 0 30px #0073e6, 0 0 35px #0073e6'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        VEGAS LOTTO
      </NeonEffect>
      
      <Header>
        <Title>LOTTO DRAW</Title>
        <Subtitle>Pick 6 numbers from 1-49 and win big!</Subtitle>
      </Header>
      
      <StatsContainer>
        <Stat>
          <span>CREDITS</span>
          <span>{credits}</span>
        </Stat>
        <Stat>
          <span>TICKET PRICE</span>
          <span>${ticketPrice}</span>
        </Stat>
        <Stat>
          <span>WINNINGS</span>
          <span>${winnings}</span>
        </Stat>
      </StatsContainer>
      
      <GameArea>
        <LeftPanel>
          {/* Drawn balls display */}
          <BallDraw 
            drawnNumbers={drawnNumbers} 
            isDrawing={isDrawing} 
          />
          
          {/* Ticket selection */}
          <LottoTicket 
            selectedNumbers={selectedNumbers} 
            onNumberSelection={handleNumberSelection}
            enabled={gameState === 'selecting'}
          />
        </LeftPanel>
        
        <RightPanel>
          {/* Current tickets */}
          <div>
            <h3>Your Tickets:</h3>
            {tickets.map((ticket, index) => (
              <div key={index} style={{ 
                background: 'rgba(0,0,0,0.3)', 
                padding: '10px', 
                borderRadius: '5px', 
                marginBottom: '10px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '5px'
              }}>
                {ticket.map(num => (
                  <motion.div 
                    key={num}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: drawnNumbers.includes(num) ? '#FFD700' : '#333',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}
                    animate={drawnNumbers.includes(num) ? {
                      scale: [1, 1.2, 1],
                      backgroundColor: ['#333', '#FFD700', '#FFD700']
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {num}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Prize tiers */}
          <PrizeTiers ticketPrice={ticketPrice} />
        </RightPanel>
      </GameArea>
      
      {/* Game controls */}
      <Controls 
        gameState={gameState}
        onStartGame={startGame}
        onCreateTicket={createTicket}
        onDrawNumbers={drawNumbers}
        onPlayAgain={playAgain}
        onQuickPick={quickPick}
        credits={credits}
        ticketPrice={ticketPrice}
        selectedNumbers={selectedNumbers}
        ticketsCount={tickets.length}
        maxTickets={maxTickets}
      />
      
      {/* Win message overlay */}
      <AnimatePresence>
        {showWinMessage && (
          <WinMessage
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {confetti.map(conf => (
              <Confetti 
                key={conf.id}
                color={conf.color}
                initial={{ x: `${conf.x}vw`, y: -10, width: conf.size, height: conf.size }}
                animate={{ y: '100vh' }}
                transition={{ 
                  duration: conf.velocity,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
            
            <WinText
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ type: 'spring', duration: 0.8 }}
            >
              YOU WON!
            </WinText>
            
            <WinAmount
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              ${winnings}
            </WinAmount>
            
            <PlayAgainButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={playAgain}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              PLAY AGAIN
            </PlayAgainButton>
          </WinMessage>
        )}
      </AnimatePresence>
    </LottoContainer>
  );
};

export default Lotto; 