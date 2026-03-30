/**
 * Test Suite for curry and related functions
 */

const { curry, partial, partialRight, compose, pipe, _ } = require('../src/curry.js');

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

// ========== BASIC CURRY ==========

runTest('Curry with all args at once', () => {
    const add = curry((a, b, c) => a + b + c);
    return add(1, 2, 3) === 6;
}) ? passed++ : failed++;

runTest('Curry one arg at a time', () => {
    const add = curry((a, b, c) => a + b + c);
    return add(1)(2)(3) === 6;
}) ? passed++ : failed++;

runTest('Curry with mixed application', () => {
    const add = curry((a, b, c) => a + b + c);
    return add(1, 2)(3) === 6 && add(1)(2, 3) === 6;
}) ? passed++ : failed++;

runTest('Curry preserves function behavior', () => {
    const greet = curry((greeting, name) => `${greeting}, ${name}!`);
    return greet('Hello')('World') === 'Hello, World!';
}) ? passed++ : failed++;

// ========== PLACEHOLDER ==========

runTest('Placeholder in first position', () => {
    const subtract = curry((a, b) => a - b);
    const subtractFrom10 = subtract(_, 10);
    return subtractFrom10(15) === 5; // 15 - 10
}) ? passed++ : failed++;

runTest('Placeholder in middle', () => {
    const fn = curry((a, b, c) => a * b + c);
    const f = fn(2, _, 5);
    return f(3) === 11; // 2 * 3 + 5
}) ? passed++ : failed++;

runTest('Multiple placeholders', () => {
    const fn = curry((a, b, c) => `${a}-${b}-${c}`);
    const f = fn(_, 'B', _);
    return f('A', 'C') === 'A-B-C';
}) ? passed++ : failed++;

// ========== ARITY ==========

runTest('Custom arity', () => {
    const fn = curry((...args) => args.reduce((a, b) => a + b, 0), { arity: 3 });
    return fn(1)(2)(3) === 6;
}) ? passed++ : failed++;

runTest('Zero arity function', () => {
    const fn = curry(() => 42, { arity: 0 });
    return fn() === 42;
}) ? passed++ : failed++;

// ========== STATS ==========

runTest('getStats tracks applications', () => {
    const add = curry((a, b) => a + b);
    add(1, 2);
    add(3)(4);
    const stats = add.getStats();
    return stats.applications === 2;
}) ? passed++ : failed++;

runTest('getStats tracks partial applications', () => {
    const add = curry((a, b, c) => a + b + c);
    add(1);        // partial
    add(1)(2);     // partial
    add(1)(2)(3);  // will have partials before final
    return add.getStats().partialApplications > 0;
}) ? passed++ : failed++;

// ========== UNCURRY ==========

runTest('uncurry returns original function', () => {
    const original = (a, b) => a + b;
    const curried = curry(original);
    return curried.uncurry() === original;
}) ? passed++ : failed++;

// ========== PARTIAL ==========

runTest('partial binds left arguments', () => {
    const greet = (greeting, name) => `${greeting}, ${name}`;
    const sayHello = partial(greet, 'Hello');
    return sayHello('World') === 'Hello, World';
}) ? passed++ : failed++;

runTest('partial with placeholder', () => {
    const subtract = (a, b) => a - b;
    const subtractFrom = partial(subtract, _, 5);
    return subtractFrom(10) === 5; // 10 - 5
}) ? passed++ : failed++;

// ========== PARTIAL RIGHT ==========

runTest('partialRight binds right arguments', () => {
    const greet = (greeting, name) => `${greeting}, ${name}`;
    const greetWorld = partialRight(greet, 'World');
    return greetWorld('Hello') === 'Hello, World';
}) ? passed++ : failed++;

// ========== COMPOSE ==========

runTest('compose executes right to left', () => {
    const add1 = x => x + 1;
    const double = x => x * 2;
    const composed = compose(add1, double);
    return composed(5) === 11; // double(5)=10, add1(10)=11
}) ? passed++ : failed++;

runTest('compose with multiple functions', () => {
    const add1 = x => x + 1;
    const double = x => x * 2;
    const square = x => x * x;
    const composed = compose(add1, double, square);
    return composed(3) === 19; // square(3)=9, double(9)=18, add1(18)=19
}) ? passed++ : failed++;

runTest('compose with no functions returns identity', () => {
    const identity = compose();
    return identity(42) === 42;
}) ? passed++ : failed++;

// ========== PIPE ==========

runTest('pipe executes left to right', () => {
    const add1 = x => x + 1;
    const double = x => x * 2;
    const piped = pipe(add1, double);
    return piped(5) === 12; // add1(5)=6, double(6)=12
}) ? passed++ : failed++;

// ========== ERROR HANDLING ==========

runTest('Throws on non-function', () => {
    try {
        curry('not a function');
        return false;
    } catch (e) {
        return e instanceof TypeError;
    }
}) ? passed++ : failed++;

runTest('compose throws on non-function', () => {
    try {
        compose(x => x, 'not a function');
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
