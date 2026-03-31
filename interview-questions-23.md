# Interview Questions: ADA and Web Accessibility

## Coding Question

> **Implement accessibility best practices for web applications.**
>
> **Topics Covered:**
> 1. WCAG guidelines
> 2. Semantic HTML
> 3. ARIA attributes
> 4. Keyboard navigation
> 5. Testing and tools

---

## Accessibility Fundamentals

### Q1: What is WCAG and what are its principles?
**Answer:**
**WCAG** (Web Content Accessibility Guidelines) has four principles (POUR):

1. **Perceivable**: Information must be presentable in ways users can perceive
   - Alt text for images
   - Captions for videos
   - Sufficient color contrast

2. **Operable**: UI components must be operable
   - Keyboard accessible
   - Enough time to read
   - No seizure-inducing content

3. **Understandable**: Information must be understandable
   - Readable text
   - Predictable navigation
   - Input assistance

4. **Robust**: Content must be robust for various technologies
   - Valid HTML
   - Compatible with assistive technologies

**Conformance Levels:**
- **A**: Minimum (30 criteria)
- **AA**: Standard target (20 additional criteria)
- **AAA**: Highest (28 additional criteria)

### Q2: What is the difference between ADA and WCAG?
**Answer:**
| ADA | WCAG |
|-----|------|
| US law (Americans with Disabilities Act) | International guidelines |
| Legal requirement | Technical standard |
| Doesn't specify technical details | Specific success criteria |
| Section 508 references WCAG | Current version: WCAG 2.1/2.2 |

ADA compliance typically means meeting WCAG 2.1 AA standards.

---

## Semantic HTML

### Q3: Why is semantic HTML important for accessibility?
**Answer:**
```html
<!-- Bad: No semantic meaning -->
<div class="header">
    <div class="nav">
        <span onclick="navigate()">Home</span>
    </div>
</div>

<!-- Good: Meaningful structure -->
<header>
    <nav>
        <a href="/">Home</a>
    </nav>
</header>

<!-- Benefits: -->
<!-- 1. Screen readers announce element roles -->
<!-- 2. Keyboard navigation works automatically -->
<!-- 3. Browser understands document structure -->
<!-- 4. Better SEO -->
```

### Q4: What are the most important semantic elements?
**Answer:**
```html
<!-- Page structure -->
<header>Site header</header>
<nav>Navigation links</nav>
<main>Primary content (one per page)</main>
<aside>Secondary content (sidebar)</aside>
<footer>Site footer</footer>

<!-- Content sections -->
<article>Self-contained content</article>
<section>Thematic grouping</section>

<!-- Text semantics -->
<h1> through <h6>  <!-- Heading hierarchy -->
<p>Paragraph</p>
<strong>Important (not just bold)</strong>
<em>Emphasis (not just italic)</em>
<abbr title="World Wide Web">WWW</abbr>
<time datetime="2024-01-15">January 15</time>

<!-- Interactive elements -->
<button>Click me</button>  <!-- Not <div onclick> -->
<a href="/">Link</a>       <!-- Not <span onclick> -->

<!-- Lists -->
<ul>, <ol>, <li>           <!-- Announced as lists -->
<dl>, <dt>, <dd>           <!-- Definition lists -->
```

---

## ARIA Attributes

### Q5: What is ARIA and when should you use it?
**Answer:**
**ARIA** (Accessible Rich Internet Applications) adds accessibility info when HTML semantics aren't enough.

**First Rule of ARIA**: Don't use ARIA if native HTML works!

```html
<!-- Bad: ARIA where not needed -->
<div role="button" tabindex="0" aria-pressed="false">Click</div>

<!-- Good: Native HTML -->
<button>Click</button>

<!-- Valid ARIA use: Custom widget -->
<div role="tablist">
    <button role="tab" aria-selected="true" aria-controls="panel1">Tab 1</button>
    <button role="tab" aria-selected="false" aria-controls="panel2">Tab 2</button>
</div>
<div role="tabpanel" id="panel1">Content 1</div>
<div role="tabpanel" id="panel2" hidden>Content 2</div>
```

### Q6: What are common ARIA attributes?
**Answer:**
```html
<!-- Roles (what is it?) -->
<div role="alert">Error message</div>
<div role="dialog" aria-modal="true">Modal content</div>
<nav role="navigation"><!-- Redundant but valid --></nav>

<!-- States (what's its current state?) -->
<button aria-pressed="true">Toggle</button>
<input aria-invalid="true">
<div aria-expanded="false">Accordion</div>
<div aria-hidden="true">Hidden from AT</div>

<!-- Properties (additional info) -->
<input aria-label="Search">
<input aria-labelledby="label1 label2">
<input aria-describedby="help-text">
<input aria-required="true">
<div aria-live="polite">Updates announced</div>

<!-- Relationships -->
<button aria-controls="menu">Open Menu</button>
<div id="menu">Menu content</div>

<input aria-owns="listbox">  <!-- Parent/child -->
<div aria-flowto="next">     <!-- Reading order -->
```

### Q7: What are ARIA live regions?
**Answer:**
```html
<!-- Polite: Announced when user is idle -->
<div aria-live="polite" aria-atomic="true">
    Cart updated: 3 items
</div>

<!-- Assertive: Announced immediately (interrupts) -->
<div aria-live="assertive" role="alert">
    Error: Please fix the form
</div>

<!-- Status: Polite + role="status" -->
<div role="status">
    Loading... 50% complete
</div>

<!-- Log: Sequential announcements -->
<div role="log" aria-live="polite">
    <p>User joined</p>
    <p>User left</p>
</div>

<!-- aria-atomic: Announce entire region or just changes -->
<div aria-live="polite" aria-atomic="false">
    Only changed parts announced
</div>
```

---

## Keyboard Navigation

### Q8: How do you ensure keyboard accessibility?
**Answer:**
```html
<!-- All interactive elements must be focusable -->
<button>Naturally focusable</button>
<a href="/">Naturally focusable</a>
<input type="text">

<!-- Custom elements need tabindex -->
<div role="button" tabindex="0" onclick="action()" onkeydown="handleKey(event)">
    Custom button
</div>

<!-- tabindex values -->
tabindex="0"   <!-- In natural tab order -->
tabindex="-1"  <!-- Focusable via JS only -->
tabindex="1+"  <!-- Avoid! Changes natural order -->

<!-- Focus management for modals -->
<script>
// Trap focus in modal
function trapFocus(element) {
    const focusable = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    
    element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === first) {
                last.focus();
                e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === last) {
                first.focus();
                e.preventDefault();
            }
        }
    });
}
</script>
```

### Q9: What keyboard shortcuts should be supported?
**Answer:**
```javascript
// Common expected keyboard behavior:

// Navigation
// Tab: Move to next focusable element
// Shift+Tab: Move to previous
// Enter: Activate link/button
// Space: Activate button, toggle checkbox

// Menus and dropdowns
// Arrow keys: Navigate options
// Escape: Close
// Home/End: First/last item

// Modals
// Escape: Close modal
// Tab: Cycle through focusable elements (trapped)

// Sliders
// Arrow keys: Increment/decrement
// Home/End: Min/max value
// Page Up/Down: Larger steps

// Implementation example:
element.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'Enter':
        case ' ':
            e.preventDefault();
            activate();
            break;
        case 'Escape':
            close();
            break;
        case 'ArrowDown':
            e.preventDefault();
            focusNext();
            break;
    }
});
```

---

## Forms Accessibility

### Q10: How do you make forms accessible?
**Answer:**
```html
<!-- Always use labels -->
<label for="email">Email address</label>
<input type="email" id="email" required>

<!-- Or wrap input -->
<label>
    Email address
    <input type="email" required>
</label>

<!-- Group related fields -->
<fieldset>
    <legend>Shipping Address</legend>
    <label for="street">Street</label>
    <input id="street">
    <!-- more fields -->
</fieldset>

<!-- Error messages -->
<label for="password">Password</label>
<input 
    type="password" 
    id="password" 
    aria-describedby="password-error password-hint"
    aria-invalid="true">
<span id="password-hint">Must be 8+ characters</span>
<span id="password-error" role="alert">Password is required</span>

<!-- Required fields -->
<label for="name">Name <span aria-hidden="true">*</span></label>
<input id="name" required aria-required="true">

<!-- Autocomplete for user data -->
<input type="text" autocomplete="given-name">
<input type="tel" autocomplete="tel">
<input type="email" autocomplete="email">
```

---

## Color and Visual

### Q11: What are the color contrast requirements?
**Answer:**
```css
/* WCAG 2.1 AA Requirements */

/* Normal text (< 18pt or < 14pt bold): 4.5:1 minimum */
body {
    color: #595959;      /* On white: 7:1 ✓ */
    background: #ffffff;
}

/* Large text (≥ 18pt or ≥ 14pt bold): 3:1 minimum */
h1 {
    color: #767676;      /* On white: 4.54:1 ✓ */
}

/* UI components and graphics: 3:1 minimum */
button {
    border: 2px solid #767676;  /* 4.54:1 ✓ */
}

/* Don't rely on color alone */
/* Bad: */
.error { color: red; }

/* Good: */
.error { 
    color: red;
    border-left: 3px solid red;  /* Visual indicator */
}
.error::before {
    content: "⚠ ";  /* Icon */
}

/* Focus indicators: Must be visible */
:focus {
    outline: 2px solid #005fcc;
    outline-offset: 2px;
}

/* Never: */
:focus { outline: none; }  /* Removes focus visibility */
```

### Q12: How do you handle images for accessibility?
**Answer:**
```html
<!-- Informative images: Describe content -->
<img src="chart.png" alt="Sales increased 25% in Q4 2024">

<!-- Decorative images: Empty alt -->
<img src="decoration.png" alt="">

<!-- Complex images: Longer description -->
<figure>
    <img src="diagram.png" alt="Company org chart" aria-describedby="org-desc">
    <figcaption id="org-desc">
        Detailed description of the organizational structure...
    </figcaption>
</figure>

<!-- Icons with text: Hide from AT -->
<button>
    <svg aria-hidden="true" focusable="false">...</svg>
    Save Document
</button>

<!-- Icons without text: Add label -->
<button aria-label="Close dialog">
    <svg aria-hidden="true" focusable="false">...</svg>
</button>

<!-- Background images with meaning -->
<div role="img" aria-label="Company logo" 
     style="background-image: url(logo.png)">
</div>
```

---

## Testing

### Q13: How do you test for accessibility?
**Answer:**
```bash
# Automated tools (catch ~30% of issues)
- axe DevTools (browser extension)
- Lighthouse (Chrome built-in)
- WAVE (browser extension)
- pa11y (CLI/CI integration)

# Manual testing checklist
□ Navigate with keyboard only (no mouse)
□ Test with screen reader (NVDA, VoiceOver, JAWS)
□ Check color contrast (browser tools)
□ Zoom to 200% (content should reflow)
□ Test with browser zoom and text-only zoom
□ Check focus order matches visual order
□ Verify skip links work
□ Test form error handling

# Screen reader testing
# Windows: NVDA (free), JAWS
# Mac: VoiceOver (built-in)
# Commands:
# - Tab: Next focusable
# - Arrow keys: Read content
# - H: Next heading
# - B: Next button
# - K: Next link
```

### Q14: What should you include in accessibility documentation?
**Answer:**
```markdown
# Accessibility Statement

## Conformance
This website conforms to WCAG 2.1 Level AA.

## Known Issues
- Date picker not fully keyboard accessible (fix planned Q2)
- PDF documents lack proper tags

## Testing
- Tested with: NVDA, VoiceOver, axe
- Browsers: Chrome, Firefox, Safari
- Last audit: January 2024

## Feedback
Contact: accessibility@company.com

## VPAT (Voluntary Product Accessibility Template)
[Link to VPAT document]
```

---
