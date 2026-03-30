/**
 * Array.prototype.groupBy
 * Groups array elements by a key or function.
 * 
 * Features:
 * - Group by property name or function
 * - Returns object with group keys
 * - Supports nested property paths
 * - Provides utility methods on result
 * 
 * Usage:
 *   const result = users.groupBy('role');
 *   const result = users.groupBy(u => u.age > 18 ? 'adult' : 'minor');
 *   result.getKeys();     // ['admin', 'user']
 *   result.getCount();    // { admin: 2, user: 5 }
 *   result.mapGroups(g => g.length);
 */

/**
 * Get nested property value using dot notation
 */
function getNestedValue(obj, path) {
    if (typeof path !== 'string') return undefined;
    return path.split('.').reduce((acc, key) => {
        return acc && acc[key] !== undefined ? acc[key] : undefined;
    }, obj);
}

/**
 * Array prototype function to group elements
 */
Array.prototype.groupBy = function(keyOrFn) {
    if (keyOrFn === undefined) {
        throw new TypeError('groupBy requires a key or function');
    }

    const groups = {};
    const keyFn = typeof keyOrFn === 'function' 
        ? keyOrFn 
        : (item) => getNestedValue(item, keyOrFn);

    for (let i = 0; i < this.length; i++) {
        const item = this[i];
        const key = keyFn(item, i, this);
        const groupKey = key === undefined ? 'undefined' : String(key);

        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
    }

    // Add utility methods
    Object.defineProperties(groups, {
        getKeys: {
            value: () => Object.keys(groups).filter(k => 
                !['getKeys', 'getCount', 'mapGroups', 'filterGroups', 'toMap'].includes(k)
            ),
            enumerable: false
        },
        getCount: {
            value: () => {
                const counts = {};
                for (const key of Object.keys(groups)) {
                    if (Array.isArray(groups[key])) {
                        counts[key] = groups[key].length;
                    }
                }
                return counts;
            },
            enumerable: false
        },
        mapGroups: {
            value: (fn) => {
                const result = {};
                for (const key of Object.keys(groups)) {
                    if (Array.isArray(groups[key])) {
                        result[key] = fn(groups[key], key);
                    }
                }
                return result;
            },
            enumerable: false
        },
        filterGroups: {
            value: (predicate) => {
                const result = {};
                for (const key of Object.keys(groups)) {
                    if (Array.isArray(groups[key]) && predicate(groups[key], key)) {
                        result[key] = groups[key];
                    }
                }
                return result;
            },
            enumerable: false
        },
        toMap: {
            value: () => {
                const map = new Map();
                for (const key of Object.keys(groups)) {
                    if (Array.isArray(groups[key])) {
                        map.set(key, groups[key]);
                    }
                }
                return map;
            },
            enumerable: false
        }
    });

    return groups;
};

/**
 * Standalone groupBy function (non-prototype version)
 */
function groupBy(array, keyOrFn) {
    return Array.prototype.groupBy.call(array, keyOrFn);
}

module.exports = { groupBy };
