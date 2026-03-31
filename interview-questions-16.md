# Interview Questions: React Redux

## Coding Question

> **Implement state management patterns using Redux with React.**
>
> **Topics Covered:**
> 1. Redux core concepts
> 2. Redux Toolkit setup
> 3. Slices and reducers
> 4. Selectors and memoization
> 5. Connecting React components

---

## Core Concepts

### Q1: What are the three principles of Redux?
**Answer:**
1. **Single source of truth**: One store holds all application state
2. **State is read-only**: Only way to change is dispatch an action
3. **Changes via pure functions**: Reducers are pure functions

```javascript
// Store - single source of truth
const store = createStore(rootReducer);

// Action - describes what happened
const action = { type: 'user/login', payload: { id: 1 } };

// Reducer - pure function
function userReducer(state = initialState, action) {
    switch (action.type) {
        case 'user/login':
            return { ...state, user: action.payload };
        default:
            return state;
    }
}
```

### Q2: Explain the Redux data flow
**Answer:**
```
User Interaction
      ↓
Action Creator → dispatches → Action
                                ↓
                            Middleware
                                ↓
                             Reducer → produces → New State
                                                    ↓
                                              UI Updates
```

1. User clicks button
2. Action creator dispatches action
3. Middleware processes (logging, async, etc.)
4. Reducer calculates new state
5. Store notifies subscribers
6. UI re-renders with new state

---

## Redux Toolkit

### Q3: How do you set up Redux Toolkit?
**Answer:**
```javascript
// store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/userSlice';
import postsReducer from './features/postsSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        posts: postsReducer,
    },
    // DevTools enabled by default
    // Middleware includes thunk by default
});

// App.jsx
import { Provider } from 'react-redux';
import { store } from './store';

function App() {
    return (
        <Provider store={store}>
            <MyApp />
        </Provider>
    );
}
```

### Q4: What is a Redux slice?
**Answer:**
```javascript
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        currentUser: null,
        isLoading: false,
        error: null,
    },
    reducers: {
        setUser(state, action) {
            // Can "mutate" state thanks to Immer
            state.currentUser = action.payload;
        },
        logout(state) {
            state.currentUser = null;
        },
        setLoading(state, action) {
            state.isLoading = action.payload;
        },
    },
});

// Export actions
export const { setUser, logout, setLoading } = userSlice.actions;

// Export reducer
export default userSlice.reducer;
```

### Q5: How does Immer work in Redux Toolkit?
**Answer:**
```javascript
// Without Immer - immutable updates (verbose)
function reducer(state, action) {
    return {
        ...state,
        nested: {
            ...state.nested,
            deep: {
                ...state.nested.deep,
                value: action.payload,
            },
        },
    };
}

// With Immer (Redux Toolkit) - "mutate" directly
reducers: {
    updateDeep(state, action) {
        state.nested.deep.value = action.payload;
        // Immer converts to immutable update
    },
}
```

---

## Selectors

### Q6: What are selectors and why use them?
**Answer:**
```javascript
// Basic selector
const selectUser = (state) => state.user.currentUser;

// Derived data selector
const selectFullName = (state) => {
    const user = state.user.currentUser;
    return user ? `${user.firstName} ${user.lastName}` : '';
};

// In component
import { useSelector } from 'react-redux';

function Profile() {
    const user = useSelector(selectUser);
    const fullName = useSelector(selectFullName);
}
```

**Benefits:**
- Encapsulate state shape
- Reusable across components
- Can be memoized for performance

### Q7: How do you use `createSelector` for memoization?
**Answer:**
```javascript
import { createSelector } from '@reduxjs/toolkit';

// Input selectors
const selectItems = (state) => state.cart.items;
const selectTaxRate = (state) => state.cart.taxRate;

// Memoized selector - only recalculates if inputs change
const selectCartTotal = createSelector(
    [selectItems, selectTaxRate],
    (items, taxRate) => {
        const subtotal = items.reduce((sum, item) => 
            sum + item.price * item.quantity, 0
        );
        return subtotal * (1 + taxRate);
    }
);

// Parameterized selector
const selectItemById = createSelector(
    [selectItems, (state, itemId) => itemId],
    (items, itemId) => items.find(item => item.id === itemId)
);
```

---

## React Integration

### Q8: How do you use `useSelector` and `useDispatch`?
**Answer:**
```jsx
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, reset } from './counterSlice';

function Counter() {
    // Select state
    const count = useSelector((state) => state.counter.value);
    
    // Get dispatch function
    const dispatch = useDispatch();
    
    return (
        <div>
            <span>{count}</span>
            <button onClick={() => dispatch(increment())}>+</button>
            <button onClick={() => dispatch(decrement())}>-</button>
            <button onClick={() => dispatch(reset())}>Reset</button>
        </div>
    );
}
```

### Q9: How do you avoid unnecessary re-renders?
**Answer:**
```jsx
// Bad - creates new object each render
const user = useSelector((state) => ({
    name: state.user.name,
    email: state.user.email,
})); // Always new object = always re-render

// Good - use shallowEqual
import { shallowEqual } from 'react-redux';

const user = useSelector(
    (state) => ({
        name: state.user.name,
        email: state.user.email,
    }),
    shallowEqual  // Compare object properties
);

// Better - separate selectors
const name = useSelector((state) => state.user.name);
const email = useSelector((state) => state.user.email);

// Best - memoized selector
const selectUserInfo = createSelector(
    [(state) => state.user],
    (user) => ({ name: user.name, email: user.email })
);
```

---

## Actions & Reducers

### Q10: What are action creators and payload?
**Answer:**
```javascript
// Manual action creator
const addTodo = (text) => ({
    type: 'todos/add',
    payload: { id: Date.now(), text, completed: false },
});

// Redux Toolkit - auto-generated
const todosSlice = createSlice({
    name: 'todos',
    initialState: [],
    reducers: {
        // addTodo action creator generated automatically
        addTodo: {
            reducer(state, action) {
                state.push(action.payload);
            },
            // Customize payload
            prepare(text) {
                return {
                    payload: { id: Date.now(), text, completed: false },
                };
            },
        },
    },
});
```

### Q11: What is `extraReducers` for?
**Answer:**
```javascript
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Async action
const fetchUser = createAsyncThunk(
    'user/fetch',
    async (userId) => {
        const response = await fetch(`/api/users/${userId}`);
        return response.json();
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState: { data: null, loading: false, error: null },
    reducers: {},
    // Handle actions from other slices or async thunks
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});
```

---

## Architecture

### Q12: How do you structure a Redux application?
**Answer:**
```
src/
├── app/
│   ├── store.js         # Store configuration
│   └── hooks.js         # Typed hooks
├── features/
│   ├── auth/
│   │   ├── authSlice.js
│   │   ├── authAPI.js
│   │   └── Login.jsx
│   ├── todos/
│   │   ├── todosSlice.js
│   │   ├── todosSelectors.js
│   │   └── TodoList.jsx
└── components/          # Shared UI components
```

### Q13: When should you use Redux vs React state?
**Answer:**
| Use Redux | Use React State |
|-----------|-----------------|
| Shared across many components | Local to component |
| Global application state | UI state (open/closed) |
| Complex update logic | Simple updates |
| Need time-travel debugging | No debugging needs |
| Server cache (consider RTK Query) | Form inputs |

---
