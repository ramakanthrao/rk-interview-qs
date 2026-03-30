/**
 * deepMerge
 * Deeply merges objects with configurable conflict resolution.
 * 
 * Features:
 * - Recursive merging of nested objects
 * - Array merge strategies (concat, replace, union)
 * - Custom conflict resolver
 * - Circular reference handling
 * - Immutable by default (creates new object)
 * 
 * Usage:
 *   const result = deepMerge(obj1, obj2);
 *   const result = deepMerge(obj1, obj2, { arrayStrategy: 'concat' });
 *   const result = deepMerge.all([obj1, obj2, obj3]);
 */

/**
 * Check if value is a plain object
 */
function isPlainObject(value) {
    if (value === null || typeof value !== 'object') {
        return false;
    }
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
}

/**
 * Deep merge two objects
 */
function deepMerge(target, source, options = {}) {
    const {
        arrayStrategy = 'replace',  // 'replace', 'concat', 'union'
        customMerge = null,         // (key, targetVal, sourceVal) => mergedVal
        clone = true,               // Create new object or mutate target
        onCircular = 'skip'         // 'skip', 'throw'
    } = options;

    const seen = new WeakMap();
    let stats = {
        mergedKeys: 0,
        conflicts: 0,
        maxDepth: 0,
        circularRefs: 0
    };

    function merge(targetObj, sourceObj, depth) {
        stats.maxDepth = Math.max(stats.maxDepth, depth);

        // Handle non-objects
        if (!isPlainObject(sourceObj)) {
            return sourceObj;
        }

        if (!isPlainObject(targetObj)) {
            return mergeObject({}, sourceObj, depth);
        }

        // Check circular reference
        if (seen.has(sourceObj)) {
            stats.circularRefs++;
            if (onCircular === 'throw') {
                throw new Error('Circular reference detected');
            }
            return seen.get(sourceObj);
        }

        const result = clone ? { ...targetObj } : targetObj;
        seen.set(sourceObj, result);

        return mergeObject(result, sourceObj, depth);
    }

    function mergeObject(result, sourceObj, depth) {
        for (const key of Object.keys(sourceObj)) {
            const targetVal = result[key];
            const sourceVal = sourceObj[key];

            stats.mergedKeys++;

            // Custom merge function
            if (customMerge) {
                const customResult = customMerge(key, targetVal, sourceVal);
                if (customResult !== undefined) {
                    result[key] = customResult;
                    continue;
                }
            }

            // Handle arrays
            if (Array.isArray(sourceVal)) {
                if (Array.isArray(targetVal)) {
                    stats.conflicts++;
                    switch (arrayStrategy) {
                        case 'concat':
                            result[key] = [...targetVal, ...sourceVal];
                            break;
                        case 'union':
                            result[key] = [...new Set([...targetVal, ...sourceVal])];
                            break;
                        case 'replace':
                        default:
                            result[key] = [...sourceVal];
                    }
                } else {
                    result[key] = [...sourceVal];
                }
                continue;
            }

            // Handle nested objects
            if (isPlainObject(sourceVal)) {
                if (isPlainObject(targetVal)) {
                    stats.conflicts++;
                    result[key] = merge(targetVal, sourceVal, depth + 1);
                } else {
                    result[key] = merge({}, sourceVal, depth + 1);
                }
                continue;
            }

            // Handle primitives and other types
            if (targetVal !== undefined && targetVal !== sourceVal) {
                stats.conflicts++;
            }
            result[key] = sourceVal;
        }

        return result;
    }

    const result = merge(target, source, 0);

    // Attach stats getter
    if (isPlainObject(result)) {
        Object.defineProperty(result, 'getStats', {
            value: () => ({ ...stats }),
            enumerable: false,
            configurable: true
        });
    }

    return result;
}

/**
 * Merge multiple objects
 */
deepMerge.all = function(objects, options = {}) {
    if (!Array.isArray(objects)) {
        throw new TypeError('First argument must be an array');
    }

    if (objects.length === 0) {
        return {};
    }

    return objects.reduce((result, obj) => deepMerge(result, obj, options), {});
};

/**
 * Create a merger with preset options
 */
deepMerge.create = function(defaultOptions) {
    return function(target, source, options = {}) {
        return deepMerge(target, source, { ...defaultOptions, ...options });
    };
};

/**
 * Merge with overwrite (simpler - source always wins)
 */
function mergeWith(target, source, customizer) {
    if (!isPlainObject(target) || !isPlainObject(source)) {
        return source !== undefined ? source : target;
    }

    const result = { ...target };

    for (const key of Object.keys(source)) {
        const targetVal = result[key];
        const sourceVal = source[key];

        if (customizer) {
            const customResult = customizer(targetVal, sourceVal, key);
            if (customResult !== undefined) {
                result[key] = customResult;
                continue;
            }
        }

        if (isPlainObject(sourceVal) && isPlainObject(targetVal)) {
            result[key] = mergeWith(targetVal, sourceVal, customizer);
        } else {
            result[key] = sourceVal;
        }
    }

    return result;
}

/**
 * Defaults - like merge but target values take precedence
 */
function defaults(target, ...sources) {
    const result = { ...target };

    for (const source of sources) {
        if (!isPlainObject(source)) continue;

        for (const key of Object.keys(source)) {
            if (result[key] === undefined) {
                result[key] = source[key];
            } else if (isPlainObject(result[key]) && isPlainObject(source[key])) {
                result[key] = defaults(result[key], source[key]);
            }
        }
    }

    return result;
}

module.exports = { deepMerge, mergeWith, defaults, isPlainObject };
