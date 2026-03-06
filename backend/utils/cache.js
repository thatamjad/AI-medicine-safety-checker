const logger = require('./logger');

class MemoryCache {
    constructor(defaultTTL = 300000) { // 5 minutes default
        this.cache = new Map();
        this.defaultTTL = defaultTTL;

        // Clean expired entries every minute
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000);

        logger.info(`Memory cache initialized with ${defaultTTL}ms default TTL`);
    }

    /**
     * Generate a cache key from request parameters
     */
    generateKey(prefix, ...params) {
        return `${prefix}:${params.map(p =>
            typeof p === 'object' ? JSON.stringify(p) : String(p)
        ).join(':')}`;
    }

    /**
     * Get a cached value
     */
    get(key) {
        const entry = this.cache.get(key);

        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        entry.hits++;
        logger.info(`Cache HIT for key: ${key} (${entry.hits} hits)`);
        return entry.value;
    }

    /**
     * Set a cached value
     */
    set(key, value, ttl = this.defaultTTL) {
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + ttl,
            createdAt: Date.now(),
            hits: 0
        });

        logger.info(`Cache SET for key: ${key} (TTL: ${ttl}ms, total entries: ${this.cache.size})`);
    }

    /**
     * Remove expired entries
     */
    cleanup() {
        const now = Date.now();
        let removed = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
                removed++;
            }
        }

        if (removed > 0) {
            logger.info(`Cache cleanup: removed ${removed} expired entries, ${this.cache.size} remaining`);
        }
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            totalEntries: this.cache.size,
            entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
                key,
                hits: entry.hits,
                expiresIn: Math.max(0, entry.expiresAt - Date.now()),
                age: Date.now() - entry.createdAt
            }))
        };
    }

    /**
     * Clear all entries
     */
    clear() {
        this.cache.clear();
        logger.info('Cache cleared');
    }

    /**
     * Shutdown cleanup
     */
    destroy() {
        clearInterval(this.cleanupInterval);
        this.cache.clear();
    }
}

module.exports = new MemoryCache();
