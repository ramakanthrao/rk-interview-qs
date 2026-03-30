/**
 * Test Suite for deepClone
 */

const deepClone = require('../src/deepClone.js');

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

// ========== BASIC CLONING ==========

runTest('Clone simple object', () => {
    const obj = { a: 1, b: 'hello', c: true };
    const cloned = deepClone(obj);
    return cloned.a === 1 && cloned.b === 'hello' && cloned.c === true && cloned !== obj;
}) ? passed++ : failed++;

runTest('Clone nested object', () => {
    const obj = { a: { b: { c: 42 } } };
    const cloned = deepClone(obj);
    obj.a.b.c = 100;
    return cloned.a.b.c === 42;
}) ? passed++ : failed++;

runTest('Clone array', () => {
    const arr = [1, [2, [3, 4]], 5];
    const cloned = deepClone(arr);
    arr[1][1][0] = 999;
    return Array.isArray(cloned) && cloned[1][1][0] === 3;
}) ? passed++ : failed++;

// ========== SPECIAL TYPES ==========

runTest('Clone Date object', () => {
    const date = new Date('2024-01-15');
    const obj = { created: date };
    const cloned = deepClone(obj);
    return cloned.created instanceof Date && cloned.created.getTime() === date.getTime();
}) ? passed++ : failed++;

runTest('Clone RegExp object', () => {
    const regex = /test/gi;
    const obj = { pattern: regex };
    const cloned = deepClone(obj);
    return cloned.pattern instanceof RegExp && 
           cloned.pattern.source === 'test' && 
           cloned.pattern.flags === 'gi';
}) ? passed++ : failed++;

runTest('Clone Map object', () => {
    const map = new Map([['a', 1], ['b', 2]]);
    const cloned = deepClone(map);
    map.set('a', 999);
    return cloned instanceof Map && cloned.get('a') === 1 && cloned.get('b') === 2;
}) ? passed++ : failed++;

runTest('Clone Set object', () => {
    const set = new Set([1, 2, 3]);
    const cloned = deepClone(set);
    return cloned instanceof Set && cloned.has(1) && cloned.has(2) && cloned.has(3);
}) ? passed++ : failed++;

// ========== CIRCULAR REFERENCES ==========

runTest('Handle circular reference (reference mode)', () => {
    const obj = { a: 1 };
    obj.self = obj;
    const cloned = deepClone(obj);
    return cloned.self === cloned && cloned.a === 1;
}) ? passed++ : failed++;

runTest('Handle circular reference (null mode)', () => {
    const obj = { a: 1 };
    obj.self = obj;
    const cloned = deepClone(obj, { onCircular: 'null' });
    return cloned.self === null && cloned.a === 1;
}) ? passed++ : failed++;

runTest('Handle circular reference (string mode)', () => {
    const obj = { a: 1 };
    obj.self = obj;
    const cloned = deepClone(obj, { onCircular: 'string' });
    return cloned.self === '[Circular]' && cloned.a === 1;
}) ? passed++ : failed++;

// ========== STATS ==========

runTest('getStats returns correct depth', () => {
    const obj = { a: { b: { c: { d: 1 } } } };
    const cloned = deepClone(obj);
    return cloned.getStats().depth === 4;
}) ? passed++ : failed++;

runTest('getStats counts circular refs', () => {
    const obj = { a: 1 };
    obj.self = obj;
    obj.self2 = obj;
    const cloned = deepClone(obj);
    return cloned.getStats().circularRefs === 2;
}) ? passed++ : failed++;

// ========== EDGE CASES ==========

runTest('Clone null returns null', () => {
    return deepClone(null) === null;
}) ? passed++ : failed++;

runTest('Clone primitive returns primitive', () => {
    return deepClone(42) === 42 && deepClone('hello') === 'hello';
}) ? passed++ : failed++;

runTest('Max depth option', () => {
    const obj = { a: { b: { c: { d: 1 } } } };
    const cloned = deepClone(obj, { maxDepth: 2 });
    return cloned.a.b === '[Max Depth]';
}) ? passed++ : failed++;

// ========== RESULTS ==========

console.log('\n========================================');
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('========================================\n');

process.exit(failed > 0 ? 1 : 0);
