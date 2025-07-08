// Game Constants
export const GAME_CONFIG = {
  // Maze dimensions
  MAP_WIDTH: 10,
  MAP_HEIGHT: 16,
  
  // Responsive design
  MIN_TILE_SIZE: 20,
  HORIZONTAL_PADDING: 20,
  MOBILE_HORIZONTAL_PADDING: 0,
  UI_SPACE: 120,
  
  // Maze generation
  BASE_WALL_DENSITY: 0.15,
  MAX_WALL_DENSITY: 0.4,
  DENSITY_INCREMENT: 0.02,
  MIN_WALLS: 10,
  GUARANTEED_WALLS: 5,
  
  // Game mechanics
  GHOST_MOVE_INTERVAL: 350,
  WEAPON_UPDATE_INTERVAL: 16,
  FIRE_BLAST_COOLDOWN: 5000,
  FREEZE_WIND_COOLDOWN: 3000,
  FIRE_BLAST_DAMAGE: 50,
  FREEZE_WIND_DURATION: 2000,
  FIRE_BLAST_RANGE: 5,
  FREEZE_WIND_RANGE: 3,
  
  // Ghost respawn
  MIN_RESPAWN_DISTANCE: 8,
  MAX_RESPAWN_ATTEMPTS: 100,
  RESPAWN_DELAY: 3000,
  
  // Particle effects
  CELEBRATION_PARTICLES: 20,
  GAME_OVER_PARTICLES: 30,
  WEAPON_PARTICLES: 8,
  
  // Sound
  WAKA_VOLUME: 0.5,
  
  // Level progression
  MAX_LEVEL: 100,
  LIVES_PROGRESSION: 25,
  GHOST_COUNT_BREAKPOINTS: {
    10: 1,
    30: 2,
    50: 3,
    75: 4,
    100: 5
  }
};

// Ghost configuration
export const GHOST_CONFIG = {
  NAMES: ['Clement', 'Chase', 'Ray', 'Jayden', 'Andrew'],
  COLORS: ['#147880', '#60EEE3', '#25BF94', '#E9E12E', '#FF6B41']
};

// Weapon configuration
export const WEAPON_CONFIG = {
  FIRE_BLAST: {
    name: 'Fire Blast',
    icon: '🔥',
    color: '#FF4500',
    cooldown: GAME_CONFIG.FIRE_BLAST_COOLDOWN,
    range: GAME_CONFIG.FIRE_BLAST_RANGE,
    damage: GAME_CONFIG.FIRE_BLAST_DAMAGE
  },
  FREEZE_WIND: {
    name: 'Freeze Wind',
    icon: '❄️',
    color: '#00BFFF',
    cooldown: GAME_CONFIG.FREEZE_WIND_COOLDOWN,
    range: GAME_CONFIG.FREEZE_WIND_RANGE,
    duration: GAME_CONFIG.FREEZE_WIND_DURATION
  }
};

// CSS Classes
export const CSS_CLASSES = {
  GAME_CONTAINER: 'game-container',
  GAME_HEADER: 'game-header',
  MAZE_CONTAINER: 'maze-container',
  CONTROLS_CONTAINER: 'controls-container',
  MOBILE_CONTROLS: 'mobile-controls',
  WEAPON_CONTROLS: 'weapon-controls',
  MENU_OVERLAY: 'menu-overlay',
  HAMBURGER_MENU: 'hamburger-menu'
};

// Game states
export const GAME_STATES = {
  LOADING: 'loading',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  LEVEL_COMPLETE: 'level_complete',
  CELEBRATING: 'celebrating'
}; 