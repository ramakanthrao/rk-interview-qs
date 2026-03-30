/**
 * memoize
 * Creates a memoized version of a function with configurable caching.
 * 
 * Features:
 * - Caches function results based on arguments
 * - Configurable cache size (LRU eviction)
 * - Custom key resolver
 * - TTL (time-to-live) support
 * - Cache statistics
 * 
 * Usage:
 *   const memoizedFn = memoize(expensiveFn, { maxSize: 100, ttl: 5000 });
 *   memoizedFn.cache.clear();
 *   memoizedFn.getStats(); // { hits: 10, misses: 5, size: 15 }
 */

function memoize(func, options = {}) {
    if (typeof func !== 'function') {
        throw new TypeError('First argument must be a function');
    }

    const {
        maxSize = Infinity,
        ttl = null,
        resolver = null
    } = options;

    // LRU cache using Map (maintains insertion order)
    const cache = new Map();
    const timestamps = new Map();
    
    let stats = {
        hits: 0,
        misses: 0,
        evictions: 0
    };

    function generateKey(args) {
        if (resolver) {
            return resolver.apply(this, args);
        }
        // Default: JSON stringify for simple cases
        if (args.length === 0) return '__no_args__';
        if (args.length === 1) {
            const arg = args[0];
            if (typeof arg === 'object' && arg !== null) {
                return JSON.stringify(arg);
            }
            return String(arg);
        }
        return JSON.stringify(args);
    }

    function isExpired(key) {
        if (ttl === null) return false;
        const timestamp = timestamps.get(key);
        return Date.now() - timestamp > ttl;
    }

    function evictLRU() {
        // Map maintains insertion order, first key is oldest
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
        timestamps.delete(oldestKey);
        stats.evictions++;
    }

    function memoized(...args) {
        const key = generateKey.call(this, args);

        // Check cache
        if (cache.has(key)) {
            if (!isExpired(key)) {
                stats.hits++;
                // Move to end for LRU (delete and re-add)
                const value = cache.get(key);
                cache.delete(key);
                cache.set(key, value);
                return value;
            }
            // Expired, remove from cache
            cache.delete(key);
            timestamps.delete(key);
        }

        stats.misses++;

        // Execute function
        const result = func.apply(this, args);

        // Evict if at capacity
        if (cache.size >= maxSize) {
            evictLRU();
        }

        // Store result
        cache.set(key, result);
        if (ttl !== null) {
            timestamps.set(key, Date.now());
        }

        return result;
    }

    // Expose cache for manual control
    memoized.cache = {
        get: (key) => cache.get(key),
        has: (key) => cache.has(key) && !isExpired(key),
        delete: (key) => {
            timestamps.delete(key);
            return cache.delete(key);
        },
        clear: () => {
            cache.clear();
            timestamps.clear();
        },
        size: () => cache.size,
        keys: () => Array.from(cache.keys())
    };

    memoized.getStats = () => ({
        ...stats,
        size: cache.size,
        hitRate: stats.hits + stats.misses > 0 
            ? (stats.hits / (stats.hits + stats.misses) * 100).toFixed(2) + '%'
            : '0%'
    });

    memoized.resetStats = () => {
        stats = { hits: 0, misses: 0, evictions: 0 };
    };

    return memoized;
}

/**
 * memoizeAsync
 * Memoize for async functions - prevents concurrent calls with same args
 */
function memoizeAsync(func, options = {}) {
    const pending = new Map();
    const memoizedFn = memoize(async function(...args) {
        const key = JSON.stringify(args);
        
        // If already pending, return same promise
        if (pending.has(key)) {
            return pending.get(key);
        }

        const promise = func.apply(this, args).finally(() => {
            pending.delete(key);
        });

        pending.set(key, promise);
        return promise;
    }, options);

    return memoizedFn;
}

module.exports = { memoize, memoizeAsync };
