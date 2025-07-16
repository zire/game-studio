import { GAME_CONFIG } from '../utils/constants.js';

export class MazeGenerator {
  constructor() {
    this.horizontalWalls = [];
    this.verticalWalls = [];
  }

  generateRandomMap(level = 1) {
    console.log('Generating maze for level:', level);
    
    // Create maze with thin dividers on gridlines from level 1
    const newMap = [];
    for (let y = 0; y < GAME_CONFIG.MAP_HEIGHT; y++) {
      const row = [];
      for (let x = 0; x < GAME_CONFIG.MAP_WIDTH; x++) {
        row.push(0); // Start with all walkable space
      }
      newMap.push(row);
    }
    
    // Clear existing walls
    this.horizontalWalls.length = 0;
    this.verticalWalls.length = 0;
    
    // Generate simple maze with basic validation (temporarily disable comprehensive validation)
    this.generateSimpleMazeWithValidation(level, newMap);
    
    // Ensure start position is open (top-left corner)
    newMap[0][0] = 0;
    
    // Place exit door at bottom-right corner
    const exitX = GAME_CONFIG.MAP_WIDTH - 1;
    const exitY = GAME_CONFIG.MAP_HEIGHT - 1;
    newMap[exitY][exitX] = 2; // Door
    
    // Ensure the door is accessible
    this.ensureDoorAccess(newMap);
    
    console.log('Maze generation complete. Horizontal walls:', this.horizontalWalls.length, 'Vertical walls:', this.verticalWalls.length);
    console.log('Wall details - Horizontal:', this.horizontalWalls, 'Vertical:', this.verticalWalls);
    
    return {
      map: newMap,
      horizontalWalls: [...this.horizontalWalls],
      verticalWalls: [...this.verticalWalls]
    };
  }

  generateSimpleMazeWithComprehensiveValidation(level, map) {
    console.log('Generating simple maze for level:', level);
    
    // Calculate wall density based on level (more walls for higher levels)
    const levelDensity = Math.min(
      GAME_CONFIG.MAX_WALL_DENSITY, 
      GAME_CONFIG.BASE_WALL_DENSITY + (level - 1) * GAME_CONFIG.DENSITY_INCREMENT
    );
    
    console.log('Wall density:', levelDensity);
    
    // Create horizontal walls (dividing rows) with comprehensive validation
    for (let y = 1; y < GAME_CONFIG.MAP_HEIGHT - 1; y++) {
      for (let x = 0; x < GAME_CONFIG.MAP_WIDTH; x++) {
        // Skip walls near start and end
        if ((x === 0 && y === 0) || (x === GAME_CONFIG.MAP_WIDTH - 1 && y === GAME_CONFIG.MAP_HEIGHT - 1)) {
          continue;
        }
        
        // Add wall with probability based on level, but only if it meets all criteria
        if (Math.random() < levelDensity) {
          if (this.canPlaceWallSafelyComprehensive(x, y, 'horizontal', map)) {
            this.horizontalWalls.push({x, y});
          }
        }
      }
    }
    
    // Create vertical walls (dividing columns) with comprehensive validation
    for (let y = 0; y < GAME_CONFIG.MAP_HEIGHT; y++) {
      for (let x = 1; x < GAME_CONFIG.MAP_WIDTH - 1; x++) {
        // Skip walls near start and end
        if ((x === 0 && y === 0) || (x === GAME_CONFIG.MAP_WIDTH - 1 && y === GAME_CONFIG.MAP_HEIGHT - 1)) {
          continue;
        }
        
        // Add wall with probability based on level, but only if it meets all criteria
        if (Math.random() < levelDensity) {
          if (this.canPlaceWallSafelyComprehensive(x, y, 'vertical', map)) {
            this.verticalWalls.push({x, y});
          }
        }
      }
    }
    
    // Ensure we have a minimum number of walls for gameplay
    if (this.horizontalWalls.length + this.verticalWalls.length < GAME_CONFIG.MIN_WALLS) {
      console.log('Adding minimum walls for gameplay');
      // Add some guaranteed walls with comprehensive validation
      for (let i = 0; i < GAME_CONFIG.GUARANTEED_WALLS; i++) {
        const x = 2 + Math.floor(Math.random() * (GAME_CONFIG.MAP_WIDTH - 4));
        const y = 2 + Math.floor(Math.random() * (GAME_CONFIG.MAP_HEIGHT - 4));
        if (this.canPlaceWallSafelyComprehensive(x, y, 'horizontal', map)) {
          this.horizontalWalls.push({x, y});
        }
      }
      for (let i = 0; i < GAME_CONFIG.GUARANTEED_WALLS; i++) {
        const x = 2 + Math.floor(Math.random() * (GAME_CONFIG.MAP_WIDTH - 4));
        const y = 2 + Math.floor(Math.random() * (GAME_CONFIG.MAP_HEIGHT - 4));
        if (this.canPlaceWallSafelyComprehensive(x, y, 'vertical', map)) {
          this.verticalWalls.push({x, y});
        }
      }
    }
    
    console.log('Simple maze generated. Total walls:', this.horizontalWalls.length + this.verticalWalls.length);
  }

  canPlaceWallSafelyComprehensive(x, y, wallType, map) {
    // Temporarily add the wall
    const tempHorizontalWalls = [...this.horizontalWalls];
    const tempVerticalWalls = [...this.verticalWalls];
    
    if (wallType === 'horizontal') {
      tempHorizontalWalls.push({x, y});
    } else {
      tempVerticalWalls.push({x, y});
    }
    
    // Check all 5 criteria:
    
    // 1. Pacboy at start (0,0) is not trapped
    const pacboyHasPath = this.hasPathToExit(map, tempHorizontalWalls, tempVerticalWalls);
    if (!pacboyHasPath) return false;
    
    // 2. Apple at exit is not trapped (already covered by hasPathToExit)
    
    // 3. Ghosts are not trapped - check potential ghost spawn positions
    const ghostPositions = this.getPotentialGhostPositions();
    for (const ghostPos of ghostPositions) {
      if (!this.hasPathFromPosition(ghostPos.x, ghostPos.y, map, tempHorizontalWalls, tempVerticalWalls)) {
        return false;
      }
    }
    
    // 4. At least 1 path from Pacboy to Apple (already covered by hasPathToExit)
    
    // 5. No dead weight rooms
    if (this.createsDeadWeightRoom(x, y, wallType, map, tempHorizontalWalls, tempVerticalWalls)) {
      return false;
    }
    
    return true;
  }

  getPotentialGhostPositions() {
    // Return potential ghost spawn positions (strategic positions)
    const positions = [];
    
    // Add positions near the middle of the maze (where ghosts typically spawn)
    const centerX = Math.floor(GAME_CONFIG.MAP_WIDTH / 2);
    const centerY = Math.floor(GAME_CONFIG.MAP_HEIGHT / 2);
    
    // Add center and surrounding positions
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const x = centerX + dx;
        const y = centerY + dy;
        if (x >= 1 && x < GAME_CONFIG.MAP_WIDTH - 1 && y >= 1 && y < GAME_CONFIG.MAP_HEIGHT - 1) {
          positions.push({x, y});
        }
      }
    }
    
    // Add some additional strategic positions
    const strategicPositions = [
      {x: 2, y: 2},
      {x: GAME_CONFIG.MAP_WIDTH - 3, y: 2},
      {x: 2, y: GAME_CONFIG.MAP_HEIGHT - 3},
      {x: GAME_CONFIG.MAP_WIDTH - 3, y: GAME_CONFIG.MAP_HEIGHT - 3}
    ];
    
    for (const pos of strategicPositions) {
      if (pos.x >= 1 && pos.x < GAME_CONFIG.MAP_WIDTH - 1 && 
          pos.y >= 1 && pos.y < GAME_CONFIG.MAP_HEIGHT - 1) {
        positions.push(pos);
      }
    }
    
    return positions;
  }

  hasPathFromPosition(startX, startY, map, horizontalWalls, verticalWalls) {
    // Use BFS to check if there's a path from any position to the exit
    const visited = new Set();
    const queue = [{x: startX, y: startY}];
    
    while (queue.length > 0) {
      const {x, y} = queue.shift();
      const key = `${x},${y}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      // Check if we reached the exit
      if (x === GAME_CONFIG.MAP_WIDTH - 1 && y === GAME_CONFIG.MAP_HEIGHT - 1) {
        return true;
      }
      
      // Check all 4 directions
      const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < GAME_CONFIG.MAP_WIDTH && ny >= 0 && ny < GAME_CONFIG.MAP_HEIGHT && 
            (map[ny][nx] === 0 || map[ny][nx] === 2) && !visited.has(`${nx},${ny}`)) {
          
          // Check if there's a divider blocking this move
          let blocked = false;
          
          if (dx === 1) { // Moving right
            blocked = verticalWalls.some(wall => wall.x === x && wall.y === y);
          } else if (dx === -1) { // Moving left
            blocked = verticalWalls.some(wall => wall.x === nx && wall.y === y);
          } else if (dy === 1) { // Moving down
            blocked = horizontalWalls.some(wall => wall.x === x && wall.y === y);
          } else if (dy === -1) { // Moving up
            blocked = horizontalWalls.some(wall => wall.x === x && wall.y === ny);
          }
          
          if (!blocked) {
            queue.push({x: nx, y: ny});
          }
        }
      }
    }
    
    return false;
  }

  createsDeadWeightRoom(x, y, wallType, map, horizontalWalls, verticalWalls) {
    // Check if placing this wall creates a dead weight room
    // A dead weight room is a room with no exits (enclosed by walls/borders)
    
    // Get the area that would be affected by this wall
    const affectedArea = this.getAffectedArea(x, y, wallType);
    
    for (const area of affectedArea) {
      if (this.isDeadWeightRoom(area, map, horizontalWalls, verticalWalls)) {
        return true;
      }
    }
    
    return false;
  }

  getAffectedArea(x, y, wallType) {
    // Return the areas that would be affected by placing this wall
    const areas = [];
    
    if (wallType === 'horizontal') {
      // Horizontal wall affects the areas above and below it
      if (y > 0) {
        areas.push({x1: 0, y1: 0, x2: GAME_CONFIG.MAP_WIDTH - 1, y2: y});
      }
      if (y < GAME_CONFIG.MAP_HEIGHT - 1) {
        areas.push({x1: 0, y1: y + 1, x2: GAME_CONFIG.MAP_WIDTH - 1, y2: GAME_CONFIG.MAP_HEIGHT - 1});
      }
    } else {
      // Vertical wall affects the areas left and right of it
      if (x > 0) {
        areas.push({x1: 0, y1: 0, x2: x, y2: GAME_CONFIG.MAP_HEIGHT - 1});
      }
      if (x < GAME_CONFIG.MAP_WIDTH - 1) {
        areas.push({x1: x + 1, y1: 0, x2: GAME_CONFIG.MAP_WIDTH - 1, y2: GAME_CONFIG.MAP_HEIGHT - 1});
      }
    }
    
    return areas;
  }

  isDeadWeightRoom(area, map, horizontalWalls, verticalWalls) {
    // Check if an area is a dead weight room (no exits)
    const {x1, y1, x2, y2} = area;
    
    // Count walls and borders around this area
    let wallCount = 0;
    let borderCount = 0;
    
    // Check top border/wall
    if (y1 === 0) {
      borderCount++;
    } else {
      // Check for horizontal wall at top
      const hasTopWall = horizontalWalls.some(wall => 
        wall.x >= x1 && wall.x <= x2 && wall.y === y1
      );
      if (hasTopWall) wallCount++;
    }
    
    // Check bottom border/wall
    if (y2 === GAME_CONFIG.MAP_HEIGHT - 1) {
      borderCount++;
    } else {
      // Check for horizontal wall at bottom
      const hasBottomWall = horizontalWalls.some(wall => 
        wall.x >= x1 && wall.x <= x2 && wall.y === y2
      );
      if (hasBottomWall) wallCount++;
    }
    
    // Check left border/wall
    if (x1 === 0) {
      borderCount++;
    } else {
      // Check for vertical wall at left
      const hasLeftWall = verticalWalls.some(wall => 
        wall.x === x1 && wall.y >= y1 && wall.y <= y2
      );
      if (hasLeftWall) wallCount++;
    }
    
    // Check right border/wall
    if (x2 === GAME_CONFIG.MAP_WIDTH - 1) {
      borderCount++;
    } else {
      // Check for vertical wall at right
      const hasRightWall = verticalWalls.some(wall => 
        wall.x === x2 && wall.y >= y1 && wall.y <= y2
      );
      if (hasRightWall) wallCount++;
    }
    
    // Check if this creates a dead weight room:
    // - 4 walls/borders = completely enclosed
    // - 3 walls + 1 border = enclosed on 3 sides + 1 border
    // - 2 walls + 2 borders (corners) = enclosed on 2 sides + 2 borders
    const totalEnclosures = wallCount + borderCount;
    
    return totalEnclosures >= 4;
  }

  canPlaceWallSafely(x, y, wallType, map) {
    // Temporarily add the wall
    const tempHorizontalWalls = [...this.horizontalWalls];
    const tempVerticalWalls = [...this.verticalWalls];
    
    if (wallType === 'horizontal') {
      tempHorizontalWalls.push({x, y});
    } else {
      tempVerticalWalls.push({x, y});
    }
    
    // Check if there's still a path from start to exit
    const hasPath = this.hasPathToExit(map, tempHorizontalWalls, tempVerticalWalls);
    
    return hasPath;
  }

  hasPathToExit(map, horizontalWalls, verticalWalls) {
    // Use BFS to check if there's a path from start (0,0) to exit (MAP_WIDTH-1, MAP_HEIGHT-1)
    const visited = new Set();
    const queue = [{x: 0, y: 0}];
    
    while (queue.length > 0) {
      const {x, y} = queue.shift();
      const key = `${x},${y}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      // Check if we reached the exit
      if (x === GAME_CONFIG.MAP_WIDTH - 1 && y === GAME_CONFIG.MAP_HEIGHT - 1) {
        return true;
      }
      
      // Check all 4 directions
      const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < GAME_CONFIG.MAP_WIDTH && ny >= 0 && ny < GAME_CONFIG.MAP_HEIGHT && 
            (map[ny][nx] === 0 || map[ny][nx] === 2) && !visited.has(`${nx},${ny}`)) {
          
          // Check if there's a divider blocking this move
          let blocked = false;
          
          if (dx === 1) { // Moving right
            // Check for vertical wall at current x position
            blocked = verticalWalls.some(wall => wall.x === x && wall.y === y);
          } else if (dx === -1) { // Moving left
            // Check for vertical wall at target x position
            blocked = verticalWalls.some(wall => wall.x === nx && wall.y === y);
          } else if (dy === 1) { // Moving down
            // Check for horizontal wall at current y position
            blocked = horizontalWalls.some(wall => wall.x === x && wall.y === y);
          } else if (dy === -1) { // Moving up
            // Check for horizontal wall at target y position
            blocked = horizontalWalls.some(wall => wall.x === x && wall.y === ny);
          }
          
          if (!blocked) {
            queue.push({x: nx, y: ny});
          }
        }
      }
    }
    
    return false;
  }

  generateSimpleMazeWithValidation(level, map) {
    console.log('Generating simple maze for level:', level);
    
    // Calculate wall density based on level (more walls for higher levels)
    const levelDensity = Math.min(
      GAME_CONFIG.MAX_WALL_DENSITY, 
      GAME_CONFIG.BASE_WALL_DENSITY + (level - 1) * GAME_CONFIG.DENSITY_INCREMENT
    );
    
    console.log('Wall density:', levelDensity);
    
    // Create horizontal walls (dividing rows) with validation
    for (let y = 1; y < GAME_CONFIG.MAP_HEIGHT - 1; y++) {
      for (let x = 0; x < GAME_CONFIG.MAP_WIDTH; x++) {
        // Skip walls near start and end
        if ((x === 0 && y === 0) || (x === GAME_CONFIG.MAP_WIDTH - 1 && y === GAME_CONFIG.MAP_HEIGHT - 1)) {
          continue;
        }
        
        // Add wall with probability based on level, but only if it doesn't block the path
        if (Math.random() < levelDensity) {
          // Test if adding this wall would block the path to the exit
          if (this.canPlaceWallSafely(x, y, 'horizontal', map)) {
            this.horizontalWalls.push({x, y});
          }
        }
      }
    }
    
    // Create vertical walls (dividing columns) with validation
    for (let y = 0; y < GAME_CONFIG.MAP_HEIGHT; y++) {
      for (let x = 1; x < GAME_CONFIG.MAP_WIDTH - 1; x++) {
        // Skip walls near start and end
        if ((x === 0 && y === 0) || (x === GAME_CONFIG.MAP_WIDTH - 1 && y === GAME_CONFIG.MAP_HEIGHT - 1)) {
          continue;
        }
        
        // Add wall with probability based on level, but only if it doesn't block the path
        if (Math.random() < levelDensity) {
          // Test if adding this wall would block the path to the exit
          if (this.canPlaceWallSafely(x, y, 'vertical', map)) {
            this.verticalWalls.push({x, y});
          }
        }
      }
    }
    
    // Ensure we have a minimum number of walls for gameplay
    if (this.horizontalWalls.length + this.verticalWalls.length < GAME_CONFIG.MIN_WALLS) {
      console.log('Adding minimum walls for gameplay');
      // Add some guaranteed walls with validation
      for (let i = 0; i < GAME_CONFIG.GUARANTEED_WALLS; i++) {
        const x = 2 + Math.floor(Math.random() * (GAME_CONFIG.MAP_WIDTH - 4));
        const y = 2 + Math.floor(Math.random() * (GAME_CONFIG.MAP_HEIGHT - 4));
        if (this.canPlaceWallSafely(x, y, 'horizontal', map)) {
          this.horizontalWalls.push({x, y});
        }
      }
      for (let i = 0; i < GAME_CONFIG.GUARANTEED_WALLS; i++) {
        const x = 2 + Math.floor(Math.random() * (GAME_CONFIG.MAP_WIDTH - 4));
        const y = 2 + Math.floor(Math.random() * (GAME_CONFIG.MAP_HEIGHT - 4));
        if (this.canPlaceWallSafely(x, y, 'vertical', map)) {
          this.verticalWalls.push({x, y});
        }
      }
    }
    
    console.log('Simple maze generated. Total walls:', this.horizontalWalls.length + this.verticalWalls.length);
  }

  generateSimpleMaze(level) {
    console.log('Generating simple maze for level:', level);
    
    // Calculate wall density based on level (more walls for higher levels)
    const levelDensity = Math.min(
      GAME_CONFIG.MAX_WALL_DENSITY, 
      GAME_CONFIG.BASE_WALL_DENSITY + (level - 1) * GAME_CONFIG.DENSITY_INCREMENT
    );
    
    console.log('Wall density:', levelDensity);
    
    // Create horizontal walls (dividing rows)
    for (let y = 1; y < GAME_CONFIG.MAP_HEIGHT - 1; y++) {
      for (let x = 0; x < GAME_CONFIG.MAP_WIDTH; x++) {
        // Skip walls near start and end
        if ((x === 0 && y === 0) || (x === GAME_CONFIG.MAP_WIDTH - 1 && y === GAME_CONFIG.MAP_HEIGHT - 1)) {
          continue;
        }
        
        // Add wall with probability based on level
        if (Math.random() < levelDensity) {
          this.horizontalWalls.push({x, y});
        }
      }
    }
    
    // Create vertical walls (dividing columns)
    for (let y = 0; y < GAME_CONFIG.MAP_HEIGHT; y++) {
      for (let x = 1; x < GAME_CONFIG.MAP_WIDTH - 1; x++) {
        // Skip walls near start and end
        if ((x === 0 && y === 0) || (x === GAME_CONFIG.MAP_WIDTH - 1 && y === GAME_CONFIG.MAP_HEIGHT - 1)) {
          continue;
        }
        
        // Add wall with probability based on level
        if (Math.random() < levelDensity) {
          this.verticalWalls.push({x, y});
        }
      }
    }
    
    // Ensure we have a minimum number of walls for gameplay
    if (this.horizontalWalls.length + this.verticalWalls.length < GAME_CONFIG.MIN_WALLS) {
      console.log('Adding minimum walls for gameplay');
      // Add some guaranteed walls
      for (let i = 0; i < GAME_CONFIG.GUARANTEED_WALLS; i++) {
        const x = 2 + Math.floor(Math.random() * (GAME_CONFIG.MAP_WIDTH - 4));
        const y = 2 + Math.floor(Math.random() * (GAME_CONFIG.MAP_HEIGHT - 4));
        this.horizontalWalls.push({x, y});
      }
      for (let i = 0; i < GAME_CONFIG.GUARANTEED_WALLS; i++) {
        const x = 2 + Math.floor(Math.random() * (GAME_CONFIG.MAP_WIDTH - 4));
        const y = 2 + Math.floor(Math.random() * (GAME_CONFIG.MAP_HEIGHT - 4));
        this.verticalWalls.push({x, y});
      }
    }
    
    console.log('Simple maze generated. Total walls:', this.horizontalWalls.length + this.verticalWalls.length);
  }

  ensureDoorAccess(map) {
    // Ensure there's a path to the door
    const doorX = GAME_CONFIG.MAP_WIDTH - 1;
    const doorY = GAME_CONFIG.MAP_HEIGHT - 1;
    
    // Check if door is accessible from left or above
    if (map[doorY][doorX - 1] !== 0 && map[doorY - 1][doorX] !== 0) {
      // Door is blocked, create a path
      if (Math.random() > 0.5) {
        map[doorY][doorX - 1] = 0; // Open left
      } else {
        map[doorY - 1][doorX] = 0; // Open above
      }
    }
  }

  generatePellets(map) {
    const pelletMap = [];
    for (let y = 0; y < GAME_CONFIG.MAP_HEIGHT; y++) {
      const row = [];
      for (let x = 0; x < GAME_CONFIG.MAP_WIDTH; x++) {
        row.push(0);
      }
      pelletMap.push(row);
    }
    
    let pelletCount = 0;
    
    // Place pellets on ALL walkable areas (not walls or door)
    for (let y = 0; y < GAME_CONFIG.MAP_HEIGHT; y++) {
      for (let x = 0; x < GAME_CONFIG.MAP_WIDTH; x++) {
        // Place pellets on all walkable areas (not walls or door)
        if (map[y][x] === 0) {
          pelletMap[y][x] = 1;
          pelletCount++;
        }
      }
    }
    
    return { pelletMap, pelletCount };
  }

  isMoveBlockedByDivider(fromX, fromY, toX, toY) {
    // Check if there's a divider blocking this move
    if (toX > fromX) { // Moving right
      // Check for vertical wall at current x position
      return this.verticalWalls.some(wall => wall.x === fromX && wall.y === fromY);
    } else if (toX < fromX) { // Moving left
      // Check for vertical wall at target x position
      return this.verticalWalls.some(wall => wall.x === toX && wall.y === fromY);
    } else if (toY > fromY) { // Moving down
      // Check for horizontal wall at current y position
      return this.horizontalWalls.some(wall => wall.x === fromX && wall.y === fromY);
    } else if (toY < fromY) { // Moving up
      // Check for horizontal wall at target y position
      return this.horizontalWalls.some(wall => wall.x === fromX && wall.y === toY);
    }
    return false;
  }
} 