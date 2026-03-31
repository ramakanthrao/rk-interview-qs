# Interview Questions: HTML5

## Coding Question

> **Demonstrate knowledge of HTML5 semantic elements, APIs, and best practices.**
>
> **Topics Covered:**
> 1. Semantic HTML elements
> 2. HTML5 APIs (localStorage, canvas, etc.)
> 3. Forms and validation
> 4. Accessibility considerations
> 5. Metadata and SEO

---

## Semantic HTML

### Q1: What are semantic HTML5 elements?
**Answer:** Elements that describe their meaning to both browser and developer:

```html
<!-- Non-semantic -->
<div class="header">...</div>
<div class="navigation">...</div>

<!-- Semantic -->
<header>...</header>
<nav>...</nav>
<main>...</main>
<article>...</article>
<section>...</section>
<aside>...</aside>
<footer>...</footer>
```

**Benefits:**
- Better accessibility (screen readers)
- SEO improvements
- Clearer code structure
- Machine-readable

### Q2: When to use `<article>` vs `<section>`?
**Answer:**
```html
<!-- Article: Self-contained, independently distributable -->
<article>
    <h2>Blog Post Title</h2>
    <p>Content that makes sense on its own</p>
</article>

<!-- Section: Thematic grouping, needs context -->
<section>
    <h2>Features</h2>
    <p>Part of a larger piece</p>
</section>
```

**Rule of thumb:** Would this make sense in an RSS feed? → `<article>`

### Q3: What is `<figure>` and `<figcaption>`?
**Answer:**
```html
<figure>
    <img src="chart.png" alt="Sales data visualization">
    <figcaption>
        Figure 1: Quarterly sales for 2024
    </figcaption>
</figure>
```
Groups self-contained content (images, code, diagrams) with its caption.

---

## HTML5 APIs

### Q4: Explain localStorage vs sessionStorage
**Answer:**
| Feature | localStorage | sessionStorage |
|---------|-------------|----------------|
| Persistence | Until manually cleared | Until tab closes |
| Scope | Same origin, all tabs | Same origin, single tab |
| Size | ~5-10MB | ~5-10MB |

```javascript
// localStorage
localStorage.setItem('user', JSON.stringify({ name: 'John' }));
const user = JSON.parse(localStorage.getItem('user'));
localStorage.removeItem('user');

// sessionStorage
sessionStorage.setItem('tempData', 'value');
```

### Q5: What is the History API?
**Answer:**
```javascript
// Add to history (SPA navigation)
history.pushState({ page: 2 }, 'Page 2', '/page/2');

// Replace current entry
history.replaceState({ page: 1 }, 'Page 1', '/page/1');

// Navigate
history.back();
history.forward();
history.go(-2);

// Handle browser navigation
window.addEventListener('popstate', (event) => {
    console.log('State:', event.state);
});
```

### Q6: What is the Geolocation API?
**Answer:**
```javascript
if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            console.log(position.coords.latitude);
            console.log(position.coords.longitude);
        },
        (error) => {
            console.log('Error:', error.message);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}
```

### Q7: What are Web Workers?
**Answer:**
```javascript
// main.js
const worker = new Worker('worker.js');
worker.postMessage({ data: 'heavy computation' });
worker.onmessage = (e) => console.log('Result:', e.data);

// worker.js
self.onmessage = (e) => {
    const result = heavyComputation(e.data);
    self.postMessage(result);
};
```
Run JavaScript in background thread without blocking UI.

---

## Forms and Validation

### Q8: What are HTML5 input types?
**Answer:**
```html
<input type="email" required>
<input type="url">
<input type="tel" pattern="[0-9]{3}-[0-9]{4}">
<input type="number" min="0" max="100" step="5">
<input type="range" min="0" max="100">
<input type="date">
<input type="datetime-local">
<input type="color">
<input type="search">
```

### Q9: Explain form validation attributes
**Answer:**
```html
<form novalidate>  <!-- Disable browser validation -->
    <input type="text" 
           required
           minlength="3"
           maxlength="50"
           pattern="[A-Za-z]+"
           title="Letters only">
    
    <input type="email" required>
    
    <input type="number" 
           min="18" 
           max="100"
           step="1">
</form>
```

### Q10: What is the `<datalist>` element?
**Answer:**
```html
<input list="browsers" name="browser">
<datalist id="browsers">
    <option value="Chrome">
    <option value="Firefox">
    <option value="Safari">
    <option value="Edge">
</datalist>
```
Provides autocomplete suggestions - user can still type custom values.

---

## Media Elements

### Q11: Explain `<video>` and `<audio>` attributes
**Answer:**
```html
<video 
    src="movie.mp4"
    controls        <!-- Show controls -->
    autoplay        <!-- Auto-start (muted required) -->
    muted           <!-- Muted by default -->
    loop            <!-- Repeat -->
    poster="thumb.jpg"  <!-- Preview image -->
    preload="metadata"  <!-- none | metadata | auto -->
    width="640"
    height="360">
    
    <!-- Fallback sources -->
    <source src="movie.webm" type="video/webm">
    <source src="movie.mp4" type="video/mp4">
    
    <!-- Fallback content -->
    Your browser doesn't support video.
</video>
```

### Q12: What is the `<picture>` element?
**Answer:**
```html
<picture>
    <!-- Art direction: different crop for mobile -->
    <source media="(max-width: 600px)" 
            srcset="hero-mobile.jpg">
    
    <!-- Format selection: modern formats first -->
    <source type="image/avif" srcset="hero.avif">
    <source type="image/webp" srcset="hero.webp">
    
    <!-- Fallback -->
    <img src="hero.jpg" alt="Hero image">
</picture>
```

---

## Metadata & SEO

### Q13: What are important `<meta>` tags?
**Answer:**
```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" 
          content="width=device-width, initial-scale=1.0">
    <meta name="description" 
          content="Page description for search results">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph (social sharing) -->
    <meta property="og:title" content="Title">
    <meta property="og:description" content="Description">
    <meta property="og:image" content="https://example.com/image.jpg">
    <meta property="og:url" content="https://example.com/page">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
</head>
```

### Q14: What is structured data (Schema.org)?
**Answer:**
```html
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Article Title",
    "author": {
        "@type": "Person",
        "name": "John Doe"
    },
    "datePublished": "2024-01-15",
    "image": "https://example.com/image.jpg"
}
</script>
```
Helps search engines understand page content.

---

## Accessibility

### Q15: What are ARIA attributes?
**Answer:**
```html
<!-- Role -->
<div role="button" tabindex="0">Click me</div>

<!-- States -->
<button aria-pressed="false">Toggle</button>
<div aria-expanded="true">Accordion content</div>
<input aria-invalid="true" aria-describedby="error">
<span id="error">Invalid email</span>

<!-- Labels -->
<button aria-label="Close dialog">✕</button>
<input aria-labelledby="label1 label2">

<!-- Live regions -->
<div aria-live="polite">Status updates here</div>
<div aria-live="assertive">Urgent alerts</div>
```

### Q16: When should you use ARIA?
**Answer:** First rule of ARIA: **Don't use ARIA if native HTML works.**

```html
<!-- Bad: ARIA on div -->
<div role="button" tabindex="0" 
     aria-pressed="false"
     onclick="toggle()">Toggle</div>

<!-- Good: Native button -->
<button>Toggle</button>
```

Use ARIA when:
- Building custom widgets not available in HTML
- Adding dynamic state information
- Creating live regions for updates

---
