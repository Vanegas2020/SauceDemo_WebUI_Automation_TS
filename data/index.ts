/**
 * Test Data - Barrel Export
 *
 * This file re-exports all test data for convenient imports.
 * Use: import { testData } from '@data';
 */

import testDataJson from './test-data.json';

/**
 * Test data imported from JSON file
 */
export const testData = testDataJson;

/**
 * Re-export for direct JSON import
 */
export { default as testDataJson } from './test-data.json';
