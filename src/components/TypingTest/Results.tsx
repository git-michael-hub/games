import React from 'react';
import styled from 'styled-components';

interface ResultsProps {
  timeTaken: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
}

const Container = styled.div`
  width: 100%;
  padding: 20px;
  background-color: #333;
  border-radius: 8px;
  margin: 20px 0;
`;

const Title = styled.h2`
  margin-bottom: 15px;
  color: #fff;
  text-align: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
`;

const StatBox = styled.div`
  background-color: #444;
  padding: 15px;
  border-radius: 5px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: #4d8bff;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #bbb;
  font-size: 0.9rem;
`;

const Results: React.FC<ResultsProps> = ({ 
  timeTaken, 
  correctChars, 
  incorrectChars, 
  totalChars 
}) => {
  // Calculate typing statistics
  const accuracy = Math.round((correctChars / (correctChars + incorrectChars)) * 100) || 0;
  const wpm = Math.round((correctChars / 5) / (timeTaken / 60)) || 0; // WPM calculation (assuming 5 chars per word)
  const cpm = Math.round(correctChars / (timeTaken / 60)) || 0; // CPM calculation
  
  return (
    <Container>
      <Title>Test Results</Title>
      <StatsGrid>
        <StatBox>
          <StatValue>{wpm}</StatValue>
          <StatLabel>Words Per Minute</StatLabel>
        </StatBox>
        <StatBox>
          <StatValue>{cpm}</StatValue>
          <StatLabel>Characters Per Minute</StatLabel>
        </StatBox>
        <StatBox>
          <StatValue>{accuracy}%</StatValue>
          <StatLabel>Accuracy</StatLabel>
        </StatBox>
        <StatBox>
          <StatValue>{Math.round(timeTaken)}</StatValue>
          <StatLabel>Seconds</StatLabel>
        </StatBox>
      </StatsGrid>
    </Container>
  );
};

export default Results; 