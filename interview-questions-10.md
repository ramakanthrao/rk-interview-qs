# Interview Questions: Promise Utilities

## Coding Question

> **Implement Promise static methods: `promiseAll`, `promiseAllSettled`, `promiseRace`, `promiseAny`**
>
> **Requirements:**
> 1. `promiseAll`: Resolve when all fulfill, reject on first rejection
> 2. `promiseAllSettled`: Always resolve with status array
> 3. `promiseRace`: First promise to settle wins
> 4. `promiseAny`: First promise to fulfill wins
> 5. Add: `promiseMap` with concurrency control
> 6. Add: `promiseTimeout` and `promiseRetry`

---

## Basic Understanding

### Q1: Difference between promiseAll vs promiseAllSettled?
**Answer:**
- **promiseAll**: Rejects immediately if ANY promise rejects. Returns array of values.
- **promiseAllSettled**: Always waits for all. Returns array of `{status, value/reason}`.

```javascript
promiseAll([ok, fail, ok]);     // Rejects with fail's error
promiseAllSettled([ok, fail]);  // Resolves: [{status:'fulfilled'}, {status:'rejected'}]
```

### Q2: Difference between promiseRace vs promiseAny?
**Answer:**
- **promiseRace**: First to settle (fulfill OR reject) wins
- **promiseAny**: First to FULFILL wins (ignores rejections unless all reject)

```javascript
promiseRace([slowSuccess, fastFail]);  // Rejects (fast fail wins)
promiseAny([slowSuccess, fastFail]);   // Resolves (waits for success)
```

### Q3: What is AggregateError?
**Answer:** ES2021 error type for multiple errors. Used by `promiseAny` when all promises reject:
```javascript
try {
    await promiseAny([reject1, reject2]);
} catch (e) {
    e.errors; // Array of all rejection reasons
}
```

---

## Code Analysis

### Q4: Why use `Promise.resolve(promise)`?
```javascript
Promise.resolve(promise).then(...);
```
**Answer:** Handles non-Promise values:
```javascript
promiseAll([1, Promise.resolve(2), 3]);
// Promise.resolve(1) wraps number in promise
// Promise.resolve(Promise.resolve(2)) returns same promise
```

### Q5: Why track `hasRejected` in promiseAll?
**Answer:** Once one rejects, we:
- Skip processing other results
- Prevent resolve from being called
- Avoid memory leaks from pending operations

### Q6: How does concurrency work in promiseMap?
```javascript
// Start initial batch
const initialBatch = Math.min(concurrency, items.length);
for (let i = 0; i < initialBatch; i++) {
    runNext();
}

// In completion handler:
if (completedCount !== items.length) {
    runNext(); // Start next when one completes
}
```
**Answer:** Pool-based approach:
- Start N promises initially
- When one completes, start next
- Maximum N running at any time

---

## Edge Cases

### Q7: What happens with empty array?
**Answer:**
- `promiseAll([])`: Resolves with `[]`
- `promiseAllSettled([])`: Resolves with `[]`
- `promiseRace([])`: Never settles (pending forever)
- `promiseAny([])`: Rejects with AggregateError

### Q8: Order preservation in promiseAll?
```javascript
promiseAll([slow, fast, medium]);
// Returns [slowResult, fastResult, mediumResult]
```
**Answer:** Results array matches input order, not completion order. Use index tracking:
```javascript
results[index] = value; // Store at original position
```

### Q9: What if same promise is passed twice?
```javascript
const p = Promise.resolve(1);
promiseAll([p, p, p]);
```
**Answer:** Works fine. Same promise resolves once but result stored at multiple indices: `[1, 1, 1]`

---

## Implementation Details

### Q10: Why use counter instead of filter for completion?
```javascript
// Good
let completed = 0;
completed++;
if (completed === promises.length) resolve(results);

// Bad
results.filter(r => r !== undefined).length === promises.length
```
**Answer:**
- Counter handles `undefined` as valid value
- Results array may have gaps initially
- O(1) check vs O(n) filter

### Q11: How does exponential backoff work in retry?
```javascript
const waitTime = delay * Math.pow(backoff, attempts - 1);
```
**Answer:**
- `backoff: 1`: Constant delay (1000, 1000, 1000)
- `backoff: 2`: Doubles (1000, 2000, 4000)
- Prevents overwhelming failing services

### Q12: How would you implement promiseLimit?
**Answer:** Semaphore-like approach:
```javascript
function promiseLimit(fn, limit) {
    const queue = [];
    let running = 0;
    
    return async function(...args) {
        while (running >= limit) {
            await new Promise(r => queue.push(r));
        }
        running++;
        try {
            return await fn(...args);
        } finally {
            running--;
            if (queue.length > 0) queue.shift()();
        }
    };
}
```

---
