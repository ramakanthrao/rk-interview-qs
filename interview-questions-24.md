# Interview Questions: Design Patterns

## Coding Question

> **Implement and explain common software design patterns.**
>
> **Topics Covered:**
> 1. Creational patterns
> 2. Structural patterns
> 3. Behavioral patterns
> 4. JavaScript-specific patterns
> 5. React patterns

---

## Creational Patterns

### Q1: What is the Singleton Pattern?
**Answer:**
```javascript
// Ensures only one instance exists
class Database {
    static instance = null;
    
    constructor() {
        if (Database.instance) {
            return Database.instance;
        }
        this.connection = this.connect();
        Database.instance = this;
    }
    
    connect() {
        console.log('Creating new connection');
        return { connected: true };
    }
}

// Module pattern (preferred in JS)
const database = (() => {
    let instance;
    
    function createConnection() {
        return { connected: true };
    }
    
    return {
        getInstance() {
            if (!instance) {
                instance = createConnection();
            }
            return instance;
        }
    };
})();

// Usage
const db1 = database.getInstance();
const db2 = database.getInstance();
console.log(db1 === db2); // true
```

### Q2: What is the Factory Pattern?
**Answer:**
```javascript
// Creates objects without specifying exact class
class Notification {
    send(message) { throw new Error('Must implement'); }
}

class EmailNotification extends Notification {
    send(message) { console.log(`Email: ${message}`); }
}

class SMSNotification extends Notification {
    send(message) { console.log(`SMS: ${message}`); }
}

class PushNotification extends Notification {
    send(message) { console.log(`Push: ${message}`); }
}

// Factory
class NotificationFactory {
    create(type) {
        switch (type) {
            case 'email': return new EmailNotification();
            case 'sms': return new SMSNotification();
            case 'push': return new PushNotification();
            default: throw new Error(`Unknown type: ${type}`);
        }
    }
}

// Usage
const factory = new NotificationFactory();
const notification = factory.create('email');
notification.send('Hello!');
```

### Q3: What is the Builder Pattern?
**Answer:**
```javascript
// Constructs complex objects step by step
class QueryBuilder {
    constructor() {
        this.query = { table: '', conditions: [], fields: '*', limit: null };
    }
    
    select(fields) {
        this.query.fields = fields;
        return this;
    }
    
    from(table) {
        this.query.table = table;
        return this;
    }
    
    where(condition) {
        this.query.conditions.push(condition);
        return this;
    }
    
    limit(n) {
        this.query.limit = n;
        return this;
    }
    
    build() {
        let sql = `SELECT ${this.query.fields} FROM ${this.query.table}`;
        if (this.query.conditions.length) {
            sql += ` WHERE ${this.query.conditions.join(' AND ')}`;
        }
        if (this.query.limit) {
            sql += ` LIMIT ${this.query.limit}`;
        }
        return sql;
    }
}

// Usage - fluent interface
const query = new QueryBuilder()
    .select('id, name')
    .from('users')
    .where('active = true')
    .where('role = "admin"')
    .limit(10)
    .build();

// SELECT id, name FROM users WHERE active = true AND role = "admin" LIMIT 10
```

---

## Structural Patterns

### Q4: What is the Adapter Pattern?
**Answer:**
```javascript
// Makes incompatible interfaces work together

// Old interface
class OldPaymentProcessor {
    processTransaction(amount, account) {
        console.log(`Processing $${amount} for ${account}`);
        return { success: true };
    }
}

// New interface we want to use
class ModernPaymentGateway {
    pay(paymentDetails) {
        console.log(`Modern payment: ${JSON.stringify(paymentDetails)}`);
        return { status: 'completed' };
    }
}

// Adapter
class PaymentAdapter {
    constructor() {
        this.gateway = new ModernPaymentGateway();
    }
    
    // Adapts old interface to new
    processTransaction(amount, account) {
        const result = this.gateway.pay({
            amount,
            accountId: account,
            currency: 'USD'
        });
        return { success: result.status === 'completed' };
    }
}

// Usage - same old interface, new implementation
const processor = new PaymentAdapter();
processor.processTransaction(100, 'acc123');
```

### Q5: What is the Decorator Pattern?
**Answer:**
```javascript
// Adds behavior dynamically

class Coffee {
    cost() { return 5; }
    description() { return 'Coffee'; }
}

// Decorators
class MilkDecorator {
    constructor(coffee) {
        this.coffee = coffee;
    }
    cost() { return this.coffee.cost() + 1; }
    description() { return this.coffee.description() + ', Milk'; }
}

class SugarDecorator {
    constructor(coffee) {
        this.coffee = coffee;
    }
    cost() { return this.coffee.cost() + 0.5; }
    description() { return this.coffee.description() + ', Sugar'; }
}

// Usage
let myOrder = new Coffee();
myOrder = new MilkDecorator(myOrder);
myOrder = new SugarDecorator(myOrder);

console.log(myOrder.description()); // Coffee, Milk, Sugar
console.log(myOrder.cost()); // 6.5

// JavaScript decorator syntax (stage 3)
function log(target, name, descriptor) {
    const original = descriptor.value;
    descriptor.value = function(...args) {
        console.log(`Calling ${name} with:`, args);
        return original.apply(this, args);
    };
    return descriptor;
}
```

### Q6: What is the Facade Pattern?
**Answer:**
```javascript
// Provides simple interface to complex subsystem

// Complex subsystems
class VideoDecoder {
    decode(file) { return { frames: [], audio: [] }; }
}

class AudioProcessor {
    process(audio) { return { normalized: audio }; }
}

class VideoRenderer {
    render(frames) { console.log('Rendering...'); }
}

class AudioPlayer {
    play(audio) { console.log('Playing audio...'); }
}

// Facade - simple interface
class MediaPlayer {
    constructor() {
        this.decoder = new VideoDecoder();
        this.audioProcessor = new AudioProcessor();
        this.renderer = new VideoRenderer();
        this.audioPlayer = new AudioPlayer();
    }
    
    playVideo(file) {
        const { frames, audio } = this.decoder.decode(file);
        const processedAudio = this.audioProcessor.process(audio);
        this.renderer.render(frames);
        this.audioPlayer.play(processedAudio);
    }
}

// Usage - one simple method
const player = new MediaPlayer();
player.playVideo('movie.mp4');
```

---

## Behavioral Patterns

### Q7: What is the Observer Pattern?
**Answer:**
```javascript
// Defines one-to-many dependency

class EventEmitter {
    constructor() {
        this.listeners = {};
    }
    
    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
        
        // Return unsubscribe function
        return () => {
            this.listeners[event] = this.listeners[event]
                .filter(cb => cb !== callback);
        };
    }
    
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }
}

// Usage
const emitter = new EventEmitter();

const unsubscribe = emitter.subscribe('userLoggedIn', (user) => {
    console.log(`Welcome, ${user.name}!`);
});

emitter.emit('userLoggedIn', { name: 'John' }); // Welcome, John!
unsubscribe();
emitter.emit('userLoggedIn', { name: 'Jane' }); // Nothing
```

### Q8: What is the Strategy Pattern?
**Answer:**
```javascript
// Defines family of interchangeable algorithms

// Strategies
const strategies = {
    fedex: {
        calculate(weight, distance) {
            return weight * 2.5 + distance * 0.5;
        }
    },
    ups: {
        calculate(weight, distance) {
            return weight * 3 + distance * 0.3;
        }
    },
    dhl: {
        calculate(weight, distance) {
            return (weight + distance) * 1.5;
        }
    }
};

// Context
class ShippingCalculator {
    constructor(strategy) {
        this.strategy = strategy;
    }
    
    setStrategy(strategy) {
        this.strategy = strategy;
    }
    
    calculate(weight, distance) {
        return this.strategy.calculate(weight, distance);
    }
}

// Usage
const calculator = new ShippingCalculator(strategies.fedex);
console.log(calculator.calculate(10, 100)); // 75

calculator.setStrategy(strategies.ups);
console.log(calculator.calculate(10, 100)); // 60
```

### Q9: What is the Command Pattern?
**Answer:**
```javascript
// Encapsulates request as object

class Light {
    on() { console.log('Light is ON'); }
    off() { console.log('Light is OFF'); }
}

// Commands
class LightOnCommand {
    constructor(light) { this.light = light; }
    execute() { this.light.on(); }
    undo() { this.light.off(); }
}

class LightOffCommand {
    constructor(light) { this.light = light; }
    execute() { this.light.off(); }
    undo() { this.light.on(); }
}

// Invoker with history
class RemoteControl {
    constructor() {
        this.history = [];
    }
    
    execute(command) {
        command.execute();
        this.history.push(command);
    }
    
    undo() {
        const command = this.history.pop();
        if (command) command.undo();
    }
}

// Usage
const light = new Light();
const remote = new RemoteControl();

remote.execute(new LightOnCommand(light)); // Light is ON
remote.execute(new LightOffCommand(light)); // Light is OFF
remote.undo(); // Light is ON
```

---

## JavaScript-Specific Patterns

### Q10: What is the Module Pattern?
**Answer:**
```javascript
// Encapsulation using closures

const counterModule = (() => {
    // Private state
    let count = 0;
    const history = [];
    
    // Private function
    function log(action) {
        history.push({ action, count, time: Date.now() });
    }
    
    // Public API
    return {
        increment() {
            count++;
            log('increment');
            return count;
        },
        decrement() {
            count--;
            log('decrement');
            return count;
        },
        getCount() {
            return count;
        },
        getHistory() {
            return [...history]; // Return copy
        }
    };
})();

// Usage
counterModule.increment(); // 1
counterModule.increment(); // 2
console.log(counterModule.count); // undefined (private)
console.log(counterModule.getCount()); // 2
```

### Q11: What is the Revealing Module Pattern?
**Answer:**
```javascript
// Cleaner module pattern - reveal at the end

const calculator = (() => {
    let result = 0;
    
    function add(x) {
        result += x;
        return this;
    }
    
    function subtract(x) {
        result -= x;
        return this;
    }
    
    function multiply(x) {
        result *= x;
        return this;
    }
    
    function getResult() {
        return result;
    }
    
    function reset() {
        result = 0;
        return this;
    }
    
    // Reveal public members
    return {
        add,
        subtract,
        multiply,
        getResult,
        reset
    };
})();

// Chainable API
calculator.add(5).multiply(2).subtract(3);
console.log(calculator.getResult()); // 7
```

---

## React Patterns

### Q12: What are common React patterns?
**Answer:**
```jsx
// 1. Container/Presentational Pattern
function UserListContainer() {
    const [users, setUsers] = useState([]);
    useEffect(() => { fetchUsers().then(setUsers); }, []);
    return <UserList users={users} />;
}

function UserList({ users }) {
    return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// 2. Custom Hooks Pattern
function useLocalStorage(key, initial) {
    const [value, setValue] = useState(() => {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : initial;
    });
    
    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);
    
    return [value, setValue];
}

// 3. Render Props Pattern
function MouseTracker({ render }) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    
    return (
        <div onMouseMove={e => setPosition({ x: e.clientX, y: e.clientY })}>
            {render(position)}
        </div>
    );
}

// Usage: <MouseTracker render={({ x, y }) => <span>{x}, {y}</span>} />

// 4. Compound Components Pattern
function Tabs({ children }) {
    const [activeIndex, setActiveIndex] = useState(0);
    return React.Children.map(children, (child, index) =>
        React.cloneElement(child, { isActive: index === activeIndex, onClick: () => setActiveIndex(index) })
    );
}

Tabs.Tab = function Tab({ children, isActive, onClick }) {
    return <button onClick={onClick} className={isActive ? 'active' : ''}>{children}</button>;
};

// Usage: <Tabs><Tabs.Tab>One</Tabs.Tab><Tabs.Tab>Two</Tabs.Tab></Tabs>
```

### Q13: What is the Provider Pattern?
**Answer:**
```jsx
// Share data across component tree

const ThemeContext = createContext('light');
const UserContext = createContext(null);

// Provider component
function AppProviders({ children }) {
    const [theme, setTheme] = useState('light');
    const [user, setUser] = useState(null);
    
    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <UserContext.Provider value={{ user, setUser }}>
                {children}
            </UserContext.Provider>
        </ThemeContext.Provider>
    );
}

// Custom hook for consuming
function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be within ThemeProvider');
    return context;
}

// Usage
function ThemedButton() {
    const { theme, setTheme } = useTheme();
    return <button className={theme}>Toggle</button>;
}
```

---
