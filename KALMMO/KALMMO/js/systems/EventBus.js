// EventBus.js - Global event system for decoupled communication
class EventBusClass extends Phaser.Events.EventEmitter {
    constructor() {
        super();
        // this.events = {}; // This line is not strictly necessary as EventEmitter handles its own event storage.
        
        // **NEW:** Assign the static Events to an instance property
        // This makes EventBus.Events work as intended.
        this.Events = EventBusClass.Events; 
    }
    
    // Emit event with logging (useful for debugging)
    emit(event, ...args) {
        // Ensure GameConfig is loaded and accessible if you use it here
        if (typeof GameConfig !== 'undefined' && GameConfig.debug) { //
            console.log(`[EventBus] ${event}`, ...args);
        }
        super.emit(event, ...args);
    }
    
    // Common game events
    static get Events() {
        return {
            // Player events
            PLAYER_MOVE: 'player.move',
            PLAYER_ARRIVED: 'player.arrived',
            PLAYER_INTERACT: 'player.interact',
            PLAYER_LEVELUP: 'player.levelup',
            PLAYER_EXPERIENCE: 'player.experience',
            PLAYER_DAMAGED: 'player.damaged',
            PLAYER_HEALED: 'player.healed',
            
            // Quest events
            QUEST_STARTED: 'quest.started',
            QUEST_PROGRESS: 'quest.progress',
            QUEST_COMPLETED: 'quest.completed',
            QUEST_FAILED: 'quest.failed',
            
            // Dialog events
            DIALOG_START: 'dialog.start',
            DIALOG_NEXT: 'dialog.next',
            DIALOG_END: 'dialog.end',
            DIALOG_CHOICE: 'dialog.choice',
            
            // Game state events
            GAME_PAUSE: 'game.pause',
            GAME_RESUME: 'game.resume',
            GAME_SAVE: 'game.save',
            GAME_LOAD: 'game.load',
            
            // Scene events
            SCENE_TRANSITION: 'scene.transition',
            SCENE_READY: 'scene.ready',
            
            // UI events
            UI_OPEN_MENU: 'ui.menu.open',
            UI_CLOSE_MENU: 'ui.menu.close',
            UI_OPEN_INVENTORY: 'ui.inventory.open',
            UI_CLOSE_INVENTORY: 'ui.inventory.close',
            
            // Network events (for future multiplayer)
            NETWORK_CONNECTED: 'network.connected',
            NETWORK_DISCONNECTED: 'network.disconnected',
            NETWORK_PLAYER_JOIN: 'network.player.join',
            NETWORK_PLAYER_LEAVE: 'network.player.leave',
            NETWORK_MESSAGE: 'network.message'
        };
    }
}

// Create singleton instance
const EventBus = new EventBusClass();

// Freeze to prevent modifications.
// Since 'this.Events' was assigned in the constructor, it will also be part of the frozen object structure.
Object.freeze(EventBus);