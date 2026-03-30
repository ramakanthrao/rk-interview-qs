/**
 * curry
 * Creates a curried version of a function that can be partially applied.
 * 
 * Features:
 * - Automatic currying based on function arity
 * - Supports placeholder for partial application in any position
 * - Provides uncurry to restore original function
 * - Tracks application statistics
 * 
 * Usage:
 *   const add = curry((a, b, c) => a + b + c);
 *   add(1)(2)(3);      // 6
 *   add(1, 2)(3);      // 6
 *   add(1)(2, 3);      // 6
 *   add(_, 2)(1, 3);   // Using placeholder: 6
 */

// Placeholder symbol for partial application
const _ = Symbol('curry.placeholder');

/**
 * Create a curried version of a function
 */
function curry(func, options = {}) {
    if (typeof func !== 'function') {
        throw new TypeError('First argument must be a function');
    }

    const {
        arity = func.length,
        placeholder = _
    } = options;

    let stats = {
        applications: 0,
        partialApplications: 0,
        totalCalls: 0
    };

    function curried(...args) {
        stats.totalCalls++;

        // Replace placeholders with actual values
        const actualArgs = [];
        let argIndex = 0;

        // Merge previous args (with placeholders) and new args
        for (let i = 0; i < args.length; i++) {
            if (args[i] === placeholder) {
                actualArgs.push(placeholder);
            } else {
                actualArgs.push(args[i]);
            }
        }

        // Count non-placeholder arguments
        const nonPlaceholderCount = actualArgs.filter(a => a !== placeholder).length;

        if (nonPlaceholderCount >= arity) {
            // Have enough arguments, execute
            stats.applications++;
            // Remove any remaining placeholders (shouldn't happen with valid usage)
            const finalArgs = actualArgs.filter(a => a !== placeholder);
            return func.apply(this, finalArgs);
        }

        // Need more arguments, return partial function
        stats.partialApplications++;
        
        return function(...moreArgs) {
            const combinedArgs = [];
            let moreIndex = 0;

            // Fill in placeholders with new arguments
            for (let i = 0; i < actualArgs.length; i++) {
                if (actualArgs[i] === placeholder && moreIndex < moreArgs.length) {
                    combinedArgs.push(moreArgs[moreIndex++]);
                } else {
                    combinedArgs.push(actualArgs[i]);
                }
            }

            // Add any remaining new arguments
            while (moreIndex < moreArgs.length) {
                combinedArgs.push(moreArgs[moreIndex++]);
            }

            return curried.apply(this, combinedArgs);
        };
    }

    // Attach metadata and utilities
    Object.defineProperties(curried, {
        arity: { value: arity, enumerable: false },
        placeholder: { value: placeholder, enumerable: false },
        getStats: { 
            value: () => ({ ...stats }),
            enumerable: false
        },
        uncurry: {
            value: () => func,
            enumerable: false
        }
    });

    return curried;
}

/**
 * Partial application (fixed arguments from the left)
 */
function partial(func, ...boundArgs) {
    if (typeof func !== 'function') {
        throw new TypeError('First argument must be a function');
    }

    return function(...args) {
        const finalArgs = [];
        let argIndex = 0;

        for (const boundArg of boundArgs) {
            if (boundArg === _) {
                finalArgs.push(args[argIndex++]);
            } else {
                finalArgs.push(boundArg);
            }
        }

        // Add remaining args
        while (argIndex < args.length) {
            finalArgs.push(args[argIndex++]);
        }

        return func.apply(this, finalArgs);
    };
}

/**
 * partialRight - bind arguments from the right
 */
function partialRight(func, ...boundArgs) {
    if (typeof func !== 'function') {
        throw new TypeError('First argument must be a function');
    }

    return function(...args) {
        return func.apply(this, [...args, ...boundArgs]);
    };
}

/**
 * compose - right-to-left function composition
 */
function compose(...funcs) {
    if (funcs.length === 0) {
        return (x) => x;
    }

    if (funcs.some(f => typeof f !== 'function')) {
        throw new TypeError('All arguments must be functions');
    }

    return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

/**
 * pipe - left-to-right function composition
 */
function pipe(...funcs) {
    return compose(...funcs.reverse());
}

// Export placeholder
curry._ = _;

module.exports = { curry, partial, partialRight, compose, pipe, _ };
