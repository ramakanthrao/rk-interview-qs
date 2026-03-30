/**
 * Test Suite for Array.prototype.deepFlatten
 */

require('../src/flatten.js');

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

// ========== BASIC FLATTENING ==========

runTest('Flatten one level', () => {
    const result = [1, [2, 3], 4].deepFlatten();
    return JSON.stringify(result) === '[1,2,3,4]';
}) ? passed++ : failed++;

runTest('Flatten deeply nested', () => {
    const result = [1, [2, [3, [4, [5]]]]].deepFlatten();
    return JSON.stringify(result) === '[1,2,3,4,5]';
}) ? passed++ : failed++;

runTest('Already flat array', () => {
    const result = [1, 2, 3, 4, 5].deepFlatten();
    return JSON.stringify(result) === '[1,2,3,4,5]';
}) ? passed++ : failed++;

runTest('Mixed types preserved', () => {
    const result = [1, 'a', [true, [null, undefined]]].deepFlatten();
    return JSON.stringify(result) === '[1,"a",true,null,null]';
}) ? passed++ : failed++;

runTest('Objects not flattened', () => {
    const obj = { a: 1 };
    const result = [1, [obj, 2]].deepFlatten();
    return result.length === 3 && result[1] === obj;
}) ? passed++ : failed++;

// ========== DEPTH CONTROL ==========

runTest('Depth 1 flattens one level', () => {
    const result = [1, [2, [3, [4]]]].deepFlatten(1);
    return JSON.stringify(result) === '[1,2,[3,[4]]]';
}) ? passed++ : failed++;

runTest('Depth 2 flattens two levels', () => {
    const result = [1, [2, [3, [4]]]].deepFlatten(2);
    return JSON.stringify(result) === '[1,2,3,[4]]';
}) ? passed++ : failed++;

runTest('Depth 0 returns same structure', () => {
    const result = [[1, 2], [3, 4]].deepFlatten(0);
    return JSON.stringify(result) === '[[1,2],[3,4]]';
}) ? passed++ : failed++;

runTest('Depth Infinity flattens completely', () => {
    const result = [[[[[1]]]]].deepFlatten(Infinity);
    return JSON.stringify(result) === '[1]';
}) ? passed++ : failed++;

// ========== CIRCULAR REFERENCES ==========

runTest('Circular reference skipped by default', () => {
    const arr = [1, 2];
    arr.push(arr);
    const result = arr.deepFlatten();
    return JSON.stringify(result) === '[1,2]';
}) ? passed++ : failed++;

runTest('Circular reference throws on option', () => {
    const arr = [1, 2];
    arr.push(arr);
    try {
        arr.deepFlatten(Infinity, { onCircular: 'throw' });
        return false;
    } catch (e) {
        return e.message === 'Circular reference detected';
    }
}) ? passed++ : failed++;

runTest('Circular reference marked on option', () => {
    const arr = [1, 2];
    arr.push(arr);
    const result = arr.deepFlatten(Infinity, { onCircular: 'mark' });
    return result.includes('[Circular]');
}) ? passed++ : failed++;

// ========== EDGE CASES ==========

runTest('Empty array returns empty array', () => {
    const result = [].deepFlatten();
    return result.length === 0;
}) ? passed++ : failed++;

runTest('Empty nested arrays', () => {
    const result = [[], [[]], [[[]]]].deepFlatten();
    return result.length === 0;
}) ? passed++ : failed++;

runTest('Single element nested deeply', () => {
    const result = [[[[['x']]]]].deepFlatten();
    return JSON.stringify(result) === '["x"]';
}) ? passed++ : failed++;

// ========== STATS ==========

runTest('getStats tracks depth', () => {
    const result = [1, [2, [3, [4]]]].deepFlatten();
    return result.getStats().maxDepthReached === 3;
}) ? passed++ : failed++;

runTest('getStats counts elements', () => {
    const result = [1, [2, 3], [4, [5, 6]]].deepFlatten();
    return result.getStats().totalElements === 6;
}) ? passed++ : failed++;

runTest('getStats counts circular refs', () => {
    const arr = [1];
    arr.push(arr);
    arr.push(arr);
    const result = arr.deepFlatten();
    return result.getStats().circularRefs === 2;
}) ? passed++ : failed++;

// ========== FLATMAP DEEP ==========

runTest('flatMapDeep with transformation', () => {
    const result = [1, [2, 3]].flatMapDeep(x => x * 2);
    return JSON.stringify(result) === '[2,4,6]';
}) ? passed++ : failed++;

runTest('flatMapDeep with array-returning callback', () => {
    const result = [1, 2, 3].flatMapDeep(x => [x, x * 2]);
    return JSON.stringify(result) === '[1,2,2,4,3,6]';
}) ? passed++ : failed++;

// ========== RESULTS ==========

console.log('\n========================================');
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('========================================\n');

process.exit(failed > 0 ? 1 : 0);
