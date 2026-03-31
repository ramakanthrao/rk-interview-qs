# Interview Questions: Web Security

## Coding Question

> **Implement security best practices for web applications.**
>
> **Topics Covered:**
> 1. Common vulnerabilities (OWASP)
> 2. Authentication and authorization
> 3. Input validation and sanitization
> 4. Security headers
> 5. Secure coding practices

---

## Common Vulnerabilities

### Q1: What are the OWASP Top 10 vulnerabilities?
**Answer:**
1. **Broken Access Control** - Unauthorized access to resources
2. **Cryptographic Failures** - Weak encryption, exposed sensitive data
3. **Injection** - SQL, NoSQL, OS command injection
4. **Insecure Design** - Missing security controls in design
5. **Security Misconfiguration** - Default configs, verbose errors
6. **Vulnerable Components** - Outdated libraries with known CVEs
7. **Authentication Failures** - Weak passwords, session issues
8. **Software Integrity Failures** - Untrusted updates, CI/CD issues
9. **Logging & Monitoring Failures** - No audit trail, slow detection
10. **SSRF** - Server-Side Request Forgery

### Q2: What is XSS and how do you prevent it?
**Answer:**
```javascript
// XSS: Cross-Site Scripting - injecting malicious scripts

// VULNERABLE CODE:
element.innerHTML = userInput;  // Can execute scripts

// PREVENTION:

// 1. Use textContent instead of innerHTML
element.textContent = userInput;

// 2. Sanitize HTML (use library like DOMPurify)
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);

// 3. React automatically escapes by default
function Component({ userInput }) {
    return <div>{userInput}</div>;  // Safe
}

// DANGER: dangerouslySetInnerHTML bypasses protection
<div dangerouslySetInnerHTML={{ __html: userInput }} />  // Vulnerable!

// 4. Content Security Policy (CSP)
// In HTTP header:
Content-Security-Policy: default-src 'self'; script-src 'self'

// 5. Encode for context
// HTML: &lt;script&gt;
// URL: %3Cscript%3E
// JavaScript: \x3Cscript\x3E
```

### Q3: What is CSRF and how do you prevent it?
**Answer:**
```javascript
// CSRF: Cross-Site Request Forgery
// Attacker tricks user into making unwanted requests

// Attack example (on evil site):
<form action="https://bank.com/transfer" method="POST">
    <input name="to" value="attacker-account">
    <input name="amount" value="10000">
</form>
<script>document.forms[0].submit();</script>

// PREVENTION:

// 1. CSRF Tokens (server-generated, per-session or per-request)
app.post('/transfer', (req, res) => {
    if (req.body._csrf !== req.session.csrfToken) {
        return res.status(403).send('Invalid CSRF token');
    }
    // Process request
});

// Include token in forms
<form method="POST">
    <input type="hidden" name="_csrf" value="{{ csrfToken }}">
</form>

// 2. SameSite Cookie attribute
res.cookie('session', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict'  // Or 'Lax'
});

// 3. Check Origin/Referer headers
const origin = req.headers.origin;
if (!allowedOrigins.includes(origin)) {
    return res.status(403).send('Forbidden');
}

// 4. Re-authenticate for sensitive actions
```

### Q4: What is SQL Injection and how do you prevent it?
**Answer:**
```javascript
// VULNERABLE CODE:
const query = `SELECT * FROM users WHERE name = '${userInput}'`;
// userInput: "'; DROP TABLE users; --"

// PREVENTION:

// 1. Parameterized queries / Prepared statements
// Node.js with pg
const result = await client.query(
    'SELECT * FROM users WHERE name = $1',
    [userInput]
);

// Node.js with mysql2
const [rows] = await connection.execute(
    'SELECT * FROM users WHERE name = ?',
    [userInput]
);

// 2. ORM/Query builders
// Sequelize
const users = await User.findAll({
    where: { name: userInput }
});

// Prisma
const users = await prisma.user.findMany({
    where: { name: userInput }
});

// 3. Input validation
const validUsername = /^[a-zA-Z0-9_]{3,20}$/.test(userInput);
if (!validUsername) throw new Error('Invalid username');

// 4. Least privilege - DB user shouldn't be able to DROP
```

---

## Authentication

### Q5: How do you securely store passwords?
**Answer:**
```javascript
// NEVER store plain text passwords!
// NEVER use MD5 or SHA-1 for passwords!

// USE: bcrypt, scrypt, or Argon2

const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;  // Higher = more secure but slower

// Hash password
async function hashPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

// Usage
const hash = await hashPassword('userPassword');
// Store hash in database

// On login
const isValid = await verifyPassword(inputPassword, storedHash);
if (!isValid) {
    throw new Error('Invalid credentials');
}

// Password requirements
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
// - At least 12 characters
// - Uppercase, lowercase, number, special char
```

### Q6: How do you implement secure JWT authentication?
**Answer:**
```javascript
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;  // >= 256 bits
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// Generate tokens
function generateTokens(user) {
    const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY, algorithm: 'HS256' }
    );
    
    const refreshToken = jwt.sign(
        { userId: user.id, tokenVersion: user.tokenVersion },
        SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
    
    return { accessToken, refreshToken };
}

// Verify token
function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expired');
        }
        throw new Error('Invalid token');
    }
}

// Middleware
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
        const token = authHeader.split(' ')[1];
        req.user = verifyToken(token);
        next();
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
}

// Store refresh token in httpOnly cookie
res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
});
```

### Q7: What is OAuth 2.0 and the Authorization Code flow?
**Answer:**
```
OAuth 2.0 Flow (Authorization Code with PKCE):

1. User clicks "Login with Google"
2. App generates code_verifier and code_challenge
3. Redirect to authorization server:
   GET /authorize?
     response_type=code&
     client_id=xxx&
     redirect_uri=https://app.com/callback&
     scope=openid profile email&
     state=random-state&
     code_challenge=xxx&
     code_challenge_method=S256

4. User logs in and grants permission
5. Redirect back with code:
   GET /callback?code=AUTH_CODE&state=random-state

6. Exchange code for tokens:
   POST /token
   grant_type=authorization_code&
   code=AUTH_CODE&
   redirect_uri=https://app.com/callback&
   client_id=xxx&
   code_verifier=xxx

7. Receive tokens:
   {
     "access_token": "...",
     "id_token": "...",
     "refresh_token": "...",
     "expires_in": 3600
   }

8. Use access_token to call APIs
```

---

## Input Validation

### Q8: How do you validate and sanitize input?
**Answer:**
```javascript
// 1. Schema validation with Zod
import { z } from 'zod';

const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(12).regex(/[A-Z]/).regex(/[0-9]/),
    age: z.number().int().positive().max(120),
    website: z.string().url().optional(),
});

function validateUser(input) {
    return userSchema.parse(input);  // Throws on invalid
}

// 2. Sanitize HTML (prevent XSS)
import DOMPurify from 'dompurify';

const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
});

// 3. Escape for specific contexts
import escapeHtml from 'escape-html';
import sqlstring from 'sqlstring';

const safeHtml = escapeHtml(userInput);
const safeSql = sqlstring.escape(userInput);

// 4. Validate file uploads
const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
const maxSize = 5 * 1024 * 1024;  // 5MB

async function validateUpload(file) {
    if (!allowedMimes.includes(file.mimetype)) {
        throw new Error('Invalid file type');
    }
    if (file.size > maxSize) {
        throw new Error('File too large');
    }
    // Validate actual file content, not just extension
    const fileType = await fileTypeFromBuffer(file.buffer);
    if (!allowedMimes.includes(fileType.mime)) {
        throw new Error('File content mismatch');
    }
}
```

---

## Security Headers

### Q9: What security headers should you set?
**Answer:**
```javascript
// Express middleware
app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS filter
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.example.com",
        "font-src 'self'",
        "frame-ancestors 'none'"
    ].join('; '));
    
    // Force HTTPS
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // Control referrer information
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions policy
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    next();
});

// Or use helmet middleware
import helmet from 'helmet';
app.use(helmet());
```

### Q10: What is Content Security Policy (CSP)?
**Answer:**
```html
<!-- In meta tag (limited) -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'">

<!-- In HTTP header (recommended) -->
Content-Security-Policy: 
    default-src 'self';
    script-src 'self' 'nonce-abc123';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https://cdn.example.com;
    connect-src 'self' https://api.example.com;
    font-src 'self' https://fonts.googleapis.com;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
    report-uri /csp-violation-report;

<!-- Using nonce for inline scripts -->
<script nonce="abc123">
    // This inline script is allowed
</script>

<!-- Report-Only mode for testing -->
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report
```

---

## Secure Coding Practices

### Q11: How do you prevent sensitive data exposure?
**Answer:**
```javascript
// 1. Don't log sensitive data
console.log('User:', user);  // May include password!

// Better: whitelist fields
const safeUser = { id: user.id, email: user.email };
console.log('User:', safeUser);

// 2. Redact in API responses
function sanitizeUser(user) {
    const { password, ssn, creditCard, ...safe } = user;
    return safe;
}

// 3. Encrypt sensitive data at rest
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);

function encrypt(text) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();
    return { encrypted, iv: iv.toString('hex'), tag: tag.toString('hex') };
}

// 4. Use environment variables for secrets
const dbPassword = process.env.DB_PASSWORD;  // Not in code!

// 5. Secure error messages
app.use((err, req, res, next) => {
    console.error(err);  // Log full error
    res.status(500).json({
        error: 'Internal server error'  // Generic message to client
    });
});
```

### Q12: What are secure coding best practices?
**Answer:**
```javascript
// 1. Principle of least privilege
// Give minimum permissions needed

// 2. Defense in depth
// Multiple layers of security
function deleteAccount(userId, currentUser) {
    // Layer 1: Authentication (handled by middleware)
    // Layer 2: Authorization
    if (currentUser.id !== userId && !currentUser.isAdmin) {
        throw new Error('Forbidden');
    }
    // Layer 3: Validation
    if (!isValidUUID(userId)) {
        throw new Error('Invalid user ID');
    }
    // Layer 4: Audit logging
    auditLog.record('account_deletion', { userId, deletedBy: currentUser.id });
    // Proceed with deletion
}

// 3. Fail securely
try {
    await authenticate(user);
} catch (error) {
    // Don't reveal if username exists
    throw new Error('Invalid credentials');
}

// 4. Don't trust client input - ever
// 5. Keep dependencies updated
// npm audit, dependabot, snyk

// 6. Rate limiting
import rateLimit from 'express-rate-limit';
app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 min
    max: 100,
    message: 'Too many requests'
}));

// 7. Secure session management
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
    }
}));
```

---
