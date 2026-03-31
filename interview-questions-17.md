# Interview Questions: Redux Thunk

## Coding Question

> **Implement async actions using Redux Thunk middleware.**
>
> **Topics Covered:**
> 1. Thunk basics
> 2. createAsyncThunk
> 3. Error handling
> 4. Cancellation
> 5. Conditional fetching

---

## Thunk Basics

### Q1: What is a thunk?
**Answer:** A thunk is a function that wraps an expression to delay evaluation. In Redux, a thunk is a function that returns another function that receives `dispatch` and `getState`.

```javascript
// Regular action creator (returns action object)
const setUser = (user) => ({
    type: 'user/set',
    payload: user,
});

// Thunk action creator (returns function)
const fetchUser = (userId) => {
    return async (dispatch, getState) => {
        const state = getState();
        if (state.user.loading) return; // Check state
        
        dispatch({ type: 'user/pending' });
        
        try {
            const response = await fetch(`/api/users/${userId}`);
            const user = await response.json();
            dispatch({ type: 'user/fulfilled', payload: user });
        } catch (error) {
            dispatch({ type: 'user/rejected', payload: error.message });
        }
    };
};

// Usage
dispatch(fetchUser(123));
```

### Q2: Why use thunks?
**Answer:**
1. **Async operations**: Fetch data, timeouts, etc.
2. **Access to state**: Check conditions before dispatching
3. **Multiple dispatches**: Dispatch several actions
4. **Side effects**: Logging, analytics, localStorage

```javascript
// Multiple dispatches
const loginAndFetchProfile = (credentials) => async (dispatch) => {
    const user = await login(credentials);
    dispatch(setUser(user));
    
    const profile = await fetchProfile(user.id);
    dispatch(setProfile(profile));
    
    const notifications = await fetchNotifications(user.id);
    dispatch(setNotifications(notifications));
};
```

---

## createAsyncThunk

### Q3: How do you use createAsyncThunk?
**Answer:**
```javascript
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Create async thunk
const fetchUsers = createAsyncThunk(
    'users/fetchAll',  // Action type prefix
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/users');
            if (!response.ok) throw new Error('Failed to fetch');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Handle in slice
const usersSlice = createSlice({
    name: 'users',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});
```

### Q4: What arguments does the payloadCreator receive?
**Answer:**
```javascript
const fetchUser = createAsyncThunk(
    'user/fetch',
    async (userId, thunkAPI) => {
        const {
            dispatch,       // Dispatch function
            getState,       // Get current state
            extra,          // Extra argument from configureStore
            requestId,      // Unique ID for this request
            signal,         // AbortController signal
            rejectWithValue, // Return rejected with value
            fulfillWithValue, // Return fulfilled with meta
        } = thunkAPI;
        
        const state = getState();
        
        const response = await fetch(`/api/users/${userId}`, {
            signal, // Pass for cancellation
        });
        
        return response.json();
    }
);
```

---

## Error Handling

### Q5: What's the difference between rejected and rejectWithValue?
**Answer:**
```javascript
const fetchData = createAsyncThunk(
    'data/fetch',
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/data/${id}`);
            
            if (!response.ok) {
                // Custom error payload
                return rejectWithValue({
                    status: response.status,
                    message: 'Server error',
                });
            }
            
            return response.json();
        } catch (error) {
            // Also custom error payload
            return rejectWithValue({
                message: error.message,
            });
        }
    }
);

// In reducer
.addCase(fetchData.rejected, (state, action) => {
    if (action.payload) {
        // rejectWithValue was used
        state.error = action.payload.message;
        state.status = action.payload.status;
    } else {
        // Error was thrown
        state.error = action.error.message;
    }
})
```

### Q6: How do you handle errors in components?
**Answer:**
```jsx
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from './userSlice';
import { unwrapResult } from '@reduxjs/toolkit';

function UserProfile({ userId }) {
    const dispatch = useDispatch();
    const { user, loading, error } = useSelector(state => state.user);
    
    const handleFetch = async () => {
        try {
            // unwrapResult throws if rejected
            const result = await dispatch(fetchUser(userId)).unwrap();
            console.log('Success:', result);
        } catch (error) {
            console.log('Failed:', error);
            // Handle error (show toast, etc.)
        }
    };
    
    if (loading) return <Spinner />;
    if (error) return <Error message={error} />;
    return <Profile user={user} />;
}
```

---

## Cancellation

### Q7: How do you cancel async thunks?
**Answer:**
```javascript
const fetchUsers = createAsyncThunk(
    'users/fetch',
    async (_, { signal }) => {
        const response = await fetch('/api/users', { signal });
        return response.json();
    }
);

// In component
function UserList() {
    const dispatch = useDispatch();
    
    useEffect(() => {
        const promise = dispatch(fetchUsers());
        
        return () => {
            // Cancel on unmount
            promise.abort();
        };
    }, [dispatch]);
}

// Handle cancellation in reducer
.addCase(fetchUsers.rejected, (state, action) => {
    if (action.meta.aborted) {
        // Request was cancelled, don't update state
        return;
    }
    state.error = action.error.message;
})
```

### Q8: How do you abort with AbortController manually?
**Answer:**
```javascript
const fetchWithTimeout = createAsyncThunk(
    'data/fetch',
    async (_, { signal }) => {
        // Create timeout abort
        const timeoutId = setTimeout(() => {
            // Note: can't abort from inside
        }, 5000);
        
        try {
            const response = await fetch('/api/data', { signal });
            clearTimeout(timeoutId);
            return response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
);

// Or use abort reason
const promise = dispatch(fetchData());
setTimeout(() => {
    promise.abort('Timeout');
}, 5000);
```

---

## Conditional Fetching

### Q9: How do you prevent duplicate requests?
**Answer:**
```javascript
const fetchUsers = createAsyncThunk(
    'users/fetch',
    async () => {
        const response = await fetch('/api/users');
        return response.json();
    },
    {
        // Condition function
        condition: (_, { getState }) => {
            const { users } = getState();
            
            // Don't fetch if already loading
            if (users.loading) return false;
            
            // Don't fetch if data is fresh (< 5 min old)
            if (users.lastFetch) {
                const fiveMinutes = 5 * 60 * 1000;
                if (Date.now() - users.lastFetch < fiveMinutes) {
                    return false;
                }
            }
            
            return true;
        },
        // Optional: dispatch pending even if condition fails
        dispatchConditionRejection: true,
    }
);
```

### Q10: How do you implement optimistic updates?
**Answer:**
```javascript
const updateTodo = createAsyncThunk(
    'todos/update',
    async ({ id, changes }, { dispatch, rejectWithValue }) => {
        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(changes),
            });
            return response.json();
        } catch (error) {
            return rejectWithValue({ id, error: error.message });
        }
    }
);

// In slice
reducers: {
    optimisticUpdate(state, action) {
        const { id, changes } = action.payload;
        const todo = state.items.find(t => t.id === id);
        if (todo) Object.assign(todo, changes);
    },
},
extraReducers: (builder) => {
    builder
        .addCase(updateTodo.pending, (state, action) => {
            // Save original for rollback
            const todo = state.items.find(t => t.id === action.meta.arg.id);
            state.backup = { ...todo };
            
            // Apply optimistic update
            Object.assign(todo, action.meta.arg.changes);
        })
        .addCase(updateTodo.rejected, (state, action) => {
            // Rollback on failure
            const todo = state.items.find(t => t.id === action.payload.id);
            if (todo && state.backup) {
                Object.assign(todo, state.backup);
            }
            state.backup = null;
        })
        .addCase(updateTodo.fulfilled, (state) => {
            state.backup = null;
        });
}
```

---

## Advanced Patterns

### Q11: How do you chain thunks?
**Answer:**
```javascript
const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { dispatch }) => {
        const user = await api.login(credentials);
        
        // Dispatch other thunks
        await dispatch(fetchUserProfile(user.id)).unwrap();
        await dispatch(fetchUserSettings(user.id)).unwrap();
        
        return user;
    }
);

// Alternative: Listener middleware
import { createListenerMiddleware } from '@reduxjs/toolkit';

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
    actionCreator: loginUser.fulfilled,
    effect: async (action, { dispatch }) => {
        const userId = action.payload.id;
        dispatch(fetchUserProfile(userId));
        dispatch(fetchUserSettings(userId));
    },
});
```

### Q12: What is the difference between thunk and saga?
**Answer:**
| Thunk | Saga |
|-------|------|
| Functions | Generator functions |
| Simple async/await | Complex effects (fork, race, etc.) |
| Easy to learn | Steeper learning curve |
| Limited testing helpers | Excellent testability |
| Good for simple async | Good for complex flows |
| No built-in cancellation | Built-in cancellation |

---
