// Player.js

class Player {
    // ... (constructor and other methods)

    canMoveTo(x, y) {
        // Get map dimensions from the scene's map object
        const mapTileWidth = this.scene.map ? this.scene.map.width : 50; // Fallback if map not loaded
        const mapTileHeight = this.scene.map ? this.scene.map.height : 50; // Fallback

        if (x < 0 || y < 0 || x >= mapTileWidth || y >= mapTileHeight) {
            return false; // Out of map bounds
        }

        // **IMPROVED COLLISION CHECK (Optional but good):**
        // Check for a collision on the target tile in the obstacles layer.
        // This provides a proactive check before initiating movement.
        if (this.scene.obstaclesLayer) {
            const tileAtTarget = this.scene.obstaclesLayer.getTileAt(x, y);
            if (tileAtTarget && tileAtTarget.collides) { // Assumes tile.collides is true for obstacles
                 // Or if you used setCollisionByProperty({ collides: true });
                 // you can check tileAtTarget.properties.collides
                return false;
            }
        }
        
        return true;
    }

    // ... (rest of Player.js)
}