import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Types
type GameState = 'idle' | 'spinning' | 'result';

interface ControlsProps {
  onSpin: () => void;
  onPlayAgain: () => void;
  onChangeBet: (amount: number) => void;
  gameState: GameState;
  betAmount: number;
}

// Styled components
const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  margin-top: 20px;
`;

const BetControls = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 10px;
`;

const BetButton = styled(motion.button)`
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  background: linear-gradient(to bottom, #333333, #222222);
  color: white;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SpinButton = styled(motion.button)`
  padding: 15px 0;
  width: 100%;
  border: none;
  border-radius: 50px;
  background: linear-gradient(45deg, #ff4d4d, #f9cb28);
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(255, 77, 77, 0.5);
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const PlayAgainButton = styled(motion.button)`
  padding: 15px 0;
  width: 100%;
  border: none;
  border-radius: 50px;
  background: linear-gradient(45deg, #4e54c8, #8f94fb);
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(78, 84, 200, 0.5);
`;

const Controls: React.FC<ControlsProps> = ({
  onSpin,
  onPlayAgain,
  onChangeBet,
  gameState,
  betAmount
}) => {
  return (
    <ControlsContainer>
      {gameState === 'idle' && (
        <>
          <BetControls>
            <BetButton
              onClick={() => onChangeBet(-10)}
              disabled={betAmount <= 10}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              -10
            </BetButton>
            <BetButton
              onClick={() => onChangeBet(-50)}
              disabled={betAmount <= 50}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              -50
            </BetButton>
            <BetButton
              onClick={() => onChangeBet(10)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              +10
            </BetButton>
            <BetButton
              onClick={() => onChangeBet(50)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              +50
            </BetButton>
          </BetControls>
          
          <SpinButton
            onClick={onSpin}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                '0 5px 15px rgba(255, 77, 77, 0.5)',
                '0 5px 25px rgba(255, 77, 77, 0.8)',
                '0 5px 15px rgba(255, 77, 77, 0.5)'
              ]
            }}
            transition={{
              boxShadow: {
                repeat: Infinity,
                duration: 2
              }
            }}
          >
            SPIN THE WHEEL
          </SpinButton>
        </>
      )}
      
      {gameState === 'spinning' && (
        <SpinButton
          disabled
          animate={{
            scale: [1, 1.03, 1],
            transition: {
              repeat: Infinity,
              duration: 0.5
            }
          }}
        >
          SPINNING...
        </SpinButton>
      )}
      
      {gameState === 'result' && (
        <PlayAgainButton
          onClick={onPlayAgain}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            y: [0, -5, 0],
            transition: {
              repeat: Infinity,
              duration: 1.5
            }
          }}
        >
          SPIN AGAIN
        </PlayAgainButton>
      )}
    </ControlsContainer>
  );
};

export default Controls; 