/**
 * Test Suite for Array.prototype.toSingleType
 */

// Import the function (adds to Array.prototype)
require('./toSingleType.js');

// ============ TEST RUNNER ============

function runTest(testName, input, expected, expectedType) {
    const actual = input.toSingleType();
    const actualValues = [...actual]; // Convert to plain array for comparison
    const actualType = actual.getType();
    
    const valuesMatch = JSON.stringify(actualValues) === JSON.stringify(expected);
    const typeMatch = actualType === expectedType;
    const passed = valuesMatch && typeMatch;
    
    console.log(`\n${passed ? '✓' : '✗'} ${testName}`);
    console.log('  Input:         ', JSON.stringify(input));
    console.log('  Expected:      ', JSON.stringify(expected), `(${expectedType})`);
    console.log('  Actual:        ', JSON.stringify(actualValues), `(${actualType})`);
    if (!passed) console.log('  *** FAILED ***');
    
    return passed;
}

let passed = 0;
let failed = 0;

// ========== ARRAY CASES (array present → all become arrays) ==========

runTest('Array + number + boolean',
    [11, [1, 2], true],
    [[11], [1, 2], [1]],
    'array'
) ? passed++ : failed++;

runTest('Array + object + number',
    [11, [1, 2], {value: "hey"}],
    [[11], [1, 2], [{value: "hey"}]],
    'array'
) ? passed++ : failed++;

runTest('Multiple arrays + string',
    [[1], [2, 3], "hello"],
    [[1], [2, 3], ["hello"]],
    'array'
) ? passed++ : failed++;

runTest('Array + boolean + string',
    [true, [5, 6], "test"],
    [[1], [5, 6], ["test"]],
    'array'
) ? passed++ : failed++;

// ========== OBJECT CASES (object present, no array → all become objects) ==========

runTest('Object + number + boolean + string',
    [1, {value: 11}, false, "Hello"],
    [{value: "1"}, {value: 11}, {value: "false"}, {value: "hello"}],
    'object'
) ? passed++ : failed++;

runTest('Multiple objects + number',
    [{a: 1}, {b: 2}, 99],
    [{a: 1}, {a: 2}, {a: "99"}],
    'object'
) ? passed++ : failed++;

runTest('Object + boolean only',
    [{x: "test"}, true, false],
    [{x: "test"}, {x: "true"}, {x: "false"}],
    'object'
) ? passed++ : failed++;

// ========== BOOLEAN CASES (Yes/No + boolean, no number > 1) ==========

runTest('Yes/No + boolean (no number > 1)',
    [0, "No", true],
    [false, false, true],
    'boolean'
) ? passed++ : failed++;

runTest('Yes/No + boolean + 0 and 1 only',
    [1, "No", 0, "yes", true],
    [true, false, false, true, true],
    'boolean'
) ? passed++ : failed++;

runTest('Boolean + number 0/1 only',
    [0, 1, true],
    [false, true, true],
    'boolean'
) ? passed++ : failed++;

runTest('Boolean + Yes string',
    [true, "Yes", false],
    [true, true, false],
    'boolean'
) ? passed++ : failed++;

runTest('All booleans',
    [true, false, true, false],
    [true, false, true, false],
    'boolean'
) ? passed++ : failed++;

runTest('Boolean + 0 only',
    [true, 0, false],
    [true, false, false],
    'boolean'
) ? passed++ : failed++;

// ========== NUMBER CASES (has number > 1) ==========

runTest('Number > 1 + boolean',
    [0, 11, true, 0, false],
    [0, 11, 1, 0, 0],
    'number'
) ? passed++ : failed++;

runTest('Number > 1 + Yes/No + boolean',
    [5, "Yes", true, "No", false],
    [5, 0, 1, 0, 0],
    'number'
) ? passed++ : failed++;

runTest('All numbers',
    [1, 2, 3, 100],
    [1, 2, 3, 100],
    'number'
) ? passed++ : failed++;

runTest('Numbers + string (has > 1)',
    [10, 20, "hello"],
    [10, 20, 0],
    'number'
) ? passed++ : failed++;

runTest('Large number + boolean',
    [100, true, false],
    [100, 1, 0],
    'number'
) ? passed++ : failed++;

runTest('Number > 1 + multiple booleans',
    [2, true, false, true],
    [2, 1, 0, 1],
    'number'
) ? passed++ : failed++;

// ========== STRING CASES (only strings, no boolean/number) ==========

runTest('Only strings',
    ["hello", "world", "test"],
    ["hello", "world", "test"],
    'string'
) ? passed++ : failed++;

runTest('Strings with special chars',
    ["foo", "bar", "123abc"],
    ["foo", "bar", "123abc"],
    'string'
) ? passed++ : failed++;

runTest('Single string',
    ["only"],
    ["only"],
    'string'
) ? passed++ : failed++;

// ========== EDGE CASES ==========

runTest('Empty array',
    [],
    [],
    'undefined'
) ? passed++ : failed++;

runTest('Single boolean true',
    [true],
    [true],
    'boolean'
) ? passed++ : failed++;

runTest('Single boolean false',
    [false],
    [false],
    'boolean'
) ? passed++ : failed++;

runTest('Single number',
    [42],
    [42],
    'number'
) ? passed++ : failed++;

runTest('Single number 0',
    [0],
    [0],
    'number'
) ? passed++ : failed++;

runTest('Single number 1',
    [1],
    [1],
    'number'
) ? passed++ : failed++;

runTest('Nested array',
    [[1, 2, 3]],
    [[1, 2, 3]],
    'array'
) ? passed++ : failed++;

runTest('Deeply mixed: array wins',
    [true, 5, "hello", {a: 1}, [1]],
    [[1], [5], ["hello"], [{a: 1}], [1]],
    'array'
) ? passed++ : failed++;

runTest('Yes/No case insensitive',
    ["YES", "NO", true],
    [true, false, true],
    'boolean'
) ? passed++ : failed++;

runTest('Number string without boolean',
    ["5", "10", "15"],
    ["5", "10", "15"],
    'string'
) ? passed++ : failed++;

// ========== SUMMARY ==========

console.log('\n========================================');
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('========================================');

// ========== SCHEMA DEMO ==========

console.log('\n========== SCHEMA EXAMPLES ==========\n');

const demo1 = [1, "No", 0, "yes", true].toSingleType();
console.log('Input: [1, "No", 0, "yes", true]');
console.log('Output:', [...demo1]);
console.log('Type:', demo1.getType());
console.log('Schema:', demo1.getSchema());

console.log('\n---');

const demo2 = [11, [1, 2], {value: "hey"}].toSingleType();
console.log('Input: [11, [1, 2], {value: "hey"}]');
console.log('Output:', [...demo2]);
console.log('Type:', demo2.getType());
console.log('Schema:', demo2.getSchema());

console.log('\n---');

const demo3 = [0, 11, true, 0, false].toSingleType();
console.log('Input: [0, 11, true, 0, false]');
console.log('Output:', [...demo3]);
console.log('Type:', demo3.getType());
console.log('Schema:', demo3.getSchema());

console.log('\n---');

const demo4 = [1, {sample: 11}, false, "Hello"].toSingleType();
console.log('Input: [1, {sample: 11}, false, "Hello"]');
console.log('Output:', [...demo4]);
console.log('Type:', demo4.getType());
console.log('Schema:', demo4.getSchema());

console.log('\n---');

const demo5 = ["hello", "world", "test"].toSingleType();
console.log('Input: ["hello", "world", "test"]');
console.log('Output:', [...demo5]);
console.log('Type:', demo5.getType());
console.log('Schema:', demo5.getSchema());
