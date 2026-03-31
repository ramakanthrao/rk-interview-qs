# Interview Questions: React Router

## Coding Question

> **Implement routing patterns using React Router v6.**
>
> **Topics Covered:**
> 1. Basic routing setup
> 2. Dynamic routes and parameters
> 3. Nested routes
> 4. Protected routes
> 5. Navigation and redirects
> 6. Data loading with loaders

---

## Basic Routing

### Q1: How do you set up React Router v6?
**Answer:**
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
```

### Q2: What's the difference between `BrowserRouter` and `HashRouter`?
**Answer:**
| BrowserRouter | HashRouter |
|---------------|------------|
| `/about` | `/#/about` |
| Clean URLs | Hash-based URLs |
| Requires server config | Works everywhere |
| HTML5 History API | hash portion of URL |

```jsx
// BrowserRouter - needs server to handle routes
<BrowserRouter>
    <Routes>...</Routes>
</BrowserRouter>

// HashRouter - no server config needed
<HashRouter>
    <Routes>...</Routes>
</HashRouter>
```

### Q3: How do you navigate programmatically?
**Answer:**
```jsx
import { useNavigate } from 'react-router-dom';

function LoginForm() {
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        await login();
        
        // Navigate to dashboard
        navigate('/dashboard');
        
        // Replace history (can't go back)
        navigate('/dashboard', { replace: true });
        
        // Pass state
        navigate('/dashboard', { state: { from: 'login' } });
        
        // Go back
        navigate(-1);
    };
}
```

---

## Dynamic Routes

### Q4: How do you use URL parameters?
**Answer:**
```jsx
// Route definition
<Route path="/users/:userId" element={<UserProfile />} />

// Accessing parameters
import { useParams } from 'react-router-dom';

function UserProfile() {
    const { userId } = useParams();
    
    return <h1>User ID: {userId}</h1>;
}
```

### Q5: How do you use query parameters?
**Answer:**
```jsx
import { useSearchParams } from 'react-router-dom';

function ProductList() {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Read params: /products?category=shoes&sort=price
    const category = searchParams.get('category');
    const sort = searchParams.get('sort');
    
    // Update params
    const updateSort = (newSort) => {
        setSearchParams({ category, sort: newSort });
    };
    
    return (
        <button onClick={() => updateSort('name')}>
            Sort by Name
        </button>
    );
}
```

---

## Nested Routes

### Q6: How do nested routes work?
**Answer:**
```jsx
// Parent route with Outlet
function Dashboard() {
    return (
        <div>
            <Sidebar />
            <main>
                <Outlet />  {/* Child routes render here */}
            </main>
        </div>
    );
}

// Route configuration
<Route path="/dashboard" element={<Dashboard />}>
    <Route index element={<Overview />} />
    <Route path="analytics" element={<Analytics />} />
    <Route path="settings" element={<Settings />} />
</Route>

// Results in:
// /dashboard -> Overview
// /dashboard/analytics -> Analytics
// /dashboard/settings -> Settings
```

### Q7: What is an index route?
**Answer:**
```jsx
<Route path="/products" element={<ProductLayout />}>
    <Route index element={<ProductList />} />  {/* Default child */}
    <Route path=":id" element={<ProductDetail />} />
</Route>
```
Index route renders when parent path matches exactly.

---

## Protected Routes

### Q8: How do you implement protected routes?
**Answer:**
```jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';

function ProtectedRoute({ isAuthenticated }) {
    const location = useLocation();
    
    if (!isAuthenticated) {
        // Redirect to login, save attempted URL
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    return <Outlet />;
}

// Usage
<Route element={<ProtectedRoute isAuthenticated={user !== null} />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile" element={<Profile />} />
</Route>
```

### Q9: How do you redirect after login?
**Answer:**
```jsx
import { useNavigate, useLocation } from 'react-router-dom';

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get the page they tried to visit
    const from = location.state?.from?.pathname || '/dashboard';
    
    const handleLogin = async () => {
        await loginUser();
        navigate(from, { replace: true });
    };
}
```

---

## Data Loading

### Q10: What are loaders in React Router v6.4+?
**Answer:**
```jsx
import { createBrowserRouter, RouterProvider, useLoaderData } from 'react-router-dom';

// Define loader
async function userLoader({ params }) {
    const response = await fetch(`/api/users/${params.id}`);
    if (!response.ok) throw new Response('Not Found', { status: 404 });
    return response.json();
}

// Use loaded data
function UserProfile() {
    const user = useLoaderData();
    return <h1>{user.name}</h1>;
}

// Configure routes
const router = createBrowserRouter([
    {
        path: '/users/:id',
        element: <UserProfile />,
        loader: userLoader,
        errorElement: <ErrorPage />
    }
]);

// Render
function App() {
    return <RouterProvider router={router} />;
}
```

### Q11: What are actions in React Router?
**Answer:**
```jsx
// Define action
async function updateUserAction({ request, params }) {
    const formData = await request.formData();
    await updateUser(params.id, Object.fromEntries(formData));
    return redirect('/users');
}

// Use with Form
import { Form, useActionData } from 'react-router-dom';

function EditUser() {
    const actionData = useActionData();  // Errors, etc.
    
    return (
        <Form method="post">
            <input name="name" />
            <button type="submit">Save</button>
        </Form>
    );
}

// Route config
{
    path: '/users/:id/edit',
    element: <EditUser />,
    action: updateUserAction
}
```

---

## Navigation Components

### Q12: What's the difference between `Link` and `NavLink`?
**Answer:**
```jsx
import { Link, NavLink } from 'react-router-dom';

// Link - basic navigation
<Link to="/about">About</Link>

// NavLink - adds active state
<NavLink 
    to="/about"
    className={({ isActive, isPending }) => 
        isActive ? 'active' : isPending ? 'pending' : ''
    }
>
    About
</NavLink>

// NavLink with end prop (exact matching)
<NavLink to="/products" end>Products</NavLink>
```

### Q13: How do you handle scroll restoration?
**Answer:**
```jsx
import { ScrollRestoration } from 'react-router-dom';

function Root() {
    return (
        <>
            <Outlet />
            <ScrollRestoration 
                getKey={(location, matches) => {
                    // Custom scroll key
                    return location.pathname;
                }}
            />
        </>
    );
}
```

---

## Error Handling

### Q14: How do you handle route errors?
**Answer:**
```jsx
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

function ErrorPage() {
    const error = useRouteError();
    
    if (isRouteErrorResponse(error)) {
        return (
            <div>
                <h1>{error.status}</h1>
                <p>{error.statusText}</p>
            </div>
        );
    }
    
    return <div>Something went wrong</div>;
}

// Usage
const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [...]
    }
]);
```

---
