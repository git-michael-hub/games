import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface RaceControlsProps {
  onStart: () => void;
  onBetChange: (amount: number) => void;
  betAmount: number;
  isRacing: boolean;
  selectedHorse: number | null;
  soundEnabled: boolean;
  onSoundToggle: () => void;
}

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 15px;
`;

const BetControls = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled(motion.button)<{ primary?: boolean; disabled?: boolean }>`
  padding: ${props => props.primary ? '15px 40px' : '10px 15px'};
  font-size: ${props => props.primary ? '1.5rem' : '1rem'};
  background: ${props => {
    if (props.disabled) return '#666';
    return props.primary 
      ? 'linear-gradient(45deg, #FFD700 0%, #FFA500 100%)'
      : 'linear-gradient(45deg, #333 0%, #666 100%)';
  }};
  color: ${props => props.primary ? 'black' : 'white'};
  border: none;
  border-radius: 10px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-weight: bold;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  text-transform: uppercase;
  flex: ${props => props.primary ? '1' : 'none'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  
  &:disabled {
    pointer-events: none;
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

const BetAmountDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: gold;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
  padding: 0 15px;
`;

const SettingsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 10px;
`;

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

const RaceControls: React.FC<RaceControlsProps> = ({
  onStart,
  onBetChange,
  betAmount,
  isRacing,
  selectedHorse,
  soundEnabled,
  onSoundToggle
}) => {
  return (
    <ControlsContainer>
      <ButtonRow>
        <BetControls>
          <BetButton
            onClick={() => onBetChange(-5)}
            disabled={isRacing || betAmount <= 5}
            whileTap={{ scale: 0.95 }}
          >
            -5
          </BetButton>
          <BetButton
            onClick={() => onBetChange(-1)}
            disabled={isRacing || betAmount <= 1}
            whileTap={{ scale: 0.95 }}
          >
            -1
          </BetButton>
          
          <BetAmountDisplay>
            {betAmount}
          </BetAmountDisplay>
          
          <BetButton
            onClick={() => onBetChange(1)}
            disabled={isRacing || betAmount >= 50}
            whileTap={{ scale: 0.95 }}
          >
            +1
          </BetButton>
          <BetButton
            onClick={() => onBetChange(5)}
            disabled={isRacing || betAmount >= 45}
            whileTap={{ scale: 0.95 }}
          >
            +5
          </BetButton>
        </BetControls>
        
        <Button
          primary
          onClick={onStart}
          disabled={isRacing || !selectedHorse}
          whileHover={!isRacing ? { scale: 1.05 } : {}}
          whileTap={!isRacing ? { scale: 0.95 } : {}}
          animate={isRacing ? { 
            scale: [1, 0.97, 1, 0.97, 1],
            transition: { duration: 2, repeat: Infinity } 
          } : {}}
        >
          {isRacing ? 'Racing...' : 'Start Race'}
        </Button>
      </ButtonRow>
      
      <SettingsContainer>
        <SoundToggle>
          <input 
            type="checkbox" 
            id="raceSound" 
            checked={soundEnabled} 
            onChange={onSoundToggle} 
          />
          <label htmlFor="raceSound">Sound Effects</label>
        </SoundToggle>
      </SettingsContainer>
    </ControlsContainer>
  );
};

export default RaceControls; 