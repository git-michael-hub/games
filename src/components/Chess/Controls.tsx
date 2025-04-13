import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface ControlsProps {
  gameStatus: 'playing' | 'check' | 'checkmate' | 'stalemate';
  currentPlayer: 'white' | 'black';
  moveHistory: string[];
  onReset: () => void;
}

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const GameStatus = styled.div<{ $status: string }>`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  padding: 0.8rem;
  text-align: center;
  border-radius: 0.5rem;
  color: white;
  background: ${props => {
    switch(props.$status) {
      case 'check': return 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)';
      case 'checkmate': return 'linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%)';
      case 'stalemate': return 'linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)';
      default: return 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)';
    }
  }};
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StatusIcon = styled.span`
  margin-right: 0.5rem;
  font-size: 1.3rem;
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  margin: 0.5rem 0;
  background: linear-gradient(135deg, #6e8efb 0%, #a777e3 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;

  & > ${Button} {
    flex: 1;
  }
`;

const TimerContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
`;

const PlayerTimer = styled.div<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 0.3rem;
  background: ${props => props.$active 
    ? 'rgba(255, 215, 0, 0.2)' 
    : 'rgba(0, 0, 0, 0.2)'};
  border: ${props => props.$active 
    ? '1px solid rgba(255, 215, 0, 0.5)' 
    : '1px solid transparent'};
  box-shadow: ${props => props.$active 
    ? '0 0 10px rgba(255, 215, 0, 0.2)' 
    : 'none'};
  transition: all 0.3s ease;
  flex: 1;
`;

const TimerLabel = styled.div`
  font-size: 0.7rem;
  margin-bottom: 0.2rem;
  color: #aaa;
`;

const TimerValue = styled.div<{ $running?: boolean }>`
  font-size: 1.1rem;
  font-family: monospace;
  font-weight: bold;
  color: ${props => props.$running ? 'white' : '#999'};
`;

const MoveHistoryContainer = styled(motion.div)`
  max-height: 200px;
  overflow-y: auto;
  padding: 0.8rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(0, 0, 0, 0.2);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 6px;
  }
`;

const MoveHistoryTitle = styled.div`
  font-weight: bold;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MovesGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr 1fr;
  gap: 0.5rem;
  font-size: 0.8rem;
`;

const MoveNumber = styled.div`
  color: #aaa;
  font-family: monospace;
`;

const Move = styled(motion.div)<{ $recent?: boolean }>`
  padding: 0.4rem 0.6rem;
  border-radius: 0.3rem;
  background: ${props => props.$recent ? 'rgba(255, 215, 0, 0.15)' : 'rgba(0, 0, 0, 0.15)'};
  color: ${props => props.$recent ? 'gold' : 'white'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$recent ? 'rgba(255, 215, 0, 0.25)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Controls: React.FC<ControlsProps> = ({ 
  gameStatus, 
  currentPlayer, 
  moveHistory, 
  onReset 
}) => {
  const [showMoveHistory, setShowMoveHistory] = useState(true);
  const [whiteTime, setWhiteTime] = useState(600); // 10 minutes
  const [blackTime, setBlackTime] = useState(600); // 10 minutes
  
  // Update timers
  useEffect(() => {
    const timer = setInterval(() => {
      if (gameStatus === 'playing') {
        if (currentPlayer === 'white') {
          setWhiteTime(prev => Math.max(0, prev - 1));
        } else {
          setBlackTime(prev => Math.max(0, prev - 1));
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentPlayer, gameStatus]);
  
  // Format status message
  const getStatusMessage = () => {
    switch(gameStatus) {
      case 'check':
        return (
          <>
            <StatusIcon>⚠️</StatusIcon>
            {currentPlayer.toUpperCase()} IS IN CHECK!
          </>
        );
      case 'checkmate':
        return (
          <>
            <StatusIcon>👑</StatusIcon>
            CHECKMATE! {currentPlayer === 'white' ? 'Black' : 'White'} WINS!
          </>
        );
      case 'stalemate':
        return (
          <>
            <StatusIcon>🤝</StatusIcon>
            STALEMATE! The game is a draw.
          </>
        );
      default:
        return (
          <>
            <StatusIcon>{currentPlayer === 'white' ? '♔' : '♚'}</StatusIcon>
            {currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn
          </>
        );
    }
  };
  
  // Reset timers when game is reset
  const handleReset = () => {
    setWhiteTime(600);
    setBlackTime(600);
    onReset();
  };
  
  // Organize moves into pairs for display
  const getPairedMoves = () => {
    const pairs = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      pairs.push({
        number: Math.floor(i / 2) + 1,
        white: moveHistory[i],
        black: moveHistory[i + 1] || ''
      });
    }
    return pairs;
  };
  
  return (
    <ControlsContainer>
      <GameStatus $status={gameStatus}>
        {getStatusMessage()}
      </GameStatus>
      
      <TimerContainer>
        <PlayerTimer $active={currentPlayer === 'white'}>
          <TimerLabel>WHITE</TimerLabel>
          <TimerValue $running={currentPlayer === 'white'}>
            {formatTime(whiteTime)}
          </TimerValue>
        </PlayerTimer>
        <PlayerTimer $active={currentPlayer === 'black'}>
          <TimerLabel>BLACK</TimerLabel>
          <TimerValue $running={currentPlayer === 'black'}>
            {formatTime(blackTime)}
          </TimerValue>
        </PlayerTimer>
      </TimerContainer>
      
      <ButtonRow>
        <Button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
        >
          New Game
        </Button>
        
        <Button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMoveHistory(!showMoveHistory)}
        >
          {showMoveHistory ? 'Hide' : 'Show'} Moves
        </Button>
      </ButtonRow>
      
      {showMoveHistory && (
        <MoveHistoryContainer
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MoveHistoryTitle>
            <span>Move History</span>
            <span>{moveHistory.length} Moves</span>
          </MoveHistoryTitle>
          
          {moveHistory.length > 0 ? (
            <MovesGrid>
              <MoveNumber>No.</MoveNumber>
              <Move>White</Move>
              <Move>Black</Move>
              
              {getPairedMoves().map((pair, index) => (
                <React.Fragment key={pair.number}>
                  <MoveNumber>{pair.number}.</MoveNumber>
                  <Move 
                    $recent={index === getPairedMoves().length - 1 && currentPlayer === 'black'}
                    whileHover={{ y: -2 }}
                  >
                    {pair.white}
                  </Move>
                  <Move 
                    $recent={index === getPairedMoves().length - 1 && currentPlayer === 'white' && pair.black !== ''}
                    whileHover={{ y: -2 }}
                  >
                    {pair.black}
                  </Move>
                </React.Fragment>
              ))}
            </MovesGrid>
          ) : (
            <div style={{ color: '#999', textAlign: 'center', padding: '1rem 0' }}>
              No moves yet. Start the game!
            </div>
          )}
        </MoveHistoryContainer>
      )}
    </ControlsContainer>
  );
};

export default Controls; 