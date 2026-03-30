/**
 * Test Suite for Array.prototype.groupBy
 */

require('../src/groupBy.js');

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

// ========== BASIC GROUPING ==========

runTest('Group by string property', () => {
    const users = [
        { name: 'Alice', role: 'admin' },
        { name: 'Bob', role: 'user' },
        { name: 'Charlie', role: 'admin' }
    ];
    const result = users.groupBy('role');
    return result.admin.length === 2 && result.user.length === 1;
}) ? passed++ : failed++;

runTest('Group by function', () => {
    const numbers = [1, 2, 3, 4, 5, 6];
    const result = numbers.groupBy(n => n % 2 === 0 ? 'even' : 'odd');
    return result.even.length === 3 && result.odd.length === 3;
}) ? passed++ : failed++;

runTest('Group by nested property', () => {
    const items = [
        { data: { type: 'A' } },
        { data: { type: 'B' } },
        { data: { type: 'A' } }
    ];
    const result = items.groupBy('data.type');
    return result.A.length === 2 && result.B.length === 1;
}) ? passed++ : failed++;

runTest('Group preserves order within groups', () => {
    const items = [
        { id: 1, type: 'x' },
        { id: 2, type: 'x' },
        { id: 3, type: 'x' }
    ];
    const result = items.groupBy('type');
    return result.x[0].id === 1 && result.x[1].id === 2 && result.x[2].id === 3;
}) ? passed++ : failed++;

// ========== EDGE CASES ==========

runTest('Empty array returns empty object', () => {
    const result = [].groupBy('key');
    return Object.keys(result).filter(k => Array.isArray(result[k])).length === 0;
}) ? passed++ : failed++;

runTest('Undefined values grouped as "undefined"', () => {
    const items = [
        { name: 'a' },
        { name: 'b', category: 'X' },
        { name: 'c' }
    ];
    const result = items.groupBy('category');
    return result.undefined.length === 2 && result.X.length === 1;
}) ? passed++ : failed++;

runTest('Numeric keys converted to string', () => {
    const items = [
        { age: 20 },
        { age: 30 },
        { age: 20 }
    ];
    const result = items.groupBy('age');
    return result['20'].length === 2 && result['30'].length === 1;
}) ? passed++ : failed++;

runTest('Boolean keys converted to string', () => {
    const items = [{ active: true }, { active: false }, { active: true }];
    const result = items.groupBy('active');
    return result['true'].length === 2 && result['false'].length === 1;
}) ? passed++ : failed++;

// ========== FUNCTION RECEIVES INDEX ==========

runTest('Function receives index as second argument', () => {
    const items = ['a', 'b', 'c', 'd'];
    const result = items.groupBy((_, index) => index < 2 ? 'first' : 'second');
    return result.first.length === 2 && result.second.length === 2;
}) ? passed++ : failed++;

// ========== UTILITY METHODS ==========

runTest('getKeys() returns group keys', () => {
    const result = [1, 2, 3].groupBy(n => n > 2 ? 'big' : 'small');
    const keys = result.getKeys();
    return keys.includes('big') && keys.includes('small') && keys.length === 2;
}) ? passed++ : failed++;

runTest('getCount() returns counts per group', () => {
    const users = [
        { role: 'admin' },
        { role: 'user' },
        { role: 'user' }
    ];
    const counts = users.groupBy('role').getCount();
    return counts.admin === 1 && counts.user === 2;
}) ? passed++ : failed++;

runTest('mapGroups() transforms each group', () => {
    const numbers = [1, 2, 3, 4, 5];
    const result = numbers.groupBy(n => n % 2 === 0 ? 'even' : 'odd');
    const sums = result.mapGroups(group => group.reduce((a, b) => a + b, 0));
    return sums.odd === 9 && sums.even === 6;
}) ? passed++ : failed++;

runTest('filterGroups() filters groups by predicate', () => {
    const items = [
        { type: 'A' }, { type: 'A' }, { type: 'A' },
        { type: 'B' }
    ];
    const result = items.groupBy('type');
    const filtered = result.filterGroups(group => group.length > 1);
    return filtered.A !== undefined && filtered.B === undefined;
}) ? passed++ : failed++;

runTest('toMap() converts to Map', () => {
    const result = [1, 2, 3].groupBy(n => n > 1 ? 'big' : 'small');
    const map = result.toMap();
    return map instanceof Map && map.has('big') && map.has('small');
}) ? passed++ : failed++;

// ========== ERROR HANDLING ==========

runTest('Throws without key or function', () => {
    try {
        [1, 2, 3].groupBy();
        return false;
    } catch (e) {
        return e instanceof TypeError;
    }
}) ? passed++ : failed++;

// ========== RESULTS ==========

console.log('\n========================================');
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('========================================\n');

process.exit(failed > 0 ? 1 : 0);
