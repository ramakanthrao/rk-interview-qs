# Interview Questions: deepMerge

## Coding Question

> **Create a `deepMerge()` function that recursively merges objects.**
>
> **Requirements:**
> 1. Recursively merge nested plain objects
> 2. Support array merge strategies: replace, concat, union
> 3. Support custom merge function for conflict resolution
> 4. Handle circular references
> 5. Immutable by default (don't mutate inputs)
> 6. Also implement: `defaults()`, `mergeWith()`

---

## Basic Understanding

### Q1: Difference between shallow and deep merge?
**Answer:**
```javascript
// Shallow merge (spread/Object.assign)
{ a: { x: 1 } } + { a: { y: 2 } } = { a: { y: 2 } }
// Nested object completely replaced

// Deep merge
{ a: { x: 1 } } + { a: { y: 2 } } = { a: { x: 1, y: 2 } }
// Nested object recursively merged
```

### Q2: What is a "plain" object?
**Answer:** Object created by `{}` or `new Object()` or `Object.create(null)`:
```javascript
isPlainObject({});                    // true
isPlainObject(Object.create(null));   // true
isPlainObject([]);                    // false (Array)
isPlainObject(new Date());            // false (Date instance)
isPlainObject(null);                  // false
```

### Q3: What does "immutable merge" mean?
**Answer:** Neither input object is modified. A new object is created:
```javascript
const a = { x: 1 };
const b = { y: 2 };
const c = deepMerge(a, b);
// a is still { x: 1 }
// c is new object { x: 1, y: 2 }
```

---

## Code Analysis

### Q4: Why check `isPlainObject` specifically?
**Answer:** Different handling for different object types:
- Plain objects → merge recursively
- Arrays → apply array strategy
- Dates, RegExp, etc. → replace entirely (don't merge)
- null → is technically `typeof 'object'` but not mergeable

### Q5: How do array strategies work?
```javascript
// replace: source replaces target
[1,2] + [3,4] = [3,4]

// concat: append source to target
[1,2] + [3,4] = [1,2,3,4]

// union: combine unique values
[1,2,3] + [2,3,4] = [1,2,3,4]
```

### Q6: Why use WeakMap for circular detection?
**Answer:** Tracks objects being processed:
```javascript
const seen = new WeakMap();
seen.set(sourceObj, result);
// If we see sourceObj again, we know it's circular
```
WeakMap allows garbage collection after merge completes.

---

## Edge Cases

### Q7: What about prototype properties?
```javascript
function Foo() {}
Foo.prototype.inheritedProp = 'value';
const obj = new Foo();
```
**Answer:** Only own properties are merged. Use `Object.keys()` not `for...in`:
```javascript
for (const key of Object.keys(source)) // Own properties only
```

### Q8: Merging objects with same key but different types?
```javascript
deepMerge({ a: 1 }, { a: { b: 2 } });
```
**Answer:** Source wins. Number is replaced by object:
```javascript
{ a: { b: 2 } }
```
Only plain object + plain object triggers recursive merge.

### Q9: What about Symbol keys?
**Answer:** `Object.keys()` doesn't include Symbols. To include them:
```javascript
const allKeys = [
    ...Object.keys(source),
    ...Object.getOwnPropertySymbols(source)
];
```

---

## Implementation Details

### Q10: Why create merger with preset options?
```javascript
const safeMerge = deepMerge.create({ 
    clone: true, 
    onCircular: 'throw' 
});
safeMerge(a, b); // Uses preset options
```
**Answer:** 
- Consistent configuration across codebase
- Don't repeat options everywhere
- Factory pattern for specialized mergers

### Q11: How does `defaults` differ from merge?
**Answer:** Priority is reversed:
```javascript
// merge: source overwrites target
deepMerge({ a: 1 }, { a: 2 }); // { a: 2 }

// defaults: target takes precedence
defaults({ a: 1 }, { a: 2 }); // { a: 1 }
```
Useful for applying default config while preserving user values.

### Q12: How would you merge with deep array comparison?
**Answer:** Custom merge function with array element matching:
```javascript
deepMerge(target, source, {
    customMerge: (key, targetVal, sourceVal) => {
        if (Array.isArray(targetVal) && Array.isArray(sourceVal)) {
            // Merge by ID for objects with 'id' property
            const map = new Map(targetVal.map(item => [item.id, item]));
            sourceVal.forEach(item => {
                if (map.has(item.id)) {
                    map.set(item.id, deepMerge(map.get(item.id), item));
                } else {
                    map.set(item.id, item);
                }
            });
            return Array.from(map.values());
        }
    }
});
```

---
