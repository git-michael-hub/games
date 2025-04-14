import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface BallDrawProps {
  drawnNumbers: number[];
  isDrawing: boolean;
}

const DrawMachine = styled.div`
  background: linear-gradient(145deg, #0f0f1f, #1a1a2e);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
`;

const DrawTitle = styled.h3`
  color: #FFD700;
  margin-top: 0;
  margin-bottom: 15px;
  text-align: center;
  font-size: 1.5rem;
`;

const BallsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  min-height: 100px;
  padding: 10px;
  
  @media (max-width: 600px) {
    gap: 8px;
  }
`;

const BallSlot = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 600px) {
    width: 45px;
    height: 45px;
  }
`;

const Ball = styled(motion.div)<{ $ballColor: string }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
  background: ${props => props.$ballColor};
  color: #000;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 5px;
    left: 10px;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.7);
  }
  
  @media (max-width: 600px) {
    width: 45px;
    height: 45px;
    font-size: 1.2rem;
  }
`;

const MachineBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  overflow: hidden;
`;

const Bubble = styled(motion.div)<{ $size: number; $x: number; $delay: number }>`
  position: absolute;
  bottom: -20px;
  left: ${props => props.$x}%;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
`;

// Get a color based on a number
const getBallColor = (number: number): string => {
  const colors = [
    'linear-gradient(135deg, #ff9a9e, #fad0c4)',  // Red
    'linear-gradient(135deg, #ffecd2, #fcb69f)',  // Orange
    'linear-gradient(135deg, #ffc3a0, #ffafbd)',  // Pink
    'linear-gradient(135deg, #a1c4fd, #c2e9fb)',  // Blue
    'linear-gradient(135deg, #d4fc79, #96e6a1)',  // Green
    'linear-gradient(135deg, #84fab0, #8fd3f4)',  // Aqua
    'linear-gradient(135deg, #f5efef, #feada6)'   // White
  ];
  
  // Use the last digit of the number to determine color
  const lastDigit = number % 10;
  return colors[lastDigit % colors.length];
};

// Create bubbles for animation
const createBubbles = (count: number) => {
  const bubbles = [];
  
  for (let i = 0; i < count; i++) {
    bubbles.push({
      id: i,
      size: Math.random() * 20 + 10,
      x: Math.random() * 100,
      delay: Math.random() * 5
    });
  }
  
  return bubbles;
};

const bubbles = createBubbles(15);

const BallDraw: React.FC<BallDrawProps> = ({ drawnNumbers, isDrawing }) => {
  // Create empty slots for 6 numbers
  const slots = Array(6).fill(null);
  
  return (
    <DrawMachine>
      <DrawTitle>
        {isDrawing ? 'Drawing Numbers...' : drawnNumbers.length > 0 ? 'Drawn Numbers' : 'Ready to Draw'}
      </DrawTitle>
      
      <MachineBackground>
        {bubbles.map(bubble => (
          <Bubble 
            key={bubble.id}
            $size={bubble.size}
            $x={bubble.x}
            $delay={bubble.delay}
            animate={{ 
              y: [0, -(Math.random() * 150 + 100)],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 2 + 3,
              repeat: Infinity,
              delay: bubble.delay
            }}
          />
        ))}
      </MachineBackground>
      
      <BallsContainer>
        {slots.map((_, index) => (
          <BallSlot key={index}>
            <AnimatePresence>
              {drawnNumbers[index] !== undefined && (
                <Ball
                  key={drawnNumbers[index]}
                  $ballColor={getBallColor(drawnNumbers[index])}
                  initial={{ y: -100, opacity: 0, rotateZ: -180 }}
                  animate={{ 
                    y: 0, 
                    opacity: 1, 
                    rotateZ: 0,
                    scale: [1, 1.1, 1]
                  }}
                  exit={{ y: 100, opacity: 0 }}
                  transition={{ 
                    type: 'spring',
                    damping: 12,
                    duration: 0.5
                  }}
                >
                  {drawnNumbers[index]}
                </Ball>
              )}
            </AnimatePresence>
          </BallSlot>
        ))}
      </BallsContainer>
    </DrawMachine>
  );
};

export default BallDraw; 