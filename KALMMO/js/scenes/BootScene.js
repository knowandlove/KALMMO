// BootScene.js - Handles initial asset loading
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        this.createLoadingBar();
        this.loadAssets();
    }

    createLoadingBar() {
        // ... your existing loading bar code ...
        // (This part is fine as is)
        const width = 400;
        const height = 20;
        const x = (GameConfig.display.width - width) / 2; // GameConfig from js/config/GameConfig.js
        const y = GameConfig.display.height / 2; // GameConfig from js/config/GameConfig.js
        
        this.add.rectangle(x, y, width, height, 0x222222);
        
        const progressBar = this.add.rectangle(x - width/2, y, 0, height, 0x00ff00);
        progressBar.setOrigin(0, 0.5);
        
        const loadingText = this.add.text(GameConfig.display.width / 2, y - 30, 'Loading...', { // GameConfig from js/config/GameConfig.js
            fontSize: '20px',
            fill: '#ffffff'
        });
        loadingText.setOrigin(0.5, 0.5);
        
        const percentText = this.add.text(GameConfig.display.width / 2, y + 30, '0%', { // GameConfig from js/config/GameConfig.js
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
            // Note: We will likely get an error after this if 'meerkat' texture is missing,
            // but the goal here is to see if the loading bar itself completes.
        });
    }

    loadAssets() {
        // TEMPORARILY COMMENT OUT THE 'filecomplete' HANDLER AND DATA URI LOADS
        /*
        this.load.on('filecomplete', (key) => {
            if (key === 'meerkat_placeholder') {
                // We will call createPlaceholderSprite directly in create() for this test
            }
        });
        this.load.image('meerkat_placeholder', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        this.load.image('dialog_bg', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        */

        // Load actual assets
        this.load.image('basictiles', 'assets/tilesets/basictiles.png');
        this.load.tilemapTiledJSON('test_map', 'assets/tilemaps/test_map.json');

        // For the test, we'll also need a placeholder for the meerkat sprite later.
        // We'll create it directly in the create() method if loading completes.
    }

    createPlaceholderSprite(key, color) {
        // ... (your existing placeholder sprite code is fine)
        const canvas = this.textures.createCanvas(key, 16, 64);
        const context = canvas.getContext('2d');
        for (let i = 0; i < 4; i++) {
            for (let frame = 0; frame < 4; frame++) {
                const y = i * 16;
                context.fillStyle = '#' + color.toString(16).padStart(6, '0');
                context.fillRect(4, y + 4, 8, 10);
                context.fillRect(5, y + 2, 6, 6);
                if (frame % 2 === 0) {
                    context.fillRect(2, y + 6, 2, 4);
                    context.fillRect(12, y + 8, 2, 4);
                } else {
                    context.fillRect(2, y + 8, 2, 4);
                    context.fillRect(12, y + 6, 2, 4);
                }
            }
        }
        canvas.refresh();
    }
    
    create() {
        // If loading completes, create the placeholder sprite texture manually for now
        // so GameScene doesn't immediately error out looking for 'meerkat'
        this.createPlaceholderSprite('meerkat', 0x8B4513); 
        // Also create a dummy dialog_bg texture if other parts of your code might expect it
        const dialogCanvas = this.textures.createCanvas('dialog_bg', 1, 1);
        const dialogCtx = dialogCanvas.getContext('2d');
        dialogCtx.fillStyle = 'rgba(0,0,0,0)'; // Transparent
        dialogCtx.fillRect(0,0,1,1);
        dialogCanvas.refresh();


        this.initializeSystems();
        this.scene.start('GameScene');
    }

    initializeSystems() {
        const settings = saveManager.loadSettings(); // saveManager from js/managers/SaveManager.js
        this.game.settings = settings;
    }
}