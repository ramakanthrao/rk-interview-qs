/**
 * Test Suite for memoize
 */

const { memoize, memoizeAsync } = require('../src/memoize.js');

// ============ TEST RUNNER ============

function runTest(testName, testFn) {
    return new Promise(async (resolve) => {
        try {
            const result = await testFn();
            console.log(`\n${result ? '✓' : '✗'} ${testName}`);
            if (!result) console.log('  *** FAILED ***');
            resolve(result);
        } catch (e) {
            console.log(`\n✗ ${testName}`);
            console.log('  Error:', e.message);
            resolve(false);
        }
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runAllTests() {
    let passed = 0;
    let failed = 0;

    // ========== BASIC MEMOIZATION ==========

    (await runTest('Caches function result', async () => {
        let callCount = 0;
        const fn = memoize((x) => { callCount++; return x * 2; });
        fn(5);
        fn(5);
        fn(5);
        return callCount === 1 && fn(5) === 10;
    })) ? passed++ : failed++;

    (await runTest('Different args = different cache entries', async () => {
        let callCount = 0;
        const fn = memoize((x) => { callCount++; return x * 2; });
        fn(1);
        fn(2);
        fn(3);
        return callCount === 3;
    })) ? passed++ : failed++;

    (await runTest('Multiple arguments', async () => {
        let callCount = 0;
        const fn = memoize((a, b) => { callCount++; return a + b; });
        fn(1, 2);
        fn(1, 2);
        fn(2, 1); // Different order = different args
        return callCount === 2 && fn(1, 2) === 3;
    })) ? passed++ : failed++;

    (await runTest('Object arguments', async () => {
        let callCount = 0;
        const fn = memoize((obj) => { callCount++; return obj.x + obj.y; });
        fn({ x: 1, y: 2 });
        fn({ x: 1, y: 2 });
        return callCount === 1;
    })) ? passed++ : failed++;

    // ========== LRU CACHE ==========

    (await runTest('maxSize limits cache size', async () => {
        const fn = memoize((x) => x, { maxSize: 3 });
        fn(1); fn(2); fn(3);
        if (fn.cache.size() !== 3) return false;
        fn(4); // Should evict oldest
        return fn.cache.size() === 3 && !fn.cache.has('1');
    })) ? passed++ : failed++;

    (await runTest('LRU eviction order', async () => {
        let callCount = 0;
        const fn = memoize((x) => { callCount++; return x; }, { maxSize: 2 });
        fn(1); // [1]
        fn(2); // [1, 2]
        fn(1); // [2, 1] - accessed, moves to end
        fn(3); // [1, 3] - 2 evicted (oldest)
        fn(2); // Should re-compute (was evicted)
        return callCount === 4;
    })) ? passed++ : failed++;

    // ========== TTL ==========

    (await runTest('TTL expires cache entries', async () => {
        let callCount = 0;
        const fn = memoize((x) => { callCount++; return x; }, { ttl: 50 });
        fn('test');
        await delay(30);
        fn('test'); // Still valid
        await delay(40);
        fn('test'); // Expired, recompute
        return callCount === 2;
    })) ? passed++ : failed++;

    // ========== CUSTOM RESOLVER ==========

    (await runTest('Custom resolver for cache key', async () => {
        let callCount = 0;
        const fn = memoize(
            (user) => { callCount++; return user.name.toUpperCase(); },
            { resolver: (user) => user.id }
        );
        fn({ id: 1, name: 'Alice' });
        fn({ id: 1, name: 'alice' }); // Same id, should cache
        fn({ id: 2, name: 'Bob' });   // Different id
        return callCount === 2;
    })) ? passed++ : failed++;

    // ========== CACHE CONTROL ==========

    (await runTest('cache.clear() clears all', async () => {
        const fn = memoize((x) => x);
        fn(1); fn(2); fn(3);
        fn.cache.clear();
        return fn.cache.size() === 0;
    })) ? passed++ : failed++;

    (await runTest('cache.delete() removes entry', async () => {
        let callCount = 0;
        const fn = memoize((x) => { callCount++; return x; });
        fn(5);
        fn.cache.delete('5');
        fn(5);
        return callCount === 2;
    })) ? passed++ : failed++;

    // ========== STATS ==========

    (await runTest('getStats tracks hits and misses', async () => {
        const fn = memoize((x) => x);
        fn(1); // miss
        fn(2); // miss
        fn(1); // hit
        fn(1); // hit
        const stats = fn.getStats();
        return stats.hits === 2 && stats.misses === 2;
    })) ? passed++ : failed++;

    (await runTest('getStats calculates hit rate', async () => {
        const fn = memoize((x) => x);
        fn(1); fn(1); fn(1); fn(1); // 1 miss, 3 hits
        const stats = fn.getStats();
        return stats.hitRate === '75.00%';
    })) ? passed++ : failed++;

    (await runTest('getStats tracks evictions', async () => {
        const fn = memoize((x) => x, { maxSize: 2 });
        fn(1); fn(2); fn(3); fn(4);
        return fn.getStats().evictions === 2;
    })) ? passed++ : failed++;

    // ========== ASYNC MEMOIZE ==========

    (await runTest('memoizeAsync caches async results', async () => {
        let callCount = 0;
        const fn = memoizeAsync(async (x) => {
            callCount++;
            await delay(10);
            return x * 2;
        });
        await fn(5);
        await fn(5);
        return callCount === 1;
    })) ? passed++ : failed++;

    // ========== ERROR HANDLING ==========

    (await runTest('Throws on non-function', async () => {
        try {
            memoize('not a function');
            return false;
        } catch (e) {
            return e instanceof TypeError;
        }
    })) ? passed++ : failed++;

    // ========== RESULTS ==========

    console.log('\n========================================');
    console.log(`RESULTS: ${passed} passed, ${failed} failed`);
    console.log('========================================\n');

    process.exit(failed > 0 ? 1 : 0);
}

runAllTests();
