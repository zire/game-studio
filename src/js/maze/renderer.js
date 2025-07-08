import { GAME_CONFIG } from '../utils/constants.js';

export class MazeRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tileSize = 20; // Will be updated by responsive design
  }

  setTileSize(size) {
    this.tileSize = size;
  }

  drawMaze(map, horizontalWalls, verticalWalls, pelletMap) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw background (walkable areas)
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw thin dividers
    this.drawWalls(horizontalWalls, verticalWalls);
    
    // Draw game elements
    this.drawGameElements(map, pelletMap);
  }

  drawWalls(horizontalWalls, verticalWalls) {
    this.ctx.strokeStyle = '#6a6a8a';
    this.ctx.lineWidth = 3;
    
    // Draw horizontal dividers
    for (const wall of horizontalWalls) {
      const x1 = wall.x * this.tileSize;
      const y1 = (wall.y + 1) * this.tileSize;
      const x2 = (wall.x + 1) * this.tileSize;
      const y2 = (wall.y + 1) * this.tileSize;
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }
    
    // Draw vertical dividers
    for (const wall of verticalWalls) {
      const x1 = (wall.x + 1) * this.tileSize;
      const y1 = wall.y * this.tileSize;
      const x2 = (wall.x + 1) * this.tileSize;
      const y2 = (wall.y + 1) * this.tileSize;
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }
  }

  drawGameElements(map, pelletMap) {
    // Draw exit door
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === 2) {
          // Draw apple emoji as the exit
          const centerX = x * this.tileSize + this.tileSize / 2;
          const centerY = y * this.tileSize + this.tileSize / 2;
          
          this.ctx.font = `${this.tileSize - 4}px Arial`;
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('🍎', centerX, centerY);
        }
        
        // Draw pellets on walkable areas
        if (pelletMap[y][x] === 1) {
          this.ctx.beginPath();
          this.ctx.arc(x * this.tileSize + this.tileSize/2, y * this.tileSize + this.tileSize/2, 3, 0, 2 * Math.PI);
          this.ctx.fillStyle = '#FFD700';
          this.ctx.fill();
        }
      }
    }
  }

  drawPacboy(pacman) {
    this.ctx.beginPath();
    const centerX = pacman.x * this.tileSize + this.tileSize / 2;
    const centerY = pacman.y * this.tileSize + this.tileSize / 2;
    const radius = this.tileSize / 2 - 1;
    
    let startAngle, endAngle;
    switch (pacman.direction) {
      case 'right':
        startAngle = 0.25 * Math.PI;
        endAngle = 1.75 * Math.PI;
        break;
      case 'left':
        startAngle = 1.25 * Math.PI;
        endAngle = 0.75 * Math.PI;
        break;
      case 'up':
        startAngle = 1.75 * Math.PI;
        endAngle = 1.25 * Math.PI;
        break;
      case 'down':
        startAngle = 0.75 * Math.PI;
        endAngle = 0.25 * Math.PI;
        break;
      default:
        startAngle = 0.25 * Math.PI;
        endAngle = 1.75 * Math.PI;
    }
    
    this.ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
    this.ctx.lineTo(centerX, centerY);
    this.ctx.closePath();
    this.ctx.fillStyle = 'yellow';
    this.ctx.fill();
  }

  drawGhosts(ghosts, frozenGhosts, burningGhosts) {
    for (const ghost of ghosts) {
      const isFrozen = frozenGhosts.includes(ghost);
      const isBurning = burningGhosts.includes(ghost);
      
      this.ctx.save();
      
      // Apply freeze effect
      if (isFrozen) {
        this.ctx.globalAlpha = 0.7;
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.beginPath();
        this.ctx.arc(
          ghost.x * this.tileSize + this.tileSize / 2,
          ghost.y * this.tileSize + this.tileSize / 2,
          this.tileSize / 2 + 2,
          0, 2 * Math.PI
        );
        this.ctx.fill();
      }
      
      // Apply dramatic burn effect
      if (isBurning) {
        this.ctx.globalAlpha = 0.6;
        this.ctx.shadowColor = '#FF4500';
        this.ctx.shadowBlur = 20;
        
        // Draw intense fire aura around ghost
        this.ctx.fillStyle = '#FF4500';
        this.ctx.beginPath();
        this.ctx.arc(
          ghost.x * this.tileSize + this.tileSize / 2,
          ghost.y * this.tileSize + this.tileSize / 2,
          this.tileSize / 2 + 4,
          0, 2 * Math.PI
        );
        this.ctx.fill();
      }
      
      // Draw ghost body
      this.ctx.beginPath();
      this.ctx.arc(
        ghost.x * this.tileSize + this.tileSize / 2,
        ghost.y * this.tileSize + this.tileSize / 2,
        this.tileSize / 2 - 3,
        Math.PI, 0, false
      );
      this.ctx.lineTo(ghost.x * this.tileSize + this.tileSize - 3, ghost.y * this.tileSize + this.tileSize - 3);
      this.ctx.lineTo(ghost.x * this.tileSize + 3, ghost.y * this.tileSize + this.tileSize - 3);
      this.ctx.closePath();
      this.ctx.fillStyle = ghost.color;
      this.ctx.fill();
      
      // Eyes
      this.ctx.beginPath();
      this.ctx.arc(ghost.x * this.tileSize + this.tileSize/2 - 4, ghost.y * this.tileSize + this.tileSize/2 - 1, 2, 0, 2 * Math.PI);
      this.ctx.arc(ghost.x * this.tileSize + this.tileSize/2 + 4, ghost.y * this.tileSize + this.tileSize/2 - 1, 2, 0, 2 * Math.PI);
      this.ctx.fillStyle = '#fff';
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(ghost.x * this.tileSize + this.tileSize/2 - 4, ghost.y * this.tileSize + this.tileSize/2 - 1, 0.8, 0, 2 * Math.PI);
      this.ctx.arc(ghost.x * this.tileSize + this.tileSize/2 + 4, ghost.y * this.tileSize + this.tileSize/2 - 1, 0.8, 0, 2 * Math.PI);
      this.ctx.fillStyle = '#222';
      this.ctx.fill();
      
      // Draw ghost name above
      this.ctx.font = 'bold 10px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = ghost.color;
      this.ctx.fillText(ghost.name, ghost.x * this.tileSize + this.tileSize / 2, ghost.y * this.tileSize - 2);
      
      // Add status effects to name
      if (isFrozen) {
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillText('❄️', ghost.x * this.tileSize + this.tileSize / 2, ghost.y * this.tileSize - 12);
      }
      if (isBurning) {
        this.ctx.fillStyle = '#FF4500';
        this.ctx.fillText('🔥', ghost.x * this.tileSize + this.tileSize / 2, ghost.y * this.tileSize - 12);
      }
      
      this.ctx.restore();
    }
  }

  drawWeaponParticles(weaponParticles) {
    weaponParticles.forEach(particle => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.life;
      
      if (particle.type === 'fire') {
        // Draw fire emoji particle
        this.ctx.font = `${particle.size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(particle.emoji, particle.x, particle.y);
        
        // Add glow effect
        this.ctx.shadowColor = '#FF4500';
        this.ctx.shadowBlur = 15;
        this.ctx.fillText(particle.emoji, particle.x, particle.y);
      } else if (particle.type === 'ice') {
        // Draw ice emoji particle
        this.ctx.font = `${particle.size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(particle.emoji, particle.x, particle.y);
        
        // Add sparkle effect
        this.ctx.shadowColor = '#00BFFF';
        this.ctx.shadowBlur = 8;
        this.ctx.fillText(particle.emoji, particle.x, particle.y);
      } else if (particle.type === 'engulf') {
        // Draw dramatic engulfment emoji particle
        this.ctx.font = `${particle.size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(particle.emoji, particle.x, particle.y);
        
        // Add intense glow effect
        this.ctx.shadowColor = '#FF4500';
        this.ctx.shadowBlur = 15;
        this.ctx.fillText(particle.emoji, particle.x, particle.y);
      } else if (particle.type === 'freeze') {
        // Draw freeze emoji particle
        this.ctx.font = `${particle.size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(particle.emoji, particle.x, particle.y);
        
        // Add ice glow effect
        this.ctx.shadowColor = '#87CEEB';
        this.ctx.shadowBlur = 6;
        this.ctx.fillText(particle.emoji, particle.x, particle.y);
      }
      
      this.ctx.restore();
    });
  }

  drawCelebrationParticles(celebrationParticles) {
    celebrationParticles.forEach(particle => {
      this.ctx.save();
      
      // Calculate size with pulse effect
      let currentSize = particle.size;
      if (particle.pulse) {
        currentSize *= 0.8 + 0.4 * Math.sin(particle.pulsePhase);
      }
      
      // Draw trail if enabled
      if (particle.trail && particle.trailPositions.length > 0) {
        particle.trailPositions.forEach((pos, index) => {
          const trailAlpha = (particle.trailPositions.length - index) / particle.trailPositions.length * particle.life * 0.3;
          this.ctx.globalAlpha = trailAlpha;
          this.ctx.translate(pos.x, pos.y);
          this.ctx.rotate(particle.rotation);
          
          if (particle.type === 'emoji') {
            this.ctx.font = `${currentSize * 0.6}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(particle.emoji, 0, 0);
          }
          
          this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        });
      }
      
      // Draw main particle
      this.ctx.globalAlpha = particle.life;
      this.ctx.translate(particle.x, particle.y);
      this.ctx.rotate(particle.rotation);
      
      if (particle.type === 'emoji') {
        this.ctx.font = `${currentSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(particle.emoji, 0, 0);
      }
      
      this.ctx.restore();
    });
  }

  drawGameOverParticles(gameOverParticles) {
    gameOverParticles.forEach(particle => {
      this.ctx.save();
      
      // Calculate opacity with smoke effect
      let opacity = particle.life;
      if (particle.smoke) {
        opacity *= particle.smokeOpacity;
      }
      
      this.ctx.globalAlpha = opacity;
      this.ctx.translate(particle.x, particle.y);
      this.ctx.rotate(particle.rotation);
      
      if (particle.type === 'emoji') {
        this.ctx.font = `${particle.size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(particle.emoji, 0, 0);
      }
      
      this.ctx.restore();
    });
  }
} 