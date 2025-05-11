import React, { useState } from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import SlotMachine from './components/SlotMachine';
import Chess from './components/Chess';
import Todo from './components/Todo';
import BlackJack from './components/BlackJack';
import Bingo from './components/Bingo';
import Lotto from './components/Lotto';
import SnakeLadder from './components/SnakeLadder';
import TicTacToe from './components/TicTacToe';
import WheelOfFortune from './components/WheelOfFortune';
import Game2048 from './components/Game2048';
import TypingTest from './components/TypingTest';

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #282c34;
  color: white;
  position: relative;
`;

const Sidebar = styled.div`
  width: 250px;
  background: #1e2127;
  padding: 20px;
  box-shadow: 3px 0 10px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CategoryContainer = styled.div`
  margin-bottom: 30px;
  width: 100%;
`;

const CategoryTitle = styled.h2`
  font-size: 1.4rem;
  margin-bottom: 15px;
  color: #f9cb28;
  position: relative;
  padding-bottom: 8px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 3px;
    background: linear-gradient(45deg, #ff4d4d, #f9cb28);
    border-radius: 3px;
  }
`;

const GameLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NavLinkStyled = styled(NavLink)`
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &.active {
    background: linear-gradient(45deg, #ff4d4d, #f9cb28);
    box-shadow: 0 0 10px rgba(255, 77, 77, 0.3);
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 30px;
  background: linear-gradient(to right, #ff4d4d, #f9cb28);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(255, 77, 77, 0.3);
`;

const GameContainer = styled.div`
  width: 100%;
  max-width: 1200px;
`;

const App: React.FC = () => {
  return (
    <Router>
      <AppContainer>
        <Sidebar>
          <CategoryContainer>
            <CategoryTitle>Games from Scratch</CategoryTitle>
            <GameLinks>
              <NavLinkStyled to="/">Slot Machine</NavLinkStyled>
              <NavLinkStyled to="/chess">Chess</NavLinkStyled>
              <NavLinkStyled to="/todo">Todo</NavLinkStyled>
              <NavLinkStyled to="/blackjack">Blackjack</NavLinkStyled>
              <NavLinkStyled to="/bingo">Bingo</NavLinkStyled>
              <NavLinkStyled to="/lotto">Lotto</NavLinkStyled>
              <NavLinkStyled to="/snakes-and-ladders">Snakes & Ladders</NavLinkStyled>
              <NavLinkStyled to="/tic-tac-toe">Tic Tac Toe</NavLinkStyled>
              <NavLinkStyled to="/wheel-of-fortune">Wheel of Fortune</NavLinkStyled>
            </GameLinks>
          </CategoryContainer>
          
          <CategoryContainer>
            <CategoryTitle>Games Copied</CategoryTitle>
            <GameLinks>
              <NavLinkStyled to="/2048">2048</NavLinkStyled>
              <NavLinkStyled to="/typing-test">Typing Test</NavLinkStyled>
            </GameLinks>
          </CategoryContainer>
        </Sidebar>
        
        <MainContent>
          <Title>Vegas Games</Title>
          
          <GameContainer>
            <Routes>
              <Route path="/" element={<SlotMachine />} />
              <Route path="/chess" element={<Chess />} />
              <Route path="/todo" element={<Todo />} />
              <Route path="/blackjack" element={<BlackJack />} />
              <Route path="/bingo" element={<Bingo />} />
              <Route path="/lotto" element={<Lotto />} />
              <Route path="/snakes-and-ladders" element={<SnakeLadder />} />
              <Route path="/tic-tac-toe" element={<TicTacToe />} />
              <Route path="/wheel-of-fortune" element={<WheelOfFortune />} />
              <Route path="/2048" element={<Game2048 />} />
              <Route path="/typing-test" element={<TypingTest />} />
            </Routes>
          </GameContainer>
        </MainContent>
      </AppContainer>
    </Router>
  );
};

export default App; 