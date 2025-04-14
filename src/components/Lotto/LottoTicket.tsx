import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface LottoTicketProps {
  selectedNumbers: number[];
  onNumberSelection: (number: number) => void;
  enabled: boolean;
}

const TicketContainer = styled.div`
  background: linear-gradient(145deg, #1a1a2e, #1f1f3a);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h3`
  color: #FFD700;
  margin-top: 0;
  margin-bottom: 15px;
  text-align: center;
  font-size: 1.5rem;
`;

const NumberGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(5, 1fr);
  }
`;

const NumberBall = styled(motion.div)<{ $selected: boolean; $enabled: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: ${props => props.$enabled ? 'pointer' : 'default'};
  background: ${props => props.$selected 
    ? 'linear-gradient(45deg, #FFD700, #FFA500)' 
    : 'linear-gradient(45deg, #2a2a3a, #1a1a2a)'};
  color: ${props => props.$selected ? '#000' : '#fff'};
  box-shadow: ${props => props.$selected 
    ? '0 0 10px rgba(255, 215, 0, 0.5)' 
    : '0 2px 5px rgba(0, 0, 0, 0.2)'};
  opacity: ${props => props.$enabled ? 1 : 0.7};
  
  &:hover {
    transform: ${props => props.$enabled ? 'scale(1.1)' : 'none'};
  }
`;

const Instructions = styled.p`
  color: #ccc;
  font-size: 0.9rem;
  text-align: center;
  margin: 15px 0 0 0;
`;

const SelectedCount = styled.div<{ $complete: boolean }>`
  background: ${props => props.$complete ? '#4CAF50' : '#333'};
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.9rem;
  margin: 10px auto;
  width: fit-content;
  text-align: center;
`;

const LottoTicket: React.FC<LottoTicketProps> = ({ 
  selectedNumbers, 
  onNumberSelection,
  enabled
}) => {
  // Generate numbers 1-49
  const numbers = Array.from({ length: 49 }, (_, i) => i + 1);
  
  return (
    <TicketContainer>
      <Title>Select Your Numbers</Title>
      
      <SelectedCount $complete={selectedNumbers.length === 6}>
        {selectedNumbers.length}/6 Numbers Selected
      </SelectedCount>
      
      <NumberGrid>
        {numbers.map(number => (
          <NumberBall
            key={number}
            $selected={selectedNumbers.includes(number)}
            $enabled={enabled}
            whileHover={enabled ? { scale: 1.1 } : {}}
            whileTap={enabled ? { scale: 0.95 } : {}}
            onClick={() => enabled && onNumberSelection(number)}
            animate={selectedNumbers.includes(number) ? {
              y: [0, -5, 0],
              boxShadow: [
                '0 0 10px rgba(255, 215, 0, 0.5)',
                '0 0 15px rgba(255, 215, 0, 0.8)',
                '0 0 10px rgba(255, 215, 0, 0.5)'
              ]
            } : {}}
            transition={{ duration: 0.5 }}
          >
            {number}
          </NumberBall>
        ))}
      </NumberGrid>
      
      <Instructions>
        {enabled 
          ? 'Select exactly 6 numbers to create a ticket.' 
          : 'Waiting for game to start...'}
      </Instructions>
    </TicketContainer>
  );
};

export default LottoTicket; 