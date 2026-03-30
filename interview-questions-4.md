# Interview Questions: debounce and throttle

## Coding Question

> **Create `debounce()` and `throttle()` functions for controlling function execution frequency.**
>
> **Requirements for debounce:**
> 1. Delay execution until `wait` ms after the last call
> 2. Support `leading` option (execute on first call)
> 3. Support `trailing` option (execute after wait period)
> 4. Support `maxWait` option (force execution after max time)
> 5. Provide `cancel()`, `flush()`, and `pending()` methods
> 6. Track statistics via `getStats()`

---

## Basic Understanding

### Q1: What's the difference between debounce and throttle?
**Answer:**
- **Debounce**: Delays execution until calls stop for `wait` ms. Like waiting for someone to finish typing.
- **Throttle**: Executes at most once per `wait` ms. Like limiting API calls to 1 per second.

```
Debounce (wait=3):  calls: |||||||.....  execution: _______X
Throttle (wait=3):  calls: |||||||.....  execution: X__X__X_
```

### Q2: What are leading vs trailing edge?
**Answer:**
- **Leading**: Execute immediately on first call, then block
- **Trailing**: Execute after the wait period ends
- Both can be combined: execute at start AND end

### Q3: Real-world use cases?
**Answer:**
- **Debounce**: Search input, resize handler, auto-save
- **Throttle**: Scroll handler, mousemove, rate-limited API calls

---

## Code Analysis

### Q4: Why store lastArgs and lastThis?
```javascript
lastArgs = args;
lastThis = this;
```
**Answer:** To preserve the most recent call's context and arguments for trailing edge execution. The function executes with the last invocation's data.

### Q5: How does maxWait work?
**Answer:** 
- Tracks time since last actual execution (`lastInvokeTime`)
- Forces execution when elapsed time exceeds `maxWait`
- Prevents infinite delays when calls keep coming

```javascript
if (maxWait !== null && timeSinceLastInvoke >= maxWait) {
    return invokeFunc(time);
}
```

### Q6: Why can throttle be built on debounce?
```javascript
function throttle(func, wait, options) {
    return debounce(func, wait, {
        leading: true,
        trailing: true,
        maxWait: wait  // Key: maxWait equals wait
    });
}
```
**Answer:** Setting `maxWait = wait` ensures execution happens at least every `wait` ms, which is throttle behavior.

---

## Edge Cases

### Q7: What happens with wait=0?
**Answer:** Still async! Uses `setTimeout(fn, 0)` which defers to next event loop tick:
```javascript
const fn = debounce(() => console.log('hi'), 0);
fn();
console.log('sync'); // Prints first!
// Then 'hi' prints
```

### Q8: What if cancel() is called with no pending execution?
**Answer:** No-op. Safe to call anytime:
```javascript
if (timeoutId !== null) {
    clearTimeout(timeoutId);
}
```

### Q9: What if flush() is called with no pending execution?
**Answer:** Returns the last result without executing:
```javascript
function flush() {
    if (timeoutId === null) {
        return result; // Return previous result
    }
    return trailingEdge(Date.now());
}
```

---

## Implementation Details

### Q10: Why use Date.now() instead of new Date()?
**Answer:** 
- `Date.now()` returns primitive number (faster)
- No object allocation
- Only need timestamp for comparisons

### Q11: Why copy stats in getStats()?
```javascript
getStats: () => ({ ...stats })
```
**Answer:** Prevents external modification of internal state. Returns a snapshot.

### Q12: How would you add Promise support?
**Answer:** Return a promise that resolves when the debounced function executes:
```javascript
function debounce(func, wait) {
    let resolve;
    const debounced = (...args) => {
        return new Promise(r => {
            resolve = r;
            // ... existing logic
        });
    };
    // In invokeFunc:
    result = func.apply(thisArg, args);
    resolve(result);
}
```

---
