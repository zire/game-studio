# Brandon's Pacboy Game Studio

A modern, modular HTML5 maze game built with vanilla JavaScript. Navigate through randomly generated mazes, collect golden pellets, and avoid ghosts while using powerful weapons!

## 🎮 Features

- **100 Progressive Levels**: Increasing difficulty with more ghosts
- **Smart Maze Generation**: Simple, reliable maze generation system
- **Weapon System**: Fire blast and freeze wind weapons with cooldowns
- **Responsive Design**: Optimized for mobile and desktop
- **PWA Support**: Install as a native app
- **Touch Controls**: Full mobile support with touch controls
- **Particle Effects**: Celebration and game over animations

## 📁 Project Structure

```
src/
├── index.html                 # Main HTML file (minimal)
├── css/
│   ├── main.css              # Main styles and layout
│   ├── controls.css          # Mobile controls and menu styles
│   └── responsive.css        # Responsive design rules
├── js/
│   ├── main.js               # Main game initialization
│   ├── utils/
│   │   └── constants.js      # Game configuration constants
│   ├── maze/
│   │   ├── generator.js      # Maze generation logic
│   │   └── renderer.js       # Maze and game element rendering
│   ├── game/
│   │   └── engine.js         # Main game engine and logic
│   ├── ui/                   # UI components (future)
│   ├── audio/                # Audio system (future)
│   └── weapons/              # Weapon system (future)
├── assets/
│   ├── images/               # Game images and icons
│   └── sounds/               # Audio files
├── manifest.json             # PWA manifest
├── sw.js                     # Service worker
└── offline.html              # Offline page
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
3. **Open your browser** and navigate to `http://localhost:8000/src/`

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

Game settings can be modified in `js/utils/constants.js`:

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

### Planned Modules
- **Audio System**: Sound effects and music
- **Weapon System**: Advanced weapon mechanics
- **UI Components**: Reusable UI elements
- **Particle System**: Enhanced visual effects
- **Save System**: Progress persistence

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

© 2024 Brandon Yang - All rights reserved

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

---

**Made with ❤️ by Brandon Yang**
*Brandon's Epic Game Studio* 