import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface PrizeTiersProps {
  ticketPrice: number;
}

const PrizeTiersContainer = styled.div`
  background: linear-gradient(145deg, #0f0f1f, #1a1a2e);
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

const PrizeTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PrizeRow = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 215, 0, 0.1);
  }
`;

const MatchesLabel = styled.div`
  font-weight: bold;
  color: white;
`;

const PrizeAmount = styled.div`
  color: #FFD700;
  font-weight: bold;
  font-size: 1.2rem;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
`;

const PrizeNote = styled.p`
  color: #ccc;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 15px;
  font-style: italic;
`;

const PrizeTiers: React.FC<PrizeTiersProps> = ({ ticketPrice }) => {
  // Define the prize tiers and multipliers
  const tiers = [
    { matches: 3, multiplier: 5 },
    { matches: 4, multiplier: 20 },
    { matches: 5, multiplier: 200 },
    { matches: 6, multiplier: 5000 }
  ];
  
  return (
    <PrizeTiersContainer>
      <Title>Prize Tiers</Title>
      
      <PrizeTable>
        {tiers.map((tier, index) => (
          <PrizeRow 
            key={tier.matches}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <MatchesLabel>Match {tier.matches}</MatchesLabel>
            <PrizeAmount>${ticketPrice * tier.multiplier}</PrizeAmount>
          </PrizeRow>
        ))}
      </PrizeTable>
      
      <PrizeNote>
        Match more numbers to win bigger prizes! All prizes are multiplied by your ticket price.
      </PrizeNote>
    </PrizeTiersContainer>
  );
};

export default PrizeTiers; 