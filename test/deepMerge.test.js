/**
 * Test Suite for deepMerge
 */

const { deepMerge, mergeWith, defaults, isPlainObject } = require('../src/deepMerge.js');

// ============ TEST RUNNER ============

function runTest(testName, testFn) {
    try {
        const result = testFn();
        console.log(`\n${result ? '✓' : '✗'} ${testName}`);
        if (!result) console.log('  *** FAILED ***');
        return result;
    } catch (e) {
        console.log(`\n✗ ${testName}`);
        console.log('  Error:', e.message);
        return false;
    }
}

let passed = 0;
let failed = 0;

// ========== BASIC MERGING ==========

runTest('Merge simple objects', () => {
    const result = deepMerge({ a: 1 }, { b: 2 });
    return result.a === 1 && result.b === 2;
}) ? passed++ : failed++;

runTest('Source overwrites target', () => {
    const result = deepMerge({ a: 1 }, { a: 2 });
    return result.a === 2;
}) ? passed++ : failed++;

runTest('Merge nested objects', () => {
    const result = deepMerge(
        { user: { name: 'Alice', age: 30 } },
        { user: { age: 31, city: 'NYC' } }
    );
    return result.user.name === 'Alice' && 
           result.user.age === 31 && 
           result.user.city === 'NYC';
}) ? passed++ : failed++;

runTest('Deeply nested merge', () => {
    const result = deepMerge(
        { a: { b: { c: 1 } } },
        { a: { b: { d: 2 } } }
    );
    return result.a.b.c === 1 && result.a.b.d === 2;
}) ? passed++ : failed++;

// ========== IMMUTABILITY ==========

runTest('Does not mutate original objects', () => {
    const target = { a: 1 };
    const source = { b: 2 };
    const result = deepMerge(target, source);
    return target.b === undefined && result.b === 2;
}) ? passed++ : failed++;

runTest('Clone option false mutates target', () => {
    const target = { a: 1 };
    const source = { b: 2 };
    const result = deepMerge(target, source, { clone: false });
    return target.b === 2 && result === target;
}) ? passed++ : failed++;

// ========== ARRAY STRATEGIES ==========

runTest('Array strategy: replace (default)', () => {
    const result = deepMerge(
        { arr: [1, 2] },
        { arr: [3, 4] }
    );
    return JSON.stringify(result.arr) === '[3,4]';
}) ? passed++ : failed++;

runTest('Array strategy: concat', () => {
    const result = deepMerge(
        { arr: [1, 2] },
        { arr: [3, 4] },
        { arrayStrategy: 'concat' }
    );
    return JSON.stringify(result.arr) === '[1,2,3,4]';
}) ? passed++ : failed++;

runTest('Array strategy: union', () => {
    const result = deepMerge(
        { arr: [1, 2, 3] },
        { arr: [2, 3, 4] },
        { arrayStrategy: 'union' }
    );
    return result.arr.length === 4 && 
           result.arr.includes(1) && result.arr.includes(4);
}) ? passed++ : failed++;

// ========== CUSTOM MERGE ==========

runTest('Custom merge function', () => {
    const result = deepMerge(
        { count: 5 },
        { count: 3 },
        { 
            customMerge: (key, target, source) => {
                if (key === 'count') return target + source;
            }
        }
    );
    return result.count === 8;
}) ? passed++ : failed++;

runTest('Custom merge for specific keys only', () => {
    const result = deepMerge(
        { a: 1, b: 2 },
        { a: 10, b: 20 },
        {
            customMerge: (key, target, source) => {
                if (key === 'a') return target + source;
                // Return undefined for default behavior
            }
        }
    );
    return result.a === 11 && result.b === 20;
}) ? passed++ : failed++;

// ========== CIRCULAR REFERENCES ==========

runTest('Handles circular references (skip)', () => {
    const obj = { a: 1 };
    obj.self = obj;
    const result = deepMerge({}, obj);
    return result.a === 1;
}) ? passed++ : failed++;

runTest('Circular references throw on option', () => {
    const obj = { a: 1 };
    obj.self = obj;
    try {
        deepMerge({}, obj, { onCircular: 'throw' });
        return false;
    } catch (e) {
        return e.message === 'Circular reference detected';
    }
}) ? passed++ : failed++;

// ========== EDGE CASES ==========

runTest('Merge with null/undefined source values', () => {
    const result = deepMerge(
        { a: 1, b: 2 },
        { a: null, c: undefined }
    );
    return result.a === null && result.b === 2 && result.c === undefined;
}) ? passed++ : failed++;

runTest('Non-plain objects are replaced', () => {
    const date = new Date();
    const result = deepMerge(
        { date: new Date('2020-01-01') },
        { date }
    );
    return result.date === date;
}) ? passed++ : failed++;

runTest('Merge empty objects', () => {
    const result = deepMerge({}, {});
    return Object.keys(result).filter(k => k !== 'getStats').length === 0;
}) ? passed++ : failed++;

// ========== MERGE ALL ==========

runTest('Merge multiple objects', () => {
    const result = deepMerge.all([
        { a: 1 },
        { b: 2 },
        { c: 3 }
    ]);
    return result.a === 1 && result.b === 2 && result.c === 3;
}) ? passed++ : failed++;

runTest('Merge all with options', () => {
    const result = deepMerge.all(
        [{ arr: [1] }, { arr: [2] }, { arr: [3] }],
        { arrayStrategy: 'concat' }
    );
    return JSON.stringify(result.arr) === '[1,2,3]';
}) ? passed++ : failed++;

// ========== STATS ==========

runTest('getStats tracks merged keys', () => {
    const result = deepMerge({ a: 1 }, { b: 2, c: 3 });
    return result.getStats().mergedKeys === 2;
}) ? passed++ : failed++;

runTest('getStats tracks conflicts', () => {
    const result = deepMerge({ a: 1, b: 2 }, { a: 10, b: 20 });
    return result.getStats().conflicts === 2;
}) ? passed++ : failed++;

// ========== DEFAULTS ==========

runTest('defaults does not overwrite existing', () => {
    const result = defaults({ a: 1 }, { a: 2, b: 3 });
    return result.a === 1 && result.b === 3;
}) ? passed++ : failed++;

runTest('defaults works with nested objects', () => {
    const result = defaults(
        { user: { name: 'Alice' } },
        { user: { name: 'Bob', age: 30 } }
    );
    return result.user.name === 'Alice' && result.user.age === 30;
}) ? passed++ : failed++;

// ========== MERGE WITH ==========

runTest('mergeWith custom handler', () => {
    const result = mergeWith(
        { arr: [1] },
        { arr: [2] },
        (target, source, key) => {
            if (Array.isArray(target) && Array.isArray(source)) {
                return [...target, ...source];
            }
        }
    );
    return JSON.stringify(result.arr) === '[1,2]';
}) ? passed++ : failed++;

// ========== IS PLAIN OBJECT ==========

runTest('isPlainObject correctly identifies', () => {
    return isPlainObject({}) === true &&
           isPlainObject({ a: 1 }) === true &&
           isPlainObject([]) === false &&
           isPlainObject(null) === false &&
           isPlainObject(new Date()) === false &&
           isPlainObject(Object.create(null)) === true;
}) ? passed++ : failed++;

// ========== RESULTS ==========

console.log('\n========================================');
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('========================================\n');

process.exit(failed > 0 ? 1 : 0);
