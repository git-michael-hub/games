import React, { useState } from 'react';
import styled from 'styled-components';
import Board from './Board';

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
`;

const BingoGame: React.FC = () => {
  const [credits, setCredits] = useState<number>(100);

  const handleCreditChange = (newCredits: number) => {
    setCredits(newCredits);
  };

  return (
    <Container>
      <Board credits={credits} onCreditChange={handleCreditChange} />
    </Container>
  );
};

export default BingoGame; 