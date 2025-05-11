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
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background: #282c34;
  color: white;
  padding: 20px;
  position: relative;
  justify-content: center;
`;

const Navigation = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
  flex-wrap: wrap;
  justify-content: center;
`;

const NavLinkStyled = styled(NavLink)`
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
  border-radius: 25px;
  font-weight: bold;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &.active {
    background: linear-gradient(45deg, #ff4d4d, #f9cb28);
    box-shadow: 0 0 15px rgba(255, 77, 77, 0.5);
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 20px;
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
        
        <Navigation>
          <NavLinkStyled to="/">Slot Machine</NavLinkStyled>
          <NavLinkStyled to="/chess">Chess</NavLinkStyled>
          <NavLinkStyled to="/todo">Todo</NavLinkStyled>
          <NavLinkStyled to="/blackjack">Blackjack</NavLinkStyled>
          <NavLinkStyled to="/bingo">Bingo</NavLinkStyled>
          <NavLinkStyled to="/lotto">Lotto</NavLinkStyled>
          <NavLinkStyled to="/snakes-and-ladders">Snakes & Ladders</NavLinkStyled>
          <NavLinkStyled to="/tic-tac-toe">Tic Tac Toe</NavLinkStyled>
          <NavLinkStyled to="/wheel-of-fortune">Wheel of Fortune</NavLinkStyled>
          <NavLinkStyled to="/2048">2048</NavLinkStyled>
          <NavLinkStyled to="/typing-test">Typing Test</NavLinkStyled>
        </Navigation>
      </AppContainer>
    </Router>
  );
};

export default App; 