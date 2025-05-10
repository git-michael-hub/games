// Game constants
export const GRID_SIZE = 4;
export const WIN_SCORE = 2048;

// Direction constants
export const DIRECTIONS = {
  UP: 'UP',
  RIGHT: 'RIGHT',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
};

// Tile interface
export interface Tile {
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  hasMerged?: boolean;
  id?: number; // Unique identifier for tracking tiles
}

/**
 * Creates an empty 4x4 board filled with zeros
 */
export const getEmptyBoard = (): number[][] => {
  return Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
};

/**
 * Creates an empty board of tiles
 */
export const getEmptyTileBoard = (): (Tile | null)[][] => {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
};

/**
 * Finds all empty cells in the board
 */
const getEmptyCells = (board: number[][]): [number, number][] => {
  const emptyCells: [number, number][] = [];
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] === 0) {
        emptyCells.push([row, col]);
      }
    }
  }
  
  return emptyCells;
};

/**
 * Adds a random tile (2 or 4) to an empty cell and marks it as new
 */
export const addRandomTile = (board: number[][]): { 
  newBoard: number[][], 
  newTile: { row: number; col: number; value: number } 
} => {
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) return { newBoard: board, newTile: { row: -1, col: -1, value: 0 } };
  
  // Clone the board
  const newBoard = board.map(row => [...row]);
  
  // Pick a random empty cell
  const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  
  // 90% chance of 2, 10% chance of 4
  const value = Math.random() < 0.9 ? 2 : 4;
  newBoard[row][col] = value;
  
  return { 
    newBoard, 
    newTile: { row, col, value }
  };
};

/**
 * Rotates the board to simplify move logic
 */
const rotateBoard = (board: number[][], times: number = 1): number[][] => {
  let newBoard = board.map(row => [...row]);
  
  for (let i = 0; i < times; i++) {
    const rotated: number[][] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      const newRow: number[] = [];
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        newRow.push(newBoard[row][col]);
      }
      rotated.push(newRow);
    }
    newBoard = rotated;
  }
  
  return newBoard;
};

// Maps positions from rotated board back to original
const mapPositions = (row: number, col: number, rotations: number): [number, number] => {
  let newRow = row;
  let newCol = col;
  
  // Apply rotations in reverse
  for (let i = 0; i < (4 - rotations) % 4; i++) {
    const temp = newRow;
    newRow = newCol;
    newCol = GRID_SIZE - 1 - temp;
  }
  
  return [newRow, newCol];
};

/**
 * Moves tiles to the left and merges them
 * Now also tracks merged tiles
 */
const moveLeft = (board: number[][]): { 
  newBoard: number[][], 
  points: number, 
  moved: boolean,
  mergedTiles: { row: number, col: number, value: number }[]
} => {
  const newBoard: number[][] = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
  let points = 0;
  let moved = false;
  const mergedTiles: { row: number, col: number, value: number }[] = [];
  
  for (let row = 0; row < GRID_SIZE; row++) {
    const currentRow = board[row];
    // Filter out zeros
    const filteredRow = currentRow.filter(cell => cell !== 0);
    
    let newCol = 0;
    for (let i = 0; i < filteredRow.length; i++) {
      // Check for merge
      if (i < filteredRow.length - 1 && filteredRow[i] === filteredRow[i + 1]) {
        const mergedValue = filteredRow[i] * 2;
        newBoard[row][newCol] = mergedValue;
        points += mergedValue;
        mergedTiles.push({ row, col: newCol, value: mergedValue });
        i++; // Skip the next tile
        newCol++;
        moved = true;
      } else {
        // Move without merging
        if (newBoard[row][newCol] === 0 && filteredRow[i] !== 0) {
          newBoard[row][newCol] = filteredRow[i];
          // Check if tile has moved
          if (newCol !== i || currentRow[i] !== filteredRow[i]) {
            moved = true;
          }
          newCol++;
        }
      }
    }
  }
  
  // Check if board has changed
  if (!moved) {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (board[row][col] !== newBoard[row][col]) {
          moved = true;
          break;
        }
      }
      if (moved) break;
    }
  }
  
  return { newBoard, points, moved, mergedTiles };
};

/**
 * Moves tiles in any direction and tracks merged tiles
 */
export const moveBoard = (
  board: number[][],
  direction: string
): { 
  newBoard: number[][], 
  points: number, 
  moved: boolean,
  mergedTiles: { row: number, col: number, value: number }[]
} => {
  let rotations = 0;
  
  // Rotate board to make all moves like a left move
  switch (direction) {
    case DIRECTIONS.LEFT:
      rotations = 0;
      break;
    case DIRECTIONS.UP:
      rotations = 3;
      break;
    case DIRECTIONS.RIGHT:
      rotations = 2;
      break;
    case DIRECTIONS.DOWN:
      rotations = 1;
      break;
  }
  
  // Rotate to make the move a left move
  const rotatedBoard = rotateBoard(board, rotations);
  
  // Perform left move
  const { newBoard, points, moved, mergedTiles } = moveLeft(rotatedBoard);
  
  // Rotate back
  const rotatedBack = rotateBoard(newBoard, (4 - rotations) % 4);
  
  // Map merged tile positions back to original orientation
  const mappedMergedTiles = mergedTiles.map(({ row, col, value }) => {
    const [newRow, newCol] = mapPositions(row, col, rotations);
    return { row: newRow, col: newCol, value };
  });
  
  return { newBoard: rotatedBack, points, moved, mergedTiles: mappedMergedTiles };
};

/**
 * Checks if any move is possible
 */
export const canMove = (board: number[][]): boolean => {
  // Check for empty cells
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] === 0) return true;
    }
  }
  
  // Check for possible merges horizontally
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE - 1; col++) {
      if (board[row][col] === board[row][col + 1]) return true;
    }
  }
  
  // Check for possible merges vertically
  for (let col = 0; col < GRID_SIZE; col++) {
    for (let row = 0; row < GRID_SIZE - 1; row++) {
      if (board[row][col] === board[row + 1][col]) return true;
    }
  }
  
  return false;
};

/**
 * Checks if the player has reached the winning score
 */
export const hasWon = (board: number[][]): boolean => {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] === WIN_SCORE) return true;
    }
  }
  return false;
}; 