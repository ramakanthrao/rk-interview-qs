/**
 * Array.prototype.deepFlatten
 * Flattens nested arrays with depth control and circular reference detection.
 * 
 * Features:
 * - Configurable depth limit
 * - Circular reference detection
 * - Preserves non-array objects
 * - Returns flattening statistics
 * 
 * Usage:
 *   [1, [2, [3, [4]]]].deepFlatten();          // [1, 2, 3, 4]
 *   [1, [2, [3, [4]]]].deepFlatten(2);         // [1, 2, 3, [4]]
 *   result.getStats(); // { depth: 3, totalElements: 4 }
 */

/**
 * Array prototype function to deeply flatten arrays
 */
Array.prototype.deepFlatten = function(maxDepth = Infinity, options = {}) {
    const {
        onCircular = 'skip',  // 'skip', 'throw', 'mark'
        preserveObjects = true
    } = options;

    const seen = new WeakSet();
    let stats = {
        maxDepthReached: 0,
        circularRefs: 0,
        totalElements: 0,
        arraysFlattened: 0
    };

    function flatten(arr, currentDepth) {
        if (seen.has(arr)) {
            stats.circularRefs++;
            if (onCircular === 'throw') {
                throw new Error('Circular reference detected');
            }
            if (onCircular === 'mark') {
                return ['[Circular]'];
            }
            return []; // 'skip'
        }

        seen.add(arr);
        stats.arraysFlattened++;
        const result = [];

        for (const item of arr) {
            if (Array.isArray(item)) {
                stats.maxDepthReached = Math.max(stats.maxDepthReached, currentDepth + 1);
                
                if (currentDepth < maxDepth) {
                    result.push(...flatten(item, currentDepth + 1));
                } else {
                    result.push(item);
                    stats.totalElements++;
                }
            } else {
                result.push(item);
                stats.totalElements++;
            }
        }

        return result;
    }

    const result = flatten(this, 0);

    // Attach stats getter
    Object.defineProperty(result, 'getStats', {
        value: () => ({ ...stats }),
        enumerable: false,
        configurable: true
    });

    return result;
};

/**
 * flattenWithCallback - flatten with transformation
 */
Array.prototype.flatMapDeep = function(callback, maxDepth = Infinity) {
    function flatMap(arr, depth) {
        const result = [];
        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            const mapped = callback(item, i, arr);
            
            if (Array.isArray(mapped) && depth < maxDepth) {
                result.push(...flatMap(mapped, depth + 1));
            } else {
                result.push(mapped);
            }
        }
        return result;
    }
    return flatMap(this, 0);
};

/**
 * Standalone flatten functions
 */
function deepFlatten(array, maxDepth, options) {
    return Array.prototype.deepFlatten.call(array, maxDepth, options);
}

function flatMapDeep(array, callback, maxDepth) {
    return Array.prototype.flatMapDeep.call(array, callback, maxDepth);
}

module.exports = { deepFlatten, flatMapDeep };
