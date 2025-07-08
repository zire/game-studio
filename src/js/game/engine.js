import { GAME_CONFIG, GHOST_CONFIG, GAME_STATES } from '../utils/constants.js';
import { MazeGenerator } from '../maze/generator.js';
import { MazeRenderer } from '../maze/renderer.js';
import { AudioManager } from '../audio/sounds.js';

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new MazeRenderer(canvas);
    this.mazeGenerator = new MazeGenerator();
    this.audioManager = new AudioManager();
    
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
    
    // Background color system
    this.currentColorScheme = 0;
    this.colorSchemes = [
      { name: 'Deep Space', background: '#0a0a1a', accent: '#4a90e2' },
      { name: 'Sunset', background: '#2c1810', accent: '#ff6b35' },
      { name: 'Ocean', background: '#0f1419', accent: '#00bfff' },
      { name: 'Forest', background: '#0a1a0a', accent: '#228b22' },
      { name: 'Purple', background: '#1a0a1a', accent: '#9370db' },
      { name: 'Golden', background: '#1a1a0a', accent: '#ffd700' },
      { name: 'Crimson', background: '#1a0a0a', accent: '#dc143c' },
      { name: 'Arctic', background: '#0a1a1a', accent: '#87ceeb' }
    ];
    
    // Weapon cooldown system
    this.fireBlastCooldown = 0;
    this.freezeWindCooldown = 0;
    this.lastUpdateTime = Date.now();
    
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
    
    // Change background color for new level
    this.changeBackgroundColor();
    
    // Reset celebration state
    this.isCelebrating = false;
    this.celebrationParticles = [];
    
    // Reset game over animation state
    this.isGameOverAnimating = false;
    this.gameOverParticles = [];
    
    // Reset weapon system
    this.weaponParticles = [];
    this.fireBlastCooldown = 0;
    this.freezeWindCooldown = 0;
    this.lastUpdateTime = Date.now();
    
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
    
    // Enable weapon buttons
    this.enableWeaponButtons();
    
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
    if (this.particleInterval) clearInterval(this.particleInterval);
    
    // Start ghost movement
    this.ghostMoveInterval = setInterval(() => {
      this.moveGhosts();
    }, GAME_CONFIG.GHOST_MOVE_INTERVAL);
    
    // Start weapon particle updates and cooldown updates
    this.weaponUpdateInterval = setInterval(() => {
      this.updateWeaponParticles();
      this.updateCooldowns();
      this.draw();
    }, GAME_CONFIG.WEAPON_UPDATE_INTERVAL);
    
    // Start particle animation loop
    this.particleInterval = setInterval(() => {
      // Update celebration particles
      if (this.isCelebrating) {
        this.updateCelebrationParticles();
        if (this.celebrationParticles.length === 0) {
          this.isCelebrating = false;
        }
        this.draw();
      }
      
      // Update game over particles
      if (this.isGameOverAnimating) {
        this.updateGameOverParticles();
        if (this.gameOverParticles.length === 0) {
          this.isGameOverAnimating = false;
        }
        this.draw();
      }
    }, 16); // 60 FPS for smooth particle animations
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
    
    // Play game over sound
    this.audioManager.playGameOverSound();
    
    // Start game over particle animation
    this.isGameOverAnimating = true;
    this.gameOverParticles = [];
    this.createGameOverParticles(this.pacman.x * (window.tileSize || 20), this.pacman.y * (window.tileSize || 20));
    
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
    
    // Start game over particle animation
    this.isGameOverAnimating = true;
    this.gameOverParticles = [];
    this.createGameOverParticles(this.pacman.x * (window.tileSize || 20), this.pacman.y * (window.tileSize || 20));
    
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
    this.audioManager.playWakaSound();
  }

  showMessage(text, duration = 3000) {
    // Use the global showMessage function
    if (window.showMessage) {
      window.showMessage(text, duration);
    } else {
      console.log('Message:', text);
    }
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
    // Draw maze with current theme
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
    // Update weapon particles
    this.weaponParticles = this.weaponParticles.filter(particle => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Reduce life using decay
      if (particle.decay) {
        particle.life -= particle.decay;
      } else {
        particle.life -= 1;
      }
      
      // Keep particle if still alive
      return particle.life > 0;
    });
  }

  changeBackgroundColor() {
    // Cycle to next color scheme
    this.currentColorScheme = (this.currentColorScheme + 1) % this.colorSchemes.length;
    const scheme = this.colorSchemes[this.currentColorScheme];
    
    console.log('Changing maze background to:', scheme.name);
    
    // Change maze container and canvas background
    const mazeContainer = document.querySelector('.maze-container');
    if (mazeContainer) {
      mazeContainer.style.background = scheme.background + ' !important';
      mazeContainer.style.transition = 'background 2s ease-in-out';
    }
    
    // Change canvas background
    if (this.canvas) {
      this.canvas.style.background = scheme.background + ' !important';
      this.canvas.style.transition = 'background 2s ease-in-out';
    }
    
    // Also change game container background
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
      gameContainer.style.background = scheme.background + ' !important';
      gameContainer.style.transition = 'background 2s ease-in-out';
    }
  }

  pauseGame() {
    if (this.ghostMoveInterval) {
      clearInterval(this.ghostMoveInterval);
      this.ghostMoveInterval = null;
    }
    if (this.weaponUpdateInterval) {
      clearInterval(this.weaponUpdateInterval);
      this.weaponUpdateInterval = null;
    }
    if (this.particleInterval) {
      clearInterval(this.particleInterval);
      this.particleInterval = null;
    }
  }

  resumeGame() {
    this.startGameLoops();
  }

  // Core movement method
  tryMove(dx, dy) {
    if (this.state !== GAME_STATES.PLAYING) return;
    
    const newX = this.pacman.x + dx;
    const newY = this.pacman.y + dy;
    
    // Check if move is valid
    if (this.isValidMove(newX, newY)) {
      this.pacman.x = newX;
      this.pacman.y = newY;
      
      // Update direction
      if (dx > 0) this.pacman.direction = 'right';
      else if (dx < 0) this.pacman.direction = 'left';
      else if (dy > 0) this.pacman.direction = 'down';
      else if (dy < 0) this.pacman.direction = 'up';
      
      // Collect pellet at new position
      this.collectPelletAtPosition(this.pacman.x, this.pacman.y);
      
      // Check for level completion (either all pellets collected or reached exit)
      if (this.pelletsLeft === 0 || this.map[this.pacman.y][this.pacman.x] === 2) {
        this.completeLevel();
      }
      
      // Check for ghost collision
      this.checkGhostCollision();
      
      // Redraw
      this.draw();
    }
  }

  isValidMove(x, y) {
    // Check bounds
    if (x < 0 || x >= GAME_CONFIG.MAP_WIDTH || y < 0 || y >= GAME_CONFIG.MAP_HEIGHT) {
      return false;
    }
    
    // Check if position is walkable (0 = walkable, 2 = exit)
    if (this.map[y][x] !== 0 && this.map[y][x] !== 2) {
      return false;
    }
    
    // Check if blocked by divider walls
    if (this.mazeGenerator.isMoveBlockedByDivider(this.pacman.x, this.pacman.y, x, y)) {
      return false;
    }
    
    return true;
  }

  completeLevel() {
    // Prevent multiple calls
    if (this.state !== GAME_STATES.PLAYING) {
      return;
    }
    
    console.log(`Level ${this.currentLevel} completed!`);
    
    // Set state to prevent further movement
    this.state = GAME_STATES.LEVEL_COMPLETE;
    
    // Calculate score for this level
    const timeBonus = Math.max(0, 30000 - (Date.now() - this.levelStartTime));
    const levelScore = (this.pelletsCollected * 100) + Math.floor(timeBonus / 100);
    this.totalScore += levelScore;
    this.completedLevels++;
    this.averageScore = Math.floor(this.totalScore / this.completedLevels);
    
    // Play apple sound for level completion
    this.audioManager.playAppleSound();
    
    // Start celebration particle animation
    this.isCelebrating = true;
    this.celebrationParticles = [];
    this.createCelebrationParticles(this.pacman.x * (window.tileSize || 20), this.pacman.y * (window.tileSize || 20));
    
    // Show completion message
    this.showMessage(`Level ${this.currentLevel} Complete! +${levelScore} points`, 2000);
    
    // Move to next level
    this.currentLevel++;
    if (this.currentLevel > GAME_CONFIG.MAX_LEVEL) {
      this.currentLevel = 1; // Loop back to level 1
    }
    
    // Reset for next level
    setTimeout(() => {
      this.resetGame();
    }, 2000);
  }

  // Weapon methods
  useFireBlast() {
    console.log('useFireBlast called, state:', this.state);
    if (this.state !== GAME_STATES.PLAYING) {
      console.log('Game not in playing state');
      return;
    }
    
    // Check cooldown
    if (this.fireBlastCooldown > 0) {
      console.log('Fire blast on cooldown:', this.fireBlastCooldown);
      return;
    }
    
    console.log('Fire blast used!');
    
    // Play fire blast sound
    this.audioManager.playFireBlastSound();
    
    // Set cooldown
    this.fireBlastCooldown = GAME_CONFIG.FIRE_BLAST_COOLDOWN;
    
    // Create fire blast particles
    this.createFireBlastParticles();
    
    // Find and damage first ghost in line of sight
    const hitGhost = this.findFirstGhostInLineOfSight(GAME_CONFIG.FIRE_BLAST_RANGE);
    if (hitGhost) {
      this.damageGhost(hitGhost);
    }
    
    // Update weapon UI
    this.updateWeaponUI();
  }

  useFreezeWind() {
    console.log('useFreezeWind called, state:', this.state);
    if (this.state !== GAME_STATES.PLAYING) {
      console.log('Game not in playing state');
      return;
    }
    
    // Check cooldown
    if (this.freezeWindCooldown > 0) {
      console.log('Freeze wind on cooldown:', this.freezeWindCooldown);
      return;
    }
    
    console.log('Freeze wind used!');
    
    // Play freeze wind sound
    this.audioManager.playFreezeWindSound();
    
    // Set cooldown
    this.freezeWindCooldown = GAME_CONFIG.FREEZE_WIND_COOLDOWN;
    
    // Create freeze wind particles
    this.createFreezeWindParticles();
    
    // Find and freeze first ghost in line of sight
    const hitGhost = this.findFirstGhostInLineOfSight(GAME_CONFIG.FREEZE_WIND_RANGE);
    if (hitGhost) {
      this.freezeGhost(hitGhost);
    }
    
    // Update weapon UI
    this.updateWeaponUI();
  }

  createFireBlastParticles() {
    const tileSize = window.tileSize || 20;
    const startX = this.pacman.x * tileSize + tileSize / 2;
    const startY = this.pacman.y * tileSize + tileSize / 2;
    
    // Fire emojis for variety
    const fireEmojis = ['🔥', '💥', '⚡', '🔥', '💥'];
    
    // Create fire blast projectile - travels in straight line
    const direction = this.pacman.direction;
    let vx = 0, vy = 0;
    const speed = 4; // Consistent speed
    
    switch (direction) {
      case 'right':
        vx = speed;
        vy = 0;
        break;
      case 'left':
        vx = -speed;
        vy = 0;
        break;
      case 'up':
        vx = 0;
        vy = -speed;
        break;
      case 'down':
        vx = 0;
        vy = speed;
        break;
    }
    
    // Create multiple particles in a line formation
    for (let i = 0; i < 8; i++) {
      const offset = i * 8; // Space particles along the line
      let offsetX = 0, offsetY = 0;
      
      switch (direction) {
        case 'right':
          offsetX = -offset;
          break;
        case 'left':
          offsetX = offset;
          break;
        case 'up':
          offsetY = offset;
          break;
        case 'down':
          offsetY = -offset;
          break;
      }
      
      this.weaponParticles.push({
        x: startX + offsetX,
        y: startY + offsetY,
        vx: vx,
        vy: vy,
        life: 1.0,
        decay: 0.008, // Slower decay so particles last longer
        color: '#FF4500',
        size: 14 + Math.random() * 6,
        type: 'fire',
        direction: direction,
        emoji: fireEmojis[Math.floor(Math.random() * fireEmojis.length)]
      });
    }
  }

  createFreezeWindParticles() {
    const tileSize = window.tileSize || 20;
    const startX = this.pacman.x * tileSize + tileSize / 2;
    const startY = this.pacman.y * tileSize + tileSize / 2;
    
    // Ice and snow emojis for variety
    const iceEmojis = ['❄️', '🌨️', '💨', '❄️', '🌨️', '💨'];
    
    // Create freeze wind projectile - travels in straight line
    const direction = this.pacman.direction;
    let vx = 0, vy = 0;
    const speed = 3; // Slightly slower than fire
    
    switch (direction) {
      case 'right':
        vx = speed;
        vy = 0;
        break;
      case 'left':
        vx = -speed;
        vy = 0;
        break;
      case 'up':
        vx = 0;
        vy = -speed;
        break;
      case 'down':
        vx = 0;
        vy = speed;
        break;
    }
    
    // Create multiple particles in a line formation
    for (let i = 0; i < 6; i++) {
      const offset = i * 6; // Space particles along the line
      let offsetX = 0, offsetY = 0;
      
      switch (direction) {
        case 'right':
          offsetX = -offset;
          break;
        case 'left':
          offsetX = offset;
          break;
        case 'up':
          offsetY = offset;
          break;
        case 'down':
          offsetY = -offset;
          break;
      }
      
      this.weaponParticles.push({
        x: startX + offsetX,
        y: startY + offsetY,
        vx: vx,
        vy: vy,
        life: 1.0,
        decay: 0.01, // Slightly faster decay than fire
        color: '#00BFFF',
        size: 12 + Math.random() * 4,
        type: 'freeze',
        direction: direction,
        emoji: iceEmojis[Math.floor(Math.random() * iceEmojis.length)]
      });
    }
  }





  enableWeaponButtons() {
    console.log('Enabling weapon buttons...');
    
    // Enable fire blast button
    const fireBtn = document.querySelector('.weapon-btn.fire-blast');
    console.log('Fire button found:', fireBtn);
    if (fireBtn) {
      fireBtn.disabled = false;
      const cooldownText = fireBtn.querySelector('.cooldown-text');
      const cooldownProgress = fireBtn.querySelector('.cooldown-progress');
      if (cooldownText) cooldownText.textContent = 'Ready';
      if (cooldownProgress) cooldownProgress.style.width = '100%';
      console.log('Fire button enabled');
    } else {
      console.log('Fire button not found!');
    }
    
    // Enable freeze wind button
    const freezeBtn = document.querySelector('.weapon-btn.freeze-wind');
    console.log('Freeze button found:', freezeBtn);
    if (freezeBtn) {
      freezeBtn.disabled = false;
      const cooldownText = freezeBtn.querySelector('.cooldown-text');
      const cooldownProgress = freezeBtn.querySelector('.cooldown-progress');
      if (cooldownText) cooldownText.textContent = 'Ready';
      if (cooldownProgress) cooldownProgress.style.width = '100%';
      console.log('Freeze button enabled');
    } else {
      console.log('Freeze button not found!');
    }
  }

  // Find the first ghost in line of sight along the weapon's path
  findFirstGhostInLineOfSight(range) {
    const direction = this.pacman.direction;
    let dx = 0, dy = 0;
    
    // Set direction vector
    switch (direction) {
      case 'right': dx = 1; break;
      case 'left': dx = -1; break;
      case 'up': dy = -1; break;
      case 'down': dy = 1; break;
    }
    
    // Check each tile along the path
    for (let distance = 1; distance <= range; distance++) {
      const checkX = this.pacman.x + dx * distance;
      const checkY = this.pacman.y + dy * distance;
      
      // Check bounds
      if (checkX < 0 || checkX >= GAME_CONFIG.MAP_WIDTH || checkY < 0 || checkY >= GAME_CONFIG.MAP_HEIGHT) {
        break; // Out of bounds
      }
      
      // Check if we hit a wall
      if (this.map[checkY] && this.map[checkY][checkX] === 1) {
        break; // Hit a wall
      }
      
      // Check if there's a ghost at this position
      const ghostAtPosition = this.ghosts.find(ghost => ghost.x === checkX && ghost.y === checkY);
      if (ghostAtPosition) {
        return ghostAtPosition; // Found the first ghost in line of sight
      }
    }
    
    return null; // No ghost found in line of sight
  }

  damageGhost(ghost) {
    console.log(`Damaging ghost ${ghost.name} at (${ghost.x}, ${ghost.y})`);
    
    // Show hit message
    this.showMessage(`🔥 Hit ${ghost.name}!`, 1000);
    
    // Remove ghost temporarily
    const index = this.ghosts.indexOf(ghost);
    if (index > -1) {
      this.ghosts.splice(index, 1);
      
      // Respawn ghost after delay
      setTimeout(() => {
        const newPosition = this.findStrategicGhostPosition(0, 1);
        this.ghosts.push({
          x: newPosition.x,
          y: newPosition.y,
          color: ghost.color,
          name: ghost.name
        });
        console.log(`Ghost ${ghost.name} respawned at (${newPosition.x}, ${newPosition.y})`);
      }, GAME_CONFIG.RESPAWN_DELAY);
    }
  }

  freezeGhost(ghost) {
    console.log(`Freezing ghost ${ghost.name} at (${ghost.x}, ${ghost.y})`);
    
    // Show freeze message
    this.showMessage(`❄️ Frozen ${ghost.name}!`, 1000);
    
    // For now, just damage the ghost like fire blast
    // In a full implementation, this would freeze the ghost in place
    this.damageGhost(ghost);
  }

  updateWeaponUI() {
    // Update fire blast cooldown
    const fireBtn = document.querySelector('.weapon-btn.fire-blast');
    if (fireBtn) {
      if (this.fireBlastCooldown > 0) {
        fireBtn.disabled = true;
        const progress = 1 - (this.fireBlastCooldown / GAME_CONFIG.FIRE_BLAST_COOLDOWN);
        const cooldownProgress = fireBtn.querySelector('.cooldown-progress');
        const cooldownText = fireBtn.querySelector('.cooldown-text');
        
        if (cooldownProgress) {
          const degrees = progress * 360;
          cooldownProgress.style.background = `conic-gradient(from -90deg, rgba(255, 215, 0, 0.3) 0deg, rgba(255, 215, 0, 0.3) ${degrees}deg, transparent ${degrees}deg, transparent 360deg)`;
        }
        if (cooldownText) {
          const seconds = Math.ceil(this.fireBlastCooldown / 1000);
          cooldownText.textContent = `${seconds}s`;
        }
      } else {
        fireBtn.disabled = false;
        const cooldownProgress = fireBtn.querySelector('.cooldown-progress');
        const cooldownText = fireBtn.querySelector('.cooldown-text');
        if (cooldownProgress) {
          cooldownProgress.style.background = 'conic-gradient(from -90deg, rgba(255, 215, 0, 0.3) 0deg, rgba(255, 215, 0, 0.3) 360deg)';
        }
        if (cooldownText) cooldownText.textContent = 'Ready';
      }
    }
    
    // Update freeze wind cooldown
    const freezeBtn = document.querySelector('.weapon-btn.freeze-wind');
    if (freezeBtn) {
      if (this.freezeWindCooldown > 0) {
        freezeBtn.disabled = true;
        const progress = 1 - (this.freezeWindCooldown / GAME_CONFIG.FREEZE_WIND_COOLDOWN);
        const cooldownProgress = freezeBtn.querySelector('.cooldown-progress');
        const cooldownText = freezeBtn.querySelector('.cooldown-text');
        
        if (cooldownProgress) {
          const degrees = progress * 360;
          cooldownProgress.style.background = `conic-gradient(from -90deg, rgba(0, 191, 255, 0.3) 0deg, rgba(0, 191, 255, 0.3) ${degrees}deg, transparent ${degrees}deg, transparent 360deg)`;
        }
        if (cooldownText) {
          const seconds = Math.ceil(this.freezeWindCooldown / 1000);
          cooldownText.textContent = `${seconds}s`;
        }
      } else {
        freezeBtn.disabled = false;
        const cooldownProgress = freezeBtn.querySelector('.cooldown-progress');
        const cooldownText = freezeBtn.querySelector('.cooldown-text');
        if (cooldownProgress) {
          cooldownProgress.style.background = 'conic-gradient(from -90deg, rgba(0, 191, 255, 0.3) 0deg, rgba(0, 191, 255, 0.3) 360deg)';
        }
        if (cooldownText) cooldownText.textContent = 'Ready';
      }
    }
  }

  updateCooldowns() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;
    
    // Update fire blast cooldown
    if (this.fireBlastCooldown > 0) {
      this.fireBlastCooldown -= elapsedTime;
      if (this.fireBlastCooldown < 0) this.fireBlastCooldown = 0;
    }
    
    // Update freeze wind cooldown
    if (this.freezeWindCooldown > 0) {
      this.freezeWindCooldown -= elapsedTime;
      if (this.freezeWindCooldown < 0) this.freezeWindCooldown = 0;
    }
    
    // Update weapon UI
    this.updateWeaponUI();
  }

  // Celebration particle system
  createCelebrationParticles(x, y) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#FF9F43', '#00D2D3', '#54A0FF', '#5F27CD'];
    const emojis = ['🎉', '⭐', '🎊', '🏆', '💎', '🌟', '✨', '🎯', '🎨', '🚀', '🌈', '🎪', '🎭', '🎪', '🎡', '🎢'];
    const particleTypes = ['emoji', 'circle', 'star', 'sparkle'];
    
    // Random number of particles (20-30)
    const particleCount = 20 + Math.floor(Math.random() * 11);
    
    for (let i = 0; i < particleCount; i++) {
      const particleType = particleTypes[Math.floor(Math.random() * particleTypes.length)];
      const isSpecial = Math.random() < 0.15; // 15% chance for special particles
      
      this.celebrationParticles.push({
        x: x + (window.tileSize || 20) / 2,
        y: y + (window.tileSize || 20) / 2,
        vx: (Math.random() - 0.5) * (8 + Math.random() * 6), // More varied velocity
        vy: (Math.random() - 0.5) * (8 + Math.random() * 6) - 3,
        life: 0.8 + Math.random() * 0.4, // Varied starting life
        decay: 0.01 + Math.random() * 0.025, // Varied decay rates
        color: colors[Math.floor(Math.random() * colors.length)],
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: 15 + Math.random() * 20, // More size variation
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * (0.2 + Math.random() * 0.4), // Varied rotation
        bounce: 0.6 + Math.random() * 0.4, // Varied bounce
        gravity: 0.3 + Math.random() * 0.3, // Varied gravity
        type: particleType,
        isSpecial: isSpecial,
        pulse: Math.random() < 0.3, // 30% chance to pulse
        pulseSpeed: 0.05 + Math.random() * 0.1,
        pulsePhase: Math.random() * Math.PI * 2,
        trail: Math.random() < 0.2, // 20% chance for trail effect
        trailLength: 3 + Math.floor(Math.random() * 5),
        trailPositions: []
      });
    }
  }

  updateCelebrationParticles() {
    for (let i = this.celebrationParticles.length - 1; i >= 0; i--) {
      const particle = this.celebrationParticles[i];
      
      // Update trail positions
      if (particle.trail) {
        particle.trailPositions.unshift({x: particle.x, y: particle.y, life: particle.life});
        if (particle.trailPositions.length > particle.trailLength) {
          particle.trailPositions.pop();
        }
      }
      
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += particle.gravity;
      particle.life -= particle.decay;
      particle.rotation += particle.rotationSpeed;
      
      // Update pulse phase
      if (particle.pulse) {
        particle.pulsePhase += particle.pulseSpeed;
      }
      
      // Special particles have different behaviors
      if (particle.isSpecial) {
        // Special particles might change direction randomly
        if (Math.random() < 0.02) {
          particle.vx += (Math.random() - 0.5) * 2;
          particle.vy += (Math.random() - 0.5) * 2;
        }
      }
      
      // Bounce off canvas edges
      const tileSize = window.tileSize || 20;
      const canvasWidth = GAME_CONFIG.MAP_WIDTH * tileSize;
      const canvasHeight = GAME_CONFIG.MAP_HEIGHT * tileSize;
      
      if (particle.x <= 0 || particle.x >= canvasWidth) {
        particle.vx *= -particle.bounce;
        particle.x = Math.max(0, Math.min(canvasWidth, particle.x));
      }
      if (particle.y >= canvasHeight) {
        particle.vy *= -particle.bounce;
        particle.y = canvasHeight;
      }
      
      if (particle.life <= 0) {
        this.celebrationParticles.splice(i, 1);
      }
    }
  }

  // Game over particle system
  createGameOverParticles(x, y) {
    const colors = ['#FF0000', '#8B0000', '#DC143C', '#B22222', '#CD5C5C', '#F08080'];
    const emojis = ['💀', '👻', '💥', '💢', '😵', '💀', '⚰️', '🪦'];
    const particleTypes = ['emoji', 'skull', 'explosion', 'smoke'];
    
    // Create more dramatic effect for game over
    const particleCount = 30 + Math.floor(Math.random() * 15);
    
    for (let i = 0; i < particleCount; i++) {
      const particleType = particleTypes[Math.floor(Math.random() * particleTypes.length)];
      const isDramatic = Math.random() < 0.25; // 25% chance for dramatic particles
      
      this.gameOverParticles.push({
        x: x + (window.tileSize || 20) / 2,
        y: y + (window.tileSize || 20) / 2,
        vx: (Math.random() - 0.5) * (12 + Math.random() * 8), // Faster, more explosive
        vy: (Math.random() - 0.5) * (12 + Math.random() * 8) - 5, // More upward movement
        life: 1.0 + Math.random() * 0.5, // Longer life for dramatic effect
        decay: 0.008 + Math.random() * 0.015, // Slower decay
        color: colors[Math.floor(Math.random() * colors.length)],
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: 20 + Math.random() * 25, // Larger particles
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * (0.3 + Math.random() * 0.5), // Faster rotation
        bounce: 0.4 + Math.random() * 0.3, // Less bounce for dramatic effect
        gravity: 0.2 + Math.random() * 0.4, // Varied gravity
        type: particleType,
        isDramatic: isDramatic,
        shake: Math.random() < 0.4, // 40% chance to shake
        shakeIntensity: 0.5 + Math.random() * 1.5,
        shakeSpeed: 0.1 + Math.random() * 0.2,
        shakePhase: Math.random() * Math.PI * 2,
        smoke: Math.random() < 0.3, // 30% chance for smoke effect
        smokeOpacity: 0.3 + Math.random() * 0.4,
        originalX: x + (window.tileSize || 20) / 2,
        originalY: y + (window.tileSize || 20) / 2
      });
    }
  }

  updateGameOverParticles() {
    for (let i = this.gameOverParticles.length - 1; i >= 0; i--) {
      const particle = this.gameOverParticles[i];
      
      // Update shake effect
      if (particle.shake) {
        particle.shakePhase += particle.shakeSpeed;
        particle.x = particle.originalX + Math.sin(particle.shakePhase) * particle.shakeIntensity;
        particle.y = particle.originalY + Math.cos(particle.shakePhase) * particle.shakeIntensity;
      } else {
        particle.x += particle.vx;
        particle.y += particle.vy;
      }
      
      particle.vy += particle.gravity;
      particle.life -= particle.decay;
      particle.rotation += particle.rotationSpeed;
      
      // Dramatic particles have special behaviors
      if (particle.isDramatic) {
        // Dramatic particles might explode outward more
        if (Math.random() < 0.03) {
          particle.vx *= 1.2;
          particle.vy *= 1.2;
        }
      }
      
      // Bounce off canvas edges
      const tileSize = window.tileSize || 20;
      const canvasWidth = GAME_CONFIG.MAP_WIDTH * tileSize;
      const canvasHeight = GAME_CONFIG.MAP_HEIGHT * tileSize;
      
      if (particle.x <= 0 || particle.x >= canvasWidth) {
        particle.vx *= -particle.bounce;
        particle.x = Math.max(0, Math.min(canvasWidth, particle.x));
      }
      if (particle.y >= canvasHeight) {
        particle.vy *= -particle.bounce;
        particle.y = canvasHeight;
      }
      
      if (particle.life <= 0) {
        this.gameOverParticles.splice(i, 1);
      }
    }
  }

} 