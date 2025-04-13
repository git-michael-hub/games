import React, { useState } from 'react';
import styled from 'styled-components';
import SlotMachine from './components/SlotMachine';
import Chess from './components/Chess';
import Todo from './components/Todo';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1f1c2c 0%, #928dab 100%);
  color: white;
  font-family: 'Arial', sans-serif;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.7);
  color: gold;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
  gap: 10px;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 10px 20px;
  background: ${props => props.$active ? 
    'linear-gradient(45deg, #FFD700 0%, #FFA500 100%)' : 
    'linear-gradient(45deg, #333 0%, #666 100%)'};
  color: ${props => props.$active ? 'black' : 'white'};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const GameContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const App: React.FC = () => {
  const [activeGame, setActiveGame] = useState<'slots' | 'horserace' | 'carrace' | 'chess' | 'todo'>('slots');
  
  return (
    <AppContainer>
      <Title>Vegas Games</Title>
      
      <TabContainer>
        <Tab $active={activeGame === 'slots'} onClick={() => setActiveGame('slots')}>
          Slot Machine
        </Tab>
        <Tab $active={activeGame === 'chess'} onClick={() => setActiveGame('chess')}>
          Chess
        </Tab>
        <Tab $active={activeGame === 'todo'} onClick={() => setActiveGame('todo')}>
          Todo List
        </Tab>
      </TabContainer>
      
      <GameContainer>
        {activeGame === 'slots' && <SlotMachine />}
        {activeGame === 'chess' && <Chess />}
        {activeGame === 'todo' && <Todo />}
      </GameContainer>
    </AppContainer>
  );
};

export default App; 