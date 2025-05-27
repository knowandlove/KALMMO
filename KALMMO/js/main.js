// main.js - Initialize and start the game
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GameConfig.display.width,
    height: GameConfig.display.height,
    pixelArt: GameConfig.display.pixelArt,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [BootScene, GameScene]
};

// Create game instance
const game = new Phaser.Game(config);

// Make game accessible globally for debugging
window.game = game;