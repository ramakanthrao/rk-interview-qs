/**
 * Test Suite for Promise utilities
 */

const {
    promiseAll,
    promiseAllSettled,
    promiseRace,
    promiseAny,
    promiseMap,
    promiseTimeout,
    promiseRetry
} = require('../src/promiseAll.js');

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

function delay(ms, value) {
    return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

function delayReject(ms, error) {
    return new Promise((_, reject) => setTimeout(() => reject(new Error(error)), ms));
}

async function runAllTests() {
    let passed = 0;
    let failed = 0;

    // ========== PROMISE ALL ==========

    (await runTest('promiseAll resolves all', async () => {
        const results = await promiseAll([
            Promise.resolve(1),
            Promise.resolve(2),
            Promise.resolve(3)
        ]);
        return JSON.stringify(results) === '[1,2,3]';
    })) ? passed++ : failed++;

    (await runTest('promiseAll maintains order', async () => {
        const results = await promiseAll([
            delay(30, 'first'),
            delay(10, 'second'),
            delay(20, 'third')
        ]);
        return results[0] === 'first' && results[1] === 'second' && results[2] === 'third';
    })) ? passed++ : failed++;

    (await runTest('promiseAll rejects on first error', async () => {
        try {
            await promiseAll([
                Promise.resolve(1),
                Promise.reject(new Error('fail')),
                Promise.resolve(3)
            ]);
            return false;
        } catch (e) {
            return e.message === 'fail';
        }
    })) ? passed++ : failed++;

    (await runTest('promiseAll empty array resolves immediately', async () => {
        const results = await promiseAll([]);
        return Array.isArray(results) && results.length === 0;
    })) ? passed++ : failed++;

    (await runTest('promiseAll handles non-promise values', async () => {
        const results = await promiseAll([1, 'hello', true]);
        return results[0] === 1 && results[1] === 'hello' && results[2] === true;
    })) ? passed++ : failed++;

    (await runTest('promiseAll progress callback', async () => {
        let progressCalls = 0;
        await promiseAll(
            [delay(10, 1), delay(20, 2), delay(30, 3)],
            { onProgress: () => progressCalls++ }
        );
        return progressCalls === 3;
    })) ? passed++ : failed++;

    // ========== PROMISE ALL SETTLED ==========

    (await runTest('promiseAllSettled returns all statuses', async () => {
        const results = await promiseAllSettled([
            Promise.resolve('success'),
            Promise.reject(new Error('error'))
        ]);
        return results[0].status === 'fulfilled' && 
               results[0].value === 'success' &&
               results[1].status === 'rejected' &&
               results[1].reason.message === 'error';
    })) ? passed++ : failed++;

    (await runTest('promiseAllSettled never rejects', async () => {
        const results = await promiseAllSettled([
            Promise.reject(new Error('a')),
            Promise.reject(new Error('b'))
        ]);
        return results.length === 2 && results.every(r => r.status === 'rejected');
    })) ? passed++ : failed++;

    // ========== PROMISE RACE ==========

    (await runTest('promiseRace returns first to resolve', async () => {
        const result = await promiseRace([
            delay(30, 'slow'),
            delay(10, 'fast'),
            delay(20, 'medium')
        ]);
        return result === 'fast';
    })) ? passed++ : failed++;

    (await runTest('promiseRace rejects if first rejects', async () => {
        try {
            await promiseRace([
                delay(30, 'slow'),
                delayReject(10, 'fast error')
            ]);
            return false;
        } catch (e) {
            return e.message === 'fast error';
        }
    })) ? passed++ : failed++;

    // ========== PROMISE ANY ==========

    (await runTest('promiseAny returns first fulfilled', async () => {
        const result = await promiseAny([
            delayReject(10, 'error1'),
            delay(20, 'success'),
            delayReject(15, 'error2')
        ]);
        return result === 'success';
    })) ? passed++ : failed++;

    (await runTest('promiseAny rejects if all reject', async () => {
        try {
            await promiseAny([
                Promise.reject(new Error('a')),
                Promise.reject(new Error('b'))
            ]);
            return false;
        } catch (e) {
            return e instanceof AggregateError;
        }
    })) ? passed++ : failed++;

    // ========== PROMISE MAP ==========

    (await runTest('promiseMap transforms items', async () => {
        const results = await promiseMap(
            [1, 2, 3],
            async (x) => x * 2
        );
        return JSON.stringify(results) === '[2,4,6]';
    })) ? passed++ : failed++;

    (await runTest('promiseMap respects concurrency', async () => {
        let maxConcurrent = 0;
        let current = 0;
        
        await promiseMap(
            [1, 2, 3, 4, 5],
            async (x) => {
                current++;
                maxConcurrent = Math.max(maxConcurrent, current);
                await delay(20);
                current--;
                return x;
            },
            { concurrency: 2 }
        );
        
        return maxConcurrent <= 2;
    })) ? passed++ : failed++;

    (await runTest('promiseMap maintains order', async () => {
        const results = await promiseMap(
            [3, 1, 2],
            async (x) => {
                await delay(x * 10);
                return x;
            },
            { concurrency: 3 }
        );
        return JSON.stringify(results) === '[3,1,2]';
    })) ? passed++ : failed++;

    // ========== PROMISE TIMEOUT ==========

    (await runTest('promiseTimeout resolves if fast enough', async () => {
        const result = await promiseTimeout(delay(10, 'ok'), 100);
        return result === 'ok';
    })) ? passed++ : failed++;

    (await runTest('promiseTimeout rejects if too slow', async () => {
        try {
            await promiseTimeout(delay(100, 'ok'), 10, 'too slow');
            return false;
        } catch (e) {
            return e.message === 'too slow';
        }
    })) ? passed++ : failed++;

    // ========== PROMISE RETRY ==========

    (await runTest('promiseRetry succeeds on first try', async () => {
        let attempts = 0;
        const result = await promiseRetry(async () => {
            attempts++;
            return 'success';
        });
        return result === 'success' && attempts === 1;
    })) ? passed++ : failed++;

    (await runTest('promiseRetry retries on failure', async () => {
        let attempts = 0;
        const result = await promiseRetry(async () => {
            attempts++;
            if (attempts < 3) throw new Error('fail');
            return 'success';
        }, { retries: 5, delay: 10 });
        return result === 'success' && attempts === 3;
    })) ? passed++ : failed++;

    (await runTest('promiseRetry gives up after max retries', async () => {
        try {
            await promiseRetry(async () => {
                throw new Error('always fail');
            }, { retries: 2, delay: 10 });
            return false;
        } catch (e) {
            return e.message === 'always fail';
        }
    })) ? passed++ : failed++;

    // ========== ERROR HANDLING ==========

    (await runTest('Throws on non-array', async () => {
        try {
            await promiseAll('not an array');
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
