/**
 * Promise utilities: promiseAll, promiseAllSettled, promiseRace, promiseAny
 * Custom implementations of Promise static methods with additional features.
 * 
 * Features:
 * - promiseAll: Wait for all promises, fail on first rejection
 * - promiseAllSettled: Wait for all, return status objects
 * - promiseRace: First to settle wins
 * - promiseAny: First to fulfill wins
 * - promiseMap: Map with concurrency control
 * 
 * Usage:
 *   const results = await promiseAll([p1, p2, p3]);
 *   const results = await promiseAllSettled([p1, p2, p3]);
 *   const first = await promiseRace([p1, p2, p3]);
 *   const results = await promiseMap(items, fn, { concurrency: 3 });
 */

/**
 * promiseAll - like Promise.all but with progress callback
 */
function promiseAll(promises, options = {}) {
    const {
        onProgress = null,
        stopOnError = true
    } = options;

    return new Promise((resolve, reject) => {
        if (!Array.isArray(promises)) {
            return reject(new TypeError('Argument must be an array'));
        }

        if (promises.length === 0) {
            return resolve([]);
        }

        const results = new Array(promises.length);
        let completed = 0;
        let hasRejected = false;

        const handleSettled = (index, value, isRejection) => {
            if (hasRejected && stopOnError) return;

            if (isRejection) {
                hasRejected = true;
                if (stopOnError) {
                    return reject(value);
                }
            }

            results[index] = value;
            completed++;

            if (onProgress) {
                onProgress({
                    completed,
                    total: promises.length,
                    percent: Math.round((completed / promises.length) * 100)
                });
            }

            if (completed === promises.length) {
                resolve(results);
            }
        };

        promises.forEach((promise, index) => {
            Promise.resolve(promise)
                .then(value => handleSettled(index, value, false))
                .catch(error => handleSettled(index, error, true));
        });
    });
}

/**
 * promiseAllSettled - like Promise.allSettled
 */
function promiseAllSettled(promises) {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(promises)) {
            return reject(new TypeError('Argument must be an array'));
        }

        if (promises.length === 0) {
            return resolve([]);
        }

        const results = new Array(promises.length);
        let completed = 0;

        promises.forEach((promise, index) => {
            Promise.resolve(promise)
                .then(value => {
                    results[index] = { status: 'fulfilled', value };
                })
                .catch(reason => {
                    results[index] = { status: 'rejected', reason };
                })
                .finally(() => {
                    completed++;
                    if (completed === promises.length) {
                        resolve(results);
                    }
                });
        });
    });
}

/**
 * promiseRace - like Promise.race
 */
function promiseRace(promises) {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(promises)) {
            return reject(new TypeError('Argument must be an array'));
        }

        if (promises.length === 0) {
            // Never settles (matches spec)
            return;
        }

        for (const promise of promises) {
            Promise.resolve(promise)
                .then(resolve)
                .catch(reject);
        }
    });
}

/**
 * promiseAny - like Promise.any (ES2021)
 */
function promiseAny(promises) {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(promises)) {
            return reject(new TypeError('Argument must be an array'));
        }

        if (promises.length === 0) {
            return reject(new AggregateError([], 'All promises were rejected'));
        }

        const errors = new Array(promises.length);
        let rejectedCount = 0;

        promises.forEach((promise, index) => {
            Promise.resolve(promise)
                .then(resolve) // First fulfillment wins
                .catch(error => {
                    errors[index] = error;
                    rejectedCount++;
                    if (rejectedCount === promises.length) {
                        reject(new AggregateError(errors, 'All promises were rejected'));
                    }
                });
        });
    });
}

/**
 * promiseMap - map with concurrency control
 */
function promiseMap(items, mapper, options = {}) {
    const {
        concurrency = Infinity,
        onProgress = null
    } = options;

    return new Promise((resolve, reject) => {
        if (!Array.isArray(items)) {
            return reject(new TypeError('First argument must be an array'));
        }

        if (typeof mapper !== 'function') {
            return reject(new TypeError('Second argument must be a function'));
        }

        if (items.length === 0) {
            return resolve([]);
        }

        const results = new Array(items.length);
        let currentIndex = 0;
        let completedCount = 0;
        let hasRejected = false;

        const runNext = () => {
            if (hasRejected) return;
            if (currentIndex >= items.length) return;

            const index = currentIndex++;
            const item = items[index];

            Promise.resolve(mapper(item, index, items))
                .then(result => {
                    if (hasRejected) return;
                    
                    results[index] = result;
                    completedCount++;

                    if (onProgress) {
                        onProgress({
                            completed: completedCount,
                            total: items.length,
                            percent: Math.round((completedCount / items.length) * 100)
                        });
                    }

                    if (completedCount === items.length) {
                        resolve(results);
                    } else {
                        runNext();
                    }
                })
                .catch(error => {
                    hasRejected = true;
                    reject(error);
                });
        };

        // Start initial batch
        const initialBatch = Math.min(concurrency, items.length);
        for (let i = 0; i < initialBatch; i++) {
            runNext();
        }
    });
}

/**
 * promiseTimeout - add timeout to a promise
 */
function promiseTimeout(promise, ms, message = 'Promise timed out') {
    return Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error(message)), ms)
        )
    ]);
}

/**
 * promiseRetry - retry a promise-returning function
 */
function promiseRetry(fn, options = {}) {
    const {
        retries = 3,
        delay = 1000,
        backoff = 1,
        onRetry = null
    } = options;

    return new Promise((resolve, reject) => {
        let attempts = 0;

        const attempt = () => {
            attempts++;
            
            Promise.resolve(fn(attempts))
                .then(resolve)
                .catch(error => {
                    if (attempts >= retries) {
                        return reject(error);
                    }

                    if (onRetry) {
                        onRetry({ attempt: attempts, error, remaining: retries - attempts });
                    }

                    const waitTime = delay * Math.pow(backoff, attempts - 1);
                    setTimeout(attempt, waitTime);
                });
        };

        attempt();
    });
}

module.exports = {
    promiseAll,
    promiseAllSettled,
    promiseRace,
    promiseAny,
    promiseMap,
    promiseTimeout,
    promiseRetry
};
