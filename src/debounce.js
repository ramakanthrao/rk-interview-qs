/**
 * debounce
 * Creates a debounced version of a function that delays execution.
 * 
 * Features:
 * - Delays function execution until after wait period
 * - Supports leading and trailing edge execution
 * - Provides cancel() and flush() methods
 * - Tracks execution statistics
 * 
 * Usage:
 *   const debouncedSearch = debounce(search, 300);
 *   debouncedSearch('query'); // Executes after 300ms of no calls
 *   debouncedSearch.cancel(); // Cancel pending execution
 *   debouncedSearch.flush();  // Execute immediately
 */

function debounce(func, wait = 0, options = {}) {
    if (typeof func !== 'function') {
        throw new TypeError('First argument must be a function');
    }

    const { leading = false, trailing = true, maxWait = null } = options;
    
    let timeoutId = null;
    let maxTimeoutId = null;
    let lastArgs = null;
    let lastThis = null;
    let lastCallTime = null;
    let lastInvokeTime = 0;
    let result = undefined;
    
    // Statistics
    let stats = {
        calls: 0,
        executions: 0,
        cancellations: 0
    };

    function invokeFunc(time) {
        const args = lastArgs;
        const thisArg = lastThis;
        
        lastArgs = lastThis = null;
        lastInvokeTime = time;
        stats.executions++;
        result = func.apply(thisArg, args);
        return result;
    }

    function shouldInvoke(time) {
        const timeSinceLastCall = lastCallTime === null ? 0 : time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;

        return (
            lastCallTime === null ||
            timeSinceLastCall >= wait ||
            timeSinceLastCall < 0 ||
            (maxWait !== null && timeSinceLastInvoke >= maxWait)
        );
    }

    function trailingEdge(time) {
        timeoutId = null;

        if (trailing && lastArgs) {
            return invokeFunc(time);
        }
        lastArgs = lastThis = null;
        return result;
    }

    function timerExpired() {
        const time = Date.now();
        
        if (shouldInvoke(time)) {
            return trailingEdge(time);
        }
        
        // Restart timer
        const timeSinceLastCall = time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;
        const timeWaiting = wait - timeSinceLastCall;
        const remainingWait = maxWait !== null
            ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
            : timeWaiting;

        timeoutId = setTimeout(timerExpired, remainingWait);
    }

    function leadingEdge(time) {
        lastInvokeTime = time;
        timeoutId = setTimeout(timerExpired, wait);
        
        if (leading) {
            return invokeFunc(time);
        }
        return result;
    }

    function cancel() {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            stats.cancellations++;
        }
        if (maxTimeoutId !== null) {
            clearTimeout(maxTimeoutId);
        }
        lastInvokeTime = 0;
        lastArgs = lastThis = lastCallTime = timeoutId = maxTimeoutId = null;
    }

    function flush() {
        if (timeoutId === null) {
            return result;
        }
        return trailingEdge(Date.now());
    }

    function pending() {
        return timeoutId !== null;
    }

    function debounced(...args) {
        const time = Date.now();
        const isInvoking = shouldInvoke(time);
        
        stats.calls++;
        lastArgs = args;
        lastThis = this;
        lastCallTime = time;

        if (isInvoking) {
            if (timeoutId === null) {
                return leadingEdge(time);
            }
            if (maxWait !== null) {
                timeoutId = setTimeout(timerExpired, wait);
                return invokeFunc(time);
            }
        }
        
        if (timeoutId === null) {
            timeoutId = setTimeout(timerExpired, wait);
        }
        
        return result;
    }

    debounced.cancel = cancel;
    debounced.flush = flush;
    debounced.pending = pending;
    debounced.getStats = () => ({ ...stats });

    return debounced;
}

/**
 * throttle
 * Creates a throttled version of a function that executes at most once per wait period.
 */
function throttle(func, wait = 0, options = {}) {
    const { leading = true, trailing = true } = options;
    return debounce(func, wait, {
        leading,
        trailing,
        maxWait: wait
    });
}

module.exports = { debounce, throttle };
