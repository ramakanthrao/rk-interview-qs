/**
 * Generator Functions
 * Demonstrates JavaScript generator functions and iterators.
 * 
 * Features:
 * - Basic generators with yield
 * - Two-way communication
 * - Delegation with yield*
 * - Async iteration patterns
 * 
 * Usage:
 *   const gen = range(1, 5);
 *   for (const n of gen) console.log(n);
 */

/**
 * Simple range generator
 */
function* range(start, end, step = 1) {
    for (let i = start; i <= end; i += step) {
        yield i;
    }
}

/**
 * Infinite sequence generator
 */
function* infiniteSequence(start = 0) {
    let i = start;
    while (true) {
        yield i++;
    }
}

/**
 * Fibonacci generator
 */
function* fibonacci(limit = Infinity) {
    let [prev, curr] = [0, 1];
    let count = 0;
    
    while (count < limit) {
        yield curr;
        [prev, curr] = [curr, prev + curr];
        count++;
    }
}

/**
 * Generator with two-way communication
 */
function* accumulator(initial = 0) {
    let total = initial;
    while (true) {
        const value = yield total;
        if (value === null) break;
        total += value;
    }
    return total;
}

/**
 * Generator delegation with yield*
 */
function* flatten(arr) {
    for (const item of arr) {
        if (Array.isArray(item)) {
            yield* flatten(item);
        } else {
            yield item;
        }
    }
}

/**
 * Paginated data generator
 */
function* paginate(items, pageSize) {
    for (let i = 0; i < items.length; i += pageSize) {
        yield {
            page: Math.floor(i / pageSize) + 1,
            data: items.slice(i, i + pageSize),
            hasMore: i + pageSize < items.length
        };
    }
}

/**
 * Async generator for fetching paginated API data
 */
async function* fetchPaginated(fetchFn, startPage = 1) {
    let page = startPage;
    let hasMore = true;
    
    while (hasMore) {
        const result = await fetchFn(page);
        yield result.data;
        hasMore = result.hasMore;
        page++;
    }
}

/**
 * Coroutine helper - runs generator to completion
 */
function coroutine(generatorFn) {
    return function(...args) {
        const generator = generatorFn(...args);
        
        function handle(result) {
            if (result.done) return Promise.resolve(result.value);
            
            return Promise.resolve(result.value)
                .then(res => handle(generator.next(res)))
                .catch(err => handle(generator.throw(err)));
        }
        
        return handle(generator.next());
    };
}

/**
 * Take first n items from any iterable
 */
function* take(iterable, n) {
    let count = 0;
    for (const item of iterable) {
        if (count >= n) return;
        yield item;
        count++;
    }
}

/**
 * Filter generator
 */
function* filter(iterable, predicate) {
    for (const item of iterable) {
        if (predicate(item)) {
            yield item;
        }
    }
}

/**
 * Map generator
 */
function* map(iterable, transform) {
    for (const item of iterable) {
        yield transform(item);
    }
}

/**
 * Zip multiple iterables together
 */
function* zip(...iterables) {
    const iterators = iterables.map(it => it[Symbol.iterator]());
    
    while (true) {
        const results = iterators.map(it => it.next());
        if (results.some(r => r.done)) return;
        yield results.map(r => r.value);
    }
}

module.exports = {
    range,
    infiniteSequence,
    fibonacci,
    accumulator,
    flatten,
    paginate,
    fetchPaginated,
    coroutine,
    take,
    filter,
    map,
    zip
};
