import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// Define todo item structure
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

// Component props
interface TodoProps {
  initialTodos?: TodoItem[];
}

// Styled components
const TodoContainer = styled(motion.div)`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  color: white;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
`;

const TodoForm = styled.form`
  display: flex;
  margin-bottom: 2rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem 0 0 0.5rem;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.5);
  }
`;

const AddButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #6e8efb 0%, #a777e3 100%);
  color: white;
  border: none;
  border-radius: 0 0.5rem 0.5rem 0;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    filter: brightness(1.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TodoList = styled.ul`
  list-style: none;
  padding: 0;
`;

const TodoItemContainer = styled(motion.li)`
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
`;

const Checkbox = styled.input`
  width: 1.5rem;
  height: 1.5rem;
  cursor: pointer;
`;

const TodoText = styled.span<{ $completed: boolean }>`
  flex: 1;
  text-decoration: ${props => props.$completed ? 'line-through' : 'none'};
  opacity: ${props => props.$completed ? 0.6 : 1};
`;

const DeleteButton = styled.button`
  background: rgba(255, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 0.3rem;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 0, 0, 0.8);
  }
`;

const TodoStats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
`;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
  removed: {
    opacity: 0,
    x: '-100%',
    transition: { duration: 0.3 }
  }
};

// Todo component
const Todo: React.FC<TodoProps> = ({ initialTodos = [] }) => {
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [newTodoText, setNewTodoText] = useState('');

  // Add new todo
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (newTodoText.trim() === '') return;
    
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false
    };
    
    setTodos(prevTodos => [...prevTodos, newTodo]);
    setNewTodoText('');
  }, [newTodoText]);

  // Toggle todo completion
  const toggleTodo = useCallback((id: string) => {
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  // Delete todo
  const deleteTodo = useCallback((id: string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  }, []);

  // Calculate stats
  const completedCount = todos.filter(todo => todo.completed).length;
  const remainingCount = todos.length - completedCount;

  return (
    <TodoContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Title>Todo List</Title>
      
      <TodoForm onSubmit={handleSubmit}>
        <Input 
          type="text"
          value={newTodoText}
          onChange={e => setNewTodoText(e.target.value)}
          placeholder="Add a new task..."
        />
        <AddButton type="submit" disabled={newTodoText.trim() === ''}>
          Add
        </AddButton>
      </TodoForm>
      
      <TodoList>
        <AnimatePresence mode="popLayout">
          {todos.map(todo => (
            <TodoItemContainer 
              key={todo.id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="removed"
              layout
            >
              <Checkbox 
                type="checkbox" 
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <TodoText $completed={todo.completed}>
                {todo.text}
              </TodoText>
              <DeleteButton onClick={() => deleteTodo(todo.id)}>
                Delete
              </DeleteButton>
            </TodoItemContainer>
          ))}
        </AnimatePresence>
      </TodoList>
      
      {todos.length > 0 && (
        <TodoStats>
          <div>{completedCount} completed</div>
          <div>{remainingCount} remaining</div>
        </TodoStats>
      )}
    </TodoContainer>
  );
};

export default Todo; 