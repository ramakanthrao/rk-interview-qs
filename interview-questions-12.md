# Interview Questions: Generator Functions

## Coding Question

> **Implement various generator functions and utilities.**
>
> **Requirements:**
> 1. `range(start, end, step)` - generate number sequence
> 2. `fibonacci(limit)` - generate Fibonacci numbers
> 3. `accumulator()` - two-way communication generator
> 4. `flatten()` - recursively flatten with yield*
> 5. Utility generators: `take`, `filter`, `map`, `zip`

---

## Basic Understanding

### Q1: What is a generator function?
**Answer:** A function that can pause execution and resume later, yielding multiple values over time:
```javascript
function* myGenerator() {
    yield 1;
    yield 2;
    yield 3;
}

const gen = myGenerator();
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }
gen.next(); // { value: undefined, done: true }
```

### Q2: What's the difference between `yield` and `return`?
**Answer:**
- `yield`: Pauses execution, can resume. `done: false`
- `return`: Ends execution permanently. `done: true`
```javascript
function* example() {
    yield 1;      // { value: 1, done: false }
    return 2;     // { value: 2, done: true }
    yield 3;      // Never reached
}
```

### Q3: What is the Iterator Protocol?
**Answer:** An object is an iterator when it has a `next()` method returning `{ value, done }`:
```javascript
const iterator = {
    current: 0,
    next() {
        if (this.current < 3) {
            return { value: this.current++, done: false };
        }
        return { value: undefined, done: true };
    }
};
```

---

## Code Analysis

### Q4: What does `yield*` do?
```javascript
function* flatten(arr) {
    for (const item of arr) {
        if (Array.isArray(item)) {
            yield* flatten(item);  // Delegation
        } else {
            yield item;
        }
    }
}
```
**Answer:** Delegates to another iterable/generator. All yields from the delegated generator pass through as if they came from the outer generator.

### Q5: How does two-way communication work?
```javascript
function* accumulator() {
    let total = 0;
    while (true) {
        const value = yield total;  // Receive AND send
        total += value;
    }
}
```
**Answer:**
- `yield total` sends value OUT
- `const value = yield` receives value IN from `gen.next(value)`
- Enables coroutine-like behavior

### Q6: Why use generators over arrays?
**Answer:**
- **Lazy evaluation**: Values computed on demand
- **Memory efficient**: Don't store entire sequence
- **Infinite sequences**: Can represent unbounded data
- **Pausable**: Can stop and resume computation

---

## Edge Cases

### Q7: What happens if you call next() after done?
```javascript
const gen = (function*() { yield 1; })();
gen.next(); // { value: 1, done: false }
gen.next(); // { value: undefined, done: true }
gen.next(); // ?
```
**Answer:** Returns `{ value: undefined, done: true }` forever. Safe to call, no error.

### Q8: How do you throw errors into a generator?
```javascript
function* gen() {
    try {
        yield 1;
        yield 2;
    } catch (e) {
        yield 'caught: ' + e;
    }
}
```
**Answer:** Use `generator.throw(error)`:
```javascript
const g = gen();
g.next();           // { value: 1 }
g.throw('oops');    // { value: 'caught: oops' }
```

### Q9: What about `generator.return()`?
**Answer:** Forces generator to finish:
```javascript
const g = gen();
g.next();           // { value: 1 }
g.return('done');   // { value: 'done', done: true }
g.next();           // { value: undefined, done: true }
```

---

## Implementation Details

### Q10: How to make an object iterable?
```javascript
const range = {
    start: 1,
    end: 5,
    [Symbol.iterator]() {
        let current = this.start;
        const end = this.end;
        return {
            next() {
                if (current <= end) {
                    return { value: current++, done: false };
                }
                return { done: true };
            }
        };
    }
};
```
**Answer:** Implement `[Symbol.iterator]()` method returning an iterator.

### Q11: What are async generators?
```javascript
async function* fetchPages() {
    let page = 1;
    while (true) {
        const data = await fetch(`/api?page=${page}`);
        if (!data.length) return;
        yield data;
        page++;
    }
}
```
**Answer:**
- Declared with `async function*`
- Can use `await` inside
- Consumed with `for await...of`
- Returns async iterator with `{ value: Promise, done }`

### Q12: Generator vs async/await - when to use which?
**Answer:**
| Generators | Async/Await |
|------------|-------------|
| Multiple yields | Single return |
| Lazy evaluation | Eager execution |
| Custom iteration | Promise handling |
| Coroutines | Sequential async |
| Pull-based | Push-based |

Combine both: async generators for paginated API calls.

---
