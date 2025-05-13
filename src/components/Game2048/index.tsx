import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Board } from './Board';
import { getEmptyBoard, addRandomTile, moveBoard, DIRECTIONS, canMove, hasWon } from './gameLogic';

// Global styles to prevent scrolling
const GlobalStyles = createGlobalStyle`
  body, html {
    overflow: hidden;
    position: fixed;
    width: 100%;
    height: 100%;
    touch-action: none;
    margin: 0;
    padding: 0;
  }
`;

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 8px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
  
  @media (max-width: 500px) {
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-bottom: 5px;
  }
`;

const TitleArea = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  font-size: 80px;
  font-weight: bold;
  margin: 0;
  color: #776e65;
  
  @media (max-width: 768px) {
    font-size: 50px;
  }
  
  @media (max-width: 500px) {
    font-size: 40px;
  }
`;

const Description = styled.p`
  margin: 0;
  color: #776e65;
`;

const ScoreContainer = styled.div`
  background: #bbada0;
  padding: 15px 25px;
  border-radius: 6px;
  color: white;
  font-weight: bold;
  text-align: center;
  font-size: 16px;
  min-width: 100px;
`;

const Score = styled.div`
  font-size: 24px;
`;

const Button = styled.button`
  background: #8f7a66;
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: bold;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  &:hover {
    background: #9f8b76;
  }
`;

const HeaderControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  
  @media (max-width: 500px) {
    align-items: center;
  }
`;

const GameMessage = styled.div<{ $visible: boolean }>`
  display: ${props => (props.$visible ? 'flex' : 'none')};
  position: absolute;
  background: rgba(238, 228, 218, 0.73);
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 100;
  border-radius: 6px;
  text-align: center;
  top: 0;
  left: 0;
`;

const GameMessageTitle = styled.p`
  font-size: 60px;
  font-weight: bold;
  margin: 0 0 20px;
  color: #776e65;
  
  @media (max-width: 768px) {
    font-size: 48px;
  }
  
  @media (max-width: 500px) {
    font-size: 36px;
  }
`;

const GameWrapper = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 10px;
  flex: 1;
  min-height: 0;
  max-height: calc(100vh - 250px);
  
  @media (max-width: 768px) {
    max-height: calc(100vh - 200px);
  }
  
  @media (max-width: 500px) {
    max-height: calc(100vh - 180px);
    margin-bottom: 5px;
  }
`;

const InstructionsContainer = styled.div`
  margin-top: 10px;
  text-align: center;
  color: #776e65;
  width: 100%;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    margin-top: 5px;
    font-size: 0.8rem;
  }
`;

const MobileInstructions = styled.div`
  display: none;
  margin-top: 10px;
  padding: 10px;
  background: rgba(238, 228, 218, 0.5);
  border-radius: 6px;
  text-align: center;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const SwipeDirections = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 5px;
`;

const SwipeArrow = styled.div`
  font-size: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #776e65;
  
  span {
    font-size: 12px;
    margin-top: 2px;
  }
`;

const Game2048: React.FC = () => {
  const [board, setBoard] = useState<number[][]>(getEmptyBoard());
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const [newTile, setNewTile] = useState<{ row: number; col: number; value: number } | null>(null);
  const [mergedTiles, setMergedTiles] = useState<{ row: number; col: number; value: number }[]>([]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [boardSize, setBoardSize] = useState<number>(500);
  
  // Touch gesture handling
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const gameWrapperRef = useRef<HTMLDivElement>(null);

  // Initialize the game and set up responsive board size
  useEffect(() => {
    resetGame();
    
    // Try to load best score from localStorage
    const savedBestScore = localStorage.getItem('2048-best-score');
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore, 10));
    }
    
    // Set board size based on container width
    const updateBoardSize = () => {
      if (gameWrapperRef.current) {
        const containerWidth = gameWrapperRef.current.offsetWidth;
        setBoardSize(containerWidth);
      }
    };
    
    updateBoardSize();
    window.addEventListener('resize', updateBoardSize);
    
    return () => {
      window.removeEventListener('resize', updateBoardSize);
    };
  }, []);

  // Save best score to localStorage
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('2048-best-score', score.toString());
    }
  }, [score, bestScore]);

  // Check if game is over
  useEffect(() => {
    if (hasWon(board)) {
      setWon(true);
    } else if (!canMove(board)) {
      setGameOver(true);
    }
  }, [board]);

  const resetGame = () => {
    // Create a new board with two random tiles
    let newBoard = getEmptyBoard();
    const { newBoard: boardWithOneTile } = addRandomTile(newBoard);
    const { newBoard: boardWithTwoTiles, newTile: secondTile } = addRandomTile(boardWithOneTile);
    
    setBoard(boardWithTwoTiles);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setNewTile(secondTile);
    setMergedTiles([]);
  };

  const makeMove = useCallback((direction: string) => {
    if (gameOver || won || isAnimating) return;

    setIsAnimating(true);
    
    const { newBoard, points, moved, mergedTiles: newMergedTiles } = moveBoard(board, direction);
    
    if (moved) {
      // Set merged tiles for animation
      setMergedTiles(newMergedTiles);
      setBoard(newBoard);
      setScore((prevScore) => prevScore + points);

      // Add new tile after a slight delay to allow animations to complete
      setTimeout(() => {
        const { newBoard: boardWithNewTile, newTile: addedTile } = addRandomTile(newBoard);
        setBoard(boardWithNewTile);
        setNewTile(addedTile);
        setIsAnimating(false);
      }, 150);
    } else {
      setIsAnimating(false);
    }
  }, [board, gameOver, won, isAnimating]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    let direction;
    switch (event.key) {
      case 'ArrowUp':
        direction = DIRECTIONS.UP;
        event.preventDefault();
        break;
      case 'ArrowDown':
        direction = DIRECTIONS.DOWN;
        event.preventDefault();
        break;
      case 'ArrowLeft':
        direction = DIRECTIONS.LEFT;
        event.preventDefault();
        break;
      case 'ArrowRight':
        direction = DIRECTIONS.RIGHT;
        event.preventDefault();
        break;
      default:
        return;
    }

    makeMove(direction);
  }, [makeMove]);

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    // We don't call preventDefault here to allow touch events to be recognized properly
    const touchPos = e.touches[0];
    setTouchStart({ x: touchPos.clientX, y: touchPos.clientY });
  };

  // Handle touch move to detect swipes and prevent scrolling
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    e.preventDefault(); // Prevent scrolling during the game

    const touchPos = e.touches[0];
    const deltaX = touchPos.clientX - touchStart.x;
    const deltaY = touchPos.clientY - touchStart.y;
    const minSwipeDistance = 20;

    // Only process the swipe if it exceeds minimum distance
    if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe - we don't make the move yet to avoid multiple moves
        // Just prevent the default behavior
      } else {
        // Vertical swipe - we don't make the move yet to avoid multiple moves
        // Just prevent the default behavior
      }
    }
  };

  // Handle touch end
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0];
    const deltaX = touchEnd.clientX - touchStart.x;
    const deltaY = touchEnd.clientY - touchStart.y;
    const minSwipeDistance = 50;
    
    // Determine swipe direction based on the largest delta
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      // Horizontal swipe
      if (deltaX > 0) {
        makeMove(DIRECTIONS.RIGHT);
      } else {
        makeMove(DIRECTIONS.LEFT);
      }
    } else if (Math.abs(deltaY) > minSwipeDistance) {
      // Vertical swipe
      if (deltaY > 0) {
        makeMove(DIRECTIONS.DOWN);
      } else {
        makeMove(DIRECTIONS.UP);
      }
    }
    
    setTouchStart(null);
  };

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const keepPlaying = () => {
    setWon(false);
  };

  return (
    <GameContainer>
      <GlobalStyles />
      <Header>
        <TitleArea>
          <Title>2048</Title>
          <Description>Join the tiles, get to 2048!</Description>
        </TitleArea>
        <HeaderControls>
          <div style={{ display: 'flex', gap: '5px' }}>
            <ScoreContainer>
              <div>SCORE</div>
              <Score>{score}</Score>
            </ScoreContainer>
            <ScoreContainer>
              <div>BEST</div>
              <Score>{bestScore}</Score>
            </ScoreContainer>
          </div>
          <Button onClick={resetGame}>New Game</Button>
        </HeaderControls>
      </Header>

      <GameWrapper 
        ref={gameWrapperRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Board 
          board={board} 
          newTile={newTile} 
          mergedTiles={mergedTiles}
          boardSize={boardSize}
        />
        
        <GameMessage $visible={won}>
          <GameMessageTitle>You win!</GameMessageTitle>
          <div>
            <Button onClick={keepPlaying} style={{ marginRight: '10px' }}>Keep going</Button>
            <Button onClick={resetGame}>Try again</Button>
          </div>
        </GameMessage>

        <GameMessage $visible={gameOver && !won}>
          <GameMessageTitle>Game over!</GameMessageTitle>
          <Button onClick={resetGame}>Try again</Button>
        </GameMessage>
      </GameWrapper>

      <InstructionsContainer>
        <p><strong>HOW TO PLAY:</strong> Use arrow keys or swipe to move tiles. Same numbers merge.</p>
      </InstructionsContainer>
    </GameContainer>
  );
};

export default Game2048; 