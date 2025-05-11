import React from 'react';
import styled from 'styled-components';

interface TextDisplayProps {
  text: string;
  userInput: string;
  currentWordIndex: number;
}

const Container = styled.div`
  width: 100%;
  padding: 20px;
  background-color: #333;
  border-radius: 8px;
  font-size: 1.2rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
`;

const Character = styled.span<{ status: 'correct' | 'incorrect' | 'current' | 'upcoming' }>`
  color: ${props => {
    switch (props.status) {
      case 'correct':
        return '#4caf50';
      case 'incorrect':
        return '#f44336';
      case 'current':
        return '#ffeb3b';
      case 'upcoming':
        return '#ccc';
    }
  }};
  background-color: ${props => props.status === 'current' ? '#444' : 'transparent'};
  font-weight: ${props => props.status === 'current' ? 'bold' : 'normal'};
`;

const TextDisplay: React.FC<TextDisplayProps> = ({ text, userInput, currentWordIndex }) => {
  return (
    <Container>
      {text.split('').map((char, index) => {
        let status: 'correct' | 'incorrect' | 'current' | 'upcoming';
        
        if (index < userInput.length) {
          status = userInput[index] === char ? 'correct' : 'incorrect';
        } else if (index === userInput.length) {
          status = 'current';
        } else {
          status = 'upcoming';
        }
        
        return (
          <Character 
            key={index} 
            status={status}
          >
            {char}
          </Character>
        );
      })}
    </Container>
  );
};

export default TextDisplay; 