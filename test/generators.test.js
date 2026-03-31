/**
 * Test Suite for Generator Functions
 */

const {
    range,
    infiniteSequence,
    fibonacci,
    accumulator,
    flatten,
    paginate,
    take,
    filter,
    map,
    zip
} = require('../src/generators.js');

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

// ========== RANGE ==========

runTest('range generates sequence', () => {
    const result = [...range(1, 5)];
    return JSON.stringify(result) === '[1,2,3,4,5]';
}) ? passed++ : failed++;

runTest('range with step', () => {
    const result = [...range(0, 10, 2)];
    return JSON.stringify(result) === '[0,2,4,6,8,10]';
}) ? passed++ : failed++;

runTest('range is iterable', () => {
    let sum = 0;
    for (const n of range(1, 3)) sum += n;
    return sum === 6;
}) ? passed++ : failed++;

// ========== INFINITE SEQUENCE ==========

runTest('infiniteSequence with take', () => {
    const result = [...take(infiniteSequence(0), 5)];
    return JSON.stringify(result) === '[0,1,2,3,4]';
}) ? passed++ : failed++;

runTest('infiniteSequence starts at given value', () => {
    const result = [...take(infiniteSequence(10), 3)];
    return JSON.stringify(result) === '[10,11,12]';
}) ? passed++ : failed++;

// ========== FIBONACCI ==========

runTest('fibonacci generates sequence', () => {
    const result = [...fibonacci(8)];
    return JSON.stringify(result) === '[1,1,2,3,5,8,13,21]';
}) ? passed++ : failed++;

runTest('fibonacci with limit', () => {
    const result = [...fibonacci(5)];
    return result.length === 5;
}) ? passed++ : failed++;

// ========== ACCUMULATOR ==========

runTest('accumulator two-way communication', () => {
    const acc = accumulator(0);
    acc.next();          // Start generator
    acc.next(5);         // Add 5
    acc.next(10);        // Add 10
    const result = acc.next(null); // End
    return result.value === 15;
}) ? passed++ : failed++;

runTest('accumulator with initial value', () => {
    const acc = accumulator(100);
    acc.next();
    acc.next(50);
    const result = acc.next(null);
    return result.value === 150;
}) ? passed++ : failed++;

// ========== FLATTEN ==========

runTest('flatten nested arrays', () => {
    const result = [...flatten([1, [2, [3, [4]]]])];
    return JSON.stringify(result) === '[1,2,3,4]';
}) ? passed++ : failed++;

runTest('flatten already flat', () => {
    const result = [...flatten([1, 2, 3])];
    return JSON.stringify(result) === '[1,2,3]';
}) ? passed++ : failed++;

// ========== PAGINATE ==========

runTest('paginate splits into pages', () => {
    const items = [1, 2, 3, 4, 5];
    const pages = [...paginate(items, 2)];
    return pages.length === 3 && 
           pages[0].data.length === 2 &&
           pages[2].data.length === 1;
}) ? passed++ : failed++;

runTest('paginate hasMore flag', () => {
    const pages = [...paginate([1, 2, 3, 4], 2)];
    return pages[0].hasMore === true && pages[1].hasMore === false;
}) ? passed++ : failed++;

// ========== TAKE ==========

runTest('take limits items', () => {
    const result = [...take([1, 2, 3, 4, 5], 3)];
    return JSON.stringify(result) === '[1,2,3]';
}) ? passed++ : failed++;

runTest('take from generator', () => {
    const result = [...take(range(1, 100), 5)];
    return JSON.stringify(result) === '[1,2,3,4,5]';
}) ? passed++ : failed++;

// ========== FILTER ==========

runTest('filter generator', () => {
    const evens = [...filter(range(1, 10), n => n % 2 === 0)];
    return JSON.stringify(evens) === '[2,4,6,8,10]';
}) ? passed++ : failed++;

// ========== MAP ==========

runTest('map generator', () => {
    const doubled = [...map(range(1, 4), n => n * 2)];
    return JSON.stringify(doubled) === '[2,4,6,8]';
}) ? passed++ : failed++;

// ========== ZIP ==========

runTest('zip multiple iterables', () => {
    const result = [...zip([1, 2, 3], ['a', 'b', 'c'])];
    return JSON.stringify(result) === '[[1,"a"],[2,"b"],[3,"c"]]';
}) ? passed++ : failed++;

runTest('zip stops at shortest', () => {
    const result = [...zip([1, 2], ['a', 'b', 'c', 'd'])];
    return result.length === 2;
}) ? passed++ : failed++;

// ========== CHAINING ==========

runTest('chain generators together', () => {
    const result = [...take(filter(map(range(1, 100), n => n * 2), n => n > 10), 3)];
    return JSON.stringify(result) === '[12,14,16]';
}) ? passed++ : failed++;

// ========== RESULTS ==========

console.log('\n========================================');
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('========================================\n');

process.exit(failed > 0 ? 1 : 0);
