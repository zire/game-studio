// Main game initialization
import { GameEngine } from './game/engine.js';

// Global game instance
let gameEngine;

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Pacboy Game...');
  
  // Get canvas element
  const canvas = document.getElementById('game');
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }
  
  // Initialize game engine
  gameEngine = new GameEngine(canvas);
  
  // Initialize UI controls
  initializeControls();
  
  // Initialize menu system
  initializeMenu();
  
  // Initialize PWA features
  initializePWA();
  
  console.log('Pacboy Game initialized successfully!');
});

function initializeControls() {
  // Keyboard controls
  document.addEventListener('keydown', e => {
    if (!gameEngine) return;
    
    switch (e.key) {
      case 'ArrowUp': 
      case 'w':
      case 'W':
        gameEngine.tryMove(0, -1); 
        break;
      case 'ArrowDown': 
      case 's':
      case 'S':
        gameEngine.tryMove(0, 1); 
        break;
      case 'ArrowLeft': 
      case 'a':
      case 'A':
        gameEngine.tryMove(-1, 0); 
        break;
      case 'ArrowRight': 
      case 'd':
      case 'D':
        gameEngine.tryMove(1, 0); 
        break;
      case ' ': 
        gameEngine.useFireBlast(); 
        break;
      case 'f': 
      case 'F':
        gameEngine.useFreezeWind(); 
        break;
    }
  });
  
  // Prevent default touch behaviors that might interfere with game
  document.addEventListener('touchstart', (e) => {
    if (e.target.tagName !== 'BUTTON' && !e.target.closest('.hamburger-menu') && !e.target.closest('.menu-overlay')) {
      e.preventDefault();
    }
  }, { passive: false });
  
  document.addEventListener('touchmove', (e) => {
    if (e.target.tagName !== 'BUTTON' && !e.target.closest('.hamburger-menu') && !e.target.closest('.menu-overlay')) {
      e.preventDefault();
    }
  }, { passive: false });

  // Mobile touch controls
  document.querySelectorAll('.control-btn').forEach(btn => {
    let touchStartTime = 0;
    let touchEndTime = 0;
    
    // Handle touch events for iOS
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      touchStartTime = Date.now();
      btn.style.transform = 'scale(0.95)';
      btn.style.background = 'rgba(255, 215, 0, 0.5)';
    });
    
    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      touchEndTime = Date.now();
      
      // Only trigger if it's a quick tap (not a long press)
      if (touchEndTime - touchStartTime < 300 && gameEngine) {
        const direction = btn.dataset.direction;
        switch (direction) {
          case 'up': gameEngine.tryMove(0, -1); break;
          case 'down': gameEngine.tryMove(0, 1); break;
          case 'left': gameEngine.tryMove(-1, 0); break;
          case 'right': gameEngine.tryMove(1, 0); break;
        }
      }
      
      // Reset button appearance
      btn.style.transform = 'scale(1)';
      btn.style.background = 'rgba(255, 215, 0, 0.2)';
    });
    
    // Handle mouse clicks for desktop
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (!gameEngine) return;
      
      const direction = btn.dataset.direction;
      switch (direction) {
        case 'up': gameEngine.tryMove(0, -1); break;
        case 'down': gameEngine.tryMove(0, 1); break;
        case 'left': gameEngine.tryMove(-1, 0); break;
        case 'right': gameEngine.tryMove(1, 0); break;
      }
    });

    // Prevent context menu on long press
    btn.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  });

  // Weapon button controls
  document.querySelectorAll('.weapon-btn').forEach(btn => {
    let touchStartTime = 0;
    let touchEndTime = 0;
    
    // Handle touch events for iOS
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (btn.disabled) return;
      
      touchStartTime = Date.now();
      btn.style.transform = 'scale(0.95)';
    });

    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (btn.disabled) return;
      
      touchEndTime = Date.now();
      
      // Only trigger if it's a quick tap (not a long press)
      if (touchEndTime - touchStartTime < 300 && gameEngine) {
        const weapon = btn.dataset.weapon;
        switch (weapon) {
          case 'fire': gameEngine.useFireBlast(); break;
          case 'freeze': gameEngine.useFreezeWind(); break;
        }
      }
      
      // Reset button appearance
      btn.style.transform = 'scale(1)';
    });
    
    // Handle mouse clicks for desktop
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Weapon button clicked:', btn.dataset.weapon, 'disabled:', btn.disabled, 'gameEngine:', !!gameEngine);
      if (btn.disabled || !gameEngine) return;
      
      const weapon = btn.dataset.weapon;
      switch (weapon) {
        case 'fire': gameEngine.useFireBlast(); break;
        case 'freeze': gameEngine.useFreezeWind(); break;
      }
    });

    // Prevent context menu on long press
    btn.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  });
}

function initializeMenu() {
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const menuOverlay = document.getElementById('menuOverlay');
  const closeMenu = document.getElementById('closeMenu');
  
  // Hamburger menu click and touch handling
  hamburgerMenu.addEventListener('click', openMenu);
  hamburgerMenu.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openMenu();
  });
  
  function openMenu() {
    console.log('Opening menu...');
    
    // Get burger button position to start the expansion from there
    const burgerRect = hamburgerMenu.getBoundingClientRect();
    const startX = burgerRect.left + burgerRect.width / 2;
    const startY = burgerRect.top + burgerRect.height / 2;
    
    // Set transform origin to burger button position
    menuOverlay.style.transformOrigin = `${startX}px ${startY}px`;
    
    hamburgerMenu.classList.add('active');
    menuOverlay.classList.add('active');

    // Pause game when menu is open
    if (gameEngine) {
      gameEngine.pauseGame();
    }
  }
  
  // Close menu handling
  closeMenu.addEventListener('click', closeMenuFunction);
  closeMenu.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenuFunction();
  });
  
  function closeMenuFunction() {
    console.log('Closing menu...');
    
    hamburgerMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
    
    // Resume game when menu is closed
    if (gameEngine) {
      gameEngine.resumeGame();
    }

    // Force a redraw to make sure everything is visible
    if (gameEngine) {
      gameEngine.draw();
    }
  }
  
  // Close menu when clicking outside
  menuOverlay.addEventListener('click', (e) => {
    if (e.target === menuOverlay) {
      closeMenuFunction();
    }
  });
  
  menuOverlay.addEventListener('touchstart', (e) => {
    if (e.target === menuOverlay) {
      e.preventDefault();
      closeMenuFunction();
    }
  });
  
  // Close menu with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOverlay.classList.contains('active')) {
      closeMenuFunction();
    }
  });
}

function initializePWA() {
  // PWA Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
  
  // PWA Installation Prompt
  let deferredPrompt;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button or notification
    showInstallPrompt();
  });
  
  function showInstallPrompt() {
    // You can add a subtle install button or notification here
    console.log('PWA install prompt available');
    
    // Optional: Show a small install notification
    const message = document.getElementById('message');
    if (message && message.textContent === '') {
      showMessage('💡 Tap to install as app', 5000);
      message.style.cursor = 'pointer';
      message.addEventListener('click', installPWA);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        message.style.cursor = 'default';
      }, 5000);
    }
  }

  function installPWA() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
      });
    }
  }
  
  // Handle successful installation
  window.addEventListener('appinstalled', (evt) => {
    console.log('PWA was installed');
    showMessage('🎉 App installed!', 3000);
  });
}

// Global function to show messages (used by game engine)
window.showMessage = function(text, duration = 3000) {
  const message = document.getElementById('message');
  if (!message) return;
  
  message.textContent = text;
  message.classList.add('show');
  
  if (duration > 0) {
    setTimeout(() => {
      message.classList.remove('show');
      setTimeout(() => {
        message.textContent = '';
      }, 300); // Wait for fade out animation
    }, duration);
  }
};

// Global function to clear message
window.clearMessage = function() {
  const message = document.getElementById('message');
  if (!message) return;
  
  message.classList.remove('show');
  setTimeout(() => {
    message.textContent = '';
  }, 300);
}; 