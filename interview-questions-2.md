# Interview Questions: deepClone

## Coding Question

> **Create a `deepClone()` function that creates a deep copy of objects with circular reference handling.**
>
> **Requirements:**
> 1. Handle nested objects and arrays at any depth
> 2. Detect and handle circular references (three modes: reference, null, string)
> 3. Preserve special types: Date, RegExp, Map, Set
> 4. Support maxDepth option to limit cloning depth
> 5. Return cloned object with:
>    - `getStats()` → returns { depth, circularRefs, totalNodes }

---

## Basic Understanding

### Q1: What is deep cloning vs shallow cloning?
**Answer:** 
- **Shallow clone**: Copies only the first level; nested objects share references
- **Deep clone**: Recursively copies all levels; completely independent copy

```javascript
// Shallow clone problem:
const obj = { a: { b: 1 } };
const shallow = { ...obj };
obj.a.b = 2;
console.log(shallow.a.b); // 2 (shared reference!)
```

### Q2: Why can't we use JSON.parse(JSON.stringify(obj))?
**Answer:** 
- Loses Date objects (become strings)
- Loses RegExp objects (become empty objects)
- Loses Map/Set (become empty objects)
- Fails on circular references (throws error)
- Loses undefined values and functions

### Q3: What is a circular reference?
**Answer:** When an object references itself directly or through a chain:
```javascript
const obj = { name: 'test' };
obj.self = obj; // Direct circular reference
```

---

## Code Analysis

### Q4: Why use WeakMap for tracking seen objects?
**Answer:**
- WeakMap uses object references as keys
- Allows garbage collection of cloned objects
- O(1) lookup for circular reference detection
- Doesn't interfere with objects' enumerable properties

### Q5: What happens with `deepClone({ a: 1, self: obj })`?
**Answer:** Depends on `onCircular` option:
- `'reference'` (default): `self` points to the cloned object itself
- `'null'`: `self` becomes `null`
- `'string'`: `self` becomes `'[Circular]'`

### Q6: How do you clone a Date without mutation?
```javascript
if (value instanceof Date) {
    return new Date(value.getTime());
}
```
**Answer:** Using `getTime()` gets the timestamp, creating a completely new Date instance.

---

## Edge Cases

### Q7: What happens with null?
**Answer:** Returns `null` directly. The check `typeof null === 'object'` is true, but we explicitly handle it:
```javascript
if (value === null || typeof value !== 'object') {
    return value;
}
```

### Q8: How are Symbol properties handled?
**Answer:** They're cloned separately using `Object.getOwnPropertySymbols()`:
```javascript
for (const sym of Object.getOwnPropertySymbols(value)) {
    clonedObj[sym] = clone(value[sym], currentDepth + 1);
}
```

### Q9: What happens with prototype chain?
**Answer:** The prototype is preserved using `Object.create(Object.getPrototypeOf(value))`, maintaining inheritance.

---

## Implementation Details

### Q10: Why use Object.defineProperty for getStats?
```javascript
Object.defineProperty(result, 'getStats', {
    value: () => ({ ...stats }),
    enumerable: false,
    configurable: true
});
```
**Answer:**
- `enumerable: false` hides it from `for...in` and `Object.keys()`
- Doesn't appear in JSON serialization
- Keeps the cloned object "clean"

### Q11: Why return `{ ...stats }` instead of `stats`?
**Answer:** Prevents external modification of the internal stats object. Returns a copy each time.

### Q12: What's the time complexity?
**Answer:** O(n) where n is the total number of nodes (objects, arrays, primitives) in the structure. Each node is visited exactly once due to the WeakMap tracking.

---
