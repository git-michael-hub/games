import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { CardType } from './types';

interface CardProps {
  card: CardType;
  index: number;
  isDealer: boolean;
}

const CardContainer = styled(motion.div)`
  width: 120px;
  height: 180px;
  border-radius: 10px;
  position: relative;
  transform-style: preserve-3d;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const CardFace = styled.div<{ $faceUp: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 10px;
  border: 2px solid white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.5s;
  overflow: hidden;
`;

const CardFront = styled(CardFace)`
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;
  transform: ${props => props.$faceUp ? 'rotateY(0deg)' : 'rotateY(180deg)'};
`;

const CardBack = styled(CardFace)`
  background: linear-gradient(135deg, #0a4b2e 0%, #0f623a 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  transform: ${props => props.$faceUp ? 'rotateY(180deg)' : 'rotateY(0deg)'};
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 80%;
    border: 2px solid rgba(255, 215, 0, 0.5);
    border-radius: 5px;
  }
  
  &::after {
    content: '♠♥♣♦';
    font-size: 1.5rem;
    color: gold;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  }
`;

const Corner = styled.div<{ $suit: string; $isBottom?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isBottom ? 'flex-end' : 'flex-start'};
  transform: ${props => props.$isBottom ? 'rotate(180deg)' : 'rotate(0deg)'};
  color: ${props => props.$suit === 'hearts' || props.$suit === 'diamonds' ? '#e74c3c' : '#2c3e50'};
  font-size: 1.3rem;
  font-weight: bold;
  line-height: 1;
`;

const Value = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1;
`;

const Suit = styled.span`
  font-size: 1.8rem;
  line-height: 1;
`;

const Center = styled.div<{ $suit: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  color: ${props => props.$suit === 'hearts' || props.$suit === 'diamonds' ? '#e74c3c' : '#2c3e50'};
`;

// Get suit symbol
const getSuitSymbol = (suit: string): string => {
  switch (suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
    default: return '';
  }
};

// Format card value
const formatCardValue = (value: string): string => {
  switch (value) {
    case 'A': return 'A';
    case 'K': return 'K';
    case 'Q': return 'Q';
    case 'J': return 'J';
    case '10': return '10';
    default: return value;
  }
};

const Card: React.FC<CardProps> = ({ card, index, isDealer }) => {
  const suitSymbol = getSuitSymbol(card.suit);
  const formattedValue = formatCardValue(card.value);
  
  return (
    <CardContainer
      initial={{ 
        opacity: 0,
        y: isDealer ? -100 : 100,
        rotateY: card.faceUp ? 0 : 180,
        scale: 0.5
      }}
      animate={{ 
        opacity: 1,
        y: 0,
        rotateY: card.faceUp ? 0 : 180,
        scale: 1
      }}
      exit={{ 
        opacity: 0,
        y: 0,
        scale: 0.5
      }}
      transition={{ 
        duration: 0.5,
        delay: index * 0.1,
        type: 'spring',
        stiffness: 300,
        damping: 15
      }}
      whileHover={{ 
        y: -10,
        boxShadow: '0 15px 25px rgba(0, 0, 0, 0.3)',
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.95
      }}
    >
      <CardFront $faceUp={card.faceUp}>
        <Corner $suit={card.suit}>
          <Value>{formattedValue}</Value>
          <Suit>{suitSymbol}</Suit>
        </Corner>
        
        <Center $suit={card.suit}>
          {suitSymbol}
        </Center>
        
        <Corner $suit={card.suit} $isBottom>
          <Value>{formattedValue}</Value>
          <Suit>{suitSymbol}</Suit>
        </Corner>
      </CardFront>
      
      <CardBack $faceUp={card.faceUp} />
    </CardContainer>
  );
};

export default Card; 