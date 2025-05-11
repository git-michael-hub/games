/**
 * Snake Game Engine
 * Based on the coffee-snake game
 */

// Game constants
const GRID_SIZE = 20; // Size of each grid cell in pixels
const GRID_WIDTH = 20; // Number of cells horizontally
const GRID_HEIGHT = 20; // Number of cells vertically
const INITIAL_SPEED = 150; // Initial speed in ms
const MIN_SPEED = 60; // Minimum speed (maximum difficulty)
const SPEED_DECREASE = 5; // How much to decrease speed after eating food

// Game state
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let snake: { x: number, y: number }[];
let direction: 'up' | 'down' | 'left' | 'right';
let nextDirection: 'up' | 'down' | 'left' | 'right';
let food: { x: number, y: number };
let score: number;
let gameInterval: number;
let gameSpeed: number;
let isPaused: boolean;
let isGameOver: boolean;
let updateScoreCallback: (score: number) => void;
let collisionType: 'wall' | 'self' | null;

// Colors
const colors = {
  background: '#f0f0f0',
  snake: '#4caf50',
  snakeHead: '#388e3c',
  food: '#ff5722',
  grid: '#e0e0e0',
  gameOver: 'rgba(0, 0, 0, 0.7)'
};

/**
 * Initialize the game
 */
export function initGame(canvasElement: HTMLCanvasElement, scoreCallback: (score: number) => void) {
  // Store canvas and context
  canvas = canvasElement;
  ctx = canvas.getContext('2d')!;
  updateScoreCallback = scoreCallback;
  
  console.log('Initializing game with canvas', canvas.width, canvas.height);
  
  // Reset game state
  resetGameState();
  
  // Make sure we set up fresh event listeners
  setupEventListeners();
  
  // Start a fresh game loop
  startGameLoop();
  
  console.log('Game initialized and started');
}

/**
 * Stop the game
 */
export function stopGame() {
  // Clear the game interval
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = 0; // Reset the interval ID
  }
  
  // Remove event listeners
  removeEventListeners();
  
  // Make sure isGameOver is reset
  isGameOver = false;
}

/**
 * Restart the game
 */
export function restartGame() {
  stopGame();
  resetGameState();
  startGameLoop();
  
  // Emit restart event
  const event = new CustomEvent('snake-game-event', { 
    detail: { type: 'restart' } 
  });
  window.dispatchEvent(event);
  
  // Update score display to reset it in the UI
  if (updateScoreCallback) {
    updateScoreCallback(0);
  }
}

/**
 * Reset the game state
 */
function resetGameState() {
  // Create initial snake (3 segments in the middle of the grid)
  const centerX = Math.floor(GRID_WIDTH / 2);
  const centerY = Math.floor(GRID_HEIGHT / 2);
  
  snake = [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY }
  ];
  
  direction = 'right';
  nextDirection = 'right';
  score = 0;
  gameSpeed = INITIAL_SPEED;
  isPaused = false;
  isGameOver = false;
  collisionType = null;
  
  // Place initial food
  placeFood();
  
  // Update score
  if (updateScoreCallback) {
    updateScoreCallback(score);
  }
}

/**
 * Set up event listeners for keyboard controls
 */
function setupEventListeners() {
  console.log('Setting up event listeners');
  // First make sure we don't have duplicate listeners
  removeEventListeners();
  // Then add fresh listeners
  document.addEventListener('keydown', handleKeyDown);
}

/**
 * Remove event listeners
 */
function removeEventListeners() {
  console.log('Removing event listeners');
  document.removeEventListener('keydown', handleKeyDown);
}

/**
 * Handle keyboard input
 */
function handleKeyDown(e: KeyboardEvent) {
  // Prevent default behavior for arrow keys to avoid scrolling
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
    e.preventDefault();
  }
  
  // If game is over, restart the game on any arrow key or WASD press
  if (isGameOver) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
      console.log('Restarting game from keyboard after game over');
      
      // First fully stop the current game
      stopGame();
      
      // Reset game state completely
      resetGameState();
      
      // Set initial direction based on the key pressed
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          direction = 'up';
          nextDirection = 'up';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          direction = 'down';
          nextDirection = 'down';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          direction = 'left';
          nextDirection = 'left';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          direction = 'right';
          nextDirection = 'right';
          break;
      }
      
      // Make sure isGameOver is definitely reset
      isGameOver = false;
      
      // Re-add event listeners (they might have been removed)
      setupEventListeners();
      
      // Start the game loop again
      startGameLoop();
      
      // Emit restart event
      const event = new CustomEvent('snake-game-event', { 
        detail: { type: 'restart' } 
      });
      window.dispatchEvent(event);
      
      // Update score in the UI
      if (updateScoreCallback) {
        updateScoreCallback(0);
      }
      
      return;
    }
  }
  
  // Handle direction change
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      if (direction !== 'down') {
        nextDirection = 'up';
      }
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      if (direction !== 'up') {
        nextDirection = 'down';
      }
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      if (direction !== 'right') {
        nextDirection = 'left';
      }
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      if (direction !== 'left') {
        nextDirection = 'right';
      }
      break;
    case ' ':
      // Pause/resume game
      isPaused = !isPaused;
      break;
  }
}

/**
 * Start the game loop
 */
function startGameLoop() {
  // Clear any existing interval
  if (gameInterval) {
    clearInterval(gameInterval);
  }
  
  // Start a new game interval
  gameInterval = window.setInterval(() => {
    if (!isPaused) {
      if (!isGameOver) {
        update();
      }
      render();
    }
  }, gameSpeed);
}

/**
 * Update game state
 */
function update() {
  // Update direction
  direction = nextDirection;
  
  // Get current head position
  const head = { ...snake[0] };
  
  // Calculate new head position based on direction
  switch (direction) {
    case 'up':
      head.y -= 1;
      break;
    case 'down':
      head.y += 1;
      break;
    case 'left':
      head.x -= 1;
      break;
    case 'right':
      head.x += 1;
      break;
  }
  
  // Check for collisions
  if (checkCollision(head)) {
    console.log('Collision detected! Game over state set to true');
    gameOver();
    return;
  }
  
  // Add new head to the snake
  snake.unshift(head);
  
  // Check if snake ate food
  if (head.x === food.x && head.y === food.y) {
    // Increase score
    score += 10;
    
    // Update score display
    if (updateScoreCallback) {
      updateScoreCallback(score);
    }
    
    // Place new food
    placeFood();
    
    // Increase speed
    if (gameSpeed > MIN_SPEED) {
      gameSpeed -= SPEED_DECREASE;
      // Restart interval with new speed
      startGameLoop();
    }
  } else {
    // Remove tail if food wasn't eaten
    snake.pop();
  }
}

/**
 * Check for collisions with walls or self
 */
function checkCollision(head: { x: number, y: number }): boolean {
  // Check wall collisions more explicitly
  const hitLeftWall = head.x < 0;
  const hitRightWall = head.x >= GRID_WIDTH;
  const hitTopWall = head.y < 0;
  const hitBottomWall = head.y >= GRID_HEIGHT;
  
  // If we hit any wall, return true for collision
  if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
    console.log('Wall collision detected', { 
      x: head.x, 
      y: head.y, 
      hitLeftWall,
      hitRightWall,
      hitTopWall,
      hitBottomWall,
      gridWidth: GRID_WIDTH,
      gridHeight: GRID_HEIGHT
    });
    collisionType = 'wall';
    return true;
  }
  
  // Check for collision with snake body (excluding the head itself)
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      console.log('Self collision detected');
      collisionType = 'self';
      return true;
    }
  }
  
  return false;
}

/**
 * Place food at a random position
 */
function placeFood() {
  let validPosition = false;
  let x = 0;
  let y = 0;
  
  // Find a random position that isn't occupied by the snake
  while (!validPosition) {
    x = Math.floor(Math.random() * GRID_WIDTH);
    y = Math.floor(Math.random() * GRID_HEIGHT);
    
    validPosition = true;
    
    // Check if position is occupied by snake
    for (const segment of snake) {
      if (segment.x === x && segment.y === y) {
        validPosition = false;
        break;
      }
    }
  }
  
  food = { x, y };
}

/**
 * End the game
 */
function gameOver() {
  isGameOver = true;
  
  // Emit collision type event
  if (collisionType === 'wall') {
    // Dispatch an event to notify the React component
    const event = new CustomEvent('snake-game-event', { 
      detail: { type: 'wallCollision' } 
    });
    window.dispatchEvent(event);
  }
  
  // Make sure to update UI immediately
  drawGameOver();
  
  // Also update the React component's score
  if (updateScoreCallback) {
    updateScoreCallback(score);
  }
}

/**
 * Render the game
 */
function render() {
  // Clear canvas
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw grid
  drawGrid();
  
  // Draw food
  drawFood();
  
  // Draw snake
  drawSnake();
}

/**
 * Draw the grid
 */
function drawGrid() {
  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 0.5;
  
  // Draw vertical lines
  for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  
  // Draw horizontal lines
  for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

/**
 * Draw the snake
 */
function drawSnake() {
  snake.forEach((segment, index) => {
    // Use different color for head
    ctx.fillStyle = index === 0 ? colors.snakeHead : colors.snake;
    
    // Draw segment
    ctx.fillRect(
      segment.x * GRID_SIZE,
      segment.y * GRID_SIZE,
      GRID_SIZE,
      GRID_SIZE
    );
    
    // Add inner margin for visual effect
    ctx.fillStyle = index === 0 ? colors.snake : colors.background;
    ctx.fillRect(
      segment.x * GRID_SIZE + 2,
      segment.y * GRID_SIZE + 2,
      GRID_SIZE - 4,
      GRID_SIZE - 4
    );
  });
}

/**
 * Draw the food
 */
function drawFood() {
  // Draw food as a circle
  ctx.fillStyle = colors.food;
  const centerX = food.x * GRID_SIZE + GRID_SIZE / 2;
  const centerY = food.y * GRID_SIZE + GRID_SIZE / 2;
  const radius = GRID_SIZE / 2 - 2;
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw game over screen
 */
function drawGameOver() {
  // Make sure to render the final state of the game first
  render();
  
  // Overlay with semi-transparent background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw a visible container for the game over message
  if (collisionType === 'wall') {
    // Red background for wall collision
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
  } else {
    // Dark background for other game over reasons
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  }
  
  const messageBoxWidth = 300;
  const messageBoxHeight = 200;
  const messageBoxX = (canvas.width - messageBoxWidth) / 2;
  const messageBoxY = (canvas.height - messageBoxHeight) / 2;
  
  // Draw message box with border
  ctx.fillRect(messageBoxX, messageBoxY, messageBoxWidth, messageBoxHeight);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.strokeRect(messageBoxX, messageBoxY, messageBoxWidth, messageBoxHeight);
  
  // Text for game over
  ctx.fillStyle = 'white';
  ctx.font = '30px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GAME OVER', canvas.width / 2, messageBoxY + 40);
  
  // Display collision type message
  ctx.font = '18px Arial';
  if (collisionType === 'wall') {
    ctx.fillText('You hit the wall!', canvas.width / 2, messageBoxY + 80);
  } else if (collisionType === 'self') {
    ctx.fillText('You hit yourself!', canvas.width / 2, messageBoxY + 80);
  }
  
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, canvas.width / 2, messageBoxY + 120);
  
  ctx.font = '16px Arial';
  ctx.fillText('Press any arrow key to restart', canvas.width / 2, messageBoxY + 160);
  
  // Add visible warning banner at bottom for wall collision
  if (collisionType === 'wall') {
    // Create a red banner at the bottom
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
    
    // Add warning text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BOUNDARY VIOLATION DETECTED!', canvas.width / 2, canvas.height - 20);
  }
} 