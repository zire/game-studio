# Brandon's Epic Game Studio 🎮

Welcome to Brandon's Epic Game Studio! This is a collection of fun games created by Brandon Yang, a 9-year-old game designer.

## 🎯 Current Games

### Pacman Adventure
- **Description**: Navigate through randomly generated mazes, collect golden pellets, and avoid the colorful ghosts!
- **Features**: 
  - Random maze generation for unique gameplay every time
  - 4 colorful ghosts with different personalities
  - Sound effects for pellet collection
  - Responsive controls using arrow keys
- **How to Play**: Use arrow keys to move Pacman around the maze. Collect all pellets while avoiding the ghosts!

## 🚀 Deployment to Internet Computer

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

### Local Development
1. Deploy to local network:
   ```bash
   dfx deploy
   ```

2. Open the application:
   ```bash
   dfx canister open game_studio
   ```

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
│   ├── pacman.html         # Pacman game
│   └── waka.wav           # Sound effect for Pacman
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