# Interview Questions: memoize

## Coding Question

> **Create a `memoize()` function that caches function results with configurable options.**
>
> **Requirements:**
> 1. Cache results based on function arguments
> 2. Support `maxSize` option with LRU eviction
> 3. Support `ttl` (time-to-live) for cache expiration
> 4. Support custom `resolver` for cache key generation
> 5. Provide cache control: `clear()`, `delete()`, `has()`
> 6. Track statistics: `hits`, `misses`, `evictions`, `hitRate`

---

## Basic Understanding

### Q1: What is memoization?
**Answer:** An optimization technique that caches function results based on inputs. When called with the same arguments, the cached result is returned instead of recomputing.

```javascript
// Without memoization: O(2^n)
fib(40); // Takes seconds

// With memoization: O(n)
memoizedFib(40); // Nearly instant
```

### Q2: What is LRU (Least Recently Used) cache?
**Answer:** A cache eviction policy that removes the least recently accessed item when the cache is full. Recently used items stay, rarely used items get evicted.

### Q3: When should you NOT use memoization?
**Answer:**
- Functions with side effects (API calls, mutations)
- Functions with non-deterministic output (random, time-based)
- Functions with huge argument spaces (memory bloat)
- Functions that are already fast (overhead > benefit)

---

## Code Analysis

### Q4: Why use Map instead of plain object for cache?
**Answer:**
- Map preserves insertion order (crucial for LRU)
- Any value can be a key (not just strings)
- `map.delete()` returns boolean
- `map.size` is O(1)
- No prototype pollution

### Q5: How does LRU work with Map?
```javascript
// Move to end (most recently used)
const value = cache.get(key);
cache.delete(key);
cache.set(key, value);

// Evict oldest (first)
const oldest = cache.keys().next().value;
cache.delete(oldest);
```
**Answer:** Map iteration order is insertion order. Delete and re-add makes it "newest". First key is always "oldest".

### Q6: Why JSON.stringify for default key?
**Answer:** Creates consistent string representation of arguments:
```javascript
fn({ a: 1 }) // Key: '{"a":1}'
fn([1, 2])   // Key: '[1,2]'
```
Caveat: Order matters for objects, and functions/undefined are lost.

---

## Edge Cases

### Q7: What about object reference equality?
```javascript
const fn = memoize((obj) => obj.x);
fn({ x: 1 }); // Miss
fn({ x: 1 }); // Hit or Miss?
```
**Answer:** With default resolver (JSON.stringify), it's a HIT because both serialize to the same string. With reference-based resolver, it would be a miss.

### Q8: How to memoize methods that use `this`?
**Answer:** Use `func.apply(this, args)` to preserve context:
```javascript
const obj = {
    value: 10,
    compute: memoize(function(x) {
        return this.value + x; // 'this' works correctly
    })
};
```

### Q9: What happens with async functions?
**Answer:** Basic memoize caches the Promise. Problem: concurrent calls create multiple Promises before first resolves. Solution: `memoizeAsync` tracks pending Promises.

---

## Implementation Details

### Q10: Why separate timestamps Map?
```javascript
const cache = new Map();
const timestamps = new Map();
```
**Answer:**
- Keeps cache values clean (no wrapper objects)
- Easy to disable TTL (just don't use timestamps)
- Can update timestamp without touching value

### Q11: Why return `{ ...stats }` from getStats()?
**Answer:** Returns a copy to prevent external modification:
```javascript
const stats = fn.getStats();
stats.hits = 999; // Doesn't affect internal stats
```

### Q12: How would you implement cache size limits by memory?
**Answer:**
```javascript
function getSize(value) {
    return JSON.stringify(value).length * 2; // Rough bytes estimate
}

// In memoized function:
currentMemory += getSize(result);
while (currentMemory > maxMemory) {
    const oldest = cache.keys().next().value;
    currentMemory -= getSize(cache.get(oldest));
    cache.delete(oldest);
}
```

---
