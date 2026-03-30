# Interview Questions: Array.prototype.groupBy

## Coding Question

> **Create an Array prototype function `groupBy()` that groups elements by a key or function.**
>
> **Requirements:**
> 1. Accept property name string or grouping function
> 2. Support nested property paths ('data.type')
> 3. Return object with arrays per group
> 4. Provide utility methods:
>    - `getKeys()` → returns array of group names
>    - `getCount()` → returns object with counts per group
>    - `mapGroups(fn)` → transform each group
>    - `filterGroups(predicate)` → filter groups

---

## Basic Understanding

### Q1: Why extend Array.prototype?
**Answer:**
- Natural syntax: `users.groupBy('role')`
- Chainable with other array methods
- Follows built-in methods pattern
- Note: Now part of ES2023 as `Object.groupBy()`

### Q2: What's the difference between groupBy and reduce?
**Answer:** `groupBy` is a specialized reduce:
```javascript
// groupBy
users.groupBy('role');

// Equivalent reduce
users.reduce((groups, user) => {
    const key = user.role;
    groups[key] = groups[key] || [];
    groups[key].push(user);
    return groups;
}, {});
```

### Q3: Why return object instead of Map?
**Answer:**
- More familiar syntax: `result.admin` vs `result.get('admin')`
- JSON serializable directly
- Easier to destructure
- Provides `toMap()` for Map when needed

---

## Code Analysis

### Q4: How does nested property access work?
```javascript
function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, key) => {
        return acc && acc[key] !== undefined ? acc[key] : undefined;
    }, obj);
}
```
**Answer:**
- Splits 'data.type' into ['data', 'type']
- Reduces through each key
- Returns undefined if any level missing
- Safe navigation without throwing

### Q5: Why convert all keys to strings?
```javascript
const groupKey = key === undefined ? 'undefined' : String(key);
```
**Answer:**
- Object keys are always strings
- Consistent behavior: `{1: []}` and {'1': []}` are same
- Avoids edge cases with symbol keys
- Matches how object property access works

### Q6: Why use Object.defineProperties for utilities?
**Answer:**
- `enumerable: false` hides them from iteration
- Don't appear in `Object.keys()` or `for...in`
- Don't interfere with JSON serialization
- Still callable as methods

---

## Edge Cases

### Q7: What happens with null/undefined items?
```javascript
[null, undefined, 'hello'].groupBy(x => typeof x);
```
**Answer:**
- `null` → `typeof null` is `'object'`
- `undefined` → `typeof undefined` is `'undefined'`
- No errors, all items grouped correctly

### Q8: What if array has mixed types?
```javascript
[1, 'a', {x: 1}, [1]].groupBy(item => typeof item);
```
**Answer:** Groups by type:
```javascript
{
    'number': [1],
    'string': ['a'],
    'object': [{x: 1}, [1]]  // Note: arrays are objects
}
```

### Q9: What about Symbol keys?
```javascript
const sym = Symbol('key');
items.groupBy(() => sym);
```
**Answer:** Symbol gets converted to string `'Symbol(key)'`. If true Symbol keys needed, use `toMap()`.

---

## Implementation Details

### Q10: Why does the function receive index?
```javascript
const keyFn = (item, i, array) => ...
```
**Answer:** Enables index-based grouping:
```javascript
items.groupBy((_, i) => i < 5 ? 'first5' : 'rest');
items.groupBy((_, i) => Math.floor(i / 10)); // Groups of 10
```

### Q11: How would you implement groupBy for Map keys?
**Answer:** Use Map instead of object:
```javascript
function groupByMap(keyFn) {
    const groups = new Map();
    for (const item of this) {
        const key = keyFn(item);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(item);
    }
    return groups;
}
```

### Q12: How does ES2023 Object.groupBy differ?
**Answer:**
- Static method: `Object.groupBy(users, u => u.role)`
- Returns null-prototype object (no inherited props)
- No utility methods attached
- Works on any iterable, not just arrays

---
