import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Card from './Card';
import Controls from './Controls';
import Rules from './Rules';
import { CardType, Player, GameState } from './types';

// Import styled components from our main file instead of styles
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Define styled components inline
const BlackJackContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 1rem;
  background: linear-gradient(to bottom, #0f623a, #0a4b2e);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
`;

const Title = styled.h1`
  color: gold;
  margin-bottom: 1.5rem;
  font-size: 2.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  text-align: center;
  font-weight: bold;
  letter-spacing: 2px;
`;

const TableTop = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-bottom: 2rem;
  position: relative;
`;

const DealerArea = styled.div`
  width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 1rem;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
`;

const PlayerArea = styled.div`
  width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
  position: relative;
`;

const HandTitle = styled.h2<{ $isDealer?: boolean }>`
  color: ${props => props.$isDealer ? '#ff6b6b' : '#4ecdc4'};
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
`;

const Cards = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  min-height: 150px;
`;

const ScoreDisplay = styled.div<{ $busted?: boolean }>`
  background: ${props => props.$busted ? 'rgba(255, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-weight: bold;
  margin-top: 0.5rem;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
`;

const ResultOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

const ResultMessage = styled.div<{ $result: 'win' | 'lose' | 'push' }>`
  font-size: 3rem;
  font-weight: bold;
  color: ${props => {
    switch (props.$result) {
      case 'win': return 'gold';
      case 'lose': return '#ff6b6b';
      case 'push': return 'white';
      default: return 'white';
    }
  }};
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.7);
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 1rem;
  border: 2px solid ${props => {
    switch (props.$result) {
      case 'win': return 'gold';
      case 'lose': return '#ff6b6b';
      case 'push': return 'white';
      default: return 'white';
    }
  }};
  animation: pulse 1.5s infinite;
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;

const BetDisplay = styled.div`
  background: rgba(0, 0, 0, 0.7);
  color: gold;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-weight: bold;
  margin-top: 1rem;
  border: 2px solid gold;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
`;

const RulesButton = styled(motion.button)`
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 8px 15px;
  background-color: rgba(0, 0, 0, 0.6);
  color: gold;
  border: 1px solid gold;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  z-index: 10;
`;

// Create a new deck of 52 cards
const createDeck = (): CardType[] => {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: CardType[] = [];
  
  // Create a unique card for each suit and value combination
  for (const suit of suits) {
    for (const value of values) {
      deck.push({
        id: `${value}_of_${suit}`,
        suit,
        value,
        faceUp: true,
      });
    }
  }
  
  // Shuffle the deck before returning it
  return shuffle(deck);
};

// Thoroughly shuffle the deck
const shuffle = (deck: CardType[]): CardType[] => {
  const newDeck = [...deck];
  // Use Fisher-Yates shuffle algorithm for a proper shuffle
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

// Calculate the score of a hand
const calculateScore = (cards: CardType[]): number => {
  let score = 0;
  let aces = 0;
  
  for (const card of cards) {
    if (!card.faceUp) continue;
    
    if (card.value === 'A') {
      aces += 1;
      score += 11;
    } else if (['K', 'Q', 'J'].includes(card.value)) {
      score += 10;
    } else {
      score += parseInt(card.value);
    }
  }
  
  // Adjust for aces if needed
  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }
  
  return score;
};

const BlackJack: React.FC = () => {
  const [deck, setDeck] = useState<CardType[]>([]);
  const [dealer, setDealer] = useState<Player>({ cards: [], score: 0 });
  const [player, setPlayer] = useState<Player>({ cards: [], score: 0 });
  const [gameState, setGameState] = useState<GameState>('betting');
  const [result, setResult] = useState<'win' | 'lose' | 'push' | null>(null);
  const [bet, setBet] = useState(0);
  const [balance, setBalance] = useState(1000);
  const [showRules, setShowRules] = useState(false);
  
  // Initialize the game
  const initGame = useCallback(() => {
    const newDeck = createDeck();
    setDeck(newDeck);
    setDealer({ cards: [], score: 0 });
    setPlayer({ cards: [], score: 0 });
    setGameState('betting');
    setResult(null);
  }, []);
  
  // Start a new game when component mounts
  useEffect(() => {
    initGame();
  }, [initGame]);
  
  // Update scores when cards change
  useEffect(() => {
    if (dealer.cards.length > 0) {
      setDealer(prev => ({ ...prev, score: calculateScore(prev.cards) }));
    }
    
    if (player.cards.length > 0) {
      const score = calculateScore(player.cards);
      setPlayer(prev => ({ ...prev, score }));
      
      // Check for bust
      if (score > 21 && gameState === 'playerTurn') {
        setGameState('evaluating');
        setTimeout(() => {
          setResult('lose');
          setGameState('gameOver');
        }, 1000);
      }
      
      // Check for blackjack
      if (score === 21 && player.cards.length === 2 && gameState === 'playerTurn') {
        setGameState('dealerTurn');
        handleDealerTurn();
      }
    }
  }, [dealer.cards, player.cards, gameState]);
  
  // Deal a card
  const dealCard = useCallback((target: 'player' | 'dealer', faceUp: boolean = true): void => {
    if (deck.length === 0) {
      console.warn('Deck is empty, cannot deal more cards!');
      return;
    }
    
    const newDeck = [...deck];
    const card = newDeck.pop()!;
    card.faceUp = faceUp;
    
    console.log(`Dealing ${card.value} of ${card.suit} to ${target}`);
    
    if (target === 'player') {
      setPlayer(prev => {
        const newCards = [...prev.cards, card];
        // Log each card in the player's hand after dealing
        console.log('Player hand:', newCards.map(c => `${c.value} of ${c.suit}`));
        return {
          ...prev,
          cards: newCards
        };
      });
    } else {
      setDealer(prev => {
        const newCards = [...prev.cards, card];
        // Log each card in the dealer's hand after dealing
        console.log('Dealer hand:', newCards.map(c => `${c.value} of ${c.suit}`));
        return {
          ...prev,
          cards: newCards
        };
      });
    }
    
    setDeck(newDeck);
  }, [deck]);
  
  // Handle the dealer's turn
  const handleDealerTurn = useCallback(() => {
    setGameState('dealerTurn');
    
    // First flip the dealer's hidden card
    setDealer(prev => ({
      ...prev,
      cards: prev.cards.map((card, index) => 
        index === 1 ? { ...card, faceUp: true } : card
      )
    }));
    
    // Let the animation play out before continuing
    setTimeout(() => {
      // Recursive function to handle dealer drawing
      const dealerDraw = () => {
        // Get the latest dealer cards to avoid stale closure issues
        const updatedDealerCards = [...dealer.cards].map(card => ({ ...card, faceUp: true }));
        const currentScore = calculateScore(updatedDealerCards);
        
        console.log('Dealer score:', currentScore);
        
        if (currentScore < 17) {
          // Dealer must draw on 16 or less
          dealCard('dealer', true);
          // Continue drawing after a delay with fresh state
          setTimeout(() => {
            // Create fresh reference to dealer cards for next draw evaluation
            setDealer(prevDealer => {
              const prevScore = calculateScore(prevDealer.cards.map(card => ({ ...card, faceUp: true })));
              if (prevScore < 17) {
                setTimeout(dealerDraw, 1000);
              } else {
                // Dealer reached 17 or more, stop and evaluate
                setGameState('evaluating');
                setTimeout(() => evaluateResult(prevScore), 1000);
              }
              return prevDealer; // Return unchanged to avoid unnecessary re-render
            });
          }, 1000);
        } else {
          // Dealer stands on 17 or more
          setGameState('evaluating');
          setTimeout(() => evaluateResult(currentScore), 1000);
        }
      };
      
      // Helper function to evaluate results
      const evaluateResult = (dealerScore: number) => {
        const playerScore = player.score;
        
        if (dealerScore > 21 || playerScore > dealerScore) {
          // Player wins
          setResult('win');
          setBalance(prev => prev + bet * 2);
        } else if (dealerScore > playerScore) {
          // Dealer wins
          setResult('lose');
        } else {
          // Push
          setResult('push');
          setBalance(prev => prev + bet);
        }
        
        setGameState('gameOver');
      };
      
      // Start the dealer draw process
      dealerDraw();
    }, 1000);
  }, [dealer.cards, dealCard, player.score, bet]);
  
  // Start a new game with a bet
  const handlePlaceBet = (amount: number) => {
    if (amount <= 0 || amount > balance) return;
    
    setBet(amount);
    setBalance(prev => prev - amount);
    setGameState('dealing');
    
    // Deal cards
    setTimeout(() => {
      dealCard('player');
      
      setTimeout(() => {
        dealCard('dealer');
        
        setTimeout(() => {
          dealCard('player');
          
          setTimeout(() => {
            dealCard('dealer', false); // Dealer's second card is face down
            setGameState('playerTurn');
          }, 500);
        }, 500);
      }, 500);
    }, 500);
  };
  
  // Handle player hitting
  const handleHit = () => {
    if (gameState !== 'playerTurn') return;
    dealCard('player');
  };
  
  // Handle player standing
  const handleStand = () => {
    if (gameState !== 'playerTurn') return;
    handleDealerTurn();
  };
  
  // Handle doubling down
  const handleDouble = () => {
    if (gameState !== 'playerTurn' || player.cards.length !== 2 || balance < bet) return;
    
    setBalance(prev => prev - bet);
    setBet(prev => prev * 2);
    
    // Deal one more card then stand
    dealCard('player');
    setTimeout(() => {
      handleDealerTurn();
    }, 1000);
  };
  
  // Start a new game
  const handleNewGame = () => {
    initGame();
  };
  
  return (
    <BlackJackContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Title>BlackJack</Title>
      
      <RulesButton
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowRules(true)}
      >
        Rules
      </RulesButton>
      
      <TableTop>
        <DealerArea>
          <HandTitle $isDealer>Dealer's Hand</HandTitle>
          <Cards>
            <AnimatePresence>
              {dealer.cards.map((card, index) => (
                <Card 
                  key={index} 
                  card={card} 
                  index={index} 
                  isDealer={true}
                />
              ))}
            </AnimatePresence>
          </Cards>
          {dealer.cards.length > 0 && (
            <ScoreDisplay $busted={dealer.score > 21}>
              Score: {dealer.score}
            </ScoreDisplay>
          )}
        </DealerArea>
        
        <PlayerArea>
          <HandTitle>Your Hand</HandTitle>
          <Cards>
            <AnimatePresence>
              {player.cards.map((card, index) => (
                <Card 
                  key={index} 
                  card={card} 
                  index={index} 
                  isDealer={false}
                />
              ))}
            </AnimatePresence>
          </Cards>
          {player.cards.length > 0 && (
            <ScoreDisplay $busted={player.score > 21}>
              Score: {player.score}
            </ScoreDisplay>
          )}
          
          {bet > 0 && gameState !== 'betting' && (
            <BetDisplay>Bet: ${bet}</BetDisplay>
          )}
          
          {gameState === 'gameOver' && result && (
            <ResultOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ResultMessage $result={result}>
                {result === 'win' ? 'YOU WIN!' : result === 'lose' ? 'DEALER WINS' : 'PUSH'}
              </ResultMessage>
            </ResultOverlay>
          )}
        </PlayerArea>
      </TableTop>
      
      <Controls 
        gameState={gameState}
        balance={balance}
        onPlaceBet={handlePlaceBet}
        onHit={handleHit}
        onStand={handleStand}
        onDouble={handleDouble}
        onNewGame={handleNewGame}
        currentBet={bet}
      />
      
      <Rules isOpen={showRules} onClose={() => setShowRules(false)} />
    </BlackJackContainer>
  );
};

export default BlackJack; 