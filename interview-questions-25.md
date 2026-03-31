# Interview Questions: Web Performance

## Coding Question

> **Optimize web application performance.**
>
> **Topics Covered:**
> 1. Core Web Vitals
> 2. Loading performance
> 3. Runtime performance
> 4. Caching strategies
> 5. Measurement and monitoring

---

## Core Web Vitals

### Q1: What are Core Web Vitals?
**Answer:**
| Metric | Measures | Good | Needs Work | Poor |
|--------|----------|------|------------|------|
| **LCP** (Largest Contentful Paint) | Loading | < 2.5s | 2.5s - 4s | > 4s |
| **INP** (Interaction to Next Paint) | Interactivity | < 200ms | 200ms - 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | Visual stability | < 0.1 | 0.1 - 0.25 | > 0.25 |

```javascript
// Measure with Performance Observer API
new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
        console.log('LCP:', entry.startTime);
    }
}).observe({ type: 'largest-contentful-paint', buffered: true });

// Or use web-vitals library
import { getLCP, getINP, getCLS } from 'web-vitals';

getLCP(console.log);
getINP(console.log);
getCLS(console.log);
```

### Q2: How do you improve LCP?
**Answer:**
```html
<!-- 1. Preload critical resources -->
<link rel="preload" as="image" href="hero.webp">
<link rel="preload" as="font" href="font.woff2" crossorigin>

<!-- 2. Remove render-blocking resources -->
<link rel="stylesheet" href="non-critical.css" media="print" onload="this.media='all'">
<script defer src="app.js"></script>

<!-- 3. Optimize images -->
<img src="hero.webp" 
     srcset="hero-400.webp 400w, hero-800.webp 800w"
     sizes="(max-width: 400px) 400px, 800px"
     loading="eager"
     fetchpriority="high">

<!-- 4. Inline critical CSS -->
<style>
    /* Critical above-fold styles */
    .hero { min-height: 500px; }
</style>

<!-- 5. Use CDN -->
<!-- 6. Enable compression (gzip/brotli) -->
<!-- 7. Server-side render (SSR) for initial content -->
```

### Q3: How do you fix CLS issues?
**Answer:**
```css
/* 1. Reserve space for images */
img, video {
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
}

/* 2. Reserve space for ads/embeds */
.ad-container {
    min-height: 250px;
}

/* 3. Avoid inserting content above existing */
/* Bad: */
.notification { position: fixed; top: 0; }

/* Better: */
.notification { position: fixed; bottom: 0; }

/* 4. Use transform instead of changing layout */
.animate {
    transform: translateX(100px); /* Good */
    /* left: 100px; // Bad - causes reflow */
}

/* 5. Font loading stability */
@font-face {
    font-family: 'Custom';
    src: url('font.woff2');
    font-display: swap;
    /* Or: optional, fallback */
}
```

---

## Loading Performance

### Q4: What are code splitting strategies?
**Answer:**
```javascript
// 1. Route-based splitting
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
    return (
        <Suspense fallback={<Loading />}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Suspense>
    );
}

// 2. Component-based splitting
const HeavyChart = lazy(() => import('./HeavyChart'));

function Dashboard() {
    return (
        <div>
            <Header />
            <Suspense fallback={<ChartSkeleton />}>
                <HeavyChart />
            </Suspense>
        </div>
    );
}

// 3. Library splitting (webpack magic comments)
const moment = () => import(
    /* webpackChunkName: "moment" */
    'moment'
);

// 4. Conditional loading
if (userWantsCharts) {
    const Chart = await import('./Chart');
}
```

### Q5: How do you optimize images?
**Answer:**
```html
<!-- 1. Modern formats -->
<picture>
    <source srcset="image.avif" type="image/avif">
    <source srcset="image.webp" type="image/webp">
    <img src="image.jpg" alt="Description">
</picture>

<!-- 2. Responsive images -->
<img srcset="small.jpg 400w,
             medium.jpg 800w,
             large.jpg 1200w"
     sizes="(max-width: 600px) 400px,
            (max-width: 1200px) 800px,
            1200px"
     src="medium.jpg"
     alt="Description">

<!-- 3. Lazy loading -->
<img loading="lazy" src="below-fold.jpg">

<!-- 4. Blur placeholder (LQIP) -->
<img 
    src="tiny-blur.jpg"
    data-src="full-image.jpg"
    class="lazyload blur">

<!-- 5. Proper sizing -->
<!-- Serve 2x resolution for retina -->
<!-- Don't serve 2000px image for 200px container -->
```

### Q6: What is resource prioritization?
**Answer:**
```html
<!-- Priority hints -->
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="hero.jpg" as="image" fetchpriority="high">
<link rel="preconnect" href="https://api.example.com">
<link rel="dns-prefetch" href="https://cdn.example.com">
<link rel="prefetch" href="next-page.js">

<!-- Script loading strategies -->
<script src="critical.js"></script>                <!-- Blocks parsing -->
<script defer src="app.js"></script>               <!-- After parsing -->
<script async src="analytics.js"></script>         <!-- When ready -->
<script type="module" src="module.js"></script>    <!-- Deferred by default -->

<!-- Fetch priority API -->
<img src="hero.jpg" fetchpriority="high">
<img src="carousel-3.jpg" fetchpriority="low">

<script>
fetch('/api/critical-data', { priority: 'high' });
</script>
```

---

## Runtime Performance

### Q7: How do you optimize React rendering?
**Answer:**
```jsx
// 1. Memoize expensive computations
const expensiveResult = useMemo(() => {
    return data.filter(x => x.active).sort((a, b) => a.score - b.score);
}, [data]);

// 2. Memoize callbacks
const handleClick = useCallback((id) => {
    setSelected(id);
}, []);

// 3. Memoize components
const MemoizedItem = React.memo(function Item({ data }) {
    return <div>{data.name}</div>;
});

// 4. Virtualize long lists
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
    const parentRef = useRef(null);
    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 50,
    });
    
    return (
        <div ref={parentRef} style={{ height: 400, overflow: 'auto' }}>
            <div style={{ height: virtualizer.getTotalSize() }}>
                {virtualizer.getVirtualItems().map(virtualItem => (
                    <div key={virtualItem.key}
                         style={{ height: 50, transform: `translateY(${virtualItem.start}px)` }}>
                        {items[virtualItem.index].name}
                    </div>
                ))}
            </div>
        </div>
    );
}

// 5. Avoid unnecessary state updates
const [items, setItems] = useState([]);
// Bad: new array every render
setItems([...items, newItem]);
// Better: functional update
setItems(prev => [...prev, newItem]);
```

### Q8: What causes layout thrashing?
**Answer:**
```javascript
// BAD: Forces layout between each read/write
elements.forEach(el => {
    const height = el.offsetHeight;  // Read (forces layout)
    el.style.height = height + 10 + 'px';  // Write
});

// GOOD: Batch reads, then batch writes
const heights = elements.map(el => el.offsetHeight);  // All reads
elements.forEach((el, i) => {
    el.style.height = heights[i] + 10 + 'px';  // All writes
});

// BETTER: Use CSS where possible
elements.forEach(el => {
    el.classList.add('taller');  // Single reflow
});

// Properties that trigger layout:
// offsetWidth, offsetHeight, offsetTop, offsetLeft
// clientWidth, clientHeight, scrollWidth, scrollHeight
// getComputedStyle(), getBoundingClientRect()

// Use requestAnimationFrame for DOM updates
function animate() {
    element.style.transform = `translateX(${x}px)`;
    requestAnimationFrame(animate);
}
```

---

## Caching Strategies

### Q9: What are HTTP caching strategies?
**Answer:**
```
# Cache-Control header options

# 1. Static assets (hashed filenames)
Cache-Control: public, max-age=31536000, immutable

# 2. HTML documents
Cache-Control: no-cache
# Always revalidate, may serve cached if unchanged

# 3. API responses
Cache-Control: private, max-age=0, must-revalidate

# 4. No caching
Cache-Control: no-store

# ETags for validation
ETag: "abc123"
If-None-Match: "abc123"  # Returns 304 if unchanged

# Example nginx config
location /static/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}

location / {
    add_header Cache-Control "no-cache";
}
```

### Q10: What are Service Worker caching strategies?
**Answer:**
```javascript
// 1. Cache First (offline-first)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(cached => cached || fetch(event.request))
    );
});

// 2. Network First (fresh data preferred)
event.respondWith(
    fetch(event.request)
        .catch(() => caches.match(event.request))
);

// 3. Stale While Revalidate
event.respondWith(
    caches.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request).then(response => {
            caches.open('v1').then(cache => cache.put(event.request, response.clone()));
            return response;
        });
        return cached || fetchPromise;
    })
);

// 4. Network Only (no caching)
event.respondWith(fetch(event.request));

// 5. Cache Only (fully offline)
event.respondWith(caches.match(event.request));
```

---

## Measurement

### Q11: How do you measure performance?
**Answer:**
```javascript
// Performance API
const timing = performance.timing;
const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
const ttfb = timing.responseStart - timing.navigationStart;

// Modern: Navigation Timing Level 2
const [entry] = performance.getEntriesByType('navigation');
console.log('DOM Interactive:', entry.domInteractive);
console.log('DOM Complete:', entry.domComplete);

// Resource timing
performance.getEntriesByType('resource').forEach(resource => {
    console.log(`${resource.name}: ${resource.duration}ms`);
});

// User Timing API
performance.mark('feature-start');
// ... work
performance.mark('feature-end');
performance.measure('feature', 'feature-start', 'feature-end');

// Long Task API
new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
        console.log('Long task:', entry.duration);
    });
}).observe({ type: 'longtask', buffered: true });

// Lighthouse CI
// npm install -g @lhci/cli
// lhci autorun
```

### Q12: What monitoring tools should you use?
**Answer:**
```
Development:
- Chrome DevTools Performance tab
- Lighthouse (built into Chrome)
- React DevTools Profiler
- webpack-bundle-analyzer

Real User Monitoring (RUM):
- Google Analytics 4 (Web Vitals)
- Sentry Performance
- New Relic Browser
- Datadog RUM

Synthetic Monitoring:
- WebPageTest
- Lighthouse CI
- SpeedCurve
- Calibre

Build Time:
- bundlephobia (npm package sizes)
- source-map-explorer
- Size-limit (CI budget enforcement)

// Example: Performance budget in webpack
performance: {
    maxAssetSize: 250000,      // 250kb
    maxEntrypointSize: 250000,
    hints: 'error'
}
```

---

## Best Practices

### Q13: What is the PRPL pattern?
**Answer:**
```
PRPL Pattern:

P - Push (or preload) critical resources
R - Render initial route ASAP
P - Pre-cache remaining routes
L - Lazy-load other routes on demand

Implementation:
1. Server push or <link rel="preload"> for critical assets
2. Inline critical CSS, defer non-critical
3. Service worker caches routes
4. Route-based code splitting

Example structure:
/
├── index.html (inlined critical CSS, preloads)
├── app-shell.js (minimal shell, cached)
├── routes/
│   ├── home.js (lazy)
│   ├── product.js (lazy)
│   └── checkout.js (lazy)
└── sw.js (precaches shells and routes)
```

### Q14: What's a performance budget?
**Answer:**
```javascript
// Define budgets
const budgets = {
    js: 170,      // KB
    css: 50,
    images: 500,
    fonts: 100,
    total: 1000,
    lcp: 2500,    // ms
    fid: 100,
    cls: 0.1
};

// Enforce with bundler
// webpack.config.js
module.exports = {
    performance: {
        maxAssetSize: 170 * 1024,
        maxEntrypointSize: 300 * 1024,
        hints: 'error'
    }
};

// Enforce with Lighthouse CI
// lighthouserc.js
module.exports = {
    assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'total-byte-weight': ['error', { maxNumericValue: 500000 }]
    }
};
```

---
