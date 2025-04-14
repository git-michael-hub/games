import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface ControlsProps {
  onDrawNumber: () => void;
  onNewCard: () => void;
  onStartGame: () => void;
  onEndGame: () => void;
  credits: number;
  betAmount: number;
  setBetAmount: (amount: number) => void;
  gameInProgress: boolean;
  calledNumbers: number[];
  currentNumber: number | null;
}

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  background: #1a1a2e;
  border-radius: 10px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
`;

const ControlSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SectionTitle = styled.h3`
  color: #e94560;
  margin: 0;
  font-size: 1.2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Button = styled(motion.button)<{ $primary?: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  background: ${props => props.$primary ? '#e94560' : '#16213e'};
  color: white;
  font-weight: bold;
  cursor: pointer;
  min-width: 120px;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BetControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BetAmount = styled.div`
  background: #0f3460;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  min-width: 80px;
  text-align: center;
  color: white;
  font-weight: bold;
`;

const NumberDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const CurrentNumber = styled(motion.div)`
  font-size: 3rem;
  font-weight: bold;
  color: white;
  background: #e94560;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CalledNumbersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  max-width: 300px;
  justify-content: center;
`;

const CalledNumber = styled.div<{ $recent: boolean }>`
  font-size: 1rem;
  color: white;
  background: ${props => props.$recent ? '#4E9F3D' : '#0f3460'};
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const InfoText = styled.p`
  color: white;
  margin: 0;
`;

const Controls: React.FC<ControlsProps> = ({
  onDrawNumber,
  onNewCard,
  onStartGame,
  onEndGame,
  credits,
  betAmount,
  setBetAmount,
  gameInProgress,
  calledNumbers,
  currentNumber
}) => {
  const betOptions = [1, 5, 10, 25, 50];
  
  return (
    <ControlsContainer>
      <ControlSection>
        <SectionTitle>Credits</SectionTitle>
        <InfoText>${credits.toFixed(2)}</InfoText>
      </ControlSection>

      <ControlSection>
        <SectionTitle>Bet Amount</SectionTitle>
        <BetControls>
          {betOptions.map(amount => (
            <Button
              key={amount}
              onClick={() => setBetAmount(amount)}
              disabled={gameInProgress}
              whileHover={{ scale: gameInProgress ? 1 : 1.05 }}
              whileTap={{ scale: gameInProgress ? 1 : 0.95 }}
              $primary={betAmount === amount}
            >
              ${amount}
            </Button>
          ))}
        </BetControls>
      </ControlSection>

      <ControlSection>
        <SectionTitle>Game Controls</SectionTitle>
        <ButtonGroup>
          <Button
            onClick={onStartGame}
            disabled={gameInProgress}
            whileHover={{ scale: gameInProgress ? 1 : 1.05 }}
            whileTap={{ scale: gameInProgress ? 1 : 0.95 }}
            $primary
          >
            Start Game
          </Button>
          <Button
            onClick={onDrawNumber}
            disabled={!gameInProgress}
            whileHover={{ scale: !gameInProgress ? 1 : 1.05 }}
            whileTap={{ scale: !gameInProgress ? 1 : 0.95 }}
          >
            Draw Number
          </Button>
          <Button
            onClick={onEndGame}
            disabled={!gameInProgress}
            whileHover={{ scale: !gameInProgress ? 1 : 1.05 }}
            whileTap={{ scale: !gameInProgress ? 1 : 0.95 }}
          >
            End Game
          </Button>
          <Button
            onClick={onNewCard}
            disabled={gameInProgress}
            whileHover={{ scale: gameInProgress ? 1 : 1.05 }}
            whileTap={{ scale: gameInProgress ? 1 : 0.95 }}
          >
            New Card
          </Button>
        </ButtonGroup>
      </ControlSection>

      {gameInProgress && (
        <ControlSection>
          <SectionTitle>Drawn Numbers</SectionTitle>
          <NumberDisplay>
            {currentNumber !== null && (
              <CurrentNumber
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                {currentNumber}
              </CurrentNumber>
            )}
            <CalledNumbersContainer>
              {calledNumbers.map((num, index) => (
                <CalledNumber
                  key={num}
                  $recent={num === currentNumber}
                >
                  {num}
                </CalledNumber>
              ))}
            </CalledNumbersContainer>
          </NumberDisplay>
        </ControlSection>
      )}
    </ControlsContainer>
  );
};

export default Controls; 