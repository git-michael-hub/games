import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface ControlsProps {
  gameState: 'idle' | 'selecting' | 'drawing' | 'complete';
  onStartGame: () => void;
  onCreateTicket: () => void;
  onDrawNumbers: () => void;
  onPlayAgain: () => void;
  onQuickPick: () => void;
  credits: number;
  ticketPrice: number;
  selectedNumbers: number[];
  ticketsCount: number;
  maxTickets: number;
}

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled(motion.button)<{ $primary?: boolean; $danger?: boolean; $success?: boolean }>`
  background: ${props => 
    props.$primary ? 'linear-gradient(45deg, #FFD700, #FFA500)' :
    props.$danger ? 'linear-gradient(45deg, #f5365c, #f56036)' :
    props.$success ? 'linear-gradient(45deg, #2dce89, #2fcf5e)' :
    'linear-gradient(45deg, #5e72e4, #825ee4)'
  };
  color: ${props => props.$primary ? '#000' : '#fff'};
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &:disabled {
    background: #555;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const TicketInfo = styled.div`
  text-align: center;
  color: #ccc;
  font-size: 0.9rem;
`;

const Controls: React.FC<ControlsProps> = ({
  gameState,
  onStartGame,
  onCreateTicket,
  onDrawNumbers,
  onPlayAgain,
  onQuickPick,
  credits,
  ticketPrice,
  selectedNumbers,
  ticketsCount,
  maxTickets
}) => {
  // Determine if player can create a ticket
  const canCreateTicket = selectedNumbers.length === 6 && credits >= ticketPrice && ticketsCount < maxTickets;
  
  // Determine if player can start the game
  const canStartGame = credits >= ticketPrice && gameState === 'idle';
  
  // Determine if player can draw numbers
  const canDrawNumbers = ticketsCount > 0 && gameState === 'drawing';
  
  return (
    <ControlsContainer>
      {gameState === 'selecting' && (
        <TicketInfo>
          {ticketsCount} of {maxTickets} tickets purchased
        </TicketInfo>
      )}
      
      <ButtonRow>
        {/* Idle state: start the game */}
        {gameState === 'idle' && (
          <Button
            $primary
            disabled={!canStartGame}
            onClick={onStartGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Play Now (${ticketPrice})
          </Button>
        )}
        
        {/* Selecting state: quick pick and create ticket */}
        {gameState === 'selecting' && (
          <>
            <Button
              onClick={onQuickPick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={credits < ticketPrice}
            >
              Quick Pick
            </Button>
            
            <Button
              $primary
              disabled={!canCreateTicket}
              onClick={onCreateTicket}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Buy Ticket (${ticketPrice})
            </Button>
            
            {ticketsCount > 0 && (
              <Button
                $success
                onClick={onDrawNumbers}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Draw
              </Button>
            )}
          </>
        )}
        
        {/* Drawing state: no controls, just waiting */}
        {gameState === 'drawing' && (
          <Button
            $primary
            disabled={!canDrawNumbers}
            onClick={onDrawNumbers}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Draw Numbers
          </Button>
        )}
        
        {/* Complete state: play again */}
        {gameState === 'complete' && (
          <Button
            $primary
            onClick={onPlayAgain}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Play Again
          </Button>
        )}
      </ButtonRow>
    </ControlsContainer>
  );
};

export default Controls; 