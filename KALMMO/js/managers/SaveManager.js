// SaveManager.js - Handles saving and loading game data
class SaveManager {
    constructor() {
        this.saveKey = 'knowandlove_save';
        this.settingsKey = 'knowandlove_settings';
        this.currentSlot = 0;
        this.maxSlots = 3;
    }
    
    // Save game data
    saveGame(gameData) {
        try {
            const saveData = {
                version: '1.0.0',
                timestamp: Date.now(),
                playtime: gameData.playtime || 0,
                player: gameData.player,
                world: gameData.world || {},
                flags: gameData.flags || {}
            };
            
            const key = `${this.saveKey}_slot${this.currentSlot}`;
            localStorage.setItem(key, JSON.stringify(saveData));
            
            // Update save metadata
            this.updateSaveMetadata(this.currentSlot, saveData);
            
            EventBus.emit('game.saved', { slot: this.currentSlot });
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            EventBus.emit('game.save.error', error);
            return false;
        }
    }
    
    // Load game data
    loadGame(slot = this.currentSlot) {
        try {
            const key = `${this.saveKey}_slot${slot}`;
            const savedData = localStorage.getItem(key);
            
            if (!savedData) {
                return null;
            }
            
            const gameData = JSON.parse(savedData);
            this.currentSlot = slot;
            
            EventBus.emit('game.loaded', { slot, data: gameData });
            return gameData;
        } catch (error) {
            console.error('Failed to load game:', error);
            EventBus.emit('game.load.error', error);
            return null;
        }
    }
    
    // Delete save
    deleteSave(slot) {
        try {
            const key = `${this.saveKey}_slot${slot}`;
            localStorage.removeItem(key);
            
            // Update metadata
            const metadata = this.getSaveMetadata();
            delete metadata[slot];
            localStorage.setItem(`${this.saveKey}_metadata`, JSON.stringify(metadata));
            
            EventBus.emit('game.save.deleted', { slot });
            return true;
        } catch (error) {
            console.error('Failed to delete save:', error);
            return false;
        }
    }
    
    // Get all save metadata
    getSaveMetadata() {
        try {
            const metadata = localStorage.getItem(`${this.saveKey}_metadata`);
            return metadata ? JSON.parse(metadata) : {};
        } catch (error) {
            return {};
        }
    }
    
    // Update save metadata
    updateSaveMetadata(slot, saveData) {
        try {
            const metadata = this.getSaveMetadata();
            metadata[slot] = {
                timestamp: saveData.timestamp,
                playtime: saveData.playtime,
                level: saveData.player?.level || 1,
                animalType: saveData.player?.animalType || 'meerkat',
                location: saveData.world?.currentMap || 'truthstone_village'
            };
            localStorage.setItem(`${this.saveKey}_metadata`, JSON.stringify(metadata));
        } catch (error) {
            console.error('Failed to update metadata:', error);
        }
    }
    
    // Check if save exists
    hasSave(slot) {
        const key = `${this.saveKey}_slot${slot}`;
        return localStorage.getItem(key) !== null;
    }
    
    // Get list of all saves
    getAllSaves() {
        const saves = [];
        const metadata = this.getSaveMetadata();
        
        for (let i = 0; i < this.maxSlots; i++) {
            if (this.hasSave(i)) {
                saves.push({
                    slot: i,
                    ...metadata[i]
                });
            } else {
                saves.push({
                    slot: i,
                    empty: true
                });
            }
        }
        
        return saves;
    }
    
    // Save settings
    saveSettings(settings) {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            EventBus.emit('settings.saved');
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }
    
    // Load settings
    loadSettings() {
        try {
            const settings = localStorage.getItem(this.settingsKey);
            return settings ? JSON.parse(settings) : this.getDefaultSettings();
        } catch (error) {
            return this.getDefaultSettings();
        }
    }
    
    // Get default settings
    getDefaultSettings() {
        return {
            masterVolume: 1.0,
            musicVolume: 0.8,
            sfxVolume: 1.0,
            textSpeed: 'normal',
            autoSave: true,
            fullscreen: false
        };
    }
    
    // Auto-save functionality
    enableAutoSave(scene, interval = 60000) { // Default 1 minute
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            if (scene.game.scene.isActive('GameScene')) {
                const gameData = scene.getGameData();
                this.saveGame(gameData);
                console.log('Auto-saved game');
            }
        }, interval);
    }
    
    disableAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }
}

// Create singleton instance
const saveManager = new SaveManager();