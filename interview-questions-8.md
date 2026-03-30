# Interview Questions: Array.prototype.deepFlatten

## Coding Question

> **Create an Array prototype function `deepFlatten()` that flattens nested arrays.**
>
> **Requirements:**
> 1. Flatten arrays to any depth (configurable maxDepth)
> 2. Detect and handle circular references (skip, throw, or mark)
> 3. Preserve non-array objects
> 4. Track statistics: depth reached, elements count, circular refs
> 5. Also implement `flatMapDeep()` for combined flatten + map

---

## Basic Understanding

### Q1: What's the difference between flat() and deepFlatten()?
**Answer:**
- `flat()`: ES2019 built-in, default depth 1, no circular detection
- `deepFlatten()`: Custom, default depth Infinity, handles circulars

```javascript
[1, [2, [3]]].flat();      // [1, 2, [3]] (depth 1)
[1, [2, [3]]].flat(2);     // [1, 2, 3]
[1, [2, [3]]].deepFlatten(); // [1, 2, 3] (infinite)
```

### Q2: How can circular references occur in arrays?
**Answer:**
```javascript
const arr = [1, 2, 3];
arr.push(arr);     // Array references itself
arr[4] = arr;      // Another self-reference
// Without detection: infinite recursion → stack overflow
```

### Q3: Why use WeakSet for circular detection?
**Answer:**
- Uses object references as keys (arrays are objects)
- O(1) lookup for "have I seen this?"
- Allows garbage collection after function completes
- Better than array of seen objects (O(n) lookup)

---

## Code Analysis

### Q4: How does depth limiting work?
```javascript
if (currentDepth < maxDepth) {
    result.push(...flatten(item, currentDepth + 1));
} else {
    result.push(item); // Keep as array
}
```
**Answer:**
- Tracks current depth during recursion
- Continues flattening only if within limit
- Otherwise keeps nested array as-is

### Q5: Why use spread operator for results?
```javascript
result.push(...flatten(item, currentDepth + 1));
```
**Answer:**
- `flatten()` returns array
- Spread adds each element individually
- Alternative: `result = result.concat(flatten(...))`
- Spread is more readable and often faster

### Q6: What does `seen.add(arr)` do exactly?
**Answer:**
- Marks array as "currently being processed"
- If we encounter it again (circular), WeakSet detects it
- Must add BEFORE processing children

---

## Edge Cases

### Q7: What about `null` and `undefined`?
```javascript
[1, null, [undefined, [2]]].deepFlatten();
```
**Answer:** Treated as regular values, not arrays:
- Result: `[1, null, undefined, 2]`
- `Array.isArray(null)` is `false`
- `Array.isArray(undefined)` is `false`

### Q8: How are array-like objects handled?
```javascript
const arrayLike = { 0: 'a', 1: 'b', length: 2 };
[[arrayLike]].deepFlatten();
```
**Answer:** Not flattened (kept as-is):
- `Array.isArray(arrayLike)` returns `false`
- Objects preserved as single elements
- Use `Array.from()` first if you want to flatten

### Q9: What about sparse arrays?
```javascript
const sparse = [1, , , 4];
sparse.deepFlatten();
```
**Answer:** Empty slots become `undefined` in result:
- Iteration includes empty slots
- `for...of` yields `undefined` for empty slots

---

## Implementation Details

### Q10: Why separate stats object?
```javascript
let stats = {
    maxDepthReached: 0,
    circularRefs: 0,
    totalElements: 0,
    arraysFlattened: 0
};
```
**Answer:**
- Closure captures stats across recursive calls
- Single source of truth
- Can return copy without exposing internal state

### Q11: Compare recursive vs iterative flatten:
**Answer:**
```javascript
// Recursive (cleaner, potential stack overflow)
function flatten(arr) {
    return arr.reduce((acc, item) => 
        acc.concat(Array.isArray(item) ? flatten(item) : item), []);
}

// Iterative (more complex, safe for deep arrays)
function flattenIterative(arr) {
    const stack = [...arr];
    const result = [];
    while (stack.length) {
        const item = stack.shift();
        if (Array.isArray(item)) stack.unshift(...item);
        else result.push(item);
    }
    return result;
}
```

### Q12: How would you flatten to a specific type?
**Answer:**
```javascript
// Only extract numbers from nested structure
function flattenNumbers(arr) {
    return arr.deepFlatten().filter(x => typeof x === 'number');
}

// Or with flatMapDeep
arr.flatMapDeep(x => typeof x === 'number' ? x : []);
```

---
