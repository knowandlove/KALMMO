// GameConfig.js - Core game configuration
const GameConfig = {
    // Display settings
    display: {
        width: 800,
        height: 600,
        zoom: 2,
        pixelArt: true
    },
    
    // Tile settings
    tile: {
        width: 16,
        height: 16
    },
    
    // Player settings
    player: {
        defaultSpeed: 100,
        defaultAnimal: 'meerkat'
    },
    
    // Animal configurations (ready for expansion)
    animals: {
        meerkat: {
            name: 'Meerkat Paladin',
            sprite: 'meerkat',
            stats: {
                speed: 100,
                conviction: 10,
                vision: 8
            },
            startPosition: { x: 10, y: 10 },
            startMap: 'truthstone_village',
            class: 'paladin',
            abilities: ['call_out', 'heart_barrier', 'authentic_mode']
        },
        // Ready to add more animals
        otter: {
            name: 'Otter Action Hero',
            sprite: 'otter',
            stats: {
                speed: 120,
                energy: 10,
                agility: 8
            },
            startPosition: { x: 10, y: 10 },
            startMap: 'splash_springs',
            class: 'action_hero',
            abilities: ['adrenaline_rush', 'hyper_sense', 'quick_learn']
        }
    },
    
    // Map configurations
    maps: {
        truthstone_village: {
            key: 'truthstone_village',
            tilemapKey: 'map_truthstone',
            tilesetName: 'tiles_overworld',
            tilesetKey: 'tiles_overworld'
        }
    },
    
    // Dialog settings
    dialog: {
        padding: 20,
        fontSize: 16,
        typeSpeed: 30,
        backgroundColor: 0x000000,
        backgroundAlpha: 0.8,
        textColor: '#ffffff'
    },
    
    // Quest settings
    quests: {
        maxActive: 3,
        experienceMultiplier: 1.0
    },
    
    // Network settings (for future multiplayer)
    network: {
        serverUrl: 'http://localhost:3000',
        reconnectAttempts: 3,
        reconnectDelay: 1000
    }
};

// Freeze config to prevent accidental modifications
Object.freeze(GameConfig);