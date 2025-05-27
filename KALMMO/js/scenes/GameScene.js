// GameScene.js - Main gameplay scene
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.npcs = [];
        this.interactables = [];
        this.currentMap = 'test_map'; // Or whatever you named your Tiled map key
    }

    create() {
        this.createWorld();
        this.createPlayer();
        this.createNPCs();
        this.setupCamera();
        this.createUI();
        this.setupEventListeners();

        if (this.game.settings.autoSave) {
            saveManager.enableAutoSave(this); //
        }
    
        // Debug: log tile info when clicking
        
    this.input.on('pointerdown', (pointer) => {
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const tileX = Math.floor(worldPoint.x / 16);
        const tileY = Math.floor(worldPoint.y / 16);
        
        const groundTile = this.groundLayer.getTileAt(tileX, tileY);
        const obstacleTile = this.obstaclesLayer.getTileAt(tileX, tileY);
        
        console.log(`Clicked tile (${tileX}, ${tileY})`);
        if (groundTile) console.log('Ground:', groundTile.index);
        if (obstacleTile) console.log('Obstacle:', obstacleTile.index, 'Collides:', obstacleTile.collides);
    });
}

    createWorld() {
    this.map = this.make.tilemap({ key: this.currentMap });
    const tileset = this.map.addTilesetImage('basictiles', 'basictiles');

    this.groundLayer = this.map.createLayer('Ground', tileset, 0, 0);
    this.obstaclesLayer = this.map.createLayer('Obstacles', tileset, 0, 0);

    // Set collision for specific tile IDs that have collision in your tileset
    // Based on your tileset: 23 (tree), 64 (rock), 77 (wall) have collides=true
    this.obstaclesLayer.setCollision([23, 64, 77]);
    
    // Alternative: use the property you set in Tiled
    // this.obstaclesLayer.setCollisionByProperty({ collides: true });

    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
}

    createVillageCenter(centerX, centerY) {
        // This function can be removed or repurposed if your Tiled map defines the village
        // Original functionality (if needed for reference):
        // for (let y = centerY - 5; y <= centerY + 5; y++) {
        //     for (let x = centerX - 5; x <= centerX + 5; x++) {
        //         this.groundLayer.putTileAt(1, x, y); 
        //         this.objectLayer.removeTileAt(x, y); 
        //     }
        // }
        // this.objectLayer.putTileAt(2, centerX, centerY);
        // this.objectLayer.putTileAt(2, centerX, centerY - 1);
        // const truthStone = this.objectLayer.getTileAt(centerX, centerY);
        // if (truthStone) {
        //     truthStone.properties = { interactive: true, type: 'truth_stone' };
        // }
    }

    createPlayer() {
        const startX = 3; // Grid units
        const startY = 3; // Grid units
        this.player = new Player(this, startX, startY, GameConfig.player.defaultAnimal); //

        if (this.obstaclesLayer) {
            this.physics.add.collider(this.player, this.obstaclesLayer); //
        }
    }

    createNPCs() {
        // Example NPC 1 (adjust data and position as needed)
        const npc1Data = {
            name: 'Elder Meerkat', //
            dialog: [ //
                "Welcome, young Paladin!", //
                "The Truth Stone has been waiting for you.", //
                "Touch it to begin your journey." //
            ]
        };
        const npc1 = this.physics.add.sprite(17 * GameConfig.tile.width, 15 * GameConfig.tile.height, 'meerkat'); //
        npc1.setTint(0x888888); //
        npc1.gridX = 17; //
        npc1.gridY = 15; //
        npc1.npcData = npc1Data; //
        this.npcs.push(npc1); //
        if (this.obstaclesLayer) {
            this.physics.add.collider(npc1, this.obstaclesLayer); //
        }

        // Example NPC 2 (Quest Giver)
        const questNpcData = {
            name: 'Scout Leader', //
            dialog: [ //
                "Ah, a new recruit!", //
                "We need someone to check the watchtower.", //
                "Can you go there and report back?" //
            ],
            quest: 'first_patrol' //
        };
        const questNpc = this.physics.add.sprite(13 * GameConfig.tile.width, 15 * GameConfig.tile.height, 'meerkat'); //
        questNpc.setTint(0xffff00); //
        questNpc.gridX = 13; //
        questNpc.gridY = 15; //
        questNpc.npcData = questNpcData; //
        this.npcs.push(questNpc); //
        if (this.obstaclesLayer) {
            this.physics.add.collider(questNpc, this.obstaclesLayer); //
        }
        
        this.npcs.forEach(npc => npc.body.setImmovable(true)); //
    }

    setupCamera() {
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08); //
        this.cameras.main.setZoom(GameConfig.display.zoom); //
    }

    createUI() {
        // this.scene.launch('UIScene'); // UIScene is not defined yet.
        
        this.debugText = this.add.text(10, 10, '', { //
            fontSize: '16px', //
            fill: '#ffffff', //
            backgroundColor: '#000000', //
            padding: { x: 5, y: 5 } //
        });
        this.debugText.setScrollFactor(0); //
        this.debugText.setDepth(1000); //
    }

    // ... (other methods like createUI)

// GameScene.js - Main gameplay scene   

setupEventListeners() {
    // Use the string values directly for now
    EventBus.on('player.interact', (data) => {
        this.handleInteraction(data.x, data.y);
    });
    
    EventBus.on('quest.completed', (questId) => {
        this.handleQuestComplete(questId);
    });
    
    this.input.keyboard.on('keydown-S', () => {
        if (this.input.keyboard.addKey('CTRL').isDown) {
            this.saveGame();
        }
    });
    
    this.input.keyboard.on('keydown-L', () => {
        if (this.input.keyboard.addKey('CTRL').isDown) {
            this.loadGame();
        }
    });
}

// In Player.js interact method, replace EventBus.emit line with:
interact() {
    // Check for NPCs or objects in front of player
    let facingX = this.gridX;
    let facingY = this.gridY;
    
    // Determine facing direction based on last animation
    if (this.anims.currentAnim) {
        const animKey = this.anims.currentAnim.key;
        if (animKey.includes('down')) facingY++;
        else if (animKey.includes('up')) facingY--;
        else if (animKey.includes('left')) facingX--;
        else if (animKey.includes('right')) facingX++;
    }
    
    // Emit interaction event with correct string
    EventBus.emit('player.interact', { x: facingX, y: facingY });
}

    handleInteraction(x, y) {
        const npc = this.npcs.find(n => n.gridX === x && n.gridY === y); //
        if (npc) {
            this.startDialog(npc.npcData); //
            return; //
        }
        
        if (this.obstaclesLayer) {
            const tile = this.obstaclesLayer.getTileAt(x, y); //
            if (tile && tile.properties && tile.properties.interactive) { //
                this.handleTileInteraction(tile); //
                return; //
            }
        }
    }

    handleTileInteraction(tile) {
        if (tile.properties.type === 'truth_stone') { //
            this.startDialog({ //
                name: 'Truth Stone', //
                dialog: [ //
                    "The ancient Truth Stone glows with warm light.", //
                    "You feel your conviction strengthen.", //
                    "Your journey as a Paladin begins!" //
                ]
            });
            this.player.addExperience(50); //
        }
    }
    
    startDialog(dialogData) {
        this.player.state = 'talking'; //
        
        const dialogBox = this.add.rectangle( //
            GameConfig.display.width / 2, //
            GameConfig.display.height - 100, //
            GameConfig.display.width - 40, //
            120, //
            0x000000, //
            0.8 //
        );
        dialogBox.setScrollFactor(0); //
        
        const dialogText = this.add.text( //
            GameConfig.display.width / 2, //
            GameConfig.display.height - 100, //
            '', //
            { //
                fontSize: '16px', //
                fill: '#ffffff', //
                align: 'center', //
                wordWrap: { width: GameConfig.display.width - 80 } //
            }
        );
        dialogText.setOrigin(0.5); //
        dialogText.setScrollFactor(0); //
        
        const nameText = this.add.text( //
            30, //
            GameConfig.display.height - 150, //
            dialogData.name, //
            { //
                fontSize: '18px', //
                fill: '#ffff00' //
            }
        );
        nameText.setScrollFactor(0); //
        
        let currentLine = 0; //
        dialogText.setText(dialogData.dialog[currentLine]); //
        
        const nextLine = () => { //
            currentLine++; //
            if (currentLine < dialogData.dialog.length) { //
                dialogText.setText(dialogData.dialog[currentLine]); //
            } else {
                dialogBox.destroy(); //
                dialogText.destroy(); //
                nameText.destroy(); //
                this.player.state = 'idle'; //
                
                if (dialogData.quest) { //
                    this.player.addQuest(dialogData.quest); //
                }
            }
        };
        
        const spaceKey = this.input.keyboard.addKey('SPACE'); //
        spaceKey.on('down', nextLine); //
        
        this.events.once('shutdown', () => { //
            spaceKey.off('down', nextLine); //
        });
    }

    handleQuestComplete(questId) {
        if (questId === 'first_patrol') { //
            this.startDialog({ //
                name: 'System', //
                dialog: [ //
                    "Quest Complete: First Patrol!", //
                    "You gained 100 experience points!", //
                    "Your dedication to duty has been noticed." //
                ]
            });
            this.player.addExperience(100); //
        }
    }

    update(time, delta) {
        if (this.player && this.debugText) { // Ensure player and debugText exist
            this.debugText.setText([ //
                `Animal: ${this.player.animalType}`, //
                `Level: ${this.player.level}`, //
                `EXP: ${this.player.experience}/${this.player.experienceToNext}`, //
                `Pos: ${this.player.gridX}, ${this.player.gridY}`, //
                `State: ${this.player.state}`, //
                `[Ctrl+S] Save | [Ctrl+L] Load` //
            ]);
        }
    }
    
    saveGame() {
        const gameData = this.getGameData(); //
        if (saveManager.saveGame(gameData)) { //
            this.showMessage('Game Saved!'); //
        }
    }

    loadGame() {
        const gameData = saveManager.loadGame(); //
        if (gameData) {
            if (this.player && gameData.player) { //
                 this.player.loadSaveData(gameData.player); //
            }
            if (gameData.world && gameData.world.currentMap) { //
                this.currentMap = gameData.world.currentMap; //
            }
            this.showMessage('Game Loaded!'); //
        }
    }
    
    getGameData() {
        return { //
            player: this.player ? this.player.getSaveData() : null, //
            world: { //
                currentMap: this.currentMap //
            },
            playtime: this.time.now //
        };
    }

    showMessage(text) {
        const message = this.add.text( //
            this.cameras.main.width / 2, //
            this.cameras.main.height / 2, //
            text, //
            { //
                fontSize: '24px', //
                fill: '#ffffff', //
                backgroundColor: '#000000', //
                padding: { x: 20, y: 10 } //
            }
        );
        message.setOrigin(0.5); //
        message.setScrollFactor(0); //
        message.setDepth(2000); //
        
        this.tweens.add({ //
            targets: message, //
            alpha: 0, //
            duration: 2000, //
            ease: 'Power2', //
            onComplete: () => message.destroy() //
        });
    }
}