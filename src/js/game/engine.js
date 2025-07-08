import { GAME_CONFIG, GHOST_CONFIG, GAME_STATES } from '../utils/constants.js';
import { MazeGenerator } from '../maze/generator.js';
import { MazeRenderer } from '../maze/renderer.js';

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new MazeRenderer(canvas);
    this.mazeGenerator = new MazeGenerator();
    
    // Game state
    this.state = GAME_STATES.LOADING;
    this.currentLevel = 1;
    this.playerLives = 5;
    this.totalScore = 0;
    this.completedLevels = 0;
    this.averageScore = 0;
    
    // Game objects
    this.map = [];
    this.pelletMap = [];
    this.pelletsLeft = 0;
    this.totalPelletsInLevel = 0;
    this.pelletsCollected = 0;
    this.pacman = { x: 0, y: 0, direction: 'right' };
    this.ghosts = [];
    this.horizontalWalls = [];
    this.verticalWalls = [];
    
    // Effects
    this.celebrationParticles = [];
    this.gameOverParticles = [];
    this.weaponParticles = [];
    this.isCelebrating = false;
    this.isGameOverAnimating = false;
    
    // Intervals
    this.ghostMoveInterval = null;
    this.weaponUpdateInterval = null;
    
    // Timing
    this.levelStartTime = 0;
    this.currentScore = 0;
    
    // Initialize
    this.init();
  }

  init() {
    console.log('Initializing game engine...');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.resetGame();
  }

  resizeCanvas() {
    // Account for safe areas on mobile devices
    const safeAreaTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0');
    const safeAreaBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0');
    
    // Use full screen width minus padding (zero on mobile)
    let horizontalPadding = GAME_CONFIG.HORIZONTAL_PADDING;
    if (window.innerWidth <= 480) {
      horizontalPadding = GAME_CONFIG.MOBILE_HORIZONTAL_PADDING;
    }
    
    const availableWidth = window.innerWidth - horizontalPadding;
    const availableHeight = window.innerHeight - safeAreaTop - safeAreaBottom - GAME_CONFIG.UI_SPACE;
    
    // Calculate the largest size that fits while preserving aspect ratio
    const aspect = GAME_CONFIG.MAP_WIDTH / GAME_CONFIG.MAP_HEIGHT;
    let canvasWidth = availableWidth;
    let canvasHeight = availableWidth / aspect;
    if (canvasHeight > availableHeight) {
      canvasHeight = availableHeight;
      canvasWidth = canvasHeight * aspect;
    }
    
    // Calculate tile size
    let size = canvasWidth / GAME_CONFIG.MAP_WIDTH;
    size = Math.max(size, GAME_CONFIG.MIN_TILE_SIZE);
    canvasWidth = GAME_CONFIG.MAP_WIDTH * size;
    canvasHeight = GAME_CONFIG.MAP_HEIGHT * size;
    
    // Set canvas size and style
    this.canvas.style.width = canvasWidth + 'px';
    this.canvas.style.height = canvasHeight + 'px';
    this.canvas.width = Math.round(canvasWidth);
    this.canvas.height = Math.round(canvasHeight);
    
    // Update tile size
    this.renderer.setTileSize(size);
    window.tileSize = size;
  }

  resetGame() {
    console.log('Resetting game...');
    
    // Reset celebration state
    this.isCelebrating = false;
    this.celebrationParticles = [];
    
    // Reset game over animation state
    this.isGameOverAnimating = false;
    this.gameOverParticles = [];
    
    // Reset weapon system
    this.weaponParticles = [];
    
    // Get level parameters
    const { lives, ghostCount } = this.getLevelParameters(this.currentLevel);
    this.playerLives = lives;
    
    // Start timing for this level
    this.levelStartTime = Date.now();
    
    // Generate maze
    const mazeData = this.mazeGenerator.generateRandomMap(this.currentLevel);
    this.map = mazeData.map;
    this.horizontalWalls = mazeData.horizontalWalls;
    this.verticalWalls = mazeData.verticalWalls;
    
    // Generate pellets
    const pelletData = this.mazeGenerator.generatePellets(this.map);
    this.pelletMap = pelletData.pelletMap;
    this.pelletsLeft = pelletData.pelletCount;
    this.totalPelletsInLevel = this.pelletsLeft;
    this.pelletsCollected = 0;
    
    // Initialize Pacboy
    this.pacman = { x: 0, y: 0, direction: 'right' };
    
    // Generate ghosts
    this.generateGhosts(ghostCount);
    
    // Start game loops
    this.startGameLoops();
    
    // Update display
    this.updateDisplay();
    
    // Draw initial state
    this.draw();
    
    this.state = GAME_STATES.PLAYING;
    console.log('Game reset complete');
  }

  getLevelParameters(level) {
    // Lives: 1 at level 1, 5 at level 100
    const lives = Math.min(5, 1 + Math.floor((level - 1) / GAME_CONFIG.LIVES_PROGRESSION));
    
    // Ghost count: Progressive difficulty
    let ghostCount = 1;
    for (const [breakpoint, count] of Object.entries(GAME_CONFIG.GHOST_COUNT_BREAKPOINTS)) {
      if (level <= parseInt(breakpoint)) {
        ghostCount = count;
        break;
      }
    }
    
    return { lives, ghostCount };
  }

  generateGhosts(ghostCount) {
    this.ghosts = [];
    console.log(`Level ${this.currentLevel}: Spawning ${ghostCount} ghosts`);
    
    for (let i = 0; i < ghostCount; i++) {
      const ghostPosition = this.findStrategicGhostPosition(i, ghostCount);
      
      this.ghosts.push({
        x: ghostPosition.x,
        y: ghostPosition.y,
        color: GHOST_CONFIG.COLORS[i],
        name: GHOST_CONFIG.NAMES[i]
      });
    }
    
    console.log(`Ghosts spawned:`, this.ghosts.map(g => `${g.name} at (${g.x}, ${g.y})`));
  }

  findStrategicGhostPosition(ghostIndex, totalGhosts) {
    const validPositions = [];
    
    // Find all valid positions
    for (let y = 1; y < GAME_CONFIG.MAP_HEIGHT - 1; y++) {
      for (let x = 1; x < GAME_CONFIG.MAP_WIDTH - 1; x++) {
        if (this.map[y][x] === 0 && 
            !this.ghosts.some(g => g.x === x && g.y === y) && 
            (x !== 0 || y !== 0)) {
          validPositions.push({x, y});
        }
      }
    }
    
    if (validPositions.length === 0) {
      return {
        x: 1 + Math.floor(Math.random() * (GAME_CONFIG.MAP_WIDTH - 2)),
        y: 1 + Math.floor(Math.random() * (GAME_CONFIG.MAP_HEIGHT - 2))
      };
    }
    
    // Score positions based on strategic value
    const scoredPositions = validPositions.map(pos => {
      let score = 0;
      
      // Avoid positions too close to start
      const startDistance = Math.abs(pos.x - 0) + Math.abs(pos.y - 0);
      if (startDistance < 3) score -= 20;
      
      // Avoid positions too close to other ghosts
      for (const ghost of this.ghosts) {
        const ghostDistance = Math.abs(pos.x - ghost.x) + Math.abs(pos.y - ghost.y);
        if (ghostDistance < 2) score -= 15;
      }
      
      // Prefer positions near the middle of the maze for better coverage
      const centerX = GAME_CONFIG.MAP_WIDTH / 2;
      const centerY = GAME_CONFIG.MAP_HEIGHT / 2;
      const centerDistance = Math.abs(pos.x - centerX) + Math.abs(pos.y - centerY);
      score += (10 - centerDistance) * 2;
      
      return {pos, score};
    });
    
    // Sort by score and pick the best position
    scoredPositions.sort((a, b) => b.score - a.score);
    
    // Add some randomness to avoid predictable placement
    const randomFactor = Math.random();
    if (randomFactor < 0.7) {
      return scoredPositions[0].pos;
    } else if (randomFactor < 0.9) {
      return scoredPositions[Math.floor(scoredPositions.length * 0.3)].pos;
    } else {
      return scoredPositions[Math.floor(scoredPositions.length * 0.6)].pos;
    }
  }

  startGameLoops() {
    // Clear existing intervals
    if (this.ghostMoveInterval) clearInterval(this.ghostMoveInterval);
    if (this.weaponUpdateInterval) clearInterval(this.weaponUpdateInterval);
    
    // Start ghost movement
    this.ghostMoveInterval = setInterval(() => {
      this.moveGhosts();
    }, GAME_CONFIG.GHOST_MOVE_INTERVAL);
    
    // Start weapon particle updates
    this.weaponUpdateInterval = setInterval(() => {
      this.updateWeaponParticles();
      this.draw();
    }, GAME_CONFIG.WEAPON_UPDATE_INTERVAL);
  }

  moveGhosts() {
    for (const ghost of this.ghosts) {
      // Try random directions until a valid move is found
      const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      for (let i = dirs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
      }
      
      for (const [dx, dy] of dirs) {
        const nx = ghost.x + dx;
        const ny = ghost.y + dy;
        if (this.map[ny] && this.map[ny][nx] === 0 && 
            !this.ghosts.some(g => g !== ghost && g.x === nx && g.y === ny) && 
            !this.mazeGenerator.isMoveBlockedByDivider(ghost.x, ghost.y, nx, ny)) {
          ghost.x = nx;
          ghost.y = ny;
          break;
        }
      }
    }
    
    // Check collision with Pacboy
    this.checkGhostCollision();
  }

  checkGhostCollision() {
    for (const ghost of this.ghosts) {
      if (ghost.x === this.pacman.x && ghost.y === this.pacman.y) {
        this.handleGhostCollision();
        return;
      }
    }
  }

  handleGhostCollision() {
    this.playerLives--;
    if (this.playerLives <= 0) {
      this.gameOver();
    } else {
      this.loseLife();
    }
  }

  gameOver() {
    console.log('Game Over!');
    this.state = GAME_STATES.GAME_OVER;
    
    // Stop game loops
    if (this.ghostMoveInterval) clearInterval(this.ghostMoveInterval);
    if (this.weaponUpdateInterval) clearInterval(this.weaponUpdateInterval);
    
    // Show game over message
    this.showMessage('Game Over!', 2000);
    
    // Reset to level 1 after delay
    setTimeout(() => {
      this.currentLevel = 1;
      this.totalScore = 0;
      this.completedLevels = 0;
      this.averageScore = 0;
      this.resetGame();
    }, 2000);
  }

  loseLife() {
    console.log(`Lost a life! Lives remaining: ${this.playerLives}`);
    
    // Reset Pacboy position
    this.pacman.x = 0;
    this.pacman.y = 0;
    this.pacman.direction = 'right';
    
    // Collect pellet if one exists at respawn position
    this.collectPelletAtPosition(this.pacman.x, this.pacman.y);
    
    // Update display
    this.updateDisplay();
    this.showMessage(`Lost a life! Lives remaining: ${this.playerLives}`, 2000);
  }

  collectPelletAtPosition(x, y) {
    if (this.pelletMap[y] && this.pelletMap[y][x] === 1) {
      this.pelletMap[y][x] = 0;
      this.pelletsLeft--;
      this.pelletsCollected++;
      
      // Play waka sound
      this.playWakaSound();
    }
  }

  playWakaSound() {
    // This will be implemented in the audio module
    console.log('Waka sound played');
  }

  showMessage(text, duration = 3000) {
    // This will be implemented in the UI module
    console.log('Message:', text);
  }

  updateDisplay() {
    // Update level display
    const levelDisplay = document.getElementById('levelDisplay');
    if (levelDisplay) {
      levelDisplay.querySelector('.value').innerText = this.currentLevel;
    }
    
    // Update lives display
    const livesDisplay = document.getElementById('livesDisplay');
    if (livesDisplay) {
      livesDisplay.querySelector('.value').innerText = this.playerLives;
    }
    
    // Update score display
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (scoreDisplay) {
      scoreDisplay.innerHTML = `<span class="label">Total: </span><span class="value">${this.totalScore}</span><span class="label"> | Avg: </span><span class="value">${this.averageScore}</span>`;
    }
  }

  draw() {
    // Draw maze and game elements
    this.renderer.drawMaze(this.map, this.horizontalWalls, this.verticalWalls, this.pelletMap);
    
    // Draw Pacboy
    this.renderer.drawPacboy(this.pacman);
    
    // Draw ghosts
    this.renderer.drawGhosts(this.ghosts, [], []); // frozenGhosts and burningGhosts will be implemented
    
    // Draw weapon particles
    this.renderer.drawWeaponParticles(this.weaponParticles);
    
    // Draw celebration particles
    if (this.isCelebrating) {
      this.renderer.drawCelebrationParticles(this.celebrationParticles);
    }
    
    // Draw game over particles
    if (this.isGameOverAnimating) {
      this.renderer.drawGameOverParticles(this.gameOverParticles);
    }
  }

  updateWeaponParticles() {
    // This will be implemented in the weapons module
    console.log('Updating weapon particles');
  }
} 