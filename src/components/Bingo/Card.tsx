import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Cell from './Cell';
import { BingoCard as BingoCardType } from './types';

interface CardProps {
  card: BingoCardType;
  onCellClick: (row: number, col: number) => void;
  autoMarkEnabled: boolean;
}

const CardContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, #2a3f5f, #1a2a43);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  gap: 4px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-bottom: 10px;
`;

const HeaderCell = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  width: 60px;
  text-align: center;
`;

const Row = styled.div`
  display: flex;
  justify-content: center;
`;

const Card: React.FC<CardProps> = ({ card, onCellClick, autoMarkEnabled }) => {
  return (
    <CardContainer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
    >
      <Header>
        <HeaderCell>B</HeaderCell>
        <HeaderCell>I</HeaderCell>
        <HeaderCell>N</HeaderCell>
        <HeaderCell>G</HeaderCell>
        <HeaderCell>O</HeaderCell>
      </Header>
      
      {card.cells.map((row, rowIndex) => (
        <Row key={`row-${rowIndex}`}>
          {row.map((cell, colIndex) => (
            <Cell 
              key={`cell-${rowIndex}-${colIndex}`}
              cell={cell}
              position={[rowIndex, colIndex]}
              onClick={onCellClick}
              autoMarkEnabled={autoMarkEnabled}
            />
          ))}
        </Row>
      ))}
    </CardContainer>
  );
};

export default Card; 