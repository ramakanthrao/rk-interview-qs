/**
 * Test Runner - Runs all test suites
 */

const { spawn } = require('child_process');
const path = require('path');

const testFiles = [
    'toSingleType.test.js',
    'deepClone.test.js',
    'EventEmitter.test.js',
    'debounce.test.js',
    'memoize.test.js',
    'groupBy.test.js',
    'chunk.test.js',
    'flatten.test.js',
    'curry.test.js',
    'promiseAll.test.js',
    'deepMerge.test.js',
    'generators.test.js'
];

let totalPassed = 0;
let totalFailed = 0;
let completedTests = 0;

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║              RUNNING ALL TEST SUITES                       ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function runTest(testFile) {
    return new Promise((resolve) => {
        const testPath = path.join(__dirname, testFile);
        const child = spawn('node', [testPath], { 
            stdio: 'pipe'
        });
        
        let output = '';
        
        child.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            output += data.toString();
        });
        
        child.on('close', (code) => {
            // Parse results from output
            const resultMatch = output.match(/RESULTS:\s*(\d+)\s*passed,\s*(\d+)\s*failed/);
            let passed = 0, failed = 0;
            
            if (resultMatch) {
                passed = parseInt(resultMatch[1], 10);
                failed = parseInt(resultMatch[2], 10);
            }
            
            resolve({ testFile, passed, failed, exitCode: code, output });
        });
    });
}

async function runAllTests() {
    const results = [];
    
    for (const testFile of testFiles) {
        const suiteName = testFile.replace('.test.js', '');
        process.stdout.write(`Running ${suiteName}... `);
        
        const result = await runTest(testFile);
        results.push(result);
        
        totalPassed += result.passed;
        totalFailed += result.failed;
        
        if (result.failed === 0 && result.exitCode === 0) {
            console.log(`✓ ${result.passed} passed`);
        } else {
            console.log(`✗ ${result.passed} passed, ${result.failed} failed`);
        }
    }
    
    // Summary
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    FINAL SUMMARY                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log(`Total Tests:  ${totalPassed + totalFailed}`);
    console.log(`Passed:       ${totalPassed} ✓`);
    console.log(`Failed:       ${totalFailed} ${totalFailed > 0 ? '✗' : ''}`);
    console.log(`Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%\n`);
    
    // Show failed suites details
    const failedSuites = results.filter(r => r.failed > 0 || r.exitCode !== 0);
    if (failedSuites.length > 0) {
        console.log('Failed Suites:');
        for (const suite of failedSuites) {
            console.log(`  - ${suite.testFile}: ${suite.failed} failures`);
        }
        console.log('');
    }
    
    process.exit(totalFailed > 0 ? 1 : 0);
}

runAllTests();
