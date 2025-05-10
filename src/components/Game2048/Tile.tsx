import React from 'react';
import styled, { keyframes } from 'styled-components';

interface TileProps {
  value: number;
  row: number;
  col: number;
  isNew?: boolean;  // Flag for newly added tiles
  hasMerged?: boolean;  // Flag for merged tiles
  cellSize: number; // Size of a cell in pixels
}

const getTileColor = (value: number) => {
  const colors: { [key: number]: { bg: string; text: string } } = {
    2: { bg: '#eee4da', text: '#776e65' },
    4: { bg: '#ede0c8', text: '#776e65' },
    8: { bg: '#f2b179', text: '#f9f6f2' },
    16: { bg: '#f59563', text: '#f9f6f2' },
    32: { bg: '#f67c5f', text: '#f9f6f2' },
    64: { bg: '#f65e3b', text: '#f9f6f2' },
    128: { bg: '#edcf72', text: '#f9f6f2' },
    256: { bg: '#edcc61', text: '#f9f6f2' },
    512: { bg: '#edc850', text: '#f9f6f2' },
    1024: { bg: '#edc53f', text: '#f9f6f2' },
    2048: { bg: '#edc22e', text: '#f9f6f2' },
  };

  return colors[value] || { bg: '#3c3a32', text: '#f9f6f2' };
};

const getFontSize = (value: number) => {
  if (value < 100) return '55px';
  if (value < 1000) return '45px';
  return '35px';
};

// Animation for new tiles
const appearAnimation = keyframes`
  0% {
    opacity: 0;
    transform: scale(0);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

// Animation for merged tiles
const popAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
`;

const TileContainer = styled.div<{
  $row: number;
  $col: number;
  $bg: string;
  $textColor: string;
  $fontSize: string;
  $isNew: boolean;
  $hasMerged: boolean;
  $cellSize: number;
}>`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${props => props.$cellSize}px;
  height: ${props => props.$cellSize}px;
  border-radius: 3px;
  background: ${props => props.$bg};
  color: ${props => props.$textColor};
  font-weight: bold;
  font-size: ${props => props.$fontSize};
  z-index: 10;
  top: ${props => 15 + props.$row * (props.$cellSize + 15)}px;
  left: ${props => 15 + props.$col * (props.$cellSize + 15)}px;
  transition: all 150ms ease-in-out;
  animation: ${props => props.$isNew 
    ? appearAnimation 
    : props.$hasMerged 
      ? popAnimation 
      : 'none'} 200ms ease-in-out;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
`;

export const Tile: React.FC<TileProps> = ({ 
  value, 
  row, 
  col, 
  isNew = false,
  hasMerged = false,
  cellSize 
}) => {
  const { bg, text } = getTileColor(value);
  const fontSize = getFontSize(value);

  return (
    <TileContainer
      $row={row}
      $col={col}
      $bg={bg}
      $textColor={text}
      $fontSize={fontSize}
      $isNew={isNew}
      $hasMerged={hasMerged}
      $cellSize={cellSize}
    >
      {value}
    </TileContainer>
  );
}; 