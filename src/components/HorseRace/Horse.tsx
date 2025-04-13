import React from 'react';
import styled from 'styled-components';
import { motion, AnimationControls } from 'framer-motion';

interface HorseProps {
  horse: {
    id: number;
    name: string;
    color: string;
    baseSpeed: number;
    odds: number;
  };
  position: number;
  selected: boolean;
  onSelect: () => void;
  animate: AnimationControls;
  isRacing: boolean;
  finished: boolean;
  finishPosition: number;
  totalHorses: number;
}

interface StyledHorseProps {
  color: string;
  position: number;
  totalHorses: number;
  selected: boolean;
  isRacing: boolean;
  finished: boolean;
}

const HorseContainer = styled(motion.div)<StyledHorseProps>`
  position: absolute;
  top: ${props => (props.position + 1) * (100 / (props.totalHorses + 1))}%;
  left: 5%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  cursor: ${props => props.isRacing ? 'default' : 'pointer'};
  z-index: 5;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: ${props => props.finished ? 'calc(100% + 20px)' : '100%'};
    height: 2px;
    background-color: ${props => props.color};
    transform: translateY(-50%);
    opacity: 0.3;
    z-index: -1;
  }
`;

const HorseBody = styled(motion.div)<{ color: string; selected: boolean; finished: boolean; position: number }>`
  position: relative;
  width: 60px;
  height: 30px;
  background-color: ${props => props.color};
  border-radius: 30px 30px 0 15px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  border: ${props => props.selected ? '2px solid gold' : 'none'};
  opacity: ${props => props.finished ? (props.position === 1 ? 1 : 0.7) : 1};
  
  &::after {
    content: '';
    position: absolute;
    top: -15px;
    right: 10px;
    width: 10px;
    height: 20px;
    background-color: ${props => props.color};
    border-radius: 5px 5px 0 0;
  }
`;

const HorseHead = styled(motion.div)<{ color: string }>`
  position: absolute;
  top: -10px;
  left: -15px;
  width: 25px;
  height: 20px;
  background-color: ${props => props.color};
  border-radius: 50% 10% 10% 50%;
  transform: rotate(-45deg);
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 20px;
    background-color: black;
    border-radius: 5px;
    transform: translateX(10px) rotate(45deg);
  }
`;

const HorseLeg = styled(motion.div)<{ color: string; front?: boolean }>`
  position: absolute;
  bottom: -15px;
  left: ${props => props.front ? '40px' : '15px'};
  width: 5px;
  height: 15px;
  background-color: #333;
  border-radius: 0 0 5px 5px;
`;

const HorseInfo = styled.div<{ selected: boolean; isRacing: boolean }>`
  position: absolute;
  left: -120px;
  top: -25px;
  width: 110px;
  text-align: right;
  color: ${props => props.selected ? 'gold' : 'white'};
  font-size: 0.8rem;
  opacity: ${props => props.isRacing ? 0.5 : 1};
  text-shadow: ${props => props.selected ? '0 0 5px rgba(255, 215, 0, 0.7)' : 'none'};
  transition: all 0.3s ease;
`;

const HorseName = styled.div`
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HorseOdds = styled.div`
  font-size: 0.7rem;
  opacity: 0.8;
`;

const FinishPosition = styled.div<{ position: number }>`
  position: absolute;
  right: -25px;
  top: -10px;
  width: 20px;
  height: 20px;
  background-color: ${props => 
    props.position === 1 ? 'gold' : 
    props.position === 2 ? 'silver' : 
    props.position === 3 ? '#CD7F32' : '#666'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: ${props => props.position === 1 ? 'black' : 'white'};
  font-weight: bold;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
`;

const HorseLegs = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 40px;
  bottom: 0;
  display: flex;
  justify-content: space-around;
`;

const Leg = styled(motion.div)<{ color: string }>`
  width: 8px;
  background-color: ${props => props.color};
  border-radius: 4px;
  transform-origin: top center;
`;

// Enhanced galloping animation variants
const legVariants = {
  gallop: (i: number) => ({
    height: ['15px', '25px', '20px', '15px'],
    rotate: [0, -15, -30, 0],
    transition: {
      duration: 0.5,
      times: [0, 0.3, 0.6, 1],
      delay: i * 0.1,
      repeat: Infinity,
      repeatType: 'loop' as const,
      ease: "easeInOut"
    }
  }),
  idle: {
    height: '15px',
    rotate: 0
  },
  racing: (i: number) => ({
    height: ['12px', '28px', '18px', '12px'],
    rotate: [0, -25, -40, 0],
    transition: {
      duration: 0.35,
      times: [0, 0.4, 0.7, 1],
      delay: i * 0.075,
      repeat: Infinity,
      repeatType: 'loop' as const,
      ease: [0.45, 0.05, 0.55, 0.95] // More pronounced galloping curve
    }
  })
};

const headVariants = {
  idle: {},
  animate: {
    rotate: [0, -3, 0, 3, 0],
    y: [0, -1, 0, -1, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: 'loop' as const,
      ease: "easeInOut"
    }
  },
  racing: {
    rotate: [0, -5, 0, 5, 0],
    y: [0, -3, 0, -3, 0],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatType: 'loop' as const,
      ease: [0.45, 0.05, 0.55, 0.95] // Match leg animation ease
    }
  }
};

const tailVariants = {
  idle: {},
  animate: {
    rotate: [0, 5, 0, -5, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'loop' as const,
      ease: "easeInOut"
    }
  },
  racing: {
    rotate: [0, 15, 0, -15, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: 'loop' as const,
      ease: [0.45, 0.05, 0.55, 0.95] // Match other animations
    }
  }
};

// Enhanced body animation for racing
const bodyVariants = {
  idle: {},
  animate: {
    y: [0, -2, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: 'loop' as const
    }
  },
  racing: {
    y: [0, -4, 0, -3, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: 'loop' as const,
      ease: [0.45, 0.05, 0.55, 0.95]
    }
  }
};

const Horse: React.FC<HorseProps> = ({ 
  horse, 
  position, 
  selected, 
  onSelect, 
  animate, 
  isRacing, 
  finished, 
  finishPosition, 
  totalHorses 
}) => {
  const animation = isRacing ? "racing" : (finished ? "idle" : "animate");
  
  return (
    <HorseContainer
      color={horse.color}
      position={position}
      totalHorses={totalHorses}
      selected={selected}
      isRacing={isRacing}
      finished={finished}
      onClick={isRacing ? undefined : onSelect}
      animate={animate}
    >
      <HorseInfo selected={selected} isRacing={isRacing}>
        <HorseName>{horse.name}</HorseName>
        <HorseOdds>{horse.odds}x</HorseOdds>
      </HorseInfo>
      
      <HorseBody 
        color={horse.color} 
        selected={selected} 
        finished={finished} 
        position={finishPosition}
        variants={bodyVariants}
        animate={animation}
      >
        <HorseHead 
          color={horse.color}
          variants={headVariants}
          animate={animation}
        />
        
        <HorseLegs>
          {[0, 1, 2, 3].map(i => (
            <Leg 
              key={i} 
              color="#333"
              variants={legVariants}
              custom={i}
              animate={animation}
            />
          ))}
        </HorseLegs>
      </HorseBody>
      
      {finished && finishPosition > 0 && (
        <FinishPosition position={finishPosition}>
          {finishPosition}
        </FinishPosition>
      )}
    </HorseContainer>
  );
};

export default Horse; 