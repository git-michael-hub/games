import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import TextDisplay from './TextDisplay';
import Results from './Results';
import { sampleTexts } from './sampleTexts';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  color: #ccc;
  background-color: #222;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h1`
  margin-bottom: 20px;
  color: #fff;
  font-size: 2.5rem;
`;

interface TimerDisplayProps {
  isLow?: boolean;
}

const TimerDisplay = styled.div<TimerDisplayProps>`
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: ${props => props.isLow ? '#ff4d4d' : '#fff'};
  transition: color 0.3s;
`;

const InputField = styled.textarea`
  width: 100%;
  height: 120px;
  padding: 15px;
  margin: 20px 0;
  border: 2px solid #444;
  background-color: #333;
  color: #fff;
  font-size: 1.1rem;
  border-radius: 8px;
  resize: none;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #4d8bff;
  }
  
  &::placeholder {
    color: #666;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background-color: #4d8bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  margin: 0 8px;
  
  &:hover {
    background-color: #3a7aee;
  }
  
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const TimeOptions = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const TimeButton = styled.button<{ isSelected: boolean }>`
  padding: 8px 16px;
  background-color: ${props => props.isSelected ? '#4d8bff' : '#333'};
  color: white;
  border: 1px solid ${props => props.isSelected ? '#4d8bff' : '#555'};
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.isSelected ? '#3a7aee' : '#444'};
  }
`;

const CategorySelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
`;

const CategoryButton = styled.button<{ isSelected: boolean }>`
  padding: 10px 20px;
  background-color: ${props => props.isSelected ? '#4d8bff' : '#333'};
  color: white;
  border: 1px solid ${props => props.isSelected ? '#4d8bff' : '#555'};
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.isSelected ? '#3a7aee' : '#444'};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  margin: 20px 0;
`;

type TimeDuration = 1 | 3 | 5 | 10;
type TextCategory = 'general' | 'atomicHabits' | 'sevenDeadlySins';

const TypingTest: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [duration, setDuration] = useState<TimeDuration>(10); // Default to 10 minutes
  const [timer, setTimer] = useState<number>(600); // 10 minutes in seconds
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [correctChars, setCorrectChars] = useState<number>(0);
  const [incorrectChars, setIncorrectChars] = useState<number>(0);
  const [category, setCategory] = useState<TextCategory>('general');
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Select a random text on mount or when category changes
  useEffect(() => {
    selectRandomText();
  }, [category]);

  const selectRandomText = () => {
    let textPool: string[] = [];
    
    // Determine which texts to include based on category
    if (category === 'general') {
      // First 10 texts are general category
      textPool = sampleTexts.slice(0, 10);
    } else if (category === 'atomicHabits') {
      // Next 6 texts are Atomic Habits category
      textPool = sampleTexts.slice(10, 16);
    } else if (category === 'sevenDeadlySins') {
      // Last 6 texts are Seven Deadly Sins category
      textPool = sampleTexts.slice(16);
    }
    
    const randomIndex = Math.floor(Math.random() * textPool.length);
    setText(textPool[randomIndex]);
  };

  // Update timer when duration changes
  useEffect(() => {
    setTimer(duration * 60);
  }, [duration]);
  
  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && isActive) {
      // Time's up
      finishTest();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timer]);
  
  const startTest = () => {
    setUserInput('');
    setIsActive(true);
    setIsFinished(false);
    setStartTime(Date.now());
    setCurrentWordIndex(0);
    setCorrectChars(0);
    setIncorrectChars(0);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const resetTest = () => {
    setUserInput('');
    setTimer(duration * 60);
    setIsActive(false);
    setIsFinished(false);
    setStartTime(null);
    setEndTime(null);
    setCurrentWordIndex(0);
    setCorrectChars(0);
    setIncorrectChars(0);
    
    // Select a new random text but keep the same category
    selectRandomText();
  };

  // Restart the test while keeping it active
  const restartTest = () => {
    // Reset the timer to the full duration
    setTimer(duration * 60);
    // Clear the user input
    setUserInput('');
    // Reset tracking stats
    setStartTime(Date.now());
    setEndTime(null);
    setCurrentWordIndex(0);
    setCorrectChars(0);
    setIncorrectChars(0);
    // Select a new random text
    selectRandomText();
    // Focus the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const finishTest = () => {
    setIsActive(false);
    setIsFinished(true);
    setEndTime(Date.now());
  };
  
  const handleDurationChange = (newDuration: TimeDuration) => {
    if (!isActive) {
      setDuration(newDuration);
    }
  };

  const handleCategoryChange = (newCategory: TextCategory) => {
    if (!isActive) {
      setCategory(newCategory);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isActive) return;
    
    const inputValue = e.target.value;
    setUserInput(inputValue);
    
    // Calculate correct and incorrect characters
    let correctCount = 0;
    let incorrectCount = 0;
    
    for (let i = 0; i < inputValue.length; i++) {
      if (i >= text.length) {
        incorrectCount++;
      } else if (inputValue[i] === text[i]) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    }
    
    setCorrectChars(correctCount);
    setIncorrectChars(incorrectCount);
    
    // Check if the test is completed
    if (inputValue.length >= text.length) {
      finishTest();
    }
  };
  
  // Format time from seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const backToMenu = () => {
    // Just return to the setup screen instead of navigating away
    setIsActive(false);
    setIsFinished(false);
    setTimer(duration * 60);
    setUserInput('');
  };
  
  return (
    <Container>
      <Title>{duration} Minute Typing Test</Title>
      
      {!isActive && !isFinished && (
        <>
          <CategorySelector>
            <CategoryButton 
              isSelected={category === 'general'} 
              onClick={() => handleCategoryChange('general')}
            >
              General
            </CategoryButton>
            <CategoryButton 
              isSelected={category === 'atomicHabits'} 
              onClick={() => handleCategoryChange('atomicHabits')}
            >
              Atomic Habits
            </CategoryButton>
            <CategoryButton 
              isSelected={category === 'sevenDeadlySins'} 
              onClick={() => handleCategoryChange('sevenDeadlySins')}
            >
              Seven Deadly Sins
            </CategoryButton>
          </CategorySelector>
          
          <TimeOptions>
            <TimeButton 
              isSelected={duration === 1} 
              onClick={() => handleDurationChange(1)}
            >
              1 Min
            </TimeButton>
            <TimeButton 
              isSelected={duration === 3} 
              onClick={() => handleDurationChange(3)}
            >
              3 Min
            </TimeButton>
            <TimeButton 
              isSelected={duration === 5} 
              onClick={() => handleDurationChange(5)}
            >
              5 Min
            </TimeButton>
            <TimeButton 
              isSelected={duration === 10} 
              onClick={() => handleDurationChange(10)}
            >
              10 Min
            </TimeButton>
          </TimeOptions>
        </>
      )}
      
      <TimerDisplay isLow={timer < 60}>{formatTime(timer)}</TimerDisplay>
      
      {!isActive && !isFinished && (
        <ButtonContainer>
          <Button onClick={startTest}>Start Test</Button>
        </ButtonContainer>
      )}
      
      {isActive && (
        <>
          <TextDisplay 
            text={text} 
            userInput={userInput} 
            currentWordIndex={currentWordIndex}
          />
          
          <InputField
            ref={inputRef}
            value={userInput}
            onChange={handleInputChange}
            placeholder="Start typing here..."
            disabled={!isActive}
          />
          
          <ButtonContainer>
            <Button onClick={restartTest}>Restart</Button>
            <Button onClick={backToMenu}>Back to Menu</Button>
          </ButtonContainer>
        </>
      )}
      
      {isFinished && (
        <>
          <Results 
            timeTaken={startTime && endTime ? (endTime - startTime) / 1000 : 0} 
            correctChars={correctChars}
            incorrectChars={incorrectChars}
            totalChars={text.length}
          />
          <ButtonContainer>
            <Button onClick={resetTest}>Try Again</Button>
            <Button onClick={backToMenu}>Back to Menu</Button>
          </ButtonContainer>
        </>
      )}
    </Container>
  );
};

export default TypingTest; 