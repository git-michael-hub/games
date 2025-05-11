/**
 * Car Racing Game Engine
 * Based on the track racing game
 */

// Game constants
const ACCELERATION = 0.2; // Acceleration rate per frame
const FRICTION = 0.05; // Friction coefficient
const MAX_SPEED = 5; // Maximum speed
const TURNING_SPEED = 0.03; // Turning speed coefficient
const OFFROAD_FRICTION = 0.2; // Additional friction when off-road
const TRACK_WIDTH = 100; // Width of the track
const TRACK_SEGMENTS = 50; // Number of segments in the track
const ROAD_WIDTH = 2000; // Width of the entire road

// Game state
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let car: Car;
let track: TrackSegment[];
let keys: { [key: string]: boolean };
let gameLoop: number;
let lastTime: number;
let gameTime: number;
let isGameOver: boolean;
let cameraHeight: number;
let position: number; // Position along the track
let isOffroad: boolean;

// Car object
interface Car {
  x: number;
  speed: number;
  angle: number;
}

// Track segment
interface TrackSegment {
  curve: number; // Curve amount (-1 to 1)
  y: number; // Height of the segment
}

/**
 * Initialize the game
 */
export function initGame(canvasElement: HTMLCanvasElement) {
  canvas = canvasElement;
  ctx = canvas.getContext('2d')!;
  
  console.log('Initializing car game with canvas', canvas.width, canvas.height);
  
  // Initialize game state
  resetGameState();
  
  // Set up event listeners
  setupEventListeners();
  
  // Start the game loop
  lastTime = performance.now();
  gameLoop = requestAnimationFrame(update);
  
  console.log('Car game initialized and started');
}

/**
 * Stop the game
 */
export function stopGame() {
  if (gameLoop) {
    cancelAnimationFrame(gameLoop);
    gameLoop = 0;
  }
  
  removeEventListeners();
}

/**
 * Restart the game
 */
export function restartGame() {
  stopGame();
  resetGameState();
  lastTime = performance.now();
  gameLoop = requestAnimationFrame(update);
}

/**
 * Reset the game state
 */
function resetGameState() {
  car = {
    x: 0, // Middle of the road
    speed: 0,
    angle: 0
  };
  
  keys = {};
  gameTime = 0;
  isGameOver = false;
  cameraHeight = 500;
  position = 0;
  isOffroad = false;
  
  // Generate a new random track
  generateTrack();
}

/**
 * Generate a random track
 */
function generateTrack() {
  track = [];
  
  // Start with a straight segment
  let lastCurve = 0;
  let lastY = 0;
  
  // Generate random track segments
  for (let i = 0; i < TRACK_SEGMENTS; i++) {
    // Gradually change the curve for smoothness
    let curveDelta = Math.random() * 0.2 - 0.1;
    let newCurve = lastCurve + curveDelta;
    newCurve = Math.max(-0.5, Math.min(0.5, newCurve)); // Limit curve severity
    
    // Gradually change the height for hills
    let heightDelta = Math.random() * 20 - 10;
    let newY = lastY + heightDelta;
    
    track.push({
      curve: newCurve,
      y: newY
    });
    
    lastCurve = newCurve;
    lastY = newY;
  }
}

/**
 * Set up event listeners for keyboard controls
 */
function setupEventListeners() {
  console.log('Setting up car game event listeners');
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
}

/**
 * Remove event listeners
 */
function removeEventListeners() {
  console.log('Removing car game event listeners');
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);
}

/**
 * Handle key down events
 */
function handleKeyDown(e: KeyboardEvent) {
  keys[e.key] = true;
  
  // Prevent default behavior for arrow keys to avoid scrolling
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
    e.preventDefault();
  }
}

/**
 * Handle key up events
 */
function handleKeyUp(e: KeyboardEvent) {
  keys[e.key] = false;
}

/**
 * Main game update loop
 */
function update(time: number) {
  const deltaTime = Math.min(50, time - lastTime) / 1000; // Cap at 50ms, convert to seconds
  lastTime = time;
  
  if (!isGameOver) {
    // Update game time
    gameTime += deltaTime;
    
    // Update car physics
    updateCar(deltaTime);
    
    // Check for game over conditions
    checkGameOver();
    
    // Update game stats
    updateStats();
  }
  
  // Render the game
  render();
  
  // Continue the game loop
  gameLoop = requestAnimationFrame(update);
}

/**
 * Update car physics
 */
function updateCar(deltaTime: number) {
  // Handle acceleration (up arrow or W)
  if (keys['ArrowUp'] || keys['w']) {
    car.speed += ACCELERATION * deltaTime;
  }
  
  // Handle braking (down arrow or S)
  if (keys['ArrowDown'] || keys['s']) {
    car.speed -= ACCELERATION * 2 * deltaTime;
  }
  
  // Apply friction
  let currentFriction = FRICTION;
  
  // Check if car is off-road
  const trackSegment = track[Math.floor(position) % track.length];
  const roadX = trackSegment.curve * car.speed * 500; // Road curves more at higher speeds
  
  // Calculate car's position relative to the road
  const carPositionOnRoad = car.x - roadX;
  isOffroad = Math.abs(carPositionOnRoad) > TRACK_WIDTH / 2;
  
  // Apply additional friction when off-road
  if (isOffroad) {
    currentFriction += OFFROAD_FRICTION;
  }
  
  car.speed -= car.speed * currentFriction * deltaTime;
  
  // Clamp speed
  car.speed = Math.max(0, Math.min(MAX_SPEED, car.speed));
  
  // Handle turning (left/right arrows or A/D)
  if (car.speed > 0) {
    if (keys['ArrowLeft'] || keys['a']) {
      car.angle -= TURNING_SPEED * car.speed * deltaTime;
    }
    if (keys['ArrowRight'] || keys['d']) {
      car.angle += TURNING_SPEED * car.speed * deltaTime;
    }
  }
  
  // Update car position based on speed and angle
  car.x += Math.sin(car.angle) * car.speed * 60 * deltaTime;
  
  // Keep car within reasonable bounds
  car.x = Math.max(-ROAD_WIDTH/2, Math.min(ROAD_WIDTH/2, car.x));
  
  // Update position along the track
  position += car.speed * deltaTime * 5;
}

/**
 * Check for game over conditions
 */
function checkGameOver() {
  // Game over if off-road and speed is very low
  if (isOffroad && car.speed < 0.1) {
    console.log('Game over - stuck off-road');
    gameOver();
  }
}

/**
 * Update game stats and notify the UI
 */
function updateStats() {
  // Calculate distance in miles (arbitrary conversion)
  const distance = position / 100;
  
  // Calculate speed in mph (arbitrary conversion)
  const speed = car.speed * 30;
  
  // Create stats object
  const stats = {
    time: gameTime,
    speed: speed,
    distance: distance
  };
  
  // Dispatch event to update UI
  const event = new CustomEvent('car-game-event', {
    detail: {
      type: 'updateStats',
      stats: stats
    }
  });
  
  window.dispatchEvent(event);
}

/**
 * End the game
 */
function gameOver() {
  isGameOver = true;
  
  // Dispatch game over event
  const event = new CustomEvent('car-game-event', {
    detail: {
      type: 'gameOver'
    }
  });
  
  window.dispatchEvent(event);
}

/**
 * Render the game
 */
function render() {
  // Clear the canvas
  ctx.fillStyle = '#94D994'; // Grass color
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Set up perspective projection
  const baseY = canvas.height * 0.85; // Horizon position
  const segmentLength = 500; // Length of each segment in 3D space
  
  // Draw the sky
  ctx.fillStyle = '#5587F5'; // Sky color
  ctx.fillRect(0, 0, canvas.width, baseY);
  
  // Draw the track
  renderTrack(baseY);
  
  // Draw the car
  renderCar();
  
  // Draw debug info
  if (isOffroad) {
    ctx.fillStyle = 'red';
    ctx.font = '20px Arial';
    ctx.fillText('OFF-ROAD!', canvas.width - 110, 30);
  }
  
  // Draw game over overlay if game is over
  if (isGameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

/**
 * Render the track with perspective
 */
function renderTrack(baseY: number) {
  const baseX = canvas.width / 2; // Center of the screen
  
  // Draw track segments from back to front
  for (let i = 1; i < 50; i++) {
    const perspectiveScale = i / 50; // Scale for perspective effect
    const segmentIndex = (Math.floor(position) + i) % track.length;
    const segment = track[segmentIndex];
    
    // Calculate road curvature
    const curve = segment.curve * i * i * 3; // Exaggerate curve for visual effect
    
    // Calculate segment positions with perspective
    const segmentWidth = (TRACK_WIDTH * perspectiveScale) * 5;
    const segmentY = baseY - (perspectiveScale * 500) - (segment.y * perspectiveScale);
    
    // Road
    ctx.fillStyle = i % 2 === 0 ? '#777777' : '#888888'; // Alternating road colors
    ctx.beginPath();
    ctx.moveTo(baseX - segmentWidth/2 + curve, segmentY);
    ctx.lineTo(baseX + segmentWidth/2 + curve, segmentY);
    ctx.lineTo(baseX + segmentWidth/2 * 1.1 + curve * 1.1, segmentY + 20);
    ctx.lineTo(baseX - segmentWidth/2 * 1.1 + curve * 1.1, segmentY + 20);
    ctx.closePath();
    ctx.fill();
    
    // Road markings
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(baseX - 2 + curve, segmentY, 4, 3);
  }
}

/**
 * Render the car
 */
function renderCar() {
  const carX = canvas.width / 2;
  const carY = canvas.height * 0.8;
  
  ctx.save();
  
  // Apply car angle for turning effect
  ctx.translate(carX, carY);
  ctx.rotate(car.angle * 0.5); // Reduce rotation for visual effect
  
  // Draw car body
  ctx.fillStyle = '#FF0000'; // Red car
  ctx.fillRect(-15, -30, 30, 60);
  
  // Draw windshield
  ctx.fillStyle = '#AAAAFF';
  ctx.fillRect(-10, -25, 20, 15);
  
  // Draw wheels
  ctx.fillStyle = '#000000';
  ctx.fillRect(-18, -20, 8, 12); // Left front wheel
  ctx.fillRect(10, -20, 8, 12); // Right front wheel
  ctx.fillRect(-18, 10, 8, 12); // Left rear wheel
  ctx.fillRect(10, 10, 8, 12); // Right rear wheel
  
  ctx.restore();
} 