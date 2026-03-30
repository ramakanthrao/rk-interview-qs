/**
 * Test Suite for Array.prototype.chunk
 */

require('../src/chunk.js');

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

// ========== BASIC CHUNKING ==========

runTest('Chunk array evenly', () => {
    const result = [1, 2, 3, 4, 5, 6].chunk(2);
    return result.length === 3 &&
           JSON.stringify(result) === '[[1,2],[3,4],[5,6]]';
}) ? passed++ : failed++;

runTest('Chunk with remainder', () => {
    const result = [1, 2, 3, 4, 5].chunk(2);
    return result.length === 3 &&
           JSON.stringify(result) === '[[1,2],[3,4],[5]]';
}) ? passed++ : failed++;

runTest('Chunk size larger than array', () => {
    const result = [1, 2, 3].chunk(5);
    return result.length === 1 &&
           JSON.stringify(result) === '[[1,2,3]]';
}) ? passed++ : failed++;

runTest('Chunk size equals array length', () => {
    const result = [1, 2, 3].chunk(3);
    return result.length === 1 &&
           JSON.stringify(result[0]) === '[1,2,3]';
}) ? passed++ : failed++;

runTest('Chunk size of 1', () => {
    const result = [1, 2, 3].chunk(1);
    return result.length === 3 &&
           JSON.stringify(result) === '[[1],[2],[3]]';
}) ? passed++ : failed++;

// ========== PADDING ==========

runTest('Pad incomplete chunks', () => {
    const result = [1, 2, 3, 4, 5].chunk(3, { pad: 0 });
    return JSON.stringify(result) === '[[1,2,3],[4,5,0]]';
}) ? passed++ : failed++;

runTest('Pad with null', () => {
    const result = [1, 2, 3].chunk(2, { pad: null });
    return JSON.stringify(result) === '[[1,2],[3,null]]';
}) ? passed++ : failed++;

runTest('No padding needed when even', () => {
    const result = [1, 2, 3, 4].chunk(2, { pad: 0 });
    return JSON.stringify(result) === '[[1,2],[3,4]]';
}) ? passed++ : failed++;

// ========== DROP REMAINDER ==========

runTest('Drop incomplete remainder', () => {
    const result = [1, 2, 3, 4, 5].chunk(2, { dropRemainder: true });
    return JSON.stringify(result) === '[[1,2],[3,4]]';
}) ? passed++ : failed++;

runTest('No drop when chunks are complete', () => {
    const result = [1, 2, 3, 4].chunk(2, { dropRemainder: true });
    return JSON.stringify(result) === '[[1,2],[3,4]]';
}) ? passed++ : failed++;

// ========== OVERLAP ==========

runTest('Overlapping chunks', () => {
    const result = [1, 2, 3, 4, 5].chunk(3, { overlap: 1 });
    return JSON.stringify(result) === '[[1,2,3],[3,4,5]]';
}) ? passed++ : failed++;

runTest('Overlapping chunks with remainder', () => {
    const result = [1, 2, 3, 4, 5, 6].chunk(3, { overlap: 1 });
    return result.length === 3 && result[2].includes(5);
}) ? passed++ : failed++;

runTest('Overlap of 2', () => {
    const result = [1, 2, 3, 4, 5, 6, 7].chunk(4, { overlap: 2 });
    return JSON.stringify(result[0]) === '[1,2,3,4]' &&
           JSON.stringify(result[1]) === '[3,4,5,6]';
}) ? passed++ : failed++;

// ========== EDGE CASES ==========

runTest('Empty array returns empty array', () => {
    const result = [].chunk(3);
    return result.length === 0;
}) ? passed++ : failed++;

runTest('Throws on invalid size (0)', () => {
    try {
        [1, 2, 3].chunk(0);
        return false;
    } catch (e) {
        return e instanceof TypeError;
    }
}) ? passed++ : failed++;

runTest('Throws on invalid size (negative)', () => {
    try {
        [1, 2, 3].chunk(-2);
        return false;
    } catch (e) {
        return e instanceof TypeError;
    }
}) ? passed++ : failed++;

runTest('Throws when overlap >= size', () => {
    try {
        [1, 2, 3].chunk(2, { overlap: 2 });
        return false;
    } catch (e) {
        return e instanceof TypeError;
    }
}) ? passed++ : failed++;

// ========== UTILITY METHODS ==========

runTest('getStats returns correct info', () => {
    const result = [1, 2, 3, 4, 5].chunk(2);
    const stats = result.getStats();
    return stats.totalChunks === 3 && 
           stats.fullChunks === 2 &&
           stats.totalElements === 5;
}) ? passed++ : failed++;

runTest('flatten recreates original array', () => {
    const original = [1, 2, 3, 4, 5, 6];
    const result = original.chunk(2).flatten();
    return JSON.stringify(result) === JSON.stringify(original);
}) ? passed++ : failed++;

runTest('mapChunks transforms chunks', () => {
    const result = [1, 2, 3, 4].chunk(2).mapChunks(c => c.reduce((a, b) => a + b));
    return JSON.stringify(result) === '[3,7]';
}) ? passed++ : failed++;

// ========== CHUNK BY ==========

runTest('chunkBy groups consecutive', () => {
    const result = [1, 1, 2, 2, 2, 3].chunkBy(n => n);
    return JSON.stringify(result) === '[[1,1],[2,2,2],[3]]';
}) ? passed++ : failed++;

runTest('chunkBy with predicate function', () => {
    const result = [1, 2, 5, 6, 10, 11].chunkBy(n => Math.floor(n / 5));
    return result.length === 3;
}) ? passed++ : failed++;

// ========== RESULTS ==========

console.log('\n========================================');
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('========================================\n');

process.exit(failed > 0 ? 1 : 0);
