# Interview Questions: EventEmitter

## Coding Question

> **Create an `EventEmitter` class that implements a pub/sub pattern.**
>
> **Requirements:**
> 1. `on(event, listener)` → register a listener for an event
> 2. `once(event, listener)` → register a one-time listener
> 3. `off(event, listener)` → remove a specific listener
> 4. `emit(event, ...args)` → trigger an event with arguments
> 5. Support wildcard '*' listener that receives all events
> 6. Return `getStats()` → { totalEmits, totalListenerCalls, activeEvents }

---

## Basic Understanding

### Q1: What is the pub/sub (publish-subscribe) pattern?
**Answer:** A messaging pattern where:
- **Publishers** emit events without knowing who's listening
- **Subscribers** listen for events without knowing who emits them
- Creates loose coupling between components

### Q2: Why use Map instead of plain object for events?
**Answer:**
- Any value can be a key (including symbols)
- Maintains insertion order
- Built-in `size` property
- `has()`, `delete()`, `clear()` methods
- Avoids prototype pollution issues

### Q3: When would you use once() vs on()?
**Answer:**
- `once()`: One-time events like 'ready', 'connected', 'loaded'
- `on()`: Recurring events like 'data', 'message', 'click'

---

## Code Analysis

### Q4: Why does emit() return a boolean?
```javascript
emit(event, ...args) {
    // ... 
    return called;
}
```
**Answer:** Indicates whether any listeners were called. Useful for:
- Debugging: know if anyone is listening
- Conditional logic: take action if no one handled the event

### Q5: How does the wildcard listener work?
```javascript
if (event !== '*' && this._events.has('*')) {
    for (const listener of this._events.get('*')) {
        listener.apply(this, [event, ...args]);
    }
}
```
**Answer:** 
- Checks if emitting non-wildcard event
- Passes event name as first argument
- Allows logging, debugging, or routing all events

### Q6: Why use `listener.apply(this, args)` instead of `listener(...args)`?
**Answer:** Ensures `this` context is the emitter instance, useful when listeners use `this`:
```javascript
emitter.on('save', function() {
    this.emit('saved'); // 'this' is the emitter
});
```

---

## Edge Cases

### Q7: What happens if you emit an event with no listeners?
**Answer:** Returns `false`. No error thrown. This is the "fire and forget" nature of pub/sub.

### Q8: What if the same listener is registered twice?
**Answer:** It gets called twice. Most implementations allow duplicates. To prevent, check if listener exists:
```javascript
if (!listeners.includes(listener)) {
    listeners.push(listener);
}
```

### Q9: What happens if a listener throws an error?
**Answer:** Depends on implementation:
- Current: Error propagates, subsequent listeners not called
- Better: Wrap in try-catch, continue calling others, emit 'error' event

---

## Implementation Details

### Q10: Why store once listeners separately?
**Answer:**
- Simplifies removal logic (clear entire list after emit)
- Avoids modifying array while iterating
- Can track once vs regular listeners independently

### Q11: Why use `const onceListeners = this._onceEvents.get(event).slice()`?
**Answer:** Creates a copy before iterating. Prevents issues if a listener registers another once listener during execution.

### Q12: How would you implement event namespacing?
**Answer:** Support patterns like `'user:login'`, `'user:logout'`:
```javascript
emit(event, ...args) {
    // Emit exact match
    this._callListeners(event, args);
    
    // Emit namespace (e.g., 'user:*' for 'user:login')
    const namespace = event.split(':')[0];
    this._callListeners(namespace + ':*', args);
}
```

---
