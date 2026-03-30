/**
 * Test Suite for EventEmitter
 */

const EventEmitter = require('../src/EventEmitter.js');

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

// ========== BASIC ON/EMIT ==========

runTest('on() registers listener and emit() calls it', () => {
    const emitter = new EventEmitter();
    let called = false;
    emitter.on('test', () => { called = true; });
    emitter.emit('test');
    return called === true;
}) ? passed++ : failed++;

runTest('emit() passes arguments to listener', () => {
    const emitter = new EventEmitter();
    let received = null;
    emitter.on('data', (arg) => { received = arg; });
    emitter.emit('data', 42);
    return received === 42;
}) ? passed++ : failed++;

runTest('emit() passes multiple arguments', () => {
    const emitter = new EventEmitter();
    let args = [];
    emitter.on('multi', (a, b, c) => { args = [a, b, c]; });
    emitter.emit('multi', 1, 2, 3);
    return args[0] === 1 && args[1] === 2 && args[2] === 3;
}) ? passed++ : failed++;

runTest('Multiple listeners for same event', () => {
    const emitter = new EventEmitter();
    let count = 0;
    emitter.on('inc', () => { count++; });
    emitter.on('inc', () => { count++; });
    emitter.emit('inc');
    return count === 2;
}) ? passed++ : failed++;

// ========== ONCE ==========

runTest('once() listener called only once', () => {
    const emitter = new EventEmitter();
    let count = 0;
    emitter.once('single', () => { count++; });
    emitter.emit('single');
    emitter.emit('single');
    emitter.emit('single');
    return count === 1;
}) ? passed++ : failed++;

runTest('once() and on() can coexist', () => {
    const emitter = new EventEmitter();
    let onceCount = 0;
    let onCount = 0;
    emitter.once('mixed', () => { onceCount++; });
    emitter.on('mixed', () => { onCount++; });
    emitter.emit('mixed');
    emitter.emit('mixed');
    return onceCount === 1 && onCount === 2;
}) ? passed++ : failed++;

// ========== OFF ==========

runTest('off() removes listener', () => {
    const emitter = new EventEmitter();
    let count = 0;
    const listener = () => { count++; };
    emitter.on('test', listener);
    emitter.emit('test');
    emitter.off('test', listener);
    emitter.emit('test');
    return count === 1;
}) ? passed++ : failed++;

runTest('off() only removes specified listener', () => {
    const emitter = new EventEmitter();
    let count1 = 0, count2 = 0;
    const l1 = () => { count1++; };
    const l2 = () => { count2++; };
    emitter.on('test', l1);
    emitter.on('test', l2);
    emitter.off('test', l1);
    emitter.emit('test');
    return count1 === 0 && count2 === 1;
}) ? passed++ : failed++;

runTest('removeAllListeners() removes all', () => {
    const emitter = new EventEmitter();
    let count = 0;
    emitter.on('a', () => { count++; });
    emitter.on('b', () => { count++; });
    emitter.removeAllListeners();
    emitter.emit('a');
    emitter.emit('b');
    return count === 0;
}) ? passed++ : failed++;

// ========== WILDCARD ==========

runTest('Wildcard listener receives all events', () => {
    const emitter = new EventEmitter();
    let events = [];
    emitter.on('*', (eventName, data) => { events.push(eventName); });
    emitter.emit('foo', 1);
    emitter.emit('bar', 2);
    return events.includes('foo') && events.includes('bar');
}) ? passed++ : failed++;

// ========== CHAINING ==========

runTest('Methods return this for chaining', () => {
    const emitter = new EventEmitter();
    let result = 0;
    emitter
        .on('a', () => { result++; })
        .on('b', () => { result++; })
        .emit('a')
        .emit('b');
    return result === 2;
}) ? passed++ : failed++;

// ========== UTILITIES ==========

runTest('listenerCount() returns correct count', () => {
    const emitter = new EventEmitter();
    emitter.on('test', () => {});
    emitter.on('test', () => {});
    emitter.once('test', () => {});
    return emitter.listenerCount('test') === 3;
}) ? passed++ : failed++;

runTest('eventNames() returns registered events', () => {
    const emitter = new EventEmitter();
    emitter.on('foo', () => {});
    emitter.on('bar', () => {});
    const names = emitter.eventNames();
    return names.includes('foo') && names.includes('bar') && names.length === 2;
}) ? passed++ : failed++;

// ========== STATS ==========

runTest('getStats() tracks emits', () => {
    const emitter = new EventEmitter();
    emitter.on('test', () => {});
    emitter.emit('test');
    emitter.emit('test');
    return emitter.getStats().totalEmits === 2;
}) ? passed++ : failed++;

// ========== ERROR HANDLING ==========

runTest('Throws on non-function listener', () => {
    const emitter = new EventEmitter();
    try {
        emitter.on('test', 'not a function');
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
