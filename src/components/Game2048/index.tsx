import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Board } from './Board';
import { getEmptyBoard, addRandomTile, moveBoard, DIRECTIONS, canMove, hasWon } from './gameLogic';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 500px;
  margin-bottom: 20px;
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
`;

const GameWrapper = styled.div`
  position: relative;
  width: 500px;
  height: 500px;
  margin-bottom: 20px;
`;

const InstructionsContainer = styled.div`
  margin-top: 20px;
  text-align: center;
  color: #776e65;
  max-width: 500px;
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

  // Initialize the game
  useEffect(() => {
    resetGame();
    
    // Try to load best score from localStorage
    const savedBestScore = localStorage.getItem('2048-best-score');
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore, 10));
    }
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

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (gameOver || won || isAnimating) return;

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

      <GameWrapper>
        <Board 
          board={board} 
          newTile={newTile} 
          mergedTiles={mergedTiles} 
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
        <p><strong>HOW TO PLAY:</strong> Use your arrow keys to move the tiles. When two tiles with the same number touch, they merge into one!</p>
      </InstructionsContainer>
    </GameContainer>
  );
};

export default Game2048; 