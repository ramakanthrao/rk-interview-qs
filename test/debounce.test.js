/**
 * Test Suite for debounce and throttle
 */

const { debounce, throttle } = require('../src/debounce.js');

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

    // ========== BASIC DEBOUNCE ==========

    (await runTest('Debounce delays execution', async () => {
        let count = 0;
        const fn = debounce(() => { count++; }, 50);
        fn();
        fn();
        fn();
        await delay(20);
        if (count !== 0) return false; // Should not have executed yet
        await delay(50);
        return count === 1; // Should execute once
    })) ? passed++ : failed++;

    (await runTest('Debounce resets timer on each call', async () => {
        let count = 0;
        const fn = debounce(() => { count++; }, 50);
        fn();
        await delay(30);
        fn();
        await delay(30);
        fn();
        await delay(70);
        return count === 1;
    })) ? passed++ : failed++;

    (await runTest('Debounce passes arguments', async () => {
        let received = null;
        const fn = debounce((arg) => { received = arg; }, 20);
        fn('hello');
        await delay(40);
        return received === 'hello';
    })) ? passed++ : failed++;

    (await runTest('Debounce passes last arguments', async () => {
        let received = null;
        const fn = debounce((arg) => { received = arg; }, 30);
        fn('first');
        fn('second');
        fn('third');
        await delay(50);
        return received === 'third';
    })) ? passed++ : failed++;

    // ========== LEADING/TRAILING ==========

    (await runTest('Leading edge execution', async () => {
        let count = 0;
        const fn = debounce(() => { count++; }, 50, { leading: true, trailing: false });
        fn();
        if (count !== 1) return false; // Should execute immediately
        fn();
        fn();
        await delay(70);
        return count === 1; // No trailing execution
    })) ? passed++ : failed++;

    (await runTest('Both leading and trailing', async () => {
        let count = 0;
        const fn = debounce(() => { count++; }, 50, { leading: true, trailing: true });
        fn();
        fn();
        await delay(70);
        return count === 2; // Leading + trailing
    })) ? passed++ : failed++;

    // ========== CANCEL/FLUSH ==========

    (await runTest('Cancel prevents execution', async () => {
        let count = 0;
        const fn = debounce(() => { count++; }, 50);
        fn();
        fn.cancel();
        await delay(70);
        return count === 0;
    })) ? passed++ : failed++;

    (await runTest('Flush executes immediately', async () => {
        let count = 0;
        let received = null;
        const fn = debounce((arg) => { count++; received = arg; }, 100);
        fn('test');
        fn.flush();
        return count === 1 && received === 'test';
    })) ? passed++ : failed++;

    (await runTest('Pending returns correct state', async () => {
        const fn = debounce(() => {}, 50);
        if (fn.pending()) return false;
        fn();
        if (!fn.pending()) return false;
        await delay(70);
        return !fn.pending();
    })) ? passed++ : failed++;

    // ========== MAX WAIT ==========

    (await runTest('MaxWait ensures execution', async () => {
        let count = 0;
        const fn = debounce(() => { count++; }, 50, { maxWait: 80 });
        fn();
        await delay(30);
        fn();
        await delay(30);
        fn();
        await delay(30);
        return count >= 1; // Should have executed due to maxWait
    })) ? passed++ : failed++;

    // ========== THROTTLE ==========

    (await runTest('Throttle limits execution rate', async () => {
        let count = 0;
        const fn = throttle(() => { count++; }, 50);
        fn(); // Executes immediately (leading)
        fn();
        fn();
        await delay(70);
        return count === 2; // Leading + trailing
    })) ? passed++ : failed++;

    // ========== STATS ==========

    (await runTest('getStats tracks calls and executions', async () => {
        const fn = debounce(() => {}, 20);
        fn();
        fn();
        fn();
        await delay(40);
        const stats = fn.getStats();
        return stats.calls === 3 && stats.executions === 1;
    })) ? passed++ : failed++;

    (await runTest('getStats tracks cancellations', async () => {
        const fn = debounce(() => {}, 50);
        fn();
        fn.cancel();
        return fn.getStats().cancellations === 1;
    })) ? passed++ : failed++;

    // ========== ERROR HANDLING ==========

    (await runTest('Throws on non-function', async () => {
        try {
            debounce('not a function', 100);
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
