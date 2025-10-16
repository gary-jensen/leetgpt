# Security Tests

This directory contains comprehensive tests for all security features implemented in the BitSchool application.

## Test Structure

### Unit Tests

-   **`rateLimit.test.ts`** - Tests for rate limiting functionality
-   **`lessonValidation.test.ts`** - Tests for lesson ID validation
-   **`validation.test.ts`** - Tests for input validation utilities
-   **`serverUtils.test.ts`** - Tests for server utility functions

### Integration Tests

-   **`analytics.integration.test.ts`** - Tests for analytics server functions
-   **`progress.integration.test.ts`** - Tests for progress server functions
-   **`aiFeedback.integration.test.ts`** - Tests for AI feedback server function

### Security Tests

-   **`security.test.ts`** - Comprehensive security tests covering all attack vectors

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only security tests
npm run test:security
```

## Test Coverage

The tests cover the following security features:

### Rate Limiting

-   ✅ User-based rate limiting (100 analytics/min, 10 progress/min, 20 AI feedback/min)
-   ✅ IP-based rate limiting (1000 requests/min, 500 analytics/min)
-   ✅ Sliding window algorithm accuracy
-   ✅ Rate limit reset functionality
-   ✅ Clear error messages with reset times

### Input Validation

-   ✅ Event category whitelist validation
-   ✅ Event action validation per category
-   ✅ String length limits (event labels, code, lesson IDs)
-   ✅ UUID format validation
-   ✅ Guest ID format validation
-   ✅ Lesson ID existence validation

### Data Protection

-   ✅ Lesson ID filtering (removes invalid IDs)
-   ✅ Progress manipulation prevention
-   ✅ Code length limits (5000 characters)
-   ✅ Metadata sanitization
-   ✅ Array size limits (1000 lessons max)

### Attack Prevention

-   ✅ Database flooding protection
-   ✅ Storage exhaustion prevention
-   ✅ XSS injection prevention
-   ✅ SQL injection prevention
-   ✅ Path traversal prevention
-   ✅ IP-based abuse prevention

### Error Handling

-   ✅ Graceful error handling
-   ✅ Clear error messages
-   ✅ Proper HTTP status codes
-   ✅ Security logging

## Test Scenarios

### Rate Limiting Tests

1. **Normal Usage**: Verify normal requests work within limits
2. **Rate Limit Exceeded**: Verify rate limiting kicks in after limits
3. **Reset After Window**: Verify limits reset after time window
4. **IP-based Limits**: Verify IP-based rate limiting works
5. **Different User Types**: Test authenticated vs guest users

### Validation Tests

1. **Valid Inputs**: Verify valid inputs are accepted
2. **Invalid Inputs**: Verify invalid inputs are rejected
3. **Edge Cases**: Test boundary conditions and edge cases
4. **Malicious Inputs**: Test XSS, SQL injection, path traversal attempts
5. **Size Limits**: Test various size limit validations

### Integration Tests

1. **End-to-End Flow**: Test complete request/response cycles
2. **Database Interactions**: Verify proper database operations
3. **Error Propagation**: Test error handling across layers
4. **Authentication**: Test auth requirements and user validation
5. **Data Integrity**: Verify data consistency and filtering

### Security Tests

1. **Attack Simulation**: Simulate various attack scenarios
2. **Data Protection**: Verify sensitive data is protected
3. **Access Control**: Test authorization and access controls
4. **Input Sanitization**: Verify all inputs are properly sanitized
5. **Error Information**: Ensure errors don't leak sensitive information

## Mocking Strategy

Tests use comprehensive mocking to isolate units under test:

-   **Database**: Prisma client mocked with jest.fn()
-   **Authentication**: NextAuth functions mocked
-   **External APIs**: OpenAI API mocked
-   **Server Utils**: IP extraction and headers mocked
-   **Rate Limiting**: In-memory store cleared between tests

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

-   Fast execution (< 30 seconds for full suite)
-   No external dependencies
-   Deterministic results
-   High coverage (> 80% required)
-   Clear failure messages

## Security Considerations

When adding new tests:

1. **Test Attack Vectors**: Always test both valid and malicious inputs
2. **Edge Cases**: Test boundary conditions and limits
3. **Error Scenarios**: Test error handling and recovery
4. **Performance**: Ensure tests don't impact performance
5. **Maintainability**: Keep tests readable and maintainable

## Debugging Tests

If tests fail:

1. Check console output for detailed error messages
2. Verify mocks are properly configured
3. Ensure test data is valid and consistent
4. Check for timing issues in rate limiting tests
5. Verify environment variables are set correctly

## Adding New Tests

When adding new security features:

1. Add unit tests for the core functionality
2. Add integration tests for server functions
3. Add security tests for attack prevention
4. Update this README with new test descriptions
5. Ensure tests follow existing patterns and conventions

