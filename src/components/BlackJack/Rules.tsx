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
  background: linear-gradient(to bottom, #0f623a, #0a4b2e);
  border-radius: 20px;
  padding: 30px;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 2px solid gold;
  color: white;
`;

const Title = styled.h2`
  color: gold;
  text-align: center;
  margin-bottom: 20px;
  font-size: 2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const SectionTitle = styled.h3`
  color: gold;
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
  background: linear-gradient(135deg, #f6b93b 0%, #e67e22 100%);
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
        <Title>BlackJack Rules</Title>
        
        <SectionTitle>Objective</SectionTitle>
        <p>Beat the dealer by getting a hand closer to 21 without going over.</p>
        
        <SectionTitle>Card Values</SectionTitle>
        <List>
          <li>Number cards (2-10): Face value</li>
          <li>Face cards (Jack, Queen, King): 10 points</li>
          <li>Aces: 1 or 11 points (whichever benefits you most)</li>
        </List>
        
        <SectionTitle>Getting Started</SectionTitle>
        <p>1. Place your bet</p>
        <p>2. You and the dealer each receive two cards</p>
        <p>3. Dealer's first card is face up, second is face down</p>
        <p>4. Your cards are both face up</p>
        
        <SectionTitle>Player Actions</SectionTitle>
        <List>
          <li><strong>Hit:</strong> Take another card</li>
          <li><strong>Stand:</strong> End your turn with your current hand</li>
          <li><strong>Double Down:</strong> Double your bet, take exactly one more card, and stand</li>
        </List>
        
        <SectionTitle>Dealer Rules</SectionTitle>
        <p>The dealer must hit on 16 or less and stand on 17 or more.</p>
        
        <SectionTitle>Winning Conditions</SectionTitle>
        <List>
          <li><strong>You win if:</strong> Your hand is closer to 21 than the dealer's OR the dealer busts (exceeds 21)</li>
          <li><strong>Dealer wins if:</strong> Your hand exceeds 21 (bust) OR dealer's hand is closer to 21 than yours</li>
          <li><strong>Push (tie):</strong> If your hand and the dealer's hand have the same value</li>
        </List>
        
        <SectionTitle>BlackJack</SectionTitle>
        <p>A "Blackjack" is an Ace and a 10-value card (10, Jack, Queen, King) as your first two cards, totaling 21.</p>
        <p>A natural blackjack typically pays 3:2 (meaning you win 1.5x your bet).</p>
        
        <SectionTitle>Payouts</SectionTitle>
        <List>
          <li><strong>Win:</strong> 1:1 (you get your bet back plus the same amount as winnings)</li>
          <li><strong>Blackjack:</strong> 3:2 (you get your bet back plus 1.5x your bet as winnings)</li>
          <li><strong>Push:</strong> Your bet is returned</li>
          <li><strong>Lose:</strong> Your bet is lost</li>
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