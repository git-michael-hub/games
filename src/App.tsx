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
import AngryBird from './components/AngryBird';
import Snake from './components/Snake';

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #282c34;
  color: white;
  position: relative;
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 999;
    opacity: ${props => props.$isOpen ? 1 : 0};
    transition: opacity 0.3s ease;
    pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
  }
`;

const Sidebar = styled.div<{ $isOpen: boolean }>`
  width: 250px;
  background: #1e2127;
  padding: 20px;
  box-shadow: 3px 0 10px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  z-index: 1000;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: ${props => props.$isOpen ? '0' : '-250px'};
    height: 100%;
    transition: left 0.3s ease;
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MenuToggle = styled.button`
  display: none;
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 1001;
  background: #f9cb28;
  color: #1e2127;
  border: none;
  border-radius: 5px;
  padding: 8px 12px;
  font-size: 18px;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
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
  
  @media (max-width: 768px) {
    margin-top: 40px;
    font-size: 2.5rem;
  }
`;

const GameContainer = styled.div`
  width: 100%;
  max-width: 1200px;
`;

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const closeSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    const touchX = e.touches[0].clientX;
    const distance = touchX - touchStartX;
    
    // If touch started near the left edge and moved right
    if (touchStartX < 30 && distance > 70 && !sidebarOpen) {
      setSidebarOpen(true);
    }
    
    // If sidebar is open and swiped left
    if (sidebarOpen && distance < -70) {
      setSidebarOpen(false);
    }
  };
  
  return (
    <Router>
      <AppContainer 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <Overlay $isOpen={sidebarOpen} onClick={closeSidebar} />
        <MenuToggle onClick={toggleSidebar}>
          {sidebarOpen ? '✕' : '☰'}
        </MenuToggle>
        
        <Sidebar $isOpen={sidebarOpen}>
          <CategoryContainer>
            <CategoryTitle>Games from Scratch</CategoryTitle>
            <GameLinks>
              <NavLinkStyled to="/" onClick={closeSidebar}>Slot Machine</NavLinkStyled>
              <NavLinkStyled to="/chess" onClick={closeSidebar}>Chess</NavLinkStyled>
              <NavLinkStyled to="/todo" onClick={closeSidebar}>Todo</NavLinkStyled>
              <NavLinkStyled to="/blackjack" onClick={closeSidebar}>Blackjack</NavLinkStyled>
              <NavLinkStyled to="/bingo" onClick={closeSidebar}>Bingo</NavLinkStyled>
              <NavLinkStyled to="/lotto" onClick={closeSidebar}>Lotto</NavLinkStyled>
              <NavLinkStyled to="/snakes-and-ladders" onClick={closeSidebar}>Snakes & Ladders</NavLinkStyled>
              <NavLinkStyled to="/tic-tac-toe" onClick={closeSidebar}>Tic Tac Toe</NavLinkStyled>
              {/* <NavLinkStyled to="/wheel-of-fortune">Wheel of Fortune</NavLinkStyled> */}
            </GameLinks>
          </CategoryContainer>
          
          <CategoryContainer>
            <CategoryTitle>Games Copied</CategoryTitle>
            <GameLinks>
              <NavLinkStyled to="/2048" onClick={closeSidebar}>2048</NavLinkStyled>
              <NavLinkStyled to="/typing-test" onClick={closeSidebar}>Typing Test</NavLinkStyled>
              <NavLinkStyled to="/angry-bird" onClick={closeSidebar}>Angry Bird</NavLinkStyled>
              <NavLinkStyled to="/snake" onClick={closeSidebar}>Snake</NavLinkStyled>
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
              <Route path="/angry-bird" element={<AngryBird />} />
              <Route path="/snake" element={<Snake />} />
            </Routes>
          </GameContainer>
        </MainContent>
      </AppContainer>
    </Router>
  );
};

export default App; 