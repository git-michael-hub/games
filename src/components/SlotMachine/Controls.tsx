import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface ControlsProps {
  onSpin: () => void;
  onBetChange: (amount: number) => void;
  spinning: boolean;
  bet: number;
}

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 15px;
`;

const BetControls = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled(motion.button)<{ primary?: boolean; spinning?: boolean }>`
  padding: ${props => props.primary ? '15px 40px' : '10px 15px'};
  font-size: ${props => props.primary ? '1.5rem' : '1rem'};
  background: ${props => {
    if (props.primary) {
      return props.spinning 
        ? 'linear-gradient(45deg, #FFA500 0%, #FFD700 50%, #FFA500 100%)' 
        : 'linear-gradient(45deg, #FFD700 0%, #FFA500 100%)';
    }
    return 'linear-gradient(45deg, #333 0%, #666 100%)';
  }};
  color: ${props => props.primary ? 'black' : 'white'};
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  text-transform: uppercase;
  flex: ${props => props.primary ? '1' : 'none'};
  background-size: ${props => props.spinning ? '200% 200%' : '100% 100%'};
  animation: ${props => props.spinning ? 'shimmer 2s infinite linear' : 'none'};
  
  @keyframes shimmer {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%; 
    }
    100% {
      background-position: 0% 50%;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BetButton = styled(Button)`
  width: 50px;
  height: 50px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const Controls: React.FC<ControlsProps> = ({ onSpin, onBetChange, spinning, bet }) => {
  return (
    <ControlsContainer>
      <BetControls>
        <BetButton
          onClick={() => onBetChange(-1)}
          disabled={spinning || bet <= 1}
          whileTap={{ scale: 0.95 }}
        >
          -
        </BetButton>
        <BetButton
          onClick={() => onBetChange(1)}
          disabled={spinning || bet >= 10}
          whileTap={{ scale: 0.95 }}
        >
          +
        </BetButton>
      </BetControls>
      
      <Button
        primary
        spinning={spinning}
        onClick={onSpin}
        disabled={spinning}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={spinning ? { 
          scale: [1, 0.97, 1, 0.97, 1],
          transition: { duration: 2, repeat: Infinity } 
        } : {}}
      >
        {spinning ? 'Spinning...' : 'Spin'}
      </Button>
    </ControlsContainer>
  );
};

export default Controls; 