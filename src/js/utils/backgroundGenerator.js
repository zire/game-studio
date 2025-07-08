// Beautiful Background Generator
export class BackgroundGenerator {
  constructor() {
    this.currentScheme = null;
    this.transitionDuration = 2000; // 2 seconds for smooth transitions
    this.lastChange = 0;
    this.changeInterval = 30000; // Change every 30 seconds
    this.backgroundCanvas = null;
    this.backgroundCtx = null;
    this.particles = [];
  }

  // Generate a beautiful color scheme
  generateColorScheme() {
    const schemes = [
      // Deep Space Theme
      {
        name: 'Deep Space',
        background: '#0a0a1a',
        accent: '#4a90e2',
        highlight: '#7b68ee',
        text: '#ffffff',
        particles: ['#4a90e2', '#7b68ee', '#9370db', '#8a2be2']
      },
      // Sunset Theme
      {
        name: 'Sunset',
        background: '#2c1810',
        accent: '#ff6b35',
        highlight: '#f7931e',
        text: '#ffffff',
        particles: ['#ff6b35', '#f7931e', '#ff8c42', '#ffa500']
      },
      // Ocean Depths
      {
        name: 'Ocean Depths',
        background: '#0f1419',
        accent: '#00bfff',
        highlight: '#20b2aa',
        text: '#ffffff',
        particles: ['#00bfff', '#20b2aa', '#48cae4', '#90e0ef']
      },
      // Forest Night
      {
        name: 'Forest Night',
        background: '#0a1a0a',
        accent: '#228b22',
        highlight: '#32cd32',
        text: '#ffffff',
        particles: ['#228b22', '#32cd32', '#90ee90', '#98fb98']
      },
      // Purple Haze
      {
        name: 'Purple Haze',
        background: '#1a0a1a',
        accent: '#9370db',
        highlight: '#ba55d3',
        text: '#ffffff',
        particles: ['#9370db', '#ba55d3', '#dda0dd', '#e6e6fa']
      },
      // Golden Hour
      {
        name: 'Golden Hour',
        background: '#1a1a0a',
        accent: '#ffd700',
        highlight: '#ffa500',
        text: '#ffffff',
        particles: ['#ffd700', '#ffa500', '#ffb347', '#ffc125']
      },
      // Crimson Night
      {
        name: 'Crimson Night',
        background: '#1a0a0a',
        accent: '#dc143c',
        highlight: '#ff1493',
        text: '#ffffff',
        particles: ['#dc143c', '#ff1493', '#ff69b4', '#ffb6c1']
      },
      // Arctic Blue
      {
        name: 'Arctic Blue',
        background: '#0a1a1a',
        accent: '#87ceeb',
        highlight: '#b0e0e6',
        text: '#ffffff',
        particles: ['#87ceeb', '#b0e0e6', '#add8e6', '#f0f8ff']
      },
      // Emerald Dream
      {
        name: 'Emerald Dream',
        background: '#0a1a0a',
        accent: '#00ff7f',
        highlight: '#7fff00',
        text: '#ffffff',
        particles: ['#00ff7f', '#7fff00', '#32cd32', '#90ee90']
      },
      // Cosmic Purple
      {
        name: 'Cosmic Purple',
        background: '#1a0a1a',
        accent: '#9932cc',
        highlight: '#ba55d3',
        text: '#ffffff',
        particles: ['#9932cc', '#ba55d3', '#dda0dd', '#e6e6fa']
      }
    ];

    // Pick a random scheme
    const scheme = schemes[Math.floor(Math.random() * schemes.length)];
    
    // Add some variation to the base colors
    scheme.background = this.addVariation(scheme.background, 0.1);
    scheme.accent = this.addVariation(scheme.accent, 0.15);
    scheme.highlight = this.addVariation(scheme.highlight, 0.15);
    
    return scheme;
  }

  // Add subtle variation to a color
  addVariation(color, intensity = 0.1) {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;

    const variation = (Math.random() - 0.5) * intensity;
    const newRgb = {
      r: Math.max(0, Math.min(255, rgb.r + rgb.r * variation)),
      g: Math.max(0, Math.min(255, rgb.g + rgb.g * variation)),
      b: Math.max(0, Math.min(255, rgb.b + rgb.b * variation))
    };

    return this.rgbToHex(newRgb);
  }

  // Convert hex to RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Convert RGB to hex
  rgbToHex(rgb) {
    return "#" + ((1 << 24) + (Math.round(rgb.r) << 16) + (Math.round(rgb.g) << 8) + Math.round(rgb.b)).toString(16).slice(1);
  }

  // Create animated background particles
  createBackgroundParticles(scheme) {
    const particles = [];
    const particleCount = 15 + Math.floor(Math.random() * 10);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * this.backgroundCanvas.width,
        y: Math.random() * this.backgroundCanvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 2 + Math.random() * 3,
        opacity: 0.1 + Math.random() * 0.3,
        color: scheme.particles[Math.floor(Math.random() * scheme.particles.length)],
        pulse: Math.random() < 0.3,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    return particles;
  }

  // Update and draw background particles
  updateBackgroundParticles(scheme) {
    if (!this.backgroundCtx) return;

    // Clear background with gradient
    const gradient = this.backgroundCtx.createRadialGradient(
      this.backgroundCanvas.width / 2, this.backgroundCanvas.height / 2, 0,
      this.backgroundCanvas.width / 2, this.backgroundCanvas.height / 2, Math.max(this.backgroundCanvas.width, this.backgroundCanvas.height) / 2
    );
    gradient.addColorStop(0, scheme.background);
    gradient.addColorStop(1, this.darkenColor(scheme.background, 0.3));
    
    this.backgroundCtx.fillStyle = gradient;
    this.backgroundCtx.fillRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);

    // Update and draw particles
    this.particles.forEach(particle => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Wrap around edges
      if (particle.x < 0) particle.x = this.backgroundCanvas.width;
      if (particle.x > this.backgroundCanvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.backgroundCanvas.height;
      if (particle.y > this.backgroundCanvas.height) particle.y = 0;

      // Update pulse
      if (particle.pulse) {
        particle.pulsePhase += particle.pulseSpeed;
      }

      // Draw particle
      this.backgroundCtx.save();
      this.backgroundCtx.globalAlpha = particle.opacity * (particle.pulse ? 0.5 + 0.5 * Math.sin(particle.pulsePhase) : 1);
      
      // Create particle glow
      const glowGradient = this.backgroundCtx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 3
      );
      glowGradient.addColorStop(0, particle.color);
      glowGradient.addColorStop(1, 'transparent');
      
      this.backgroundCtx.fillStyle = glowGradient;
      this.backgroundCtx.beginPath();
      this.backgroundCtx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
      this.backgroundCtx.fill();

      // Draw core particle
      this.backgroundCtx.fillStyle = particle.color;
      this.backgroundCtx.beginPath();
      this.backgroundCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.backgroundCtx.fill();
      
      this.backgroundCtx.restore();
    });
  }

  // Darken a color
  darkenColor(color, factor) {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;

    return this.rgbToHex({
      r: rgb.r * (1 - factor),
      g: rgb.g * (1 - factor),
      b: rgb.b * (1 - factor)
    });
  }

  // Get current or generate new scheme
  getCurrentScheme() {
    const now = Date.now();
    
    // Change scheme periodically
    if (!this.currentScheme || now - this.lastChange > this.changeInterval) {
      this.currentScheme = this.generateColorScheme();
      this.lastChange = now;
      
      // Update particles with new scheme
      this.particles = this.createBackgroundParticles(this.currentScheme);
      
      // Apply the new scheme
      this.applyScheme(this.currentScheme);
    }
    
    return this.currentScheme;
  }

  // Apply scheme to game elements
  applyScheme(scheme) {
    console.log('BackgroundGenerator: Applying color scheme:', scheme.name);
    console.log('BackgroundGenerator: Colors:', {
      background: scheme.background,
      accent: scheme.accent,
      highlight: scheme.highlight,
      text: scheme.text
    });
    
    // Update CSS custom properties
    document.documentElement.style.setProperty('--game-background', scheme.background);
    document.documentElement.style.setProperty('--game-accent', scheme.accent);
    document.documentElement.style.setProperty('--game-highlight', scheme.highlight);
    document.documentElement.style.setProperty('--game-text', scheme.text);

    // Update body background
    document.body.style.background = scheme.background;
    
    // Add subtle animation to the background
    document.body.style.transition = `background ${this.transitionDuration}ms ease-in-out`;
    
    console.log('BackgroundGenerator: CSS variables updated');
  }

  // Initialize background system
  init(gameCanvas) {
    console.log('BackgroundGenerator: Initializing...');
    
    // Create background canvas
    this.backgroundCanvas = document.createElement('canvas');
    this.backgroundCanvas.style.position = 'absolute';
    this.backgroundCanvas.style.top = '0';
    this.backgroundCanvas.style.left = '0';
    this.backgroundCanvas.style.width = '100%';
    this.backgroundCanvas.style.height = '100%';
    this.backgroundCanvas.style.zIndex = '-1';
    this.backgroundCanvas.style.pointerEvents = 'none';
    
    // Debug: Make canvas temporarily visible for testing
    this.backgroundCanvas.style.border = '2px solid red';
    this.backgroundCanvas.style.zIndex = '9999';
    console.log('BackgroundGenerator: Canvas created with red border for debugging');
    
    // Insert background canvas before game canvas
    gameCanvas.parentNode.insertBefore(this.backgroundCanvas, gameCanvas);
    
    // Set canvas size
    this.resizeBackgroundCanvas();
    
    // Get initial scheme
    const scheme = this.getCurrentScheme();
    console.log('BackgroundGenerator: Initial scheme:', scheme.name);
    this.applyScheme(scheme);
    
    // Create initial particles
    this.particles = this.createBackgroundParticles(scheme);
    
    // Animation loop for background
    const animateBackground = () => {
      const currentScheme = this.getCurrentScheme();
      this.updateBackgroundParticles(currentScheme);
      requestAnimationFrame(animateBackground);
    };
    
    animateBackground();
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.resizeBackgroundCanvas();
    });
    
    console.log('BackgroundGenerator: Initialization complete');
  }

  // Resize background canvas
  resizeBackgroundCanvas() {
    if (!this.backgroundCanvas) return;
    
    this.backgroundCanvas.width = window.innerWidth;
    this.backgroundCanvas.height = window.innerHeight;
    this.backgroundCtx = this.backgroundCanvas.getContext('2d');
  }

  // Manual test function to force a background change
  forceChange() {
    console.log('BackgroundGenerator: Forcing background change...');
    this.currentScheme = null;
    this.lastChange = 0;
    const newScheme = this.getCurrentScheme();
    console.log('BackgroundGenerator: Forced new scheme:', newScheme.name);
  }
} 