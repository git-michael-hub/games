/**
 * Angry Bird Game Engine based on Clumsy Bird
 * This module handles the game logic, physics, and rendering
 */

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let gameLoop: number;
let gameState: GameState;

// Game configuration
const config = {
  gravity: 0.25,
  flapPower: -4.6,
  pipeGap: 120,
  pipeFrequency: 90, // frames between pipe spawns
  scrollSpeed: 2,
  groundHeight: 112,
};

// Game assets
const images: Record<string, HTMLImageElement> = {};
const sounds: Record<string, HTMLAudioElement> = {};

// Game state interface
interface GameState {
  bird: {
    x: number;
    y: number;
    width: number;
    height: number;
    velocity: number;
    rotation: number;
    frame: number;
    animation: number[];
    animationTimer: number;
  };
  pipes: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    scored: boolean;
  }>;
  score: number;
  frameCount: number;
  gameOver: boolean;
  started: boolean;
}

// Initialize the game
export function initGame(canvasElement: HTMLCanvasElement) {
  canvas = canvasElement;
  ctx = canvas.getContext('2d')!;
  
  // Load game assets (would normally load actual images)
  loadAssets();
  
  // Initialize game state
  resetGameState();
  
  // Set up event listeners
  setupControls();
  
  // Start game loop
  gameLoop = window.requestAnimationFrame(update);
}

// Stop the game
export function stopGame() {
  if (gameLoop) {
    window.cancelAnimationFrame(gameLoop);
  }
  
  // Remove event listeners
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  canvas?.removeEventListener('click', handleClick);
  canvas?.removeEventListener('touchstart', handleTouch);
}

// Reset the game state
function resetGameState() {
  gameState = {
    bird: {
      x: 60,
      y: canvas.height / 2 - 12,
      width: 34,
      height: 24,
      velocity: 0,
      rotation: 0,
      frame: 0,
      animation: [0, 1, 2],
      animationTimer: 0,
    },
    pipes: [],
    score: 0,
    frameCount: 0,
    gameOver: false,
    started: false,
  };
}

// Load game assets (placeholder)
function loadAssets() {
  // In a real implementation, we would load actual images
  console.log('Loading game assets...');
  
  // Create placeholders for images
  images.bird = new Image();
  images.bird.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAzNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzQiIGhlaWdodD0iMjQiIGZpbGw9IiNGRjNEMDAiLz48Y2lyY2xlIGN4PSIyOCIgY3k9IjgiIHI9IjMiIGZpbGw9IndoaXRlIi8+PGNpcmNsZSBjeD0iMjkiIGN5PSI3IiByPSIxIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjE1IiB5PSIxMCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjIiIGZpbGw9IiNGRkNEMDAiLz48cG9seWdvbiBwb2ludHM9IjM0LDE1IDI4LDEwIDI4LDIwIiBmaWxsPSIjRkZDRDAwIi8+PC9zdmc+';
  
  images.background = new Image();
  images.background.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjQ4MCIgdmlld0JveD0iMCAwIDMyMCA0ODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSI0ODAiIGZpbGw9IiM0ZGNhZmYiLz48L3N2Zz4=';
  
  images.pipe = new Image();
  images.pipe.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTIiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNTIgMzAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI1MiIgaGVpZ2h0PSIzMDAiIGZpbGw9IiM3NWJkMDAiLz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNTIiIGhlaWdodD0iMjAiIGZpbGw9IiM1Mjk0MDAiLz48L3N2Zz4=';
  
  images.ground = new Image();
  images.ground.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjExMiIgdmlld0JveD0iMCAwIDMyMCAxMTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSIxMTIiIGZpbGw9IiNkZWM2NzAiLz48cmVjdCB5PSIwIiB3aWR0aD0iMzIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjQkE5NzNDIi8+PC9zdmc+';
}

// Set up game controls
function setupControls() {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  canvas.addEventListener('click', handleClick);
  canvas.addEventListener('touchstart', handleTouch);
}

// Handle keyboard input
function handleKeyDown(e: KeyboardEvent) {
  if (e.code === 'Space' && !e.repeat) {
    flap();
    if (!gameState.started) {
      gameState.started = true;
    }
  }
}

function handleKeyUp(e: KeyboardEvent) {
  // Optional: Add key up handling if needed
}

// Handle mouse/touch input
function handleClick() {
  flap();
  if (!gameState.started) {
    gameState.started = true;
  }
}

function handleTouch(e: TouchEvent) {
  e.preventDefault();
  flap();
  if (!gameState.started) {
    gameState.started = true;
  }
}

// Make the bird flap
function flap() {
  if (gameState.gameOver) return;
  
  gameState.bird.velocity = config.flapPower;
}

// Main game update loop
function update() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw background
  drawBackground();
  
  if (gameState.started) {
    // Update game state
    updateBird();
    
    // Only update pipes and check for new pipes if game is not over
    if (!gameState.gameOver) {
      updatePipes();
      
      // Increment frame counter
      gameState.frameCount++;
      
      // Add pipes at intervals
      if (gameState.frameCount % config.pipeFrequency === 0) {
        addPipe();
      }
    }
    
    checkCollisions();
  }
  
  // Draw everything
  drawPipes();
  drawBird();
  drawGround();
  drawScore();
  
  if (gameState.gameOver) {
    drawGameOver();
  }
  
  // Continue the game loop
  gameLoop = window.requestAnimationFrame(update);
}

// Update bird position and animation
function updateBird() {
  const bird = gameState.bird;
  
  // Apply gravity
  bird.velocity += config.gravity;
  bird.y += bird.velocity;
  
  // Update bird rotation based on velocity
  bird.rotation = Math.max(-25, Math.min(90, bird.velocity * 10));
  
  // Update animation frame
  if (gameState.frameCount % 5 === 0) {
    bird.frame = (bird.frame + 1) % bird.animation.length;
  }
}

// Add a new pipe pair
function addPipe() {
  const pipeHeight = 300;
  const topHeight = Math.floor(Math.random() * (canvas.height - config.pipeGap - config.groundHeight - 80)) + 20;
  
  // Top pipe
  gameState.pipes.push({
    x: canvas.width,
    y: topHeight - pipeHeight,
    width: 52,
    height: pipeHeight,
    scored: false,
  });
  
  // Bottom pipe
  gameState.pipes.push({
    x: canvas.width,
    y: topHeight + config.pipeGap,
    width: 52,
    height: pipeHeight,
    scored: false,
  });
}

// Update pipe positions
function updatePipes() {
  for (let i = 0; i < gameState.pipes.length; i++) {
    const pipe = gameState.pipes[i];
    
    // Move pipe to the left
    pipe.x -= config.scrollSpeed;
    
    // Check if pipe is off-screen and can be removed
    if (pipe.x + pipe.width < 0) {
      gameState.pipes.splice(i, 1);
      i--;
      continue;
    }
    
    // Check if bird has passed pipe for scoring
    if (!gameState.gameOver && !pipe.scored && pipe.x + pipe.width < gameState.bird.x) {
      pipe.scored = true;
      // Only increment score for one pipe in each pair
      if (i % 2 === 0) {
        gameState.score++;
      }
    }
  }
}

// Check for collisions
function checkCollisions() {
  const bird = gameState.bird;
  
  // Check for collision with ground
  if (bird.y + bird.height >= canvas.height - config.groundHeight) {
    gameState.gameOver = true;
    bird.y = canvas.height - config.groundHeight - bird.height;
  }
  
  // Check for collision with top of screen
  if (bird.y < 0) {
    bird.y = 0;
    bird.velocity = 0;
  }
  
  // Check for collision with pipes
  for (const pipe of gameState.pipes) {
    if (
      bird.x + bird.width > pipe.x &&
      bird.x < pipe.x + pipe.width &&
      bird.y + bird.height > pipe.y &&
      bird.y < pipe.y + pipe.height
    ) {
      gameState.gameOver = true;
    }
  }
}

// Draw the background
function drawBackground() {
  ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
}

// Draw the ground
function drawGround() {
  ctx.drawImage(
    images.ground,
    0,
    canvas.height - config.groundHeight,
    canvas.width,
    config.groundHeight
  );
}

// Draw the bird
function drawBird() {
  const bird = gameState.bird;
  
  ctx.save();
  ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
  ctx.rotate((bird.rotation * Math.PI) / 180);
  
  ctx.drawImage(
    images.bird,
    -bird.width / 2,
    -bird.height / 2,
    bird.width,
    bird.height
  );
  
  ctx.restore();
}

// Draw pipes
function drawPipes() {
  for (const pipe of gameState.pipes) {
    ctx.drawImage(
      images.pipe,
      pipe.x,
      pipe.y,
      pipe.width,
      pipe.height
    );
  }
}

// Draw the score
function drawScore() {
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.font = "28px Arial";
  ctx.textAlign = "center";
  
  const text = gameState.score.toString();
  const x = canvas.width / 2;
  const y = 50;
  
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

// Draw game over message
function drawGameOver() {
  // Background overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Game over text
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.font = "36px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  ctx.strokeText("Game Over", canvas.width / 2, canvas.height / 2 - 30);
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 30);
  
  ctx.font = "24px Arial";
  ctx.strokeText(`Score: ${gameState.score}`, canvas.width / 2, canvas.height / 2 + 20);
  ctx.fillText(`Score: ${gameState.score}`, canvas.width / 2, canvas.height / 2 + 20);
} 