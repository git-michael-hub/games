import React from 'react';
import styled from 'styled-components';
import { Tile } from './Tile';
import { GRID_SIZE } from './gameLogic';

const BoardContainer = styled.div`
  background: #bbada0;
  border-radius: 6px;
  width: 100%;
  height: 0;
  padding-bottom: 100%; /* Square aspect ratio */
  position: relative;
  box-sizing: border-box;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  grid-gap: 15px;
  position: absolute;
  top: 15px;
  left: 15px;
  right: 15px;
  bottom: 15px;
`;

const Cell = styled.div`
  background: rgba(238, 228, 218, 0.35);
  border-radius: 3px;
  width: 100%;
  height: 100%;
`;

interface BoardProps {
  board: number[][];
  newTile: { row: number; col: number; value: number } | null;
  mergedTiles: { row: number; col: number; value: number }[];
  boardSize: number;
}

export const Board: React.FC<BoardProps> = ({ board, newTile, mergedTiles, boardSize }) => {
  const tiles = [];
  
  // Calculate cell size dynamically based on board size
  const cellSize = (boardSize - 2 * 15 - 3 * 15) / GRID_SIZE;
  
  // Create array of tiles with position and value information
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const value = board[row][col];
      if (value !== 0) {
        // Check if this is the new tile
        const isNew = newTile !== null && 
                      newTile.row === row && 
                      newTile.col === col;
        
        // Check if this is a merged tile
        const isMerged = mergedTiles.some(
          tile => tile.row === row && tile.col === col
        );
        
        tiles.push(
          <Tile 
            key={`${row}-${col}-${value}`} 
            value={value} 
            row={row} 
            col={col}
            isNew={isNew}
            hasMerged={isMerged}
            cellSize={cellSize}
          />
        );
      }
    }
  }

  return (
    <BoardContainer>
      <Grid>
        {Array(16).fill(0).map((_, index) => (
          <Cell key={index} />
        ))}
      </Grid>
      {tiles}
    </BoardContainer>
  );
}; 