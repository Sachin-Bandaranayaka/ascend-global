# Bug Report - Ascend Global Business Management System

## Critical Issues (Must Fix)

### 1. Console.log Statements in Production Code
**Location:** Multiple files
**Issue:** Debug console.log statements left in production code can expose sensitive information and hurt performance.

**Files affected:**
- `lib/services/meta-conversions.service.ts` (lines 110, 139, 156)
- `app/orders/new/page.tsx` (line 232)
- `app/purchase-orders/new/page.tsx` (line 145)
- `app/products/new/page.tsx` (line 83)
- `scripts/create-user.js` (lines 17, 28-32)

**Fix:** Remove or replace with proper logging system for production.

### 2. TypeScript 'any' Type Usage
**Location:** Multiple files
**Issue:** Using 'any' type defeats TypeScript's type safety and can hide runtime errors.

**Files affected:**
- `middleware.ts` (lines 19, 36) - Cookie options parameter
- `lib/services/auth.service.ts` (lines 7, 108) - Auth types and callback
- `lib/services/meta-conversions.service.ts` (lines 108, 188) - Custom data parameters
- `app/expenses/page.tsx` (line 52) - Expense mapping
- `app/dashboard/page.tsx` (lines 182-185) - State setters (found by ESLint)
- `lib/activity-logger.ts` (lines 12, 45, 300, 312, 324, 336) - Activity data types
- `lib/auth-context.tsx` (line 12) - Auth error type

**Fix:** Replace 'any' with proper TypeScript interfaces.

### 3. Potential Division by Zero in Dashboard Charts
**Location:** `app/dashboard/page.tsx` (lines 141, 156)
**Issue:** Chart calculations use `(index / (data.length - 1))` which can result in division by zero when `data.length` is 1.

```typescript
const x = (index / (data.length - 1)) * 100; // Potential division by zero
```

**Fix:** Add guard clause: `const x = data.length > 1 ? (index / (data.length - 1)) * 100 : 0;`

## High Priority Issues

### 4. Missing Error Handling in Auth Context
**Location:** `lib/auth-context.tsx` (line 45)
**Issue:** Database query for user role doesn't handle potential errors.

```typescript
supabase.from('profiles').select('role').eq('id', session.user.id).single().then(({ data }: { data: { role: string } | null }) => {
  setRole(data?.role || 'user');
});
```

**Fix:** Add proper error handling with try-catch or .catch() clause.

### 5. Hardcoded Values in Meta Conversions
**Location:** `lib/services/meta-conversions.service.ts` (lines 192-193)
**Issue:** Hardcoded default values for order conversion.

```typescript
customData.value = order?.total_amount || 100; // Default value if no order
customData.currency = order?.currency || 'LKR'; // Default to LKR
```

**Fix:** Use configuration values or make these required parameters.

### 6. Environment Variable Exposure
**Location:** `lib/config.ts`
**Issue:** Environment variables are marked as optional in schema but used as required in other parts.

**Fix:** Ensure all required environment variables are properly validated.

## Medium Priority Issues

### 7. React Hook Dependency Issues
**Location:** Multiple files (found by ESLint)
**Issue:** useEffect hooks with missing dependencies that could cause stale closures or infinite loops.

**Files with dependency issues:**
- `app/admin/users/page.tsx` (line 19) - Missing 'router' dependency
- `app/dashboard/page.tsx` (line 201) - Missing 5 function dependencies
- `app/leads/[id]/edit/page.tsx` (line 35) - Missing 'fetchLead' dependency
- `app/orders/new/page.tsx` (line 187) - Missing 'formData.shipping_address' dependency
- `components/top-header.tsx` (line 20) - Missing 2 function dependencies

**Fix:** Add all used variables and functions to dependency arrays or use useCallback to stabilize function references.

### 8. Database Schema Inconsistencies
**Location:** Multiple SQL files
**Issue:** Inconsistencies between `database-schema.sql` and `meta-conversions-migration-fixed.sql`.

**Fix:** Ensure migration files are in sync with main schema.

### 9. Missing Input Validation
**Location:** API routes
**Issue:** Some API routes don't validate input parameters thoroughly.

**Example:** `app/api/leads/route.ts` - PUT method doesn't validate body structure.

**Fix:** Add proper input validation using Zod or similar library.

## Low Priority Issues

### 10. Unused Imports and Variables
**Location:** Multiple files (found by ESLint)
**Issue:** Many imports and variables are declared but not used.

**Files with unused imports/variables:**
- `app/dashboard/page.tsx` - 13 unused imports, 4 unused variables
- `app/admin/users/page.tsx` - 1 unused variable
- `app/api/meta-conversions/route.ts` - 1 unused import
- `app/api/settings/route.ts` - 1 unused parameter, 1 unused variable
- `app/customers/page.tsx` - 1 unused import
- `app/leads/[id]/edit/page.tsx` - 1 unused import
- `app/leads/import/page.tsx` - 1 unused import
- `app/leads/page.tsx` - 1 unused import, 4 unused variables
- `app/orders/new/page.tsx` - 1 unused import
- `app/orders/page.tsx` - 1 unused import
- `app/products/page.tsx` - 4 unused imports
- `app/purchase-orders/page.tsx` - 3 unused imports
- `app/reports/page.tsx` - 2 unused imports, 1 unused variable
- `app/returns/page.tsx` - 2 unused imports
- `app/settings/meta-conversions/page.tsx` - 2 unused variables
- `components/sidebar.tsx` - 1 unused import
- `lib/activity-logger.ts` - 1 unused variable
- `lib/services/auth.service.ts` - 4 unused variables
- `lib/services/meta-conversions.service.ts` - 1 unused variable

**Fix:** Remove unused imports and variables.

### 11. Inconsistent Error Messages
**Location:** Multiple API routes
**Issue:** Error messages are inconsistent across different API endpoints.

**Fix:** Create a standardized error response format.

### 12. Missing Type Definitions
**Location:** Various components
**Issue:** Some components and functions lack proper TypeScript type definitions.

**Fix:** Add comprehensive type definitions.

### 13. JSX/HTML Character Escaping Issues
**Location:** Multiple files (found by ESLint)
**Issue:** Unescaped quotes and apostrophes in JSX that should be properly escaped.

**Files with escaping issues:**
- `app/dashboard/page.tsx` (line 498) - Unescaped apostrophes
- `app/login/page.tsx` (line 188) - Unescaped apostrophe
- `app/settings/meta-conversions/page.tsx` (lines 164, 168, 172) - Unescaped quotes
- `app/settings/page.tsx` (line 60) - Unescaped apostrophe

**Fix:** Replace with proper HTML entities (`&apos;`, `&quot;`, etc.) or use different quote styles.

## Security Concerns

### 14. Service Role Key Usage
**Location:** API routes
**Issue:** Service role key is used in API routes, which bypasses RLS. While necessary for admin operations, ensure it's properly secured.

**Fix:** Review all usage of service role key and ensure it's not exposed client-side.

### 15. Environment Variable Validation
**Location:** `lib/config.ts`
**Issue:** Some environment variables are optional but used as required in other parts.

**Fix:** Ensure proper validation and error handling for missing environment variables.

## Performance Issues

### 16. Multiple Database Queries
**Location:** Various API routes
**Issue:** Some operations perform multiple sequential database queries that could be optimized.

**Fix:** Use database joins or batch operations where possible.

### 17. Inefficient State Management
**Location:** Multiple components
**Issue:** Some components refetch data unnecessarily.

**Fix:** Implement proper caching and state management.

## Testing Issues

### 18. Missing Error Boundary Testing
**Location:** `components/error-boundary.tsx`
**Issue:** Error boundary exists but might not catch all types of errors.

**Fix:** Add comprehensive error boundary testing.

### 19. No API Error Handling Tests
**Location:** API routes
**Issue:** No tests for error scenarios in API routes.

**Fix:** Add comprehensive API error handling tests.

## Compilation and Linting Status

### TypeScript Compilation
✅ **No TypeScript compilation errors found** - All files compile successfully

### ESLint Results
⚠️ **64 ESLint warnings found** across multiple files:
- 39 warnings about unused variables/imports
- 6 warnings about TypeScript 'any' type usage  
- 5 warnings about missing React Hook dependencies
- 4 warnings about unescaped characters in JSX
- 10 other minor warnings

### Build Status
✅ **Project builds successfully** - No blocking issues preventing compilation

## Recommended Actions

1. **Immediate:** Remove all console.log statements and replace 'any' types
2. **Week 1:** Fix division by zero bug and add proper error handling
3. **Week 2:** Address security concerns and environment variable validation
4. **Week 3:** Optimize database queries and add comprehensive input validation
5. **Week 4:** Add tests and improve error boundaries
6. **Ongoing:** Clean up ESLint warnings (unused imports, dependencies, etc.)

## Dependencies to Update

### Security Audit Results
✅ **Good news:** No security vulnerabilities found in dependencies.

### Outdated Packages
The following packages have newer versions available:
- `@supabase/ssr`: Current 0.5.1 → Available 0.6.1
- `react`: Current 19.0.0 → Available 19.1.0  
- `react-dom`: Current 19.0.0 → Available 19.1.0

### npm Version
Current npm version is outdated (10.9.2 → 11.4.2). Consider updating:
```bash
npm install -g npm@11.4.2
```

### Installation Issue
⚠️ **Warning:** Dependencies appear to be missing. Run:
```bash
npm install
```

Run the following commands to check for outdated dependencies:
```bash
npm audit
npm outdated
```

Consider updating packages with known security vulnerabilities.