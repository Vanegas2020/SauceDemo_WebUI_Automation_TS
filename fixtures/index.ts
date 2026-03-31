/**
 * Fixtures - Barrel Export
 *
 * This file re-exports all fixtures for convenient imports.
 * Use: import { test, expect } from '@fixtures';
 */

// Export test and expect from auth fixture for authenticated tests
export { test, expect, clearAuthStates, isAuthenticated } from './auth.fixture';
