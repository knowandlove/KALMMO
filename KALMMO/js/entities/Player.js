// Player.js - Complete Player class
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, gridX, gridY, animalType) {
        // Convert grid coordinates to pixel coordinates
        const pixelX = gridX * GameConfig.tile.width + GameConfig.tile.width / 2;
        const pixelY = gridY * GameConfig.tile.height + GameConfig.tile.height / 2;
        
        super(scene, pixelX, pixelY, animalType);
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Properties
        this.scene = scene;
        this.gridX = gridX;
        this.gridY = gridY;
        this.animalType = animalType;
        this.state = 'idle';
        this.isMoving = false;
        this.moveSpeed = GameConfig.player.defaultSpeed;
        
        // RPG Stats
        this.level = 1;
        this.experience = 0;
        this.experienceToNext = 100;
        this.quests = [];
        
        // Setup physics
        this.body.setSize(12, 12);
        this.body.setOffset(2, 4);
        this.setDepth(10);
        
        // Setup controls
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys('W,S,A,D');
        this.interactKey = scene.input.keyboard.addKey('SPACE');
        
        // Create animations if they don't exist
        this.createAnimations();
        
        // Start with idle animation
        this.play(animalType + '_idle_down');
        
        // Setup interaction
        this.interactKey.on('down', () => {
            if (this.state === 'idle') {
                this.interact();
            }
        });
    }
    
    createAnimations() {
        const anims = this.scene.anims;
        const key = this.animalType;
        
        // Check if animations already exist
        if (anims.exists(key + '_idle_down')) {
            return;
        }
        
        // Create basic animations (using single frame for now)
        const directions = ['down', 'left', 'right', 'up'];
        
        directions.forEach((dir, index) => {
            anims.create({
                key: key + '_idle_' + dir,
                frames: [{ key: key, frame: index }],
                frameRate: 1
            });
            
            anims.create({
                key: key + '_walk_' + dir,
                frames: [{ key: key, frame: index }],
                frameRate: 8,
                repeat: -1
            });
        });
    }
    
    update() {
        if (this.state !== 'idle' || this.isMoving) {
            return;
        }
        
        this.handleInput();
    }
    
    handleInput() {
        let targetX = this.gridX;
        let targetY = this.gridY;
        let direction = 'down';
        
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            targetX--;
            direction = 'left';
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            targetX++;
            direction = 'right';
        } else if (this.cursors.up.isDown || this.wasd.W.isDown) {
            targetY--;
            direction = 'up';
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            targetY++;
            direction = 'down';
        }
        
        if (targetX !== this.gridX || targetY !== this.gridY) {
            if (this.canMoveTo(targetX, targetY)) {
                this.moveToGridPosition(targetX, targetY, direction);
            } else {
                // Just face the direction if can't move
                this.play(this.animalType + '_idle_' + direction);
            }
        }
    }
    
    canMoveTo(x, y) {
        // Check map bounds
        if (!this.scene.map) return false;
        
        const mapTileWidth = this.scene.map.width;
        const mapTileHeight = this.scene.map.height;
        
        if (x < 0 || y < 0 || x >= mapTileWidth || y >= mapTileHeight) {
            return false;
        }
        
        // Check for obstacles
        if (this.scene.obstaclesLayer) {
            const tile = this.scene.obstaclesLayer.getTileAt(x, y);
            if (tile && tile.collides) {
                return false;
            }
        }
        
        return true;
    }
    
    moveToGridPosition(targetX, targetY, direction) {
        this.isMoving = true;
        this.gridX = targetX;
        this.gridY = targetY;
        
        const targetPixelX = targetX * GameConfig.tile.width + GameConfig.tile.width / 2;
        const targetPixelY = targetY * GameConfig.tile.height + GameConfig.tile.height / 2;
        
        // Play walking animation
        this.play(this.animalType + '_walk_' + direction);
        
        // Create movement tween
        this.scene.tweens.add({
            targets: this,
            x: targetPixelX,
            y: targetPixelY,
            duration: 200,
            ease: 'Linear',
            onComplete: () => {
                this.isMoving = false;
                this.play(this.animalType + '_idle_' + direction);
                EventBus.emit('player.arrived', { x: this.gridX, y: this.gridY });
            }
        });
        
        EventBus.emit('player.move', { x: targetX, y: targetY });
    }
    
    interact() {
        let facingX = this.gridX;
        let facingY = this.gridY;
        
        // Determine facing direction based on current animation
        if (this.anims.currentAnim) {
            const animKey = this.anims.currentAnim.key;
            if (animKey.includes('down')) facingY++;
            else if (animKey.includes('up')) facingY--;
            else if (animKey.includes('left')) facingX--;
            else if (animKey.includes('right')) facingX++;
        }
        
        EventBus.emit('player.interact', { x: facingX, y: facingY });
    }
    
    addExperience(amount) {
        this.experience += amount;
        EventBus.emit('player.experience', { gained: amount, total: this.experience });
        
        while (this.experience >= this.experienceToNext) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.experience -= this.experienceToNext;
        this.level++;
        this.experienceToNext = Math.floor(this.experienceToNext * 1.2);
        
        EventBus.emit('player.levelup', { level: this.level });
    }
    
    addQuest(questId) {
        if (!this.quests.includes(questId)) {
            this.quests.push(questId);
            EventBus.emit('quest.started', questId);
        }
    }
    
    completeQuest(questId) {
        const index = this.quests.indexOf(questId);
        if (index > -1) {
            this.quests.splice(index, 1);
            EventBus.emit('quest.completed', questId);
        }
    }
    
    getSaveData() {
        return {
            gridX: this.gridX,
            gridY: this.gridY,
            animalType: this.animalType,
            level: this.level,
            experience: this.experience,
            experienceToNext: this.experienceToNext,
            quests: [...this.quests]
        };
    }
    
    loadSaveData(data) {
        this.gridX = data.gridX;
        this.gridY = data.gridY;
        this.animalType = data.animalType;
        this.level = data.level;
        this.experience = data.experience;
        this.experienceToNext = data.experienceToNext;
        this.quests = [...data.quests];
        
        // Update position
        const pixelX = this.gridX * GameConfig.tile.width + GameConfig.tile.width / 2;
        const pixelY = this.gridY * GameConfig.tile.height + GameConfig.tile.height / 2;
        this.setPosition(pixelX, pixelY);
    }
}