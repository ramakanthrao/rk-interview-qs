# Interview Questions: BDD Testing

## Coding Question

> **Understand Behavior-Driven Development (BDD) testing methodology.**
>
> **Topics Covered:**
> 1. BDD vs TDD
> 2. Gherkin syntax
> 3. Cucumber/Jest-Cucumber setup
> 4. Step definitions
> 5. Writing effective scenarios

---

## BDD Fundamentals

### Q1: What is BDD and how does it differ from TDD?
**Answer:**

| Aspect | TDD | BDD |
|--------|-----|-----|
| Focus | Implementation | Behavior |
| Language | Technical | Business language |
| Written by | Developers | Developers + QA + Business |
| Tests describe | How code works | What system does |
| Format | Code | Gherkin (Given-When-Then) |

**BDD Flow:**
```
Requirements → User Stories → Acceptance Criteria → 
Gherkin Scenarios → Step Definitions → Implementation
```

### Q2: What is Gherkin syntax?
**Answer:**
```gherkin
Feature: Shopping Cart
  As a customer
  I want to add items to my cart
  So that I can purchase them later

  Background:
    Given I am logged in as a customer
    And I have an empty cart

  Scenario: Add single item to cart
    Given a product "Widget" costs $25
    When I add "Widget" to my cart
    Then my cart should contain 1 item
    And my cart total should be $25

  Scenario Outline: Add multiple quantities
    Given a product "<product>" costs $<price>
    When I add <quantity> of "<product>" to my cart
    Then my cart total should be $<total>

    Examples:
      | product | price | quantity | total |
      | Widget  | 25    | 2        | 50    |
      | Gadget  | 50    | 3        | 150   |
```

---

## Gherkin Keywords

### Q3: What are the main Gherkin keywords?
**Answer:**
```gherkin
Feature: High-level description of functionality

  Background: Steps run before each scenario
    Given some precondition

  @smoke @critical
  Scenario: Single test case
    Given some initial context (precondition)
    And another precondition
    When an action is taken
    And another action
    Then expected outcome
    But not some other outcome

  Scenario Outline: Template for multiple examples
    Given <precondition>
    When <action>
    Then <outcome>

    Examples: Named table of values
      | precondition | action | outcome |
      | value1       | value2 | value3  |

  Rule: Business rule grouping (Gherkin 6+)
    Scenario: Test under this rule
      ...
```

### Q4: What are DocStrings and DataTables?
**Answer:**
```gherkin
Scenario: DocStrings for multi-line text
  Given the following user profile:
    """json
    {
      "name": "John Doe",
      "email": "john@example.com"
    }
    """
  When I parse the profile
  Then the name should be "John Doe"

Scenario: DataTables for structured data
  Given the following products exist:
    | name   | price | stock |
    | Widget | 25    | 100   |
    | Gadget | 50    | 50    |
  When I view the catalog
  Then I should see 2 products
```

---

## Step Definitions

### Q5: How do you write step definitions with Cucumber?
**Answer:**
```javascript
// features/step_definitions/cart_steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

let cart;
let products = {};

Given('I have an empty cart', function() {
    cart = { items: [], total: 0 };
});

Given('a product {string} costs ${int}', function(name, price) {
    products[name] = { name, price };
});

When('I add {string} to my cart', function(productName) {
    const product = products[productName];
    cart.items.push({ ...product, quantity: 1 });
    cart.total += product.price;
});

When('I add {int} of {string} to my cart', function(quantity, productName) {
    const product = products[productName];
    cart.items.push({ ...product, quantity });
    cart.total += product.price * quantity;
});

Then('my cart should contain {int} item(s)', function(count) {
    expect(cart.items).to.have.length(count);
});

Then('my cart total should be ${int}', function(expected) {
    expect(cart.total).to.equal(expected);
});
```

### Q6: How do you use Jest-Cucumber?
**Answer:**
```javascript
// features/cart.feature (same Gherkin file)

// cart.steps.js
const { defineFeature, loadFeature } = require('jest-cucumber');

const feature = loadFeature('./features/cart.feature');

defineFeature(feature, (test) => {
    let cart;
    let products;

    beforeEach(() => {
        cart = { items: [], total: 0 };
        products = {};
    });

    test('Add single item to cart', ({ given, when, then, and }) => {
        given(/^a product "(.+)" costs \$(\d+)$/, (name, price) => {
            products[name] = { name, price: parseInt(price) };
        });

        when(/^I add "(.+)" to my cart$/, (productName) => {
            const product = products[productName];
            cart.items.push({ ...product, quantity: 1 });
            cart.total += product.price;
        });

        then(/^my cart should contain (\d+) item$/, (count) => {
            expect(cart.items).toHaveLength(parseInt(count));
        });

        and(/^my cart total should be \$(\d+)$/, (total) => {
            expect(cart.total).toBe(parseInt(total));
        });
    });
});
```

---

## Hooks and World

### Q7: What are Cucumber hooks?
**Answer:**
```javascript
const { Before, After, BeforeAll, AfterAll, BeforeStep, AfterStep } = require('@cucumber/cucumber');

// Run once before all scenarios
BeforeAll(async function() {
    await database.connect();
});

// Run once after all scenarios
AfterAll(async function() {
    await database.disconnect();
});

// Run before each scenario
Before(async function(scenario) {
    this.testData = {};
    console.log(`Starting: ${scenario.pickle.name}`);
});

// Run after each scenario
After(async function(scenario) {
    if (scenario.result.status === 'failed') {
        // Capture screenshot, logs, etc.
        this.attach(await takeScreenshot(), 'image/png');
    }
    await cleanup();
});

// Tagged hooks
Before('@database', async function() {
    await database.seed();
});

// Step hooks (debugging)
BeforeStep(function(step) {
    console.log(`Step: ${step.pickleStep.text}`);
});
```

### Q8: What is the World object?
**Answer:**
```javascript
// World provides shared context across steps
const { setWorldConstructor, World } = require('@cucumber/cucumber');

class CustomWorld extends World {
    constructor(options) {
        super(options);
        this.cart = null;
        this.user = null;
    }

    async login(username, password) {
        this.user = await api.login(username, password);
        return this.user;
    }

    async addToCart(product) {
        if (!this.cart) this.cart = [];
        this.cart.push(product);
    }
}

setWorldConstructor(CustomWorld);

// In step definitions, access via 'this'
Given('I am logged in as {string}', async function(username) {
    await this.login(username, 'password');
});

When('I add {string} to my cart', async function(product) {
    await this.addToCart(product);
});
```

---

## Writing Good Scenarios

### Q9: What makes a good BDD scenario?
**Answer:**
```gherkin
# Bad: Too technical, implementation-focused
Scenario: User login
  Given user table has row with email "test@test.com" and password hash "abc123"
  When POST request to /api/login with {"email": "test@test.com", "password": "test"}
  Then response status is 200
  And response body contains "token"

# Good: Business-focused behavior
Scenario: Successful login
  Given I am a registered user with email "test@test.com"
  When I login with valid credentials
  Then I should be redirected to the dashboard
  And I should see a welcome message

# Bad: Testing multiple things
Scenario: Shopping
  Given I'm on the home page
  When I search for "shoes"
  Then I see results
  When I click the first result
  Then I see product details
  When I add to cart
  Then cart has 1 item
  When I checkout
  Then order is placed

# Good: One scenario, one behavior
Scenario: Search for products
  Given I am on the home page
  When I search for "shoes"
  Then I should see products matching "shoes"

Scenario: Add product to cart
  Given I am viewing a product
  When I add it to my cart
  Then my cart should contain the product
```

### Q10: What are anti-patterns to avoid?
**Answer:**
1. **Too many steps**: Keep scenarios to 5-7 steps
2. **UI coupling**: Describe behavior, not clicks
3. **Incidental details**: Only include relevant information
4. **Scenario dependencies**: Each scenario should be independent
5. **No business value**: Test behavior users care about

```gherkin
# Anti-pattern: UI-coupled
When I click button "#add-to-cart"
And I wait 2 seconds
And I click button ".checkout"

# Better: Behavior-focused
When I add the item to my cart
And I proceed to checkout

# Anti-pattern: Incidental details
Given a user "john@test.com" with password "Abc123!" created on "2024-01-15"

# Better: Only what matters
Given a registered user
```

---

## Integration with CI/CD

### Q11: How do you run BDD tests in CI?
**Answer:**
```yaml
# .github/workflows/test.yml
name: BDD Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm ci
        
      - name: Run BDD tests
        run: npm run test:bdd
        
      - name: Generate report
        if: always()
        run: npm run report:cucumber
        
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: cucumber-report
          path: reports/cucumber-report.html
```

```javascript
// cucumber.js (config)
module.exports = {
    default: {
        format: [
            'progress',
            ['html', 'reports/cucumber-report.html'],
            ['junit', 'reports/cucumber-results.xml'],
        ],
        paths: ['features/**/*.feature'],
        require: ['features/step_definitions/**/*.js'],
        parallel: 2,
    },
};
```

### Q12: How do you tag and filter scenarios?
**Answer:**
```gherkin
@smoke
Feature: Critical user flows

  @wip
  Scenario: Feature in development
    ...

  @smoke @critical
  Scenario: Must always pass
    ...

  @slow @nightly
  Scenario: Long-running test
    ...
```

```bash
# Run only smoke tests
npx cucumber-js --tags "@smoke"

# Run smoke but not slow
npx cucumber-js --tags "@smoke and not @slow"

# Run critical OR smoke
npx cucumber-js --tags "@critical or @smoke"

# Exclude work in progress
npx cucumber-js --tags "not @wip"
```

---
