# Interview Questions: Array.prototype.toSingleType

## Coding Question

> **Create an Array prototype function that converts mixed-type arrays to a single type.**  
> Priority: array > object > primitives. Use "Yes"/"No" as boolean indicators.  
> Return the converted array with a `getType()` method that returns the dominant type.

---

## Basic Understanding

### Q1: What does this function do?
**Answer:** It converts a mixed-type array into a single-type array based on priority rules:
- Array > Object > (Boolean/Number/String based on conditions)

### Q2: Why extend Array.prototype instead of creating a standalone function?
**Answer:** 
- Enables method chaining: `arr.toSingleType().map(...)`
- More intuitive syntax: `[1, true, "hello"].toSingleType()`
- Follows JavaScript's built-in array methods pattern

### Q3: What are the type conversion priorities?
**Answer:**
1. If any element is an **array** → convert all to arrays
2. If any element is an **object** → convert all to objects
3. If only strings (no boolean/number) → keep as strings
4. If has "Yes"/"No" + boolean + no number > 1 → convert to boolean
5. If has number > 1 → convert to number
6. If has boolean → convert to boolean
7. Default → string

---

## Code Analysis

### Q4: What happens with `[0, 1, true]`?
**Answer:** Returns `[false, true, true]` (boolean)
- Has boolean (`true`)
- Has numbers but none > 1
- Falls into "has boolean" rule

### Q5: What happens with `[0, 11, true]`?
**Answer:** Returns `[0, 11, 1]` (number)
- Has number > 1 (`11`)
- Triggers the "hasNumberGreaterThan1" rule

### Q6: Why is "Yes"/"No" treated specially?
**Answer:** These are semantic boolean values commonly used in forms/data. Converting `"Yes"` → `true` and `"No"` → `false` provides intuitive type coercion.

---

## Edge Cases

### Q7: What happens with an empty array?
**Answer:** Returns `[]` with `getType()` returning `'undefined'`

### Q8: What happens when array contains both array and object?
```javascript
[11, [1, 2], {value: "hey"}]
```
**Answer:** Returns `[[11], [1, 2], [{value: "hey"}]]` — array wins over object.

### Q9: How does the function handle `null`?
**Answer:** `null` with `typeof` returns `'object'`, but the check `item !== null && typeof item === 'object'` prevents null from being treated as an object.

---

## Implementation Details

### Q10: Why use `item > 1` instead of `item >= 1` for hasNumberGreaterThan1?
**Answer:** Because `0` and `1` can represent boolean values (`false`/`true`). Only numbers > 1 definitively indicate "numeric intent."

### Q11: How does the function attach `getType()` to the result?
```javascript
const result = this.map(item => convertTo(item, dominantType));
result.getType = () => dominantType;
return result;
```
**Answer:** It adds a function property to the array. Arrays in JavaScript are objects, so they can have additional properties.

### Q12: What's the difference between these two checks?
```javascript
Array.isArray(item)
// vs
typeof item === 'object'
```
**Answer:** 
- `Array.isArray()` specifically checks for arrays
- `typeof []` returns `'object'`, so we need `Array.isArray()` to distinguish arrays from objects

---

## Potential Improvements

### Q13: What are the limitations of this implementation?
**Answer:**
- Doesn't handle `undefined` or `Symbol`
- "Yes"/"No" detection is case-sensitive to exact match
- Nested arrays/objects aren't recursively converted
- No support for custom type priority configuration

### Q14: How would you make this immutable-friendly?
**Answer:** The current implementation already returns a new array (via `.map()`), so it doesn't mutate the original array.

### Q15: How would you add TypeScript support?
**Answer:**
```typescript
declare global {
  interface Array<T> {
    toSingleType(): Array<boolean | number | string | object | Array<any>> & {
      getType(): 'boolean' | 'number' | 'string' | 'object' | 'array' | 'undefined';
    };
  }
}
```

---

## Coding Challenges

### Q16: Write a test case that would fail with incorrect logic
**Answer:** Testing priority edge case:
```javascript
// Should be number (has 5 > 1), not boolean
[5, true, false] → [5, 1, 0] (number)
```

### Q17: How would you refactor `convertTo` to be more extensible?
**Answer:** Use a converter registry:
```javascript
const converters = {
  boolean: (val) => Boolean(val),
  number: (val) => Number(val) || 0,
  // ... add more converters
};
```

### Q18: What's wrong with this approach for type detection?
```javascript
typeof item === 'object' // for object check
```
**Answer:** This would incorrectly match:
- `null` (typeof null === 'object')
- Arrays (typeof [] === 'object')

---

## Behavioral Questions

### Q19: How would you explain this function to a non-technical stakeholder?
**Answer:** "This function takes a list with mixed data types and standardizes them into one type, following smart rules. For example, if you have a list with numbers and checkboxes, it figures out the best common format and converts everything accordingly."

### Q20: What testing strategy would you use?
**Answer:**
1. Unit tests for each type conversion rule
2. Edge cases (empty array, single element, null)
3. Priority tests (array vs object, number vs boolean)
4. Regression tests for semantic values (Yes/No/TRUE/FALSE)
