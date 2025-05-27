// BootScene.js - Updated with proper frame setup
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        this.createLoadingBar();
        this.loadAssets();
    }

    createLoadingBar() {
        const width = 400;
        const height = 20;
        const x = (GameConfig.display.width - width) / 2;
        const y = GameConfig.display.height / 2;
        
        this.add.rectangle(x, y, width, height, 0x222222);
        
        const progressBar = this.add.rectangle(x - width/2, y, 0, height, 0x00ff00);
        progressBar.setOrigin(0, 0.5);
        
        const loadingText = this.add.text(GameConfig.display.width / 2, y - 30, 'Loading...', {
            fontSize: '20px',
            fill: '#ffffff'
        });
        loadingText.setOrigin(0.5, 0.5);
        
        const percentText = this.add.text(GameConfig.display.width / 2, y + 30, '0%', {
            fontSize: '18px',
            fill: '#ffffff'
        });
        percentText.setOrigin(0.5, 0.5);
        
        this.load.on('progress', (value) => {
            progressBar.width = width * value;
            percentText.setText(Math.round(value * 100) + '%');
        });
        
        this.load.on('complete', () => {
            loadingText.setText('Complete!');
        });
    }

    loadAssets() {
        // Load actual assets
        this.load.image('basictiles', 'assets/tilesets/basictiles.png');
        this.load.tilemapTiledJSON('test_map', 'assets/tilemaps/test_map.json');
    }

    createPlaceholderSprite(key, color) {
        // Create a spritesheet with 4 frames (16x16 each, total 16x64)
        const canvas = this.textures.createCanvas(key, 16, 64);
        const context = canvas.getContext('2d');
        
        // Create 4 frames vertically
        for (let frame = 0; frame < 4; frame++) {
            const y = frame * 16;
            context.fillStyle = '#' + color.toString(16).padStart(6, '0');
            
            // Draw a simple character shape for each frame
            context.fillRect(4, y + 4, 8, 10); // Body
            context.fillRect(5, y + 2, 6, 6);  // Head
            
            // Alternate leg positions for walking animation
            if (frame % 2 === 0) {
                context.fillRect(2, y + 6, 2, 4);  // Left leg
                context.fillRect(12, y + 8, 2, 4); // Right leg
            } else {
                context.fillRect(2, y + 8, 2, 4);  // Left leg
                context.fillRect(12, y + 6, 2, 4); // Right leg
            }
        }
        canvas.refresh();
        
        // IMPORTANT: Add individual frames to the texture
        const texture = this.textures.get(key);
        texture.add(0, 0, 0, 0, 16, 16);   // Frame 0: down
        texture.add(1, 0, 0, 16, 16, 16);  // Frame 1: left  
        texture.add(2, 0, 0, 32, 16, 16);  // Frame 2: right
        texture.add(3, 0, 0, 48, 16, 16);  // Frame 3: up
    }
    
    create() {
        // Create the placeholder sprite with proper frames
        this.createPlaceholderSprite('meerkat', 0x8B4513);
        
        // Create dialog background texture
        const dialogCanvas = this.textures.createCanvas('dialog_bg', 1, 1);
        const dialogCtx = dialogCanvas.getContext('2d');
        dialogCtx.fillStyle = 'rgba(0,0,0,0)';
        dialogCtx.fillRect(0,0,1,1);
        dialogCanvas.refresh();

        this.initializeSystems();
        this.scene.start('GameScene');
    }

    initializeSystems() {
        const settings = saveManager.loadSettings();
        this.game.settings = settings;
    }
}