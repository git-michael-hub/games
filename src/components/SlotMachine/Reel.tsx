import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface ReelProps {
  symbols: string[];
  spinning: boolean;
  delay: number;
}

const ReelContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: #000;
  border-radius: 5px;
  overflow: hidden;
  flex: 1;
  position: relative;
  height: 250px; /* Fixed height for the reel container */
`;

const ReelStrip = styled(motion.div)`
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 100%;
`;

const Symbol = styled(motion.div)<{ $fixed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  font-size: 3rem;
  background: ${({ $fixed }) => $fixed ? 'linear-gradient(to bottom, #333, #000)' : 'transparent'};
  padding: 10px;
  border-radius: 5px;
  margin: 2px;
  box-shadow: ${({ $fixed }) => $fixed ? '0 0 10px rgba(255, 215, 0, 0.3)' : 'none'};
`;

// Create a larger set of symbols for continuous animation
const createExtendedSymbols = (symbols: string[], repeats: number = 3): string[] => {
  let result: string[] = [];
  for (let i = 0; i < repeats; i++) {
    result = [...result, ...symbols];
  }
  return result;
};

const Reel: React.FC<ReelProps> = ({ symbols, spinning, delay }) => {
  // Create an extended set of symbols for continuous animation
  const extendedSymbols = createExtendedSymbols(symbols, 5);
  
  // Animation variants for continuous spinning
  const spinningVariants = {
    spinning: {
      y: [0, -80 * (extendedSymbols.length - 3)],
      transition: {
        y: { 
          duration: 3, 
          delay,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop"
        }
      }
    },
    stopped: { 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Calculate the viewport size to show just 3 symbols at a time
  const viewportSize = {
    height: '250px',
    overflow: 'hidden'
  };

  return (
    <ReelContainer style={viewportSize}>
      <ReelStrip
        initial={{ y: 0 }}
        animate={spinning ? "spinning" : "stopped"}
        variants={spinningVariants}
      >
        {extendedSymbols.map((symbol, index) => (
          <Symbol 
            key={index}
            $fixed={!spinning}
          >
            {symbol}
          </Symbol>
        ))}
      </ReelStrip>
    </ReelContainer>
  );
};

export default Reel; 