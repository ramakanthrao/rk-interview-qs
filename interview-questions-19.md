# Interview Questions: Jest Unit Testing

## Coding Question

> **Write comprehensive unit tests using Jest.**
>
> **Topics Covered:**
> 1. Test structure and matchers
> 2. Mocking functions and modules
> 3. Async testing
> 4. Setup and teardown
> 5. Snapshot testing
> 6. Code coverage

---

## Test Structure

### Q1: What is the basic structure of a Jest test?
**Answer:**
```javascript
// Group tests with describe
describe('Calculator', () => {
    // Setup/teardown hooks
    beforeAll(() => { /* runs once before all tests */ });
    afterAll(() => { /* runs once after all tests */ });
    beforeEach(() => { /* runs before each test */ });
    afterEach(() => { /* runs after each test */ });
    
    // Individual test case
    it('should add two numbers', () => {
        expect(add(2, 3)).toBe(5);
    });
    
    // Alias for it()
    test('should subtract two numbers', () => {
        expect(subtract(5, 3)).toBe(2);
    });
    
    // Nested describe for sub-groups
    describe('division', () => {
        it('should divide numbers', () => {
            expect(divide(10, 2)).toBe(5);
        });
        
        it('should throw on division by zero', () => {
            expect(() => divide(10, 0)).toThrow('Division by zero');
        });
    });
});
```

### Q2: What are the common Jest matchers?
**Answer:**
```javascript
// Equality
expect(value).toBe(5);               // ===
expect(value).toEqual({ a: 1 });     // Deep equality
expect(value).toStrictEqual({ a: 1 }); // Deep + type

// Truthiness
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3);
expect(value).toBeLessThan(5);
expect(value).toBeCloseTo(0.3, 5);  // Floating point

// Strings
expect(value).toMatch(/regex/);
expect(value).toContain('substring');

// Arrays
expect(arr).toContain(item);
expect(arr).toContainEqual({ a: 1 });
expect(arr).toHaveLength(3);

// Objects
expect(obj).toHaveProperty('key');
expect(obj).toHaveProperty('nested.key', value);
expect(obj).toMatchObject({ subset: true });

// Exceptions
expect(() => fn()).toThrow();
expect(() => fn()).toThrow('message');
expect(() => fn()).toThrow(ErrorType);

// Negation
expect(value).not.toBe(5);
```

---

## Mocking

### Q3: How do you create mock functions?
**Answer:**
```javascript
// Create mock function
const mockFn = jest.fn();

// With implementation
const mockAdd = jest.fn((a, b) => a + b);

// With return value
const mockGet = jest.fn().mockReturnValue(42);
const mockGetOnce = jest.fn()
    .mockReturnValueOnce(1)
    .mockReturnValueOnce(2)
    .mockReturnValue(3);

// With resolved/rejected promise
const mockAsync = jest.fn().mockResolvedValue({ data: 'test' });
const mockReject = jest.fn().mockRejectedValue(new Error('fail'));

// Inspect calls
mockFn('arg1', 'arg2');
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(1);
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenLastCalledWith('arg1', 'arg2');

// Access call info
mockFn.mock.calls;      // [['arg1', 'arg2']]
mockFn.mock.results;    // [{ type: 'return', value: undefined }]
mockFn.mock.instances;  // For constructors

// Reset
mockFn.mockClear();     // Clear call history
mockFn.mockReset();     // Clear + remove implementation
mockFn.mockRestore();   // Restore original (spyOn only)
```

### Q4: How do you mock modules?
**Answer:**
```javascript
// Mock entire module
jest.mock('./userService');

// Mock with implementation
jest.mock('./userService', () => ({
    getUser: jest.fn().mockResolvedValue({ id: 1, name: 'Test' }),
    saveUser: jest.fn().mockResolvedValue(true),
}));

// Partial mock (keep original implementation)
jest.mock('./utils', () => ({
    ...jest.requireActual('./utils'),
    formatDate: jest.fn().mockReturnValue('2024-01-01'),
}));

// Mock in test file
import { getUser } from './userService';

jest.mock('./userService');

test('uses mocked getUser', async () => {
    getUser.mockResolvedValue({ id: 1 });
    const user = await getUser(1);
    expect(user.id).toBe(1);
});
```

### Q5: How do you spy on methods?
**Answer:**
```javascript
// Spy on object method
const video = {
    play() { return true; },
    pause() { return false; },
};

const playSpy = jest.spyOn(video, 'play');
video.play();

expect(playSpy).toHaveBeenCalled();
expect(video.play()).toBe(true); // Original works

// Spy with mock implementation
jest.spyOn(video, 'play').mockImplementation(() => 'mocked');
expect(video.play()).toBe('mocked');

// Spy on module exports
import * as mathModule from './math';

jest.spyOn(mathModule, 'add').mockReturnValue(10);
expect(mathModule.add(2, 3)).toBe(10);

// Restore original
playSpy.mockRestore();
```

---

## Async Testing

### Q6: How do you test async code?
**Answer:**
```javascript
// Method 1: Return promise
test('async with return', () => {
    return fetchData().then(data => {
        expect(data).toBe('data');
    });
});

// Method 2: async/await
test('async with await', async () => {
    const data = await fetchData();
    expect(data).toBe('data');
});

// Method 3: Resolves/rejects matchers
test('async with resolves', () => {
    return expect(fetchData()).resolves.toBe('data');
});

test('async with rejects', () => {
    return expect(fetchBadData()).rejects.toThrow('error');
});

// Method 4: Callbacks (done)
test('callback test', done => {
    fetchDataCallback((err, data) => {
        expect(data).toBe('data');
        done();
    });
});
```

### Q7: How do you test timers?
**Answer:**
```javascript
// Enable fake timers
jest.useFakeTimers();

test('debounce delays execution', () => {
    const callback = jest.fn();
    const debounced = debounce(callback, 1000);
    
    debounced();
    expect(callback).not.toHaveBeenCalled();
    
    // Fast-forward time
    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
});

test('setInterval', () => {
    const callback = jest.fn();
    setInterval(callback, 100);
    
    // Run all pending timers
    jest.runOnlyPendingTimers();
    expect(callback).toHaveBeenCalledTimes(1);
    
    // Or advance specific time
    jest.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(6);
});

afterEach(() => {
    jest.useRealTimers();
});
```

---

## Setup & Teardown

### Q8: When do you use each setup/teardown hook?
**Answer:**
```javascript
describe('Database tests', () => {
    // Once before all tests - expensive setup
    beforeAll(async () => {
        await db.connect();
    });
    
    // Once after all tests - cleanup
    afterAll(async () => {
        await db.disconnect();
    });
    
    // Before each test - reset state
    beforeEach(async () => {
        await db.clear();
        await db.seed();
    });
    
    // After each test - cleanup
    afterEach(() => {
        jest.clearAllMocks();
    });
});
```

### Q9: How do you share setup across test files?
**Answer:**
```javascript
// jest.config.js
module.exports = {
    setupFilesAfterEnv: ['./jest.setup.js'],
};

// jest.setup.js
beforeAll(() => {
    // Global setup
});

afterEach(() => {
    jest.clearAllMocks();
});

// Or use globalSetup/globalTeardown
module.exports = {
    globalSetup: './global-setup.js',
    globalTeardown: './global-teardown.js',
};

// global-setup.js
module.exports = async () => {
    // Runs once before all test files
    process.env.TEST_DB = 'test-db';
};
```

---

## Snapshot Testing

### Q10: What is snapshot testing?
**Answer:**
```javascript
// Basic snapshot
test('renders correctly', () => {
    const tree = renderer.create(<Button label="Click me" />).toJSON();
    expect(tree).toMatchSnapshot();
});

// Inline snapshot
test('config object', () => {
    expect(getConfig()).toMatchInlineSnapshot(`
        {
            "debug": false,
            "port": 3000,
        }
    `);
});

// Update snapshots
// Run: jest --updateSnapshot or jest -u

// Snapshot with dynamic values
expect.addSnapshotSerializer({
    test: (val) => val instanceof Date,
    print: () => '"<DATE>"',
});

// Or use property matchers
expect(user).toMatchSnapshot({
    id: expect.any(Number),
    createdAt: expect.any(Date),
});
```

---

## Code Coverage

### Q11: How do you configure code coverage?
**Answer:**
```javascript
// jest.config.js
module.exports = {
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    collectCoverageFrom: [
        'src/**/*.{js,jsx}',
        '!src/**/*.test.{js,jsx}',
        '!src/index.js',
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
        './src/critical/': {
            branches: 100,
            functions: 100,
        },
    },
};

// Run with coverage
// jest --coverage
```

### Q12: How do you test edge cases and error paths?
**Answer:**
```javascript
describe('divide', () => {
    // Happy path
    it('divides two numbers', () => {
        expect(divide(10, 2)).toBe(5);
    });
    
    // Edge cases
    it('handles zero dividend', () => {
        expect(divide(0, 5)).toBe(0);
    });
    
    it('handles negative numbers', () => {
        expect(divide(-10, 2)).toBe(-5);
    });
    
    it('handles decimal results', () => {
        expect(divide(7, 2)).toBeCloseTo(3.5);
    });
    
    // Error cases
    it('throws on division by zero', () => {
        expect(() => divide(10, 0)).toThrow('Division by zero');
    });
    
    it('throws on non-numeric input', () => {
        expect(() => divide('10', 2)).toThrow(TypeError);
    });
    
    // Boundary testing
    it('handles MAX_SAFE_INTEGER', () => {
        const big = Number.MAX_SAFE_INTEGER;
        expect(divide(big, 1)).toBe(big);
    });
});
```

---

## Best Practices

### Q13: What are Jest testing best practices?
**Answer:**
1. **Arrange-Act-Assert (AAA) pattern**
```javascript
test('processes order correctly', () => {
    // Arrange
    const cart = createCart();
    cart.addItem({ id: 1, price: 100 });
    
    // Act
    const order = processOrder(cart);
    
    // Assert
    expect(order.total).toBe(100);
});
```

2. **Test one thing per test**
3. **Use descriptive test names**
4. **Avoid testing implementation details**
5. **Keep tests independent**
6. **Don't test external libraries**
7. **Use setup/teardown appropriately**
8. **Keep coverage meaningful, not just high**

### Q14: How do you organize test files?
**Answer:**
```
// Co-located tests
src/
├── components/
│   ├── Button.jsx
│   └── Button.test.jsx

// Separate test directory
src/
├── components/
│   └── Button.jsx
__tests__/
├── components/
│   └── Button.test.jsx

// Jest config for file patterns
module.exports = {
    testMatch: [
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test).[jt]s?(x)'
    ],
};
```

---
