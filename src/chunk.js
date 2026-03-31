/**
 * Array.prototype.chunk
 * Splits an array into chunks of specified size.
 * 
 * Features:
 * - Fixed size chunks
 * - Remainder handling options
 * - Overlapping chunks support
 * - Various chunking strategies
 * 
 * Usage:
 *   [1,2,3,4,5].chunk(2);              // [[1,2], [3,4], [5]]
 *   [1,2,3,4,5].chunk(2, {pad: 0});    // [[1,2], [3,4], [5,0]]
 *   [1,2,3,4,5].chunk(3, {overlap: 1}); // [[1,2,3], [3,4,5]]
 */

/**
 * Array prototype function to chunk array into smaller arrays
 */
Array.prototype.chunk = function(size, options = {}) {
    if (!Number.isInteger(size) || size < 1) {
        throw new TypeError('Chunk size must be a positive integer');
    }

    const {
        pad = undefined,         // Value to pad incomplete chunks
        overlap = 0,             // Number of overlapping elements
        dropRemainder = false    // Drop incomplete last chunk
    } = options;

    if (this.length === 0) {
        return [];
    }

    const result = [];
    const step = size - overlap;

    if (step < 1) {
        throw new TypeError('Overlap must be less than chunk size');
    }

    for (let i = 0; i < this.length; i += step) {
        const chunk = this.slice(i, i + size);
        
        // Handle incomplete chunks
        if (chunk.length < size) {
            // With overlap, drop partial chunks by default (sliding window behavior)
            if (dropRemainder || (overlap > 0 && pad === undefined)) {
                continue;
            }
            if (pad !== undefined) {
                while (chunk.length < size) {
                    chunk.push(pad);
                }
            }
        }
        
        result.push(chunk);
    }

    // Add utility methods
    Object.defineProperties(result, {
        getStats: {
            value: () => ({
                totalChunks: result.length,
                fullChunks: result.filter(c => c.length === size).length,
                totalElements: result.reduce((sum, c) => sum + c.length, 0),
                avgChunkSize: result.length > 0 
                    ? (result.reduce((sum, c) => sum + c.length, 0) / result.length).toFixed(2)
                    : 0
            }),
            enumerable: false
        },
        flatten: {
            value: () => result.flat(),
            enumerable: false
        },
        mapChunks: {
            value: (fn) => result.map((chunk, i) => fn(chunk, i)),
            enumerable: false
        }
    });

    return result;
};

/**
 * Chunk array by condition (creates variable-sized chunks)
 */
Array.prototype.chunkBy = function(predicate) {
    if (typeof predicate !== 'function') {
        throw new TypeError('chunkBy requires a function');
    }

    if (this.length === 0) {
        return [];
    }

    const result = [];
    let currentChunk = [this[0]];
    let currentKey = predicate(this[0], 0, this);

    for (let i = 1; i < this.length; i++) {
        const key = predicate(this[i], i, this);
        
        if (key === currentKey) {
            currentChunk.push(this[i]);
        } else {
            result.push(currentChunk);
            currentChunk = [this[i]];
            currentKey = key;
        }
    }

    result.push(currentChunk);
    return result;
};

/**
 * Standalone chunk function
 */
function chunk(array, size, options) {
    return Array.prototype.chunk.call(array, size, options);
}

function chunkBy(array, predicate) {
    return Array.prototype.chunkBy.call(array, predicate);
}

module.exports = { chunk, chunkBy };
