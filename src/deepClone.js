/**
 * deepClone
 * Creates a deep copy of an object/array with circular reference handling.
 * 
 * Features:
 * - Handles nested objects and arrays
 * - Detects and handles circular references
 * - Preserves Date, RegExp, Map, Set objects
 * - Returns metadata via getStats()
 * 
 * Usage:
 *   const result = deepClone(complexObj);
 *   console.log(result.getStats()); // { depth: 3, circularRefs: 1, totalNodes: 15 }
 */

function deepClone(source, options = {}) {
    const { maxDepth = Infinity, onCircular = 'reference' } = options;
    
    const seen = new WeakMap();
    let stats = { depth: 0, circularRefs: 0, totalNodes: 0 };
    
    function clone(value, currentDepth = 0) {
        stats.totalNodes++;
        stats.depth = Math.max(stats.depth, currentDepth);
        
        // Handle primitives and null
        if (value === null || typeof value !== 'object') {
            return value;
        }
        
        // Check max depth
        if (currentDepth >= maxDepth) {
            return onCircular === 'null' ? null : '[Max Depth]';
        }
        
        // Check for circular reference
        if (seen.has(value)) {
            stats.circularRefs++;
            if (onCircular === 'null') return null;
            if (onCircular === 'string') return '[Circular]';
            return seen.get(value); // 'reference' - return the already cloned object
        }
        
        // Handle Date
        if (value instanceof Date) {
            return new Date(value.getTime());
        }
        
        // Handle RegExp
        if (value instanceof RegExp) {
            return new RegExp(value.source, value.flags);
        }
        
        // Handle Map
        if (value instanceof Map) {
            const clonedMap = new Map();
            seen.set(value, clonedMap);
            for (const [k, v] of value) {
                clonedMap.set(clone(k, currentDepth + 1), clone(v, currentDepth + 1));
            }
            return clonedMap;
        }
        
        // Handle Set
        if (value instanceof Set) {
            const clonedSet = new Set();
            seen.set(value, clonedSet);
            for (const v of value) {
                clonedSet.add(clone(v, currentDepth + 1));
            }
            return clonedSet;
        }
        
        // Handle Array
        if (Array.isArray(value)) {
            const clonedArray = [];
            seen.set(value, clonedArray);
            for (let i = 0; i < value.length; i++) {
                clonedArray[i] = clone(value[i], currentDepth + 1);
            }
            return clonedArray;
        }
        
        // Handle Object
        const clonedObj = Object.create(Object.getPrototypeOf(value));
        seen.set(value, clonedObj);
        
        for (const key of Object.keys(value)) {
            clonedObj[key] = clone(value[key], currentDepth + 1);
        }
        
        // Copy symbol properties
        for (const sym of Object.getOwnPropertySymbols(value)) {
            clonedObj[sym] = clone(value[sym], currentDepth + 1);
        }
        
        return clonedObj;
    }
    
    const result = clone(source);
    
    // Attach stats getter
    if (typeof result === 'object' && result !== null) {
        Object.defineProperty(result, 'getStats', {
            value: () => ({ ...stats }),
            enumerable: false,
            configurable: true
        });
    }
    
    return result;
}

module.exports = deepClone;
