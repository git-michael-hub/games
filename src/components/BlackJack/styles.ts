import styled from 'styled-components';
import { motion } from 'framer-motion';

export const BlackJackContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 1rem;
  background: linear-gradient(to bottom, #0f623a, #0a4b2e);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
`;

export const Title = styled.h1`
  color: gold;
  margin-bottom: 1.5rem;
  font-size: 2.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  text-align: center;
  font-weight: bold;
  letter-spacing: 2px;
`;

export const TableTop = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-bottom: 2rem;
  position: relative;
`;

export const DealerArea = styled.div`
  width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 1rem;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
`;

export const PlayerArea = styled.div`
  width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
  position: relative;
`;

export const HandTitle = styled.h2<{ $isDealer?: boolean }>`
  color: ${props => props.$isDealer ? '#ff6b6b' : '#4ecdc4'};
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
`;

export const Cards = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  min-height: 150px;
`;

export const ScoreDisplay = styled.div<{ $busted?: boolean }>`
  background: ${props => props.$busted ? 'rgba(255, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-weight: bold;
  margin-top: 0.5rem;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
`;

export const ResultOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

export const ResultMessage = styled.div<{ $result: 'win' | 'lose' | 'push' }>`
  font-size: 3rem;
  font-weight: bold;
  color: ${props => {
    switch (props.$result) {
      case 'win': return 'gold';
      case 'lose': return '#ff6b6b';
      case 'push': return 'white';
      default: return 'white';
    }
  }};
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.7);
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 1rem;
  border: 2px solid ${props => {
    switch (props.$result) {
      case 'win': return 'gold';
      case 'lose': return '#ff6b6b';
      case 'push': return 'white';
      default: return 'white';
    }
  }};
  animation: pulse 1.5s infinite;
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;

export const BetDisplay = styled.div`
  background: rgba(0, 0, 0, 0.7);
  color: gold;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-weight: bold;
  margin-top: 1rem;
  border: 2px solid gold;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
`;

export const RulesButton = styled(motion.button)`
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 8px 15px;
  background-color: rgba(0, 0, 0, 0.6);
  color: gold;
  border: 1px solid gold;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  z-index: 10;
`; 