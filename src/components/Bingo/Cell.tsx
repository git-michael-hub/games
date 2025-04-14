import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { BingoCell as BingoCellType } from './types';

interface CellProps {
  cell: BingoCellType;
  position: [number, number];
  onClick: (row: number, col: number) => void;
  autoMarkEnabled?: boolean;
}

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0px rgba(255, 215, 0, 0.4);
  }
  100% {
    box-shadow: 0 0 0 20px rgba(255, 215, 0, 0);
  }
`;

const glow = keyframes`
  0% {
    background-color: #f5b942;
  }
  50% {
    background-color: #ffdc73;
  }
  100% {
    background-color: #f5b942;
  }
`;

const CellContainer = styled(motion.div)<{
  $marked: boolean;
  $isWinning: boolean;
  $isFreeSpace: boolean;
}>`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin: 5px;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border: 2px solid #333;
  color: ${({ $marked, $isFreeSpace }) =>
    $marked || $isFreeSpace ? 'white' : 'black'};
  
  background-color: ${({ $marked, $isWinning, $isFreeSpace }) => {
    if ($isWinning) return '#f5b942'; // Gold for winning cells
    if ($isFreeSpace) return '#ff5555'; // Red for free space
    return $marked ? '#4a5d8c' : 'white'; // Blue when marked, white otherwise
  }};
  
  ${({ $isWinning }) =>
    $isWinning &&
    css`
      animation: ${glow} 1.5s infinite ease-in-out;
    `}
  
  ${({ $marked, $isWinning, $isFreeSpace }) =>
    $marked &&
    !$isWinning &&
    !$isFreeSpace &&
    css`
      &::after {
        content: '';
        position: absolute;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: transparent;
        border: 3px solid white;
      }
    `}
    
  &:hover {
    transform: ${({ $marked, $isFreeSpace }) =>
      $marked || $isFreeSpace ? 'none' : 'scale(1.05)'};
    box-shadow: ${({ $marked, $isFreeSpace }) =>
      $marked || $isFreeSpace ? 'none' : '0 0 10px rgba(0, 0, 0, 0.2)'};
  }

  &:active {
    transform: ${({ $marked, $isFreeSpace }) =>
      $marked || $isFreeSpace ? 'none' : 'scale(0.98)'};
  }
`;

const Cell: React.FC<CellProps> = ({ cell, position, onClick, autoMarkEnabled }) => {
  // Calculate animation delay based on position
  const [row, col] = position;
  const index = row * 5 + col;
  const delayMultiplier = 0.03;
  const delay = index * delayMultiplier;

  return (
    <CellContainer
      $marked={cell.marked}
      $isWinning={cell.isWinning}
      $isFreeSpace={cell.isFreeSpace || false}
      onClick={() => onClick(row, col)}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        boxShadow: autoMarkEnabled && cell.marked && !cell.isFreeSpace ? 
          '0 0 15px 5px rgba(74, 93, 140, 0.7)' : 'none'
      }}
      transition={{
        delay,
        duration: 0.3,
        type: 'spring',
        stiffness: 260,
        damping: 20
      }}
      whileHover={!cell.marked && !cell.isFreeSpace ? { scale: 1.05 } : {}}
      whileTap={!cell.marked && !cell.isFreeSpace ? { scale: 0.98 } : {}}
    >
      {cell.isFreeSpace ? 'FREE' : cell.number}
    </CellContainer>
  );
};

export default Cell; 