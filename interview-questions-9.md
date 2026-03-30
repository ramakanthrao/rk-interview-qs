# Interview Questions: curry

## Coding Question

> **Create a `curry()` function that enables partial application of function arguments.**
>
> **Requirements:**
> 1. Return curried function that collects arguments until arity reached
> 2. Support placeholder `_` for argument gaps
> 3. Allow all arguments at once or one at a time
> 4. Provide `uncurry()` to get original function
> 5. Also implement: `partial()`, `partialRight()`, `compose()`, `pipe()`

---

## Basic Understanding

### Q1: What is currying?
**Answer:** Transforming a multi-argument function into a sequence of single-argument functions:
```javascript
// Original
const add = (a, b, c) => a + b + c;
add(1, 2, 3); // 6

// Curried
const curriedAdd = curry(add);
curriedAdd(1)(2)(3); // 6
curriedAdd(1, 2)(3); // 6 (also works)
```

### Q2: What is partial application?
**Answer:** Fixing some arguments and returning a new function:
```javascript
const add = (a, b, c) => a + b + c;
const add5 = partial(add, 5); // Fix 'a' as 5
add5(2, 3); // 10 (5 + 2 + 3)
```

### Q3: Currying vs Partial Application?
**Answer:**
- **Currying**: Always produces unary functions (one arg each)
- **Partial Application**: Can fix any number of arguments
- Currying enables partial application naturally

---

## Code Analysis

### Q4: How does arity detection work?
```javascript
const arity = func.length;
```
**Answer:** 
- `Function.length` returns number of expected parameters
- Does NOT count rest parameters (`...args`)
- Does NOT count parameters with defaults
```javascript
((a, b) => {}).length;      // 2
((...args) => {}).length;   // 0
((a, b = 5) => {}).length;  // 1 (only 'a')
```

### Q5: Why use Symbol for placeholder?
```javascript
const _ = Symbol('curry.placeholder');
```
**Answer:**
- Unique value that can't be confused with actual arguments
- User can't accidentally pass `undefined` or `null` as placeholder
- Symbols are never equal except to themselves

### Q6: How does compose work?
```javascript
funcs.reduce((a, b) => (...args) => a(b(...args)));
```
**Answer:**
- Reduces functions right-to-left
- Each step wraps previous in new function
- Result: `f(g(h(x)))` for `compose(f, g, h)`

---

## Edge Cases

### Q7: What about functions with no parameters?
```javascript
curry(() => 42);
```
**Answer:** 
- `func.length` is 0
- Curried function executes immediately
- Use `{ arity: N }` option to override if needed

### Q8: What about variadic functions?
```javascript
curry((...args) => args.join('-'));
```
**Answer:**
- `func.length` is 0 (rest params don't count)
- Must specify arity manually:
```javascript
curry((...args) => args.join('-'), { arity: 3 });
```

### Q9: How does `this` context work?
```javascript
const obj = {
    value: 10,
    add: curry(function(x) { return this.value + x; })
};
obj.add(5); // Works? 
```
**Answer:** Use `func.apply(this, args)` to preserve context:
```javascript
return func.apply(this, finalArgs);
```

---

## Implementation Details

### Q10: Why return function from curried, not just store args?
**Answer:** Each partial application creates new function:
```javascript
const add = curry((a, b, c) => a + b + c);
const add1 = add(1);
const add2 = add(2);
// add1 and add2 are independent
add1(2, 3); // 6 (1+2+3)
add2(2, 3); // 7 (2+2+3)
```

### Q11: How does placeholder filling work?
```javascript
const f = fn(_, 'B', _);
f('A', 'C');
```
**Answer:** Iterates through previous args:
1. See placeholder → use 'A' from new args
2. See 'B' → keep it
3. See placeholder → use 'C' from new args
4. Result: ('A', 'B', 'C')

### Q12: What's the difference between compose and pipe?
```javascript
compose(f, g, h)(x); // f(g(h(x))) - right to left
pipe(f, g, h)(x);    // h(g(f(x))) - left to right
```
**Answer:**
- `compose`: Mathematical notation order (outer first)
- `pipe`: Reading order (first operation first)
- `pipe(...fns)` equals `compose(...fns.reverse())`

---
