# Interview Questions: Array.prototype.chunk

## Coding Question

> **Create an Array prototype function `chunk()` that splits an array into chunks.**
>
> **Requirements:**
> 1. Split array into chunks of specified size
> 2. Handle remainder (last chunk may be smaller)
> 3. Support `pad` option to fill incomplete chunks
> 4. Support `overlap` option for sliding window
> 5. Support `dropRemainder` option to discard incomplete chunks
> 6. Provide utility methods: `getStats()`, `flatten()`, `mapChunks()`

---

## Basic Understanding

### Q1: What are common use cases for chunking?
**Answer:**
- **Pagination**: Display items in pages of N
- **Batch processing**: Process API calls in batches
- **Parallel processing**: Split work across workers
- **UI rendering**: Virtualized lists, grid layouts

### Q2: What's the difference between chunk and partition?
**Answer:**
- **Chunk**: Split by size (fixed number of elements per group)
- **Partition**: Split by condition (two groups: passes/fails predicate)

```javascript
[1,2,3,4,5].chunk(2);        // [[1,2], [3,4], [5]]
[1,2,3,4,5].partition(x=>x>2); // [[3,4,5], [1,2]]
```

### Q3: What is a sliding window?
**Answer:** Overlapping chunks where each chunk shares elements with neighbors:
```javascript
[1,2,3,4,5].chunk(3, {overlap: 2});
// [[1,2,3], [2,3,4], [3,4,5]]
// Each window slides by 1 (size - overlap)
```

---

## Code Analysis

### Q4: How is step calculated with overlap?
```javascript
const step = size - overlap;
```
**Answer:**
- Without overlap: step = size (chunks don't share elements)
- With overlap of 1: step = size - 1 (advance by one less)
- Creates sliding window effect

### Q5: Why check `step < 1`?
**Answer:** If overlap ≥ size, step would be ≤ 0:
- Would never advance through the array
- Creates infinite loop
- Must have: overlap < size

### Q6: How does padding work?
```javascript
if (pad !== undefined) {
    while (chunk.length < size) {
        chunk.push(pad);
    }
}
```
**Answer:**
- Only applies to incomplete final chunk
- Fills with specified value until size reached
- Useful for matrix operations requiring uniform dimensions

---

## Edge Cases

### Q7: What happens with size > array.length?
```javascript
[1, 2, 3].chunk(10);
```
**Answer:** Returns single chunk containing all elements: `[[1, 2, 3]]`

### Q8: What about empty arrays?
```javascript
[].chunk(5);
```
**Answer:** Returns empty array `[]`. No chunks created from nothing.

### Q9: How does dropRemainder interact with padding?
**Answer:** 
- `dropRemainder: true` takes precedence
- Last incomplete chunk is dropped entirely
- `pad` is ignored for that chunk

```javascript
[1,2,3,4,5].chunk(3, { pad: 0, dropRemainder: true });
// [[1,2,3]] - last chunk [4,5] dropped, not padded
```

---

## Implementation Details

### Q10: Why use `slice` instead of splice?
```javascript
const chunk = this.slice(i, i + size);
```
**Answer:**
- `slice` doesn't modify original array (immutable)
- Creates shallow copy of elements
- Handles out-of-bounds gracefully (returns what exists)

### Q11: How would you implement async chunking?
**Answer:** For processing chunks with delays:
```javascript
async function processInChunks(array, size, processor, delay = 0) {
    const chunks = array.chunk(size);
    for (const chunk of chunks) {
        await processor(chunk);
        if (delay) await new Promise(r => setTimeout(r, delay));
    }
}
```

### Q12: How would you implement infinite/lazy chunking?
**Answer:** Use generator function:
```javascript
function* chunkGenerator(iterable, size) {
    let chunk = [];
    for (const item of iterable) {
        chunk.push(item);
        if (chunk.length === size) {
            yield chunk;
            chunk = [];
        }
    }
    if (chunk.length > 0) yield chunk;
}
```

---
