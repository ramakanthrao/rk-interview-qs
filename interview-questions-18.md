# Interview Questions: Redux Saga

## Coding Question

> **Implement complex async flows using Redux Saga.**
>
> **Topics Covered:**
> 1. Saga basics and effects
> 2. Watcher and worker patterns
> 3. Effect creators (call, put, take, fork)
> 4. Concurrency patterns
> 5. Error handling and cancellation

---

## Saga Basics

### Q1: What is Redux Saga?
**Answer:** Redux Saga is a middleware library for handling side effects using generator functions. It makes async flows easy to read, write, and test.

```javascript
import { call, put, takeEvery } from 'redux-saga/effects';

// Worker saga: performs the async operation
function* fetchUserSaga(action) {
    try {
        const user = yield call(api.fetchUser, action.payload.userId);
        yield put({ type: 'USER_FETCH_SUCCESS', payload: user });
    } catch (error) {
        yield put({ type: 'USER_FETCH_FAILED', payload: error.message });
    }
}

// Watcher saga: listens for actions
function* watchFetchUser() {
    yield takeEvery('USER_FETCH_REQUESTED', fetchUserSaga);
}

// Root saga
export default function* rootSaga() {
    yield all([
        watchFetchUser(),
        // other watchers...
    ]);
}
```

### Q2: Why use Saga over Thunk?
**Answer:**

| Feature | Saga | Thunk |
|---------|------|-------|
| Async handling | Generator-based | Promise-based |
| Testing | Easy to test (effects are objects) | Requires mocking |
| Cancellation | Built-in with `cancel` | Manual with AbortController |
| Complex flows | race, fork, join, debounce | Manual implementation |
| Learning curve | Steeper | Gentler |

```javascript
// Saga testing - no mocking needed
import { call, put } from 'redux-saga/effects';

test('fetchUserSaga', () => {
    const gen = fetchUserSaga({ payload: { userId: 1 } });
    
    // Assert each yield
    expect(gen.next().value).toEqual(call(api.fetchUser, 1));
    expect(gen.next(mockUser).value).toEqual(
        put({ type: 'USER_FETCH_SUCCESS', payload: mockUser })
    );
});
```

---

## Effect Creators

### Q3: What are the main effect creators?
**Answer:**
```javascript
import { 
    call, put, take, select, fork, 
    spawn, join, cancel, all, race,
    takeEvery, takeLatest, throttle, debounce
} from 'redux-saga/effects';

// call - call a function (blocking)
yield call(api.fetchUser, userId);
yield call([obj, obj.method], arg); // With context

// put - dispatch an action
yield put({ type: 'SUCCESS', payload: data });
yield put.resolve(action); // Wait for dispatch to complete

// take - wait for action (blocking)
const action = yield take('LOGIN');

// select - get state
const user = yield select(state => state.user);

// fork - non-blocking call
const task = yield fork(backgroundSync);

// spawn - detached fork (errors don't bubble up)
yield spawn(analytics.track, event);

// join - wait for forked task
yield join(task);

// cancel - cancel a forked task
yield cancel(task);
```

### Q4: What's the difference between `call` and `fork`?
**Answer:**
```javascript
// call - BLOCKING
// Saga waits for fetchUser to complete before continuing
function* saga() {
    const user = yield call(api.fetchUser, 1);
    console.log('After call - user fetched');
}

// fork - NON-BLOCKING
// Saga continues immediately, fetchUser runs in parallel
function* saga() {
    const task = yield fork(api.fetchUser, 1);
    console.log('After fork - may not be done yet');
    
    // Later, wait for result if needed
    const user = yield join(task);
}
```

---

## Watcher Patterns

### Q5: Explain takeEvery vs takeLatest
**Answer:**
```javascript
import { takeEvery, takeLatest } from 'redux-saga/effects';

// takeEvery - handles ALL dispatched actions
// Good for: actions where every request matters
function* watchAll() {
    yield takeEvery('SAVE_TO_SERVER', saveWorker);
}
// User clicks 3 times quickly → 3 API calls

// takeLatest - cancels previous, runs latest only
// Good for: search, autocomplete
function* watchLatest() {
    yield takeLatest('SEARCH', searchWorker);
}
// User types "a", "ab", "abc" → only "abc" search runs
```

### Q6: What are throttle and debounce effects?
**Answer:**
```javascript
import { throttle, debounce } from 'redux-saga/effects';

// throttle - max one action per time period
// Good for: scroll handlers, resize events
function* watchScroll() {
    yield throttle(500, 'SCROLL', handleScroll);
}
// Scrolling continuously → handler runs every 500ms max

// debounce - wait for pause in actions
// Good for: search input, auto-save
function* watchInput() {
    yield debounce(300, 'INPUT_CHANGE', handleInput);
}
// User types continuously → handler runs 300ms after last keystroke
```

---

## Concurrency

### Q7: How do you run effects in parallel?
**Answer:**
```javascript
import { all, call } from 'redux-saga/effects';

// all - wait for all to complete (parallel)
function* fetchDashboard() {
    const [user, posts, notifications] = yield all([
        call(api.fetchUser),
        call(api.fetchPosts),
        call(api.fetchNotifications),
    ]);
    
    yield put({ type: 'DASHBOARD_LOADED', payload: { user, posts, notifications }});
}

// With object syntax
const { user, posts } = yield all({
    user: call(api.fetchUser),
    posts: call(api.fetchPosts),
});
```

### Q8: What is the race effect?
**Answer:**
```javascript
import { race, call, put, delay } from 'redux-saga/effects';

// race - first one wins, others cancelled
function* fetchWithTimeout() {
    const { response, timeout } = yield race({
        response: call(api.fetchData),
        timeout: delay(5000),
    });
    
    if (timeout) {
        yield put({ type: 'FETCH_TIMEOUT' });
    } else {
        yield put({ type: 'FETCH_SUCCESS', payload: response });
    }
}

// race for cancellation
function* fetchUntilCancel() {
    const { success } = yield race({
        success: call(longRunningTask),
        cancel: take('CANCEL_TASK'),
    });
}
```

---

## Error Handling

### Q9: How do you handle errors in sagas?
**Answer:**
```javascript
// try/catch in worker saga
function* fetchUserWorker(action) {
    try {
        const user = yield call(api.fetchUser, action.payload);
        yield put({ type: 'SUCCESS', payload: user });
    } catch (error) {
        yield put({ type: 'FAILURE', payload: error.message });
    }
}

// Safe wrapper utility
function* safe(saga, ...args) {
    try {
        return yield call(saga, ...args);
    } catch (error) {
        yield put({ type: 'ERROR', payload: error });
        return null;
    }
}

// Usage
function* mySaga() {
    const result = yield call(safe, riskyOperation);
    if (result) {
        // success
    }
}
```

### Q10: How do errors propagate in forked tasks?
**Answer:**
```javascript
// fork - errors propagate to parent (crash parent)
function* parent() {
    yield fork(childThatMayFail);
    // If child throws, parent crashes
}

// spawn - errors DON'T propagate (isolated)
function* parent() {
    yield spawn(childThatMayFail);
    // If child throws, parent continues
}

// Handle fork errors
function* parent() {
    const task = yield fork(child);
    
    try {
        yield join(task);
    } catch (error) {
        console.log('Child failed:', error);
    }
}
```

---

## Cancellation

### Q11: How do you cancel sagas?
**Answer:**
```javascript
import { fork, cancel, take, cancelled } from 'redux-saga/effects';

function* backgroundSync() {
    try {
        while (true) {
            yield call(api.sync);
            yield delay(5000);
        }
    } finally {
        // Always runs, even on cancellation
        if (yield cancelled()) {
            console.log('Sync cancelled');
            yield call(cleanup);
        }
    }
}

function* watchSync() {
    while (true) {
        yield take('START_SYNC');
        const task = yield fork(backgroundSync);
        
        yield take('STOP_SYNC');
        yield cancel(task);
    }
}
```

### Q12: What is the `finally` block for?
**Answer:**
```javascript
function* uploadFile(file) {
    const progressChannel = yield call(createProgressChannel, file);
    
    try {
        while (true) {
            const progress = yield take(progressChannel);
            yield put({ type: 'UPLOAD_PROGRESS', payload: progress });
        }
    } catch (error) {
        yield put({ type: 'UPLOAD_ERROR', payload: error });
    } finally {
        // Cleanup - runs on completion, error, OR cancellation
        progressChannel.close();
        
        if (yield cancelled()) {
            // Only on cancellation
            yield call(api.cancelUpload);
        }
    }
}
```

---

## Advanced Patterns

### Q13: What are channels in Redux Saga?
**Answer:**
```javascript
import { channel, eventChannel, END } from 'redux-saga';
import { take, put, call } from 'redux-saga/effects';

// eventChannel - for external events
function createWebSocketChannel(url) {
    return eventChannel(emit => {
        const ws = new WebSocket(url);
        
        ws.onmessage = (event) => {
            emit(JSON.parse(event.data));
        };
        
        ws.onclose = () => {
            emit(END); // Close channel
        };
        
        // Return unsubscribe function
        return () => ws.close();
    });
}

function* watchWebSocket() {
    const channel = yield call(createWebSocketChannel, 'ws://api.example.com');
    
    try {
        while (true) {
            const message = yield take(channel);
            yield put({ type: 'WS_MESSAGE', payload: message });
        }
    } finally {
        channel.close();
    }
}
```

### Q14: How do you implement retry logic?
**Answer:**
```javascript
function* fetchWithRetry(action) {
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const data = yield call(api.fetch, action.payload);
            yield put({ type: 'SUCCESS', payload: data });
            return;
        } catch (error) {
            if (attempt < 2) {
                // Exponential backoff
                yield delay(Math.pow(2, attempt) * 1000);
            }
        }
    }
    
    yield put({ type: 'FAILURE', payload: 'Max retries exceeded' });
}

// Or use retry effect helper (saga 1.1+)
import { retry } from 'redux-saga/effects';

function* fetchSaga(action) {
    try {
        // Retry 3 times with 2 second delay
        const data = yield retry(3, 2000, api.fetch, action.payload);
        yield put({ type: 'SUCCESS', payload: data });
    } catch (error) {
        yield put({ type: 'FAILURE', payload: error });
    }
}
```

---
