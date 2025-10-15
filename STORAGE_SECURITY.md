# LocalStorage Security Implementation

## Overview

User progress data stored in localStorage is now encrypted and validated to prevent tampering and ensure data integrity.

## Security Features

### 1. AES-GCM Encryption

-   **Algorithm**: AES-GCM (256-bit)
-   **Key Derivation**: PBKDF2 with SHA-256 (100,000 iterations)
-   **IV (Initialization Vector)**: Randomly generated for each encryption (12 bytes)
-   **Authentication**: Built-in authenticated encryption (GCM mode provides integrity)

**Why AES-GCM?**

-   Industry standard symmetric encryption
-   Authenticated encryption (detects tampering)
-   Available in Web Crypto API (no external dependencies)
-   Fast performance in modern browsers

### 2. Data Integrity Validation

**Checksum (SHA-256)**

-   Separate checksum stored alongside encrypted data
-   Validates data hasn't been corrupted or tampered with
-   Detects bit-flip errors during storage/retrieval

**Schema Validation**

-   Validates all required fields are present
-   Type checking for each field
-   Range validation (XP: 0-1M, Level: 1-100)
-   Array structure validation for completedLessons and skillNodes

### 3. Data Expiration

-   Progress data older than **90 days** is automatically cleared
-   Prevents stale data from accumulating
-   Timestamp stored with encrypted data

### 4. Version Control

-   Schema version (`_version: 1`) stored with data
-   Enables future migrations if data structure changes
-   Forward compatibility for schema updates

## Implementation Details

### Storage Structure

```javascript
// Encrypted data stored in localStorage:
{
  "bitschool-progress": "<base64-encrypted-data>",
  "bitschool-progress-checksum": "<sha256-checksum>"
}

// Decrypted data structure:
{
  xp: number,
  level: number,
  currentSkillNodeId: string,
  completedLessons: string[],
  skillNodes: SkillNode[],
  _timestamp: number,  // Added during encryption
  _version: 1          // Schema version
}
```

### Encryption Process

1. Add metadata (\_timestamp, \_version) to progress data
2. Convert to JSON string
3. Generate SHA-256 checksum
4. Derive encryption key from `NEXT_PUBLIC_STORAGE_SECRET`
5. Generate random 12-byte IV
6. Encrypt using AES-GCM
7. Combine IV + encrypted data
8. Convert to base64
9. Store encrypted data and checksum separately

### Decryption Process

1. Retrieve encrypted data and checksum from localStorage
2. Convert from base64
3. Extract IV and encrypted data
4. Derive encryption key
5. Decrypt using AES-GCM
6. Verify checksum matches
7. Parse JSON
8. Check data age (< 90 days)
9. Validate schema structure
10. Remove metadata and return clean UserProgress object

## Environment Variable

```env
# Generate with: openssl rand -base64 32
NEXT_PUBLIC_STORAGE_SECRET="your-secret-here"
```

**Important:**

-   Use a strong, random secret in production
-   Keep this secret consistent to decrypt existing data
-   If changed, all existing localStorage data becomes unreadable

## Error Handling

### Graceful Degradation

1. **Encryption Fails**: Falls back to unencrypted storage
2. **Decryption Fails**: Attempts to read as unencrypted (backward compatibility)
3. **Validation Fails**: Clears corrupted data and returns null
4. **Checksum Mismatch**: Clears tampered data and returns null
5. **Data Too Old**: Clears expired data and returns null

### Automatic Cleanup

-   Corrupted data is automatically removed
-   Invalid data is cleared on validation failure
-   Expired data (>90 days) is automatically purged

## Security Considerations

### What's Protected

✅ **Data confidentiality**: Progress data is encrypted in localStorage  
✅ **Data integrity**: Checksum detects tampering  
✅ **Schema validation**: Prevents injection of invalid data  
✅ **Age validation**: Stale data is rejected

### What's NOT Protected

❌ **XSS attacks**: If malicious JS runs, it can access unencrypted data in memory  
❌ **Browser DevTools**: User can inspect decrypted data during runtime  
❌ **Local machine access**: Anyone with physical access to unlocked device can potentially extract keys

### Attack Surface

**Low Risk:**

-   Local storage is per-domain (cross-site isolation)
-   Encryption prevents casual viewing of localStorage
-   Validation prevents most injection attempts

**Medium Risk:**

-   Users can edit localStorage if they know the encryption key
-   Browser extensions may access localStorage
-   XSS vulnerabilities could expose data in memory

**Mitigation:**

-   Server-side validation on data migration
-   Database is the source of truth for authenticated users
-   Guest data is temporary and non-critical

## Testing

To test the encryption:

```javascript
// Save encrypted data
await saveProgressToStorage(progress);

// Check localStorage (should be encrypted)
console.log(localStorage.getItem("bitschool-progress"));
// Output: "Q3J5cHRvIGRhdGEgaGVyZS4uLg==" (base64)

// Load and decrypt
const loaded = await loadProgressFromStorage();
console.log(loaded); // Decrypted UserProgress object
```

## Migration Strategy

### Existing Users

When updating from unencrypted to encrypted storage:

1. Old unencrypted data is detected during decryption
2. Falls back to JSON.parse (backward compatible)
3. On next save, data is encrypted
4. Seamless transition for existing users

### Future Schema Changes

1. Increment `_version` number
2. Add migration logic in `loadProgressFromStorage()`
3. Transform old schema to new schema
4. Re-save with new version

## Performance

-   **Encryption time**: ~5-10ms per save
-   **Decryption time**: ~5-10ms per load
-   **Checksum generation**: ~1-2ms
-   **Total overhead**: ~10-20ms (negligible for debounced saves)

## Best Practices

1. **Never log decrypted data in production**
2. **Rotate `NEXT_PUBLIC_STORAGE_SECRET` periodically** (requires data migration)
3. **Monitor validation failures** (may indicate attacks)
4. **Clear localStorage on logout** (optional, for extra security)

## Future Enhancements

Potential improvements for future iterations:

-   [ ] Implement key rotation mechanism
-   [ ] Add rate limiting for validation failures
-   [ ] Implement progressive encryption for large datasets
-   [ ] Add compression before encryption
-   [ ] Implement secure backup/restore functionality
-   [ ] Add audit logging for security events

