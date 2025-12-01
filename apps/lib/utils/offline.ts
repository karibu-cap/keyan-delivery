"use client";

/**
 * Preload map tiles for a specific area
 * Useful for caching tiles before going offline
 */
export async function preloadMapTiles(
    centerLat: number,
    centerLng: number,
    zoomLevel: number = 14,
    radius: number = 2
) {
    const tiles: string[] = [];

    // Calculate tile coordinates
    const tileX = Math.floor((centerLng + 180) / 360 * Math.pow(2, zoomLevel));
    const tileY = Math.floor(
        (1 - Math.log(Math.tan(centerLat * Math.PI / 180) + 1 / Math.cos(centerLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoomLevel)
    );

    // Generate tile URLs in a radius
    for (let x = tileX - radius; x <= tileX + radius; x++) {
        for (let y = tileY - radius; y <= tileY + radius; y++) {
            const tileUrl = `https://a.tile.openstreetmap.org/${zoomLevel}/${x}/${y}.png`;
            tiles.push(tileUrl);
        }
    }

    // Preload tiles
    try {
        const cache = await caches.open('Pataupesi-map-tiles-v1');
        const promises = tiles.map(async (url) => {
            const response = await fetch(url);
            if (response.ok) {
                await cache.put(url, response);
            }
        });
        await Promise.all(promises);
        console.log(`Preloaded ${tiles.length} map tiles`);
        return { success: true, tilesLoaded: tiles.length };
    } catch (error) {
        console.error("Error preloading map tiles:", error);
        return { success: false, error };
    }
}

/**
 * Clear old map tiles to free up storage
 */
export async function clearOldMapTiles() {
    try {
        const cache = await caches.open('Pataupesi-map-tiles-v1');
        const requests = await cache.keys();

        let deletedCount = 0;
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const cachedDate = new Date(response.headers.get('date') || 0);
                const now = new Date();
                const daysSinceCached = (now.getTime() - cachedDate.getTime()) / (1000 * 60 * 60 * 24);

                // Delete tiles older than 30 days
                if (daysSinceCached > 30) {
                    await cache.delete(request);
                    deletedCount++;
                }
            }
        }

        console.log(`Cleared ${deletedCount} old map tiles`);
        return { success: true, deletedCount };
    } catch (error) {
        console.error("Error clearing old map tiles:", error);
        return { success: false, error };
    }
}

/**
 * Get cache storage usage
 */
export async function getCacheStorageInfo() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
            const estimate = await navigator.storage.estimate();
            const usage = estimate.usage || 0;
            const quota = estimate.quota || 0;
            const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;

            return {
                usage: (usage / 1024 / 1024).toFixed(2) + ' MB',
                quota: (quota / 1024 / 1024).toFixed(2) + ' MB',
                percentUsed: percentUsed.toFixed(2) + '%',
                available: ((quota - usage) / 1024 / 1024).toFixed(2) + ' MB',
            };
        } catch (error) {
            console.error("Error getting storage info:", error);
            return null;
        }
    }
    return null;
}
