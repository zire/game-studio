// Audio system for Pacboy game
export class AudioManager {
  constructor() {
    this.audioContext = null;
    this.wakaSound = null;
    this.fireSound = null;
    this.freezeSound = null;
    this.gameOverSound = null;
    this.appleSound = null;
    this.isInitialized = false;
    
    this.init();
  }

  async init() {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Load waka sound
      this.wakaSound = new Audio('waka.wav');
      this.wakaSound.volume = 0.5;
      
      // Create weapon sounds
      this.fireSound = this.createFireBlastSound(this.audioContext);
      this.freezeSound = this.createFreezeWindSound(this.audioContext);
      this.gameOverSound = this.createGameOverSound(this.audioContext);
      this.appleSound = this.createAppleSound(this.audioContext);
      
      this.isInitialized = true;
      console.log('Audio system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio system:', error);
    }
  }

  playWakaSound() {
    if (this.wakaSound && this.isInitialized) {
      try {
        this.wakaSound.currentTime = 0;
        this.wakaSound.play().catch(e => {
          console.log('Waka sound play failed:', e);
        });
      } catch (e) {
        console.log('Waka sound play failed:', e);
      }
    }
  }

  playFireBlastSound() {
    if (this.fireSound && this.isInitialized) {
      try {
        const source = this.audioContext.createBufferSource();
        source.buffer = this.fireSound;
        source.connect(this.audioContext.destination);
        source.start();
      } catch (e) {
        console.log('Fire sound play failed:', e);
      }
    }
  }

  playFreezeWindSound() {
    if (this.freezeSound && this.isInitialized) {
      try {
        const source = this.audioContext.createBufferSource();
        source.buffer = this.freezeSound;
        source.connect(this.audioContext.destination);
        source.start();
      } catch (e) {
        console.log('Freeze sound play failed:', e);
      }
    }
  }

  playGameOverSound() {
    if (this.gameOverSound && this.isInitialized) {
      try {
        const source = this.audioContext.createBufferSource();
        source.buffer = this.gameOverSound;
        source.connect(this.audioContext.destination);
        source.start();
      } catch (e) {
        console.log('Game over sound play failed:', e);
      }
    }
  }

  playAppleSound() {
    if (this.appleSound && this.isInitialized) {
      try {
        const source = this.audioContext.createBufferSource();
        source.buffer = this.appleSound;
        source.connect(this.audioContext.destination);
        source.start();
      } catch (e) {
        console.log('Apple sound play failed:', e);
      }
    }
  }

  // Create fire blast sound using Web Audio API
  createFireBlastSound(audioContext) {
    const duration = 0.8;
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 200 + 800 * Math.exp(-t * 3); // Descending frequency
      const amplitude = Math.exp(-t * 2) * 0.3; // Decay envelope
      const noise = (Math.random() - 0.5) * 0.5; // Add some noise
      const wave = Math.sin(2 * Math.PI * frequency * t) + noise;
      data[i] = wave * amplitude;
    }
    
    return buffer;
  }

  // Create freeze wind sound using Web Audio API
  createFreezeWindSound(audioContext) {
    const duration = 1.0;
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 300 + 200 * Math.sin(t * 10); // Oscillating frequency
      const amplitude = Math.exp(-t * 1.5) * 0.25; // Gentle decay
      const noise = (Math.random() - 0.5) * 0.3; // Subtle noise
      const wave = Math.sin(2 * Math.PI * frequency * t) + noise;
      data[i] = wave * amplitude;
    }
    
    return buffer;
  }

  // Create game over sound using Web Audio API
  createGameOverSound(audioContext) {
    const duration = 2.0;
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      
      // Create a dramatic descending tone with multiple harmonics
      const baseFreq = 400 * Math.exp(-t * 1.5); // Descending base frequency
      const harmonic1 = 200 * Math.exp(-t * 2); // Lower harmonic
      const harmonic2 = 600 * Math.exp(-t * 1.2); // Higher harmonic
      
      // Combine harmonics with different phases
      const wave1 = Math.sin(2 * Math.PI * baseFreq * t);
      const wave2 = Math.sin(2 * Math.PI * harmonic1 * t + Math.PI / 4);
      const wave3 = Math.sin(2 * Math.PI * harmonic2 * t + Math.PI / 2);
      
      // Add dramatic noise for impact
      const noise = (Math.random() - 0.5) * 0.4;
      
      // Create dramatic envelope with multiple stages
      let amplitude;
      if (t < 0.3) {
        amplitude = 0.5; // Strong start
      } else if (t < 0.8) {
        amplitude = 0.3 * Math.exp(-(t - 0.3) * 2); // Quick decay
      } else {
        amplitude = 0.1 * Math.exp(-(t - 0.8) * 3); // Final fade
      }
      
      // Combine all elements
      const combined = (wave1 + wave2 * 0.6 + wave3 * 0.4 + noise) * amplitude;
      data[i] = Math.max(-1, Math.min(1, combined)); // Clamp to valid range
    }
    
    return buffer;
  }

  // Create apple eating sound using Web Audio API
  createAppleSound(audioContext) {
    const duration = 1.2;
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      
      // Create a cheerful ascending melody with multiple harmonics
      const baseFreq = 400 + 300 * Math.sin(t * 8); // Ascending base frequency
      const harmonic1 = 600 + 400 * Math.sin(t * 6); // Higher harmonic
      const harmonic2 = 800 + 500 * Math.sin(t * 4); // Even higher harmonic
      
      // Create a bell-like sound with harmonics
      const wave1 = Math.sin(2 * Math.PI * baseFreq * t);
      const wave2 = Math.sin(2 * Math.PI * harmonic1 * t + Math.PI / 3);
      const wave3 = Math.sin(2 * Math.PI * harmonic2 * t + Math.PI / 6);
      
      // Add some sparkle with high-frequency components
      const sparkle = Math.sin(2 * Math.PI * 1200 * t) * 0.3;
      
      // Create a cheerful envelope with multiple stages
      let amplitude;
      if (t < 0.1) {
        amplitude = 0.8; // Strong start
      } else if (t < 0.4) {
        amplitude = 0.6 * Math.exp(-(t - 0.1) * 2); // Quick decay
      } else if (t < 0.8) {
        amplitude = 0.4 * Math.exp(-(t - 0.4) * 1.5); // Medium decay
      } else {
        amplitude = 0.2 * Math.exp(-(t - 0.8) * 3); // Final fade
      }
      
      // Add a slight vibrato effect for excitement
      const vibrato = 1 + 0.1 * Math.sin(t * 20);
      
      // Combine all elements with vibrato
      const combined = (wave1 + wave2 * 0.7 + wave3 * 0.5 + sparkle) * amplitude * vibrato;
      data[i] = Math.max(-1, Math.min(1, combined)); // Clamp to valid range
    }
    
    return buffer;
  }
} 