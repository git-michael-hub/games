import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { GameState } from './types';

interface ControlsProps {
  gameState: GameState;
  balance: number;
  currentBet: number;
  onPlaceBet: (amount: number) => void;
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onNewGame: () => void;
}

const ControlsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const ActionButton = styled(motion.button)<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  background: ${props => {
    switch (props.$variant) {
      case 'primary':
        return 'linear-gradient(135deg, #1e9600 0%, #fff200 100%)';
      case 'secondary':
        return 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)';
      case 'danger':
        return 'linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%)';
      default:
        return 'linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)';
    }
  }};
  
  color: ${props => props.$variant === 'primary' ? 'black' : 'white'};
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(80%);
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 7px 14px rgba(0, 0, 0, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  }
`;

const BetContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
`;

const BetTitle = styled.h3`
  color: white;
  margin: 0;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
`;

const ChipContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const ChipButton = styled(motion.button)<{ $color: string }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 4px dashed white;
  background: ${props => props.$color};
  color: white;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  position: relative;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 80%;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.5);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
  }
`;

const BetAmountDisplay = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: gold;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
`;

const BalanceDisplay = styled.div`
  background: rgba(0, 0, 0, 0.5);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  
  span {
    color: gold;
    margin-left: 0.5rem;
  }
`;

const Controls: React.FC<ControlsProps> = ({
  gameState,
  balance,
  currentBet,
  onPlaceBet,
  onHit,
  onStand,
  onDouble,
  onNewGame
}) => {
  const [betAmount, setBetAmount] = useState(0);
  
  const handleChipClick = (amount: number) => {
    if (gameState === 'betting' && betAmount + amount <= balance) {
      setBetAmount(prev => prev + amount);
    }
  };
  
  const handleClearBet = () => {
    if (gameState === 'betting') {
      setBetAmount(0);
    }
  };
  
  const handlePlaceBet = () => {
    if (gameState === 'betting' && betAmount > 0) {
      onPlaceBet(betAmount);
      setBetAmount(0);
    }
  };
  
  const chips = [
    { value: 5, color: '#3498db' },
    { value: 10, color: '#e74c3c' },
    { value: 25, color: '#2ecc71' },
    { value: 50, color: '#9b59b6' },
    { value: 100, color: '#f1c40f' },
  ];
  
  return (
    <ControlsContainer>
      <BalanceDisplay>
        Balance: <span>${balance}</span>
      </BalanceDisplay>
      
      {gameState === 'betting' && (
        <BetContainer>
          <BetTitle>Place Your Bet</BetTitle>
          
          <ChipContainer>
            {chips.map(chip => (
              <ChipButton
                key={chip.value}
                $color={chip.color}
                onClick={() => handleChipClick(chip.value)}
                disabled={betAmount + chip.value > balance}
                whileHover={{ y: -5, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                ${chip.value}
              </ChipButton>
            ))}
          </ChipContainer>
          
          <BetAmountDisplay>
            ${betAmount}
          </BetAmountDisplay>
          
          <ButtonsContainer>
            <ActionButton
              $variant="danger"
              onClick={handleClearBet}
              disabled={betAmount === 0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear
            </ActionButton>
            
            <ActionButton
              $variant="primary"
              onClick={handlePlaceBet}
              disabled={betAmount === 0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Deal
            </ActionButton>
          </ButtonsContainer>
        </BetContainer>
      )}
      
      {gameState === 'playerTurn' && (
        <ButtonsContainer>
          <ActionButton
            $variant="primary"
            onClick={onHit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Hit
          </ActionButton>
          
          <ActionButton
            $variant="danger"
            onClick={onStand}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Stand
          </ActionButton>
          
          <ActionButton
            $variant="secondary"
            onClick={onDouble}
            disabled={balance < currentBet || currentBet === 0}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Double Down
          </ActionButton>
        </ButtonsContainer>
      )}
      
      {(gameState === 'dealerTurn' || gameState === 'evaluating') && (
        <ButtonsContainer>
          <ActionButton disabled>
            Dealer's Turn...
          </ActionButton>
        </ButtonsContainer>
      )}
      
      {gameState === 'gameOver' && (
        <ButtonsContainer>
          <ActionButton
            $variant="primary"
            onClick={onNewGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            New Hand
          </ActionButton>
        </ButtonsContainer>
      )}
    </ControlsContainer>
  );
};

export default Controls; 