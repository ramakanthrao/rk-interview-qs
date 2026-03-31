# Interview Questions: Advanced CSS / SASS / LESS

## Coding Question

> **Analyze and explain advanced CSS concepts with preprocessor examples.**
>
> **Topics Covered:**
> 1. CSS Grid and Flexbox layouts
> 2. CSS custom properties (variables)
> 3. SASS/LESS features (mixins, functions, nesting)
> 4. CSS animations and transitions
> 5. Responsive design patterns

---

## CSS Layout

### Q1: Explain the difference between Flexbox and Grid
**Answer:**
| Flexbox | Grid |
|---------|------|
| One-dimensional (row OR column) | Two-dimensional (rows AND columns) |
| Content-driven | Layout-driven |
| Good for components | Good for page layouts |
| Items flex to fill space | Explicit track sizing |

```css
/* Flexbox - navigation */
.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* Grid - page layout */
.page {
    display: grid;
    grid-template-columns: 200px 1fr 200px;
    grid-template-rows: auto 1fr auto;
    gap: 20px;
}
```

### Q2: What is `grid-template-areas`?
**Answer:** Named grid areas for visual layout definition:
```css
.container {
    display: grid;
    grid-template-areas:
        "header header header"
        "nav    main   aside"
        "footer footer footer";
    grid-template-columns: 200px 1fr 200px;
}
.header { grid-area: header; }
.nav    { grid-area: nav; }
.main   { grid-area: main; }
.aside  { grid-area: aside; }
.footer { grid-area: footer; }
```

### Q3: What does `minmax()` do in Grid?
**Answer:** Sets min and max size for tracks:
```css
.grid {
    /* Columns at least 200px, up to 1fr */
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
```
Useful for responsive grids without media queries.

---

## CSS Custom Properties

### Q4: How do CSS variables cascade?
**Answer:**
```css
:root {
    --primary: blue;      /* Global scope */
}

.dark-theme {
    --primary: lightblue; /* Override in context */
}

.button {
    background: var(--primary); /* Inherits based on context */
}
```
Variables inherit down the DOM tree and can be overridden at any level.

### Q5: Can you use CSS variables in media queries?
**Answer:** Not in the media query condition, but yes inside:
```css
/* No - won't work */
@media (min-width: var(--breakpoint)) { }

/* Yes - works */
@media (min-width: 768px) {
    :root {
        --spacing: 2rem;
    }
}
```

---

## SASS Features

### Q6: Explain SASS mixins vs extends
**Answer:**
```scss
// Mixin - copies CSS to each use
@mixin button-style {
    padding: 10px;
    border-radius: 4px;
}

.btn-primary { @include button-style; background: blue; }
.btn-secondary { @include button-style; background: gray; }

// Extend - groups selectors together
%button-base {
    padding: 10px;
    border-radius: 4px;
}

.btn-primary { @extend %button-base; background: blue; }
.btn-secondary { @extend %button-base; background: gray; }

// Extend output:
.btn-primary, .btn-secondary { padding: 10px; border-radius: 4px; }
.btn-primary { background: blue; }
.btn-secondary { background: gray; }
```
- **Mixins**: More flexible, accept parameters
- **Extends**: Smaller CSS output, groups selectors

### Q7: How do SASS functions work?
**Answer:**
```scss
// Built-in functions
$color: darken(#3498db, 10%);
$half: percentage(0.5);  // 50%

// Custom function
@function rem($pixels) {
    @return #{$pixels / 16}rem;
}

.container {
    padding: rem(32);  // 2rem
    margin: rem(16);   // 1rem
}
```

### Q8: What is the `@use` vs `@import` difference?
**Answer:**
```scss
// Old @import - global scope, multiple loads
@import 'variables';
@import 'mixins';

// New @use - namespaced, single load
@use 'variables' as vars;
@use 'mixins' as *;  // No namespace

.button {
    color: vars.$primary-color;
    @include button-style;
}
```
`@use` is recommended - prevents global pollution, only loads once.

---

## LESS Features

### Q9: What are LESS mixins?
**Answer:**
```less
// Simple mixin
.border-radius(@radius: 5px) {
    border-radius: @radius;
    -webkit-border-radius: @radius;
}

// Usage
.button {
    .border-radius(10px);
}

// Mixin with pattern matching
.mixin(dark, @color) {
    color: darken(@color, 10%);
}
.mixin(light, @color) {
    color: lighten(@color, 10%);
}

.widget {
    .mixin(dark, #888);  // Calls dark version
}
```

### Q10: How does LESS variable scoping work?
**Answer:**
```less
@color: blue;

.parent {
    @color: red;      // Local scope
    
    .child {
        color: @color;  // red - inherited from parent
        
        @color: green;  // Even more local
        background: @color;  // green
    }
}
```
Variables are lazily evaluated - uses value at time of use, not declaration.

---

## CSS Animations

### Q11: Explain `@keyframes` and animation properties
**Answer:**
```css
@keyframes slide-in {
    0% {
        transform: translateX(-100%);
        opacity: 0;
    }
    100% {
        transform: translateX(0);
        opacity: 1;
    }
}

.element {
    animation-name: slide-in;
    animation-duration: 0.5s;
    animation-timing-function: ease-out;
    animation-delay: 0.2s;
    animation-iteration-count: 1;
    animation-direction: normal;
    animation-fill-mode: forwards;
    
    /* Shorthand */
    animation: slide-in 0.5s ease-out 0.2s 1 normal forwards;
}
```

### Q12: What is `animation-fill-mode`?
**Answer:**
- `none`: No styles applied before/after
- `forwards`: Keeps final keyframe styles
- `backwards`: Applies first keyframe during delay
- `both`: Combines forwards and backwards

```css
.element {
    opacity: 0.5;
    animation: fade-in 1s ease forwards;
}

@keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}
/* Without forwards: snaps back to 0.5 after animation */
/* With forwards: stays at 1 */
```

---

## Responsive Design

### Q13: What are container queries?
**Answer:** Style based on container size, not viewport:
```css
.card-container {
    container-type: inline-size;
    container-name: card;
}

@container card (min-width: 400px) {
    .card {
        display: grid;
        grid-template-columns: 1fr 2fr;
    }
}
```
Better for component-based responsive design.

### Q14: Explain `clamp()` for fluid typography
**Answer:**
```css
/* clamp(minimum, preferred, maximum) */
h1 {
    font-size: clamp(1.5rem, 4vw, 3rem);
    /* At least 1.5rem, scales with viewport, max 3rem */
}

.container {
    width: clamp(300px, 90%, 1200px);
}
```

### Q15: What is the `@supports` rule?
**Answer:** Feature detection in CSS:
```css
.grid {
    display: flex;  /* Fallback */
}

@supports (display: grid) {
    .grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
    }
}

@supports not (container-type: inline-size) {
    /* Fallback for no container queries */
}
```

---

## Specificity & Cascade

### Q16: How is specificity calculated?
**Answer:**
```
ID > Class/Attribute/Pseudo-class > Element/Pseudo-element

#id        = 1-0-0 (100)
.class     = 0-1-0 (10)
element    = 0-0-1 (1)

nav#main .item:hover a  = 1-2-2 (122)
```
- `!important` overrides all (avoid if possible)
- Inline styles beat all selectors
- Later rules win if specificity equal

### Q17: What are CSS layers (`@layer`)?
**Answer:**
```css
@layer base, components, utilities;

@layer base {
    h1 { font-size: 2rem; }
}

@layer components {
    .card h1 { font-size: 1.5rem; }
}

@layer utilities {
    .text-large { font-size: 3rem !important; }
}
```
Controls cascade order - later layers win regardless of specificity.

---
