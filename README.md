# Brandon's Epic Game Studio 🎮

Welcome to Brandon's Epic Game Studio! This is a collection of fun games created by Brandon Yang, a 9-year-old game designer.

## 🎯 Current Games

### Pacboy Adventure
- **Description**: Navigate through randomly generated mazes, collect golden pellets, and avoid the colorful ghosts!
- **Features**: 
  - Random maze generation for unique gameplay every time
  - 4 colorful ghosts with different personalities
  - **Weapon System**: Fire blast 🔥 and freeze wind ❄️ weapons
  - Sound effects for pellet collection and weapons
  - Responsive controls using arrow keys and touch
  - **PWA Ready**: Install as mobile app for offline play
- **How to Play**: Use arrow keys or touch controls to move Pacboy. Collect all pellets while avoiding ghosts. Use weapons to defend yourself!

## 🚀 Local Development & Testing

### Quick Start (Local Testing)
1. Start a local HTTP server:
   ```bash
   python3 -m http.server 8080 --bind 0.0.0.0
   ```

2. Find your computer's IP address:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

3. Access the game:
   - **Desktop**: `http://localhost:8080/src/pacman.html`
   - **Mobile/Tablet**: `http://[YOUR_IP]:8080/src/pacman.html`
   
   Example: `http://192.168.198.136:8080/src/pacman.html`

### Mobile Testing
- **iPhone/iPad**: Open Safari and navigate to the mobile URL
- **Android**: Open Chrome and navigate to the mobile URL
- **Features to test**:
  - Touch controls (arrow buttons, weapon buttons)
  - Weapon system (fire blast 🔥, freeze wind ❄️)
  - Sound effects (tap screen first to enable audio)
  - Responsive design and performance
  - **PWA Installation**: Look for "Add to Home Screen" option

### PWA Features
- **Offline Play**: Game works without internet connection
- **App-like Experience**: Install on home screen for quick access
- **Touch Optimized**: Designed specifically for mobile devices
- **Auto-updates**: Game updates automatically when online

### Troubleshooting
- **Port already in use**: Try different ports (3000, 5000, 8080)
- **Connection issues**: Ensure both devices are on the same WiFi network
- **Firewall blocking**: Check Mac's firewall settings

## 🌐 Deployment to Internet Computer

This project is configured to deploy to the Internet Computer blockchain using DFX.

### Prerequisites
1. Install DFX (DFINITY Canister SDK)
   ```bash
   sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
   ```

2. Start the local Internet Computer replica
   ```bash
   dfx start --background
   ```

### Local DFX Development
1. Deploy to local network:
   ```bash
   dfx deploy
   ```

2. Open the application:
   ```bash
   dfx canister open game_studio
   ```

### Browser Compatibility Notes
- **Safari**: Works well with automatic refresh
- **Chrome**: Usually handles cache updates properly
- **Firefox**: May require hard refresh after dfx deployments
  - **Hard Refresh**: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows/Linux)
  - **Alternative**: Open Developer Tools (F12) → Network tab → Check "Disable cache"

### Production Deployment
1. Deploy to mainnet:
   ```bash
   dfx deploy --network ic
   ```

2. The canister will be available at: `https://[CANISTER_ID].ic0.app`

## 🛠️ Project Structure

```
game-studio/
├── src/
│   ├── index.html          # Main landing page
│   ├── pacman.html         # Pacboy game
│   └── waka.wav           # Sound effect for Pacboy
├── pacman/                 # Original game files
├── dfx.json               # DFX configuration
└── README.md              # This file
```

## 🎨 Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient backgrounds and smooth animations
- **Cross-Platform**: Playable on any device with a web browser
- **Decentralized**: Hosted on the Internet Computer blockchain

## 👨‍💻 About the Developer

Brandon Yang is a 9-year-old game designer who loves creating fun and engaging games. This studio showcases his passion for game development and creativity.

## 🔮 Future Games

Brandon is currently working on:
- Puzzle adventures
- Racing games
- Educational games
- And much more!

Stay tuned for new releases!

## 📞 Contact

For questions or feedback about the games, feel free to reach out!

---

*Built with ❤️ by Brandon Yang* 