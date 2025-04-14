import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface RulesProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: linear-gradient(145deg, #1f2b3e, #0f141f);
  border-radius: 20px;
  padding: 30px;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 2px solid #FFD700;
  color: white;
`;

const Title = styled.h2`
  color: #FFD700;
  text-align: center;
  margin-bottom: 20px;
  font-size: 2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const SectionTitle = styled.h3`
  color: #FFD700;
  margin: 20px 0 10px;
  font-size: 1.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const List = styled.ul`
  margin-left: 20px;
  line-height: 1.5;
`;

const CloseButton = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: black;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  }
`;

const ButtonContainer = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const BingoPattern = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
  width: 200px;
  margin: 15px auto;
`;

const PatternCell = styled.div<{ $highlighted: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #4a5d8c;
  background-color: ${props => props.$highlighted ? '#4a5d8c' : 'transparent'};
`;

const Rules: React.FC<RulesProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <ModalOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <ModalContent
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <Title>Bingo Rules</Title>
        
        <SectionTitle>Objective</SectionTitle>
        <p>Mark numbers on your card as they are called out. Create winning patterns to win prizes!</p>
        
        <SectionTitle>The Card</SectionTitle>
        <p>Each Bingo card has 25 squares arranged in a 5×5 grid:</p>
        <List>
          <li>Column B contains numbers from 1-15</li>
          <li>Column I contains numbers from 16-30</li>
          <li>Column N contains numbers from 31-45 (middle square is FREE)</li>
          <li>Column G contains numbers from 46-60</li>
          <li>Column O contains numbers from 61-75</li>
        </List>
        <p>The center square is a "FREE" space that is automatically marked.</p>
        
        <SectionTitle>How to Play</SectionTitle>
        <List>
          <li>Place your bet at the start of the game</li>
          <li>Numbers will be randomly called out one at a time</li>
          <li>If you have the called number on your card, mark it (manually or using auto-mark)</li>
          <li>Continue until you complete a winning pattern or all numbers are called</li>
        </List>
        
        <SectionTitle>Winning Patterns</SectionTitle>
        <p>There are several ways to win in Bingo:</p>
        
        <SectionTitle>Horizontal Line</SectionTitle>
        <p>Mark all 5 numbers in any horizontal row:</p>
        <BingoPattern>
          {Array(25).fill(0).map((_, i) => 
            <PatternCell key={i} $highlighted={Math.floor(i/5) === 1} />
          )}
        </BingoPattern>
        
        <SectionTitle>Vertical Line</SectionTitle>
        <p>Mark all 5 numbers in any vertical column:</p>
        <BingoPattern>
          {Array(25).fill(0).map((_, i) => 
            <PatternCell key={i} $highlighted={i % 5 === 2} />
          )}
        </BingoPattern>
        
        <SectionTitle>Diagonal</SectionTitle>
        <p>Mark all 5 numbers in a diagonal line:</p>
        <BingoPattern>
          {Array(25).fill(0).map((_, i) => 
            <PatternCell key={i} $highlighted={i === 0 || i === 6 || i === 12 || i === 18 || i === 24} />
          )}
        </BingoPattern>
        
        <SectionTitle>Four Corners</SectionTitle>
        <p>Mark the numbers in all four corners of the card:</p>
        <BingoPattern>
          {Array(25).fill(0).map((_, i) => 
            <PatternCell key={i} $highlighted={i === 0 || i === 4 || i === 20 || i === 24} />
          )}
        </BingoPattern>
        
        <SectionTitle>Full Card</SectionTitle>
        <p>Mark all 25 numbers on your card for the biggest payout!</p>
        
        <SectionTitle>Controls</SectionTitle>
        <List>
          <li><strong>Bet +/-:</strong> Adjust your bet amount</li>
          <li><strong>Auto-mark:</strong> Toggle automatic marking of numbers</li>
          <li><strong>Play:</strong> Start a new game</li>
          <li><strong>Call Next Number:</strong> Draw the next number during gameplay</li>
          <li><strong>New Card:</strong> Get a new random card</li>
        </List>
        
        <SectionTitle>Payouts</SectionTitle>
        <p>Different winning patterns award different multipliers of your bet:</p>
        <List>
          <li><strong>Single Line:</strong> 3x your bet</li>
          <li><strong>Two Lines:</strong> 5x your bet</li>
          <li><strong>Diagonal:</strong> 5x your bet</li>
          <li><strong>Four Corners:</strong> 7x your bet</li>
          <li><strong>Full Card:</strong> 25x your bet</li>
        </List>
        
        <ButtonContainer>
          <CloseButton onClick={onClose}>
            Close Rules
          </CloseButton>
        </ButtonContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default Rules; 