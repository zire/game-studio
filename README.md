# Y3 Labs - Pacboy 2025

A modern, modular HTML5 maze game built with vanilla JavaScript. Navigate through randomly generated mazes, collect golden pellets, and avoid ghosts while using powerful weapons! Created by 9-year-old game designer Brandon Yang.

🌐 **Live Website**: [https://viiha-gqaaa-aaaae-qfe4q-cai.icp0.io](https://viiha-gqaaa-aaaae-qfe4q-cai.icp0.io)

## 🎮 Features

- **100 Progressive Levels**: Increasing difficulty with more ghosts
- **Smart Maze Generation**: Simple, reliable maze generation system
- **Weapon System**: Fire blast and freeze wind weapons with cooldowns
- **Responsive Design**: Optimized for mobile and desktop
- **PWA Support**: Install as a native app
- **Touch Controls**: Full mobile support with touch controls
- **Particle Effects**: Celebration and game over animations
- **Audio System**: Web Audio API with synthesized sounds
- **Landing Page**: Professional Y3 Labs studio introduction
- **Modern UI**: Clean, minimalist design with consistent branding

## 📁 Project Structure

```
y3labs/
├── dfx.json                   # DFX configuration
├── canister_ids.json          # Canister IDs for deployment
├── README.md                  # Project documentation
├── .gitignore                 # Git ignore rules
├── docs/                      # Documentation
│   └── maze-generation.md     # Maze generation documentation
├── scripts/                   # Deployment scripts
├── .github/workflows/         # CI/CD deployment
└── src/                       # Source code
    ├── index.html             # Y3 Labs Game Studio landing page
    ├── manifest.json          # PWA manifest
    ├── sw.js                  # Service worker
    ├── offline.html           # Offline page
    ├── img/                   # Studio images
    │   ├── Y3labs.png        # Studio logo
    │   ├── brandonator.png   # Studio branding
    │   └── internet-computer-logo.png # Powered by logo
    ├── css/                   # Studio styles
    ├── js/                    # Studio scripts
    └── games/
        └── pacboy-2025/       # Pacboy 2025 game
            ├── index.html     # Game page
            ├── manifest.json  # Game PWA manifest
            ├── js/
            │   ├── main.js    # Main game initialization
            │   ├── utils/
            │   │   └── constants.js # Game configuration constants
            │   ├── maze/
            │   │   ├── generator.js # Maze generation logic
            │   │   └── renderer.js  # Maze and game element rendering
            │   ├── game/
            │   │   └── engine.js    # Main game engine and logic
            │   ├── audio/
            │   │   └── sounds.js    # Audio system (Web Audio API)
            │   └── ui/              # UI components
            ├── css/
            │   ├── main.css         # Core layout and game container styles
            │   ├── controls.css     # Mobile controls and menu styles
            │   └── responsive.css   # Responsive design rules
            ├── assets/
            │   ├── images/          # Game images and icons
            │   └── sounds/          # Audio files
            ├── testing/             # Game testing files
            │   ├── wall_debug_test.html
            │   ├── test_maze_fix.html
            │   └── maze_validation_test.html
            └── waka.wav             # Original sound file
```

## 🚀 Getting Started

### Prerequisites

- Modern web browser with ES6 module support
- Local web server (for development)

### Installation

1. **Clone or download the project**
2. **Start a local web server**:
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```
3. **Open your browser** and navigate to `http://localhost:8000/src/` for the Y3 Labs studio page, or `http://localhost:8000/src/games/pacboy-2025/` for the game directly

### Development

The game is built with ES6 modules, so you need to serve it from a web server (not just open the HTML file directly).

## 🎯 How to Play

### Controls
- **Desktop**: Arrow keys or WASD to move
- **Mobile**: Touch controls below the game
- **Weapons**: 
  - Spacebar/F key for weapons
  - Touch weapon buttons on mobile

### Objective
1. Navigate through the maze
2. Collect all golden pellets
3. Reach the apple (exit) while avoiding ghosts
4. Use weapons strategically to defeat ghosts

### Weapons
- **Fire Blast 🔥**: Long-range, high damage, long cooldown
- **Freeze Wind ❄️**: Short-range, crowd control, medium cooldown

## 🏗️ Architecture

### Modular Design

The game is organized into logical modules:

#### **Constants (`js/utils/constants.js`)**
- Game configuration values
- Ghost and weapon settings
- CSS class names
- Game states

#### **Maze System (`js/maze/`)**
- **Generator**: Creates mazes with thin dividers
- **Renderer**: Draws maze, walls, and game elements

#### **Game Engine (`js/game/engine.js`)**
- Main game loop and state management
- Ghost AI and movement
- Collision detection
- Level progression

#### **Main Controller (`js/main.js`)**
- Initializes all systems
- Handles user input
- Manages UI interactions
- PWA setup

#### **Audio System (`js/audio/sounds.js`)**
- Web Audio API implementation
- Synthesized waka sound
- Audio context management
- Sound effect controls

### Key Benefits

1. **Maintainability**: Each module has a single responsibility
2. **Testability**: Modules can be tested independently
3. **Scalability**: Easy to add new features
4. **Readability**: Clear separation of concerns
5. **Reusability**: Modules can be reused in other projects

## 🎨 Styling

### CSS Organization

- **`main.css`**: Core layout and game container styles
- **`controls.css`**: Mobile controls, menu, and weapon buttons
- **`responsive.css`**: Mobile and tablet optimizations

### Design Principles

- **Mobile-first**: Optimized for touch devices
- **Responsive**: Adapts to different screen sizes
- **Accessible**: Proper contrast and touch targets
- **Modern**: Uses CSS Grid, Flexbox, and modern features

## 🔧 Configuration

Game settings can be modified in `src/games/pacboy-2025/js/utils/constants.js`:

```javascript
export const GAME_CONFIG = {
  MAP_WIDTH: 10,              // Maze width
  MAP_HEIGHT: 16,             // Maze height
  GHOST_MOVE_INTERVAL: 350,   // Ghost movement speed
  FIRE_BLAST_COOLDOWN: 5000,  // Weapon cooldown
  // ... more settings
};
```

## 📱 PWA Features

- **Offline Support**: Game works without internet
- **Installable**: Add to home screen
- **App-like Experience**: Full-screen mode
- **Service Worker**: Caches game assets

## 🚀 Performance

- **Efficient Rendering**: Canvas-based graphics
- **Optimized Loops**: 60fps game loop
- **Memory Management**: Proper cleanup of intervals
- **Responsive Canvas**: Adapts to screen size

## 🔮 Future Enhancements

### Implemented Modules
- **Audio System**: Web Audio API with synthesized sounds ✅
- **Weapon System**: Fire blast and freeze wind mechanics ✅
- **Particle System**: Celebration and game over effects ✅
- **Landing Page**: Professional Y3 Labs studio introduction ✅

### Future Enhancements
- **Save System**: Progress persistence
- **Level Editor**: Custom maze creation
- **Multiplayer**: Real-time multiplayer
- **Achievements**: Unlockable content
- **Leaderboards**: Global scoring
- **Themes**: Visual customization

### Potential Features
- **Multiplayer**: Real-time multiplayer
- **Level Editor**: Custom maze creation
- **Achievements**: Unlockable content
- **Leaderboards**: Global scoring
- **Themes**: Visual customization

## 🐛 Troubleshooting

### Common Issues

1. **Blank Screen**: Make sure you're serving from a web server
2. **Module Errors**: Check browser console for ES6 support
3. **Touch Not Working**: Ensure touch events aren't blocked
4. **Performance Issues**: Check for multiple game instances

### Debug Mode

Open browser console to see debug messages:
```javascript
// Enable debug logging
localStorage.setItem('debug', 'true');
```

## 📄 License

© 2025 Y3 Labs - All rights reserved

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!